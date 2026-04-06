import { useEffect, useState } from 'react';
import { supabase } from '@/services/supabase';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Eye, FileText, Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const ReportsPage = () => {
    const [reports, setReports] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchReports();
    }, []);

    const fetchReports = async () => {
        try {
            const { data, error } = await supabase
                .from('analyses')
                .select('*, patients(name)')
                .order('created_at', { ascending: false });

            if (data) setReports(data);
            if (error) throw error;
        } catch (error) {
            console.error('Error fetching reports:', error);
        } finally {
            setLoading(false);
        }
    };

    const riskColor = (level: string) => {
        if (level === 'High') return 'text-red-500 bg-red-500/10 border-red-500/20';
        if (level === 'Moderate') return 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20';
        return 'text-green-500 bg-green-500/10 border-green-500/20';
    };

    const fadeInUp = {
        initial: { opacity: 0, y: 15 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.4 }
    };

    return (
        <div className="space-y-6 sm:space-y-8">
            {/* Header */}
            <motion.div 
                {...fadeInUp}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
                <div>
                    <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-gray-900 dark:text-white uppercase transition-all">Clinical Insights Archive</h1>
                    <p className="text-xs sm:text-sm font-bold text-gray-400 dark:text-gray-500 mt-1 flex items-center gap-2 uppercase tracking-wide">
                        <span className="inline-block h-1.5 w-1.5 rounded-full bg-neon-purple animate-pulse" />
                        {reports.length} Analytical Reports Generated
                    </p>
                </div>
            </motion.div>

            {/* ── DESKTOP TABLE ── */}
            <div className="hidden md:block rounded-2xl border border-gray-200 dark:border-white/10 overflow-hidden bg-white/50 dark:bg-black/20 backdrop-blur-sm">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-gray-50/50 dark:bg-white/5 border-b border-gray-200 dark:border-white/10">
                            <TableHead className="font-bold text-[10px] uppercase tracking-widest py-4">Clinical Subject</TableHead>
                            <TableHead className="font-bold text-[10px] uppercase tracking-widest py-4">Generation Date</TableHead>
                            <TableHead className="font-bold text-[10px] uppercase tracking-widest py-4">Analyzed Substance</TableHead>
                            <TableHead className="font-bold text-[10px] uppercase tracking-widest py-4">Risk Severity</TableHead>
                            <TableHead className="text-right font-bold text-[10px] uppercase tracking-widest py-4">Verification</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center py-20 text-gray-400 font-medium italic">Retreiving archived clinical data...</TableCell>
                            </TableRow>
                        ) : reports.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center py-20 text-gray-400 font-medium h-[300px]">
                                    <div className="flex flex-col items-center gap-4 opacity-50">
                                        <FileText className="h-12 w-12" />
                                        <p>No analytical reports found in history.</p>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : (
                            reports.map((report, i) => (
                                <motion.tr
                                    key={report.id}
                                    initial={{ opacity: 0, x: 10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: i * 0.05, duration: 0.3 }}
                                    className="border-b border-gray-100/50 dark:border-white/5 hover:bg-neon-purple/[0.02] transition-colors group"
                                >
                                    <TableCell className="font-bold text-gray-900 dark:text-gray-100 py-4 group-hover:text-neon-purple transition-colors uppercase tracking-tight text-xs">{report.patients?.name || 'Unknown Subject'}</TableCell>
                                    <TableCell className="text-gray-500 dark:text-gray-400 font-bold text-[11px] font-mono">{new Date(report.created_at).toLocaleDateString()}</TableCell>
                                    <TableCell className="text-gray-600 dark:text-gray-400 font-black text-xs uppercase">{report.drug_name || '—'}</TableCell>
                                    <TableCell>
                                        {report.risk_level && (
                                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter border ${riskColor(report.risk_level)} shadow-sm`}>
                                                {report.risk_level}
                                            </span>
                                        )}
                                    </TableCell>
                                    <TableCell className="text-right py-4">
                                        <Link to={`/patients/${report.patient_id}`}>
                                            <Button variant="ghost" size="sm" className="h-8 px-4 font-bold text-[10px] uppercase tracking-tighter hover:text-neon-purple hover:bg-neon-purple/10 border border-transparent hover:border-neon-purple/20 rounded-full">Explore Report</Button>
                                        </Link>
                                    </TableCell>
                                </motion.tr>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* ── MOBILE CARD LIST ── */}
            <div className="md:hidden space-y-4">
                {loading ? (
                    <div className="text-center py-20 text-gray-400 animate-pulse font-bold tracking-widest uppercase text-xs">Accessing Archives...</div>
                ) : reports.length === 0 ? (
                    <div className="text-center py-20 text-gray-500 border border-dashed border-gray-200 dark:border-white/10 rounded-2xl">No reports found.</div>
                ) : (
                    reports.map((report, i) => (
                        <motion.div
                            key={report.id}
                            initial={{ opacity: 0, scale: 0.95 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.08, duration: 0.4 }}
                            className="glass-card p-5 rounded-2xl border border-gray-200 dark:border-white/10 relative overflow-hidden group shadow-sm active:scale-[0.98] transition-transform"
                        >
                            <div className="flex items-start justify-between gap-4">
                                <div className="flex items-center gap-4 min-w-0">
                                    <div className="p-3 bg-neon-purple/10 dark:bg-neon-purple/20 rounded-2xl flex-shrink-0 group-hover:scale-110 transition-transform">
                                        <FileText className="h-5 w-5 text-neon-purple" />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="font-black text-gray-900 dark:text-white truncate uppercase tracking-tight text-lg">{report.patients?.name || 'Unknown'}</p>
                                        <div className="flex items-center gap-2 mt-1">
                                            <Calendar className="h-3 w-3 text-gray-400" />
                                            <span className="text-[10px] font-bold text-gray-500 dark:text-gray-500 font-mono tracking-tighter">{new Date(report.created_at).toLocaleDateString()}</span>
                                            {report.drug_name && <span className="text-[10px] font-black uppercase text-neon-purple/70 tracking-widest">· {report.drug_name}</span>}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex flex-col items-end gap-2 flex-shrink-0">
                                    {report.risk_level && (
                                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-tighter border ${riskColor(report.risk_level)} shadow-sm`}>
                                            {report.risk_level}
                                        </span>
                                    )}
                                    <Link to={`/patients/${report.patient_id}`}>
                                        <Button variant="ghost" size="sm" className="h-9 w-9 p-0 rounded-full hover:text-neon-purple hover:bg-neon-purple/10 border border-transparent hover:border-neon-purple/20">
                                            <Eye className="h-4 w-4" />
                                        </Button>
                                    </Link>
                                </div>
                            </div>
                        </motion.div>
                    ))
                )}
            </div>
        </div>
    );
};

export default ReportsPage;
