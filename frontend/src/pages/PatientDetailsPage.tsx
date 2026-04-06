import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/services/supabase';
import { Button } from '@/components/ui/button';
import GlassCard from '@/components/ui/GlassCard';
import { ArrowLeft, User, Dna, FileText, Activity, Pill, Download, Calendar } from 'lucide-react';
import { generatePDF } from '@/services/pdfService';
import { motion } from 'framer-motion';

const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] }
};

const staggerContainer = {
    animate: {
        transition: {
            staggerChildren: 0.1
        }
    }
};

const PatientDetailsPage = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [patient, setPatient] = useState<any>(null);
    const [genes, setGenes] = useState<any[]>([]);
    const [analyses, setAnalyses] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (id) fetchPatientDetails();
    }, [id]);

    const fetchPatientDetails = async () => {
        try {
            const { data: patientData, error: patientError } = await supabase
                .from('patients')
                .select('*')
                .eq('id', id)
                .single();

            if (patientError) throw patientError;
            setPatient(patientData);

            const { data: geneData } = await supabase
                .from('gene_profiles')
                .select('*')
                .eq('patient_id', id);

            if (geneData) setGenes(geneData);

            const { data: analysisData } = await supabase
                .from('analyses')
                .select('*')
                .eq('patient_id', id)
                .order('created_at', { ascending: false });

            if (analysisData) setAnalyses(analysisData);

        } catch (error) {
            console.error('Error fetching details:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center p-20 gap-4">
            <div className="h-12 w-12 border-4 border-neon-blue/30 border-t-neon-blue rounded-full animate-spin" />
            <p className="text-gray-400 font-black uppercase tracking-widest text-xs">Accessing Medical Records...</p>
        </div>
    );
    
    if (!patient) return (
        <div className="text-center p-20">
            <h2 className="text-2xl font-black text-red-500 uppercase">Patient Record Missing</h2>
            <Button onClick={() => navigate('/patients')} className="mt-4 border border-red-500/20 hover:bg-red-500/10">Return to Registry</Button>
        </div>
    );

    return (
        <motion.div 
            className="space-y-6 sm:space-y-8 max-w-5xl mx-auto"
            initial="initial"
            animate="animate"
            variants={staggerContainer}
        >
            <motion.div variants={fadeInUp} className="flex justify-between items-center">
                <Button 
                    variant="ghost" 
                    className="text-gray-500 hover:text-neon-blue hover:bg-neon-blue/10 font-bold text-[10px] uppercase tracking-widest" 
                    onClick={() => navigate('/patients')}
                >
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back to Registry
                </Button>
                <Button 
                    onClick={() => generatePDF('clinical-report', `PharmaGuard_Report_${patient.name.replace(/\s+/g, '_')}`)}
                    className="bg-neon-blue hover:bg-neon-blue/80 text-black font-black flex items-center gap-2 px-6 shadow-[0_0_20px_rgba(0,240,255,0.2)]"
                >
                    <Download className="h-4 w-4 stroke-[3px]" /> EXPORT CLINICAL REPORT
                </Button>
            </motion.div>

            <div id="clinical-report" className="space-y-6 sm:space-y-8">
                {/* PDF Header */}
                <div className="hidden pdf-only flex justify-between items-center border-b-4 border-neon-blue pb-6 mb-8">
                    <div>
                        <h2 className="text-3xl font-black text-gray-900 uppercase tracking-tighter">PharmaGuard<span className="text-neon-blue">X</span></h2>
                        <p className="text-gray-500 font-bold text-xs">PRECISION CLINICAL DECISION SUPPORT</p>
                    </div>
                    <div className="text-right">
                        <p className="text-xs font-black uppercase text-gray-400">Restricted Medical Data</p>
                        <p className="text-[10px] font-mono text-gray-400">REF_{id?.split('-')[0]}_{Date.now()}</p>
                    </div>
                </div>

                {/* Identity Section */}
                <motion.div variants={fadeInUp}>
                    <GlassCard className="p-6 sm:p-10 border-l-8 border-neon-blue bg-neon-blue/[0.02] relative overflow-hidden group">
                        <div className="absolute right-[-20px] top-[-20px] opacity-5 group-hover:scale-110 transition-transform duration-700">
                            <User className="h-40 w-40 text-neon-blue" />
                        </div>
                        <div className="relative z-10 flex flex-col sm:flex-row sm:items-end justify-between gap-6">
                            <div>
                                <p className="text-[10px] font-black text-neon-blue uppercase tracking-[0.2em] mb-2">Subject Identity</p>
                                <h1 className="text-3xl sm:text-5xl font-black text-gray-900 dark:text-white tracking-tighter uppercase">{patient.name}</h1>
                                <div className="flex items-center gap-4 mt-4 text-gray-500 dark:text-gray-400 font-bold text-sm">
                                    <span className="flex items-center gap-1.5"><User className="h-4 w-4 text-neon-blue" /> {patient.age} YRS</span>
                                    <span className="h-1 w-1 rounded-full bg-gray-300" />
                                    <span className="uppercase">{patient.gender}</span>
                                </div>
                            </div>
                            <div className="sm:text-right border-t sm:border-t-0 sm:border-l border-gray-100 dark:border-white/10 pt-4 sm:pt-0 sm:pl-8">
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Target Pharmacology</p>
                                <p className="text-2xl font-black text-neon-green uppercase tracking-tight">{patient.prescribed_drug || 'PENDING'}</p>
                            </div>
                        </div>
                    </GlassCard>
                </motion.div>

                <div className="grid gap-6 sm:gap-8 md:grid-cols-2">
                    {/* Clinical Profile */}
                    <motion.div variants={fadeInUp}>
                        <GlassCard className="p-6 h-full border-t-2 border-gray-100 dark:border-white/5 hover:border-neon-blue/30 transition-colors">
                            <div className="flex items-center gap-3 mb-6 border-b border-gray-100 dark:border-white/10 pb-4">
                                <div className="p-2 bg-neon-blue/10 rounded-lg">
                                    <Activity className="h-5 w-5 text-neon-blue" />
                                </div>
                                <h2 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-widest">Clinical Parameters</h2>
                            </div>
                            <div className="space-y-6">
                                <div>
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Primary Diagnosis</p>
                                    <p className="text-sm font-bold text-gray-900 dark:text-white bg-gray-50 dark:bg-white/5 p-3 rounded-xl border border-gray-100 dark:border-white/5">{patient.condition || 'GENERAL OBSERVATION'}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Historical Context</p>
                                    <p className="text-xs font-medium text-gray-600 dark:text-gray-400 leading-relaxed italic">{patient.medical_history || 'No established clinical history in database.'}</p>
                                </div>
                            </div>
                        </GlassCard>
                    </motion.div>

                    {/* Genetic Architecture */}
                    <motion.div variants={fadeInUp}>
                        <GlassCard className="p-6 h-full border-t-2 border-gray-100 dark:border-white/5 hover:border-neon-purple/30 transition-colors">
                            <div className="flex items-center gap-3 mb-6 border-b border-gray-100 dark:border-white/10 pb-4">
                                <div className="p-2 bg-neon-purple/10 rounded-lg">
                                    <Dna className="h-5 w-5 text-neon-purple" />
                                </div>
                                <h2 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-widest">Genomic Profile</h2>
                            </div>
                            {genes.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-10 opacity-30 gap-2">
                                    <Dna className="h-8 w-8" />
                                    <p className="text-xs font-bold uppercase italic">Awaiting sequencing...</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {genes.map(gene => (
                                        <div key={gene.id} className="flex justify-between items-center p-3 rounded-xl bg-neon-purple/[0.03] border border-neon-purple/10 group hover:border-neon-purple/30 transition-all">
                                            <div>
                                                <span className="text-xs font-black text-neon-purple uppercase tracking-tighter">{gene.gene_name}</span>
                                                <span className="block text-[10px] font-bold text-gray-500 uppercase">{gene.metabolizer_type}</span>
                                            </div>
                                            <div className="text-right">
                                                <span className="text-xs font-black text-gray-900 dark:text-white font-mono">{gene.variant}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </GlassCard>
                    </motion.div>
                </div>

                {/* Analysis Archive */}
                <motion.div variants={fadeInUp}>
                    <GlassCard className="p-6 sm:p-8">
                        <div className="flex items-center gap-3 mb-8">
                            <div className="p-2 bg-neon-green/10 rounded-lg">
                                <FileText className="h-5 w-5 text-neon-green" />
                            </div>
                            <h2 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-widest">Pharmacogenomic Insights</h2>
                        </div>

                        <div className="space-y-4">
                            {analyses.length === 0 ? (
                                <p className="text-gray-400 text-center py-12 italic text-sm font-medium">No prior risk assessments found for this profile.</p>
                            ) : (
                                analyses.map((analysis, i) => (
                                    <motion.div 
                                        key={analysis.id}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.5 + i * 0.1 }}
                                        className="p-5 rounded-2xl bg-white/50 dark:bg-black/20 border border-gray-100 dark:border-white/10 hover:border-gray-300 dark:hover:border-white/20 transition-all group shadow-sm"
                                    >
                                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-4">
                                            <div className="flex items-center gap-3">
                                                <div className="h-8 w-8 rounded-full bg-gray-100 dark:bg-white/5 flex items-center justify-center">
                                                    <Pill className="h-4 w-4 text-gray-400" />
                                                </div>
                                                <h3 className="font-black text-gray-900 dark:text-white uppercase tracking-tight">{analysis.drug_name}</h3>
                                            </div>
                                            <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border shadow-sm ${
                                                analysis.risk_level === 'High' ? 'bg-red-500/10 text-red-600 border-red-500/20' :
                                                analysis.risk_level === 'Moderate' ? 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20' :
                                                'bg-green-500/10 text-green-600 border-green-500/20'
                                            }`}>
                                                {analysis.risk_level} SEVERITY
                                            </div>
                                        </div>
                                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400 leading-relaxed mb-4 bg-gray-50/50 dark:bg-white/5 p-4 rounded-xl border border-gray-100 dark:border-white/5">
                                            {analysis.explanation}
                                        </p>
                                        <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-gray-400">
                                            <div className="flex items-center gap-2">
                                                <Calendar className="h-3 w-3" />
                                                <span>STAMPED: {new Date(analysis.created_at).toLocaleDateString()}</span>
                                            </div>
                                            {analysis.alternative_drug && (
                                                <div className="flex items-center gap-2 text-neon-green">
                                                    <Activity className="h-3 w-3" />
                                                    <span>REC ALT: {analysis.alternative_drug}</span>
                                                </div>
                                            )}
                                        </div>
                                    </motion.div>
                                ))
                            )}
                        </div>
                    </GlassCard>
                </motion.div>
            </div>
        </motion.div>
    );
};

export default PatientDetailsPage;
