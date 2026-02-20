import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/services/supabase';
import { Button } from '@/components/ui/button';
import GlassCard from '@/components/ui/GlassCard';
import { ArrowLeft, User, Dna, FileText, Activity, Pill } from 'lucide-react';

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
            // Fetch Patient Info
            const { data: patientData, error: patientError } = await supabase
                .from('patients')
                .select('*')
                .eq('id', id)
                .single();

            if (patientError) throw patientError;
            setPatient(patientData);

            // Fetch Gene Profiles
            const { data: geneData } = await supabase
                .from('gene_profiles')
                .select('*')
                .eq('patient_id', id);

            if (geneData) setGenes(geneData);

            // Fetch Analysis History
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

    if (loading) return <div className="text-center text-gray-500 dark:text-white p-10">Loading patient details...</div>;
    if (!patient) return <div className="text-center text-red-500 p-10">Patient not found</div>;

    return (
        <div className="space-y-5 sm:space-y-6 max-w-5xl mx-auto">
            <Button variant="ghost" className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-2" onClick={() => navigate('/patients')}>
                <ArrowLeft className="mr-2 h-4 w-4" /> Back to List
            </Button>

            {/* Header Section */}
            <GlassCard className="p-5 sm:p-8 border-l-4 border-neon-blue">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div>
                        <h1 className="text-2xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-2">{patient.name}</h1>
                        <div className="flex flex-wrap gap-3 text-gray-600 dark:text-gray-300">
                            <span className="flex items-center gap-1"><User className="h-4 w-4" /> {patient.age} years</span>
                            <span>•</span>
                            <span>{patient.gender}</span>
                        </div>
                    </div>
                    <div className="sm:text-right">
                        <p className="text-xs text-gray-500 uppercase tracking-widest">Target Drug</p>
                        <p className="text-xl font-mono text-neon-blue dark:text-neon-green">{patient.prescribed_drug || 'N/A'}</p>
                    </div>
                </div>
            </GlassCard>

            <div className="grid gap-6 md:grid-cols-2">
                {/* Clinical Info */}
                <GlassCard className="p-6">
                    <div className="flex items-center gap-2 mb-4 border-b border-gray-200 dark:border-white/10 pb-2">
                        <Activity className="h-5 w-5 text-neon-blue" />
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Clinical Information</h2>
                    </div>
                    <div className="space-y-4">
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Diagnosis / Condition</p>
                            <p className="text-gray-900 dark:text-white">{patient.condition || 'Not specified'}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Medical History</p>
                            <p className="text-gray-700 dark:text-white/80 text-sm leading-relaxed">{patient.medical_history || 'No history recorded.'}</p>
                        </div>
                    </div>
                </GlassCard>

                {/* Genetic Profile */}
                <GlassCard className="p-6">
                    <div className="flex items-center gap-2 mb-4 border-b border-gray-200 dark:border-white/10 pb-2">
                        <Dna className="h-5 w-5 text-neon-purple" />
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Genetic Profile</h2>
                    </div>
                    {genes.length === 0 ? (
                        <p className="text-gray-500 italic">No genetic data available.</p>
                    ) : (
                        <div className="space-y-3">
                            {genes.map(gene => (
                                <div key={gene.id} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-white/5 rounded-lg border border-gray-100 dark:border-white/5">
                                    <span className="font-mono text-neon-purple font-bold">{gene.gene_name}</span>
                                    <div className="text-right">
                                        <span className="block text-gray-900 dark:text-white font-medium">{gene.variant}</span>
                                        <span className="text-xs text-gray-500 dark:text-gray-400">{gene.metabolizer_type}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </GlassCard>
            </div>

            {/* Analysis History */}
            <GlassCard className="p-5 sm:p-6">
                <div className="flex items-center gap-2 mb-4">
                    <FileText className="h-5 w-5 text-neon-green" />
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Risk Analysis History</h2>
                </div>

                <div className="space-y-3 sm:space-y-4">
                    {analyses.length === 0 ? (
                        <p className="text-gray-500 text-center py-4">No analysis reports generated yet.</p>
                    ) : (
                        analyses.map(analysis => (
                            <div key={analysis.id} className="p-4 rounded-lg bg-white dark:bg-black/40 border border-gray-200 dark:border-white/10 hover:border-gray-300 dark:hover:border-white/20 transition-colors shadow-sm">
                                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 mb-2">
                                    <div className="flex items-center gap-2">
                                        <Pill className="h-4 w-4 text-gray-400 flex-shrink-0" />
                                        <span className="font-bold text-gray-900 dark:text-white">{analysis.drug_name}</span>
                                    </div>
                                    <span className={`inline-flex px-2 py-0.5 rounded text-xs font-bold self-start ${analysis.risk_level === 'High' ? 'bg-red-500/20 text-red-600 dark:text-red-400 border border-red-500/50' :
                                        analysis.risk_level === 'Moderate' ? 'bg-yellow-500/20 text-yellow-600 dark:text-yellow-400 border border-yellow-500/50' :
                                            'bg-green-500/20 text-green-600 dark:text-green-400 border border-green-500/50'
                                        }`}>
                                        {analysis.risk_level} Risk
                                    </span>
                                </div>
                                <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">{analysis.explanation}</p>
                                <div className="text-xs text-gray-500 flex flex-wrap justify-between gap-2">
                                    <span>Date: {new Date(analysis.created_at).toLocaleDateString()}</span>
                                    {analysis.alternative_drug && (
                                        <span className="text-neon-green">Alt: {analysis.alternative_drug}</span>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </GlassCard>
        </div>
    );
};

export default PatientDetailsPage;
