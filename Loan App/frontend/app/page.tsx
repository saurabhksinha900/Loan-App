'use client';

import { motion } from 'framer-motion';
import { DollarSign, TrendingUp, Wallet, Users, Activity, Shield } from 'lucide-react';
import Link from 'next/link';
import StatCard from '@/components/StatCard';
import LoanCard from '@/components/LoanCard';
import GlassCard from '@/components/GlassCard';

export default function Home() {
  const stats = [
    { title: 'Total Volume', value: '$2.5M', change: '+12.5%', icon: DollarSign, trend: 'up' as const },
    { title: 'Active Loans', value: '150', change: '+8.2%', icon: Activity, trend: 'up' as const },
    { title: 'Avg. Return', value: '8.5%', change: '+0.5%', icon: TrendingUp, trend: 'up' as const },
    { title: 'Investors', value: '1,234', change: '+15.3%', icon: Users, trend: 'up' as const },
  ];

  const featuredLoans = [
    { loanId: 'LOAN-001', amount: '$50,000', interestRate: '7.5%', term: '36 mo', riskGrade: 'B', type: 'Business' },
    { loanId: 'LOAN-002', amount: '$25,000', interestRate: '5.2%', term: '24 mo', riskGrade: 'A', type: 'Personal' },
    { loanId: 'LOAN-003', amount: '$100,000', interestRate: '9.8%', term: '60 mo', riskGrade: 'C', type: 'Mortgage' },
    { loanId: 'LOAN-004', amount: '$75,000', interestRate: '6.8%', term: '48 mo', riskGrade: 'B', type: 'Business' },
  ];

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center"
      >
        <h1 className="mb-4 text-5xl font-bold">
          <span className="bg-gradient-to-r from-blue-600 via-teal-600 to-emerald-600 bg-clip-text text-transparent">
            AI-Powered Loan Trading
          </span>
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-400">
          Transparent, Secure, and Intelligent Loan Marketplace
        </p>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <StatCard key={stat.title} {...stat} delay={index * 0.1} />
        ))}
      </div>

      {/* Quick Actions */}
      <GlassCard>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Quick Actions</h2>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">Start investing in minutes</p>
          </div>
          <div className="flex gap-3">
            <Link href="/marketplace">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-emerald-600 px-6 py-3 text-white shadow-lg shadow-emerald-500/50 transition-all duration-300 hover:shadow-xl"
              >
                <Wallet className="h-5 w-5" />
                <span className="font-medium">Browse Marketplace</span>
              </motion.button>
            </Link>
            <Link href="/portfolio">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white/50 dark:bg-gray-700/50 px-6 py-3 backdrop-blur-sm transition-all duration-300 hover:shadow-lg"
              >
                <Shield className="h-5 w-5 text-gray-700 dark:text-gray-300" />
                <span className="font-medium text-gray-700 dark:text-gray-300">View Analytics</span>
              </motion.button>
            </Link>
          </div>
        </div>
      </GlassCard>

      {/* Featured Loans */}
      <div>
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-emerald-600 bg-clip-text text-transparent">
              Featured Loans
            </h2>
            <p className="mt-1 text-gray-600 dark:text-gray-400">
              Curated opportunities with AI-verified risk assessments
            </p>
          </div>
          <Link href="/marketplace">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline"
            >
              View All →
            </motion.button>
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          {featuredLoans.map((loan, index) => (
            <LoanCard key={loan.loanId} {...loan} delay={index * 0.1} />
          ))}
        </div>
      </div>

      {/* AI Insights */}
      <GlassCard gradient>
        <div className="flex items-start gap-4">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="rounded-full bg-gradient-to-br from-blue-500 to-emerald-500 p-4 shadow-lg"
          >
            <Activity className="h-8 w-8 text-white" />
          </motion.div>
          <div className="flex-1">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">AI Market Insights</h3>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Our AI models predict a <span className="font-bold text-green-500">12% increase</span> in Grade A loan opportunities this month. 
              Current market conditions favor <span className="font-bold text-blue-600 dark:text-blue-400">business loans</span> with terms between 24-36 months.
            </p>
            <div className="mt-4 flex gap-2">
              <span className="rounded-lg bg-blue-500/20 px-3 py-1 text-sm font-medium text-blue-700 dark:text-blue-300">
                High Confidence
              </span>
              <span className="rounded-lg bg-green-500/20 px-3 py-1 text-sm font-medium text-green-700 dark:text-green-300">
                Low Risk
              </span>
            </div>
          </div>
        </div>
      </GlassCard>
    </div>
  );
}
