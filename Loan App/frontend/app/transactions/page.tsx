'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { FileText, ExternalLink, CheckCircle, Clock, XCircle, Filter } from 'lucide-react';
import GlassCard from '@/components/GlassCard';
import { getTransactions } from '@/lib/mockData';

export default function TransactionsPage() {
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const transactions = getTransactions();

  const filteredTransactions = transactions.filter(txn => {
    return statusFilter === 'all' || txn.status === statusFilter;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
        return <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />;
      case 'PENDING':
        return <Clock className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />;
      case 'FAILED':
        return <XCircle className="h-5 w-5 text-red-600 dark:text-red-400" />;
      default:
        return <Clock className="h-5 w-5 text-gray-600 dark:text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
        return 'text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30';
      case 'PENDING':
        return 'text-yellow-600 dark:text-yellow-400 bg-yellow-100 dark:bg-yellow-900/30';
      case 'FAILED':
        return 'text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30';
      default:
        return 'text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-900/30';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const shortenHash = (hash: string | undefined) => {
    if (!hash) return 'N/A';
    return `${hash.slice(0, 8)}...${hash.slice(-8)}`;
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
          Transaction History
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Complete audit trail of your blockchain transactions
        </p>
      </motion.div>

      {/* Filter */}
      <GlassCard>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-gray-500 dark:text-gray-400" />
            <span className="text-sm text-gray-600 dark:text-gray-400">Filter by status:</span>
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-xl bg-white/50 dark:bg-gray-700/50 px-4 py-2 text-gray-900 dark:text-white backdrop-blur-sm outline-none"
          >
            <option value="all">All Transactions</option>
            <option value="CONFIRMED">Confirmed</option>
            <option value="PENDING">Pending</option>
            <option value="FAILED">Failed</option>
          </select>
        </div>
      </GlassCard>

      {/* Results Count */}
      <div className="text-sm text-gray-600 dark:text-gray-400">
        Showing {filteredTransactions.length} of {transactions.length} transactions
      </div>

      {/* Transactions List */}
      <div className="space-y-4">
        {filteredTransactions.map((txn, index) => (
          <motion.div
            key={txn.transaction_id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.05 }}
          >
            <GlassCard className="hover:shadow-xl transition-all duration-300">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                {/* Left: Transaction Info */}
                <div className="flex items-start gap-4 flex-1">
                  <div className="mt-1">
                    {getStatusIcon(txn.status)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                        {txn.transaction_id}
                      </h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(txn.status)}`}>
                        {txn.status}
                      </span>
                    </div>
                    <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                      <p>
                        <span className="font-medium">Loan:</span> {txn.loan_token_id}
                      </p>
                      <p>
                        <span className="font-medium">Fraction:</span> {(txn.fraction / 100).toFixed(2)}%
                      </p>
                      <p>
                        <span className="font-medium">Initiated:</span> {formatDate(txn.initiated_at)}
                      </p>
                      {txn.confirmed_at && (
                        <p>
                          <span className="font-medium">Confirmed:</span> {formatDate(txn.confirmed_at)}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right: Amount & Blockchain Info */}
                <div className="flex flex-col items-end gap-3">
                  <div className="text-right">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Transaction Amount</p>
                    <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                      ${txn.price.toLocaleString()}
                    </p>
                  </div>

                  {txn.near_tx_hash && (
                    <div className="text-right">
                      <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">NEAR Transaction</p>
                      <div className="flex items-center gap-2">
                        <code className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                          {shortenHash(txn.near_tx_hash)}
                        </code>
                        <a
                          href={`https://explorer.testnet.near.org/transactions/${txn.near_tx_hash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      </div>
                    </div>
                  )}

                  {txn.block_height && (
                    <div className="text-right">
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        Block: {txn.block_height.toLocaleString()}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </GlassCard>
          </motion.div>
        ))}
      </div>

      {/* Empty State */}
      {filteredTransactions.length === 0 && (
        <GlassCard>
          <div className="text-center py-12">
            <FileText className="h-16 w-16 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No transactions found
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              {statusFilter === 'all' 
                ? "You haven't made any transactions yet"
                : `No ${statusFilter.toLowerCase()} transactions`
              }
            </p>
          </div>
        </GlassCard>
      )}
    </div>
  );
}
