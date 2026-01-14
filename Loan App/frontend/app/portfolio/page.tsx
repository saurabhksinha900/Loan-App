'use client';

import { motion } from 'framer-motion';
import { DollarSign, TrendingUp, Wallet, PieChart, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import Link from 'next/link';
import GlassCard from '@/components/GlassCard';
import StatCard from '@/components/StatCard';
import { getPortfolioHoldings, getPortfolioSummary } from '@/lib/mockData';

export default function PortfolioPage() {
  const holdings = getPortfolioHoldings();
  const summary = getPortfolioSummary();

  const getRiskColor = (grade: string) => {
    switch (grade) {
      case 'A': return 'text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30';
      case 'B': return 'text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30';
      case 'C': return 'text-yellow-600 dark:text-yellow-400 bg-yellow-100 dark:bg-yellow-900/30';
      case 'D': return 'text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30';
      default: return 'text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-900/30';
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-emerald-600 bg-clip-text text-transparent">
          My Portfolio
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Track your investments and performance
        </p>
      </motion.div>

      {/* Portfolio Summary Stats */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Invested"
          value={`$${summary.total_invested.toLocaleString()}`}
          icon={Wallet}
          trend="up"
          change=""
          delay={0}
        />
        <StatCard
          title="Current Value"
          value={`$${summary.current_value.toLocaleString()}`}
          icon={DollarSign}
          trend="up"
          change=""
          delay={0.1}
        />
        <StatCard
          title="Total Return"
          value={`$${summary.total_return.toLocaleString()}`}
          icon={TrendingUp}
          trend="up"
          change={`+${summary.return_percentage.toFixed(2)}%`}
          delay={0.2}
        />
        <StatCard
          title="Active Loans"
          value={summary.active_loans.toString()}
          icon={PieChart}
          trend="up"
          change=""
          delay={0.3}
        />
      </div>

      {/* Performance Overview */}
      <GlassCard>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Performance Overview
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Overall Return</p>
            <div className="flex items-center gap-2">
              <span className="text-3xl font-bold text-green-600 dark:text-green-400">
                +{summary.return_percentage.toFixed(2)}%
              </span>
              <ArrowUpRight className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Avg Risk Grade</p>
            <span className={`inline-block px-4 py-2 rounded-full text-xl font-bold ${getRiskColor(summary.avg_risk_grade)}`}>
              {summary.avg_risk_grade}
            </span>
          </div>
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Holdings</p>
            <span className="text-3xl font-bold text-gray-900 dark:text-white">
              {summary.total_loans}
            </span>
          </div>
        </div>
      </GlassCard>

      {/* Holdings Table */}
      <GlassCard>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
          Holdings
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Loan ID
                </th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Risk
                </th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Ownership
                </th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Invested
                </th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Current Value
                </th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Return
                </th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {holdings.map((holding, index) => (
                <motion.tr
                  key={holding.loan_id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                >
                  <td className="py-4 px-4">
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white">
                        {holding.loan_id}
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        {holding.interest_rate}% · {holding.tenure_months}mo
                      </p>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-right">
                    <span className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${getRiskColor(holding.risk_grade)}`}>
                      {holding.risk_grade}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-right">
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {holding.ownership_percentage}%
                    </span>
                  </td>
                  <td className="py-4 px-4 text-right">
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      ${holding.invested_amount.toLocaleString()}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-right">
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">
                      ${holding.current_value.toLocaleString()}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      {holding.total_return >= 0 ? (
                        <ArrowUpRight className="h-4 w-4 text-green-600 dark:text-green-400" />
                      ) : (
                        <ArrowDownRight className="h-4 w-4 text-red-600 dark:text-red-400" />
                      )}
                      <span className={`text-sm font-semibold ${holding.total_return >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                        ${Math.abs(holding.total_return).toLocaleString()}
                      </span>
                      <span className={`text-xs ${holding.total_return >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                        ({holding.return_percentage >= 0 ? '+' : ''}{holding.return_percentage.toFixed(2)}%)
                      </span>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-right">
                    <span className="inline-block px-2 py-1 rounded-full text-xs font-semibold bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400">
                      {holding.status}
                    </span>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassCard>

      {/* Empty State */}
      {holdings.length === 0 && (
        <GlassCard>
          <div className="text-center py-12">
            <Wallet className="h-16 w-16 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No investments yet
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Start building your portfolio by browsing the marketplace
            </p>
            <Link href="/marketplace">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="rounded-xl bg-gradient-to-r from-blue-600 to-emerald-600 px-6 py-3 text-white font-medium shadow-lg shadow-emerald-500/50"
              >
                Browse Marketplace
              </motion.button>
            </Link>
          </div>
        </GlassCard>
      )}
    </div>
  );
}
