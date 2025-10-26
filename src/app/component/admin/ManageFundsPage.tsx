/* eslint-disable @typescript-eslint/no-explicit-any */
// components/admin/ManageFundsPage.tsx
"use client";
import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { toast } from "sonner";
import { FaUser, FaEnvelope, FaPhone, FaDollarSign, FaPlus } from "react-icons/fa";
import { getUserMetrics, adminFundUser, getAdminSession } from "@/lib/adminauth";

interface UserMetrics {
  username: string;
  email: string;
  created_at: string;
  is_active: boolean;
  balance: number;
  total_earnings: number;
  funded: number;
  active_deposit: number;
  total_withdrawal: number;
  pending_withdrawal: number;
  total_bonus: number;
  total_penalty: number;
  referral_commission: number;
}

const ManageFundsPage = () => {
  const router = useRouter();
  const params = useParams();
  const userId = params.id as string;
  
  const [metrics, setMetrics] = useState<UserMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [showFundingForm, setShowFundingForm] = useState(false);
  const [fundingData, setFundingData] = useState({
    amount: "",
    cryptoType: "BTC",
    transactionType: "bonus" as "bonus" | "deposit" | "refund" | "correction",
    description: "",
    sendEmailNotification: true
  });

  useEffect(() => {
    fetchUserMetrics();
  }, [userId]);

  const fetchUserMetrics = async () => {
    try {
      const { data: metricsData, error } = await getUserMetrics(userId);
      if (error) {
        toast.error(error);
        router.back();
        return;
      }
      setMetrics(metricsData || null);
    } catch (error) {
      console.error("Error fetching user metrics:", error);
      toast.error("Failed to load user metrics");
    } finally {
      setLoading(false);
    }
  };

  const handleAddBonus = () => {
    setShowFundingForm(true);
  };

  const handleFundUser = async () => {
    if (!fundingData.amount || parseFloat(fundingData.amount) <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    try {
      const session = await getAdminSession();
      if (!session.admin) {
        toast.error("Admin session expired");
        return;
      }

      const { success, error } = await adminFundUser({
        userId,
        amount: parseFloat(fundingData.amount),
        cryptoType: fundingData.cryptoType,
        transactionType: fundingData.transactionType,
        description: fundingData.description,
        sendEmailNotification: fundingData.sendEmailNotification,
        adminId: session.admin.id
      });

      if (success) {
        toast.success("Funds added successfully");
        setShowFundingForm(false);
        setFundingData({
          amount: "",
          cryptoType: "BTC",
          transactionType: "bonus",
          description: "",
          sendEmailNotification: true
        });
        fetchUserMetrics(); // Refresh metrics
      } else {
        toast.error(error || "Failed to add funds");
      }
    } catch (error) {
      console.error("Error funding user:", error);
      toast.error("Failed to add funds");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  if (!metrics) {
    return <div>User not found</div>;
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Manage User Funds</h2>
        <button
          onClick={() => router.back()}
          className="px-4 py-2 text-gray-600 hover:text-gray-800"
        >
          ← Back
        </button>
      </div>

      {/* User Info Table */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">User Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
            <FaUser className="text-gray-400" />
            <div>
              <p className="text-sm text-gray-600">Username</p>
              <p className="font-medium">{metrics.username}</p>
            </div>
          </div>
          <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
            <FaEnvelope className="text-gray-400" />
            <div>
              <p className="text-sm text-gray-600">Email</p>
              <p className="font-medium">{metrics.email}</p>
            </div>
          </div>
          <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
            <FaPhone className="text-gray-400" />
            <div>
              <p className="text-sm text-gray-600">Status</p>
              <p className={`font-medium ${metrics.is_active ? 'text-green-600' : 'text-red-600'}`}>
                {metrics.is_active ? 'Active' : 'Inactive'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Financial Metrics Table */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Financial Metrics</h3>
          <button
            onClick={handleAddBonus}
            className="flex items-center space-x-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
          >
            <FaPlus />
            <span>Add Bonus</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { label: "Balance", value: metrics.balance, icon: FaDollarSign, color: "text-green-600" },
            { label: "Total Deposit", value: metrics.funded, icon: FaDollarSign, color: "text-blue-600" },
            { label: "Active Deposit", value: metrics.active_deposit, icon: FaDollarSign, color: "text-purple-600" },
            { label: "Total Earnings", value: metrics.total_earnings, icon: FaDollarSign, color: "text-green-600" },
            { label: "Total Withdrawal", value: metrics.total_withdrawal, icon: FaDollarSign, color: "text-orange-600" },
            { label: "Pending Withdrawal", value: metrics.pending_withdrawal, icon: FaDollarSign, color: "text-yellow-600" },
            { label: "Total Bonus", value: metrics.total_bonus, icon: FaDollarSign, color: "text-indigo-600" },
            { label: "Total Penalty", value: metrics.total_penalty, icon: FaDollarSign, color: "text-red-600" },
            { label: "Referral Commission", value: metrics.referral_commission, icon: FaDollarSign, color: "text-teal-600" },
          ].map((metric, index) => (
            <div key={index} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center space-x-3">
                <metric.icon className={`${metric.color}`} />
                <div>
                  <p className="text-sm text-gray-600">{metric.label}</p>
                  <p className="font-semibold">${metric.value.toFixed(2)}</p>
                </div>
              </div>
              <button className="text-blue-600 hover:text-blue-800 text-sm">
                Edit
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Funding Form Modal */}
      {showFundingForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Add Funds to User</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Amount ($)
                </label>
                <input
                  type="number"
                  value={fundingData.amount}
                  onChange={(e) => setFundingData({ ...fundingData, amount: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="Enter amount"
                  step="0.01"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Crypto Type
                </label>
                <select
                  value={fundingData.cryptoType}
                  onChange={(e) => setFundingData({ ...fundingData, cryptoType: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="BTC">Bitcoin (BTC)</option>
                  <option value="ETH">Ethereum (ETH)</option>
                  <option value="BNB">Binance Coin (BNB)</option>
                  <option value="DOGE">Dogecoin (DOGE)</option>
                  <option value="SOL">Solana (SOL)</option>
                  <option value="USDT">USDT (TRC20)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Transaction Type
                </label>
                <select
                  value={fundingData.transactionType}
                  onChange={(e) => setFundingData({ ...fundingData, transactionType: e.target.value as any })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="bonus">Bonus</option>
                  <option value="deposit">Deposit</option>
                  <option value="refund">Refund</option>
                  <option value="correction">Correction</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={fundingData.description}
                  onChange={(e) => setFundingData({ ...fundingData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="Reason for funding..."
                  rows={3}
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={fundingData.sendEmailNotification}
                  onChange={(e) => setFundingData({ ...fundingData, sendEmailNotification: e.target.checked })}
                  className="mr-2"
                />
                <label className="text-sm text-gray-700">Send email notification to user</label>
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowFundingForm(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={handleFundUser}
                className="px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700"
              >
                Add Funds
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageFundsPage;