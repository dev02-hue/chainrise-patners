/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { getUserInvestments, withdrawFromInvestment, checkWithdrawalEligibility, calculateDailyProfits } from "@/lib/investment";
import { useState, useEffect, ReactNode } from "react";
import { 
  FaCoins, 
  FaChartLine, 
  FaGem, 
  FaClock, 
  FaCheckCircle, 
  FaTimesCircle, 
  FaWallet,
  FaCalendarAlt,
  FaPercentage,
  FaMoneyBillWave,
  FaSync,
  FaLock,
  FaUnlock
} from "react-icons/fa";
import { 
  FiChevronDown, 
  FiChevronUp, 
  FiDollarSign, 
  FiCalendar,
  FiTrendingUp,
  FiPieChart,
  FiTarget,
  FiRefreshCw
} from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";

export default function UserInvestments() {
  const [investments, setInvestments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const loadInvestments = async () => {
    try {
      setRefreshing(true);
      const { data, error } = await getUserInvestments();
      if (error) throw new Error(error);
      setInvestments(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load investments");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadInvestments();
  }, []);

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  if (loading) return (
    <div className="flex justify-center items-center h-64">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
        className="text-blue-500 text-3xl"
      >
        <FiRefreshCw />
      </motion.div>
    </div>
  );

  if (error) return (
    <motion.div 
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-red-50 text-red-600 p-4 rounded-lg flex items-center gap-3 max-w-4xl mx-auto"
    >
      <FaTimesCircle className="flex-shrink-0" />
      <span>{error}</span>
    </motion.div>
  );

  if (investments.length === 0) return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="bg-gradient-to-br from-blue-50 to-indigo-50 text-blue-600 p-8 rounded-2xl text-center max-w-2xl mx-auto border border-blue-100"
    >
      <div className="text-5xl mb-4">
        <FaCoins className="inline-block text-blue-400" />
      </div>
      <h3 className="text-2xl font-bold mb-3 text-gray-800">No Active Investments</h3>
      <p className="text-blue-500 text-lg mb-4">Start your investment journey to see your portfolio grow.</p>
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="bg-blue-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-600 transition-colors"
      >
        Explore Investment Plans
      </motion.button>
    </motion.div>
  );

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <StatCard
          title="Total Investments"
          value={investments.length}
          icon={<FaWallet className="text-blue-500" />}
          color="blue"
        />
        <StatCard
          title="Active Plans"
          value={investments.filter(inv => inv.status === 'active').length}
          icon={<FiTrendingUp className="text-green-500" />}
          color="green"
        />
        <StatCard
          title="Total Invested"
          value={investments.reduce((sum, inv) => sum + parseFloat(inv.amount || 0), 0)}
          icon={<FiDollarSign className="text-purple-500" />}
          color="purple"
          isCurrency
        />
        <StatCard
          title="Total Earned"
          value={investments.reduce((sum, inv) => sum + parseFloat(inv.totalEarned || 0), 0)}
          icon={<FaMoneyBillWave className="text-orange-500" />}
          color="orange"
          isCurrency
        />
      </div>

      {/* Refresh Button */}
      <div className="flex justify-end">
        <motion.button
          onClick={loadInvestments}
          disabled={refreshing}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 transition-colors"
        >
          <motion.div
            animate={{ rotate: refreshing ? 360 : 0 }}
            transition={{ duration: 1, ease: "linear" }}
          >
            <FaSync />
          </motion.div>
          {refreshing ? 'Refreshing...' : 'Refresh'}
        </motion.button>
      </div>

      {/* Investments List */}
      <div className="space-y-4">
        {investments.map((investment) => (
          <InvestmentCard 
            key={investment.id}
            investment={investment}
            isExpanded={expandedId === investment.id}
            onToggleExpand={() => toggleExpand(investment.id)}
            onRefresh={loadInvestments}
          />
        ))}
      </div>
    </div>
  );
}

type StatColor = 'blue' | 'green' | 'purple' | 'orange';

interface StatCardProps {
  title: string;
  value: number | string;
  icon: ReactNode;
  color?: StatColor;
  isCurrency?: boolean;
}

function StatCard({ title, value, icon, color = 'blue', isCurrency = false }: StatCardProps) {
  const colorClasses: Record<StatColor, string> = {
    blue: 'bg-blue-50 border-blue-200',
    green: 'bg-green-50 border-green-200',
    purple: 'bg-purple-50 border-purple-200',
    orange: 'bg-orange-50 border-orange-200'
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`p-4 rounded-xl border ${colorClasses[color]} shadow-sm`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-800 mt-1">
            {isCurrency ? '$' : ''}{typeof value === 'number' ? value.toLocaleString('en-US', {
              minimumFractionDigits: isCurrency ? 2 : 0,
              maximumFractionDigits: isCurrency ? 2 : 0
            }) : value}
          </p>
        </div>
        <div className="text-2xl">
          {icon}
        </div>
      </div>
    </motion.div>
  );
}

function InvestmentCard({ 
  investment, 
  isExpanded, 
  onToggleExpand,
  onRefresh
}: { 
  investment: any;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onRefresh: () => void;
}) {
  const [withdrawLoading, setWithdrawLoading] = useState(false);

  const getPlanIcon = (title: string) => {
    if (title?.includes("Starter") || title?.includes("Basic")) return <FaCoins className="text-yellow-500" />;
    if (title?.includes("Advanced") || title?.includes("Premium")) return <FaChartLine className="text-blue-500" />;
    if (title?.includes("Professional") || title?.includes("VIP")) return <FaGem className="text-purple-500" />;
    return <FaCoins className="text-gray-500" />;
  };

  const getStatusConfig = (status: string) => {
    switch (status?.toLowerCase()) {
      case "active": 
        return {
          color: "bg-green-100 text-green-800 border-green-200",
          icon: <FaClock className="text-green-500" />
        };
      case "completed": 
        return {
          color: "bg-blue-100 text-blue-800 border-blue-200",
          icon: <FaCheckCircle className="text-blue-500" />
        };
      case "cancelled": 
        return {
          color: "bg-red-100 text-red-800 border-red-200",
          icon: <FaTimesCircle className="text-red-500" />
        };
      default: 
        return {
          color: "bg-gray-100 text-gray-800 border-gray-200",
          icon: <FaClock className="text-gray-500" />
        };
    }
  };

  const handleManualWithdraw = async () => {
    try {
      setWithdrawLoading(true);
      
      // Calculate daily profits first
      await calculateDailyProfits();
      
      // Check eligibility
      const eligibility = await checkWithdrawalEligibility(investment.id);
      if (eligibility.error || !eligibility.canWithdraw) {
        alert(eligibility.message || 'Withdrawal not allowed at this time');
        return;
      }

      const availableAmount = eligibility.availableAmount || 0;
      if (availableAmount <= 0) {
        alert('No profits available for withdrawal');
        return;
      }

      // Perform withdrawal
      const result = await withdrawFromInvestment(investment.id, availableAmount);
      if (result.error) {
        alert(result.error);
        return;
      }

      alert(`Successfully withdrawn $${availableAmount.toFixed(2)} to your balance!`);
      onRefresh(); // Refresh the data
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Withdrawal failed');
    } finally {
      setWithdrawLoading(false);
    }
  };

  const statusConfig = getStatusConfig(investment.status);
  const progress = calculateProgress(new Date(investment.startDate), new Date(investment.endDate));
  const daysLeft = calculateDaysLeft(new Date(investment.endDate));
  const isLocked = investment.withdrawalLockUntil && new Date(investment.withdrawalLockUntil) > new Date();

  // Calculate profits based on your actual data structure
  const calculateDailyProfit = () => {
    const amount = parseFloat(investment.amount) || 0;
    const percentage = parseFloat(investment.dailyProfitPercentage) || 0;
    return amount * (percentage / 100);
  };

  const calculateTotalExpectedProfit = () => {
    const amount = parseFloat(investment.amount) || 0;
    const percentage = parseFloat(investment.dailyProfitPercentage) || 0;
    const duration = parseInt(investment.durationDays) || 0;
    return amount * (percentage / 100) * duration;
  };

  const dailyProfit = calculateDailyProfit();
  const totalExpectedProfit = calculateTotalExpectedProfit();
  const currentBalance = parseFloat(investment.currentBalance) || 0;
  const totalEarned = parseFloat(investment.totalEarned) || 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="border border-gray-200 rounded-2xl overflow-hidden bg-white shadow-sm hover:shadow-lg transition-all duration-300"
    >
      <div className="p-6">
        {/* Header Section */}
        <div className="flex justify-between items-start mb-6">
          <div className="flex items-center space-x-4">
            <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 text-blue-500 shadow-sm">
              {getPlanIcon(investment.planTitle)}
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-800">{investment.planTitle || 'Investment Plan'}</h3>
              <div className="flex items-center gap-3 mt-2">
                <div className="flex items-center gap-1 text-gray-600">
                  <FiDollarSign />
                  <span className="font-semibold">
                    {parseFloat(investment.amount || 0).toLocaleString('en-US', { 
                      style: 'currency', 
                      currency: 'USD' 
                    })}
                  </span>
                </div>
                <div className="flex items-center gap-1 text-green-600">
                  <FaPercentage />
                  <span className="font-semibold">
                    {investment.dailyProfitPercentage}% daily
                  </span>
                </div>
              </div>
            </div>
          </div>
          <div className="flex flex-col items-end gap-2">
            <span className={`px-3 py-1.5 rounded-full text-sm font-semibold flex items-center gap-2 border ${statusConfig.color}`}>
              {statusConfig.icon}
              {investment.status?.toUpperCase()}
            </span>
            {isLocked && (
              <span className="px-2 py-1 rounded-full text-xs bg-orange-100 text-orange-800 flex items-center gap-1">
                <FaLock size={10} />
                Locked
              </span>
            )}
          </div>
        </div>
        
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <StatBox 
            icon={<FiPieChart className="text-blue-500" />}
            label="Current Balance"
            value={currentBalance}
            isCurrency
          />
          <StatBox 
            icon={<FaMoneyBillWave className="text-green-500" />}
            label="Total Earned"
            value={totalEarned}
            isCurrency
          />
          <StatBox 
            icon={<FiTarget className="text-purple-500" />}
            label="Daily Profit"
            value={dailyProfit}
            isCurrency
          />
          <StatBox 
            icon={<FiCalendar className="text-orange-500" />}
            label="Duration"
            value={`${investment.durationDays || 'N/A'} days`}
          />
        </div>
        
        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span className="font-medium">Investment Progress</span>
            <span className="font-semibold">{Math.round(progress)}% completed • {daysLeft} days left</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <motion.div 
              className="bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full shadow-sm" 
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 1.5, ease: "easeOut" }}
            />
          </div>
          <div className="flex justify-between text-xs text-gray-500 mt-2">
            <span>{new Date(investment.startDate).toLocaleDateString()}</span>
            <span>{new Date(investment.endDate).toLocaleDateString()}</span>
          </div>
        </div>
        
        {/* Action Buttons */}
        <div className="flex gap-3">
          <motion.button
            onClick={onToggleExpand}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex-1 bg-gray-100 text-gray-700 font-medium flex items-center justify-center gap-2 py-3 rounded-xl hover:bg-gray-200 transition-colors"
          >
            {isExpanded ? (
              <>
                <span>Hide Details</span>
                <FiChevronUp />
              </>
            ) : (
              <>
                <span>View Full Details</span>
                <FiChevronDown />
              </>
            )}
          </motion.button>
          
          {!isLocked && investment.status === 'active' && (
            <motion.button
              onClick={handleManualWithdraw}
              disabled={withdrawLoading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="px-6 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold flex items-center justify-center gap-2 py-3 rounded-xl hover:from-green-600 hover:to-emerald-700 disabled:opacity-50 transition-colors"
            >
              {withdrawLoading ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                >
                  <FiRefreshCw />
                </motion.div>
              ) : (
                <FaMoneyBillWave />
              )}
              {withdrawLoading ? 'Processing...' : 'Withdraw Profits'}
            </motion.button>
          )}
        </div>
        
        {/* Expanded Details */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <div className="mt-6 pt-6 border-t border-gray-100">
                <h4 className="font-bold text-gray-700 mb-4 text-lg">Investment Analytics</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <DetailCard 
                    label="Investment ID"
                    value={investment.id}
                    icon={<FaWallet className="text-blue-500" />}
                  />
                  <DetailCard 
                    label="Expected Total Profit"
                    value={totalExpectedProfit}
                    icon={<FiTrendingUp className="text-green-500" />}
                    isCurrency
                  />
                  <DetailCard 
                    label="Daily Profit Rate"
                    value={`${investment.dailyProfitPercentage}%`}
                    icon={<FaPercentage className="text-purple-500" />}
                  />
                  <DetailCard 
                    label="Start Date"
                    value={new Date(investment.startDate).toLocaleDateString('en-US', { 
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                    icon={<FaCalendarAlt className="text-orange-500" />}
                  />
                  <DetailCard 
                    label="End Date"
                    value={new Date(investment.endDate).toLocaleDateString('en-US', { 
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                    icon={<FaCalendarAlt className="text-red-500" />}
                  />
                  <DetailCard 
                    label="Withdrawal Lock"
                    value={investment.withdrawalLockUntil ? 
                      new Date(investment.withdrawalLockUntil).toLocaleDateString() : 
                      'Unlocked'
                    }
                    icon={isLocked ? <FaLock className="text-orange-500" /> : <FaUnlock className="text-green-500" />}
                  />
                </div>
                
                {/* Profit Breakdown */}
                <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
                  <h5 className="font-semibold text-gray-700 mb-3">Profit Breakdown</h5>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Daily:</span>
                      <div className="font-bold text-green-600">
                        +{dailyProfit.toLocaleString('en-US', { 
                          style: 'currency', 
                          currency: 'USD' 
                        })}
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-600">Weekly:</span>
                      <div className="font-bold text-green-600">
                        +{(dailyProfit * 7).toLocaleString('en-US', { 
                          style: 'currency', 
                          currency: 'USD' 
                        })}
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-600">Monthly:</span>
                      <div className="font-bold text-green-600">
                        +{(dailyProfit * 30).toLocaleString('en-US', { 
                          style: 'currency', 
                          currency: 'USD' 
                        })}
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-600">Total Expected:</span>
                      <div className="font-bold text-green-600">
                        +{totalExpectedProfit.toLocaleString('en-US', { 
                          style: 'currency', 
                          currency: 'USD' 
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

function StatBox({ icon, label, value, isCurrency = false }: any) {
  return (
    <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
      <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
        {icon}
        <span>{label}</span>
      </div>
      <div className={`font-bold ${isCurrency ? 'text-lg' : 'text-md'} text-gray-800`}>
        {isCurrency ? '$' : ''}{typeof value === 'number' ? value.toLocaleString('en-US', {
          minimumFractionDigits: isCurrency ? 2 : 0,
          maximumFractionDigits: isCurrency ? 2 : 0
        }) : value}
      </div>
    </div>
  );
}

function DetailCard({ label, value, icon, isCurrency = false }: any) {
  return (
    <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
      <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
        {icon}
        <span>{label}</span>
      </div>
      <div className="font-semibold text-gray-800 text-sm">
        {isCurrency && typeof value === 'number' ? '$' : ''}
        {typeof value === 'number' ? value.toLocaleString('en-US', {
          minimumFractionDigits: isCurrency ? 2 : 0,
          maximumFractionDigits: isCurrency ? 2 : 0
        }) : value}
      </div>
    </div>
  );
}

function calculateProgress(startDate: Date, endDate: Date): number {
  const now = new Date();
  const total = endDate.getTime() - startDate.getTime();
  const elapsed = now.getTime() - startDate.getTime();
  return Math.min(100, Math.max(0, (elapsed / total) * 100));
}

function calculateDaysLeft(endDate: Date): number {
  const now = new Date();
  const diff = endDate.getTime() - now.getTime();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}