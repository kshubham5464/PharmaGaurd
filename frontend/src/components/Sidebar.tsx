import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Home, UserPlus, FileText, Dna, LogOut, BarChart2, UploadCloud, Activity, Database, BookOpen } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { ModeToggle } from '@/components/mode-toggle';
import { motion } from 'framer-motion';

const Sidebar = () => {
    const location = useLocation();
    const { signOut } = useAuth();

    const links = [
        { href: '/dashboard', label: 'Overview', icon: Home },
        { href: '/patients', label: 'Patients', icon: UserPlus },
        { href: '/genes/upload', label: 'Upload VCF', icon: UploadCloud },
        { href: '/genes/new', label: 'Add Gene Data', icon: Dna },
        { href: '/analysis', label: 'Risk Analysis', icon: BarChart2 },
        { href: '/reports', label: 'Reports', icon: FileText },
        { href: '/export', label: 'Export Data', icon: Database },
        { href: '/docs', label: 'Gene Docs', icon: BookOpen },
    ];

    return (
        <motion.div
            initial={{ x: -80, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.45, ease: [0.4, 0, 0.2, 1] }}
            className="flex flex-col h-screen w-64 bg-white/80 dark:bg-black/40 backdrop-blur-xl border-r border-gray-200 dark:border-white/10 text-gray-900 dark:text-white transition-colors duration-300"
        >
            {/* Logo */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="p-6 flex items-center gap-2 border-b border-gray-200 dark:border-white/10"
            >
                <motion.div
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 2, repeat: Infinity, repeatDelay: 4, ease: 'easeInOut' }}
                >
                    <Activity className="h-6 w-6 text-neon-green" />
                </motion.div>
                <span className="text-xl font-bold tracking-wider">
                    Pharma<span className="text-neon-blue">X</span>
                </span>
            </motion.div>

            {/* Nav Links */}
            <nav className="flex-1 p-4 space-y-1">
                {links.map((link, i) => {
                    const Icon = link.icon;
                    const isActive =
                        location.pathname === link.href ||
                        (link.href === '/patients' && location.pathname.startsWith('/patients'));

                    return (
                        <motion.div
                            key={link.href}
                            initial={{ opacity: 0, x: -16 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.1 + i * 0.055, duration: 0.35, ease: 'easeOut' }}
                        >
                            <Link
                                to={link.href}
                                className={cn(
                                    "flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all duration-200 group relative overflow-hidden",
                                    isActive
                                        ? "bg-neon-blue/10 text-neon-blue border border-neon-blue/20 shadow-[0_0_12px_rgba(0,240,255,0.12)]"
                                        : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5"
                                )}
                            >
                                {/* Active indicator bar */}
                                {isActive && (
                                    <motion.div
                                        layoutId="activeBar"
                                        className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-neon-blue rounded-full"
                                        transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                                    />
                                )}
                                <Icon className={cn(
                                    "h-4 w-4 transition-transform duration-200",
                                    "group-hover:scale-110",
                                    isActive && "text-neon-blue"
                                )} />
                                <span className="font-medium text-sm">{link.label}</span>
                            </Link>
                        </motion.div>
                    );
                })}
            </nav>

            {/* Footer */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.55 }}
                className="p-4 border-t border-gray-200 dark:border-white/10 space-y-2"
            >
                <div className="flex items-center justify-between px-2 mb-2">
                    <span className="text-xs text-gray-500 uppercase tracking-wider">Theme</span>
                    <ModeToggle />
                </div>
                <Button
                    variant="ghost"
                    className="w-full justify-start text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all duration-200 group"
                    onClick={signOut}
                >
                    <LogOut className="mr-2 h-4 w-4 group-hover:translate-x-0.5 transition-transform duration-200" />
                    Logout
                </Button>
            </motion.div>
        </motion.div>
    );
};

export default Sidebar;
