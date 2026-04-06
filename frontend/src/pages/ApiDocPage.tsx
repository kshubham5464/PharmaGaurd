import { motion } from 'framer-motion';
import GlassCard from '@/components/ui/GlassCard';
import { Cpu, Terminal, Activity, Code, Copy, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const ApiDocPage = () => {
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

            <main className="max-w-6xl mx-auto px-8 py-20">
                <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="mb-20">
                    <div className="flex items-center gap-4 mb-6">
                        <Terminal className="h-10 w-10 text-neon-blue" />
                        <h1 className="text-5xl font-black uppercase tracking-tighter">API Reference</h1>
                    </div>
                    <p className="max-w-2xl text-gray-500 font-bold uppercase tracking-widest text-[11px] border-l-2 border-neon-blue/30 pl-6 leading-relaxed italic">
                        The PharmaGuardX Developer API allows enterprise EHR systems to securely query genomic variants and clinical decision logic at scale.
                    </p>
                </motion.div>

                <div className="grid md:grid-cols-4 gap-12">
                    <div className="md:col-span-1 space-y-6">
                        <nav className="flex flex-col gap-4 sticky top-32">
                           {['Introduction', 'Authentication', 'Variants API', 'Risk Analyzer', 'Rate Limits'].map((item, i) => (
                               <button key={i} className="text-left text-sm font-black uppercase tracking-widest text-gray-500 hover:text-neon-blue transition-colors px-2 py-1 border-l-2 border-transparent hover:border-neon-blue">
                                   {item}
                               </button>
                           ))}
                        </nav>
                    </div>

                    <div className="md:col-span-3 space-y-16">
                        <section className="space-y-6">
                            <h2 className="text-2xl font-black text-white uppercase tracking-tight flex items-center gap-3">
                                <Zap className="h-5 w-5 text-neon-blue" /> Quick Start
                            </h2>
                            <p className="text-gray-400 leading-relaxed font-medium">To begin interacting with the PharmaGuardX AI engine, you must first obtain an API key from the dashboard.</p>
                            
                            <GlassCard className="bg-black/80 overflow-hidden border-neon-blue/20">
                                <div className="p-4 border-b border-white/5 flex justify-between items-center bg-white/5">
                                    <div className="flex gap-2">
                                        <div className="h-2 w-2 rounded-full bg-red-500/50" />
                                        <div className="h-2 w-2 rounded-full bg-amber-500/50" />
                                        <div className="h-2 w-2 rounded-full bg-green-500/50" />
                                    </div>
                                    <span className="text-[10px] font-mono text-gray-500">cURL / Bash</span>
                                </div>
                                <div className="p-6 font-mono text-[11px] leading-6 group relative">
                                    <pre className="text-blue-400">curl <span className="text-gray-400">--location</span> <span className="text-neon-blue">"https://api.pharmaguardx.io/v1/scan"</span> \</pre>
                                    <pre className="text-gray-400">  --header <span className="text-green-400">"Authorization: Bearer [YOUR_API_KEY]"</span> \</pre>
                                    <pre className="text-gray-400">  --data <span className="text-purple-400">"{'{ "variant": "CYP2D6*4", "drug": "Codeine" }'}"</span></pre>
                                    <Copy className="absolute top-6 right-6 h-4 w-4 text-gray-700 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer" />
                                </div>
                            </GlassCard>
                        </section>

                        <section className="space-y-6">
                            <h2 className="text-2xl font-black text-white uppercase tracking-tight flex items-center gap-3">
                                <Code className="h-5 w-5 text-neon-purple" /> Authentication
                            </h2>
                            <p className="text-gray-400 leading-relaxed font-medium">All API requests must be made over HTTPS. Call and requests made over HTTP will fail. Base64 encoding is required for all payloads.</p>
                        </section>

                        <section className="p-12 rounded-[2.5rem] border-2 border-dashed border-neon-blue/20 flex flex-col items-center justify-center text-center group transition-all hover:bg-neon-blue/[0.02]">
                            <Cpu className="h-12 w-12 text-gray-700 mb-6 group-hover:text-neon-blue transition-colors animate-pulse" />
                            <h3 className="text-xl font-black uppercase mb-4 text-white">Full Documentation Access</h3>
                            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest max-w-sm">Contact the enterprise support team for the full HL7/FHIR integration guide.</p>
                        </section>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default ApiDocPage;
