import React from 'react';
import { cn } from '@/lib/utils';
import { motion, HTMLMotionProps } from 'framer-motion';

interface GlassCardProps extends HTMLMotionProps<"div"> {
    children: React.ReactNode;
    className?: string;
    hoverEffect?: boolean;
    delay?: number;       // stagger delay in seconds e.g. 0.1, 0.2
    direction?: 'up' | 'left' | 'right' | 'none';
}

const directionMap = {
    up: { y: 20, x: 0 },
    left: { y: 0, x: -20 },
    right: { y: 0, x: 20 },
    none: { y: 0, x: 0 },
};

const GlassCard = React.forwardRef<HTMLDivElement, GlassCardProps>(
    ({ children, className, hoverEffect = true, delay = 0, direction = 'up', ...props }, ref) => {
        const offset = directionMap[direction];

        return (
            <motion.div
                ref={ref}
                initial={{ opacity: 0, y: offset.y, x: offset.x }}
                animate={{ opacity: 1, y: 0, x: 0 }}
                transition={{
                    duration: 0.45,
                    delay,
                    ease: [0.4, 0, 0.2, 1],
                }}
                whileHover={hoverEffect ? { y: -3, scale: 1.005 } : undefined}
                className={cn(
                    "glass-card p-6 backdrop-blur-md",
                    hoverEffect && [
                        "hover:bg-gray-50 dark:hover:bg-white/10",
                        "hover:border-neon-blue/40 hover:shadow-lg",
                        "dark:hover:shadow-neon-blue/10",
                        "transition-colors duration-300",
                        "cursor-default",
                    ],
                    className
                )}
                {...props}
            >
                {children}
            </motion.div>
        );
    }
);

GlassCard.displayName = "GlassCard";

export default GlassCard;
