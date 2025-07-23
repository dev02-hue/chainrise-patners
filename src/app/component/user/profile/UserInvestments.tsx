/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { getUserInvestments } from "@/lib/investment";
import { useState, useEffect } from "react";
import { FaCoins, FaChartLine, FaGem, FaClock, FaCheckCircle, FaTimesCircle } from "react-icons/fa";
import { FiChevronDown, FiChevronUp, FiDollarSign, FiCalendar, FiClock } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";

export default function UserInvestments() {
  const [investments, setInvestments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    async function loadInvestments() {
      try {
        const { data, error } = await getUserInvestments();
        if (error) throw new Error(error);
        setInvestments(data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load investments");
      } finally {
        setLoading(false);
      }
    }
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
        <FaClock />
      </motion.div>
    </div>
  );

  if (error) return (
    <motion.div 
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-red-50 text-red-600 p-4 rounded-lg flex items-center gap-3 max-w-2xl mx-auto"
    >
      <FaTimesCircle className="flex-shrink-0" />
      <span>{error}</span>
    </motion.div>
  );

  if (investments.length === 0) return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="bg-blue-50 text-blue-600 p-6 rounded-xl text-center max-w-2xl mx-auto"
    >
      <div className="text-4xl mb-3">
        <FaCoins className="inline-block" />
      </div>
      <h3 className="text-xl font-semibold mb-2">No Active Investments</h3>
      <p className="text-blue-500">You don&apos;t have any investments yet. Start investing to see them appear here.</p>
    </motion.div>
  );

  return (
    <div className="space-y-4">
      {investments.map((investment) => (
        <InvestmentCard 
          key={investment.id}
          investment={investment}
          isExpanded={expandedId === investment.id}
          onToggleExpand={() => toggleExpand(investment.id)}
        />
      ))}
    </div>
  );
}

function InvestmentCard({ 
  investment, 
  isExpanded, 
  onToggleExpand 
}: { 
  investment: any;
  isExpanded: boolean;
  onToggleExpand: () => void;
}) {
  const getPlanIcon = (title: string) => {
    if (title.includes("Starter")) return <FaCoins className="text-yellow-500" />;
    if (title.includes("Advanced")) return <FaChartLine className="text-blue-500" />;
    if (title.includes("Professional")) return <FaGem className="text-purple-500" />;
    return <FaCoins className="text-gray-500" />;
  };

  const getStatusConfig = (status: string) => {
    switch (status.toLowerCase()) {
      case "active": 
        return {
          color: "bg-green-100 text-green-800",
          icon: <FaClock className="text-green-500" />
        };
      case "completed": 
        return {
          color: "bg-blue-100 text-blue-800",
          icon: <FaCheckCircle className="text-blue-500" />
        };
      case "cancelled": 
        return {
          color: "bg-red-100 text-red-800",
          icon: <FaTimesCircle className="text-red-500" />
        };
      default: 
        return {
          color: "bg-gray-100 text-gray-800",
          icon: <FaClock className="text-gray-500" />
        };
    }
  };

  const statusConfig = getStatusConfig(investment.status);
  const progress = calculateProgress(new Date(investment.startDate), new Date(investment.endDate));
  const daysLeft = calculateDaysLeft(new Date(investment.endDate));

  // Safely calculate daily profit
  const calculateDailyProfit = () => {
    try {
      const amount = parseFloat(investment.amount) || 0;
      const percentage = parseFloat(investment.percentage) || 0;
      return amount * (percentage / 100);
    } catch {
      return 0;
    }
  };

  // Safely calculate next payout date
  const getNextPayoutDate = () => {
    try {
      if (!investment.startDate || !investment.intervalDays) return null;
      
      const startDate = new Date(investment.startDate);
      const intervalDays = parseInt(investment.intervalDays) || 0;
      
      if (isNaN(startDate.getTime())) return null;

      
      const nextPayout = new Date(
        startDate.getTime() + (intervalDays * 24 * 60 * 60 * 1000)
      );
      
      return isNaN(nextPayout.getTime()) ? null : nextPayout;
    } catch {
      return null;
    }
  };

  const dailyProfit = calculateDailyProfit();
  const nextPayoutDate = getNextPayoutDate();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="border border-gray-200 rounded-xl overflow-hidden bg-white shadow-sm hover:shadow-md transition-shadow"
    >
      <div className="p-6">
        <div className="flex justify-between items-start">
          <div className="flex items-center space-x-4">
            <div className="p-3 rounded-full bg-blue-50 text-blue-500">
              {getPlanIcon(investment.planTitle)}
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-800">{investment.planTitle}</h3>
              <div className="flex items-center gap-2 text-gray-600">
                <FiDollarSign />
                <span>
                  {parseFloat(investment.amount || 0).toLocaleString('en-US', { 
                    style: 'currency', 
                    currency: 'USD' 
                  })}
                </span>
              </div>
            </div>
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${statusConfig.color}`}>
            {statusConfig.icon}
            {investment.status.toUpperCase()}
          </span>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
              <FiDollarSign size={14} />
              <span>Expected Return</span>
            </div>
            <div className="text-xl font-bold text-gray-800">
              {parseFloat(investment.expectedReturn || 0).toLocaleString('en-US', { 
                style: 'currency', 
                currency: 'USD' 
              })}
            </div>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
              <FiCalendar size={14} />
              <span>Start Date</span>
            </div>
            <div className="text-gray-800">
              {new Date(investment.startDate).toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'short', 
                day: 'numeric' 
              })}
            </div>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
              <FiCalendar size={14} />
              <span>End Date</span>
            </div>
            <div className="text-gray-800">
              {new Date(investment.endDate).toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'short', 
                day: 'numeric' 
              })}
            </div>
          </div>
        </div>
        
        <div className="mt-6">
          <div className="flex justify-between text-sm text-gray-600 mb-1">
            <span>Investment Progress</span>
            <span>{Math.round(progress)}% completed</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <motion.div 
              className="bg-blue-600 h-2.5 rounded-full" 
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 1 }}
            />
          </div>
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>Started</span>
            <span className="flex items-center gap-1">
              <FiClock size={12} />
              {daysLeft} {daysLeft === 1 ? 'day' : 'days'} left
            </span>
          </div>
        </div>
        
        <button 
          onClick={onToggleExpand}
          className="w-full mt-4 text-blue-500 font-medium flex items-center justify-center gap-2 py-2"
        >
          {isExpanded ? (
            <>
              <span>Hide details</span>
              <FiChevronUp />
            </>
          ) : (
            <>
              <span>View transaction details</span>
              <FiChevronDown />
            </>
          )}
        </button>
        
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <div className="mt-4 pt-4 border-t border-gray-100">
                <h4 className="font-semibold text-gray-700 mb-3">Investment Details</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <div className="text-sm text-blue-600 mb-1">Investment ID</div>
                    <div className="font-mono text-sm">{investment.id}</div>
                  </div>
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <div className="text-sm text-blue-600 mb-1">Daily Profit</div>
                    <div className="font-bold">
                      {dailyProfit.toLocaleString('en-US', { 
                        style: 'currency', 
                        currency: 'USD' 
                      })}
                    </div>
                  </div>
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <div className="text-sm text-blue-600 mb-1">Total Profit</div>
                    <div className="font-bold">
                      {(parseFloat(investment.expectedReturn || 0) - parseFloat(investment.amount || 0)).toLocaleString('en-US', { 
                        style: 'currency', 
                        currency: 'USD' 
                      })}
                    </div>
                  </div>
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <div className="text-sm text-blue-600 mb-1">Next Payout</div>
                    <div className="font-bold">
                      {nextPayoutDate ? (
                        nextPayoutDate.toLocaleDateString('en-US', { 
                          month: 'short', 
                          day: 'numeric' 
                        })
                      ) : (
                        <span className="text-gray-500">Not available</span>
                      )}
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