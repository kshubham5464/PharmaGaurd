import { useState, useEffect } from 'react';
import { supabase } from '@/services/supabase';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import GlassCard from '@/components/ui/GlassCard';
import RiskMeter from '@/components/ui/RiskMeter';
import { Activity, CheckCircle, Search, RefreshCw } from 'lucide-react';

const AnalysisPage = () => {
    const [loading, setLoading] = useState(false);

    // Data State
    const [patients, setPatients] = useState<any[]>([]);
    const [drugs, setDrugs] = useState<string[]>([]);
    const [geneProfiles, setGeneProfiles] = useState<any[]>([]);

    // Selection State
    const [selectedPatient, setSelectedPatient] = useState('');
    const [selectedDrug, setSelectedDrug] = useState('');
    const [selectedGeneProfile, setSelectedGeneProfile] = useState<any>(null); // For "What If" we might modify this

    // Result State
    const [analysisResult, setAnalysisResult] = useState<any>(null);

    useEffect(() => {
        fetchInitialData();
    }, []);

    const fetchInitialData = async () => {
        const { data: patientsData } = await supabase.from('patients').select('id, name');
        if (patientsData) setPatients(patientsData);

        // Fetch unique drugs from interactions table for dropdown
        const { data: interactionsData } = await supabase.from('drug_gene_interactions').select('drug_name');
        if (interactionsData) {
            const uniqueDrugs = Array.from(new Set(interactionsData.map((item: any) => item.drug_name)));
            setDrugs(uniqueDrugs as string[]);
        }
    };

    const handlePatientChange = async (patientId: string) => {
        setSelectedPatient(patientId);
        setAnalysisResult(null);
        setSelectedGeneProfile(null);

        // Fetch gene profiles for this patient
        const { data } = await supabase
            .from('gene_profiles')
            .select('*')
            .eq('patient_id', patientId);

        if (data && data.length > 0) {
            setGeneProfiles(data);
        } else {
            setGeneProfiles([]);
        }
    };

    const handleAnalyze = async () => {
        if (!selectedPatient || !selectedDrug || geneProfiles.length === 0) return;
        setLoading(true);

        try {
            const patientGeneNames = geneProfiles.map((gp: any) => gp.gene_name);

            // Step 1: Find all interactions for this drug + patient's genes
            const { data: interactions } = await supabase
                .from('drug_gene_interactions')
                .select('*')
                .eq('drug_name', selectedDrug)
                .in('gene_name', patientGeneNames);

            let result: any = null;
            let matchedGeneProfile: any = null;

            if (interactions && interactions.length > 0) {
                // Step 2: Try matching — first by exact variant, then by metabolizer_type → variant mapping
                for (const geneProfile of geneProfiles) {
                    const geneInteractions = interactions.filter(
                        (i: any) => i.gene_name === geneProfile.gene_name
                    );
                    if (geneInteractions.length === 0) continue;

                    // 2a. Exact variant match
                    let match = geneInteractions.find(
                        (i: any) => i.variant === geneProfile.variant
                    );

                    // 2b. Metabolizer_type → variant fallback mapping
                    if (!match && geneProfile.metabolizer_type) {
                        const metabolizerToVariant: Record<string, string[]> = {
                            'Poor Metabolizer': ['*2/*2', '*3/*3', '*4/*4', '*4/*5'],
                            'Intermediate Metabolizer': ['*1/*2', '*1/*3', '*1/*4', '*1/*5'],
                            'Normal Metabolizer': ['*1/*1'],
                            'Rapid Metabolizer': ['*1/*17'],
                            'Ultrarapid Metabolizer': ['*17/*17'],
                            'Poor Function': ['*5/*5', '*5/*1b'],
                            'Low Function': ['*1/*5'],
                        };

                        const candidateVariants = metabolizerToVariant[geneProfile.metabolizer_type] || [];
                        match = geneInteractions.find(
                            (i: any) => candidateVariants.includes(i.variant)
                        );

                        // 2c. Fuzzy: find any interaction for this gene and pick highest risk
                        if (!match) {
                            const riskOrder: Record<string, number> = { High: 3, Moderate: 2, Low: 1 };
                            match = geneInteractions.sort(
                                (a: any, b: any) =>
                                    (riskOrder[b.risk_level] || 0) - (riskOrder[a.risk_level] || 0)
                            )[0];
                        }
                    }

                    if (match) {
                        result = match;
                        matchedGeneProfile = geneProfile;
                        break; // Use the first (best) match found
                    }
                }
            }

            // Step 3: Fallback if no interaction found at all
            if (!result) {
                result = {
                    risk_level: 'Low',
                    explanation: 'No known gene-drug interaction found for this patient\'s genetic profile.',
                    alternative_drug: 'None'
                };
            }

            setAnalysisResult(result);
            setSelectedGeneProfile(matchedGeneProfile || geneProfiles[0]);

            // Step 4: Save to analyses table
            await supabase.from('analyses').insert({
                patient_id: selectedPatient,
                drug_name: selectedDrug,
                risk_level: result.risk_level,
                explanation: result.explanation,
                alternative_drug: result.alternative_drug
            });

        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    // "What If" Mode Handler
    const updateVariant = async (newVariant: string) => {
        if (!selectedGeneProfile) return;

        // Temporarily update local state for simulation
        const updatedProfile = { ...selectedGeneProfile, variant: newVariant };
        setSelectedGeneProfile(updatedProfile);

        // Re-run analysis logic with new variant
        const { data: specificInteraction } = await supabase
            .from('drug_gene_interactions')
            .select('*')
            .eq('drug_name', selectedDrug)
            .eq('gene_name', updatedProfile.gene_name)
            .eq('variant', newVariant)
            .maybeSingle();

        if (specificInteraction) {
            setAnalysisResult(specificInteraction);
        } else {
            setAnalysisResult({ risk_level: 'Low', explanation: 'No high-risk interaction found for this variant.', alternative_drug: 'None' });
        }
    };

    return (
        <div className="max-w-6xl mx-auto space-y-8">
            <div className="flex items-center gap-3">
                <div className="p-3 bg-neon-blue/10 dark:bg-neon-blue/20 rounded-xl">
                    <Activity className="h-8 w-8 text-neon-blue" />
                </div>
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">Clinical Decision Support</h1>
                    <p className="text-gray-500 dark:text-gray-400">AI-powered drug compatibility analysis.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Configuration Panel */}
                <GlassCard className="lg:col-span-1 p-6 space-y-6 h-fit">
                    <h2 className="text-xl font-semibold border-b border-gray-200 dark:border-white/10 pb-4 text-gray-900 dark:text-white">Analysis Parameters</h2>

                    <div className="space-y-3">
                        <Label className="text-gray-700 dark:text-gray-300">Select Patient</Label>
                        <select
                            className="w-full bg-white dark:bg-white/5 border border-gray-300 dark:border-white/10 rounded-md p-2 text-gray-900 dark:text-white outline-none focus:border-neon-blue"
                            value={selectedPatient}
                            onChange={(e) => handlePatientChange(e.target.value)}
                        >
                            <option value="" className="text-gray-500">-- Choose Patient --</option>
                            {patients.map(p => <option key={p.id} value={p.id} className="text-gray-900 dark:text-white bg-white dark:bg-gray-900">{p.name}</option>)}
                        </select>
                    </div>

                    <div className="space-y-3">
                        <Label className="text-gray-700 dark:text-gray-300">Select Prescribed Drug</Label>
                        <select
                            className="w-full bg-white dark:bg-white/5 border border-gray-300 dark:border-white/10 rounded-md p-2 text-gray-900 dark:text-white outline-none focus:border-neon-blue"
                            value={selectedDrug}
                            onChange={(e) => setSelectedDrug(e.target.value)}
                            disabled={!selectedPatient}
                        >
                            <option value="" className="text-gray-500">-- Choose Drug --</option>
                            {drugs.map(d => <option key={d} value={d} className="text-gray-900 dark:text-white bg-white dark:bg-gray-900">{d}</option>)}
                        </select>
                    </div>

                    {geneProfiles.length > 0 && (
                        <div className="p-4 bg-neon-blue/10 rounded-lg border border-neon-blue/20">
                            <h4 className="text-sm font-semibold text-neon-blue mb-2">Available Genetic Data</h4>
                            <div className="flex flex-wrap gap-2">
                                {geneProfiles.map(gp => (
                                    <span key={gp.id} className="text-xs px-2 py-1 bg-white dark:bg-black/40 rounded border border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-300">
                                        {gp.gene_name} ({gp.variant})
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    <Button
                        onClick={handleAnalyze}
                        disabled={loading || !selectedPatient || !selectedDrug}
                        className="w-full bg-neon-blue hover:bg-neon-blue/80 text-black font-bold h-12"
                    >
                        {loading ? <RefreshCw className="animate-spin h-5 w-5" /> : 'Run Analysis'}
                    </Button>
                </GlassCard>

                {/* Results Panel */}
                <GlassCard className="lg:col-span-2 p-8 flex flex-col items-center justify-center min-h-[500px]">
                    {!analysisResult ? (
                        <div className="text-center text-gray-500">
                            <Search className="h-16 w-16 mx-auto mb-4 opacity-50" />
                            <h3 className="text-xl font-medium">Ready to Analyze</h3>
                            <p>Select a patient and drug to check for compatibility.</p>
                        </div>
                    ) : (
                        <div className="w-full animate-in fade-in zoom-in duration-500">
                            <div className="flex flex-col items-center mb-8">
                                <RiskMeter riskLevel={analysisResult.risk_level} />
                            </div>

                            <div className="grid gap-6 md:grid-cols-2">
                                {/* Main Report */}
                                <div className="space-y-4">
                                    <div className="p-4 rounded-lg bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10">
                                        <span className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-widest">Interpretation</span>
                                        <p className="mt-1 text-lg leading-relaxed text-gray-900 dark:text-gray-100">{analysisResult.explanation}</p>
                                    </div>
                                    {analysisResult.alternative_drug && analysisResult.alternative_drug !== 'None' && (
                                        <div className="p-4 rounded-lg bg-neon-green/10 border border-neon-green/30">
                                            <div className="flex items-center gap-2 mb-2">
                                                <CheckCircle className="h-5 w-5 text-neon-green" />
                                                <span className="text-xs text-neon-green uppercase tracking-widest font-bold">Recommendation</span>
                                            </div>
                                            <p className="text-gray-900 dark:text-white">Consider: <span className="font-bold text-neon-green">{analysisResult.alternative_drug}</span></p>
                                        </div>
                                    )}
                                </div>

                                {/* What If Mode */}
                                <div className="p-6 rounded-xl bg-neon-purple/5 border border-neon-purple/20">
                                    <div className="flex items-center gap-2 mb-4 border-b border-gray-200 dark:border-white/10 pb-2">
                                        <RefreshCw className="h-4 w-4 text-neon-purple" />
                                        <h3 className="font-semibold text-neon-purple">Simulate "What If" Scenario</h3>
                                    </div>

                                    {selectedGeneProfile ? (
                                        <div className="space-y-4">
                                            <div>
                                                <Label className="text-xs text-gray-500 dark:text-gray-400">Adjust Variant for {selectedGeneProfile.gene_name}</Label>
                                                <select
                                                    className="w-full mt-1 bg-white dark:bg-black/40 border border-gray-300 dark:border-white/10 rounded p-2 text-gray-900 dark:text-white text-sm outline-none"
                                                    value={selectedGeneProfile.variant}
                                                    onChange={(e) => updateVariant(e.target.value)}
                                                >
                                                    {['*1/*1', '*1/*2', '*2/*2', '*17/*17'].map(v => (
                                                        <option key={v} value={v} className="text-gray-900 dark:text-white bg-white dark:bg-gray-900">{v}</option>
                                                    ))}
                                                </select>
                                            </div>
                                            <p className="text-xs text-gray-500 italic">
                                                Instantly updates risk assessment based on hypothetical genetic profile.
                                            </p>
                                        </div>
                                    ) : (
                                        <p className="text-xs text-gray-500">No specific gene profile involved in this interaction to simulate.</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </GlassCard>
            </div>
        </div>
    );
};

export default AnalysisPage;
