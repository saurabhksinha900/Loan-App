'use client';

import { motion } from 'framer-motion';
import { TrendingUp, Shield, Clock, DollarSign } from 'lucide-react';
import GlassCard from './GlassCard';

interface LoanCardProps {
  loanId: string;
  amount: string;
  interestRate: string;
  term: string;
  riskGrade: string;
  type: string;
  delay?: number;
}

const riskColors = {
  A: 'from-green-500 to-emerald-500',
  B: 'from-blue-500 to-cyan-500',
  C: 'from-yellow-500 to-orange-500',
  D: 'from-orange-500 to-red-500',
  E: 'from-red-500 to-pink-500',
};

export default function LoanCard({ loanId, amount, interestRate, term, riskGrade, type, delay = 0 }: LoanCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, delay }}
      whileHover={{ y: -8 }}
    >
      <GlassCard gradient>
        {/* Risk Grade Badge */}
        <div className="mb-4 flex items-center justify-between">
          <motion.div
            whileHover={{ scale: 1.05 }}
            className={`rounded-lg bg-gradient-to-r ${riskColors[riskGrade as keyof typeof riskColors]} px-3 py-1 text-sm font-bold text-white shadow-lg`}
          >
            Grade {riskGrade}
          </motion.div>
          <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            {type}
          </span>
        </div>

        {/* Loan ID */}
        <h3 className="mb-4 text-lg font-bold text-gray-900 dark:text-white">
          {loanId}
        </h3>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-2">
            <div className="rounded-lg bg-blue-500/20 p-2">
              <DollarSign className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Amount</p>
              <p className="text-sm font-bold text-gray-900 dark:text-white">{amount}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="rounded-lg bg-purple-500/20 p-2">
              <TrendingUp className="h-4 w-4 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Rate</p>
              <p className="text-sm font-bold text-gray-900 dark:text-white">{interestRate}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="rounded-lg bg-green-500/20 p-2">
              <Clock className="h-4 w-4 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Term</p>
              <p className="text-sm font-bold text-gray-900 dark:text-white">{term}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="rounded-lg bg-orange-500/20 p-2">
              <Shield className="h-4 w-4 text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Risk</p>
              <p className="text-sm font-bold text-gray-900 dark:text-white">{riskGrade}</p>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <motion.a
          href="/marketplace"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="mt-6 w-full rounded-xl bg-gradient-to-r from-blue-600 to-emerald-600 py-3 text-sm font-medium text-white shadow-lg shadow-emerald-500/50 transition-all duration-300 hover:shadow-xl block text-center"
        >
          View Details
        </motion.a>
      </GlassCard>
    </motion.div>
  );
}
