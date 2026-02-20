import React, { useState } from 'react';
import { supabase } from '../services/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import GlassCard from '@/components/ui/GlassCard';
import { Link, useNavigate } from 'react-router-dom';
import { Activity, Lock, Mail, User } from 'lucide-react';

const RegisterPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const { error: signUpError } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        full_name: fullName,
                        role: 'doctor' // Default role for MVP
                    }
                }
            });

            if (signUpError) throw signUpError;

            // Create profile entry
            // Profile creation is now handled by a Database Trigger on auth.users
            // No need to manually insert into 'profiles'


            alert('Registration successful! Please check your email for verification.');
            navigate('/login');
        } catch (error: any) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen w-full items-center justify-center bg-background relative overflow-hidden transition-colors duration-300">
            {/* Background Effects */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-20%] left-[-20%] w-[800px] h-[800px] bg-neon-blue/10 rounded-full blur-[150px] animate-pulse" />
                <div className="absolute bottom-[-20%] right-[-20%] w-[800px] h-[800px] bg-neon-green/10 rounded-full blur-[150px] animate-pulse" style={{ animationDelay: '2s' }} />
            </div>

            <GlassCard className="w-full max-w-md p-8 relative z-10 bg-white/80 dark:bg-white/5 border-gray-200 dark:border-white/10">
                <div className="flex flex-col items-center mb-8">
                    <Activity className="h-10 w-10 text-neon-green mb-2" />
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Join PharmaGuard<span className="text-neon-green">X</span></h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">Create Doctor Account</p>
                </div>

                <form onSubmit={handleRegister} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="fullName" className="text-gray-700 dark:text-gray-300">Full Name</Label>
                        <div className="relative">
                            <User className="absolute left-3 top-2.5 h-5 w-5 text-gray-500" />
                            <Input
                                id="fullName"
                                type="text"
                                placeholder="Dr. John Doe"
                                className="pl-10 bg-white dark:bg-black/50 border-gray-300 dark:border-white/10 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-600 focus:border-neon-green focus:ring-neon-green/20"
                                required
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="email" className="text-gray-700 dark:text-gray-300">Email Address</Label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-2.5 h-5 w-5 text-gray-500" />
                            <Input
                                id="email"
                                type="email"
                                placeholder="doctor@hospital.com"
                                className="pl-10 bg-white dark:bg-black/50 border-gray-300 dark:border-white/10 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-600 focus:border-neon-green focus:ring-neon-green/20"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="password" className="text-gray-700 dark:text-gray-300">Password</Label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-2.5 h-5 w-5 text-gray-500" />
                            <Input
                                id="password"
                                type="password"
                                className="pl-10 bg-white dark:bg-black/50 border-gray-300 dark:border-white/10 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-600 focus:border-neon-green focus:ring-neon-green/20"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                    </div>

                    {error && <p className="text-sm text-red-500 dark:text-red-400 text-center">{error}</p>}

                    <Button
                        className="w-full bg-neon-green hover:bg-neon-green/80 text-black font-bold h-11 mt-2"
                        type="submit"
                        disabled={loading}
                    >
                        {loading ? 'Creating Account...' : 'Register'}
                    </Button>
                </form>

                <div className="mt-6 text-center text-sm">
                    <span className="text-gray-500">Already have an account? </span>
                    <Link to="/login" className="text-neon-blue hover:underline hover:text-neon-blue/80 transition-colors">
                        Sign in
                    </Link>
                </div>
            </GlassCard>
        </div>
    );
};

export default RegisterPage;
