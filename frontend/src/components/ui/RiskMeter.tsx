import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface RiskMeterProps {
    riskLevel: 'Low' | 'Moderate' | 'High' | 'Unknown';
    className?: string;
}

const RiskMeter: React.FC<RiskMeterProps> = ({ riskLevel, className }) => {
    const getRotation = () => {
        switch (riskLevel) {
            case 'Low': return -45; // Green zone
            case 'Moderate': return 0; // Yellow zone
            case 'High': return 45; // Red zone
            default: return -90; // Starting point
        }
    };

    const getColor = () => {
        switch (riskLevel) {
            case 'Low': return 'text-neon-green shadow-[0_0_20px_#00FF94]';
            case 'Moderate': return 'text-yellow-400 shadow-[0_0_20px_#ea580c]';
            case 'High': return 'text-red-500 shadow-[0_0_20px_#ef4444]';
            default: return 'text-gray-500';
        }
    };

    return (
        <div className={cn("relative flex flex-col items-center justify-center p-6", className)}>
            {/* Gauge Background */}
            <div className="relative w-64 h-32 overflow-hidden">
                <div className="w-64 h-64 rounded-full border-[20px] border-gray-800 box-border border-b-0 border-l-0 border-r-0 absolute top-0 left-0"
                    style={{ borderImage: 'conic-gradient(from 180deg, #00FF94 0deg 60deg, #FACC15 60deg 120deg, #EF4444 120deg 180deg, transparent 180deg) 1' }}
                >
                    {/* SVG Fallback for gradient border if needed, but CSS border-image is tricky with rounded.
                    Better approach: SVG Gauge
                */}
                </div>
                {/* Using SVG for better control */}
                <svg viewBox="0 0 200 100" className="w-full h-full">
                    <path d="M 20 100 A 80 80 0 0 1 180 100" fill="none" stroke="#2a2a2a" strokeWidth="20" />
                    <path d="M 20 100 A 80 80 0 0 1 73.3 53.3" fill="none" stroke="#00FF94" strokeWidth="20" />
                    <path d="M 73.3 53.3 A 80 80 0 0 1 126.6 53.3" fill="none" stroke="#FACC15" strokeWidth="20" />
                    <path d="M 126.6 53.3 A 80 80 0 0 1 180 100" fill="none" stroke="#EF4444" strokeWidth="20" />
                </svg>
            </div>

            {/* Needle */}
            <motion.div
                className="absolute bottom-6 w-1 h-24 bg-white origin-bottom rounded-full z-10"
                initial={{ rotate: -90 }}
                animate={{ rotate: getRotation() }}
                transition={{ type: "spring", stiffness: 60, damping: 15 }}
                style={{ bottom: '24px' }} // Pivot point adjustment
            />

            {/* Pivot */}
            <div className="absolute bottom-4 w-4 h-4 bg-white rounded-full z-20 shadow-lg" />

            {/* Risk Text */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                key={riskLevel}
                className={cn("mt-4 text-2xl font-bold tracking-wider", getColor())}
            >
                {riskLevel.toUpperCase()} RISK
            </motion.div>
        </div>
    );
};

export default RiskMeter;
