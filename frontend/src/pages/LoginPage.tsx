import React, { useState } from 'react';
import { supabase } from '../services/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import GlassCard from '@/components/ui/GlassCard';
import { Link, useNavigate } from 'react-router-dom';
import { Activity, Lock, Mail, KeyRound } from 'lucide-react';

const DEMO_EMAIL = 'abhishekcse5462@gmail.com';
const DEMO_PASSWORD = 'Abhishek@123';

const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            setError(error.message);
        } else {
            navigate('/dashboard');
        }
        setLoading(false);
    };

    return (
        <div className="flex min-h-screen w-full items-center justify-center bg-background relative overflow-hidden transition-colors duration-300">
            {/* Background Effects */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-20%] right-[-20%] w-[800px] h-[800px] bg-neon-blue/10 rounded-full blur-[150px] animate-pulse" />
                <div className="absolute bottom-[-20%] left-[-20%] w-[800px] h-[800px] bg-neon-green/10 rounded-full blur-[150px] animate-pulse" style={{ animationDelay: '2s' }} />
            </div>

            <GlassCard className="w-full max-w-md p-8 relative z-10 bg-white/80 dark:bg-white/5 border-gray-200 dark:border-white/10">
                <div className="flex flex-col items-center mb-8">
                    <Activity className="h-12 w-12 text-neon-blue mb-2" />
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-wide">PharmaGuard<span className="text-neon-blue">X</span></h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-2">Doctor Access Portal</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="email" className="text-gray-700 dark:text-gray-300">Email Address</Label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-2.5 h-5 w-5 text-gray-500" />
                            <Input
                                id="email"
                                type="email"
                                placeholder="doctor@hospital.com"
                                className="pl-10 bg-white dark:bg-black/50 border-gray-300 dark:border-white/10 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-600 focus:border-neon-blue focus:ring-neon-blue/20"
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
                                className="pl-10 bg-white dark:bg-black/50 border-gray-300 dark:border-white/10 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-600 focus:border-neon-blue focus:ring-neon-blue/20"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* ── Demo Credentials ─────────────────────────── */}
                    <div className="rounded-xl border border-neon-blue/30 bg-neon-blue/5 dark:bg-neon-blue/10 p-4">
                        <div className="flex items-center gap-2 mb-3">
                            <KeyRound className="h-4 w-4 text-neon-blue flex-shrink-0" />
                            <span className="text-xs font-semibold text-neon-blue uppercase tracking-widest">Demo Credentials</span>
                        </div>
                        <div className="space-y-1.5 text-sm mb-3">
                            <div className="flex items-center justify-between">
                                <span className="text-gray-500 dark:text-gray-400 text-xs">Email</span>
                                <span className="font-mono text-gray-900 dark:text-white text-xs">{DEMO_EMAIL}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-gray-500 dark:text-gray-400 text-xs">Password</span>
                                <span className="font-mono text-gray-900 dark:text-white text-xs">{DEMO_PASSWORD}</span>
                            </div>
                        </div>
                        <button
                            type="button"
                            onClick={() => { setEmail(DEMO_EMAIL); setPassword(DEMO_PASSWORD); }}
                            className="w-full text-xs font-semibold py-1.5 px-3 rounded-lg bg-neon-blue/20 hover:bg-neon-blue/30 text-neon-blue border border-neon-blue/30 transition-colors"
                        >
                            ↗ Use Demo Credentials
                        </button>
                    </div>

                    {error && <p className="text-sm text-red-500 dark:text-red-400 text-center animate-shake">{error}</p>}

                    <Button
                        className="w-full bg-neon-blue hover:bg-neon-blue/80 text-black font-bold h-11"
                        type="submit"
                        disabled={loading}
                    >
                        {loading ? 'Authenticating...' : 'Secure Login'}
                    </Button>
                </form>

                <div className="mt-6 text-center text-sm">
                    <span className="text-gray-500">New to the system? </span>
                    <Link to="/register" className="text-neon-green hover:underline hover:text-neon-green/80 transition-colors">
                        Request Access
                    </Link>
                </div>
            </GlassCard>
        </div>
    );
};

export default LoginPage;
