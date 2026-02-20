import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/services/supabase';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import GlassCard from '@/components/ui/GlassCard';
import { UploadCloud, FileText, CheckCircle, AlertCircle } from 'lucide-react';

const UploadVCFPage = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [patients, setPatients] = useState<any[]>([]);
    const [selectedPatient, setSelectedPatient] = useState('');
    const [file, setFile] = useState<File | null>(null);
    const [uploadStatus, setUploadStatus] = useState<'idle' | 'success' | 'error'>('idle');
    const [message, setMessage] = useState('');

    useEffect(() => {
        const fetchPatients = async () => {
            const { data } = await supabase.from('patients').select('id, name');
            if (data) setPatients(data);
        };
        fetchPatients();
    }, []);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
            setUploadStatus('idle');
            setMessage('');
        }
    };

    const handleUpload = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!file || !selectedPatient) return;

        setLoading(true);
        setUploadStatus('idle');

        const formData = new FormData();
        formData.append('vcfFile', file);
        formData.append('patient_id', selectedPatient);

        try {
            const { data: { session } } = await supabase.auth.getSession();
            const token = session?.access_token;

            const response = await fetch('http://localhost:3000/upload/vcf', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });

            const result = await response.json();

            if (response.ok) {
                setUploadStatus('success');
                setMessage(`Successfully processed ${result.data ? result.data.length : ''} variants.`);
                // Reset after delay
                setTimeout(() => navigate('/analysis'), 2000);
            } else {
                throw new Error(result.error || 'Upload failed');
            }
        } catch (error: any) {
            console.error(error);
            setUploadStatus('error');
            setMessage(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-6 sm:mb-8">
                <div className="p-3 bg-neon-green/10 dark:bg-neon-green/20 rounded-xl self-start">
                    <UploadCloud className="h-7 w-7 sm:h-8 sm:w-8 text-neon-green" />
                </div>
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white tracking-tight">Upload Genetic Data</h1>
                    <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400">Import VCF files for automated risk analysis.</p>
                </div>
            </div>

            <GlassCard className="p-5 sm:p-8">
                <form onSubmit={handleUpload} className="space-y-8">
                    <div className="space-y-2">
                        <Label className="text-gray-700 dark:text-gray-300">Select Patient</Label>
                        <select
                            className="w-full bg-white dark:bg-white/5 border border-gray-300 dark:border-white/10 rounded-md p-2 text-gray-900 dark:text-white focus:border-neon-green outline-none"
                            value={selectedPatient}
                            onChange={(e) => setSelectedPatient(e.target.value)}
                            required
                        >
                            <option value="" className="text-gray-500">-- Choose Patient --</option>
                            {patients.map(p => (
                                <option key={p.id} value={p.id} className="text-gray-900 dark:text-white bg-white dark:bg-gray-900">{p.name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="space-y-2">
                        <Label className="text-gray-700 dark:text-gray-300">VCF File</Label>
                        <div className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center transition-colors ${file ? 'border-neon-green/50 bg-neon-green/5' : 'border-gray-300 dark:border-white/20 hover:border-gray-400 dark:hover:border-white/40 hover:bg-gray-50 dark:hover:bg-white/5'}`}>
                            <input
                                type="file"
                                accept=".vcf,.txt"
                                onChange={handleFileChange}
                                className="hidden"
                                id="vcf-upload"
                            />
                            <label htmlFor="vcf-upload" className="cursor-pointer flex flex-col items-center">
                                {file ? (
                                    <>
                                        <FileText className="h-12 w-12 text-neon-green mb-4" />
                                        <p className="text-gray-900 dark:text-white font-medium">{file.name}</p>
                                        <p className="text-sm text-gray-500 mt-1">{(file.size / 1024).toFixed(2)} KB</p>
                                    </>
                                ) : (
                                    <>
                                        <UploadCloud className="h-12 w-12 text-gray-400 mb-4" />
                                        <p className="text-gray-900 dark:text-white font-medium">Click to Upload VCF</p>
                                        <p className="text-sm text-gray-500 mt-1">Supported formats: .vcf, .txt</p>
                                    </>
                                )}
                            </label>
                        </div>
                    </div>

                    {uploadStatus === 'error' && (
                        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-3 text-red-500 dark:text-red-400">
                            <AlertCircle className="h-5 w-5" />
                            <span>{message}</span>
                        </div>
                    )}

                    {uploadStatus === 'success' && (
                        <div className="p-4 bg-neon-green/10 border border-neon-green/20 rounded-lg flex items-center gap-3 text-neon-green">
                            <CheckCircle className="h-5 w-5" />
                            <span>{message}</span>
                        </div>
                    )}

                    <div className="pt-6 border-t border-white/10 flex flex-col-reverse sm:flex-row sm:justify-end gap-3">
                        <Button
                            type="submit"
                            disabled={loading || !selectedPatient || !file}
                            className="bg-neon-green hover:bg-neon-green/80 text-black font-bold px-8 h-12 w-full sm:w-auto"
                        >
                            {loading ? 'Processing...' : 'Upload & Analyze'}
                        </Button>
                    </div>
                </form>
            </GlassCard>
        </div>
    );
};

export default UploadVCFPage;
