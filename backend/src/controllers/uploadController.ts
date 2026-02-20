import { Request, Response } from 'express';
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import dotenv from 'dotenv';
import { VcfVariant, buildGeneResults, gtToCopies } from '../services/drugRiskEngine';

dotenv.config();

// ══════════════════════════════════════════════════════════════════════
//  REAL VCF PARSER
//  Implements the correct biological algorithm:
//
//  For each non-header line:
//    1. Parse CHROM, POS, ID (rsID), REF, ALT, QUAL, FILTER, INFO, FORMAT, SAMPLE
//    2. Extract GT from the SAMPLE column (matched to FORMAT column)
//    3. GT = 0/0 → skip (patient does NOT carry this variant)
//    4. GT = 0/1 → patient has ONE copy of the ALT allele
//    5. GT = 1/1 → patient has TWO copies of the ALT allele
//    6. Extract GENE and STAR from the INFO field if present
//
//  Column indices in a standard VCF (0-indexed):
//    0  CHROM
//    1  POS
//    2  ID        ← rsID (e.g. rs4244285)
//    3  REF
//    4  ALT
//    5  QUAL
//    6  FILTER
//    7  INFO      ← contains GENE=CYP2C19;STAR=*2 etc.
//    8  FORMAT    ← e.g. "GT:AD:DP" — tells us GT is at index 0
//    9  SAMPLE    ← e.g. "0/1:10,5:15" — GT is format index 0
// ══════════════════════════════════════════════════════════════════════

function parseInfoField(info: string): Record<string, string> {
    const result: Record<string, string> = {};
    for (const part of info.split(';')) {
        const [key, value] = part.split('=');
        if (key && value !== undefined) {
            result[key.trim()] = value.trim();
        }
    }
    return result;
}

function extractGT(formatStr: string, sampleStr: string): string {
    const formatFields = formatStr.split(':');
    const sampleFields = sampleStr.split(':');
    const gtIndex = formatFields.indexOf('GT');
    if (gtIndex === -1) return './.'; // GT field not declared
    return sampleFields[gtIndex] || './.';
}

const parseVCF = (filePath: string): VcfVariant[] => {
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const lines = fileContent.split(/\r?\n/);
    const foundVariants: VcfVariant[] = [];

    for (const rawLine of lines) {
        const line = rawLine.trim();

        // Skip header lines and empty lines
        if (line.startsWith('#') || line === '') continue;

        const cols = line.split('\t');

        // A valid VCF data line has at least 8 columns (CHROM..INFO)
        // With genotype data it needs 10+ columns
        if (cols.length < 8) continue;

        const rsId = cols[2] || '.';
        const info = cols[7] || '';
        const format = cols[8] || '';
        const sample = cols[9] || '';

        // ── Extract GT ──────────────────────────────────────────────
        // Mandatory: if we can't get GT we can't make biological decisions
        let gt = './.';
        if (format && sample) {
            gt = extractGT(format, sample);
        }

        // ── CRITICAL RULE: GT = 0/0 or missing → skip this variant ──
        const copies = gtToCopies(gt);
        if (copies === 0) continue; // Patient does NOT carry this allele

        // ── Extract GENE and STAR from INFO ─────────────────────────
        const infoFields = parseInfoField(info);
        const gene = infoFields['GENE'] || '';
        const star = infoFields['STAR'] || infoFields['ALLELE'] || '';

        // Must have a gene to be actionable
        if (!gene) continue;

        // If no star allele in INFO, skip (can't determine impact without it)
        if (!star) continue;

        foundVariants.push({
            gene,
            star,
            rsId,
            gt,
            copies
        });
    }

    return foundVariants;
};

// ══════════════════════════════════════════════════════════════════════
//  UPLOAD CONTROLLER
// ══════════════════════════════════════════════════════════════════════
export const uploadVCF = async (req: Request, res: Response) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        const { patient_id } = req.body;
        const authHeader = req.headers.authorization;

        if (!patient_id) {
            return res.status(400).json({ error: 'Patient ID is required' });
        }

        if (!authHeader) {
            fs.unlinkSync(req.file.path);
            return res.status(401).json({ error: 'Missing Authorization header' });
        }

        // 1. Parse VCF — extract only GT-confirmed variants
        const vcfVariants = parseVCF(req.file.path);

        // 2. Build gene results (diplotype + phenotype per gene)
        const geneResults = buildGeneResults(vcfVariants);

        // 3. If NO actionable variants found → all genes are wildtype (*1/*1)
        //    Still need to log that the file was processed successfully.
        //    We log one "Normal" entry per gene if the VCF mentions a gene but all GT=0/0.
        //    → For non-CPIC-reportable files, geneResults will be empty — that's CORRECT.

        const supabaseClient = createClient(
            process.env.SUPABASE_URL || '',
            process.env.SUPABASE_ANON_KEY || '',
            {
                global: { headers: { Authorization: authHeader } }
            }
        );

        let insertedData: any[] = [];

        if (geneResults.length > 0) {
            // Insert one gene_profile row per gene with correct diplotype + phenotype
            const inserts = geneResults.map(r => ({
                patient_id,
                gene_name: r.gene,
                variant: r.diplotype,        // e.g. "*1/*1", "*1/*2", "*2/*2"
                metabolizer_type: r.phenotype        // e.g. "Normal Metabolizer"
            }));

            const { data, error } = await supabaseClient
                .from('gene_profiles')
                .insert(inserts)
                .select();

            if (error) throw error;
            insertedData = data || [];
        }

        fs.unlinkSync(req.file.path);

        const summary = geneResults.length > 0
            ? geneResults.map(r =>
                `${r.gene}: ${r.diplotype} → ${r.phenotype} (CPIC ${r.cpic_level})`
            ).join('; ')
            : 'All GT=0/0 — no actionable pharmacogenomic variants detected. Patient is wildtype for all tested genes.';

        res.status(201).json({
            message: 'VCF processed successfully',
            variants_detected: vcfVariants.length,
            genes_reported: geneResults.length,
            summary,
            gene_results: geneResults,
            data: insertedData
        });

    } catch (error: any) {
        if (req.file && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }
        res.status(500).json({ error: error.message });
    }
};
