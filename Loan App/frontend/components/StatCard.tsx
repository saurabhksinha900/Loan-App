'use client';

import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';
import GlassCard from './GlassCard';

interface StatCardProps {
  title: string;
  value: string;
  change: string;
  icon: LucideIcon;
  trend: 'up' | 'down';
  delay?: number;
}

export default function StatCard({ title, value, change, icon: Icon, trend, delay = 0 }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
    >
      <GlassCard className="group">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</p>
            <h3 className="mt-2 text-3xl font-bold bg-gradient-to-r from-blue-600 to-emerald-600 bg-clip-text text-transparent">
              {value}
            </h3>
            <div className="mt-2 flex items-center gap-1">
              <span className={`text-sm font-medium ${trend === 'up' ? 'text-green-500' : 'text-red-500'}`}>
                {change}
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400">vs last month</span>
            </div>
          </div>
          <motion.div
            whileHover={{ rotate: 360, scale: 1.1 }}
            transition={{ duration: 0.6 }}
            className="rounded-xl bg-gradient-to-br from-blue-500 to-emerald-500 p-3 shadow-lg shadow-emerald-500/50"
          >
            <Icon className="h-6 w-6 text-white" />
          </motion.div>
        </div>
      </GlassCard>
    </motion.div>
  );
}
