import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/services/supabase';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import GlassCard from '@/components/ui/GlassCard';
import { Dna, Save } from 'lucide-react';


const GENES = ['CYP2C19', 'CYP2D6', 'SLCO1B1', 'VKORC1', 'TPMT', 'CYP3A5'];
const VARIANTS = ['*1/*1', '*1/*2', '*1/*3', '*2/*2', '*2/*3', '*17/*17', '*4/*4', '*5/*5', '-1639G>A'];

// Auto-derive phenotype from variant — keeps gene_profiles data consistent with drug_gene_interactions
const VARIANT_TO_METABOLIZER: Record<string, string> = {
    '*1/*1': 'Normal Metabolizer',
    '*1/*2': 'Intermediate Metabolizer',
    '*1/*3': 'Intermediate Metabolizer',
    '*1/*4': 'Intermediate Metabolizer',
    '*1/*5': 'Low Function',
    '*2/*2': 'Poor Metabolizer',
    '*2/*3': 'Poor Metabolizer',
    '*3/*3': 'Poor Metabolizer',
    '*4/*4': 'Poor Metabolizer',
    '*4/*5': 'Poor Metabolizer',
    '*5/*5': 'Poor Function',
    '*1/*17': 'Rapid Metabolizer',
    '*17/*17': 'Ultrarapid Metabolizer',
    '-1639G>A': 'Increased Sensitivity',
};

const GeneEntryPage = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [patients, setPatients] = useState<any[]>([]);
    const [selectedPatient, setSelectedPatient] = useState('');
    const [geneData, setGeneData] = useState({
        gene_name: '',
        variant: '',
        metabolizer_type: 'Normal Metabolizer'
    });

    // When variant changes, auto-derive the metabolizer_type
    const handleVariantChange = (newVariant: string) => {
        const derived = VARIANT_TO_METABOLIZER[newVariant] || 'Normal Metabolizer';
        setGeneData(prev => ({ ...prev, variant: newVariant, metabolizer_type: derived }));
    };

    useEffect(() => {
        const fetchPatients = async () => {
            const { data } = await supabase.from('patients').select('id, name');
            if (data) setPatients(data);
        };
        fetchPatients();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const { error } = await supabase
                .from('gene_profiles')
                .insert([{
                    patient_id: selectedPatient,
                    gene_name: geneData.gene_name,
                    variant: geneData.variant,
                    metabolizer_type: geneData.metabolizer_type
                }]);

            if (error) throw error;

            // Navigate to Risk Logic (we'll implement this route next)
            // For now back to dashboard or stay here
            alert('Gene Profile Saved!');
            navigate('/analysis'); // Assuming we will update this to show risk
        } catch (error: any) {
            console.error(error);
            alert(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto">
            <div className="flex items-center gap-3 mb-8">
                <div className="p-3 bg-neon-purple/10 dark:bg-neon-purple/20 rounded-xl">
                    <Dna className="h-8 w-8 text-neon-purple" />
                </div>
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">Genetic Profile Entry</h1>
                    <p className="text-gray-500 dark:text-gray-400">Manually input patient genetic data for analysis.</p>
                </div>
            </div>

            <GlassCard className="p-8">
                <form onSubmit={handleSubmit} className="space-y-8">
                    <div className="space-y-2">
                        <Label className="text-gray-700 dark:text-gray-300">Select Patient</Label>
                        <select
                            className="w-full bg-white dark:bg-white/5 border border-gray-300 dark:border-white/10 rounded-md p-2 text-gray-900 dark:text-white focus:border-neon-purple outline-none"
                            value={selectedPatient}
                            onChange={(e) => setSelectedPatient(e.target.value)}
                            required
                        >
                            <option value="" className="text-gray-500">-- Choose Patient --</option>
                            {patients.map(p => (
                                <option key={p.id} value={p.id} className="text-gray-900 dark:text-white bg-white dark:bg-gray-900">{p.name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label className="text-gray-700 dark:text-gray-300">Target Gene</Label>
                            <select
                                className="w-full bg-white dark:bg-white/5 border border-gray-300 dark:border-white/10 rounded-md p-2 text-gray-900 dark:text-white focus:border-neon-purple outline-none"
                                value={geneData.gene_name}
                                onChange={(e) => setGeneData({ ...geneData, gene_name: e.target.value })}
                                required
                            >
                                <option value="" className="text-gray-500">-- Select Gene --</option>
                                {GENES.map(g => <option key={g} value={g} className="text-gray-900 dark:text-white bg-white dark:bg-gray-900">{g}</option>)}
                            </select>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-gray-700 dark:text-gray-300">Detected Variant (Diplotype)</Label>
                            <select
                                className="w-full bg-white dark:bg-white/5 border border-gray-300 dark:border-white/10 rounded-md p-2 text-gray-900 dark:text-white focus:border-neon-purple outline-none"
                                value={geneData.variant}
                                onChange={(e) => handleVariantChange(e.target.value)}
                                required
                            >
                                <option value="" className="text-gray-500">-- Select Variant --</option>
                                {VARIANTS.map(v => <option key={v} value={v} className="text-gray-900 dark:text-white bg-white dark:bg-gray-900">{v}</option>)}
                            </select>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label className="text-gray-700 dark:text-gray-300">Phenotype (Auto-derived from Variant)</Label>
                        <div className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-md p-2 text-gray-600 dark:text-gray-300 text-sm italic">
                            {geneData.metabolizer_type || 'Select a variant to derive phenotype'}
                        </div>
                    </div>

                    <div className="pt-6 border-t border-gray-200 dark:border-white/10 flex justify-end">
                        <Button
                            type="submit"
                            disabled={loading || !selectedPatient || !geneData.gene_name}
                            className="bg-neon-purple hover:bg-neon-purple/80 text-white font-bold px-8"
                        >
                            {loading ? 'Saving...' : <><Save className="mr-2 h-4 w-4" /> Save & Analyze Risk</>}
                        </Button>
                    </div>
                </form>
            </GlassCard>
        </div>
    );
};

export default GeneEntryPage;
