import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
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

// Protected Route Wrapper
const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
    const { session, loading } = useAuth();

    if (loading) return <div className="flex h-screen items-center justify-center">Loading...</div>;

    if (!session) {
        return <Navigate to="/login" replace />;
    }

    return children;
};

function App() {
    return (
        <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
            <AuthProvider>
                <Router>
                    <Routes>
                        <Route path="/" element={<LandingPage />} />
                        <Route path="/login" element={<LoginPage />} />
                        <Route path="/register" element={<RegisterPage />} />

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
                </Router>
            </AuthProvider>
        </ThemeProvider>
    );
}

export default App;
