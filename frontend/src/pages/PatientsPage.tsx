import { useEffect, useState } from 'react';
import { supabase } from '@/services/supabase';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Trash2, User, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const PatientsPage = () => {
    const [patients, setPatients] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchPatients();
    }, []);

    const fetchPatients = async () => {
        try {
            const { data: { session } } = await supabase.auth.getSession();
            const token = session?.access_token;

            const response = await fetch(`${import.meta.env.VITE_API_URL}/patients`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                const data = await response.json();
                setPatients(data);
            } else {
                console.error('Failed to fetch patients');
            }
        } catch (error) {
            console.error('Error fetching patients:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this patient?')) return;
        try {
            const { error } = await supabase.from('patients').delete().eq('id', id);
            if (error) throw error;
            setPatients(patients.filter(p => p.id !== id));
        } catch (error) {
            console.error('Error deleting patient:', error);
            alert('Failed to delete patient');
        }
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
                    <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-gray-900 dark:text-white uppercase transition-all">Patients Database</h1>
                    <p className="text-xs sm:text-sm font-bold text-gray-400 dark:text-gray-500 mt-1 flex items-center gap-2">
                        <span className="inline-block h-1.5 w-1.5 rounded-full bg-neon-blue animate-pulse" />
                        {patients.length} ENROLLED CLINICAL PROFILES
                    </p>
                </div>
                <Link to="/patients/new">
                    <Button className="bg-neon-blue hover:bg-neon-blue/80 text-black font-black w-full sm:w-auto px-6 shadow-[0_0_15px_rgba(0,240,255,0.2)] hover:shadow-[0_0_25px_rgba(0,240,255,0.4)] transition-all">
                        <Plus className="mr-2 h-4 w-4 stroke-[3px]" /> REGISTER PATIENT
                    </Button>
                </Link>
            </motion.div>

            {/* ── DESKTOP TABLE ── */}
            <div className="hidden md:block rounded-2xl border border-gray-200 dark:border-white/10 overflow-hidden bg-white/50 dark:bg-black/20 backdrop-blur-sm">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-gray-50/50 dark:bg-white/5 border-b border-gray-200 dark:border-white/10">
                            <TableHead className="font-bold text-[10px] uppercase tracking-widest py-4">Full Identity</TableHead>
                            <TableHead className="font-bold text-[10px] uppercase tracking-widest py-4">Clinical Age</TableHead>
                            <TableHead className="font-bold text-[10px] uppercase tracking-widest py-4">Gender</TableHead>
                            <TableHead className="font-bold text-[10px] uppercase tracking-widest py-4">History Overview</TableHead>
                            <TableHead className="text-right font-bold text-[10px] uppercase tracking-widest py-4">Operations</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center py-20 text-gray-400 font-medium italic">Synchronizing patient data...</TableCell>
                            </TableRow>
                        ) : patients.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center py-20 text-gray-400 font-medium h-[300px]">
                                    <div className="flex flex-col items-center gap-4 opacity-50">
                                        <User className="h-12 w-12" />
                                        <p>No clinical profiles detected in encrypted storage.</p>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : (
                            patients.map((patient, i) => (
                                <motion.tr
                                    key={patient.id}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: i * 0.05, duration: 0.3 }}
                                    className="border-b border-gray-100/50 dark:border-white/5 hover:bg-neon-blue/[0.02] transition-colors group"
                                >
                                    <TableCell className="font-bold text-gray-900 dark:text-gray-100 py-4 group-hover:text-neon-blue transition-colors">{patient.name}</TableCell>
                                    <TableCell className="text-gray-600 dark:text-gray-400 font-medium">{patient.age}</TableCell>
                                    <TableCell className="text-gray-600 dark:text-gray-400 font-medium">{patient.gender}</TableCell>
                                    <TableCell className="max-w-[200px] truncate text-gray-500 dark:text-gray-500 italic text-xs">{patient.medical_history || 'N/A'}</TableCell>
                                    <TableCell className="text-right py-4">
                                        <div className="flex items-center justify-end gap-2">
                                            <Link to={`/patients/${patient.id}`}>
                                                <Button variant="ghost" size="sm" className="h-8 px-4 font-bold text-[10px] uppercase tracking-tighter hover:text-neon-blue hover:bg-neon-blue/10 border border-transparent hover:border-neon-blue/20 rounded-full">Explore Details</Button>
                                            </Link>
                                            <Button 
                                                variant="ghost" 
                                                size="sm" 
                                                onClick={() => handleDelete(patient.id)}
                                                className="h-8 w-8 p-0 text-gray-400 hover:text-red-500 hover:bg-red-500/10 rounded-full transition-all"
                                            >
                                                <Trash2 className="h-3.5 w-3.5" />
                                            </Button>
                                        </div>
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
                    <div className="text-center py-20 text-gray-400 animate-pulse">Syncing...</div>
                ) : patients.length === 0 ? (
                    <div className="text-center py-20 text-gray-500 border border-dashed border-gray-200 dark:border-white/10 rounded-2xl">No profiles found.</div>
                ) : (
                    patients.map((patient, i) => (
                        <motion.div
                            key={patient.id}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.08, duration: 0.4 }}
                            className="glass-card p-5 rounded-2xl border border-gray-200 dark:border-white/10 relative overflow-hidden group shadow-sm active:scale-[0.98] transition-transform"
                        >
                            {/* Decorative accent */}
                            <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-neon-blue transition-all group-hover:w-2" />
                            
                            <div className="flex items-start justify-between gap-4">
                                <div className="flex items-center gap-4 min-w-0">
                                    <div className="p-3 bg-neon-blue/10 dark:bg-neon-blue/20 rounded-2xl flex-shrink-0 group-hover:rotate-12 transition-transform">
                                        <User className="h-5 w-5 text-neon-blue" />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="font-black text-gray-900 dark:text-white truncate uppercase tracking-tight text-lg">{patient.name}</p>
                                        <p className="text-[10px] font-black uppercase text-gray-500 dark:text-gray-500 tracking-widest">{patient.age} YRS · {patient.gender}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-1 flex-shrink-0 pt-1">
                                    <Link to={`/patients/${patient.id}`}>
                                        <Button variant="ghost" size="sm" className="h-9 w-9 p-0 rounded-full hover:text-neon-blue hover:bg-neon-blue/10 border border-transparent hover:border-neon-blue/20">
                                            <ChevronRight className="h-5 w-5" />
                                        </Button>
                                    </Link>
                                    <Button 
                                        variant="ghost" 
                                        size="sm" 
                                        onClick={() => handleDelete(patient.id)} 
                                        className="h-9 w-9 p-0 rounded-full text-gray-400 hover:text-red-500 hover:bg-red-500/10"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                            {patient.medical_history && (
                                <div className="mt-4 pl-14">
                                    <p className="text-[11px] text-gray-500 dark:text-gray-500 italic bg-gray-50 dark:bg-white/5 p-2 rounded-lg border border-gray-100 dark:border-white/5 line-clamp-2 leading-relaxed">
                                        {patient.medical_history}
                                    </p>
                                </div>
                            )}
                        </motion.div>
                    ))
                )}
            </div>
        </div>
    );
};

export default PatientsPage;
