import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './components/theme-provider';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import LandingPage from './pages/LandingPage';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import PatientsPage from './pages/PatientsPage';
import AddPatientPage from './pages/AddPatient';
import AnalysisPage from './pages/AnalysisPage';
import GeneEntryPage from './pages/GeneEntryPage';
import UploadVCFPage from './pages/UploadVCFPage';
import ReportsPage from './pages/ReportsPage';
import PatientDetailsPage from './pages/PatientDetailsPage';
import ExportDataPage from './pages/ExportDataPage';
import GeneDocumentationPage from './pages/GeneDocumentationPage';
import AboutPage from './pages/AboutPage';
import { PrivacyPolicy, TermsOfService } from './pages/PolicyPages';
import CommunityPage from './pages/CommunityPage';
import ApiDocPage from './pages/ApiDocPage';
import { AnimatePresence, motion } from 'framer-motion';
import GeneLoader from './components/ui/GeneLoader';

// Protected Route Wrapper
const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
    const { session, loading } = useAuth();
    if (loading) return <GeneLoader />;
    if (!session) return <Navigate to="/login" replace />;
    return children;
};

const AnimatedRoutes = () => {
    const location = useLocation();
    return (
        <AnimatePresence mode="wait">
            <motion.div
                key={location.pathname}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
            >
                <Routes location={location}>
                    <Route path="/" element={<LandingPage />} />
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/register" element={<RegisterPage />} />
                    
                    {/* Add Public Informational Routes */}
                    <Route path="/about" element={<AboutPage />} />
                    <Route path="/privacy" element={<PrivacyPolicy />} />
                    <Route path="/terms" element={<TermsOfService />} />
                    <Route path="/community" element={<CommunityPage />} />
                    <Route path="/docs/api" element={<ApiDocPage />} />

                    <Route element={
                        <ProtectedRoute>
                            <Layout />
                        </ProtectedRoute>
                    }>
                        <Route path="/dashboard" element={<Dashboard />} />
                        <Route path="/patients" element={<PatientsPage />} />
                        <Route path="/patients/:id" element={<PatientDetailsPage />} />
                        <Route path="/patients/new" element={<AddPatientPage />} />
                        <Route path="/export" element={<ExportDataPage />} />
                        <Route path="/genes/new" element={<GeneEntryPage />} />
                        <Route path="/genes/upload" element={<UploadVCFPage />} />
                        <Route path="/analysis" element={<AnalysisPage />} />
                        <Route path="/reports" element={<ReportsPage />} />
                        <Route path="/docs" element={<GeneDocumentationPage />} />
                    </Route>
                </Routes>
            </motion.div>
        </AnimatePresence>
    );
};

function App() {
    const [isBooting, setIsBooting] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsBooting(false);
        }, 1500);
        return () => clearTimeout(timer);
    }, []);

    if (isBooting) return <GeneLoader message="Initializing Bio-Tech Environment..." />;

    return (
        <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
            <AuthProvider>
                <Router>
                    <AnimatedRoutes />
                </Router>
            </AuthProvider>
        </ThemeProvider>
    );
}

export default App;
