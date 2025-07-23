/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { getInvestmentPlans } from "@/lib/investmentplan";
import { useState, useEffect } from "react";
import { FaCoins, FaChartLine, FaGem, FaCrown } from "react-icons/fa";
import { FiChevronDown, FiChevronUp, FiCheck, FiZap, FiAlertCircle } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import InvestNowButton from "./InvestNowButton";

export default function InvestmentPlans() {
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadPlans() {
      try {
        const { data, error } = await getInvestmentPlans();
        if (error) throw new Error(error);
        setPlans(data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load plans");
      } finally {
        setLoading(false);
      }
    }
    loadPlans();
  }, []);

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
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 py-8">
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
            {plan.percentage}%
          </div>
          <div className="text-sm text-gray-500">Daily Profit</div>
        </div>
        
        <div className="space-y-3 mb-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-500">
              <FiCheck size={14} />
            </div>
            <span><strong>Min:</strong> ${plan.minAmount.toLocaleString()}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-500">
              <FiCheck size={14} />
            </div>
            <span><strong>Max:</strong> ${plan.maxAmount.toLocaleString()}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-500">
              <FiCheck size={14} />
            </div>
            <span><strong>Duration:</strong> {plan.durationDays} days</span>
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
                    <span>Payouts every {plan.interval.toLowerCase()}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="text-green-500 mt-1">
                      <FiCheck />
                    </div>
                    <span>Capital returned at maturity</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="text-green-500 mt-1">
                      <FiCheck />
                    </div>
                    <span>24/7 priority support</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="text-green-500 mt-1">
                      <FiCheck />
                    </div>
                    <span>Referral bonus: {plan.referralBonus}%</span>
                  </li>
                </ul>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        
        <div className="mt-auto pt-6">
          <InvestNowButton planId={plan.id} minAmount={plan.minAmount} />
        </div>
      </div>
    </motion.div>
  );
}