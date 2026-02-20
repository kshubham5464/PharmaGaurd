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

            const response = await fetch('http://localhost:3000/patients', {
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



    return (
        <div className="space-y-5 sm:space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900 dark:text-white">Patients</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{patients.length} registered patient{patients.length !== 1 ? 's' : ''}</p>
                </div>
                <Link to="/patients/new">
                    <Button className="bg-neon-blue hover:bg-neon-blue/80 text-black font-bold w-full sm:w-auto">
                        <Plus className="mr-2 h-4 w-4" /> Add Patient
                    </Button>
                </Link>
            </div>

            {/* ── DESKTOP TABLE (hidden on mobile) ── */}
            <div className="hidden md:block rounded-xl border border-gray-200 dark:border-white/10 overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-gray-50 dark:bg-white/5">
                            <TableHead className="font-semibold">Name</TableHead>
                            <TableHead className="font-semibold">Age</TableHead>
                            <TableHead className="font-semibold">Gender</TableHead>
                            <TableHead className="font-semibold">Medical History</TableHead>
                            <TableHead className="text-right font-semibold">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center py-10 text-gray-500">Loading...</TableCell>
                            </TableRow>
                        ) : patients.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center py-10 text-gray-500">No patients found. Add your first patient!</TableCell>
                            </TableRow>
                        ) : (
                            patients.map((patient, i) => (
                                <motion.tr
                                    key={patient.id}
                                    initial={{ opacity: 0, y: 8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.04 }}
                                    className="border-b border-gray-100 dark:border-white/5 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                                >
                                    <TableCell className="font-medium text-gray-900 dark:text-white">{patient.name}</TableCell>
                                    <TableCell className="text-gray-600 dark:text-gray-400">{patient.age}</TableCell>
                                    <TableCell className="text-gray-600 dark:text-gray-400">{patient.gender}</TableCell>
                                    <TableCell className="max-w-xs truncate text-gray-600 dark:text-gray-400">{patient.medical_history}</TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <Link to={`/patients/${patient.id}`}>
                                                <Button variant="ghost" size="sm" className="hover:text-neon-blue hover:bg-neon-blue/10">View</Button>
                                            </Link>
                                            <Button variant="ghost" size="sm" onClick={() => handleDelete(patient.id)} className="text-red-500 hover:text-red-400 hover:bg-red-500/10">
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </motion.tr>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* ── MOBILE CARD LIST (visible only on mobile) ── */}
            <div className="md:hidden space-y-3">
                {loading ? (
                    <div className="text-center py-10 text-gray-500">Loading...</div>
                ) : patients.length === 0 ? (
                    <div className="text-center py-10 text-gray-500">No patients found.</div>
                ) : (
                    patients.map((patient, i) => (
                        <motion.div
                            key={patient.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.05 }}
                            className="glass-card p-4 rounded-xl border border-gray-200 dark:border-white/10"
                        >
                            <div className="flex items-start justify-between gap-3">
                                <div className="flex items-center gap-3 min-w-0">
                                    <div className="p-2 bg-neon-blue/10 dark:bg-neon-blue/20 rounded-lg flex-shrink-0">
                                        <User className="h-4 w-4 text-neon-blue" />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="font-semibold text-gray-900 dark:text-white truncate">{patient.name}</p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">{patient.age} yrs · {patient.gender}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-1 flex-shrink-0">
                                    <Link to={`/patients/${patient.id}`}>
                                        <Button variant="ghost" size="sm" className="h-8 px-2 hover:text-neon-blue hover:bg-neon-blue/10">
                                            <ChevronRight className="h-4 w-4" />
                                        </Button>
                                    </Link>
                                    <Button variant="ghost" size="sm" onClick={() => handleDelete(patient.id)} className="h-8 px-2 text-red-500 hover:text-red-400 hover:bg-red-500/10">
                                        <Trash2 className="h-3.5 w-3.5" />
                                    </Button>
                                </div>
                            </div>
                            {patient.medical_history && (
                                <p className="mt-2 text-xs text-gray-500 dark:text-gray-400 truncate pl-11">{patient.medical_history}</p>
                            )}
                        </motion.div>
                    ))
                )}
            </div>
        </div>
    );
};

export default PatientsPage;
