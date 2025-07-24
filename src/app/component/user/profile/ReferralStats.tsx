"use client";
import React, { useState, useEffect } from "react";
import { getReferralStats } from "@/lib/referral";
import { FaUserPlus, FaDollarSign, FaHistory  } from "react-icons/fa";
import { motion } from "framer-motion";
 
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
  referrals: Referral[];
}

const ReferralStats = () => {
  const [stats, setStats] = useState<ReferralStatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const { data, error } = await getReferralStats();
        
        if (error) {
          setError(error);
        } else if (data) {
          setStats(data);
        }
      } catch (err) {
        console.error("Error fetching referral stats:", err);
        setError("Failed to load referral stats");
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 text-red-700 p-4 rounded-md">
        {error}
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="bg-yellow-50 text-yellow-700 p-4 rounded-md">
        No referral data available
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-white p-6 rounded-xl shadow-sm border border-gray-200"
        >
          <div className="flex items-center space-x-4">
            <div className="p-3 rounded-full bg-emerald-50 text-emerald-600">
              <FaUserPlus className="text-xl" />
            </div>
            <div>
              <h3 className="text-gray-500 text-sm font-medium">Total Referrals</h3>
              <p className="text-2xl font-bold text-gray-900">
                {stats.totalReferrals}
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="bg-white p-6 rounded-xl shadow-sm border border-gray-200"
        >
          <div className="flex items-center space-x-4">
            <div className="p-3 rounded-full bg-blue-50 text-blue-600">
              <FaDollarSign className="text-xl" />
            </div>
            <div>
              <h3 className="text-gray-500 text-sm font-medium">Total Earnings</h3>
              <p className="text-2xl font-bold text-gray-900">
                ${stats.totalEarnings.toFixed(2)}
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Referral History */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.2 }}
        className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
      >
        <div className="p-6 border-b border-gray-200">
          <h3 className="flex items-center space-x-2 text-lg font-semibold text-gray-900">
            <FaHistory className="text-gray-500" />
            <span>Referral History</span>
          </h3>
        </div>

        <div className="divide-y divide-gray-200">
          {stats.referrals.length > 0 ? (
            stats.referrals.map((referral) => (
              <div key={referral.id} className="p-4 hover:bg-gray-50 transition-colors">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-medium text-gray-900">{referral.name}</h4>
                    <p className="text-sm text-gray-500">{referral.email}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      Joined: {new Date(referral.joinedAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    {referral.depositAmount && (
                      <p className="text-sm">
                        Deposit: <span className="font-medium">${referral.depositAmount.toFixed(2)}</span>
                      </p>
                    )}
                    {referral.earningsFromReferral && (
                      <p className="text-sm text-emerald-600">
                        Earnings: <span className="font-medium">${referral.earningsFromReferral.toFixed(2)}</span>
                      </p>
                    )}
                    <span className={`inline-block mt-1 px-2 py-1 text-xs rounded-full ${
                      referral.status === 'completed' 
                        ? 'bg-emerald-100 text-emerald-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {referral.status}
                    </span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="p-8 text-center text-gray-500">
              No referral history yet
            </div>
          )}
        </div>
      </motion.div>

      
    </div>
  );
};

export default ReferralStats;