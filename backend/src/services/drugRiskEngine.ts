// ══════════════════════════════════════════════════════════════════════
//  PharmaGuard — Drug Risk Engine v2
//
//  GT field is the SOLE source of truth for allele presence.
//
//  GT rules (phased or unphased):
//    0/0 or ./. → reference / no variant — completely ignored upstream
//    0/1 or 1/0 → ONE copy of the ALT allele (heterozygous)
//    1/1         → TWO copies of the ALT allele (homozygous variant)
//
//  Diplotype model:
//    Every patient has exactly TWO haplotype slots (slot A, slot B).
//    Slots start as "*1" (reference / wildtype).
//    For each GT-confirmed variant:
//      copies=1 → assign the star allele to ONE slot (replacing *1 if possible,
//                 or the less-severe of the two slots).
//      copies=2 → assign the star allele to BOTH slots.
//    When multiple variants compete for the same slot in the same gene,
//    the more-severe allele (lower ALLELE_SEVERITY score) wins.
//
//  INFO.STAR is ANNOTATION only.  It names the allele associated with
//  the variant but never implies the patient has it — only GT does that.
// ══════════════════════════════════════════════════════════════════════

export interface VcfVariant {
    gene: string;       // e.g. "CYP2C19"
    star: string;       // e.g. "*2"
    rsId: string;       // e.g. "rs4244285"
    gt: string;         // raw GT field from VCF SAMPLE column
    copies: number;     // 0, 1, or 2 — derived from GT by gtToCopies()
}

export interface GeneResult {
    gene: string;
    diplotype: string;           // e.g. "*1/*2" or "*2/*2"
    phenotype: string;           // e.g. "Intermediate Metabolizer"
    contributing_variants: string[];
    cpic_level: string;
    recommendation: string;
}

// ─────────────────────────────────────────────────────────────────────
//  ALLELE FUNCTION MAP
//  Maps each known star allele to its functional classification.
//  This is used for phenotype derivation ONLY — not for allele detection.
// ─────────────────────────────────────────────────────────────────────
type AlleleFunctionType = 'no_function' | 'decreased_function' | 'increased_function' | 'normal_function';

const ALLELE_FUNCTION: Record<string, Record<string, AlleleFunctionType>> = {
    CYP2C19: {
        '*1': 'normal_function',
        '*2': 'no_function',           // rs4244285
        '*3': 'no_function',           // rs4986893
        '*4': 'no_function',
        '*5': 'no_function',
        '*17': 'increased_function'     // rs12248560
    },
    CYP2D6: {
        '*1': 'normal_function',
        '*2': 'normal_function',
        '*4': 'no_function',
        '*5': 'no_function',
        '*10': 'decreased_function',
        '*17': 'decreased_function',
        '*41': 'decreased_function'
    },
    CYP2C9: {
        '*1': 'normal_function',
        '*2': 'decreased_function',
        '*3': 'decreased_function',
        '*5': 'no_function',
        '*6': 'no_function'
    },
    SLCO1B1: {
        '*1a': 'normal_function',
        '*1b': 'normal_function',
        '*5': 'no_function',       // rs4149056 — severely reduced transport
        '*15': 'no_function'        // rs2306283 + rs4149056 — abolished function
    },
    TPMT: {
        '*1': 'normal_function',
        '*2': 'no_function',
        '*3A': 'no_function',
        '*3C': 'no_function'
    },
    DPYD: {
        '*1': 'normal_function',
        '*2A': 'no_function',
        '*13': 'no_function'
    },
    VKORC1: {
        '-1639G>A': 'increased_function'   // increased warfarin sensitivity
    }
};

// ─────────────────────────────────────────────────────────────────────
//  ALLELE SEVERITY RANK (lower = more severe, wins slot competition)
//  Used to determine which star allele "wins" when two variants compete
//  for the same haplotype slot.
// ─────────────────────────────────────────────────────────────────────
const FUNC_SEVERITY: Record<AlleleFunctionType, number> = {
    no_function: 0,   // most severe
    decreased_function: 1,
    normal_function: 2,
    increased_function: 3    // separate axis; handled per-gene in derivePhenotype
};

function alleleSeverity(gene: string, star: string): number {
    const func = (ALLELE_FUNCTION[gene]?.[star] ?? 'normal_function') as AlleleFunctionType;
    return FUNC_SEVERITY[func];
}

// ─────────────────────────────────────────────────────────────────────
//  PHENOTYPE DERIVATION
//  Given two allele functions, determine clinical phenotype.
//  Based on official CPIC diplotype → phenotype tables.
// ─────────────────────────────────────────────────────────────────────
function derivePhenotype(gene: string, allele1Func: string, allele2Func: string): string {
    const noFunc = (f: string) => f === 'no_function';
    const decFunc = (f: string) => f === 'decreased_function';
    const incFunc = (f: string) => f === 'increased_function';

    const noFuncCount = [allele1Func, allele2Func].filter(noFunc).length;
    const decFuncCount = [allele1Func, allele2Func].filter(decFunc).length;
    const incFuncCount = [allele1Func, allele2Func].filter(incFunc).length;

    // Metaboliser genes: CYP2D6, CYP2C19, CYP2C9, TPMT, DPYD
    // CPIC severity order checked from most severe → least severe
    if (['CYP2D6', 'CYP2C19', 'CYP2C9', 'TPMT', 'DPYD'].includes(gene)) {
        if (noFuncCount === 2) return 'Poor Metabolizer';
        if (noFuncCount === 1 && decFuncCount >= 1) return 'Poor Metabolizer';
        if (noFuncCount === 1) return 'Intermediate Metabolizer';
        if (decFuncCount === 2) return 'Intermediate Metabolizer';
        if (decFuncCount === 1) return 'Intermediate Metabolizer';
        if (incFuncCount === 2) return 'Ultrarapid Metabolizer';
        if (incFuncCount === 1) return 'Rapid Metabolizer';
        return 'Normal Metabolizer';
    }

    // SLCO1B1: transporter gene
    if (gene === 'SLCO1B1') {
        if (noFuncCount === 2) return 'Poor Function';
        if (noFuncCount === 1 || decFuncCount >= 1) return 'Decreased Function';
        return 'Normal Function';
    }

    // VKORC1: warfarin sensitivity
    if (gene === 'VKORC1') {
        if (incFuncCount === 2) return 'High Warfarin Sensitivity';
        if (incFuncCount === 1) return 'Moderate Warfarin Sensitivity';
        return 'Normal Warfarin Sensitivity';
    }

    return 'Unknown';
}

// ─────────────────────────────────────────────────────────────────────
//  CPIC ALERTS
// ─────────────────────────────────────────────────────────────────────
const CPIC_ALERTS: Record<string, Record<string, { level: string; rec: string }>> = {
    CYP2C19: {
        'Poor Metabolizer': { level: '1A', rec: 'Avoid clopidogrel — use prasugrel or ticagrelor instead (FDA black-box warning).' },
        'Intermediate Metabolizer': { level: '1A', rec: 'Consider alternative antiplatelet therapy; reduced clopidogrel efficacy.' },
        'Ultrarapid Metabolizer': { level: '1A', rec: 'PPIs may be less effective; consider H2 blockers or dose escalation.' },
        'Rapid Metabolizer': { level: '2A', rec: 'Monitor PPI efficacy; may need higher proton pump inhibitor doses.' },
        'Normal Metabolizer': { level: 'B', rec: 'Standard dosing for all CYP2C19-metabolised drugs.' }
    },
    CYP2D6: {
        'Poor Metabolizer': { level: '1A', rec: 'Avoid codeine/tramadol (opioid toxicity). Avoid tamoxifen — reduced efficacy.' },
        'Intermediate Metabolizer': { level: '1A', rec: 'Use lower codeine doses with caution. Consider alternatives.' },
        'Ultrarapid Metabolizer': { level: '1A', rec: 'Codeine contraindicated — life-threatening morphine accumulation.' },
        'Normal Metabolizer': { level: 'B', rec: 'Standard dosing.' },
        'Rapid Metabolizer': { level: '2A', rec: 'Monitor for sub-therapeutic response with typical doses.' }
    },
    CYP2C9: {
        'Poor Metabolizer': { level: '1A', rec: 'Reduce warfarin dose significantly. High bleeding risk at standard doses.' },
        'Intermediate Metabolizer': { level: '1A', rec: 'Start warfarin at reduced dose. Increase INR monitoring frequency.' },
        'Normal Metabolizer': { level: 'B', rec: 'Standard warfarin dosing.' }
    },
    SLCO1B1: {
        'Poor Function': { level: '1A', rec: 'Avoid simvastatin >20mg/day — high myopathy risk. Use rosuvastatin or pravastatin.' },
        'Decreased Function': { level: '1A', rec: 'Limit simvastatin dose. Consider atorvastatin or rosuvastatin.' },
        'Normal Function': { level: 'B', rec: 'Standard statin dosing.' }
    },
    TPMT: {
        'Poor Metabolizer': { level: '1A', rec: 'Avoid thiopurines (azathioprine, 6-MP) — fatal myelosuppression risk.' },
        'Intermediate Metabolizer': { level: '1A', rec: 'Reduce thiopurine dose by 30–70%. Monitor blood counts closely.' },
        'Normal Metabolizer': { level: 'B', rec: 'Standard thiopurine dosing.' }
    },
    DPYD: {
        'Poor Metabolizer': { level: '1A', rec: 'Avoid 5-FU and capecitabine — life-threatening toxicity risk. Use alternative chemotherapy.' },
        'Intermediate Metabolizer': { level: '1A', rec: 'Start fluoropyrimidines at 50% dose; escalate based on tolerance and monitoring.' },
        'Normal Metabolizer': { level: 'B', rec: 'Standard fluoropyrimidine dosing.' }
    },
    VKORC1: {
        'High Warfarin Sensitivity': { level: '2A', rec: 'Significantly reduce warfarin starting dose. Very high bleeding risk.' },
        'Moderate Warfarin Sensitivity': { level: '2A', rec: 'Reduce warfarin starting dose. Increase INR monitoring.' },
        'Normal Warfarin Sensitivity': { level: 'B', rec: 'Standard warfarin dosing.' }
    }
};

// ─────────────────────────────────────────────────────────────────────
//  GT → COPY COUNT
//  Converts a raw GT string to the number of ALT allele copies.
//  This is the ONLY place GT is interpreted.
// ─────────────────────────────────────────────────────────────────────
export function gtToCopies(gt: string): number {
    // Normalise phased (|) and unphased (/) separators
    const parts = gt.replace(/\|/g, '/').split('/');
    if (parts.length !== 2) return 0;
    const [a, b] = parts.map(p => parseInt(p, 10));
    // Count non-reference (non-zero, non-NaN) alleles
    let copies = 0;
    if (!isNaN(a) && a > 0) copies++;
    if (!isNaN(b) && b > 0) copies++;
    return copies; // 0, 1, or 2
}

// ─────────────────────────────────────────────────────────────────────
//  CORE ENGINE: build diplotype + phenotype per gene
//
//  Two-slot haplotype model:
//    slot[0] and slot[1] each represent one chromosome copy.
//    Both start as "*1" (reference).
//
//    For each GT-confirmed variant (copies > 0):
//      copies == 2  → allele goes into BOTH slots (homozygous variant)
//      copies == 1  → allele goes into exactly ONE slot (het):
//                       - If slot[0] is still *1, replace slot[0]
//                       - Else if slot[1] is still *1, replace slot[1]
//                       - Else the more severe allele wins the LESS severe slot
//                         (the clinical worst-case for that haplotype)
//
//  This ensures:
//    • Exactly 2 alleles in the final diplotype (matching human diploidy)
//    • GT=0/0 variants (copies=0) are invisible — they NEVER affect the result
//    • INFO.STAR labels the allele type but GT decides if/how many copies exist
// ─────────────────────────────────────────────────────────────────────
export function buildGeneResults(vcfVariants: VcfVariant[]): GeneResult[] {
    // Group variants by gene
    const byGene: Record<string, VcfVariant[]> = {};
    for (const v of vcfVariants) {
        if (!byGene[v.gene]) byGene[v.gene] = [];
        byGene[v.gene].push(v);
    }

    const results: GeneResult[] = [];

    for (const gene of Object.keys(byGene)) {
        const variants = byGene[gene];

        // ── Two haplotype slots ──────────────────────────────────────
        // Both start at '*1' (wildtype reference).
        let slotA = '*1';
        let slotB = '*1';

        const contributingVariants: string[] = [];

        for (const v of variants) {
            // GT is already the ground truth — copies=0 must never reach here
            // (the VCF parser already skips GT=0/0 rows), but we guard anyway.
            if (v.copies === 0) continue;

            contributingVariants.push(`${v.star} (${v.rsId}, GT=${v.gt})`);

            if (v.copies === 2) {
                // ── GT = 1/1 → homozygous variant ───────────────────
                // Both chromosomes carry this allele.
                // If an earlier variant was already placed, the *most severe*
                // allele wins each slot (lower severity rank = more severe).
                slotA = pickMoreSevere(gene, slotA, v.star);
                slotB = pickMoreSevere(gene, slotB, v.star);

            } else {
                // ── GT = 0/1 → heterozygous variant ─────────────────
                // Exactly ONE chromosome carries this allele.
                // Place it in whichever slot is still reference, OR if both
                // are already non-reference, upgrade the less-severe slot.
                if (slotA === '*1') {
                    slotA = v.star;
                } else if (slotB === '*1') {
                    slotB = v.star;
                } else {
                    // Both slots are already non-reference.
                    // Replace the less-severe allele with the new one
                    // if the new one is more severe — worst-case clinical model.
                    const sevA = alleleSeverity(gene, slotA);
                    const sevB = alleleSeverity(gene, slotB);
                    if (sevA >= sevB) {
                        // slotA is less severe (or equal) → candidate for upgrade
                        slotA = pickMoreSevere(gene, slotA, v.star);
                    } else {
                        slotB = pickMoreSevere(gene, slotB, v.star);
                    }
                }
            }
        }

        // ── Diplotype is now exactly two alleles ────────────────────
        // Sort for canonical representation: most severe allele first
        // (e.g. "*2/*1" not "*1/*2").
        const [canonA, canonB] = sortByFunctionSeverity(gene, slotA, slotB);
        const diplotype = `${canonA}/${canonB}`;

        // ── Functional annotation ───────────────────────────────────
        const geneKb = ALLELE_FUNCTION[gene] || {};
        const func1 = geneKb[canonA] || 'normal_function';
        const func2 = geneKb[canonB] || 'normal_function';

        const phenotype = derivePhenotype(gene, func1, func2);

        const alert = CPIC_ALERTS[gene]?.[phenotype];
        const cpic_level = alert?.level || 'B';
        const recommendation = alert?.rec || 'No specific CPIC guideline found for this phenotype.';

        results.push({
            gene,
            diplotype,
            phenotype,
            contributing_variants: contributingVariants.length > 0
                ? contributingVariants
                : ['No variants detected — *1/*1 assumed'],
            cpic_level,
            recommendation
        });
    }

    return results;
}

// ─────────────────────────────────────────────────────────────────────
//  HELPERS
// ─────────────────────────────────────────────────────────────────────

/** Return whichever of alleleA or alleleB has lower severity rank (more severe). */
function pickMoreSevere(gene: string, alleleA: string, alleleB: string): string {
    return alleleSeverity(gene, alleleA) <= alleleSeverity(gene, alleleB)
        ? alleleA
        : alleleB;
}

/** Sort two alleles so the more severe one comes first (for canonical diplotype). */
function sortByFunctionSeverity(gene: string, a: string, b: string): [string, string] {
    return alleleSeverity(gene, a) <= alleleSeverity(gene, b) ? [a, b] : [b, a];
}

// ─────────────────────────────────────────────────────────────────────
//  LEGACY SHIM — kept for backward compatibility
// ─────────────────────────────────────────────────────────────────────
export interface RiskResult {
    gene: string;
    variant: string;
    genotype: string;
    phenotype: string;
    cpic_level: string;
    recommendation: string;
}

export const evaluateRisk = (gene: string, star: string, gt: string): RiskResult | null => {
    const copies = gtToCopies(gt);
    if (copies === 0) return null; // GT=0/0 → patient does NOT carry this allele

    const vcfVariant: VcfVariant = { gene, star, rsId: '', gt, copies };
    const results = buildGeneResults([vcfVariant]);
    if (!results.length) return null;

    const r = results[0];
    return {
        gene: r.gene,
        variant: r.diplotype,
        genotype: gt,
        phenotype: r.phenotype,
        cpic_level: r.cpic_level,
        recommendation: r.recommendation
    };
};
