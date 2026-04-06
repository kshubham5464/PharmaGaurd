import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface RiskMeterProps {
    riskLevel: 'Low' | 'Moderate' | 'High' | 'Unknown';
    className?: string;
}

const RiskMeter: React.FC<RiskMeterProps> = ({ riskLevel, className }) => {
    
    const getRotation = () => {
        switch (riskLevel) {
            case 'Low': return -60;
            case 'Moderate': return 0;
            case 'High': return 60;
            default: return -90;
        }
    };

    const getColors = (level: string) => {
        switch (level) {
            case 'Low': return { 
                main: 'hsl(var(--neon-green))', 
                glow: 'hsla(var(--neon-green), 0.5)',
                text: 'text-neon-green'
            };
            case 'Moderate': return { 
                main: 'hsl(var(--neon-amber))', 
                glow: 'hsla(var(--neon-amber), 0.5)',
                text: 'text-neon-amber'
            };
            case 'High': return { 
                main: 'hsl(var(--neon-red))', 
                glow: 'hsla(var(--neon-red), 0.5)',
                text: 'text-neon-red'
            };
            default: return { 
                main: '#64748b', 
                glow: 'rgba(100, 116, 139, 0.2)',
                text: 'text-slate-500'
            };
        }
    };

    const currentColors = getColors(riskLevel);

    return (
        <div className={cn("relative flex flex-col items-center justify-center select-none", className)}>
            <div className="relative w-80 h-48 flex items-center justify-center overflow-visible">
                
                <svg viewBox="0 0 220 120" className="w-full h-full drop-shadow-[0_0_30px_rgba(0,0,0,0.5)]">
                    <defs>
                        <filter id="neon-glow-red" x="-50%" y="-50%" width="200%" height="200%">
                            <feGaussianBlur stdDeviation="3" result="blur" />
                            <feComposite in="SourceGraphic" in2="blur" operator="over" />
                        </filter>
                        <filter id="neon-glow-amber" x="-50%" y="-50%" width="200%" height="200%">
                            <feGaussianBlur stdDeviation="3" result="blur" />
                            <feComposite in="SourceGraphic" in2="blur" operator="over" />
                        </filter>
                        <filter id="neon-glow-green" x="-50%" y="-50%" width="200%" height="200%">
                            <feGaussianBlur stdDeviation="3" result="blur" />
                            <feComposite in="SourceGraphic" in2="blur" operator="over" />
                        </filter>
                        
                        <linearGradient id="needleGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" stopColor="white" />
                            <stop offset="100%" stopColor="transparent" />
                        </linearGradient>

                        <radialGradient id="centerCap" cx="50%" cy="50%" r="50%">
                            <stop offset="0%" stopColor="white" />
                            <stop offset="100%" stopColor={currentColors.main} />
                        </radialGradient>
                    </defs>

                    <path 
                        d="M 25 105 A 85 85 0 0 1 195 105" 
                        fill="none" 
                        stroke="rgba(255,255,255,0.03)" 
                        strokeWidth="22" 
                        strokeLinecap="round"
                    />

                    <motion.path 
                        d="M 25 105 A 85 85 0 0 1 70 34" 
                        fill="none" 
                        stroke="hsl(var(--neon-green))" 
                        strokeWidth={riskLevel === 'Low' ? "18" : "10"} 
                        strokeOpacity={riskLevel === 'Low' ? "1" : "0.15"}
                        strokeLinecap="round"
                        filter={riskLevel === 'Low' ? "url(#neon-glow-green)" : ""}
                        initial={false}
                        animate={{ strokeWidth: riskLevel === 'Low' ? 18 : 10, strokeOpacity: riskLevel === 'Low' ? 1 : 0.15 }}
                        className="transition-all duration-700 ease-out cursor-pointer"
                    />

                    <motion.path 
                        d="M 72 32 A 85 85 0 0 1 148 32" 
                        fill="none" 
                        stroke="hsl(var(--neon-amber))" 
                        strokeWidth={riskLevel === 'Moderate' ? "18" : "10"} 
                        strokeOpacity={riskLevel === 'Moderate' ? "1" : "0.15"}
                        strokeLinecap="round"
                        filter={riskLevel === 'Moderate' ? "url(#neon-glow-amber)" : ""}
                        initial={false}
                        animate={{ strokeWidth: riskLevel === 'Moderate' ? 18 : 10, strokeOpacity: riskLevel === 'Moderate' ? 1 : 0.15 }}
                        className="transition-all duration-700 ease-out cursor-pointer"
                    />

                    <motion.path 
                        d="M 150 34 A 85 85 0 0 1 195 105" 
                        fill="none" 
                        stroke="hsl(var(--neon-red))" 
                        strokeWidth={riskLevel === 'High' ? "18" : "10"} 
                        strokeOpacity={riskLevel === 'High' ? "1" : "0.15"}
                        strokeLinecap="round"
                        filter={riskLevel === 'High' ? "url(#neon-glow-red)" : ""}
                        initial={false}
                        animate={{ strokeWidth: riskLevel === 'High' ? 18 : 10, strokeOpacity: riskLevel === 'High' ? 1 : 0.15 }}
                        className="transition-all duration-700 ease-out cursor-pointer"
                    />

                    <path 
                        d="M 45 105 A 65 65 0 0 1 175 105" 
                        fill="none" 
                        stroke="rgba(255,255,255,0.05)" 
                        strokeWidth="1" 
                    />

                    <circle cx="110" cy="105" r="14" fill="rgba(0,0,0,0.4)" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
                    <circle cx="110" cy="105" r="8" fill="url(#centerCap)" />
                </svg>

                <motion.div
                    className="absolute bottom-[10px] w-1 h-28 origin-bottom z-10"
                    initial={{ rotate: -90 }}
                    animate={{ rotate: getRotation() }}
                    transition={{ type: "spring", stiffness: 60, damping: 15, mass: 1.2 }}
                    style={{ 
                        left: 'calc(50% - 2px)',
                        bottom: '15px'
                    }}
                >
                    <div className="absolute inset-0 bg-gradient-to-t from-white to-transparent rounded-full shadow-[0_0_15px_rgba(255,255,255,0.4)]" />
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3 h-3 bg-white rounded-full blur-[2px]" />
                </motion.div>

                <motion.div 
                    className="absolute inset-x-10 h-0.5 bg-gradient-to-r from-transparent via-white/20 to-transparent z-0"
                    animate={{ top: ['20%', '80%', '20%'] }}
                    transition={{ repeat: Infinity, duration: 4, ease: "linear" }}
                />
            </div>

            <AnimatePresence mode="wait">
                <motion.div
                    key={riskLevel}
                    initial={{ opacity: 0, y: 10, filter: 'blur(10px)' }}
                    animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                    exit={{ opacity: 0, y: -10, filter: 'blur(10px)' }}
                    transition={{ duration: 0.4 }}
                    className="mt-6 flex flex-col items-center gap-2"
                >
                    <div className="relative group">
                        <div className={cn("absolute inset-0 blur-2xl opacity-20 transition-all duration-1000", 
                            riskLevel === 'Low' ? 'bg-neon-green' : 
                            riskLevel === 'Moderate' ? 'bg-neon-amber' : 
                            riskLevel === 'High' ? 'bg-neon-red' : 'bg-slate-500'
                        )} />
                        
                        <span className={cn("text-5xl font-black tracking-[-0.05em] uppercase leading-none relative z-10 drop-shadow-sm", currentColors.text)}>
                            {riskLevel}
                        </span>
                    </div>
                    
                    <div className="flex items-center gap-3">
                        <div className="h-[1px] w-8 bg-gradient-to-r from-transparent to-white/20" />
                        <span className="text-[10px] font-black uppercase tracking-[0.5em] text-gray-500 dark:text-gray-400">
                            Clinical Interaction Index
                        </span>
                        <div className="h-[1px] w-8 bg-gradient-to-l from-transparent to-white/20" />
                    </div>
                </motion.div>
            </AnimatePresence>

            <div className="mt-8 grid grid-cols-3 gap-6 w-full max-w-xs">
                {['Low', 'Moderate', 'High'].map((l) => (
                    <div key={l} className="flex flex-col items-center gap-2 opacity-50 transition-opacity duration-300 hover:opacity-100">
                        <div className={cn("h-1 w-full rounded-full transition-all duration-500", 
                            riskLevel === l ? (
                                l === 'Low' ? 'bg-neon-green shadow-[0_0_10px_hsl(var(--neon-green))]' :
                                l === 'Moderate' ? 'bg-neon-amber shadow-[0_0_10px_hsl(var(--neon-amber))]' :
                                'bg-neon-red shadow-[0_0_10px_hsl(var(--neon-red))]'
                            ) : 'bg-white/10'
                        )} />
                        <span className="text-[8px] font-black uppercase tracking-widest text-gray-500">{l}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default RiskMeter;
