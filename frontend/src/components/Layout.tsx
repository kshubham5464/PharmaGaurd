import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import PageTransition from './PageTransition';
import { useState, useEffect } from 'react';
import { Menu } from 'lucide-react';

import { motion, AnimatePresence } from 'framer-motion';

const Layout = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const location = useLocation();

    // Close sidebar on route change (mobile)
    useEffect(() => {
        setSidebarOpen(false);
    }, [location.pathname]);

    return (
        <div className="flex h-screen w-full bg-background text-foreground overflow-hidden transition-colors duration-300">
            {/* Global Background Orbs */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
                <div className="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] bg-neon-blue/10 dark:bg-neon-blue/5 rounded-full blur-[100px] animate-float" />
                <div className="absolute bottom-[20%] left-[-5%] w-[400px] h-[400px] bg-neon-green/10 dark:bg-neon-green/5 rounded-full blur-[100px] animate-float" style={{ animationDelay: '3s' }} />
            </div>

            {/* ── DESKTOP Sidebar (hidden on mobile) ── */}
            <div className="hidden lg:flex z-10 flex-shrink-0 h-screen sticky top-0">
                <Sidebar />
            </div>

            {/* ── MOBILE Sidebar Overlay ── */}
            <AnimatePresence>
                {sidebarOpen && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 lg:hidden"
                            onClick={() => setSidebarOpen(false)}
                        />
                        {/* Sidebar panel */}
                        <motion.div
                            initial={{ x: -280 }}
                            animate={{ x: 0 }}
                            exit={{ x: -280 }}
                            transition={{ type: 'spring', stiffness: 320, damping: 32 }}
                            className="fixed top-0 left-0 h-full z-40 lg:hidden"
                        >
                            <Sidebar />
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* ── MAIN CONTENT ── */}
            <div className="flex-1 flex flex-col overflow-hidden z-10">
                {/* Mobile top bar */}
                <div className="lg:hidden sticky top-0 z-20 flex items-center justify-between px-4 py-3 bg-background/90 backdrop-blur-md border-b border-gray-200 dark:border-white/10">
                    <button
                        onClick={() => setSidebarOpen(true)}
                        className="p-2 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
                        aria-label="Open sidebar"
                    >
                        <Menu className="h-5 w-5" />
                    </button>
                    <span className="text-lg font-bold tracking-wider text-gray-900 dark:text-white">
                        Pharma<span className="text-neon-blue">X</span>
                    </span>
                    <div className="w-9" /> {/* spacer */}
                </div>

                {/* Scrollable content */}
                <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
                    <div className="max-w-7xl mx-auto">
                        <PageTransition>
                            <Outlet />
                        </PageTransition>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default Layout;
