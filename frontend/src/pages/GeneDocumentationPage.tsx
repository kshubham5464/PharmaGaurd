import { useState } from 'react';
import GlassCard from '@/components/ui/GlassCard';
import { BookOpen, ChevronDown, ChevronUp, Dna, AlertTriangle, CheckCircle, Info } from 'lucide-react';
import { cn } from '@/lib/utils';

// ─────────────────────────────────────────────────
//  GENE KNOWLEDGE BASE
// ─────────────────────────────────────────────────
const GENE_DATA = [
    {
        symbol: 'CYP2D6',
        fullName: 'Cytochrome P450 Family 2 Subfamily D Member 6',
        chromosome: '22q13.2',
        color: 'neon-blue',
        badge: 'CPIC Level A',
        badgeColor: 'text-neon-blue bg-neon-blue/10 border-neon-blue/30',
        summary: 'CYP2D6 is one of the most important drug-metabolising enzymes, responsible for metabolising ~25% of all clinically used drugs. It shows extreme genetic variability.',
        function: 'Encodes an enzyme involved in oxidative metabolism of many drugs. Primarily metabolises analgesics, antidepressants, antipsychotics, and beta-blockers.',
        phenotypes: [
            { label: 'Poor Metabolizer (PM)', abbr: 'PM', desc: 'No functional CYP2D6 activity. Drug accumulates → toxicity risk.', color: 'text-red-500' },
            { label: 'Intermediate Metabolizer (IM)', abbr: 'IM', desc: 'Reduced enzyme activity. May require dose adjustment.', color: 'text-orange-400' },
            { label: 'Normal Metabolizer (NM)', abbr: 'NM', desc: 'Standard enzyme activity. Normal dosing applies.', color: 'text-neon-green' },
            { label: 'Ultrarapid Metabolizer (UM)', abbr: 'UM', desc: 'Increased enzyme copies. Drug cleared too fast → under-exposure.', color: 'text-yellow-400' },
        ],
        keyVariants: [
            { variant: '*4', impact: 'No Function', freq: '~20% Europeans' },
            { variant: '*5', impact: 'No Function (Gene deletion)', freq: '~5% all populations' },
            { variant: '*2xN', impact: 'Increased Function (duplication)', freq: '~2–10%' },
            { variant: '*10', impact: 'Decreased Function', freq: '~50% East Asians' },
            { variant: '*17', impact: 'Decreased Function', freq: '~20–35% Africans' },
        ],
        affectedDrugs: [
            { drug: 'Codeine', risk: 'High', note: 'PM = no analgesia; UM = opioid toxicity risk' },
            { drug: 'Tramadol', risk: 'High', note: 'UM = serotonin syndrome / respiratory depression' },
            { drug: 'Tamoxifen', risk: 'High', note: 'PM = reduced active metabolite, cancer recurrence risk' },
            { drug: 'Fluoxetine', risk: 'Moderate', note: 'PM = toxicity; adjust dose' },
            { drug: 'Metoprolol', risk: 'Moderate', note: 'PM = 4-5x higher plasma levels' },
        ],
        cpicLevel: '1A',
        clinicalNote: 'CPIC recommends avoiding codeine in UM patients due to potentially fatal morphine accumulation. Tramadol is similarly contraindicated.',
    },
    {
        symbol: 'CYP2C19',
        fullName: 'Cytochrome P450 Family 2 Subfamily C Member 19',
        chromosome: '10q23.33',
        color: 'neon-purple',
        badge: 'CPIC Level A',
        badgeColor: 'text-neon-purple bg-neon-purple/10 border-neon-purple/30',
        summary: 'CYP2C19 metabolizes critical clinical drugs including clopidogrel (antiplatelet), PPIs, and certain antidepressants. Its genetic variation has major implications in cardiology.',
        function: 'Hepatic enzyme responsible for 10–15% of drug oxidation. Essential for activation of clopidogrel (prodrug → active thiol metabolite).',
        phenotypes: [
            { label: 'Poor Metabolizer (PM)', abbr: 'PM', desc: 'No CYP2C19 activity. Clopidogrel fails to activate → thrombosis risk.', color: 'text-red-500' },
            { label: 'Intermediate Metabolizer (IM)', abbr: 'IM', desc: 'One non-functional allele. Reduced antiplatelet effect.', color: 'text-orange-400' },
            { label: 'Normal Metabolizer (NM)', abbr: 'NM', desc: 'Two functional alleles. Standard response expected.', color: 'text-neon-green' },
            { label: 'Rapid Metabolizer (RM)', abbr: 'RM', desc: 'One *17 gain-of-function allele. Faster drug clearance.', color: 'text-yellow-400' },
            { label: 'Ultrarapid Metabolizer (UM)', abbr: 'UM', desc: 'Two *17 alleles. PPIs less effective; may need higher doses.', color: 'text-yellow-500' },
        ],
        keyVariants: [
            { variant: '*2 (rs4244285)', impact: 'No Function', freq: '~15% Europeans, ~30% Asians' },
            { variant: '*3 (rs4986893)', impact: 'No Function', freq: '~2–9% Asians' },
            { variant: '*17 (rs12248560)', impact: 'Increased Function', freq: '~18–25% Europeans' },
        ],
        affectedDrugs: [
            { drug: 'Clopidogrel', risk: 'High', note: 'PM/IM = reduced platelet inhibition → heart attack/stroke risk' },
            { drug: 'Omeprazole/PPIs', risk: 'Moderate', note: 'UM = treatment failure; IM/PM = higher drug exposure' },
            { drug: 'Voriconazole', risk: 'High', note: 'PM = toxic accumulation; UM = sub-therapeutic levels' },
            { drug: 'Amitriptyline', risk: 'Moderate', note: 'PM = increased side effects' },
        ],
        cpicLevel: '1A',
        clinicalNote: 'FDA has added a black-box warning on clopidogrel for CYP2C19 PMs. Consider prasugrel or ticagrelor as genotype-guided alternatives.',
    },
    {
        symbol: 'CYP2C9',
        fullName: 'Cytochrome P450 Family 2 Subfamily C Member 9',
        chromosome: '10q23.33',
        color: 'neon-green',
        badge: 'CPIC Level A',
        badgeColor: 'text-neon-green bg-neon-green/10 border-neon-green/30',
        summary: 'CYP2C9 is the primary enzyme responsible for warfarin metabolism. Reduced function variants dramatically increase bleeding risk if standard warfarin doses are used.',
        function: 'Responsible for metabolism of ~15% of drugs including warfarin (S-enantiomer), NSAIDs, sulfonylureas, and phenytoin.',
        phenotypes: [
            { label: 'Normal Metabolizer (NM)', abbr: 'NM', desc: '*1/*1. Standard warfarin dosing.', color: 'text-neon-green' },
            { label: 'Intermediate Metabolizer (IM)', abbr: 'IM', desc: 'Reduced clearance. Lower warfarin dose required.', color: 'text-orange-400' },
            { label: 'Poor Metabolizer (PM)', abbr: 'PM', desc: 'Severely reduced clearance. Very high bleeding risk with standard doses.', color: 'text-red-500' },
        ],
        keyVariants: [
            { variant: '*2 (rs1799853)', impact: 'Decreased Function', freq: '~10–15% Europeans' },
            { variant: '*3 (rs1057910)', impact: 'Decreased Function', freq: '~7–9% Europeans' },
            { variant: '*5, *6, *8, *11', impact: 'Decreased/No Function', freq: 'Rare, mainly African populations' },
        ],
        affectedDrugs: [
            { drug: 'Warfarin', risk: 'High', note: 'PM = severe over-anticoagulation → major bleeding events' },
            { drug: 'Phenytoin', risk: 'High', note: 'PM = drug toxicity, neurotoxicity' },
            { drug: 'Celecoxib', risk: 'Moderate', note: 'PM = 2-3x higher exposure' },
            { drug: 'Glipizide/Glyburide', risk: 'Moderate', note: 'PM = hypoglycaemia risk' },
        ],
        cpicLevel: '1A',
        clinicalNote: 'Combined with VKORC1 and CYP4F2, CYP2C9 genotyping enables personalised warfarin dosing algorithms. FDA label recommends reduced starting doses for *2/*2, *3/*3 patients.',
    },
    {
        symbol: 'SLCO1B1',
        fullName: 'Solute Carrier Organic Anion Transporter Family Member 1B1',
        chromosome: '12p12.1',
        color: 'neon-amber',
        badge: 'CPIC Level A',
        badgeColor: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/30',
        summary: 'SLCO1B1 encodes a liver uptake transporter (OATP1B1). Reduced function significantly decreases statin clearance from the blood into the liver, raising myopathy risk.',
        function: 'Hepatic influx transporter responsible for uptake of many endogenous compounds and drugs into hepatocytes, enabling their metabolism and clearance.',
        phenotypes: [
            { label: 'Normal Function (NF)', abbr: 'NF', desc: '*1a/*1a or *1b/*1b. Standard statin dosing appropriate.', color: 'text-neon-green' },
            { label: 'Intermediate Function (IF)', abbr: 'IF', desc: 'One *5 allele. Moderately increased statin plasma exposure.', color: 'text-orange-400' },
            { label: 'Poor Function (PF)', abbr: 'PF', desc: '*5/*5. Severely impaired uptake → high myopathy risk.', color: 'text-red-500' },
        ],
        keyVariants: [
            { variant: '*5 (rs4149056)', impact: 'Decreased Function', freq: '~15% Europeans' },
            { variant: '*1b (rs2306283)', impact: 'Normal/Increased Function', freq: 'Common' },
            { variant: '*15 (rs2306283 + rs4149056)', impact: 'Decreased Function', freq: '~10% East Asians' },
        ],
        affectedDrugs: [
            { drug: 'Simvastatin', risk: 'High', note: 'PF = 221% increase in AUC → myopathy/rhabdomyolysis' },
            { drug: 'Atorvastatin', risk: 'Moderate', note: 'Preferred alternative for *5 carriers at lower doses' },
            { drug: 'Rosuvastatin', risk: 'Moderate', note: 'Least affected; preferred for PF patients' },
            { drug: 'Repaglinide', risk: 'Moderate', note: 'Increased blood glucose-lowering effect' },
        ],
        cpicLevel: '1A',
        clinicalNote: 'CPIC recommends avoiding simvastatin >20mg/day in *5 heterozygotes. Homozygous *5/*5 patients should be switched to rosuvastatin or pravastatin.',
    },
    {
        symbol: 'TPMT',
        fullName: 'Thiopurine S-Methyltransferase',
        chromosome: '6p22.3',
        color: 'neon-pink',
        badge: 'CPIC Level A',
        badgeColor: 'text-pink-400 bg-pink-400/10 border-pink-400/30',
        summary: 'TPMT inactivates thiopurine drugs (azathioprine, mercaptopurine, thioguanine). Low TPMT activity leads to toxic accumulation of active metabolites causing severe myelosuppression.',
        function: 'Catalyzes S-methylation of thiopurine drugs, converting them to inactive metabolites. Essential for preventing toxic build-up of thioguanine nucleotides (TGNs).',
        phenotypes: [
            { label: 'Normal Metabolizer (NM)', abbr: 'NM', desc: 'High TPMT activity. Standard thiopurine dosing.', color: 'text-neon-green' },
            { label: 'Intermediate Metabolizer (IM)', abbr: 'IM', desc: 'One non-functional allele. Consider 30-70% dose reduction.', color: 'text-orange-400' },
            { label: 'Poor Metabolizer (PM)', abbr: 'PM', desc: 'Two non-functional alleles (~0.3%). Fatal myelosuppression risk at standard dose.', color: 'text-red-500' },
        ],
        keyVariants: [
            { variant: '*2 (rs1800462)', impact: 'No Function', freq: '~0.4%' },
            { variant: '*3A (rs1800460 + rs1142345)', impact: 'No Function', freq: '~5% Europeans' },
            { variant: '*3B (rs1800460)', impact: 'No Function', freq: 'Rare' },
            { variant: '*3C (rs1142345)', impact: 'No Function', freq: '~2% Africans/Asians' },
        ],
        affectedDrugs: [
            { drug: 'Azathioprine', risk: 'High', note: 'PM = life-threatening myelosuppression at standard dose' },
            { drug: 'Mercaptopurine (6-MP)', risk: 'High', note: 'Used in ALL treatment; PM requires 6-15x dose reduction' },
            { drug: 'Thioguanine', risk: 'High', note: 'PM = bone marrow failure; alternative required' },
        ],
        cpicLevel: '1A',
        clinicalNote: 'TPMT genotyping (or phenotyping via enzyme activity assay) is required before initiating thiopurine therapy. PMs should receive non-thiopurine alternatives when possible.',
    },
    {
        symbol: 'DPYD',
        fullName: 'Dihydropyrimidine Dehydrogenase',
        chromosome: '1p22',
        color: 'neon-red',
        badge: 'CPIC Level A',
        badgeColor: 'text-red-400 bg-red-400/10 border-red-400/30',
        summary: 'DPYD encodes the primary enzyme responsible for 5-fluorouracil (5-FU) and capecitabine catabolism. Deficiency causes severe, potentially life-threatening fluoropyrimidine toxicity.',
        function: 'Rate-limiting enzyme in pyrimidine catabolism. Degrades >80% of administered 5-FU. Low activity → drug accumulation → systemic toxicity.',
        phenotypes: [
            { label: 'Normal Metabolizer (NM)', abbr: 'NM', desc: 'Full DPD activity. Standard fluoropyrimidine dosing.', color: 'text-neon-green' },
            { label: 'Intermediate Metabolizer (IM)', abbr: 'IM', desc: '~50% DPD activity. Start at 50% dose, titrate.', color: 'text-orange-400' },
            { label: 'Poor Metabolizer (PM)', abbr: 'PM', desc: 'Near-zero DPD activity. 5-FU/capecitabine contraindicated.', color: 'text-red-500' },
        ],
        keyVariants: [
            { variant: 'c.1905+1G>A / *2A (rs3918290)', impact: 'No Function', freq: '~1%' },
            { variant: 'c.1679T>G / HapB3 (rs55886062)', impact: 'No Function', freq: '~0.1–0.5%' },
            { variant: 'c.2846A>T (rs67376798)', impact: 'Decreased Function', freq: '~1%' },
            { variant: 'c.1236G>A / HapB3 (rs56038477)', impact: 'Decreased Function', freq: '~3–5%' },
        ],
        affectedDrugs: [
            { drug: '5-Fluorouracil (5-FU)', risk: 'High', note: 'PM = severe mucositis, neutropenia, neurotoxicity, death' },
            { drug: 'Capecitabine (Xeloda)', risk: 'High', note: 'Prodrug of 5-FU; same toxicity risk profile' },
            { drug: 'Tegafur', risk: 'High', note: 'Another 5-FU prodrug; avoid in PM' },
        ],
        cpicLevel: '1A',
        clinicalNote: 'EMA recommends DPYD genotyping before fluoropyrimidine therapy. PM patients should use alternative chemotherapy regimens. IM patients should start at 50% dose with careful monitoring.',
    },
];

// ─────────────────────────────────────────────────
//  COMPONENTS
// ─────────────────────────────────────────────────

const RiskBadge = ({ risk }: { risk: string }) => {
    const styles: Record<string, string> = {
        High: 'bg-red-500/20 text-red-400 border border-red-500/30',
        Moderate: 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30',
        Low: 'bg-green-500/20 text-green-400 border border-green-500/30',
    };
    return (
        <span className={cn('text-xs font-bold px-2 py-0.5 rounded-full', styles[risk] || styles['Low'])}>
            {risk}
        </span>
    );
};

const GeneCard = ({ gene }: { gene: typeof GENE_DATA[0] }) => {
    const [expanded, setExpanded] = useState(false);

    return (
        <GlassCard className="overflow-hidden transition-all duration-300">
            {/* Header */}
            <button
                onClick={() => setExpanded(e => !e)}
                className="w-full text-left p-6 flex items-start gap-4 hover:bg-gray-50/50 dark:hover:bg-white/5 transition-colors"
            >
                <div className={cn('p-3 rounded-xl flex-shrink-0', `bg-${gene.color}/10 dark:bg-${gene.color}/20`)}>
                    <Dna className={cn('h-7 w-7', `text-${gene.color}`)} />
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 flex-wrap">
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white font-mono">{gene.symbol}</h2>
                        <span className={cn('text-xs font-semibold px-2 py-0.5 rounded-full border', gene.badgeColor)}>
                            {gene.badge}
                        </span>
                        <span className="text-xs text-gray-500 border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 px-2 py-0.5 rounded-full">
                            Chr {gene.chromosome}
                        </span>
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5 italic">{gene.fullName}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mt-2 leading-relaxed">{gene.summary}</p>
                </div>
                <div className="flex-shrink-0 text-gray-400 pt-1">
                    {expanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                </div>
            </button>

            {/* Expanded Content */}
            {expanded && (
                <div className="border-t border-gray-100 dark:border-white/10 px-6 pb-8 pt-6 space-y-8 animate-in fade-in duration-300">

                    {/* Function */}
                    <div className="flex gap-3">
                        <Info className="h-5 w-5 text-blue-400 flex-shrink-0 mt-0.5" />
                        <div>
                            <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200 uppercase tracking-wide mb-1">Gene Function</h3>
                            <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">{gene.function}</p>
                        </div>
                    </div>

                    {/* Phenotypes */}
                    <div>
                        <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200 uppercase tracking-wide mb-3">Metabolizer Phenotypes</h3>
                        <div className="grid sm:grid-cols-2 gap-3">
                            {gene.phenotypes.map(p => (
                                <div key={p.abbr} className="flex gap-3 p-3 rounded-lg bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10">
                                    <span className={cn('text-lg font-black font-mono w-8 flex-shrink-0', p.color)}>{p.abbr}</span>
                                    <div>
                                        <p className="text-xs font-semibold text-gray-700 dark:text-gray-200">{p.label}</p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{p.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Key Variants */}
                    <div>
                        <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200 uppercase tracking-wide mb-3">Key Variants / Star Alleles</h3>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="text-left border-b border-gray-200 dark:border-white/10">
                                        <th className="pb-2 pr-4 font-semibold text-gray-500 text-xs uppercase">Variant</th>
                                        <th className="pb-2 pr-4 font-semibold text-gray-500 text-xs uppercase">Functional Impact</th>
                                        <th className="pb-2 font-semibold text-gray-500 text-xs uppercase">Population Frequency</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                                    {gene.keyVariants.map(v => (
                                        <tr key={v.variant}>
                                            <td className="py-2 pr-4 font-mono text-xs font-bold text-gray-800 dark:text-white">{v.variant}</td>
                                            <td className="py-2 pr-4">
                                                <span className={cn('text-xs px-2 py-0.5 rounded font-medium',
                                                    v.impact.includes('No') ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400' :
                                                        v.impact.includes('Decreased') ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400' :
                                                            'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'
                                                )}>
                                                    {v.impact}
                                                </span>
                                            </td>
                                            <td className="py-2 text-xs text-gray-500 dark:text-gray-400">{v.freq}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Affected Drugs */}
                    <div>
                        <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200 uppercase tracking-wide mb-3">Affected Drugs</h3>
                        <div className="space-y-2">
                            {gene.affectedDrugs.map(d => (
                                <div key={d.drug} className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <span className="font-semibold text-sm text-gray-900 dark:text-white">{d.drug}</span>
                                            <RiskBadge risk={d.risk} />
                                        </div>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{d.note}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Clinical Note */}
                    <div className="flex gap-3 p-4 rounded-lg bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-500/20">
                        <AlertTriangle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
                        <div>
                            <h3 className="text-sm font-semibold text-amber-700 dark:text-amber-400 mb-1">CPIC Level {gene.cpicLevel} — Clinical Guidance</h3>
                            <p className="text-xs text-amber-700 dark:text-amber-300 leading-relaxed">{gene.clinicalNote}</p>
                        </div>
                    </div>

                </div>
            )}
        </GlassCard>
    );
};

// ─────────────────────────────────────────────────
//  PAGE
// ─────────────────────────────────────────────────
const GeneDocumentationPage = () => {
    return (
        <div className="max-w-5xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center gap-3 mb-8">
                <div className="p-3 bg-neon-green/10 dark:bg-neon-green/20 rounded-xl">
                    <BookOpen className="h-8 w-8 text-neon-green" />
                </div>
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">Gene Documentation</h1>
                    <p className="text-gray-500 dark:text-gray-400">Clinical reference for the 6 critical pharmacogenomics genes.</p>
                </div>
            </div>

            {/* Info Banner */}
            <div className="flex items-center gap-3 p-4 rounded-xl bg-blue-50 dark:bg-neon-blue/10 border border-blue-200 dark:border-neon-blue/20 mb-6">
                <CheckCircle className="h-5 w-5 text-blue-500 dark:text-neon-blue flex-shrink-0" />
                <p className="text-sm text-blue-700 dark:text-blue-300">
                    All 6 genes are CPIC Level A — highest evidence tier. Clinical recommendations are based on published CPIC, DPWG, and FDA guidelines.
                    Click any gene card to expand its full documentation.
                </p>
            </div>

            {/* Gene Cards */}
            <div className="space-y-4">
                {GENE_DATA.map(gene => (
                    <GeneCard key={gene.symbol} gene={gene} />
                ))}
            </div>

            {/* Footer */}
            <p className="text-center text-xs text-gray-400 pt-4">
                Data sourced from CPIC Guidelines, PharmGKB, and FDA Pharmacogenomics Table. For clinical use, always verify current guidelines.
            </p>
        </div>
    );
};

export default GeneDocumentationPage;
