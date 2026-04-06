import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/services/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import GlassCard from '@/components/ui/GlassCard';
import { Textarea } from '@/components/ui/textarea';
import { UserPlus, Save, X } from 'lucide-react';
import { motion } from 'framer-motion';

const fadeInUp = {
    initial: { opacity: 0, y: 30 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] }
};

const AddPatientPage = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        age: '',
        gender: '',
        medical_history: '',
        condition: '',
        prescribed_drug: ''
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.id]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const { data: { session } } = await supabase.auth.getSession();
            const token = session?.access_token;
            const user = session?.user;

            const response = await fetch(`${import.meta.env.VITE_API_URL}/patients`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ ...formData, doctor_id: user?.id })
            });

            if (response.ok) {
                navigate('/patients');
            } else {
                alert('Failed to create patient');
            }
        } catch (error) {
            console.error(error);
            alert('Error creating patient');
        } finally {
            setLoading(false);
        }
    };

    return (
        <motion.div 
            className="max-w-3xl mx-auto"
            initial="initial"
            animate="animate"
            variants={fadeInUp}
        >
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-8 sm:mb-10">
                <motion.div 
                    initial={{ scale: 0.8, rotate: -10 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ delay: 0.2, type: 'spring' }}
                    className="p-4 bg-neon-blue/10 dark:bg-neon-blue/20 rounded-2xl self-start border border-neon-blue/20"
                >
                    <UserPlus className="h-8 w-8 text-neon-blue" />
                </motion.div>
                <div>
                    <h1 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white tracking-tight uppercase">Clinical Enrollment</h1>
                    <p className="text-sm sm:text-base font-bold text-gray-400 dark:text-gray-500 mt-1">Specify patient demographics and baseline clinical data.</p>
                </div>
            </div>

            <GlassCard className="p-6 sm:p-10 border-t-4 border-neon-blue shadow-2xl relative overflow-hidden group">
                {/* Decorative scanning line animation */}
                <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-neon-blue to-transparent animate-shimmer opacity-30" />
                
                <form onSubmit={handleSubmit} className="space-y-8 relative z-10">
                    <div className="grid gap-6 sm:gap-8 grid-cols-1 sm:grid-cols-2">
                        <div className="space-y-2.5">
                            <Label htmlFor="name" className="text-xs font-black uppercase tracking-widest text-gray-400">Full Legal Name</Label>
                            <Input
                                id="name"
                                required
                                value={formData.name}
                                onChange={handleChange}
                                className="bg-white/50 dark:bg-white/5 border-gray-200 dark:border-white/10 text-gray-900 dark:text-white focus:ring-2 focus:ring-neon-blue/20 focus:border-neon-blue rounded-xl h-12 transition-all"
                                placeholder="Patient Identifier"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2.5">
                                <Label htmlFor="age" className="text-xs font-black uppercase tracking-widest text-gray-400">Age (YRS)</Label>
                                <Input
                                    id="age"
                                    type="number"
                                    required
                                    value={formData.age}
                                    onChange={handleChange}
                                    className="bg-white/50 dark:bg-white/5 border-gray-200 dark:border-white/10 text-gray-900 dark:text-white focus:ring-2 focus:ring-neon-blue/20 focus:border-neon-blue rounded-xl h-12 transition-all"
                                    placeholder="00"
                                />
                            </div>
                            <div className="space-y-2.5">
                                <Label htmlFor="gender" className="text-xs font-black uppercase tracking-widest text-gray-400">Assigned Gender</Label>
                                <select
                                    id="gender"
                                    required
                                    value={formData.gender}
                                    onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                                    className="w-full bg-white/50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-3 text-gray-900 dark:text-white focus:ring-2 focus:ring-neon-blue/20 focus:border-neon-blue outline-none h-12 font-medium transition-all"
                                >
                                    <option value="">Select</option>
                                    <option value="Male">Male</option>
                                    <option value="Female">Female</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="grid gap-6 sm:gap-8 grid-cols-1 sm:grid-cols-2">
                        <div className="space-y-2.5">
                            <Label htmlFor="condition" className="text-xs font-black uppercase tracking-widest text-neon-green">Primary Diagnosis</Label>
                            <Input
                                id="condition"
                                required
                                value={formData.condition}
                                onChange={handleChange}
                                className="bg-white/50 dark:bg-white/5 border-gray-200 dark:border-white/10 text-gray-900 dark:text-white focus:ring-2 focus:ring-neon-green/20 focus:border-neon-green rounded-xl h-12 transition-all"
                                placeholder="Clinical Condition"
                            />
                        </div>
                        <div className="space-y-2.5">
                            <Label htmlFor="prescribed_drug" className="text-xs font-black uppercase tracking-widest text-neon-green">Initial Target Drug</Label>
                            <Input
                                id="prescribed_drug"
                                required
                                value={formData.prescribed_drug}
                                onChange={handleChange}
                                className="bg-white/50 dark:bg-white/5 border-gray-200 dark:border-white/10 text-gray-900 dark:text-white focus:ring-2 focus:ring-neon-green/20 focus:border-neon-green rounded-xl h-12 transition-all"
                                placeholder="E.g. Warfarin"
                            />
                        </div>
                    </div>

                    <div className="space-y-2.5">
                        <Label htmlFor="medical_history" className="text-xs font-black uppercase tracking-widest text-gray-400">Comprehensive Medical History</Label>
                        <Textarea
                            id="medical_history"
                            value={formData.medical_history}
                            onChange={handleChange}
                            className="bg-white/50 dark:bg-white/5 border-gray-200 dark:border-white/10 text-gray-900 dark:text-white focus:ring-2 focus:ring-neon-blue/20 focus:border-neon-blue rounded-xl min-h-[120px] transition-all p-4 resize-none"
                            placeholder="Document any prior interactions, comorbidities, or allergies..."
                        />
                    </div>

                    <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-4 pt-6 border-t border-gray-100 dark:border-white/5">
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={() => navigate('/patients')}
                            className="text-gray-500 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5 px-8 h-12 font-bold uppercase tracking-widest text-[10px]"
                        >
                            <X className="mr-2 h-4 w-4" /> ABORT SESSION
                        </Button>
                        <Button
                            type="submit"
                            disabled={loading}
                            className="bg-neon-blue hover:bg-neon-blue/80 text-black font-black px-10 h-12 rounded-xl shadow-[0_0_20px_rgba(0,240,255,0.2)]"
                        >
                            {loading ? 'SYNCING...' : <><Save className="mr-2 h-4 w-4" /> COMMIT DATA</>}
                        </Button>
                    </div>
                </form>
            </GlassCard>
        </motion.div>
    );
};

export default AddPatientPage;
