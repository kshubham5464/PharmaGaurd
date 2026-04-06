import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Activity, ShieldCheck, Dna, Cpu } from 'lucide-react';

interface GeneLoaderProps {
  fullscreen?: boolean;
  message?: string;
}

const MESSAGES = [
  "Sequencing Genetic Variant...",
  "Analyzing Polymorphisms...",
  "Identifying Drug-Gene Overlap...",
  "Synchronizing Clinical Data...",
  "Verifying System Integrity...",
  "Processing Pharmacogenomic Matrix...",
  "AI Core Initiating Scan...",
  "Mapping Genome to Interaction DB..."
];

const GeneLoader: React.FC<GeneLoaderProps> = ({ fullscreen = true, message }) => {
  const [currentMessage, setCurrentMessage] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentMessage((prev) => (prev + 1) % MESSAGES.length);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  const helixNodes = Array.from({ length: 12 });

  return (
    <div className={cn(
      "flex flex-col items-center justify-center bg-black dark:bg-[#020202] z-[9999] overflow-hidden",
      fullscreen ? "fixed inset-0" : "w-full h-full p-12 rounded-3xl"
    )}>
      {/* ═══ DNA HELIX ANIMATION ═══ */}
      <div className="relative h-48 w-24 flex items-center justify-center mb-16">
        {helixNodes.map((_, i) => (
          <React.Fragment key={i}>
            {/* Left Strand Node */}
            <motion.div
              className="absolute left-0 w-3 h-3 rounded-full bg-neon-blue shadow-[0_0_15px_hsla(var(--neon-blue),0.8)]"
              animate={{
                y: i * 20 - 110,
                x: Math.sin(Date.now() / 800 + i * 0.5) * 40,
                scale: (Math.cos(Date.now() / 800 + i * 0.5) + 1.5) / 2,
                opacity: (Math.cos(Date.now() / 800 + i * 0.5) + 2) / 3,
              }}
              transition={{ repeat: Infinity, duration: 0 }}
            />
            {/* Right Strand Node */}
            <motion.div
              className="absolute right-0 w-3 h-3 rounded-full bg-neon-purple shadow-[0_0_15px_hsla(var(--neon-purple),0.8)]"
              animate={{
                y: i * 20 - 110,
                x: -Math.sin(Date.now() / 800 + i * 0.5) * 40,
                scale: (-Math.cos(Date.now() / 800 + i * 0.5) + 1.5) / 2,
                opacity: (-Math.cos(Date.now() / 800 + i * 0.5) + 2) / 3,
              }}
              transition={{ repeat: Infinity, duration: 0 }}
            />
            {/* Connecting Rung (Line) */}
            <motion.div
              className="absolute h-[1px] bg-gradient-to-r from-neon-blue/20 via-white/5 to-neon-purple/20"
              animate={{
                y: i * 20 - 108.5,
                width: Math.abs(Math.sin(Date.now() / 800 + i * 0.5) * 80),
                opacity: Math.abs(Math.sin(Date.now() / 800 + i * 0.5)) * 0.4,
              }}
              transition={{ repeat: Infinity, duration: 0 }}
            />
          </React.Fragment>
        ))}

        {/* Global Glowing Aura */}
        <div className="absolute inset-[-100px] bg-neon-blue/5 blur-[100px] rounded-full pointer-events-none" />
      </div>

      {/* ═══ STATUS FEED ═══ */}
      <div className="max-w-md w-full px-6 flex flex-col items-center">
        <div className="flex items-center gap-3 mb-6">
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
            className="p-2 border border-neon-blue/30 rounded-lg bg-neon-blue/5"
          >
            <Dna className="w-5 h-5 text-neon-blue" />
          </motion.div>
          <div className="h-px w-12 bg-white/10" />
          <motion.div 
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="p-2 border border-neon-purple/30 rounded-lg bg-neon-purple/5"
          >
            <Activity className="w-5 h-5 text-neon-purple" />
          </motion.div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={currentMessage}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="text-center"
          >
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-400 mb-2">SYSTEM INITIALIZING</p>
            <h2 className="text-xl font-black text-white uppercase tracking-tighter italic">
              {message || MESSAGES[currentMessage]}
            </h2>
          </motion.div>
        </AnimatePresence>

        <div className="mt-12 w-full max-w-[200px] h-1 bg-white/5 rounded-full overflow-hidden relative border border-white/5">
          <motion.div 
            className="absolute top-0 bottom-0 left-0 bg-gradient-to-r from-neon-blue to-neon-purple"
            animate={{ 
                left: ["-100%", "100%"],
            }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            style={{ width: "60%" }}
          />
        </div>

        <div className="mt-8 flex gap-4 opacity-30">
          <ShieldCheck className="w-4 h-4 text-neon-green" />
          <Cpu className="w-4 h-4 text-neon-amber" />
        </div>
      </div>

      {/* Decorative Corners */}
      <div className="absolute top-8 left-8 w-12 h-12 border-t-2 border-l-2 border-white/10 rounded-tl-xl" />
      <div className="absolute top-8 right-8 w-12 h-12 border-t-2 border-r-2 border-white/10 rounded-tr-xl" />
      <div className="absolute bottom-8 left-8 w-12 h-12 border-b-2 border-l-2 border-white/10 rounded-bl-xl" />
      <div className="absolute bottom-8 right-8 w-12 h-12 border-b-2 border-r-2 border-white/10 rounded-br-xl" />
    </div>
  );
};

export default GeneLoader;
