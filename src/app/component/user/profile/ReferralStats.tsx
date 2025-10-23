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
  FiUserCheck 
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
      toast.success('Referral code copied to clipboard!');
    }
  };

  const handleShareReferral = () => {
    if (stats?.referralCode) {
      const shareUrl = `${window.location.origin}/signup?ref=${stats.referralCode}`;
      navigator.clipboard.writeText(shareUrl);
      toast.success('Referral link copied to clipboard!');
    }
  };

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
        await loadAllData(); // Refresh data
      }
    } catch (err :any) {
      console.error(err);
      toast.error('Failed to apply referral code');
    } finally {
      setApplyingReferral(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="text-emerald-500 text-2xl"
        >
          <FiRefreshCw />
        </motion.div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard
          title="Total Referrals"
          value={stats?.totalReferrals || 0}
          icon={<FaUsers className="text-blue-500" />}
          color="blue"
          description="People you've referred"
        />
        <StatCard
          title="Total Earnings"
          value={stats?.totalEarnings || 0}
          icon={<FaDollarSign className="text-emerald-500" />}
          color="emerald"
          isCurrency
          description="From referrals"
        />
        <StatCard
          title="Active Referrals"
          value={stats?.referrals.filter(r => r.status === 'active').length || 0}
          icon={<FiUserCheck className="text-green-500" />}
          color="green"
          description="With deposits"
        />
        <StatCard
          title="Monthly Earnings"
          value={earnings?.total || 0}
          icon={<FiTrendingUp className="text-purple-500" />}
          color="purple"
          isCurrency
          description="This month"
        />
      </div>

      {/* Referral Code Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl p-6 text-white"
      >
        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <div>
            <h3 className="text-xl font-bold mb-2">Your Referral Code</h3>
            <p className="text-blue-100">
              Earn 10% commission on every deposit your referrals make
            </p>
          </div>
          
          <div className="flex items-center space-x-4">
            {stats?.referralCode ? (
              <div className="flex items-center space-x-3">
                <code className="bg-white/20 px-4 py-2 rounded-lg text-xl font-mono font-bold">
                  {stats.referralCode}
                </code>
                <button
                  onClick={handleCopyCode}
                  className="p-3 bg-white/20 rounded-lg hover:bg-white/30 transition-colors"
                >
                  <FaCopy />
                </button>
                <button
                  onClick={handleShareReferral}
                  className="p-3 bg-white/20 rounded-lg hover:bg-white/30 transition-colors"
                >
                  <FaShareAlt />
                </button>
              </div>
            ) : (
              <button
                onClick={handleGenerateCode}
                disabled={generatingCode}
                className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-blue-50 disabled:opacity-50 transition-colors flex items-center space-x-2"
              >
                {generatingCode ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  >
                    <FiRefreshCw />
                  </motion.div>
                ) : (
                  <FaQrcode />
                )}
                <span>{generatingCode ? 'Generating...' : 'Generate Code'}</span>
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
        className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Apply Referral Code</h3>
        <div className="flex space-x-4">
          <input
            type="text"
            value={referralInput}
            onChange={(e) => setReferralInput(e.target.value.toUpperCase())}
            placeholder="Enter referral code"
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <button
            onClick={handleApplyReferral}
            disabled={applyingReferral || !referralInput.trim()}
            className="bg-blue-500 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-600 disabled:opacity-50 transition-colors flex items-center space-x-2"
          >
            {applyingReferral ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              >
                <FiRefreshCw />
              </motion.div>
            ) : (
              <FaCheckCircle />
            )}
            <span>{applyingReferral ? 'Applying...' : 'Apply Code'}</span>
          </button>
        </div>
      </motion.div>

      {/* Tabs Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'referrals', name: 'Referral History', icon: FaHistory },
            { id: 'earnings', name: 'Earnings', icon: FaDollarSign },
            { id: 'leaderboard', name: 'Leaderboard', icon: FaTrophy }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <tab.icon />
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
        >
          {activeTab === 'referrals' && <ReferralsTab stats={stats} />}
          {activeTab === 'earnings' && <EarningsTab earnings={earnings} />}
          {activeTab === 'leaderboard' && <LeaderboardTab leaderboard={leaderboard} />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

// Tab Components
const ReferralsTab = ({ stats }: { stats: ReferralStatsData | null }) => {
  if (!stats?.referrals.length) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
        <FaUserPlus className="text-4xl text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">No Referrals Yet</h3>
        <p className="text-gray-500">Share your referral code to start earning commissions</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="p-6 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">Referral History</h3>
      </div>
      <div className="divide-y divide-gray-200">
        {stats.referrals.map((referral, index) => (
          <motion.div
            key={referral.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="p-6 hover:bg-gray-50 transition-colors"
          >
            <div className="flex justify-between items-start">
              <div className="flex items-center space-x-4">
                <div className={`p-3 rounded-full ${
                  referral.status === 'active' 
                    ? 'bg-green-100 text-green-600' 
                    : 'bg-yellow-100 text-yellow-600'
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
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {referral.status.charAt(0).toUpperCase() + referral.status.slice(1)}
                </span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

const EarningsTab = ({ earnings }: { earnings: ReferralEarningsData | null }) => {
  if (!earnings?.history.length) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
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
            <p className="text-emerald-100">Total Referral Earnings</p>
            <p className="text-3xl font-bold">${earnings.total.toFixed(2)}</p>
          </div>
          <FiAward className="text-3xl" />
        </div>
      </div>

      {/* Earnings History */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Earnings History</h3>
        </div>
        <div className="divide-y divide-gray-200">
          {earnings.history.map((earning, index) => (
            <motion.div
              key={earning.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="p-6 hover:bg-gray-50 transition-colors"
            >
              <div className="flex justify-between items-center">
                <div>
                  <h4 className="font-semibold text-gray-900">{earning.description}</h4>
                  <p className="text-sm text-gray-500">
                    {new Date(earning.created_at).toLocaleDateString()} • {earning.reference}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-emerald-600">
                    +${earning.amount.toFixed(2)}
                  </p>
                  <span className="inline-block px-2 py-1 text-xs bg-emerald-100 text-emerald-800 rounded-full">
                    Completed
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

const LeaderboardTab = ({ leaderboard }: { leaderboard: LeaderboardUser[] }) => {
  if (!leaderboard.length) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
        <FaTrophy className="text-4xl text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">No Leaderboard Data</h3>
        <p className="text-gray-500">Leaderboard will be available when users start referring</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="p-6 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">Top Referrers</h3>
      </div>
      <div className="divide-y divide-gray-200">
        {leaderboard.map((user, index) => (
          <motion.div
            key={user.email}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="p-6 hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className={`flex items-center justify-center w-8 h-8 rounded-full font-bold text-white ${
                  index === 0 ? 'bg-yellow-500' :
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
    </div>
  );
};

// Stat Card Component
interface StatCardProps {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  color: 'blue' | 'emerald' | 'green' | 'purple';
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
  const colorClasses: Record<StatCardProps['color'], string> = {
    blue: 'bg-blue-50 text-blue-600',
    emerald: 'bg-emerald-50 text-emerald-600',
    green: 'bg-green-50 text-green-600',
    purple: 'bg-purple-50 text-purple-600'
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white p-6 rounded-xl shadow-sm border border-gray-200"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-500 text-sm font-medium">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">
            {isCurrency ? '$' : ''}{typeof value === 'number' ? value.toLocaleString('en-US', {
              minimumFractionDigits: isCurrency ? 2 : 0,
              maximumFractionDigits: isCurrency ? 2 : 0
            }) : value}
          </p>
          {description && (
            <p className="text-xs text-gray-400 mt-1">{description}</p>
          )}
        </div>
        <div className={`p-3 rounded-full ${colorClasses[color]}`}>
          {icon}
        </div>
      </div>
    </motion.div>
  );
};

export default ReferralStats;