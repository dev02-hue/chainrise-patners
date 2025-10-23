/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { getUserDeposits } from '@/lib/investmentplan';
import { Deposit } from '@/types/businesses';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import React, { useEffect, useState } from 'react';
import { 
  FaBitcoin, 
  FaDog, 
  FaEthereum, 
  FaWallet, 
  FaFilter,
  FaSearch,
  FaSort,
  FaCalendarAlt,
  FaCheckCircle,
  FaClock,
  FaTimesCircle
} from 'react-icons/fa';
import { SiBinance, SiLitecoin, SiRipple, SiSolana, SiTether } from 'react-icons/si';

const DepositHistoryPage = () => {
  const [loading, setLoading] = useState({
    deposits: true,
    form: false
  });
  const [error, setError] = useState({
    deposits: ''
  });
  const [deposits, setDeposits] = useState<Deposit[]>([]);
  const [filteredDeposits, setFilteredDeposits] = useState<Deposit[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState<'date' | 'amount'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Animation variants
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const cardVariants: Variants = {
    hidden: { scale: 0.9, opacity: 0, y: 20 },
    visible: {
      scale: 1,
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 25
      }
    },
    exit: {
      scale: 0.9,
      opacity: 0,
      y: -20,
      transition: {
        duration: 0.2
      }
    },
    hover: {
      y: -4,
      scale: 1.01,
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 25
      }
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: depositsData, error: depositsError } = await getUserDeposits();
        
        if (depositsError) throw new Error(depositsError);
        
        setDeposits(depositsData || []);
        setFilteredDeposits(depositsData || []);
      } catch (err) {
        setError({
          deposits: err instanceof Error ? err.message : "Failed to load deposits"
        });
      } finally {
        setLoading({
          deposits: false,
          form: false
        });
      }
    };
    fetchData();
  }, []);

  // Filter and sort deposits
  useEffect(() => {
    let result = [...deposits];

    // Apply search filter
    if (searchTerm) {
      result = result.filter(deposit =>
        deposit.cryptoType.toLowerCase().includes(searchTerm.toLowerCase()) ||
        deposit.amount.toString().includes(searchTerm) ||
        deposit.status.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      result = result.filter(deposit => deposit.status === statusFilter);
    }

    // Apply sorting
    result.sort((a, b) => {
      if (sortBy === 'date') {
        return sortOrder === 'desc' 
          ? new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          : new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      } else {
        return sortOrder === 'desc' ? b.amount - a.amount : a.amount - b.amount;
      }
    });

    setFilteredDeposits(result);
  }, [deposits, searchTerm, statusFilter, sortBy, sortOrder]);

  const getCryptoIcon = (symbol: string) => {
    const iconClass = "text-2xl";
    switch (symbol.toUpperCase()) {
      case 'BTC': return <FaBitcoin className={`${iconClass} text-orange-500`} />;
      case 'ETH': return <FaEthereum className={`${iconClass} text-gray-600`} />;
      case 'BNB': return <SiBinance className={`${iconClass} text-yellow-500`} />;
      case 'DOGE': return <FaDog className={`${iconClass} text-orange-400`} />;
      case 'SOL': return <SiSolana className={`${iconClass} text-purple-500`} />;
      case 'USDT': return <SiTether className={`${iconClass} text-emerald-500`} />;
      case 'XRP': return <SiRipple className={`${iconClass} text-blue-500`} />;
      case 'LTC': return <SiLitecoin className={`${iconClass} text-blue-400`} />;
      default: return <FaWallet className={`${iconClass} text-gray-500`} />;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <FaCheckCircle className="text-emerald-500" />;
      case 'confirmed':
        return <FaCheckCircle className="text-blue-500" />;
      case 'pending':
        return <FaClock className="text-amber-500" />;
      case 'cancelled':
      case 'failed':
        return <FaTimesCircle className="text-rose-500" />;
      default:
        return <FaClock className="text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'confirmed':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'pending':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'cancelled':
        return 'bg-rose-100 text-rose-800 border-rose-200';
      case 'failed':
        return 'bg-rose-100 text-rose-800 border-rose-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const toggleSort = (type: 'date' | 'amount') => {
    if (sortBy === type) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(type);
      setSortOrder('desc');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent mb-4">
            Deposit History
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto font-medium">
            Track and manage all your investment deposits in one place
          </p>
        </motion.div>

        {/* Stats Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
        >
          <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
            <div className="text-2xl font-bold text-gray-800 mb-1">
              {deposits.length}
            </div>
            <div className="text-sm text-gray-600 font-medium">Total Deposits</div>
          </div>
          <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
            <div className="text-2xl font-bold text-emerald-500 mb-1">
              {deposits.filter(d => d.status === 'completed').length}
            </div>
            <div className="text-sm text-gray-600 font-medium">Completed</div>
          </div>
          <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
            <div className="text-2xl font-bold text-amber-500 mb-1">
              {deposits.filter(d => d.status === 'pending').length}
            </div>
            <div className="text-sm text-gray-600 font-medium">Pending</div>
          </div>
          <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
            <div className="text-2xl font-bold text-blue-500 mb-1">
              ${deposits.reduce((sum, deposit) => sum + deposit.amount, 0).toFixed(2)}
            </div>
            <div className="text-sm text-gray-600 font-medium">Total Invested</div>
          </div>
        </motion.div>

        {/* Filters and Search */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl p-6 mb-8 border border-gray-200 shadow-sm"
        >
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            {/* Search */}
            <div className="relative flex-1 w-full">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by crypto, amount, or status..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 font-medium"
              />
            </div>

            {/* Status Filter */}
            <div className="flex items-center space-x-2">
              <FaFilter className="text-gray-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 font-medium"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            {/* Sort Options */}
            <div className="flex space-x-2">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => toggleSort('date')}
                className={`px-4 py-3 rounded-xl border transition-all duration-300 flex items-center space-x-2 font-medium ${
                  sortBy === 'date'
                    ? 'bg-blue-500 text-white border-blue-500'
                    : 'bg-gray-50 border-gray-300 text-gray-700 hover:bg-gray-100'
                }`}
              >
                <FaCalendarAlt />
                <span>Date</span>
                <FaSort className={`text-xs ${sortOrder === 'desc' ? 'transform rotate-180' : ''}`} />
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => toggleSort('amount')}
                className={`px-4 py-3 rounded-xl border transition-all duration-300 flex items-center space-x-2 font-medium ${
                  sortBy === 'amount'
                    ? 'bg-blue-500 text-white border-blue-500'
                    : 'bg-gray-50 border-gray-300 text-gray-700 hover:bg-gray-100'
                }`}
              >
                <span>Amount</span>
                <FaSort className={`text-xs ${sortOrder === 'desc' ? 'transform rotate-180' : ''}`} />
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Deposits List */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-4"
        >
          {loading.deposits ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex justify-center items-center h-64"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full"
              />
            </motion.div>
          ) : error.deposits ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-rose-50 border border-rose-200 rounded-2xl p-8 text-center"
            >
              <div className="text-rose-500 text-4xl mb-4">⚠️</div>
              <h3 className="text-lg font-semibold text-rose-700 mb-2">
                Unable to Load Deposits
              </h3>
              <p className="text-rose-600 font-medium">{error.deposits}</p>
            </motion.div>
          ) : filteredDeposits.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-16 bg-white rounded-2xl border border-gray-200"
            >
              <div className="text-6xl mb-4">📊</div>
              <h3 className="text-xl font-semibold text-gray-600 mb-2">
                {searchTerm || statusFilter !== 'all' ? 'No matching transactions' : 'No transactions yet'}
              </h3>
              <p className="text-gray-500 max-w-md mx-auto font-medium">
                {searchTerm || statusFilter !== 'all' 
                  ? 'Try adjusting your search or filter criteria'
                  : 'Start your investment journey by making your first deposit'
                }
              </p>
            </motion.div>
          ) : (
            <AnimatePresence>
              {filteredDeposits.map((deposit) => (
                <motion.div
                  key={deposit.id}
                  variants={cardVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  whileHover="hover"
                  layout
                  className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300"
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    {/* Left Section - Crypto and Amount */}
                    <div className="flex items-center space-x-4">
                      <div className="p-3 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl">
                        {getCryptoIcon(deposit.cryptoType)}
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-800">
                          ${deposit.amount.toFixed(2)}
                        </h3>
                        <p className="text-sm text-gray-600 font-medium capitalize">
                          {deposit.cryptoType} • {deposit.planTitle || 'Investment Plan'}
                        </p>
                      </div>
                    </div>

                    {/* Middle Section - Status */}
                    <div className="flex items-center space-x-3">
                      <div className="text-2xl">
                        {getStatusIcon(deposit.status)}
                      </div>
                      <div className="text-right">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(deposit.status)}`}>
                          {deposit.status.charAt(0).toUpperCase() + deposit.status.slice(1)}
                        </span>
                        <p className="text-xs text-gray-500 mt-1 font-medium">
                          {formatDate(deposit.createdAt)}
                        </p>
                      </div>
                    </div>

                    {/* Right Section - Date (Mobile) */}
                    <div className="lg:hidden flex items-center space-x-2 text-sm text-gray-500">
                      <FaCalendarAlt />
                      <span>{new Date(deposit.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </motion.div>

        {/* Results Count */}
        {!loading.deposits && filteredDeposits.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center mt-8 text-gray-500 font-medium"
          >
            Showing {filteredDeposits.length} of {deposits.length} transactions
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default DepositHistoryPage;