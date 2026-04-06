import { motion } from 'framer-motion';
import GlassCard from '@/components/ui/GlassCard';
import { Dna, ShieldCheck, Activity, Globe, Users, Microscope } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const AboutPage = () => {
  const navigate = useNavigate();

  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5 }
  };

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden relative selection:bg-neon-blue selection:text-black">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-neon-blue/10 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-neon-purple/10 rounded-full blur-[120px] animate-pulse" />
      </div>

      <nav className="relative z-50 flex items-center justify-between px-8 py-6 max-w-7xl mx-auto backdrop-blur-sm sticky top-0">
        <div className="flex items-center gap-2 group cursor-pointer" onClick={() => navigate('/')}>
          <div className="p-1.5 bg-neon-green/10 rounded-lg">
            <Activity className="h-8 w-8 text-neon-green" />
          </div>
          <span className="text-2xl font-bold tracking-wider text-gray-900 dark:text-white">
            PharmaGuard<span className="text-neon-blue">X</span>
          </span>
        </div>
        <Button 
          variant="ghost" 
          className="text-gray-500 hover:text-neon-blue"
          onClick={() => navigate('/')}
        >
          Back to Home
        </Button>
      </nav>

      <main className="relative z-10 max-w-7xl mx-auto px-8 pt-20 pb-32">
        {/* Hero Section */}
        <motion.div {...fadeInUp} className="text-center mb-24">
          <h1 className="text-4xl md:text-7xl font-black mb-6 tracking-tighter uppercase leading-[0.9]">
            The Science of <br /> <span className="text-neon-blue">Precision</span>
          </h1>
          <p className="text-lg text-gray-500 dark:text-gray-400 max-w-2xl mx-auto font-medium italic border-l-2 border-neon-blue/30 pl-6 text-left md:text-center md:border-l-0 md:pl-0">
            We are bridging the gap between genetics and clinical outcomes to ensure every prescription is as unique as the patient receiving it.
          </p>
        </motion.div>

        {/* Mission Section */}
        <div className="grid md:grid-cols-2 gap-12 mb-32 items-center">
            <motion.div {...fadeInUp}>
                <h2 className="text-3xl font-black text-gray-900 dark:text-white uppercase tracking-tight mb-6">Our Mission</h2>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-6">
                    PharmaGuardX was founded on the principle that modern medicine should no longer rely on a "one-size-fits-all" approach. By leveraging advanced pharmacogenomic data and AI-driven clinical rules, we empower clinicians to make safer, more effective decisions at the point of care.
                </p>
                <div className="space-y-4">
                    {[
                        { icon: ShieldCheck, text: "Clinical-grade security and HIPAA compliance" },
                        { icon: Dna, text: "Integration with CPIC and PharmGKB standards" },
                        { icon: Globe, text: "A global network for personalized medicine" }
                    ].map((item, i) => (
                        <div key={i} className="flex items-center gap-3 text-sm font-bold text-gray-700 dark:text-gray-300">
                             <item.icon className="h-5 w-5 text-neon-blue" />
                             {item.text}
                        </div>
                    ))}
                </div>
            </motion.div>
            <motion.div 
                {...fadeInUp}
                className="relative"
            >
                <div className="absolute inset-0 bg-neon-blue/10 blur-3xl -z-10" />
                <GlassCard className="p-8 border-t-2 border-neon-blue">
                    <div className="aspect-video bg-black/40 rounded-2xl flex items-center justify-center border border-white/5 group overflow-hidden">
                         <Microscope className="h-24 w-24 text-neon-blue opacity-20 group-hover:scale-110 transition-transform duration-1000" />
                    </div>
                    <div className="mt-8 text-center">
                        <p className="text-[10px] font-black text-neon-blue uppercase tracking-widest mb-2 italic">Precision Laboratory</p>
                        <p className="text-xl font-black text-white">GENE-SCAN ACTIVE</p>
                    </div>
                </GlassCard>
            </motion.div>
        </div>

        {/* Team Section */}
        <motion.div {...fadeInUp} className="text-center">
            <h2 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-[0.3em] mb-12 opacity-50 italic">Driving Clinical Excellence</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {[
                    { name: 'Dr. Sarah Chen', role: 'Chief Medical Officer', icon: Users },
                    { name: 'Marcus Thorne', role: 'Head of Bio-Engineering', icon: Users },
                    { name: 'Elena Vance', role: 'Lead Data Scientist', icon: Users }
                ].map((member, i) => (
                    <GlassCard key={i} className="p-8 text-center hover:border-neon-blue/20 transition-all group">
                        <div className="h-16 w-16 bg-neon-blue/10 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                             <member.icon className="h-8 w-8 text-neon-blue" />
                        </div>
                        <h3 className="font-black text-lg text-gray-900 dark:text-white uppercase tracking-tight mb-1">{member.name}</h3>
                        <p className="text-[10px] font-black text-neon-blue uppercase tracking-widest">{member.role}</p>
                    </GlassCard>
                ))}
            </div>
        </motion.div>
      </main>

      <footer className="py-20 border-t border-gray-200 dark:border-white/10 text-center">
         <p className="text-xs text-gray-500 font-bold uppercase tracking-tighter">© 2026 PharmaGuard X · ADVANCED CLINICAL ANALYTICS</p>
      </footer>
    </div>
  );
};

export default AboutPage;
