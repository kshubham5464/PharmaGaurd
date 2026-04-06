import { motion } from 'framer-motion';
import GlassCard from '@/components/ui/GlassCard';
import { Users, Globe, Activity, MessageSquare, Share2, Award } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const CommunityPage = () => {
    const navigate = useNavigate();
    return (
        <div className="min-h-screen bg-background text-foreground selection:bg-neon-green selection:text-black transition-colors duration-300">
            <nav className="relative z-50 flex items-center justify-between px-8 py-6 max-w-7xl mx-auto backdrop-blur-sm sticky top-0">
                <div className="flex items-center gap-2 group cursor-pointer" onClick={() => navigate('/')}>
                    <Activity className="h-8 w-8 text-neon-green" />
                    <span className="text-2xl font-bold tracking-wider text-gray-900 dark:text-white">PharmaGuard<span className="text-neon-blue">X</span></span>
                </div>
                <Button variant="ghost" onClick={() => navigate('/')}>Back</Button>
            </nav>
            
            <main className="max-w-7xl mx-auto px-8 py-20 text-center">
                <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
                    <div className="inline-flex items-center gap-4 px-6 py-2 bg-neon-green/10 border border-neon-green/20 rounded-full mb-8">
                        <Globe className="h-5 w-5 text-neon-green" />
                        <span className="text-[10px] font-black text-neon-green uppercase tracking-[0.4em]">Global Research Hub</span>
                    </div>
                    <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter mb-12">The <span className="text-neon-green">Precision</span> Network</h1>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20 text-left">
                        {[
                            { title: 'Global Forum', icon: MessageSquare, text: 'Discuss complex pharmacogenomic cases with clinicians globally.', color: 'neon-blue' },
                            { title: 'Knowledge Sharing', icon: Share2, text: 'Analyze and share verified interaction protocols with peers.', color: 'neon-purple' },
                            { title: 'Clinician Rewards', icon: Award, text: 'Earn peer-recognition tokens for contributions to the clinical database.', color: 'neon-amber' }
                        ].map((item, i) => (
                             <GlassCard key={i} className="p-8 hover:border-neon-green/20 transition-all group">
                                <div className={cn("p-4 rounded-2xl w-fit mb-6 transition-transform group-hover:scale-110", `bg-${item.color}/10 text-${item.color}`)}>
                                    <item.icon className="h-6 w-6" />
                                </div>
                                <h3 className="text-xl font-black uppercase tracking-tight mb-3 text-white">{item.title}</h3>
                                <p className="text-sm font-bold text-gray-500 leading-relaxed">{item.text}</p>
                             </GlassCard>
                        ))}
                    </div>

                    <GlassCard className="p-12 border-2 border-neon-green/20 bg-neon-green/[0.02]">
                        <Users className="h-16 w-16 text-neon-green/30 mx-auto mb-6" />
                        <h2 className="text-3xl font-black uppercase mb-4 text-white">Join the Research Network</h2>
                        <p className="text-gray-500 mb-8 max-w-xl mx-auto font-bold uppercase tracking-widest text-[10px]">Access to the community platform is limited to verified clinical practitioners.</p>
                        <Button size="lg" className="bg-neon-green hover:bg-neon-green/80 text-black font-black px-12 rounded-full">Request Community Access</Button>
                    </GlassCard>
                </motion.div>
            </main>
        </div>
    );
};

export default CommunityPage;

import { cn } from '@/lib/utils';
