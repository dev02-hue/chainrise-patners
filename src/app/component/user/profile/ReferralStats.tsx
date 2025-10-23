/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { useState, useEffect } from "react";
import { 
  getReferralStats, 
  getReferralEarnings, 
  generateReferralCode, 
  getReferralLeaderboard,
  applyReferralCode 
} from "@/lib/referral";
import { 
  FaUserPlus, 
  FaDollarSign, 
  FaHistory,
  FaCopy,
  FaShareAlt,
  FaTrophy,
  FaUsers,
  FaCheckCircle,
  FaExclamationTriangle,
  FaQrcode
} from "react-icons/fa";
import { 
  FiTrendingUp, 
  FiAward, 
  FiRefreshCw,
  FiUserCheck,
  FiCheck,
  
} from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-hot-toast";

interface Referral {
  id: string;
  name: string;
  email: string;
  joinedAt: string;
  depositAmount?: number;
  earningsFromReferral?: number;
  status: string;
}

interface ReferralStatsData {
  totalEarnings: number;
  totalReferrals: number;
  referralCode: string;
  referrals: Referral[];
}

interface ReferralEarningsData {
  total: number;
  history: any[];
}

interface LeaderboardUser {
  name: string;
  email: string;
  referral_count: number;
  total_earnings: number;
}

const ReferralStats = () => {
  const [stats, setStats] = useState<ReferralStatsData | null>(null);
  const [earnings, setEarnings] = useState<ReferralEarningsData | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [generatingCode, setGeneratingCode] = useState(false);
  const [activeTab, setActiveTab] = useState<'referrals' | 'earnings' | 'leaderboard'>('referrals');
  const [referralInput, setReferralInput] = useState('');
  const [applyingReferral, setApplyingReferral] = useState(false);
  const [copied, setCopied] = useState(false);

  const loadAllData = async () => {
    try {
      setLoading(true);
      const [statsResponse, earningsResponse, leaderboardResponse] = await Promise.all([
        getReferralStats(),
        getReferralEarnings(),
        getReferralLeaderboard()
      ]);

      if (statsResponse.data) setStats(statsResponse.data);
      if (earningsResponse.data) setEarnings(earningsResponse.data);
      if (leaderboardResponse.data) setLeaderboard(leaderboardResponse.data);

      if (statsResponse.error) console.error('Stats error:', statsResponse.error);
      if (earningsResponse.error) console.error('Earnings error:', earningsResponse.error);
      if (leaderboardResponse.error) console.error('Leaderboard error:', leaderboardResponse.error);
    } catch (err) {
      console.error("Error fetching referral data:", err);
      toast.error("Failed to load referral data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  const handleGenerateCode = async () => {
    try {
      setGeneratingCode(true);
      const { data, error } = await generateReferralCode();
      if (error) {
        toast.error(error);
      } else if (data) {
        setStats(prev => prev ? { ...prev, referralCode: data.code } : null);
        toast.success('Referral code generated successfully!');
      }
    } catch (err :any) {
      console.error(err);
      toast.error('Failed to generate referral code');
    } finally {
      setGeneratingCode(false);
    }
  };

  const handleCopyCode = () => {
    if (stats?.referralCode) {
      navigator.clipboard.writeText(stats.referralCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast.success('Referral code copied to clipboard!');
    }
  };

  // const handleShareReferral = () => {
  //   if (stats?.referralCode) {
  //     const shareUrl = `${window.location.origin}/signup?ref=${stats.referralCode}`;
  //     navigator.clipboard.writeText(shareUrl);
  //     toast.success('Referral link copied to clipboard!');
  //   }
  // };

  const handleApplyReferral = async () => {
    if (!referralInput.trim()) {
      toast.error('Please enter a referral code');
      return;
    }

    try {
      setApplyingReferral(true);
      const { success, error } = await applyReferralCode(referralInput);
      if (error) {
        toast.error(error);
      } else if (success) {
        toast.success('Referral code applied successfully!');
        setReferralInput('');
        await loadAllData();
      }
    } catch (err :any) {
      console.error(err);
      toast.error('Failed to apply referral code');
    } finally {
      setApplyingReferral(false);
    }
  };

  // Loading State
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Skeleton Header */}
          <div className="mb-8">
            <div className="h-8 w-64 bg-gray-200 rounded-lg animate-pulse mb-2"></div>
            <div className="h-4 w-96 bg-gray-200 rounded animate-pulse"></div>
          </div>

          {/* Skeleton Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-2xl shadow-sm p-6 h-32 animate-pulse border"
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

          {/* Skeleton Content */}
          <div className="bg-white rounded-2xl shadow-sm p-6 animate-pulse">
            <div className="h-6 w-48 bg-gray-200 rounded mb-6"></div>
            {[...Array(3)].map((_, index) => (
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-8"
        >
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
                Referral Program
              </h1>
              <p className="text-gray-600 text-lg">Earn commissions by inviting friends</p>
            </div>
            
            {/* Quick Actions */}
            <div className="flex flex-wrap gap-3">
              <button className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors duration-200">
                <FaShareAlt className="mr-2" />
                Share Link
              </button>
              <button className="inline-flex items-center px-4 py-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium rounded-lg transition-colors duration-200">
                <FaUsers className="mr-2" />
                Invite Friends
              </button>
            </div>
          </div>
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
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          <StatCard
            title="Total Referrals"
            value={stats?.totalReferrals || 0}
            icon={<FaUsers className="text-blue-500" />}
            color="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200"
            description="People you've referred"
          />
          <StatCard
            title="Total Earnings"
            value={stats?.totalEarnings || 0}
            icon={<FaDollarSign className="text-emerald-500" />}
            color="bg-gradient-to-br from-emerald-50 to-emerald-100 border border-emerald-200"
            isCurrency
            description="From referrals"
          />
          <StatCard
            title="Active Referrals"
            value={stats?.referrals.filter(r => r.status === 'active').length || 0}
            icon={<FiUserCheck className="text-green-500" />}
            color="bg-gradient-to-br from-green-50 to-green-100 border border-green-200"
            description="With deposits"
          />
          <StatCard
            title="Monthly Earnings"
            value={earnings?.total || 0}
            icon={<FiTrendingUp className="text-purple-500" />}
            color="bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200"
            isCurrency
            description="This month"
          />
        </motion.div>

        {/* Referral Code Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl p-6 shadow-lg mb-8"
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center mb-2">
                <FaUsers className="text-white mr-2 text-xl" />
                <h3 className="text-lg font-semibold text-white">Invite Friends & Earn</h3>
              </div>
              <p className="text-blue-100 text-sm">
                Share your referral code and earn 10% commission on your friend&apos;s investments
              </p>
              {stats?.referralCode && (
                <p className="text-white text-xs mt-2 font-medium">
                  Your Code: <span className="bg-white/20 px-2 py-1 rounded-md">{stats.referralCode}</span>
                </p>
              )}
            </div>
            <div className="flex items-center gap-3">
              {stats?.referralCode ? (
                <div className="flex items-center gap-3">
                  <div className="bg-white/10 rounded-lg px-4 py-3 flex-1 min-w-0 backdrop-blur-sm">
                    <p className="text-white text-sm truncate font-mono">{stats.referralCode}</p>
                  </div>
                  <button
                    onClick={handleCopyCode}
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
                          <FaCopy className="mr-2" /> Copy
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleGenerateCode}
                  disabled={generatingCode}
                  className="inline-flex items-center px-6 py-3 bg-white text-blue-600 font-semibold rounded-lg shadow-sm hover:bg-gray-50 disabled:opacity-50 transition-all duration-200"
                >
                  {generatingCode ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="flex items-center"
                    >
                      <FiRefreshCw className="mr-2" />
                      Generating...
                    </motion.div>
                  ) : (
                    <>
                      <FaQrcode className="mr-2" />
                      Generate Code
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </motion.div>

        {/* Apply Referral Code */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Apply Referral Code</h3>
          <div className="flex flex-col sm:flex-row gap-4">
            <input
              type="text"
              value={referralInput}
              onChange={(e) => setReferralInput(e.target.value.toUpperCase())}
              placeholder="Enter referral code"
              className="flex-1 px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50/50"
            />
            <button
              onClick={handleApplyReferral}
              disabled={applyingReferral || !referralInput.trim()}
              className="inline-flex items-center justify-center px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors duration-200 min-w-[140px]"
            >
              {applyingReferral ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="flex items-center"
                >
                  <FiRefreshCw className="mr-2" />
                  Applying...
                </motion.div>
              ) : (
                <>
                  <FaCheckCircle className="mr-2" />
                  Apply Code
                </>
              )}
            </button>
          </div>
        </motion.div>

        {/* Tabs Navigation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-8"
        >
          <div className="border-b border-gray-200">
            <nav className="flex overflow-x-auto -mb-px">
              {[
                { id: 'referrals' as const, name: 'Referral History', icon: FaHistory },
                { id: 'earnings' as const, name: 'Earnings', icon: FaDollarSign },
                { id: 'leaderboard' as const, name: 'Leaderboard', icon: FaTrophy }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center px-6 py-4 border-b-2 font-medium text-sm whitespace-nowrap min-w-0 ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600 bg-blue-50/50'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <tab.icon className="mr-2 flex-shrink-0" />
                  <span>{tab.name}</span>
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
              className="p-6"
            >
              {activeTab === 'referrals' && <ReferralsTab stats={stats} />}
              {activeTab === 'earnings' && <EarningsTab earnings={earnings} />}
              {activeTab === 'leaderboard' && <LeaderboardTab leaderboard={leaderboard} />}
            </motion.div>
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
};

// Tab Components with updated styling
const ReferralsTab = ({ stats }: { stats: ReferralStatsData | null }) => {
  if (!stats?.referrals.length) {
    return (
      <div className="text-center py-12">
        <FaUserPlus className="text-4xl text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">No Referrals Yet</h3>
        <p className="text-gray-500">Share your referral code to start earning commissions</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {stats.referrals.map((referral, index) => (
        <motion.div
          key={referral.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="bg-gray-50/50 rounded-xl p-6 border border-gray-200 hover:border-gray-300 transition-colors duration-200"
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center space-x-4">
              <div className={`p-3 rounded-full ${
                referral.status === 'active' 
                  ? 'bg-green-100 text-green-600' 
                  : 'bg-amber-100 text-amber-600'
              }`}>
                {referral.status === 'active' ? <FaCheckCircle /> : <FaExclamationTriangle />}
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">{referral.name}</h4>
                <p className="text-sm text-gray-500">{referral.email}</p>
                <p className="text-xs text-gray-400 mt-1">
                  Joined {new Date(referral.joinedAt).toLocaleDateString()}
                </p>
              </div>
            </div>
            <div className="text-right">
              {referral.depositAmount && (
                <p className="text-sm font-medium text-gray-900">
                  ${referral.depositAmount.toFixed(2)}
                </p>
              )}
              {referral.earningsFromReferral ? (
                <p className="text-sm text-emerald-600 font-semibold">
                  +${referral.earningsFromReferral.toFixed(2)}
                </p>
              ) : (
                <p className="text-sm text-gray-400">No earnings yet</p>
              )}
              <span className={`inline-block mt-2 px-3 py-1 text-xs rounded-full font-medium ${
                referral.status === 'active' 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-amber-100 text-amber-800'
              }`}>
                {referral.status.charAt(0).toUpperCase() + referral.status.slice(1)}
              </span>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

const EarningsTab = ({ earnings }: { earnings: ReferralEarningsData | null }) => {
  if (!earnings?.history.length) {
    return (
      <div className="text-center py-12">
        <FaDollarSign className="text-4xl text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">No Earnings Yet</h3>
        <p className="text-gray-500">Earnings will appear here when your referrals make deposits</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Total Earnings Card */}
      <div className="bg-gradient-to-r from-emerald-500 to-green-500 rounded-2xl p-6 text-white">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-emerald-100 text-sm font-medium">Total Referral Earnings</p>
            <p className="text-3xl font-bold mt-1">${earnings.total.toFixed(2)}</p>
          </div>
          <FiAward className="text-3xl" />
        </div>
      </div>

      {/* Earnings History */}
      <div className="space-y-4">
        {earnings.history.map((earning, index) => (
          <motion.div
            key={earning.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-gray-50/50 rounded-xl p-6 border border-gray-200 hover:border-gray-300 transition-colors duration-200"
          >
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h4 className="font-semibold text-gray-900">{earning.description}</h4>
                <p className="text-sm text-gray-500 mt-1">
                  {new Date(earning.created_at).toLocaleDateString()} • {earning.reference}
                </p>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-emerald-600">
                  +${earning.amount.toFixed(2)}
                </p>
                <span className="inline-block px-3 py-1 text-xs bg-emerald-100 text-emerald-800 rounded-full font-medium mt-1">
                  Completed
                </span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

const LeaderboardTab = ({ leaderboard }: { leaderboard: LeaderboardUser[] }) => {
  if (!leaderboard.length) {
    return (
      <div className="text-center py-12">
        <FaTrophy className="text-4xl text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">No Leaderboard Data</h3>
        <p className="text-gray-500">Leaderboard will be available when users start referring</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {leaderboard.map((user, index) => (
        <motion.div
          key={user.email}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="bg-gray-50/50 rounded-xl p-6 border border-gray-200 hover:border-gray-300 transition-colors duration-200"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className={`flex items-center justify-center w-8 h-8 rounded-full font-bold text-white text-sm ${
                index === 0 ? 'bg-amber-500' :
                index === 1 ? 'bg-gray-400' :
                index === 2 ? 'bg-orange-500' : 'bg-blue-500'
              }`}>
                {index + 1}
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">{user.name}</h4>
                <p className="text-sm text-gray-500">{user.email}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-lg font-bold text-emerald-600">
                ${user.total_earnings.toFixed(2)}
              </p>
              <p className="text-sm text-gray-500">
                {user.referral_count} referral{user.referral_count !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

// Updated Stat Card Component
interface StatCardProps {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  color: string;
  isCurrency?: boolean;
  description?: string;
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon,
  color,
  isCurrency = false,
  description
}) => {
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <motion.div
      variants={cardVariants}
      transition={{ duration: 0.3, type: "spring", stiffness: 100 }}
      className={`${color} rounded-2xl shadow-sm overflow-hidden hover:shadow-md transition-all duration-300 hover:translate-y-[-2px]`}
    >
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-2xl lg:text-3xl font-bold text-gray-900 mt-1">
              {isCurrency ? '$' : ''}{typeof value === 'number' ? value.toLocaleString('en-US', {
                minimumFractionDigits: isCurrency ? 2 : 0,
                maximumFractionDigits: isCurrency ? 2 : 0
              }) : value}
            </p>
          </div>
          <div className="bg-white/80 rounded-xl p-3 shadow-sm">
            {icon}
          </div>
        </div>
        {description && (
          <div className="flex items-center justify-between">
            <p className="text-xs text-gray-500">{description}</p>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default ReferralStats;