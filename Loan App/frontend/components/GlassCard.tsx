'use client';

import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  gradient?: boolean;
}

export default function GlassCard({ children, className = '', hover = true, gradient = false }: GlassCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={hover ? { scale: 1.02, y: -4 } : undefined}
      className={`
        relative overflow-hidden rounded-2xl border border-white/50 dark:border-gray-700/50 
        bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl p-6 shadow-lg 
        transition-all duration-300
        ${hover ? 'hover:shadow-2xl hover:shadow-emerald-500/20' : ''}
        ${gradient ? 'bg-gradient-to-br from-white/80 to-purple-50/80 dark:from-gray-800/80 dark:to-purple-900/20' : ''}
        ${className}
      `}
    >
      {/* Gradient overlay on hover */}
      {hover && (
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/0 to-emerald-500/0 opacity-0 transition-opacity duration-300 group-hover:opacity-10" />
      )}
      {children}
    </motion.div>
  );
}
