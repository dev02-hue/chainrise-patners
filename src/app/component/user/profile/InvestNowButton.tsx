"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createInvestment } from "@/lib/investment";
import { motion } from "framer-motion";
import { FiDollarSign, FiLoader, FiArrowRight, FiCheckCircle, FiAlertCircle } from "react-icons/fi";
import { FaHandHoldingUsd } from "react-icons/fa";

export default function InvestNowButton({ planId, minAmount }: { planId: number; minAmount: number }) {
  const [amount, setAmount] = useState(minAmount);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleInvest = async () => {
    setLoading(true);
    setError("");
    try {
      const planIdString = typeof planId === 'number' ? planId.toString() : planId;
      const { success, error } = await createInvestment(planIdString, amount);
      if (error) throw new Error(error);
      if (success) {
        setSuccess(true);
        setTimeout(() => {
          router.push("/user/investment-all");
        }, 1500);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Investment failed");
    } finally {
      setLoading(false);
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

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="mt-6 bg-white rounded-xl shadow-md p-6 border border-gray-100"
    >
      <div className="mb-6">
        <h3 className="text-xl font-semibold text-gray-800 flex items-center gap-2 mb-4">
          <FaHandHoldingUsd className="text-blue-500" />
          Investment Details
        </h3>
        
        <div className="mb-4">
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
              onChange={(e) => setAmount(Number(e.target.value))}
              className="w-full pl-10 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-100 transition-colors"
              placeholder={`Minimum $${minAmount}`}
            />
          </motion.div>
          <p className="text-xs text-gray-500 mt-1">Minimum investment: ${minAmount}</p>
        </div>
        
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
        
        {success ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-green-50 text-green-700 p-4 rounded-lg flex items-center gap-2 mb-4"
          >
            <FiCheckCircle className="text-green-500 text-xl" />
            <span>Investment successful! Redirecting...</span>
          </motion.div>
        ) : (
          <motion.button
            onClick={handleInvest}
            disabled={loading || amount < minAmount}
            variants={buttonVariants}
            initial="initial"
            whileHover="hover"
            whileTap="tap"
            className={`w-full py-3 px-6 rounded-lg font-semibold flex items-center justify-center gap-2 ${
              loading 
                ? "bg-blue-400 cursor-not-allowed" 
                : amount < minAmount 
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed" 
                  : "bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white shadow-md"
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
                Processing...
              </>
            ) : (
              <>
                Invest Now <FiArrowRight />
              </>
            )}
          </motion.button>
        )}
      </div>
    </motion.div>
  );
}