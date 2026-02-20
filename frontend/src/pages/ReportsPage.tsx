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

    return (
        <div className="space-y-5 sm:space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900 dark:text-white">Reports History</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Past analyses and risk assessments</p>
            </div>

            {/* ── DESKTOP TABLE ── */}
            <div className="hidden md:block rounded-xl border border-gray-200 dark:border-white/10 overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-gray-50 dark:bg-white/5">
                            <TableHead className="font-semibold">Patient Name</TableHead>
                            <TableHead className="font-semibold">Date</TableHead>
                            <TableHead className="font-semibold">Drug</TableHead>
                            <TableHead className="font-semibold">Risk Level</TableHead>
                            <TableHead className="text-right font-semibold">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center py-10 text-gray-500">Loading...</TableCell>
                            </TableRow>
                        ) : reports.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center py-10 text-gray-500">No reports found.</TableCell>
                            </TableRow>
                        ) : (
                            reports.map((report, i) => (
                                <motion.tr
                                    key={report.id}
                                    initial={{ opacity: 0, y: 6 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.04 }}
                                    className="border-b border-gray-100 dark:border-white/5 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                                >
                                    <TableCell className="font-medium text-gray-900 dark:text-white">{report.patients?.name || 'Unknown'}</TableCell>
                                    <TableCell className="text-gray-600 dark:text-gray-400">{new Date(report.created_at).toLocaleDateString()}</TableCell>
                                    <TableCell className="text-gray-600 dark:text-gray-400">{report.drug_name || '—'}</TableCell>
                                    <TableCell>
                                        {report.risk_level && (
                                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${riskColor(report.risk_level)}`}>
                                                {report.risk_level}
                                            </span>
                                        )}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Link to={`/patients/${report.patient_id}`}>
                                            <Button variant="ghost" size="sm" className="hover:text-neon-blue hover:bg-neon-blue/10">
                                                <Eye className="mr-1 h-4 w-4" /> View
                                            </Button>
                                        </Link>
                                    </TableCell>
                                </motion.tr>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* ── MOBILE CARD LIST ── */}
            <div className="md:hidden space-y-3">
                {loading ? (
                    <div className="text-center py-10 text-gray-500">Loading...</div>
                ) : reports.length === 0 ? (
                    <div className="text-center py-10 text-gray-500">No reports found.</div>
                ) : (
                    reports.map((report, i) => (
                        <motion.div
                            key={report.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.05 }}
                            className="glass-card p-4 rounded-xl border border-gray-200 dark:border-white/10"
                        >
                            <div className="flex items-start justify-between gap-2">
                                <div className="flex items-center gap-3 min-w-0">
                                    <div className="p-2 bg-neon-blue/10 dark:bg-neon-blue/20 rounded-lg flex-shrink-0">
                                        <FileText className="h-4 w-4 text-neon-blue" />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="font-semibold text-gray-900 dark:text-white truncate">{report.patients?.name || 'Unknown'}</p>
                                        <div className="flex items-center gap-2 mt-0.5">
                                            <Calendar className="h-3 w-3 text-gray-400" />
                                            <span className="text-xs text-gray-500 dark:text-gray-400">{new Date(report.created_at).toLocaleDateString()}</span>
                                            {report.drug_name && <span className="text-xs text-gray-500">· {report.drug_name}</span>}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 flex-shrink-0">
                                    {report.risk_level && (
                                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${riskColor(report.risk_level)}`}>
                                            {report.risk_level}
                                        </span>
                                    )}
                                    <Link to={`/patients/${report.patient_id}`}>
                                        <Button variant="ghost" size="sm" className="h-8 px-2 hover:text-neon-blue hover:bg-neon-blue/10">
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
