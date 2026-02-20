import GlassCard from '@/components/ui/GlassCard';
import { Users, AlertTriangle, FileText, TrendingUp, CheckCircle } from 'lucide-react';
import { useState, useEffect } from 'react';
import { supabase } from '@/services/supabase';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { motion } from 'framer-motion';


const Dashboard = () => {
    // Mock data for animations
    const [stats, setStats] = useState({
        patients: 0,
        highRisk: 0,
        safe: 0
    });
    const [alerts, setAlerts] = useState<any[]>([]);
    const [chartData, setChartData] = useState<any[]>([]);

    useEffect(() => {
        const fetchDashboardData = async () => {
            // Fetch Patient Count
            const { count: patientCount } = await supabase.from('patients').select('*', { count: 'exact', head: true });

            // Fetch High Risk Analysis
            const { count: highRiskCount } = await supabase.from('analyses').select('*', { count: 'exact', head: true }).eq('risk_level', 'High');

            // Fetch Safe Analysis
            const { count: safeCount } = await supabase.from('analyses').select('*', { count: 'exact', head: true }).eq('risk_level', 'Low');

            setStats({
                patients: patientCount || 0,
                highRisk: highRiskCount || 0,
                safe: safeCount || 0
            });

            // Prepare Chart Data
            const data = [
                { name: 'Safe', value: safeCount || 0, color: '#10b981' }, // neon-green
                { name: 'Moderate', value: 0, color: '#f59e0b' }, // amber
                { name: 'High Risk', value: highRiskCount || 0, color: '#ef4444' }, // red
            ];
            setChartData(data);

            // Fetch Recent Activity (Show all for now to ensure visibility, usually filtered by High/Mod)
            const { data: recentAlerts } = await supabase
                .from('analyses')
                .select('*, patients(name)')
                .neq('risk_level', 'Low') // Show High and Moderate
                .order('created_at', { ascending: false })
                .limit(5);

            // Fallback: If no alerts, show recent analyses generally? 
            // For "Alerts" strictly, we keep it to non-Low. 
            // But if empty, we might want to show "All Systems Operational".

            if (recentAlerts && recentAlerts.length > 0) {
                setAlerts(recentAlerts);
            } else {
                // Try fetching *any* recent analysis to show activity if "alerts" are empty is boring for demo
                const { data: anyActivity } = await supabase
                    .from('analyses')
                    .select('*, patients(name)')
                    .order('created_at', { ascending: false })
                    .limit(5);
                if (anyActivity) setAlerts(anyActivity); // Show general activity if no risks
            }
        };

        fetchDashboardData();
    }, []);

    return (
        <div className="space-y-6 sm:space-y-8">
            <motion.div
                initial={{ opacity: 0, y: -12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
            >
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900 dark:text-white mb-1 sm:mb-2">Dashboard Overview</h1>
                <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400">Real-time pharmacogenomic insights.</p>
            </motion.div>

            <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
                <GlassCard delay={0} className="flex flex-col justify-between">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Patients</p>
                            <motion.p
                                key={stats.patients}
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.4 }}
                                className="text-4xl font-bold text-gray-900 dark:text-white mt-2"
                            >{stats.patients}</motion.p>
                        </div>
                        <div className="p-2 bg-neon-blue/10 dark:bg-neon-blue/20 rounded-lg">
                            <Users className="h-6 w-6 text-neon-blue" />
                        </div>
                    </div>
                    <div className="mt-4 flex items-center text-sm text-neon-green">
                        <TrendingUp className="h-4 w-4 mr-1" />
                        <span>+12% from last month</span>
                    </div>
                </GlassCard>

                <GlassCard delay={0.1} className="flex flex-col justify-between border-red-500/30 bg-red-500/5">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-sm font-medium text-red-600 dark:text-red-300">High Risk Alerts</p>
                            <motion.p
                                key={stats.highRisk}
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.4 }}
                                className="text-4xl font-bold text-gray-900 dark:text-white mt-2"
                            >{stats.highRisk}</motion.p>
                        </div>
                        <div className="p-2 bg-red-500/10 dark:bg-red-500/20 rounded-lg">
                            <AlertTriangle className="h-6 w-6 text-red-500" />
                        </div>
                    </div>
                    <div className="mt-4 text-sm text-gray-500 dark:text-gray-400">
                        Requires immediate attention
                    </div>
                </GlassCard>

                <GlassCard delay={0.2} className="flex flex-col justify-between border-neon-green/30 bg-neon-green/5">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-sm font-medium text-neon-green">Safe Prescriptions</p>
                            <motion.p
                                key={stats.safe}
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.4 }}
                                className="text-4xl font-bold text-gray-900 dark:text-white mt-2"
                            >{stats.safe}</motion.p>
                        </div>
                        <div className="p-2 bg-neon-green/10 dark:bg-neon-green/20 rounded-lg">
                            <CheckCircle className="h-6 w-6 text-neon-green" />
                        </div>
                    </div>
                    <div className="mt-4 text-sm text-gray-500 dark:text-gray-400">
                        Validated compatibility
                    </div>
                </GlassCard>

                <GlassCard delay={0.3} className="flex flex-col justify-between">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Pending Reports</p>
                            <p className="text-4xl font-bold text-gray-900 dark:text-white mt-2">5</p>
                        </div>
                        <div className="p-2 bg-neon-purple/10 dark:bg-neon-purple/20 rounded-lg">
                            <FileText className="h-6 w-6 text-neon-purple" />
                        </div>
                    </div>
                    <div className="mt-4 text-sm text-gray-500 dark:text-gray-400">
                        Analysis in progress
                    </div>
                </GlassCard>
            </div>

            <div className="grid gap-4 sm:gap-6 grid-cols-1 lg:grid-cols-7">
                <GlassCard delay={0.35} className="col-span-1 lg:col-span-4 p-0 overflow-hidden">
                    <div className="p-6 border-b border-gray-200 dark:border-white/10">
                        <h3 className="font-semibold text-lg text-gray-900 dark:text-white">Recent Claims Analysis</h3>
                    </div>
                    <div className="p-4 sm:p-6 h-[240px] sm:h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                                <XAxis dataKey="name" stroke="#666" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis stroke="#666" fontSize={12} tickLine={false} axisLine={false} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#000', border: '1px solid #333', borderRadius: '8px' }}
                                    itemStyle={{ color: '#fff' }}
                                    cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                                />
                                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                                    {chartData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </GlassCard>

                <GlassCard delay={0.4} className="col-span-1 lg:col-span-3">
                    <div className="mb-4">
                        <h3 className="font-semibold text-lg text-gray-900 dark:text-white">Recent Alerts</h3>
                    </div>
                    <div className="space-y-3">
                        {alerts.length === 0 ? (
                            <div className="text-gray-500 text-center py-4">No recent high-risk alerts.</div>
                        ) : (
                            alerts.map((alert: any, i: number) => (
                                <motion.div
                                    key={alert.id}
                                    initial={{ opacity: 0, x: 16 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.45 + i * 0.06, duration: 0.3 }}
                                    className="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                                >
                                    <motion.div
                                        className={`h-2 w-2 rounded-full flex-shrink-0 ${alert.risk_level === 'High' ? 'bg-red-500' : alert.risk_level === 'Moderate' ? 'bg-yellow-500' : 'bg-green-500'}`}
                                        animate={{ scale: alert.risk_level === 'High' ? [1, 1.4, 1] : 1 }}
                                        transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 2 }}
                                    />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{alert.drug_name} - {alert.risk_level}</p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">Patient: {alert.patients?.name}</p>
                                    </div>
                                    <span className="text-xs text-gray-500 flex-shrink-0">{new Date(alert.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                </motion.div>
                            ))
                        )}
                    </div>
                </GlassCard>
            </div>
        </div>
    );
};

export default Dashboard;
