import GlassCard from '@/components/ui/GlassCard';
import { 
    Users, AlertTriangle, FileText, TrendingUp, CheckCircle, 
    Cpu, Globe, ShieldCheck, Zap, Activity, ChevronRight, Search,
    Terminal, Database, Radio, Loader2
} from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/services/supabase';
import { 
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, 
    ResponsiveContainer, Cell, Radar, RadarChart, PolarGrid, 
    PolarAngleAxis, PolarRadiusAxis 
} from 'recharts';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

const Dashboard = () => {
    const [stats, setStats] = useState({
        patients: 0,
        highRisk: 0,
        safe: 0
    });
    const [alerts, setAlerts] = useState<any[]>([]);
    const [chartData, setChartData] = useState<any[]>([]);
    const [radarData, setRadarData] = useState<any[]>([
        { subject: 'Genomic Sync', A: 120, fullMark: 150 },
        { subject: 'AI Accuracy', A: 98, fullMark: 150 },
        { subject: 'Drug DB', A: 86, fullMark: 150 },
        { subject: 'Clinician IQ', A: 99, fullMark: 150 },
        { subject: 'Latency', A: 85, fullMark: 150 },
        { subject: 'Security', A: 65, fullMark: 150 },
    ]);

    const [systemLoad, setSystemLoad] = useState(42);
    const [logs, setLogs] = useState<string[]>([]);
    const logRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const fetchDashboardData = async () => {
            const { count: patientCount } = await supabase.from('patients').select('*', { count: 'exact', head: true });
            const { count: highRiskCount } = await supabase.from('analyses').select('*', { count: 'exact', head: true }).eq('risk_level', 'High');
            const { count: safeCount } = await supabase.from('analyses').select('*', { count: 'exact', head: true }).eq('risk_level', 'Low');

            setStats({
                patients: patientCount || 0,
                highRisk: highRiskCount || 0,
                safe: safeCount || 0
            });

            const data = [
                { name: 'Safe', value: safeCount || 0, color: 'hsl(var(--neon-green))' },
                { name: 'Moderate', value: 2, color: 'hsl(var(--neon-amber))' }, 
                { name: 'High Risk', value: highRiskCount || 0, color: 'hsl(var(--neon-red))' },
            ];
            setChartData(data);

            const { data: recentAlerts } = await supabase
                .from('analyses')
                .select('*, patients(name)')
                .neq('risk_level', 'Low')
                .order('created_at', { ascending: false })
                .limit(5);

            if (recentAlerts && recentAlerts.length > 0) {
                setAlerts(recentAlerts);
            } else {
                const { data: anyActivity } = await supabase
                    .from('analyses')
                    .select('*, patients(name)')
                    .order('created_at', { ascending: false })
                    .limit(5);
                if (anyActivity) setAlerts(anyActivity);
            }
        };

        fetchDashboardData();

        const logInterval = setInterval(() => {
            const events = [
                "AUTHENTICATED: NODE-01",
                "SYNC: GENOMIC_DB LOADED",
                "AI_SCAN: POOL COMPLETE",
                "SECURITY: Handshake Valid",
                "ALERT: Variant #832 Detected",
            ];
            const newLog = `[${new Date().toLocaleTimeString('en-US', { hour12: false })}] ${events[Math.floor(Math.random() * events.length)]}`;
            setLogs(prev => [...prev.slice(-3), newLog]);
            if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
        }, 5000);

        const loadInterval = setInterval(() => {
            setSystemLoad(prev => Math.min(100, Math.max(10, prev + (Math.random() * 8 - 4))));
        }, 3000);

        return () => {
            clearInterval(logInterval);
            clearInterval(loadInterval);
        };
    }, []);

    const fadeInUp = {
        initial: { opacity: 0, y: 15 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] }
    };

    const staggerContainer = {
        animate: {
            transition: {
                staggerChildren: 0.08
            }
        }
    };

    return (
        <motion.div 
            className="space-y-6 pb-8 overflow-x-hidden"
            initial="initial"
            animate="animate"
            variants={staggerContainer}
        >
            {/* ═══ COMPACT HEADER ═══ */}
            <motion.div variants={fadeInUp} className="flex flex-col lg:flex-row items-center gap-6 px-4 relative">
                <div className="absolute top-0 right-0 left-0 h-full pointer-events-none overflow-hidden opacity-5 select-none">
                    <div className="flex gap-4 animate-marquee whitespace-nowrap text-[6px] font-mono text-neon-blue">
                         {Array(30).fill("010110...GENE-SCAN...INTEGRITY:99.8%").join("  •  ")}
                    </div>
                </div>

                <div className="flex-1 text-left w-full lg:w-auto relative z-10">
                    <div className="flex items-center gap-2.5 mb-2.5 text-left">
                        <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-neon-blue/10 border border-neon-blue/20">
                            <Radio className="h-2.5 w-2.5 text-neon-blue animate-pulse" />
                            <span className="text-[9px] font-black text-neon-blue uppercase tracking-widest">Live</span>
                        </div>
                        <span className="text-[9px] font-black text-gray-500 uppercase tracking-[0.3em]">PharmaGuard Console</span>
                    </div>
                    <h1 className="text-3xl sm:text-5xl font-black text-gray-900 dark:text-white tracking-tighter uppercase leading-[0.95] text-left">
                        Commander <span className="text-neon-blue">Dashboard</span>
                    </h1>
                    <p className="text-[11px] sm:text-sm text-gray-500 dark:text-gray-400 mt-3 max-w-xl font-bold italic border-l-2 border-neon-blue/30 pl-4 leading-relaxed text-left">
                        12 clinical variants flagged. AI Core synchronized with precision pharmacogenomics.
                    </p>
                </div>

                <GlassCard className="w-full lg:w-[360px] p-5 border-t-2 border-neon-blue shadow-xl bg-neon-blue/[0.02] overflow-hidden relative group">
                    <div className="absolute top-[-30px] right-[-30px] opacity-[0.02] group-hover:scale-110 transition-transform duration-1000 rotate-12">
                        <Loader2 className="h-40 w-40 text-neon-blue animate-spin-slow" />
                    </div>
                    <div className="relative z-10 flex flex-col gap-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-[9px] font-black uppercase tracking-[0.2em] text-neon-blue flex items-center gap-1.5">
                                <Cpu className="h-3 w-3" /> Neural Engine
                            </h3>
                            <Activity className="h-3 w-3 text-neon-blue animate-pulse" />
                        </div>
                        <p className="text-[11px] font-black text-gray-700 dark:text-white leading-relaxed italic text-left">
                            "AI identifies surge in <span className="text-neon-red drop-shadow-neon-red">22% High-Risk</span> interactions."
                        </p>
                        <div className="space-y-1.5">
                            <div className="flex justify-between text-[8px] font-black text-neon-blue/60 uppercase">
                                <span>Load</span>
                                <span>{Math.round(systemLoad)}%</span>
                            </div>
                            <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                                <motion.div 
                                    className="h-full bg-gradient-to-r from-neon-blue to-neon-purple" 
                                    animate={{ width: `${systemLoad}%` }}
                                />
                            </div>
                        </div>
                    </div>
                </GlassCard>
            </motion.div>

            {/* ═══ COMPACT STATS GRID ═══ */}
            <motion.div 
                className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 px-4"
                variants={staggerContainer}
            >
                {[
                    { label: 'Bio-Assets', val: stats.patients, icon: Users, color: 'neon-blue', trend: '+12% FLOW' },
                    { label: 'Lethal Alerts', val: stats.highRisk, icon: AlertTriangle, color: 'neon-red', trend: 'ACTION', border: true },
                    { label: 'Validated', val: stats.safe, icon: CheckCircle, color: 'neon-green', trend: 'OPTIMAL' },
                    { label: 'Logs', val: '05', icon: FileText, color: 'neon-purple', trend: 'SYNCED' },
                ].map((item, i) => (
                    <motion.div key={i} variants={fadeInUp}>
                        <GlassCard 
                            className={cn(
                                "flex flex-col justify-between h-full p-5 hover-lift cursor-default group transition-all duration-300",
                                item.border ? "border-neon-red/20 bg-neon-red/[0.02] text-left" : "hover:border-neon-blue/20 text-left",
                            )}
                        >
                            <div className="flex justify-between items-start">
                                <div className="text-left">
                                    <p className={cn("text-[8px] font-black uppercase tracking-[0.2em] mb-2", `text-${item.color}`)}>
                                        {item.label}
                                    </p>
                                    <p className="text-3xl font-black text-gray-900 dark:text-white tracking-tighter">
                                        {item.val}
                                    </p>
                                </div>
                                <div className={cn("p-2.5 rounded-2xl bg-white/5 transition-all group-hover:scale-110 shadow-sm", `text-${item.color}`)}>
                                    <item.icon className="h-5 w-5" />
                                </div>
                            </div>
                            <div className={cn("mt-5 flex items-center text-[8px] font-black tracking-widest", `text-${item.color}/70`)}>
                                <div className={cn("h-1 w-4 rounded-full mr-2", `bg-${item.color}`)} />
                                {item.trend}
                            </div>
                        </GlassCard>
                    </motion.div>
                ))}
            </motion.div>

            {/* ═══ COMPACT CHARTS AREA ═══ */}
            <motion.div 
                className="grid gap-6 grid-cols-1 lg:grid-cols-12 px-4"
                variants={staggerContainer}
            >
                <GlassCard className="col-span-1 lg:col-span-8 p-0 overflow-hidden relative group">
                    <div className="p-5 border-b border-white/5 flex justify-between items-center bg-black/20 text-left">
                        <div className="text-left flex items-center gap-3">
                            <TrendingUp className="h-4 w-4 text-neon-blue" />
                            <div>
                                <h3 className="font-black text-sm text-gray-900 dark:text-white uppercase tracking-tight">Active Pipeline</h3>
                                <p className="text-[8px] font-bold text-gray-500 uppercase tracking-widest mt-0.5">Global Risk Spectrum</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full border border-neon-blue/10 bg-neon-blue/5">
                             <div className="h-1 w-1 rounded-full bg-neon-blue animate-pulse" />
                             <span className="text-[8px] font-black text-neon-blue uppercase">Live</span>
                        </div>
                    </div>
                    <div className="p-5 h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#222" vertical={false} />
                                <XAxis dataKey="name" stroke="#444" fontSize={8} fontWeight={900} tickLine={false} axisLine={false} />
                                <YAxis stroke="#444" fontSize={8} fontWeight={900} tickLine={false} axisLine={false} />
                                <Tooltip
                                    cursor={{ fill: 'rgba(255,255,255,0.02)' }}
                                    content={({ active, payload }) => {
                                        if (active && payload && payload.length) {
                                            return (
                                                <div className="bg-black/95 border border-white/10 p-3 rounded-lg backdrop-blur-xl shadow-2xl">
                                                    <p className="text-[8px] font-black text-white/40 uppercase tracking-widest mb-1">{payload[0].payload.name}</p>
                                                    <p className="text-xl font-black" style={{ color: payload[0].payload.color }}>
                                                        {payload[0].value} <span className="text-[9px] text-gray-500 italic font-normal">Genomic Signals</span>
                                                    </p>
                                                </div>
                                            );
                                        }
                                        return null;
                                    }}
                                />
                                <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                                    {chartData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} fillOpacity={0.8} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </GlassCard>

                <GlassCard className="col-span-1 lg:col-span-4 p-5 flex flex-col items-center justify-center overflow-hidden group text-left relative">
                    <h3 className="font-black text-sm text-gray-900 dark:text-white uppercase tracking-tight mb-1">Synapse Map</h3>
                    <p className="text-[8px] font-bold text-gray-500 uppercase tracking-widest mb-6 text-center italic opacity-60">System Synced</p>
                    
                    <div className="h-[260px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <RadarChart data={radarData}>
                                <PolarGrid stroke="#222" />
                                <PolarAngleAxis dataKey="subject" tick={{ fill: '#555', fontSize: 8, fontWeight: 900 }} />
                                <Radar
                                    name="Health"
                                    dataKey="A"
                                    stroke="hsl(var(--neon-purple))"
                                    fill="hsl(var(--neon-purple))"
                                    fillOpacity={0.1}
                                />
                            </RadarChart>
                        </ResponsiveContainer>
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-3 w-full">
                        <div className="p-3 rounded-xl bg-neon-purple/5 border border-neon-purple/10 text-center">
                            <p className="text-[8px] font-black text-neon-purple uppercase mb-0.5">Sync</p>
                            <p className="text-xl font-black text-white font-mono leading-none">99.4</p>
                        </div>
                        <div className="p-3 rounded-xl bg-neon-blue/5 border border-neon-blue/10 text-center">
                            <p className="text-[8px] font-black text-neon-blue uppercase mb-0.5">Conf</p>
                            <p className="text-xl font-black text-white font-mono leading-none">0.98</p>
                        </div>
                    </div>
                </GlassCard>
            </motion.div>

            {/* ═══ COMPACT FEED & TERMINAL ═══ */}
            <motion.div 
                className="grid gap-6 grid-cols-1 lg:grid-cols-12 px-4"
                variants={staggerContainer}
            >
                <GlassCard className="col-span-1 lg:col-span-7 p-6 hover:border-neon-blue/10 text-left shadow-lg">
                    <div className="flex justify-between items-center mb-6 pb-4 border-b border-white/5">
                        <div className="flex items-center gap-3">
                            <Database className="h-4 w-4 text-neon-blue" />
                            <h3 className="font-black text-sm text-gray-900 dark:text-white uppercase tracking-tight">Active Neural Feed</h3>
                        </div>
                        <span className="text-[8px] font-black text-neon-blue uppercase px-2 py-0.5 rounded-full border border-neon-blue/10">Active</span>
                    </div>

                    <div className="space-y-2.5">
                        {alerts.length === 0 ? (
                            <div className="text-gray-500 text-center py-10 italic text-[10px] font-bold opacity-30 tracking-[0.4em]">SYSTEMS NOMINAL</div>
                        ) : (
                            alerts.map((alert: any) => (
                                <motion.div
                                    key={alert.id}
                                    variants={fadeInUp}
                                    className="flex items-center gap-4 p-3 rounded-2xl hover:bg-white/[0.02] border border-transparent hover:border-white/5 group/item transition-all text-left"
                                >
                                    <div className={cn(
                                        "h-2 w-2 rounded-full animate-pulse",
                                        alert.risk_level === 'High' ? 'bg-neon-red shadow-[0_0_10px_hsla(var(--neon-red),1)]' : 
                                        alert.risk_level === 'Moderate' ? 'bg-neon-amber shadow-[0_0_10px_hsla(var(--neon-amber),1)]' : 'bg-neon-green'
                                    )} />
                                    <div className="flex-1 text-left">
                                        <div className="flex items-center gap-2">
                                            <p className="text-xs font-black text-gray-900 dark:text-white uppercase tracking-tighter group-hover/item:text-neon-blue">
                                                {alert.drug_name}
                                            </p>
                                            <span className="text-[7px] font-black text-gray-600 font-mono">#{alert.id.substring(0, 4)}</span>
                                        </div>
                                        <p className="text-[10px] text-gray-500 font-bold uppercase mt-0.5 leading-none">
                                            Sub: <span className="text-neon-blue/60">{alert.patients?.name}</span>
                                        </p>
                                    </div>
                                    <ChevronRight className="h-4 w-4 text-gray-700 group-hover/item:text-neon-blue transition-all" />
                                </motion.div>
                            ))
                        )}
                    </div>
                </GlassCard>

                <GlassCard className="col-span-1 lg:col-span-5 p-6 border-neon-purple/10 bg-neon-purple/[0.01] text-left relative overflow-hidden">
                    <h3 className="font-black text-sm text-gray-900 dark:text-white uppercase tracking-tight mb-6">Control Terminal</h3>
                    <div className="grid grid-cols-2 gap-4">
                        {[
                            { label: 'New Scan', icon: Search, color: 'neon-blue' },
                            { label: 'Add Patient', icon: Globe, color: 'neon-green' },
                            { label: 'Database', icon: Cpu, color: 'neon-amber' },
                            { label: 'Archive', icon: ShieldCheck, color: 'neon-purple' },
                        ].map((btn, idx) => (
                            <motion.button
                                key={idx}
                                whileHover={{ scale: 1.02, y: -2 }}
                                whileTap={{ scale: 0.98 }}
                                className={cn(
                                    "p-4 rounded-2xl flex flex-col gap-3 text-left group/btn transition-all border border-white/5",
                                    `hover:border-${btn.color}/30 bg-white/[0.02]`
                                )}
                            >
                                <div className={cn("p-2 rounded-lg w-fit transition-transform group-hover/btn:rotate-6 shadow-sm", `bg-${btn.color}/10 text-${btn.color}`)}>
                                    <btn.icon className="h-4 w-4" />
                                </div>
                                <p className="font-black text-[10px] text-white uppercase tracking-tighter">{btn.label}</p>
                            </motion.button>
                        ))}
                    </div>

                    <div className="mt-6 p-5 rounded-2xl bg-black/60 border-2 border-dashed border-white/5 flex flex-col items-center justify-center text-center group hover:bg-black/80 transition-all">
                        <Radio className="h-6 w-6 text-gray-600 mb-2 group-hover:text-neon-blue animate-pulse" />
                        <p className="text-[8px] font-black text-gray-500 uppercase tracking-widest leading-none">Genomic Network Connected</p>
                    </div>
                </GlassCard>
            </motion.div>

            {/* ═══ MINI LOG TERMINAL ═══ */}
            <motion.div variants={fadeInUp} className="px-4">
                <GlassCard className="p-3 bg-black border-neon-blue/10">
                    <div className="flex items-center gap-2 mb-2 pb-2 border-b border-white/5">
                        <Terminal className="h-3 w-3 text-neon-blue" />
                        <span className="text-[8px] font-black text-neon-blue uppercase tracking-widest">Telemetry Log</span>
                    </div>
                    <div 
                        ref={logRef}
                        className="h-12 flex flex-col gap-0.5 overflow-y-auto custom-scrollbar font-mono text-[8px] text-gray-600"
                    >
                        {logs.map((log, i) => (
                            <div key={i} className="hover:text-neon-blue transition-colors cursor-default leading-tight">
                                {log}
                            </div>
                        ))}
                    </div>
                </GlassCard>
            </motion.div>
        </motion.div>
    );
};

export default Dashboard;
