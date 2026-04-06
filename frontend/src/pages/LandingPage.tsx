import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import GlassCard from '@/components/ui/GlassCard';
import { Dna, ShieldCheck, Activity, BrainCircuit, Database, Zap, Lock, Microscope, ChevronRight } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';

const LandingPage = () => {
    const navigate = useNavigate();
    const { session } = useAuth();
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

    const fadeInUp = {
        initial: { opacity: 0, y: 30 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.6 }
    };

    const staggerContainer = {
        animate: {
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    return (
        <div className="min-h-screen bg-background text-foreground overflow-x-hidden relative selection:bg-neon-blue selection:text-black transition-colors duration-300">
            {/* Animated Background Elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[300px] sm:w-[500px] h-[300px] sm:h-[500px] bg-neon-blue/10 dark:bg-neon-blue/20 rounded-full blur-[120px] animate-float" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[300px] sm:w-[500px] h-[300px] sm:h-[500px] bg-neon-green/10 dark:bg-neon-green/20 rounded-full blur-[120px] animate-float" style={{ animationDelay: '2s' }} />
                <div className="absolute top-[20%] right-[-5%] w-[200px] h-[200px] bg-purple-500/10 rounded-full blur-[80px] animate-pulse" />
            </div>

            {/* Navbar */}
            <nav className="relative z-50 flex items-center justify-between px-4 sm:px-8 py-4 sm:py-6 max-w-7xl mx-auto backdrop-blur-sm sticky top-0">
                <div className="flex items-center gap-2 group cursor-pointer" onClick={() => navigate('/')}>
                    <div className="p-1.5 bg-neon-green/10 rounded-lg group-hover:scale-110 transition-transform">
                        <Activity className="h-6 w-6 sm:h-8 sm:w-8 text-neon-green" />
                    </div>
                    <span className="text-lg sm:text-2xl font-bold tracking-wider text-gray-900 dark:text-white">
                        PharmaGuard<span className="text-neon-blue">X</span>
                    </span>
                </div>
                <div className="flex gap-2 sm:gap-6 items-center">
                    <button onClick={() => navigate('/about')} className="hidden md:block text-sm font-medium text-gray-500 hover:text-neon-blue transition-colors">Platform</button>
                    <button onClick={() => navigate('/community')} className="hidden md:block text-sm font-medium text-gray-500 hover:text-neon-blue transition-colors">Resources</button>
                    <div className="h-4 w-px bg-gray-300 dark:bg-white/10 hidden md:block" />
                    
                    {session ? (
                        <Button
                            size="sm"
                            className="bg-neon-blue hover:bg-neon-blue/80 text-black font-black text-xs sm:text-sm rounded-full px-6 shadow-[0_0_20px_rgba(0,240,255,0.3)] animate-pulse"
                            onClick={() => navigate('/dashboard')}
                        >
                            Enter Dashboard
                        </Button>
                    ) : (
                        <>
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
                                className="bg-neon-blue hover:bg-neon-blue/80 text-black font-bold text-sm sm:text-base rounded-full px-6"
                                onClick={() => navigate('/register')}
                            >
                                Join Now
                            </Button>
                        </>
                    )}
                </div>
            </nav>

            {/* Hero Section */}
            <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-8 pt-10 sm:pt-20 flex flex-col items-center text-center">
                <motion.div
                    initial={{ opacity: 0, scale: 0.8, rotate: -10 }}
                    animate={{ opacity: 1, scale: 1, rotate: 0 }}
                    transition={{ duration: 1, type: 'spring' }}
                    className="mb-4 sm:mb-6 relative"
                >
                    <div className="absolute inset-0 blur-3xl bg-neon-blue/30 rounded-full animate-pulse" />
                    <Dna className="h-20 w-20 sm:h-32 sm:w-32 text-neon-blue relative z-10 animate-spin-slow" />
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black mb-4 sm:mb-5 tracking-tighter text-gray-900 dark:text-white px-2 leading-tight">
                        Revolutionizing{' '}
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-neon-blue via-neon-purple to-neon-green">
                            Medicine
                        </span>
                    </h1>
                </motion.div>

                <h2 className="text-lg sm:text-xl md:text-2xl font-light text-gray-500 dark:text-gray-400 mb-6 sm:mb-10 h-6 sm:h-10 px-4 max-w-3xl">
                    {text}<span className="animate-pulse text-neon-blue font-bold">_</span>
                </h2>

                <motion.p 
                    initial={{ opacity: 0 }}
                    transition={{ delay: 0.5 }}
                    animate={{ opacity: 1 }}
                    className="max-w-xl sm:max-w-3xl text-gray-600 dark:text-gray-400 text-base sm:text-lg mb-8 sm:mb-12 leading-relaxed px-4 font-medium"
                >
                    Seamlessly bridge the gap between genetics and clinical outcomes. 
                    Your all-in-one Clinical Decision Support (CDS) for smarter, safer prescribing.
                </motion.p>

                <motion.div 
                    className="flex flex-col sm:flex-row gap-4 sm:gap-6 w-full sm:w-auto px-4 mb-24"
                    {...fadeInUp}
                    transition={{ delay: 0.4 }}
                >
                    <Button
                        size="lg"
                        className="bg-neon-blue hover:bg-neon-blue/80 text-black font-black px-8 py-5 text-base sm:text-lg rounded-full shadow-[0_0_30px_rgba(0,240,255,0.4)] hover:shadow-[0_0_50px_rgba(0,240,255,0.6)] transition-all duration-300 w-full sm:w-auto transform hover:-translate-y-1"
                        onClick={() => navigate('/register')}
                    >
                        Launch Platform <ChevronRight className="ml-2 h-5 w-5" />
                    </Button>
                    <Button
                        size="lg"
                        variant="outline"
                        className="border-neon-green/50 text-neon-green hover:bg-neon-green/10 px-8 py-5 text-base sm:text-lg rounded-full backdrop-blur-md w-full sm:w-auto border-2 transition-all"
                    >
                        View Demo
                    </Button>
                </motion.div>

                {/* Statistics Bar */}
                <motion.div 
                    className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full mb-32"
                    variants={staggerContainer}
                    initial="initial"
                    animate="animate"
                >
                    {[
                        { label: 'Genes Tracked', val: '50+', icon: Dna, color: 'text-neon-blue' },
                        { label: 'CPIC Standards', val: 'Level A', icon: ShieldCheck, color: 'text-neon-green' },
                        { label: 'Analysis Speed', val: '< 2s', icon: Zap, color: 'text-yellow-400' },
                        { label: 'Clinical Accuracy', val: '99.9%', icon: Microscope, color: 'text-neon-purple' }
                    ].map((stat, i) => (
                        <motion.div key={i} variants={fadeInUp}>
                            <GlassCard className="p-4 sm:p-5 border-b-2 hover:border-neon-blue/50 transition-all cursor-default">
                                <stat.icon className={`h-4 w-4 mb-2 mx-auto ${stat.color}`} />
                                <div className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white">{stat.val}</div>
                                <div className="text-[9px] sm:text-[10px] uppercase tracking-widest text-gray-500 font-bold">{stat.label}</div>
                            </GlassCard>
                        </motion.div>
                    ))}
                </motion.div>

                {/* Workflow Section */}
                <div className="w-full mb-32">
                    <div className="text-center mb-12">
                        <h2 className="text-2xl sm:text-4xl font-black text-gray-900 dark:text-white mb-3">Precision Workflow</h2>
                        <div className="h-1 w-20 bg-neon-blue mx-auto rounded-full" />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
                        {/* Connecting Line (Desktop) */}
                        <div className="hidden md:block absolute top-[40%] left-[10%] right-[10%] h-0.5 bg-gradient-to-r from-neon-blue/20 via-neon-purple/20 to-neon-green/20 -z-10" />

                        {[
                            { step: '01', title: 'Upload DNA Data', desc: 'Securely import VCF sequencing files or enter star-alleles manually.', icon: Database, color: 'bg-neon-blue' },
                            { step: '02', title: 'AI Interpretation', desc: 'Our clinical engine maps variants to peer-reviewed PharmGKB/CPIC drug rules.', icon: BrainCircuit, color: 'bg-neon-purple' },
                            { step: '03', title: 'Clinical Decision', desc: 'Receive instant alerts for adverse reactions and alternative drug suggestions.', icon: ShieldCheck, color: 'bg-neon-green' }
                        ].map((item, i) => (
                            <motion.div 
                                key={i}
                                initial={{ opacity: 0, x: i === 0 ? -20 : i === 2 ? 20 : 0 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.2 }}
                                className="group"
                            >
                                <div className={`w-16 h-16 rounded-2xl ${item.color} flex items-center justify-center mb-6 mx-auto shadow-lg group-hover:scale-110 transition-transform`}>
                                    <item.icon className="h-8 w-8 text-black" />
                                </div>
                                <div className="text-3xl font-black text-gray-200 dark:text-white/5 mb-1 leading-none">{item.step}</div>
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{item.title}</h3>
                                <p className="text-gray-500 dark:text-gray-400 text-xs leading-relaxed max-w-[250px] mx-auto">
                                    {item.desc}
                                </p>
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* Trust & Security Section */}
                <GlassCard className="w-full p-8 sm:p-12 border-l-8 border-neon-blue bg-neon-blue/5 mb-32 text-left relative overflow-hidden">
                    <Lock className="absolute right-[-20px] bottom-[-20px] h-48 w-48 text-neon-blue/5 -rotate-12" />
                    <div className="relative z-10 max-w-2xl">
                        <h2 className="text-2xl sm:text-4xl font-black text-gray-900 dark:text-white mb-5">Security by Design</h2>
                        <p className="text-base text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
                            We treat patient data with clinical-grade seriousness. Our platform implements end-to-end encryption 
                            and follows HIPAA-standard architectural patterns to ensure total data sovereignty.
                        </p>
                        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {[
                                'AES-256 Data Encryption',
                                'Zero-Knowledge Storage',
                                'Secure SSL/TLS Handshakes',
                                'Audit Trailing Logs',
                            ].map((feature, i) => (
                                <li key={i} className="flex items-center gap-2 text-gray-700 dark:text-gray-200 text-sm font-semibold">
                                    <ShieldCheck className="h-4 w-4 text-neon-green" />
                                    {feature}
                                </li>
                            ))}
                        </ul>
                    </div>
                </GlassCard>

                {/* Partners Marquee */}
                <div className="w-full py-20 border-y border-gray-100 dark:border-white/5 overflow-hidden mb-32 bg-gray-50/50 dark:bg-white/[0.02]">
                    <p className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-400 mb-10">Powering Clinical Excellence At</p>
                    <div className="relative flex overflow-hidden">
                        <div className="animate-marquee flex items-center gap-12 sm:gap-24 grayscale opacity-30 hover:grayscale-0 hover:opacity-100 transition-all">
                            {[
                                'Mayo Clinic', 'Stanford Medicine', 'Cleveland Clinic', 'Johns Hopkins', 'Mount Sinai',
                                'Mayo Clinic', 'Stanford Medicine', 'Cleveland Clinic', 'Johns Hopkins', 'Mount Sinai'
                            ].map((partner, i) => (
                                <span key={partner + i} className="text-xl sm:text-3xl font-black whitespace-nowrap text-gray-900 dark:text-white flex items-center gap-2">
                                    <div className="h-2 w-2 rounded-full bg-neon-blue" /> {partner}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Science Section */}
                <div className="w-full mb-32 grid lg:grid-cols-2 gap-16 items-center text-left">
                    <div className="space-y-6">
                        <h2 className="text-3xl sm:text-5xl font-black text-gray-900 dark:text-white tracking-tighter uppercase leading-none">
                            The Science of <br/><span className="text-neon-purple text-glow-blue">Personalization</span>
                        </h2>
                        <p className="text-gray-500 dark:text-gray-400 font-medium leading-relaxed max-w-lg">
                            PharmaGuardX leverages world-class pharmacogenomic databases to minimize Trial-and-Error prescribing. 
                            Our engine cross-references your unique genetic profile against global medical standards in real-time.
                        </p>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 rounded-2xl bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10">
                                <p className="text-2xl font-black text-neon-blue">50+</p>
                                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">High-Risk Genes</p>
                            </div>
                            <div className="p-4 rounded-2xl bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10">
                                <p className="text-2xl font-black text-neon-green">14k+</p>
                                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Interaction Rules</p>
                            </div>
                        </div>
                    </div>
                    <div className="relative">
                        <div className="absolute -inset-1 bg-gradient-to-r from-neon-blue to-neon-purple rounded-3xl blur opacity-20 group-hover:opacity-40 transition-opacity" />
                        <GlassCard className="relative p-8 border-t-2 border-neon-blue/20">
                            <h3 className="text-sm font-black text-neon-blue uppercase tracking-widest mb-6">Database Sovereignty</h3>
                            <div className="space-y-4">
                                {[
                                    { name: 'CPIC Standards', status: 'Implemented', color: 'text-neon-green' },
                                    { name: 'PharmGKB Knowledgebase', status: 'Integrated', color: 'text-neon-green' },
                                    { name: 'FDA Medication Labels', status: 'Synced (Daily)', color: 'text-neon-blue' },
                                    { name: 'DPWG Guidelines', status: 'Supported', color: 'text-neon-blue' }
                                ].map((db, i) => (
                                    <div key={i} className="flex justify-between items-center py-3 border-b border-gray-100 dark:border-white/5">
                                        <span className="text-xs font-bold text-gray-700 dark:text-gray-300">{db.name}</span>
                                        <span className={`text-[10px] font-black uppercase ${db.color}`}>{db.status}</span>
                                    </div>
                                ))}
                            </div>
                        </GlassCard>
                    </div>
                </div>

                {/* EHR Integration Section */}
                <div className="w-full mb-32 relative group">
                    <div className="absolute inset-0 bg-neon-green/5 rounded-[40px] blur-3xl -z-10 group-hover:bg-neon-green/10 transition-colors" />
                    <GlassCard className="p-10 border-2 border-neon-green/20 text-center relative overflow-hidden">
                        <div className="max-w-2xl mx-auto space-y-6">
                            <div className="inline-flex items-center gap-2 px-4 py-2 bg-neon-green/10 rounded-full mb-4">
                                <Zap className="h-4 w-4 text-neon-green" />
                                <span className="text-[10px] font-black text-neon-green tracking-[0.2em] uppercase">Enterprise Interoperability</span>
                            </div>
                            <h2 className="text-3xl sm:text-5xl font-black text-gray-900 dark:text-white tracking-tighter uppercase">EHR Ready. HL7 Compliant.</h2>
                            <p className="text-gray-500 dark:text-gray-400 font-medium text-lg leading-relaxed">
                                PharmaGuardX fits seamlessly into your clinical workflow. Bridge DNA data into Epic, Cerner, or Allscripts via FHIR API standards.
                            </p>
                            <div className="flex flex-wrap justify-center gap-4 pt-6">
                                <div className="px-6 py-3 bg-white dark:bg-white/5 rounded-xl border border-gray-100 dark:border-white/10 font-black text-xs uppercase tracking-widest text-gray-400">FHIR R4</div>
                                <div className="px-6 py-3 bg-white dark:bg-white/5 rounded-xl border border-gray-100 dark:border-white/10 font-black text-xs uppercase tracking-widest text-gray-400">JSON API</div>
                                <div className="px-6 py-3 bg-white dark:bg-white/5 rounded-xl border border-gray-100 dark:border-white/10 font-black text-xs uppercase tracking-widest text-gray-400">OAuth 2.0</div>
                            </div>
                        </div>
                    </GlassCard>
                </div>

            </main>

            {/* Footer */}
            <footer className="relative z-10 py-16 border-t border-gray-200 dark:border-white/10 bg-white/50 dark:bg-black/80 backdrop-blur-xl">
                <div className="max-w-7xl mx-auto px-4 sm:px-8">
                    <div className="flex flex-col md:flex-row justify-between gap-12 mb-12">
                        <div className="max-w-sm">
                            <div className="flex items-center gap-2 mb-6">
                                <Activity className="h-8 w-8 text-neon-green" />
                                <span className="text-2xl font-bold tracking-wider text-gray-900 dark:text-white">
                                    PharmaGuard<span className="text-neon-blue">X</span>
                                </span>
                            </div>
                            <p className="text-gray-500 text-sm leading-relaxed">
                                Advancing human health through the power of pharmacogenomics. PharmaGuard X is building the tools
                                necessary for a future where every prescription is personalized.
                            </p>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-8">
                            <div>
                                <h4 className="font-bold mb-4 text-gray-900 dark:text-white">Product</h4>
                                <ul className="space-y-2 text-sm text-gray-500">
                                    <li><button onClick={() => navigate('/dashboard')} className="hover:text-neon-blue">Dashboard</button></li>
                                    <li><button onClick={() => navigate('/genes/upload')} className="hover:text-neon-blue">VCF Analysis</button></li>
                                    <li><button onClick={() => navigate('/reports')} className="hover:text-neon-blue">Reports</button></li>
                                </ul>
                            </div>
                            <div>
                                <h4 className="font-bold mb-4 text-gray-900 dark:text-white">Support</h4>
                                <ul className="space-y-2 text-sm text-gray-500">
                                    <li><button onClick={() => navigate('/docs')} className="hover:text-neon-blue">Documentation</button></li>
                                    <li><button onClick={() => navigate('/docs/api')} className="hover:text-neon-blue">API Reference</button></li>
                                    <li><button onClick={() => navigate('/community')} className="hover:text-neon-blue">Community</button></li>
                                </ul>
                            </div>
                            <div>
                                <h4 className="font-bold mb-4 text-gray-900 dark:text-white">Company</h4>
                                <ul className="space-y-2 text-sm text-gray-500">
                                    <li><button onClick={() => navigate('/about')} className="hover:text-neon-blue">About Us</button></li>
                                    <li><button onClick={() => navigate('/privacy')} className="hover:text-neon-blue">Privacy Policy</button></li>
                                    <li><button onClick={() => navigate('/terms')} className="hover:text-neon-blue">Terms</button></li>
                                </ul>
                            </div>
                        </div>
                    </div>
                    <div className="pt-8 border-t border-gray-200 dark:border-white/5 text-center">
                        <p className="text-xs text-gray-500 mb-4 px-4">
                            ⚠️ <span className="font-bold text-gray-700 dark:text-gray-300 italic">Medical Disclaimer:</span> The information provided by PharmaGuard X is for educational and research purposes only. 
                            It is not intended to be clinical medical advice and should not replace professional medical judgment. 
                            Consult with a licensed healthcare provider before making any changes to medication regimens.
                        </p>
                        <p className="text-xs text-gray-600 font-bold tracking-tighter uppercase">© 2026 PharmaGuard X · ADVANCED CLINICAL ANALYTICS</p>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;
