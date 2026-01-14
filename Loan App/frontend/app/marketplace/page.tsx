'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, TrendingUp, DollarSign, Calendar, Shield } from 'lucide-react';
import Link from 'next/link';
import GlassCard from '@/components/GlassCard';
import { getMarketplaceLoans } from '@/lib/mockData';

export default function MarketplacePage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [riskFilter, setRiskFilter] = useState<string>('all');
  const loans = getMarketplaceLoans();

  const filteredLoans = loans.filter(loan => {
    const matchesSearch = loan.loan_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         loan.originator_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRisk = riskFilter === 'all' || loan.risk_grade === riskFilter;
    return matchesSearch && matchesRisk;
  });

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
          Loan Marketplace
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Browse and invest in AI-verified loan opportunities
        </p>
      </motion.div>

      {/* Search and Filters */}
      <GlassCard>
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          {/* Search */}
          <div className="flex items-center gap-2 flex-1 rounded-xl bg-white/50 dark:bg-gray-700/50 px-4 py-3 backdrop-blur-sm">
            <Search className="h-5 w-5 text-gray-500 dark:text-gray-400" />
            <input
              type="text"
              placeholder="Search by loan ID or originator..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 bg-transparent text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 outline-none"
            />
          </div>

          {/* Risk Filter */}
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-gray-500 dark:text-gray-400" />
            <select
              value={riskFilter}
              onChange={(e) => setRiskFilter(e.target.value)}
              className="rounded-xl bg-white/50 dark:bg-gray-700/50 px-4 py-3 text-gray-900 dark:text-white backdrop-blur-sm outline-none"
            >
              <option value="all">All Risk Grades</option>
              <option value="A">Grade A</option>
              <option value="B">Grade B</option>
              <option value="C">Grade C</option>
              <option value="D">Grade D</option>
            </select>
          </div>
        </div>
      </GlassCard>

      {/* Results Count */}
      <div className="text-sm text-gray-600 dark:text-gray-400">
        Showing {filteredLoans.length} of {loans.length} loans
      </div>

      {/* Loans Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 xl:grid-cols-3">
        {filteredLoans.map((loan, index) => (
          <motion.div
            key={loan.loan_id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.05 }}
          >
            <GlassCard className="hover:shadow-xl transition-all duration-300 group cursor-pointer">
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {loan.loan_id}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {loan.originator_name}
                  </p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getRiskColor(loan.risk_grade)}`}>
                  Grade {loan.risk_grade}
                </span>
              </div>

              {/* Key Metrics */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  <div>
                    <p className="text-xs text-gray-600 dark:text-gray-400">Principal</p>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                      ${loan.principal.toLocaleString()}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                  <div>
                    <p className="text-xs text-gray-600 dark:text-gray-400">Interest</p>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                      {loan.interest_rate.toFixed(1)}%
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                  <div>
                    <p className="text-xs text-gray-600 dark:text-gray-400">Term</p>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                      {loan.tenure_months} mo
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                  <div>
                    <p className="text-xs text-gray-600 dark:text-gray-400">YTM</p>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                      {loan.yield_to_maturity.toFixed(1)}%
                    </p>
                  </div>
                </div>
              </div>

              {/* Suggested Price */}
              <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Suggested Price</span>
                  <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
                    ${loan.suggested_price.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Action Button */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => alert(`Investment modal for ${loan.loan_id}\n\nIn production, this would:\n- Show detailed risk analysis\n- Allow fractional investment\n- Process blockchain transaction\n- Update your portfolio`)}
                className="mt-4 w-full rounded-xl bg-gradient-to-r from-blue-600 to-emerald-600 px-4 py-3 text-white font-medium shadow-lg shadow-emerald-500/50 transition-all duration-300 hover:shadow-xl"
              >
                View Details & Invest
              </motion.button>
            </GlassCard>
          </motion.div>
        ))}
      </div>

      {/* Empty State */}
      {filteredLoans.length === 0 && (
        <div className="text-center py-12">
          <Search className="h-16 w-16 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            No loans found
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Try adjusting your search or filter criteria
          </p>
        </div>
      )}
    </div>
  );
}
