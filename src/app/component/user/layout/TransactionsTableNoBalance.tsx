/* eslint-disable react-hooks/exhaustive-deps */
'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, type Variants } from 'framer-motion';
import { 
  FiArrowDown, 
  FiArrowUp, 
  FiClock, 
  FiCheckCircle, 
  FiXCircle,
  FiFilter,
  FiChevronLeft,
  FiChevronRight,
  FiSearch,
  FiLoader,
  FiEye,
  FiX,
  FiCalendar
} from 'react-icons/fi';
import { DepositStatus, WithdrawalStatus } from '@/types/businesses';
import { format } from 'date-fns';
import { getUserTransactions } from '@/lib/getProfileData';

type TransactionType = 'deposits' | 'withdrawals';
type TransactionStatus = DepositStatus | WithdrawalStatus | 'failed';

interface Transaction {
  id: string;
  amount: number;
  cryptoType: string;
  status: TransactionStatus;
  reference: string;
  createdAt: string;
  processedAt?: string;
}

// Updated statusMap with light, pleasant colors
const statusMap: Record<string, { 
  color: string; 
  bgColor: string;
  icon: React.JSX.Element; 
  label: string;
}> = {
  pending: { 
    color: 'text-amber-600', 
    bgColor: 'bg-amber-50 border-amber-100',
    icon: <FiClock className="text-amber-500" />, 
    label: 'Pending' 
  },
  processing: { 
    color: 'text-blue-600',
    bgColor: 'bg-blue-50 border-blue-100',
    icon: <FiLoader className="text-blue-500 animate-spin" />, 
    label: 'Processing' 
  },
  completed: { 
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-50 border-emerald-100',
    icon: <FiCheckCircle className="text-emerald-500" />, 
    label: 'Completed' 
  },
  rejected: { 
    color: 'text-rose-600',
    bgColor: 'bg-rose-50 border-rose-100',
    icon: <FiXCircle className="text-rose-500" />, 
    label: 'Rejected' 
  },
  cancelled: {
    color: 'text-gray-600',
    bgColor: 'bg-gray-50 border-gray-100',
    icon: <FiX className="text-gray-500" />,
    label: 'Cancelled'
  },
  confirmed: { 
    color: 'text-green-600',
    bgColor: 'bg-green-50 border-green-100',
    icon: <FiCheckCircle className="text-green-500" />, 
    label: 'Confirmed' 
  },
  failed: { 
    color: 'text-rose-600',
    bgColor: 'bg-rose-50 border-rose-100',
    icon: <FiXCircle className="text-rose-500" />, 
    label: 'Failed' 
  },
};

const PAGE_SIZE = 10;

const TransactionsTableNoBalance = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [transactionType, setTransactionType] = useState<TransactionType>('deposits');
  const [statusFilter, setStatusFilter] = useState<TransactionStatus | 'all'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants: Variants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: 'spring' as const,
        stiffness: 100,
        damping: 15
      }
    }
  };

  const modalVariants: Variants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: {
        type: 'spring' as const,
        stiffness: 300,
        damping: 30
      }
    },
    exit: {
      opacity: 0,
      scale: 0.8,
      transition: {
        duration: 0.2
      }
    }
  };

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError, count } = await getUserTransactions(
        transactionType,
        {
          status: statusFilter === 'all' ? undefined : statusFilter,
          limit: PAGE_SIZE,
          offset: (currentPage - 1) * PAGE_SIZE,
        }
      );

      if (fetchError) {
        throw new Error(fetchError);
      }

      setTransactions(data || []);
      setTotalCount(count || 0);
    } catch (err) {
      console.error('Failed to fetch transactions:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch transactions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [transactionType, statusFilter, currentPage]);

  const handleTransactionTypeChange = (type: TransactionType) => {
    setTransactionType(type);
    setCurrentPage(1);
  };

  const handleStatusFilterChange = (status: TransactionStatus | 'all') => {
    setStatusFilter(status);
    setCurrentPage(1);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchTransactions();
  };

  const filteredTransactions = transactions.filter(transaction =>
    transaction.reference.toLowerCase().includes(searchQuery.toLowerCase()) ||
    transaction.amount.toString().includes(searchQuery) ||
    transaction.cryptoType.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'MMM dd, yyyy HH:mm');
  };

  const getStatusBadge = (status: TransactionStatus) => {
      const statusInfo = statusMap[status] ?? {
        color: 'text-gray-600',
        bgColor: 'bg-gray-50 border-gray-100',
        icon: <FiClock className="text-gray-500" />,
        label: String(status)
      };
      return (
        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${statusInfo.bgColor} ${statusInfo.color}`}>
          <span className="mr-1.5">{statusInfo.icon}</span>
          {statusInfo.label}
        </span>
      );
    };

  // Stats calculation (removed total amount stat)
  const stats = {
    total: transactions.length,
    completed: transactions.filter(t => t.status === 'completed').length,
    pending: transactions.filter(t => t.status === 'pending').length,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-500 to-emerald-500 bg-clip-text text-transparent mb-4">
            Transaction History
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Track and manage all your financial transactions in one place
          </p>
        </motion.div>

        {/* Stats Overview - Removed total amount stat */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
        >
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="text-2xl font-bold text-gray-800 mb-1">
              {stats.total}
            </div>
            <div className="text-sm text-gray-600">Total Transactions</div>
          </div>
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="text-2xl font-bold text-emerald-500 mb-1">
              {stats.completed}
            </div>
            <div className="text-sm text-gray-600">Completed</div>
          </div>
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="text-2xl font-bold text-amber-500 mb-1">
              {stats.pending}
            </div>
            <div className="text-sm text-gray-600">Pending</div>
          </div>
        </motion.div>

        {/* Main Content Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
        >
          {/* Header and Filters */}
          <div className="p-6 border-b border-gray-100">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div>
                <h3 className="text-2xl font-bold text-gray-800">Transaction History</h3>
                <p className="text-gray-600 mt-1">
                  Manage and track your {transactionType}
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                {/* Transaction Type Toggle */}
                <div className="bg-gray-50 rounded-xl p-1 border border-gray-200">
                  <div className="flex">
                    <button
                      type="button"
                      onClick={() => handleTransactionTypeChange('deposits')}
                      className={`relative px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 flex items-center space-x-2 ${
                        transactionType === 'deposits'
                          ? 'bg-white text-blue-600 shadow-sm border border-blue-100'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      <FiArrowUp className="w-4 h-4" />
                      <span>Deposits</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleTransactionTypeChange('withdrawals')}
                      className={`relative px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 flex items-center space-x-2 ${
                        transactionType === 'withdrawals'
                          ? 'bg-white text-blue-600 shadow-sm border border-blue-100'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      <FiArrowDown className="w-4 h-4" />
                      <span>Withdrawals</span>
                    </button>
                  </div>
                </div>

                {/* Status Filter */}
                <div className="relative">
                  <div className="flex items-center space-x-2 bg-gray-50 rounded-xl px-3 py-2 border border-gray-200">
                    <FiFilter className="text-gray-400" />
                    <select
                      value={statusFilter}
                      onChange={(e) => handleStatusFilterChange(e.target.value as TransactionStatus | 'all')}
                      className="bg-transparent border-0 focus:ring-0 text-sm text-gray-700"
                    >
                      <option value="all">All Status</option>
                      {Object.entries(statusMap).map(([status, config]) => (
                        <option key={status} value={status}>
                          {config.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Search */}
            <form onSubmit={handleSearch} className="mt-6">
              <div className="relative max-w-md">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiSearch className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search by reference, amount, or crypto..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
                />
              </div>
            </form>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="p-12">
              <div className="flex justify-center">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full"
                />
              </div>
            </div>
          )}

          {/* Error State */}
          {error && !loading && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="m-6 bg-rose-50 border border-rose-200 rounded-2xl p-6 text-center"
            >
              <div className="text-rose-500 text-4xl mb-4">⚠️</div>
              <h3 className="text-lg font-semibold text-rose-700 mb-2">
                Unable to Load Transactions
              </h3>
              <p className="text-rose-600">{error}</p>
              <button
                onClick={fetchTransactions}
                className="mt-4 px-4 py-2 bg-rose-500 text-white rounded-lg hover:bg-rose-600 transition-colors"
              >
                Try Again
              </button>
            </motion.div>
          )}

          {/* Transactions Content */}
          {!loading && !error && (
            <>
              {/* Mobile Card View */}
              <div className="lg:hidden p-6">
                <motion.div
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                  className="space-y-4"
                >
                  {filteredTransactions.length > 0 ? (
                    filteredTransactions.map((transaction) => (
                      <motion.div
                        key={transaction.id}
                        variants={itemVariants}
                        whileHover={{ y: -2 }}
                        className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300"
                        onClick={() => setSelectedTransaction(transaction)}
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center space-x-3">
                            <div className={`p-2 rounded-lg ${
                              transactionType === 'deposits' 
                                ? 'bg-emerald-50 text-emerald-600' 
                                : 'bg-blue-50 text-blue-600'
                            }`}>
                              {transactionType === 'deposits' ? <FiArrowUp /> : <FiArrowDown />}
                            </div>
                            <div>
                              <h4 className="font-semibold text-gray-800">
                                ${transaction.amount.toFixed(2)}
                              </h4>
                              <p className="text-sm text-gray-600">
                                {transaction.cryptoType}
                              </p>
                            </div>
                          </div>
                          {getStatusBadge(transaction.status)}
                        </div>
                        
                        <div className="flex items-center justify-between text-sm text-gray-500">
                          <span className="truncate flex-1 mr-2">{transaction.reference}</span>
                          <span>{formatDate(transaction.createdAt)}</span>
                        </div>
                      </motion.div>
                    ))
                  ) : (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-center py-12"
                    >
                      <div className="text-6xl mb-4">💸</div>
                      <h3 className="text-xl font-semibold text-gray-600 mb-2">
                        No transactions found
                      </h3>
                      <p className="text-gray-500">
                        {searchQuery ? 'Try adjusting your search criteria' : `No ${transactionType} found`}
                      </p>
                    </motion.div>
                  )}
                </motion.div>
              </div>

              {/* Desktop Table View */}
              <div className="hidden lg:block overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Reference
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Amount
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Crypto Type
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredTransactions.length > 0 ? (
                      filteredTransactions.map((transaction) => (
                        <motion.tr
                          key={transaction.id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          whileHover={{ backgroundColor: 'rgba(249, 250, 251, 0.8)' }}
                          className="cursor-pointer"
                        >
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {transaction.reference}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-semibold">
                            ${transaction.amount.toFixed(2)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                            {transaction.cryptoType}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {getStatusBadge(transaction.status)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                            {formatDate(transaction.createdAt)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <motion.button 
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => setSelectedTransaction(transaction)}
                              className="text-blue-600 hover:text-blue-800 flex items-center space-x-1 ml-auto"
                            >
                              <FiEye className="w-4 h-4" />
                              <span>View</span>
                            </motion.button>
                          </td>
                        </motion.tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={6} className="px-6 py-12 text-center">
                          <div className="text-6xl mb-4">💸</div>
                          <h3 className="text-xl font-semibold text-gray-600 mb-2">
                            No transactions found
                          </h3>
                          <p className="text-gray-500">
                            {searchQuery ? 'Try adjusting your search criteria' : `No ${transactionType} found`}
                          </p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="px-6 py-4 border-t border-gray-200">
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="text-sm text-gray-700">
                      Showing <span className="font-semibold">{(currentPage - 1) * PAGE_SIZE + 1}</span> to{' '}
                      <span className="font-semibold">{Math.min(currentPage * PAGE_SIZE, totalCount)}</span> of{' '}
                      <span className="font-semibold">{totalCount}</span> transactions
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        className="p-2 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                      >
                        <FiChevronLeft className="w-4 h-4" />
                      </motion.button>
                      
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        let pageNum;
                        if (totalPages <= 5) {
                          pageNum = i + 1;
                        } else if (currentPage <= 3) {
                          pageNum = i + 1;
                        } else if (currentPage >= totalPages - 2) {
                          pageNum = totalPages - 4 + i;
                        } else {
                          pageNum = currentPage - 2 + i;
                        }
                        
                        return (
                          <motion.button
                            key={pageNum}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setCurrentPage(pageNum)}
                            className={`px-3 py-1 rounded-lg text-sm font-medium ${
                              currentPage === pageNum
                                ? 'bg-blue-500 text-white shadow-md'
                                : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                            }`}
                          >
                            {pageNum}
                          </motion.button>
                        );
                      })}
                      
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                        className="p-2 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                      >
                        <FiChevronRight className="w-4 h-4" />
                      </motion.button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </motion.div>

        {/* Transaction Detail Modal */}
        <AnimatePresence>
          {selectedTransaction && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
            >
              {/* Backdrop */}
              <div 
                className="absolute inset-0 bg-black/30 backdrop-blur-sm"
                onClick={() => setSelectedTransaction(null)}
              />
              
              {/* Modal */}
              <motion.div
                variants={modalVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="relative bg-white rounded-2xl shadow-xl max-w-md w-full mx-auto border border-gray-200"
              >
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                  <h3 className="text-xl font-bold text-gray-900">
                    Transaction Details
                  </h3>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setSelectedTransaction(null)}
                    className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
                  >
                    <FiX className="w-5 h-5" />
                  </motion.button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-500">Reference:</span>
                    <span className="text-sm font-mono text-gray-900">{selectedTransaction.reference}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-500">Amount:</span>
                    <span className="text-sm font-semibold text-gray-900">
                      ${selectedTransaction.amount.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-500">Crypto Type:</span>
                    <span className="text-sm text-gray-900">{selectedTransaction.cryptoType}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-500">Status:</span>
                    {getStatusBadge(selectedTransaction.status)}
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-500">Created:</span>
                    <span className="text-sm text-gray-900 flex items-center space-x-1">
                      <FiCalendar className="w-3 h-3" />
                      <span>{formatDate(selectedTransaction.createdAt)}</span>
                    </span>
                  </div>
                  {selectedTransaction.processedAt && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-500">Processed:</span>
                      <span className="text-sm text-gray-900 flex items-center space-x-1">
                        <FiCalendar className="w-3 h-3" />
                        <span>{formatDate(selectedTransaction.processedAt)}</span>
                      </span>
                    </div>
                  )}
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-gray-200">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setSelectedTransaction(null)}
                    className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-xl font-medium transition-colors"
                  >
                    Close Details
                  </motion.button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default TransactionsTableNoBalance;