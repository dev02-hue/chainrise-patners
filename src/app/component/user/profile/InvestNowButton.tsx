/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createInvestment, getUserInvestments } from "@/lib/investment";
import { motion } from "framer-motion";
import { FiDollarSign, FiLoader, FiArrowRight, FiCheckCircle, FiAlertCircle, FiInfo } from "react-icons/fi";
import { FaHandHoldingUsd, FaChartLine } from "react-icons/fa";

export default function InvestNowButton({ planId, minAmount }: { planId: string; minAmount: number }) {
  const [amount, setAmount] = useState(minAmount);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [userInvestments, setUserInvestments] = useState<any[]>([]);
  const router = useRouter();

  useEffect(() => {
    loadUserInvestments();
  }, []);

  const loadUserInvestments = async () => {
    try {
      const { data } = await getUserInvestments();
      setUserInvestments(data || []);
    } catch (err) {
      console.error('Failed to load user investments:', err);
    }
  };

  const calculateProjectedEarnings = (investmentAmount: number, dailyPercentage: number = 5, days: number = 30) => {
    const dailyProfit = (investmentAmount * dailyPercentage) / 100;
    return {
      daily: dailyProfit,
      weekly: dailyProfit * 7,
      monthly: dailyProfit * 30,
      total: dailyProfit * days
    };
  };

  const handleInvest = async () => {
    setLoading(true);
    setError("");
    try {
      const activeInvestments = userInvestments.filter(inv => inv.status === 'active');
      
      // Check investment limit
      if (activeInvestments.length >= 3) {
        setError('You have reached the maximum number of active investments (3)');
        return;
      }

      const { success, error } = await createInvestment(planId, amount);
      if (error) throw new Error(error);
      if (success) {
        setSuccess(true);
        setTimeout(() => {
          router.push("/user/investment-all");
        }, 2000);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Investment failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleAmountChange = (value: string) => {
    const numValue = Number(value);
    if (!isNaN(numValue) && numValue >= minAmount) {
      setAmount(numValue);
    }
  };

  const inputVariants = {
    focus: {
      borderColor: "#3b82f6",
      boxShadow: "0 0 0 2px rgba(59, 130, 246, 0.2)",
      transition: { duration: 0.2 }
    }
  };

  const buttonVariants = {
    initial: { scale: 1 },
    tap: { scale: 0.98 },
    hover: { scale: 1.02 }
  };

  const projectedEarnings = calculateProjectedEarnings(amount);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="mt-6 bg-white rounded-xl shadow-lg p-6 border border-gray-100"
    >
      <div className="mb-6">
        <h3 className="text-xl font-semibold text-gray-800 flex items-center gap-2 mb-4">
          <FaHandHoldingUsd className="text-blue-500" />
          Investment Details
        </h3>
        
        {/* Amount Input */}
        <div className="mb-6">
          <label className="block mb-2 font-medium text-gray-700">Investment Amount ($)</label>
          <motion.div
            variants={inputVariants}
            whileFocus="focus"
            className="relative"
          >
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiDollarSign className="text-gray-400" />
            </div>
            <input
              type="number"
              min={minAmount}
              value={amount}
              onChange={(e) => handleAmountChange(e.target.value)}
              className="w-full pl-10 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-100 transition-colors text-lg font-semibold"
              placeholder={`Minimum $${minAmount}`}
            />
          </motion.div>
          <p className="text-sm text-gray-500 mt-2">
            Minimum investment: ${minAmount.toLocaleString()}
          </p>
        </div>

        {/* Projected Earnings */}
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-100"
        >
          <h4 className="font-semibold text-blue-800 flex items-center gap-2 mb-3">
            <FaChartLine />
            Projected Earnings
          </h4>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-gray-600">Daily</p>
              <p className="font-semibold text-green-600">
                +${projectedEarnings.daily.toFixed(2)}
              </p>
            </div>
            <div>
              <p className="text-gray-600">Weekly</p>
              <p className="font-semibold text-green-600">
                +${projectedEarnings.weekly.toFixed(2)}
              </p>
            </div>
            <div>
              <p className="text-gray-600">Monthly</p>
              <p className="font-semibold text-green-600">
                +${projectedEarnings.monthly.toFixed(2)}
              </p>
            </div>
            <div>
              <p className="text-gray-600">Total (30 days)</p>
              <p className="font-semibold text-green-600">
                +${projectedEarnings.total.toFixed(2)}
              </p>
            </div>
          </div>
        </motion.div>
        
        {/* Error Display */}
        {error && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-red-500 mb-4 p-3 bg-red-50 rounded-lg flex items-center gap-2"
          >
            <FiAlertCircle className="flex-shrink-0" />
            {error}
          </motion.div>
        )}
        
        {/* Info Message */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start gap-2"
        >
          <FiInfo className="text-yellow-600 mt-0.5 flex-shrink-0" />
          <p className="text-yellow-700 text-sm">
            Your investment will be locked for 2 months. Daily profits can be withdrawn manually.
          </p>
        </motion.div>
        
        {/* Success Message */}
        {success ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-green-50 text-green-700 p-4 rounded-lg flex items-center gap-2 mb-4 border border-green-200"
          >
            <FiCheckCircle className="text-green-500 text-xl flex-shrink-0" />
            <div>
              <p className="font-semibold">Investment successful!</p>
              <p className="text-sm">Redirecting to your investments...</p>
            </div>
          </motion.div>
        ) : (
          /* Invest Button */
          <motion.button
            onClick={handleInvest}
            disabled={loading || amount < minAmount}
            variants={buttonVariants}
            initial="initial"
            whileHover="hover"
            whileTap="tap"
            className={`w-full py-4 px-6 rounded-lg font-semibold flex items-center justify-center gap-2 text-lg ${
              loading 
                ? "bg-blue-400 cursor-not-allowed" 
                : amount < minAmount 
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed" 
                  : "bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white shadow-lg"
            } transition-all duration-200`}
          >
            {loading ? (
              <>
                <motion.span
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                >
                  <FiLoader className="animate-spin" />
                </motion.span>
                Processing Investment...
              </>
            ) : (
              <>
                <FaHandHoldingUsd />
                Invest ${amount.toLocaleString()}
                <FiArrowRight />
              </>
            )}
          </motion.button>
        )}
      </div>

      {/* Additional Features */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="pt-4 border-t border-gray-100"
      >
        <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span>Daily Profits</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span>Capital Secure</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span>Manual Withdraw</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span>24/7 Support</span>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}