import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/services/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import GlassCard from '@/components/ui/GlassCard';
import { Textarea } from '@/components/ui/textarea';
import { UserPlus, Save, X } from 'lucide-react';

const AddPatientPage = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        age: '',
        gender: '',
        medical_history: '',
        condition: '',        // New
        prescribed_drug: ''   // New
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
            // Get doctor_id from session user
            const user = session?.user;

            const response = await fetch('http://localhost:3000/patients', {
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
        <div className="max-w-3xl mx-auto">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-6 sm:mb-8">
                <div className="p-3 bg-neon-blue/10 dark:bg-neon-blue/20 rounded-xl self-start">
                    <UserPlus className="h-7 w-7 sm:h-8 sm:w-8 text-neon-blue" />
                </div>
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white tracking-tight">Register New Patient</h1>
                    <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400">Enter patient demographics and clinical details.</p>
                </div>
            </div>

            <GlassCard className="p-5 sm:p-8">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="name" className="text-gray-700 dark:text-gray-300">Full Name</Label>
                            <Input
                                id="name"
                                required
                                value={formData.name}
                                onChange={handleChange}
                                className="bg-white dark:bg-white/5 border-gray-300 dark:border-white/10 text-gray-900 dark:text-white focus:border-neon-blue placeholder:text-gray-400 dark:placeholder:text-gray-500"
                                placeholder="Jane Doe"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-3 sm:gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="age" className="text-gray-700 dark:text-gray-300">Age</Label>
                                <Input
                                    id="age"
                                    type="number"
                                    required
                                    value={formData.age}
                                    onChange={handleChange}
                                    className="bg-white dark:bg-white/5 border-gray-300 dark:border-white/10 text-gray-900 dark:text-white focus:border-neon-blue placeholder:text-gray-400 dark:placeholder:text-gray-500"
                                    placeholder="45"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="gender" className="text-gray-700 dark:text-gray-300">Gender</Label>
                                <select
                                    id="gender"
                                    required
                                    value={formData.gender}
                                    onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                                    className="w-full bg-white dark:bg-white/5 border border-gray-300 dark:border-white/10 rounded-md p-2 text-gray-900 dark:text-white focus:border-neon-blue outline-none h-10"
                                >
                                    <option value="" className="text-gray-500">Select Gender</option>
                                    <option value="Male" className="text-gray-900 dark:text-white bg-white dark:bg-gray-900">Male</option>
                                    <option value="Female" className="text-gray-900 dark:text-white bg-white dark:bg-gray-900">Female</option>
                                    <option value="Other" className="text-gray-900 dark:text-white bg-white dark:bg-gray-900">Other</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="condition" className="text-gray-700 dark:text-gray-300">Medical Condition (Diagnosis)</Label>
                        <Input
                            id="condition"
                            required
                            value={formData.condition}
                            onChange={handleChange}
                            className="bg-white dark:bg-white/5 border-gray-300 dark:border-white/10 text-gray-900 dark:text-white focus:border-neon-green placeholder:text-gray-400 dark:placeholder:text-gray-500"
                            placeholder="e.g. Acute Coronary Syndrome"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="prescribed_drug" className="text-gray-700 dark:text-gray-300">Target Drug</Label>
                        <Input
                            id="prescribed_drug"
                            required
                            value={formData.prescribed_drug}
                            onChange={handleChange}
                            className="bg-white dark:bg-white/5 border-gray-300 dark:border-white/10 text-gray-900 dark:text-white focus:border-neon-green placeholder:text-gray-400 dark:placeholder:text-gray-500"
                            placeholder="e.g. Clopidogrel"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="medical_history" className="text-gray-700 dark:text-gray-300">Medical History</Label>
                        <Textarea
                            id="medical_history"
                            value={formData.medical_history}
                            onChange={handleChange}
                            className="bg-white dark:bg-white/5 border-gray-300 dark:border-white/10 text-gray-900 dark:text-white focus:border-neon-blue min-h-[100px] placeholder:text-gray-400 dark:placeholder:text-gray-500"
                            placeholder="Previous diagnoses, allergies, etc."
                        />
                    </div>

                    <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 pt-4 border-t border-gray-200 dark:border-white/10">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => navigate('/patients')}
                            className="border-gray-200 dark:border-white/20 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white w-full sm:w-auto"
                        >
                            <X className="mr-2 h-4 w-4" /> Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={loading}
                            className="bg-neon-blue hover:bg-neon-blue/80 text-black font-bold w-full sm:w-auto"
                        >
                            {loading ? 'Saving...' : <><Save className="mr-2 h-4 w-4" /> Save Patient Profile</>}
                        </Button>
                    </div>
                </form>
            </GlassCard>
        </div>
    );
};

export default AddPatientPage;
