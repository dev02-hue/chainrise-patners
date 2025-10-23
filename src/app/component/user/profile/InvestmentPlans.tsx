/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
 
import { useState, useEffect } from "react";
import { FaCoins, FaChartLine, FaGem, FaCrown, FaSync, FaWallet } from "react-icons/fa";
import { FiChevronDown, FiChevronUp, FiCheck, FiZap, FiAlertCircle, FiDollarSign, FiCalendar } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import InvestNowButton from "./InvestNowButton";
import { calculateDailyProfits, checkWithdrawalEligibility, getInvestmentPlans, getUserInvestments, withdrawFromInvestment } from "@/lib/investment";

export default function InvestmentPlans() {
  const [plans, setPlans] = useState<any[]>([]);
  const [userInvestments, setUserInvestments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [withdrawLoading, setWithdrawLoading] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setRefreshing(true);
      const [plansResponse, investmentsResponse] = await Promise.all([
        getInvestmentPlans(),
        getUserInvestments()
      ]);
      
      if (plansResponse.error) throw new Error(plansResponse.error);
      if (investmentsResponse.error) throw new Error(investmentsResponse.error);
      
      setPlans(plansResponse.data || []);
      setUserInvestments(investmentsResponse.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load data");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleManualWithdraw = async (investmentId: string) => {
    try {
      setWithdrawLoading(investmentId);
      
      // First calculate daily profits to ensure we have latest earnings
      const profitResult = await calculateDailyProfits();
      if (profitResult.error) {
        console.warn('Profit calculation warning:', profitResult.error);
      }

      // Check eligibility
      const eligibility = await checkWithdrawalEligibility(investmentId);
      if (eligibility.error || !eligibility.canWithdraw) {
        alert(eligibility.message || 'Withdrawal not allowed at this time');
        return;
      }

      const availableAmount = eligibility.availableAmount || 0;
      if (availableAmount <= 0) {
        alert('No funds available for withdrawal');
        return;
      }

      // Perform withdrawal
      const result = await withdrawFromInvestment(investmentId, availableAmount);
      if (result.error) {
        alert(result.error);
        return;
      }

      alert(`Successfully withdrawn $${availableAmount.toFixed(2)} to your balance!`);
      await loadData(); // Refresh data
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Withdrawal failed');
    } finally {
      setWithdrawLoading(null);
    }
  };

  const calculateTotalEarnings = () => {
    return userInvestments.reduce((total, inv) => total + (inv.totalEarned || 0), 0);
  };

  const calculateActiveInvestments = () => {
    return userInvestments.filter(inv => inv.status === 'active').length;
  };

  if (loading) return (
    <div className="flex justify-center items-center h-64">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
        className="text-blue-500 text-2xl"
      >
        <FiZap />
      </motion.div>
    </div>
  );

  if (error) return (
    <div className="bg-red-50 text-red-600 p-4 rounded-lg flex items-center gap-2 max-w-md mx-auto">
      <FiAlertCircle />
      {error}
    </div>
  );

  return (
    <div className="space-y-8 py-8">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl p-6 shadow-md border border-gray-100"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Total Earnings</p>
              <p className="text-2xl font-bold text-green-600">
                ${calculateTotalEarnings().toFixed(2)}
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <FaWallet className="text-green-600 text-xl" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl p-6 shadow-md border border-gray-100"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Active Investments</p>
              <p className="text-2xl font-bold text-blue-600">
                {calculateActiveInvestments()}
              </p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <FaChartLine className="text-blue-600 text-xl" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl p-6 shadow-md border border-gray-100"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Total Plans</p>
              <p className="text-2xl font-bold text-purple-600">
                {plans.length}
              </p>
            </div>
            <div className="p-3 bg-purple-100 rounded-full">
              <FaCoins className="text-purple-600 text-xl" />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Refresh Button */}
      <div className="flex justify-end">
        <motion.button
          onClick={loadData}
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
          {refreshing ? 'Refreshing...' : 'Refresh Data'}
        </motion.button>
      </div>

      {/* Active Investments */}
      {userInvestments.length > 0 && (
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Your Active Investments</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {userInvestments.filter(inv => inv.status === 'active').map((investment, index) => (
              <InvestmentCard 
                key={investment.id} 
                investment={investment} 
                onManualWithdraw={handleManualWithdraw}
                withdrawLoading={withdrawLoading === investment.id}
                index={index}
              />
            ))}
          </div>
        </div>
      )}

      {/* Investment Plans */}
      <div>
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Available Investment Plans</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
            >
              <PlanCard plan={plan} />
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

function InvestmentCard({ 
  investment, 
  onManualWithdraw, 
  withdrawLoading,
  index 
}: { 
  investment: any; 
  onManualWithdraw: (id: string) => void;
  withdrawLoading: boolean;
  index: number;
}) {
  const [expanded, setExpanded] = useState(false);
  const isLocked = investment.withdrawalLockUntil && new Date(investment.withdrawalLockUntil) > new Date();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="bg-white rounded-xl shadow-md border border-gray-200 p-6"
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="font-bold text-lg text-gray-800">{investment.planTitle}</h3>
          <p className="text-green-600 font-semibold">
            ${investment.currentBalance?.toFixed(2)}
          </p>
        </div>
        <div className={`px-2 py-1 rounded-full text-xs font-medium ${
          investment.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
        }`}>
          {investment.status}
        </div>
      </div>

      <div className="space-y-2 text-sm text-gray-600">
        <div className="flex justify-between">
          <span>Invested:</span>
          <span>${investment.amount?.toFixed(2)}</span>
        </div>
        <div className="flex justify-between">
          <span>Earned:</span>
          <span className="text-green-600">+${investment.totalEarned?.toFixed(2)}</span>
        </div>
        <div className="flex justify-between">
          <span>Daily Profit:</span>
          <span>{investment.dailyProfitPercentage}%</span>
        </div>
      </div>

      <button 
        onClick={() => setExpanded(!expanded)}
        className="w-full mt-4 flex items-center justify-center gap-2 text-blue-500 font-medium text-sm"
      >
        {expanded ? <FiChevronUp /> : <FiChevronDown />}
        {expanded ? 'Less' : 'More'} Details
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="mt-4 pt-4 border-t border-gray-100 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="flex items-center gap-1">
                  <FiCalendar />
                  Start Date:
                </span>
                <span>{new Date(investment.startDate).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between">
                <span>End Date:</span>
                <span>{new Date(investment.endDate).toLocaleDateString()}</span>
              </div>
              {investment.withdrawalLockUntil && (
                <div className="flex justify-between">
                  <span>Withdrawal Lock:</span>
                  <span className={isLocked ? 'text-orange-600' : 'text-green-600'}>
                    {isLocked ? new Date(investment.withdrawalLockUntil).toLocaleDateString() : 'Unlocked'}
                  </span>
                </div>
              )}
            </div>

            {/* Manual Withdraw Button */}
            <motion.button
              onClick={() => onManualWithdraw(investment.id)}
              disabled={withdrawLoading || isLocked}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`w-full mt-4 py-2 px-4 rounded-lg font-medium flex items-center justify-center gap-2 ${
                isLocked 
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                  : 'bg-green-500 hover:bg-green-600 text-white'
              } transition-colors`}
            >
              {withdrawLoading ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                >
                  <FiZap />
                </motion.div>
              ) : (
                <FiDollarSign />
              )}
              {isLocked ? 'Withdrawal Locked' : 
               withdrawLoading ? 'Processing...' : 'Withdraw Profits'}
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function PlanCard({ plan }: { plan: any }) {
  const [expanded, setExpanded] = useState(false);
  
  const cardVariants = {
    hover: {
      y: -5,
      boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)"
    }
  };

  return (
    <motion.div
      variants={cardVariants}
      whileHover="hover"
      className={`relative h-full flex flex-col border border-gray-200 rounded-xl overflow-hidden bg-white transition-all duration-300 ${
        plan.popular ? "ring-2 ring-blue-500" : ""
      }`}
    >
      {plan.popular && (
        <div className="absolute top-0 right-0 bg-blue-500 text-white text-xs font-bold px-3 py-1 rounded-bl-lg flex items-center gap-1">
          <FaCrown className="text-yellow-300" />
          POPULAR
        </div>
      )}
      
      <div className="p-6 flex-1 flex flex-col">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-2xl font-bold text-gray-800">{plan.title}</h3>
            <p className="text-gray-500">Daily returns</p>
          </div>
          <div className="text-3xl p-3 rounded-full bg-blue-50 text-blue-500">
            {plan.title === "Starter" && <FaCoins />}
            {plan.title === "Advanced" && <FaChartLine />}
            {plan.title === "Professional" && <FaGem />}
          </div>
        </div>
        
        <div className="mb-6">
          <div className="text-4xl font-bold text-blue-600 mb-1">
            {plan.daily_profit_percentage}%
          </div>
          <div className="text-sm text-gray-500">Daily Profit</div>
        </div>
        
        <div className="space-y-3 mb-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-500">
              <FiCheck size={14} />
            </div>
            <span><strong>Min:</strong> ${plan.min_amount.toLocaleString()}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-500">
              <FiCheck size={14} />
            </div>
            <span><strong>Max:</strong> ${plan.max_amount?.toLocaleString() || 'No limit'}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-500">
              <FiCheck size={14} />
            </div>
            <span><strong>Duration:</strong> {plan.duration_days} days</span>
          </div>
        </div>
        
        <button 
          onClick={() => setExpanded(!expanded)}
          className="flex items-center justify-center gap-2 text-blue-500 font-medium mb-4"
        >
          {expanded ? (
            <>
              <span>Hide details</span>
              <FiChevronUp />
            </>
          ) : (
            <>
              <span>View all features</span>
              <FiChevronDown />
            </>
          )}
        </button>
        
        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <div className="pt-4 border-t border-gray-100">
                <h4 className="font-bold text-gray-700 mb-2">Plan Features:</h4>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <div className="text-green-500 mt-1">
                      <FiCheck />
                    </div>
                    <span>Daily profit calculation</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="text-green-500 mt-1">
                      <FiCheck />
                    </div>
                    <span>Capital protection</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="text-green-500 mt-1">
                      <FiCheck />
                    </div>
                    <span>24/7 customer support</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="text-green-500 mt-1">
                      <FiCheck />
                    </div>
                    <span>Manual withdrawal available</span>
                  </li>
                </ul>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        
        <div className="mt-auto pt-6">
          <InvestNowButton planId={plan.id} minAmount={plan.min_amount} />
        </div>
      </div>
    </motion.div>
  );
}