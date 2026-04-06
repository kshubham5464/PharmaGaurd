import { useState, useEffect } from 'react';
import { supabase } from '@/services/supabase';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import GlassCard from '@/components/ui/GlassCard';
import RiskMeter from '@/components/ui/RiskMeter';
import { Activity, CheckCircle, Search, RefreshCw, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] }
};

const staggerContainer = {
    animate: {
        transition: {
            staggerChildren: 0.08
        }
    }
};

const AnalysisPage = () => {
    const [loading, setLoading] = useState(false);

    // Data State
    const [patients, setPatients] = useState<any[]>([]);
    const [drugs, setDrugs] = useState<string[]>([]);
    const [geneProfiles, setGeneProfiles] = useState<any[]>([]);

    // Selection State
    const [selectedPatient, setSelectedPatient] = useState('');
    const [selectedDrugs, setSelectedDrugs] = useState<string[]>([]);
    const [selectedGeneProfile, setSelectedGeneProfile] = useState<any>(null);

    // Result State
    const [analysisResults, setAnalysisResults] = useState<any[]>([]);

    useEffect(() => {
        fetchInitialData();
    }, []);

    const fetchInitialData = async () => {
        const { data: patientsData } = await supabase.from('patients').select('id, name');
        if (patientsData) setPatients(patientsData);

        const { data: interactionsData } = await supabase.from('drug_gene_interactions').select('drug_name');
        if (interactionsData) {
            const uniqueDrugs = Array.from(new Set(interactionsData.map((item: any) => item.drug_name)));
            setDrugs(uniqueDrugs as string[]);
        }
    };

    const handlePatientChange = async (patientId: string) => {
        setSelectedPatient(patientId);
        setAnalysisResults([]);
        setSelectedGeneProfile(null);

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
        if (!selectedPatient || selectedDrugs.length === 0 || geneProfiles.length === 0) return;
        setLoading(true);
        // Simulate a "deep scan" feel
        await new Promise(resolve => setTimeout(resolve, 2000));

        try {
            const allResults: any[] = [];
            const patientGeneNames = geneProfiles.map((gp: any) => gp.gene_name);

            for (const drugName of selectedDrugs) {
                const { data: interactions } = await supabase
                    .from('drug_gene_interactions')
                    .select('*')
                    .eq('drug_name', drugName)
                    .in('gene_name', patientGeneNames);

                let drugResult: any = null;

                if (interactions && interactions.length > 0) {
                    for (const geneProfile of geneProfiles) {
                        const geneInteractions = interactions.filter(
                            (i: any) => i.gene_name === geneProfile.gene_name
                        );
                        if (geneInteractions.length === 0) continue;

                        let match = geneInteractions.find(
                            (i: any) => i.variant === geneProfile.variant
                        );

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

                            if (!match) {
                                const riskOrder: Record<string, number> = { High: 3, Moderate: 2, Low: 1 };
                                match = geneInteractions.sort(
                                    (a: any, b: any) =>
                                        (riskOrder[b.risk_level] || 0) - (riskOrder[a.risk_level] || 0)
                                )[0];
                            }
                        }

                        if (match) {
                            drugResult = { ...match, drug_name: drugName };
                            break;
                        }
                    }
                }

                if (!drugResult) {
                    drugResult = {
                        drug_name: drugName,
                        risk_level: 'Low',
                        explanation: 'No known gene-drug interaction found for this patient\'s genetic profile.',
                        alternative_drug: 'None'
                    };
                }

                allResults.push(drugResult);

                await supabase.from('analyses').insert({
                    patient_id: selectedPatient,
                    drug_name: drugName,
                    risk_level: drugResult.risk_level,
                    explanation: drugResult.explanation,
                    alternative_drug: drugResult.alternative_drug
                });
            }

            setAnalysisResults(allResults);
            setSelectedGeneProfile(geneProfiles[0]);

        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const updateVariant = async (newVariant: string) => {
        if (!selectedGeneProfile || analysisResults.length === 0) return;

        const updatedProfile = { ...selectedGeneProfile, variant: newVariant };
        setSelectedGeneProfile(updatedProfile);

        const drugName = analysisResults[0].drug_name;
        const { data: specificInteraction } = await supabase
            .from('drug_gene_interactions')
            .select('*')
            .eq('drug_name', drugName)
            .eq('gene_name', updatedProfile.gene_name)
            .eq('variant', newVariant)
            .maybeSingle();

        if (specificInteraction) {
            setAnalysisResults(prev => prev.map((r, i) => i === 0 ? { ...specificInteraction, drug_name: drugName } : r));
        }
    };

    return (
        <motion.div 
            className="max-w-7xl mx-auto space-y-12 sm:space-y-16 py-8"
            initial="initial"
            animate="animate"
            variants={staggerContainer}
        >
            {/* Header Section */}
            <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row items-start sm:items-center gap-6 px-4">
                <motion.div 
                    initial={{ rotate: -15, scale: 0.8 }}
                    animate={{ rotate: 0, scale: 1 }}
                    transition={{ type: 'spring', damping: 10 }}
                    className="p-5 bg-neon-blue/10 dark:bg-neon-blue/20 rounded-3xl border border-neon-blue/20 shadow-[0_0_40px_rgba(0,240,255,0.1)]"
                >
                    <Activity className="h-10 w-10 text-neon-blue" />
                </motion.div>
                <div>
                    <h1 className="text-4xl sm:text-6xl font-black text-gray-900 dark:text-white tracking-tighter uppercase leading-none text-left">Clinical Decision Support</h1>
                    <p className="text-xs sm:text-sm font-bold text-neon-blue uppercase tracking-[0.4em] mt-3 opacity-80 flex items-center gap-2">
                        <span className="h-1.5 w-1.5 rounded-full bg-neon-blue animate-pulse" />
                        Multi-Drug Genetic Interaction Engine
                    </p>
                </div>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-12 px-4">
                {/* Configuration Panel (Left) */}
                <motion.div variants={fadeInUp} className="lg:col-span-4 space-y-8">
                    <GlassCard className="p-8 sm:p-10 space-y-10 h-fit border-t-8 border-neon-blue shadow-2xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:rotate-12 transition-transform duration-700 text-left">
                            <Activity className="h-32 w-32 text-neon-blue" />
                        </div>

                        <div className="space-y-5 relative z-10 text-left">
                            <Label className="text-[11px] font-black uppercase tracking-[0.3em] text-gray-400 flex items-center gap-2">
                                <UsersIcon className="h-3 w-3" /> Biological Subject Identification
                            </Label>
                            <div className="relative group/select">
                                <select
                                    className="w-full bg-white/50 dark:bg-black/20 border-2 border-gray-100 dark:border-white/5 rounded-2xl px-5 py-4 text-gray-900 dark:text-white outline-none focus:ring-4 focus:ring-neon-blue/10 focus:border-neon-blue font-black transition-all appearance-none cursor-pointer"
                                    value={selectedPatient}
                                    onChange={(e) => handlePatientChange(e.target.value)}
                                >
                                    <option value="" className="text-gray-500 italic">Select Patient Identity</option>
                                    {patients.map(p => <option key={p.id} value={p.id} className="text-gray-900 dark:text-white bg-white dark:bg-gray-950">{p.name}</option>)}
                                </select>
                                <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 group-hover/select:text-neon-blue transition-colors">
                                    <ChevronDown className="h-5 w-5" />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-5 relative z-10 text-left">
                            <Label className="text-[11px] font-black uppercase tracking-[0.3em] text-gray-400 flex items-center gap-2">
                                <Search className="h-3 w-3" /> Pharmacological Cocktail Selection
                            </Label>
                            <div className="max-h-80 overflow-y-auto space-y-2.5 p-4 border-2 border-gray-100 dark:border-white/5 rounded-2xl bg-white/30 dark:bg-black/40 custom-scrollbar shadow-inner">
                                {drugs.length === 0 ? (
                                    <p className="text-center py-10 text-gray-500 text-xs font-bold uppercase tracking-widest italic opacity-50">Loading Substances...</p>
                                ) : drugs.map(d => (
                                    <label key={d} className="flex items-center gap-4 cursor-pointer hover:bg-neon-blue/10 dark:hover:bg-neon-blue/5 p-4 rounded-2xl transition-all group active:scale-[0.98] border border-transparent hover:border-neon-blue/20">
                                        <div className="relative flex items-center justify-center">
                                            <input
                                                type="checkbox"
                                                checked={selectedDrugs.includes(d)}
                                                onChange={(e) => {
                                                    if (e.target.checked) setSelectedDrugs([...selectedDrugs, d]);
                                                    else setSelectedDrugs(selectedDrugs.filter(item => item !== d));
                                                }}
                                                className="peer h-6 w-6 rounded-lg border-2 border-gray-300 dark:border-white/10 text-neon-blue focus:ring-neon-blue bg-transparent transition-all checked:bg-neon-blue checked:border-neon-blue appearance-none cursor-pointer"
                                                disabled={!selectedPatient}
                                            />
                                            <CheckCircle className="absolute h-4 w-4 text-black opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none" />
                                        </div>
                                        <span className="text-xs font-black uppercase tracking-tighter text-gray-600 dark:text-gray-300 group-hover:text-neon-blue transition-colors">{d}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        <AnimatePresence>
                            {geneProfiles.length > 0 && (
                                <motion.div 
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="p-5 bg-neon-blue/5 rounded-2xl border border-neon-blue/20 overflow-hidden shadow-inner text-left"
                                >
                                    <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-neon-blue mb-4 flex items-center gap-2">
                                        <Activity className="h-3 w-3" /> Detected Genomic Biomarkers
                                    </h4>
                                    <div className="flex flex-wrap gap-2.5">
                                        {geneProfiles.map(gp => (
                                            <span key={gp.id} className="text-[9px] font-black px-3 py-1.5 bg-white/50 dark:bg-black/60 rounded-lg border border-neon-blue/20 text-neon-blue uppercase shadow-sm">
                                                {gp.gene_name} · <span className="text-white">{gp.variant}</span>
                                            </span>
                                        ))}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <Button
                            onClick={handleAnalyze}
                            disabled={loading || !selectedPatient || selectedDrugs.length === 0}
                            className="w-full bg-neon-blue hover:bg-neon-blue shadow-[0_0_40px_rgba(0,240,255,0.25)] hover:shadow-[0_0_60px_rgba(0,240,255,0.4)] text-black font-black h-16 rounded-2xl active:scale-[0.97] transition-all group relative overflow-hidden"
                        >
                            {loading ? (
                                <div className="flex items-center gap-4">
                                    <RefreshCw className="animate-spin h-6 w-6 stroke-[3px]" />
                                    <span className="tracking-tighter">ANALYZING GENOMIC COMPATIBILITY...</span>
                                </div>
                            ) : (
                                <div className="flex items-center gap-3">
                                    <span className="text-lg tracking-[-0.02em]">RUN SYSTEM DIAGNOSTIC</span>
                                    <Search className="h-5 w-5 stroke-[3px] group-hover:translate-x-2 transition-transform duration-300" />
                                </div>
                            )}
                            <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 pointer-events-none" />
                        </Button>
                    </GlassCard>
                </motion.div>

                {/* Results Display Area (Right) */}
                <motion.div variants={fadeInUp} className="lg:col-span-8">
                    <GlassCard className="p-10 sm:p-14 flex flex-col min-h-[700px] relative overflow-hidden backdrop-blur-3xl border-white/[0.03]">
                        {/* High-fidelity Scanning Overlay */}
                        {loading && (
                            <div className="absolute inset-0 z-40 pointer-events-none overflow-hidden rounded-3xl">
                                <motion.div 
                                    initial={{ top: '-10%' }}
                                    animate={{ top: '110%' }}
                                    transition={{ repeat: Infinity, duration: 2.5, ease: "linear" }}
                                    className="absolute left-0 w-full h-[15%] bg-gradient-to-b from-transparent via-neon-blue/30 to-transparent border-y border-neon-blue/40 shadow-[0_0_40px_rgba(0,240,255,0.2)]"
                                />
                                <div className="absolute inset-0 bg-black/40 backdrop-blur-[3px] animate-pulse" />
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="flex flex-col items-center gap-6">
                                        <div className="relative">
                                            <RefreshCw className="h-20 w-20 text-neon-blue animate-spin-slow opacity-20" />
                                            <Activity className="absolute inset-0 m-auto h-8 w-8 text-neon-blue animate-pulse" />
                                        </div>
                                        <p className="text-neon-blue font-black tracking-[0.6em] text-xs uppercase animate-pulse">Scanning Bio-Data</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {analysisResults.length === 0 ? (
                            <div className="flex-1 flex flex-col items-center justify-center text-center">
                                <motion.div 
                                    animate={{ rotate: 360 }}
                                    transition={{ repeat: Infinity, duration: 40, ease: 'linear' }}
                                    className="p-16 border-4 border-dashed border-gray-100 dark:border-white/[0.03] rounded-full mb-10 relative group"
                                >
                                    <Search className="h-24 w-24 text-gray-200 dark:text-white/5 transition-colors group-hover:text-neon-blue" />
                                    <div className="absolute inset-0 border-4 border-neon-blue/10 rounded-full animate-ping opacity-20" />
                                    <div className="absolute -inset-10 bg-neon-blue/5 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
                                </motion.div>
                                <h3 className="text-3xl sm:text-4xl font-black text-gray-900 dark:text-white uppercase tracking-tighter mb-5">Diagnostics Terminal Ready</h3>
                                <p className="max-w-xl text-gray-400 dark:text-gray-500 font-bold uppercase tracking-widest text-xs leading-relaxed opacity-60">System Standby. Initiate clinical subject referencing to trigger pharmacogenomic analysis protocols.</p>
                            </div>
                        ) : (
                            <div className="w-full space-y-12">
                                {/* Aggregate Risk Visualization */}
                                <motion.div 
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="flex flex-col items-center py-6"
                                >
                                    <p className="text-[11px] font-black text-neon-blue uppercase tracking-[0.5em] mb-10 opacity-70">Aggregate Clinical Safety Index</p>
                                    <div className="relative group">
                                        {/* Dynamic Glow Aura */}
                                        <div className={cn("absolute -inset-24 blur-[100px] opacity-15 transition-colors duration-1000 rounded-full", 
                                            analysisResults.some(r => r.risk_level === 'High') ? 'bg-neon-red shadow-[0_0_100px_hsla(var(--neon-red),0.2)]' :
                                            analysisResults.some(r => r.risk_level === 'Moderate') ? 'bg-neon-amber shadow-[0_0_100px_hsla(var(--neon-amber),0.2)]' : 
                                            'bg-neon-green shadow-[0_0_100px_hsla(var(--neon-green),0.2)]'
                                        )} />
                                        
                                        <RiskMeter riskLevel={
                                            analysisResults.some(r => r.risk_level === 'High') ? 'High' :
                                            analysisResults.some(r => r.risk_level === 'Moderate') ? 'Moderate' : 
                                            'Low'
                                        } />
                                    </div>
                                </motion.div>

                                {/* Detailed Interaction Results */}
                                <motion.div 
                                    variants={staggerContainer} 
                                    className="space-y-6 max-h-[600px] overflow-y-auto pr-4 custom-scrollbar px-2"
                                >
                                    <div className="flex items-center gap-4 mb-6 sticky top-0 bg-background/80 backdrop-blur-md z-10 py-2">
                                        <span className="h-px flex-1 bg-white/5" />
                                        <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.4em]">Substance Analysis Logs</h4>
                                        <span className="h-px flex-1 bg-white/5" />
                                    </div>

                                    {analysisResults.map((res, idx) => (
                                        <motion.div 
                                            key={idx} 
                                            variants={fadeInUp}
                                            className="p-8 rounded-3xl bg-white/40 dark:bg-black/50 border border-gray-100 dark:border-white/[0.05] flex items-start gap-8 transition-all hover:border-white/10 hover:bg-white/60 dark:hover:bg-white/[0.05] shadow-sm relative overflow-hidden group/card text-left"
                                        >
                                            {/* Status indicator on the left edge */}
                                            <div className={cn("absolute left-0 top-0 bottom-0 w-2 transition-all duration-700", 
                                                res.risk_level === 'High' ? 'bg-neon-red shadow-[8px_0_30px_hsla(var(--neon-red),0.3)]' :
                                                res.risk_level === 'Moderate' ? 'bg-neon-amber shadow-[8px_0_30px_hsla(var(--neon-amber),0.3)]' :
                                                'bg-neon-green shadow-[8px_0_30px_hsla(var(--neon-green),0.3)]'
                                            )} />

                                            <div className="flex-1">
                                                <div className="flex justify-between items-start mb-5">
                                                    <div>
                                                        <h4 className="font-black text-gray-900 dark:text-white text-3xl uppercase tracking-tighter leading-none group-hover/card:text-neon-blue transition-colors">{res.drug_name}</h4>
                                                        <div className="flex items-center gap-2 mt-2">
                                                            <div className="h-1.5 w-1.5 rounded-full bg-neon-blue/40" />
                                                            <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest leading-none">Diagnostic Result ID: {Math.random().toString(36).substring(7).toUpperCase()}</p>
                                                        </div>
                                                    </div>
                                                    <div className={cn("text-[9px] font-black uppercase tracking-[0.2em] px-4 py-1.5 rounded-full border transition-all duration-700 shadow-sm", 
                                                        res.risk_level === 'High' ? 'border-neon-red/30 text-neon-red bg-neon-red/10' :
                                                        res.risk_level === 'Moderate' ? 'border-neon-amber/30 text-neon-amber bg-neon-amber/10' :
                                                        'border-neon-green/30 text-neon-green bg-neon-green/10'
                                                    )}>
                                                        {res.risk_level} INTERACTION SEVERITY
                                                    </div>
                                                </div>
                                                
                                                <div className="p-6 rounded-2xl bg-gray-500/5 dark:bg-black/40 border border-white/5 mb-6 relative group/inner">
                                                    <div className="absolute left-0 top-0 p-2 opacity-5 group-hover/inner:opacity-20 transition-opacity">
                                                        <AlertCircle className="h-8 w-8" />
                                                    </div>
                                                    <p className="text-base font-bold text-gray-600 dark:text-gray-300 leading-relaxed italic relative z-10">
                                                        "{res.explanation}"
                                                    </p>
                                                </div>
                                                
                                                {res.alternative_drug && res.alternative_drug !== 'None' && (
                                                    <motion.div 
                                                        initial={{ opacity: 0, x: -10 }}
                                                        animate={{ opacity: 1, x: 0 }}
                                                        className="inline-flex items-center gap-4 px-5 py-2.5 bg-neon-blue/10 rounded-2xl border border-neon-blue/20 group/btn cursor-pointer overflow-hidden relative shadow-sm"
                                                    >
                                                        <div className="absolute inset-0 bg-neon-blue/5 translate-x-[-100%] group-hover/btn:translate-x-0 transition-transform duration-700" />
                                                        <CheckCircle className="h-5 w-5 text-neon-blue stroke-[3px] relative z-10" />
                                                        <span className="text-[11px] font-black uppercase text-neon-blue tracking-widest relative z-10">AI Optimization: {res.alternative_drug}</span>
                                                    </motion.div>
                                                )}
                                            </div>
                                        </motion.div>
                                    ))}
                                </motion.div>

                                {/* Predictive Simulation Terminal */}
                                <motion.div 
                                    variants={fadeInUp}
                                    className="p-10 rounded-[32px] bg-neon-purple/[0.02] border-2 border-neon-purple/20 relative overflow-hidden group shadow-2xl text-left"
                                >
                                    <div className="absolute bottom-[-30px] right-[-30px] opacity-[0.03] group-hover:scale-110 transition-transform duration-1000 group-hover:rotate-12">
                                        <RefreshCw className="h-64 w-64 text-neon-purple" />
                                    </div>

                                    <div className="flex items-center justify-between mb-8 border-b-2 border-neon-purple/10 pb-6 relative z-10">
                                        <div className="flex items-center gap-4">
                                            <div className="p-3 bg-neon-purple/20 rounded-xl shadow-[0_0_20px_rgba(168,85,247,0.2)]">
                                                <RefreshCw className="h-5 w-5 text-neon-purple animate-spin-slow" />
                                            </div>
                                            <div>
                                                <h3 className="font-black text-neon-purple uppercase tracking-[0.3em] text-sm">Genomic Variance Simulator</h3>
                                                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-1 italic">Real-time Predictive Planning</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="h-1.5 w-1.5 rounded-full bg-neon-purple animate-pulse" />
                                            <span className="text-[9px] font-black text-neon-purple/60 uppercase tracking-widest">Baseline Active</span>
                                        </div>
                                    </div>

                                    {selectedGeneProfile ? (
                                        <div className="space-y-8 relative z-10 px-2">
                                            <div className="grid sm:grid-cols-2 gap-10 items-end">
                                                <div className="space-y-4">
                                                    <Label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.4em] mb-2 block">Modify {selectedGeneProfile.gene_name} Variant Target</Label>
                                                    <div className="relative group/var">
                                                        <select
                                                            className="w-full bg-white dark:bg-black/60 border-2 border-neon-purple/30 rounded-2xl px-6 py-4 text-gray-900 dark:text-white font-mono text-base outline-none focus:ring-4 focus:ring-neon-purple/10 focus:border-neon-purple transition-all font-black appearance-none cursor-pointer"
                                                            value={selectedGeneProfile.variant}
                                                            onChange={(e) => updateVariant(e.target.value)}
                                                        >
                                                            {['*1/*1', '*1/*2', '*2/*2', '*17/*17'].map(v => (
                                                                <option key={v} value={v} className="text-gray-900 dark:text-white bg-white dark:bg-gray-950">{v}</option>
                                                            ))}
                                                        </select>
                                                        <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-neon-purple group-hover/var:scale-110 transition-transform" />
                                                    </div>
                                                </div>
                                                <div className="p-6 rounded-2xl bg-neon-purple/5 border-2 border-neon-purple/10 shadow-inner">
                                                    <p className="text-[11px] font-black text-neon-purple/80 italic leading-relaxed uppercase tracking-tighter">
                                                        Note: Injecting simulated genomic variants triggers a cascade update across the clinical safety index to provide predictive insights for prophylactic substance management.
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center justify-center py-12 gap-4 border-2 border-dashed border-neon-purple/10 rounded-3xl">
                                            <p className="text-xs font-black text-gray-400 uppercase tracking-[0.5em] italic">Reference a subject to unlock simulation baseline</p>
                                            <Activity className="h-6 w-6 text-neon-purple/20 animate-pulse" />
                                        </div>
                                    )}
                                </motion.div>
                            </div>
                        )}
                    </GlassCard>
                </motion.div>
            </div>
        </motion.div>
    );
};

// Add missing icon components
const ChevronDown = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="m6 9 6 6 6-6"/></svg>
);

const UsersIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M17 11a4 4 0 0 1 0-7.75"/></svg>
);

export default AnalysisPage;
