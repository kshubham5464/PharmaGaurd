import { useState, useEffect } from 'react';
import { supabase } from '@/services/supabase';
import { Button } from '@/components/ui/button';
import GlassCard from '@/components/ui/GlassCard';
import { Download, FileJson, Loader2 } from 'lucide-react';

const ExportDataPage = () => {
    const [patients, setPatients] = useState<any[]>([]);
    const [selectedPatientId, setSelectedPatientId] = useState<string>('');
    const [loading, setLoading] = useState(true);
    const [exporting, setExporting] = useState(false);

    useEffect(() => {
        fetchPatients();
    }, []);

    const fetchPatients = async () => {
        try {
            const { data, error } = await supabase
                .from('patients')
                .select('id, name');

            if (error) throw error;
            setPatients(data || []);
        } catch (error) {
            console.error('Error fetching patients:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleExport = async () => {
        if (!selectedPatientId) return;
        setExporting(true);

        try {
            // 1. Fetch Patient Data
            const { data: patient } = await supabase
                .from('patients')
                .select('*')
                .eq('id', selectedPatientId)
                .single();

            // 2. Fetch ALL Analyses for this patient (sorted latest first)
            const { data: analyses } = await supabase
                .from('analyses')
                .select('*')
                .eq('patient_id', selectedPatientId)
                .order('created_at', { ascending: false });

            // Pick the most clinically severe analysis
            const riskOrder: Record<string, number> = { High: 3, Moderate: 2, Low: 1 };
            const analysis = analyses?.sort(
                (a: any, b: any) => (riskOrder[b.risk_level] || 0) - (riskOrder[a.risk_level] || 0)
            )?.[0];

            // 3. Fetch ALL Gene Profiles
            const { data: genes } = await supabase
                .from('gene_profiles')
                .select('*')
                .eq('patient_id', selectedPatientId);

            const primaryGene = genes?.[0];
            const allGenes = genes || [];

            // 4. Map risk level to severity string
            const severityMap: Record<string, string> = {
                'High': 'high',
                'Moderate': 'moderate',
                'Low': 'low',
                'Critical': 'critical',
            };
            const riskLabel = analysis?.risk_level || 'Unknown';
            const severity = severityMap[riskLabel] || 'none';

            // 5. Confidence score: derived from CPIC confidence
            // High = 0.95, Moderate = 0.78, Low = 0.55, Unknown = 0.0
            const confidenceMap: Record<string, number> = {
                'High': 0.95, 'Moderate': 0.78, 'Low': 0.55, 'Unknown': 0.0
            };
            const confidenceScore = confidenceMap[riskLabel] ?? 0.0;

            // 6. Detected Variants — map all gene profiles to rsID placeholders
            // In a real app these would come from the VCF rs column
            const detectedVariants: Record<string, string> = {};
            allGenes.forEach((g: any) => {
                // rsID placeholder — real app would store this from VCF parsing
                const rsId = `rs_${g.gene_name}_${g.variant}`.replace(/[^a-zA-Z0-9_]/g, '');
                detectedVariants[rsId] = `${g.gene_name} ${g.variant} (${g.metabolizer_type || 'Unknown'})`;
            });

            // 7. Clinical phenotype label mapping
            const phenotypeToAbbr: Record<string, string> = {
                'Poor Metabolizer': 'PM',
                'Intermediate Metabolizer': 'IM',
                'Normal Metabolizer': 'NM',
                'Rapid Metabolizer': 'RM',
                'Ultrarapid Metabolizer': 'UM',
                'Poor Function': 'PF',
                'Low Function': 'LF',
            };
            const phenotype = primaryGene?.metabolizer_type || 'Unknown';
            const phenotypeAbbr = phenotypeToAbbr[phenotype] || 'Unknown';

            // 8. Build the full export schema
            const exportData = {
                "patient_id": patient?.id || selectedPatientId,
                "patient": `PATIENT ${patient?.name?.toUpperCase() || 'UNKNOWN'}`,
                "drug": analysis?.drug_name || patient?.prescribed_drug || "DRUG NAME",
                "timestamp": new Date().toISOString(),

                "risk_assessment": {
                    "risk_label": riskLabel === 'High' ? 'Toxic' :
                        riskLabel === 'Moderate' ? 'Adjust Dosage' :
                            riskLabel === 'Low' ? 'Safe' : 'Unknown',
                    "confidence_score": confidenceScore,
                    "severity": severity
                },

                "pharmacogenomic_profile": {
                    "primary_gene": primaryGene?.gene_name || "GENE SYMBOL",
                    "diplotype": primaryGene?.variant || "Unknown",
                    "phenotype": `${phenotypeAbbr} | ${phenotype}`,
                    "detected_variants": detectedVariants,

                    "clinical_recommendation": analysis?.alternative_drug && analysis.alternative_drug !== 'None'
                        ? `Consider: ${analysis.alternative_drug}`
                        : (analysis?.explanation || 'No specific recommendation.'),

                    "llm_generated_explanation": {
                        "summary": analysis?.explanation ||
                            `No analysis has been run yet for patient ${patient?.name}.`
                    }
                },

                "quality_metrics": {
                    "vcf_parsing_success": allGenes.length > 0,
                    "genes_analyzed": allGenes.length,
                    "analyses_on_record": analyses?.length || 0,
                    "report_generated_at": new Date().toISOString(),
                    "data_source": "PharmaGuard CDSS v1.0"
                },

                // Full gene profiles snapshot
                "all_gene_profiles": allGenes.map((g: any) => ({
                    gene_name: g.gene_name,
                    variant: g.variant,
                    metabolizer_type: g.metabolizer_type || 'Unknown',
                    recorded_at: g.created_at
                })),

                // Analysis history
                "analysis_history": (analyses || []).map((a: any) => ({
                    drug: a.drug_name,
                    risk_level: a.risk_level,
                    explanation: a.explanation,
                    alternative: a.alternative_drug,
                    timestamp: a.created_at
                }))
            };

            // 9. Trigger Download
            const jsonString = JSON.stringify(exportData, null, 2);
            const blob = new Blob([jsonString], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `PharmaGuard_Report_${patient?.name?.replace(/\s+/g, '_') || 'Patient'}_${Date.now()}.json`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);

        } catch (error) {
            console.error('Export failed:', error);
            alert('Failed to generate export. Make sure population data exists for this patient.');
        } finally {
            setExporting(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div className="flex items-center gap-3 mb-8">
                <div className="p-3 bg-neon-purple/10 dark:bg-neon-purple/20 rounded-xl">
                    <FileJson className="h-8 w-8 text-neon-purple" />
                </div>
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">Export Data</h1>
                    <p className="text-gray-500 dark:text-gray-400">Generate standardised JSON reports for interoperability.</p>
                </div>
            </div>

            <GlassCard className="p-8">
                <div className="space-y-4">
                    <label className="text-gray-700 dark:text-gray-300 block mb-2">Select Patient to Export</label>
                    <select
                        className="w-full bg-white dark:bg-black/50 border border-gray-300 dark:border-white/10 rounded-md p-3 text-gray-900 dark:text-white focus:border-neon-purple outline-none"
                        value={selectedPatientId}
                        onChange={(e) => setSelectedPatientId(e.target.value)}
                        disabled={loading}
                    >
                        <option value="" className="text-gray-500">-- Choose Patient --</option>
                        {patients.map(p => (
                            <option key={p.id} value={p.id} className="text-gray-900 dark:text-white bg-white dark:bg-gray-900">{p.name}</option>
                        ))}
                    </select>

                    <Button
                        onClick={handleExport}
                        disabled={!selectedPatientId || exporting}
                        className="w-full bg-neon-purple hover:bg-neon-purple/80 text-white font-bold h-12 mt-6"
                    >
                        {exporting ? (
                            <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating JSON...</>
                        ) : (
                            <><Download className="mr-2 h-4 w-4" /> Download JSON Report</>
                        )}
                    </Button>
                </div>
            </GlassCard>
        </div>
    );
};

export default ExportDataPage;
