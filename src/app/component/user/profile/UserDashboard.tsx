'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiDollarSign, 
  FiTrendingUp, 
  FiBriefcase, 
  FiGift, 
  FiDownload,
  FiClock,
  FiCopy,
  FiCheck,
  FiUsers,
  FiActivity
} from 'react-icons/fi';
import {
  getTotalDeposit,
  getTotalInvestment,
  getTotalCompletedWithdrawal,
  getTotalPendingWithdrawal,
 
} from '@/lib/balance';
 
import TransactionsTable from '../layout/TransactionsTable';
import { getProfileData, getUserDashboardStats } from '@/lib/getProfileData';
import { getSession } from '@/lib/auth';

const UserDashboard: React.FC = () => {
  const [userStats, setUserStats] = useState({
    balance: 0,
    totalDeposit: 0,
    currentInvestment: 0,
    totalBonus: 0,
    totalWithdrawal: 0,
    pendingWithdrawal: 0,
    totalEarnings: 0,
    activeInvestments: 0,
    pendingDeposits: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState({
    username: '',
    referralLink: '',
    referralCode: ''
  });
  const [copied, setCopied] = useState(false);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(user.referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log('🔄 Starting data fetch...');
        setLoading(true);
        setError(null);

        // ✅ Get the current user session or ID
        console.log('🔐 Getting session...');
        const { session } = await getSession();
        console.log('📋 Session data:', session);
        
        const userId = session?.user?.id;
        console.log('👤 User ID:', userId);

        if (!userId) {
          console.error('❌ No user ID found in session');
          throw new Error('User ID not found in session');
        }

        console.log('📥 Fetching all data in parallel...');
        const [
          profileData,
          totalDeposit,
          totalInvestment,
          totalCompletedWithdrawal,
          totalPendingWithdrawal,
          dashboardStats
        ] = await Promise.all([
          getProfileData(),
          getTotalDeposit(),
          getTotalInvestment(),
          getTotalCompletedWithdrawal(),
          getTotalPendingWithdrawal(),
          getUserDashboardStats()
        ]);

        console.log('📊 Profile data response:', profileData);
        console.log('💰 Total deposit:', totalDeposit);
        console.log('📈 Total investment:', totalInvestment);
        console.log('💸 Total completed withdrawal:', totalCompletedWithdrawal);
        console.log('⏳ Total pending withdrawal:', totalPendingWithdrawal);
        console.log('📱 Dashboard stats:', dashboardStats);

        // Check for profile data errors
        if (profileData.error || !profileData.data) {
          console.error('❌ Profile data error:', profileData.error);
          throw new Error(profileData.error || 'Failed to fetch profile data');
        }

        console.log('✅ Profile data successfully fetched:', profileData.data);

        const referralCode = profileData.data.referralCode || generateReferralCode();
        console.log('🔗 Referral code:', referralCode);

        const referralLink = `${window.location.origin}/signup?ref_id=${referralCode}`;
        console.log('🌐 Referral link:', referralLink);

        // Set user data
        setUser({
          username: profileData.data.username || 'User',
          referralLink: referralLink,
          referralCode: referralCode,
        });

        console.log('👤 User state set with username:', profileData.data.username);

        // Process dashboard stats
        const stats = dashboardStats?.data || {
          totalBalance: profileData.data.balance || 0,
          totalEarnings: 0,
          totalInvested: totalInvestment,
          activeInvestments: 0,
          pendingDeposits: 0,
          pendingWithdrawals: totalPendingWithdrawal,
        };

        console.log('📊 Processed stats:', stats);

        // Set user stats
        const finalUserStats = {
          balance: stats.totalBalance,
          totalDeposit: totalDeposit,
          currentInvestment: stats.totalInvested,
          totalBonus: stats.totalEarnings,
          totalWithdrawal: totalCompletedWithdrawal,
          pendingWithdrawal: stats.pendingWithdrawals,
          totalEarnings: stats.totalEarnings,
          activeInvestments: stats.activeInvestments,
          pendingDeposits: stats.pendingDeposits,
        };

        console.log('🎯 Final user stats:', finalUserStats);
        setUserStats(finalUserStats);

        console.log('✅ All data successfully loaded and state updated');

      } catch (err) {
        console.error('❌ Error in fetchData:', err);
        setError(err instanceof Error ? err.message : 'An unexpected error occurred');
      } finally {
        console.log('🏁 Fetch completed, setting loading to false');
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Add useEffect to log state changes
  useEffect(() => {
    console.log('🔄 User state updated:', user);
  }, [user]);

  useEffect(() => {
    console.log('📊 UserStats state updated:', userStats);
  }, [userStats]);

  useEffect(() => {
    console.log('⏳ Loading state:', loading);
  }, [loading]);

  useEffect(() => {
    console.log('🚨 Error state:', error);
  }, [error]);

  const generateReferralCode = (): string => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  const stats = [
    { 
      title: 'Account Balance', 
      amount: userStats.balance, 
      icon: <FiDollarSign className="text-blue-500" />,
      color: 'bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200',
      trend: null,
      description: 'Available funds for investment'
    },
    { 
      title: 'Total Deposit', 
      amount: userStats.totalDeposit, 
      icon: <FiTrendingUp className="text-emerald-500" />,
      color: 'bg-gradient-to-br from-emerald-50 to-emerald-100 border border-emerald-200',
      trend: 'up',
      description: 'All-time deposits'
    },
    { 
      title: 'Active Investments', 
      amount: userStats.currentInvestment, 
      icon: <FiBriefcase className="text-purple-500" />,
      color: 'bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200',
      trend: null,
      description: `${userStats.activeInvestments} active plans`
    },
    { 
      title: 'Total Earnings', 
      amount: userStats.totalEarnings, 
      icon: <FiGift className="text-amber-500" />,
      color: 'bg-gradient-to-br from-amber-50 to-amber-100 border border-amber-200',
      trend: 'up',
      description: 'Profit from investments'
    },
    { 
      title: 'Total Withdrawal', 
      amount: userStats.totalWithdrawal, 
      icon: <FiDownload className="text-rose-500" />,
      color: 'bg-gradient-to-br from-rose-50 to-rose-100 border border-rose-200',
      trend: null,
      description: 'Withdrawn funds'
    },
    { 
      title: 'Pending Transactions', 
      amount: userStats.pendingWithdrawal + userStats.pendingDeposits, 
      icon: <FiClock className="text-orange-500" />,
      color: 'bg-gradient-to-br from-orange-50 to-orange-100 border border-orange-200',
      trend: null,
      description: `${userStats.pendingDeposits} deposits, ${userStats.pendingWithdrawal} withdrawals`
    },
  ];

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  // Rest of your component remains the same...
  if (loading) {
    console.log('👀 Rendering loading state...');
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Skeleton Header */}
          <div className="mb-8">
            <div className="h-8 w-64 bg-gray-200 rounded-lg animate-pulse mb-2"></div>
            <div className="h-4 w-96 bg-gray-200 rounded animate-pulse"></div>
          </div>

          {/* Skeleton Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {[...Array(6)].map((_, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-2xl shadow-sm p-6 h-36 animate-pulse border"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="h-6 w-32 bg-gray-200 rounded"></div>
                  <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                </div>
                <div className="h-8 w-24 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 w-40 bg-gray-200 rounded"></div>
              </motion.div>
            ))}
          </div>

          {/* Skeleton Transactions */}
          <div className="bg-white rounded-2xl shadow-sm p-6 animate-pulse">
            <div className="h-6 w-48 bg-gray-200 rounded mb-6"></div>
            {[...Array(5)].map((_, index) => (
              <div key={index} className="flex items-center justify-between py-4 border-b border-gray-100">
                <div className="h-4 w-32 bg-gray-200 rounded"></div>
                <div className="h-4 w-20 bg-gray-200 rounded"></div>
                <div className="h-4 w-16 bg-gray-200 rounded"></div>
                <div className="h-6 w-20 bg-gray-200 rounded-full"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    console.log('🚨 Rendering error state:', error);
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-sm p-6 border border-red-200"
          >
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">Unable to Load Dashboard</h3>
                <p className="text-gray-600 mt-1">{error}</p>
                <button
                  onClick={() => window.location.reload()}
                  className="mt-3 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Try Again
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  console.log('🎉 Rendering main dashboard with user:', user);
  console.log('📊 Current stats:', userStats);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-8"
        >
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
                Welcome back, <span className="text-blue-600">{user.username}</span>!
              </h1>
              <p className="text-gray-600 text-lg">Here&apos;s your investment dashboard overview</p>
            </div>
            
            {/* Quick Actions */}
            <div className="flex flex-wrap gap-3">
              <button className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors duration-200">
                <FiActivity className="mr-2" />
                Make Deposit
              </button>
              <button className="inline-flex items-center px-4 py-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium rounded-lg transition-colors duration-200">
                <FiTrendingUp className="mr-2" />
                Invest Now
              </button>
            </div>
          </div>
          
          {/* Referral Section */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl p-6 shadow-lg mt-6"
          >
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center mb-2">
                  <FiUsers className="text-white mr-2 text-xl" />
                  <h3 className="text-lg font-semibold text-white">Invite Friends & Earn</h3>
                </div>
                <p className="text-blue-100 text-sm">
                  Share your referral link and earn 5% commission on your friend&apos;s investments
                </p>
                {user.referralCode && (
                  <p className="text-white text-xs mt-2 font-medium">
                    Your Code: <span className="bg-white/20 px-2 py-1 rounded-md">{user.referralCode}</span>
                  </p>
                )}
              </div>
              <div className="flex items-center gap-3">
                <div className="bg-white/10 rounded-lg px-4 py-3 flex-1 min-w-0 backdrop-blur-sm">
                  <p className="text-white text-sm truncate font-mono">{user.referralLink}</p>
                </div>
                <button
                  onClick={copyToClipboard}
                  className="inline-flex items-center px-4 py-3 bg-white text-blue-600 font-semibold rounded-lg shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white transition-all duration-200"
                >
                  <AnimatePresence mode="wait" initial={false}>
                    {copied ? (
                      <motion.span
                        key="check"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        className="flex items-center"
                      >
                        <FiCheck className="mr-2" /> Copied
                      </motion.span>
                    ) : (
                      <motion.span
                        key="copy"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        className="flex items-center"
                      >
                        <FiCopy className="mr-2" /> Copy
                      </motion.span>
                    )}
                  </AnimatePresence>
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={{
            visible: {
              transition: {
                staggerChildren: 0.1
              }
            }
          }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8"
        >
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              variants={cardVariants}
              transition={{ duration: 0.3, type: "spring", stiffness: 100 }}
              className={`${stat.color} rounded-2xl shadow-sm overflow-hidden hover:shadow-md transition-all duration-300 hover:translate-y-[-2px]`}
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                    <p className="text-2xl lg:text-3xl font-bold text-gray-900 mt-1">
                      ${Number(stat.amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                  </div>
                  <div className="bg-white/80 rounded-xl p-3 shadow-sm">
                    {stat.icon}
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-xs text-gray-500">{stat.description}</p>
                  {stat.trend && (
                    <div className="flex items-center text-xs">
                      <span className={`flex items-center ${stat.trend === 'up' ? 'text-emerald-600' : 'text-rose-600'}`}>
                        <FiTrendingUp className={`mr-1 ${stat.trend === 'down' ? 'transform rotate-180' : ''}`} />
                        {stat.trend === 'up' ? '+5.2%' : '-2.3%'} 
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Recent Transactions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
        >
          <div className="px-6 py-5 border-b border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900">Recent Transactions</h3>
            <p className="text-sm text-gray-600 mt-1">Your latest deposit and withdrawal activities</p>
          </div>
          <TransactionsTable />
        </motion.div>
      </div>
    </div>
  );
};

export default UserDashboard;