import { motion } from 'framer-motion';
import GlassCard from '@/components/ui/GlassCard';
import { ShieldCheck, FileText, Activity } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export const PrivacyPolicy: React.FC = () => {
    const navigate = useNavigate();
    return (
        <div className="min-h-screen bg-background text-foreground selection:bg-neon-blue selection:text-black transition-colors duration-300">
            <nav className="relative z-50 flex items-center justify-between px-8 py-6 max-w-7xl mx-auto backdrop-blur-sm sticky top-0">
                <div className="flex items-center gap-2 group cursor-pointer" onClick={() => navigate('/')}>
                    <Activity className="h-8 w-8 text-neon-green" />
                    <span className="text-2xl font-bold tracking-wider text-gray-900 dark:text-white">PharmaGuard<span className="text-neon-blue">X</span></span>
                </div>
                <Button variant="ghost" onClick={() => navigate('/')}>Back</Button>
            </nav>
            
            <main className="max-w-4xl mx-auto px-8 py-20">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                    <div className="flex items-center gap-4 mb-8">
                        <ShieldCheck className="h-10 w-10 text-neon-blue" />
                        <h1 className="text-4xl font-black uppercase tracking-tighter">Privacy Policy</h1>
                    </div>
                    <GlassCard className="p-8 space-y-6 text-gray-600 dark:text-gray-400 leading-relaxed font-medium">
                        <section>
                            <h2 className="text-lg font-black text-gray-900 dark:text-white uppercase mb-4 tracking-widest text-[11px] border-b border-white/5 pb-2">Global Data Sovereignty</h2>
                            <p>We treat patient data with the highest clinical-grade seriousness. PharmaGuardX is committed to end-to-end encryption and HIPAA compliance.</p>
                        </section>
                        <section>
                            <h2 className="text-lg font-black text-gray-900 dark:text-white uppercase mb-4 tracking-widest text-[11px] border-b border-white/5 pb-2">Information We Collect</h2>
                            <p>We collect essential clinical profile information, genomic variants (VCF), and clinician interaction logs to provide precision medical analytics.</p>
                        </section>
                        <section>
                            <h2 className="text-lg font-black text-gray-900 dark:text-white uppercase mb-4 tracking-widest text-[11px] border-b border-white/5 pb-2">Security Measures</h2>
                            <p>All data is encrypted at rest using AES-256 and in transit using TLS 1.3. We leverage decentralized storage patterns for genomic data where applicable.</p>
                        </section>
                    </GlassCard>
                </motion.div>
            </main>
        </div>
    );
};

export const TermsOfService: React.FC = () => {
    const navigate = useNavigate();
    return (
        <div className="min-h-screen bg-background text-foreground selection:bg-neon-purple selection:text-black transition-colors duration-300">
            <nav className="relative z-50 flex items-center justify-between px-8 py-6 max-w-7xl mx-auto backdrop-blur-sm sticky top-0">
                <div className="flex items-center gap-2 group cursor-pointer" onClick={() => navigate('/')}>
                    <Activity className="h-8 w-8 text-neon-green" />
                    <span className="text-2xl font-bold tracking-wider text-gray-900 dark:text-white">PharmaGuard<span className="text-neon-blue">X</span></span>
                </div>
                <Button variant="ghost" onClick={() => navigate('/')}>Back</Button>
            </nav>
            
            <main className="max-w-4xl mx-auto px-8 py-20">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                    <div className="flex items-center gap-4 mb-8">
                        <FileText className="h-10 w-10 text-neon-purple" />
                        <h1 className="text-4xl font-black uppercase tracking-tighter">Terms of Service</h1>
                    </div>
                    <GlassCard className="p-8 space-y-6 text-gray-600 dark:text-gray-400 leading-relaxed font-medium">
                        <section>
                            <h2 className="text-lg font-black text-gray-900 dark:text-white uppercase mb-4 tracking-widest text-[11px] border-b border-white/5 pb-2">Medical Disclaimer</h2>
                            <p className="italic font-bold text-red-500">WARNING: PHARMAGUARDX IS A CLINICAL DECISION SUPPORT TOOL, NOT A SUBSTITUTE FOR PROFESSIONAL MEDICAL JUDGMENT. ALL CLINICAL DECISIONS REMAIN THE SOLE RESPONSIBILITY OF THE LICENSED CLINICIAN.</p>
                        </section>
                        <section>
                            <h2 className="text-lg font-black text-gray-900 dark:text-white uppercase mb-4 tracking-widest text-[11px] border-b border-white/5 pb-2">Platform Use</h2>
                            <p>Users must be licensed healthcare providers. You agree to use the platform only for legitimate clinical and research purposes.</p>
                        </section>
                    </GlassCard>
                </motion.div>
            </main>
        </div>
    );
};
