import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import GlassCard from '@/components/ui/GlassCard';
import { Dna, ShieldCheck, Activity, BrainCircuit } from 'lucide-react';
import { useState, useEffect } from 'react';

const LandingPage = () => {
    const navigate = useNavigate();
    const [text, setText] = useState('');
    const fullText = "Precision Medicine Powered by AI";

    useEffect(() => {
        let i = 0;
        const typingEffect = setInterval(() => {
            if (i < fullText.length) {
                setText(fullText.slice(0, i + 1));
                i++;
            } else {
                clearInterval(typingEffect);
            }
        }, 100);
        return () => clearInterval(typingEffect);
    }, []);

    return (
        <div className="min-h-screen bg-background text-foreground overflow-hidden relative selection:bg-neon-blue selection:text-black transition-colors duration-300">
            {/* Animated Background Elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[300px] sm:w-[500px] h-[300px] sm:h-[500px] bg-neon-blue/10 dark:bg-neon-blue/20 rounded-full blur-[120px] animate-float" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[300px] sm:w-[500px] h-[300px] sm:h-[500px] bg-neon-green/10 dark:bg-neon-green/20 rounded-full blur-[120px] animate-float" style={{ animationDelay: '2s' }} />
            </div>

            {/* Navbar */}
            <nav className="relative z-10 flex items-center justify-between px-4 sm:px-8 py-4 sm:py-6 max-w-7xl mx-auto">
                <div className="flex items-center gap-2">
                    <Activity className="h-6 w-6 sm:h-8 sm:w-8 text-neon-green" />
                    <span className="text-lg sm:text-2xl font-bold tracking-wider text-gray-900 dark:text-white">
                        PharmaGuard<span className="text-neon-blue">X</span>
                    </span>
                </div>
                <div className="flex gap-2 sm:gap-4">
                    <Button
                        variant="ghost"
                        size="sm"
                        className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/10 text-sm sm:text-base"
                        onClick={() => navigate('/login')}
                    >
                        Login
                    </Button>
                    <Button
                        size="sm"
                        className="bg-neon-blue hover:bg-neon-blue/80 text-black font-bold text-sm sm:text-base"
                        onClick={() => navigate('/register')}
                    >
                        Get Started
                    </Button>
                </div>
            </nav>

            {/* Hero Section */}
            <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-8 pt-10 sm:pt-20 flex flex-col items-center text-center">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8 }}
                    className="mb-6 sm:mb-8 relative"
                >
                    <div className="absolute inset-0 blur-2xl bg-neon-blue/20 rounded-full" />
                    <Dna className="h-20 w-20 sm:h-32 sm:w-32 text-neon-blue relative z-10 animate-spin-slow" />
                </motion.div>

                <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-4 sm:mb-6 tracking-tight text-gray-900 dark:text-white px-2">
                    Future of{' '}
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-neon-blue to-neon-green">
                        Pharmacogenomics
                    </span>
                </h1>

                <h2 className="text-xl sm:text-2xl md:text-3xl font-light text-gray-600 dark:text-gray-300 mb-8 sm:mb-12 h-8 sm:h-12 px-4">
                    {text}<span className="animate-pulse text-neon-blue">|</span>
                </h2>

                <p className="max-w-xl sm:max-w-2xl text-gray-600 dark:text-gray-400 text-base sm:text-lg mb-8 sm:mb-12 leading-relaxed px-4">
                    Verify drug compatibility with your patient's unique genetic profile.
                    Prevent adverse drug reactions with our AI-driven clinical decision support system.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 w-full sm:w-auto px-4">
                    <Button
                        size="lg"
                        className="bg-neon-blue hover:bg-neon-blue/80 text-black font-bold px-6 sm:px-8 py-5 sm:py-6 text-base sm:text-lg rounded-full shadow-[0_0_20px_rgba(0,240,255,0.3)] hover:shadow-[0_0_40px_rgba(0,240,255,0.5)] transition-all duration-300 w-full sm:w-auto"
                        onClick={() => navigate('/register')}
                    >
                        Start Analysis
                    </Button>
                    <Button
                        size="lg"
                        variant="outline"
                        className="border-neon-green text-neon-green hover:bg-neon-green/10 px-6 sm:px-8 py-5 sm:py-6 text-base sm:text-lg rounded-full backdrop-blur-sm w-full sm:w-auto"
                    >
                        Learn More
                    </Button>
                </div>

                {/* Features */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-8 mt-20 sm:mt-32 w-full pb-12">
                    <GlassCard className="flex flex-col items-center text-center p-6 sm:p-8 bg-white/50 dark:bg-white/5 border-gray-200 dark:border-white/10">
                        <BrainCircuit className="h-10 w-10 sm:h-12 sm:w-12 text-neon-purple mb-3 sm:mb-4" />
                        <h3 className="text-lg sm:text-xl font-bold mb-2 text-gray-900 dark:text-white">AI-Powered Analysis</h3>
                        <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">Advanced algorithms match genetic variants to known drug interactions instantly.</p>
                    </GlassCard>
                    <GlassCard className="flex flex-col items-center text-center p-6 sm:p-8 bg-white/50 dark:bg-white/5 border-gray-200 dark:border-white/10">
                        <ShieldCheck className="h-10 w-10 sm:h-12 sm:w-12 text-neon-green mb-3 sm:mb-4" />
                        <h3 className="text-lg sm:text-xl font-bold mb-2 text-gray-900 dark:text-white">Safety First</h3>
                        <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">Prevent adverse reactions before they happen with grade A/B CPIC evidence.</p>
                    </GlassCard>
                    <GlassCard className="flex flex-col items-center text-center p-6 sm:p-8 bg-white/50 dark:bg-white/5 border-gray-200 dark:border-white/10 sm:col-span-2 lg:col-span-1">
                        <Activity className="h-10 w-10 sm:h-12 sm:w-12 text-neon-blue mb-3 sm:mb-4" />
                        <h3 className="text-lg sm:text-xl font-bold mb-2 text-gray-900 dark:text-white">Real-time Reports</h3>
                        <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">Generate comprehensive PDF reports for clinical documentation.</p>
                    </GlassCard>
                </div>
            </main>

            {/* Footer */}
            <footer className="relative z-10 py-8 sm:py-12 border-t border-gray-200 dark:border-white/10 bg-white/50 dark:bg-black/50 backdrop-blur-md">
                <div className="max-w-7xl mx-auto px-4 sm:px-8 text-center">
                    <p className="text-sm sm:text-base text-gray-500 mb-3 sm:mb-4">
                        ⚠️ <span className="font-semibold text-gray-600 dark:text-gray-400">Medical Disclaimer:</span> This system provides AI-assisted recommendations and does not replace licensed medical professionals.
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-600">© 2026 PharmaGuard X. All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;
