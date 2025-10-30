/* eslint-disable @typescript-eslint/no-explicit-any */
// components/admin/ManageFundsPage.tsx
"use client";
import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { toast } from "sonner";
import { 
  FaUser, 
  FaEnvelope, 
  FaPhone, 
  FaDollarSign, 
  FaPlus, 
  FaEdit, 
  FaSave, 
  FaTimes,
  FaSpinner,
  FaHistory,
  FaChartLine,
  FaMoneyBillWave,
  FaCoins,
  FaExclamationTriangle,
  FaCheckCircle,
  FaInfoCircle
} from "react-icons/fa";
import { 
  getUserMetrics, 
  adminFundUser, 
  getAdminSession, 
  updateUserProfile 
} from "@/lib/adminauth";

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

interface FundingFormData {
  amount: string;
  cryptoType: string;
  transactionType: "bonus" | "add_funds_with_fee" | "earnings";
  description: string;
  sendEmailNotification: boolean;
  investmentPlan?: "not_a_deposit" | "plan_1" | "plan_2" | "plan_3" | "plan_4";
}

const ManageFundsPage = () => {
  const router = useRouter();
  const params = useParams();
  const userId = params.id as string;
  
  const [metrics, setMetrics] = useState<UserMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [fundingLoading, setFundingLoading] = useState(false);
  const [updatingField, setUpdatingField] = useState<string | null>(null);
  const [showFundingForm, setShowFundingForm] = useState(false);
  const [editingField, setEditingField] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<string>("");
  const [adminId, setAdminId] = useState<string>("");
  
  const [fundingData, setFundingData] = useState<FundingFormData>({
    amount: "",
    cryptoType: "BTC",
    transactionType: "bonus",
    description: "",
    sendEmailNotification: true,
    investmentPlan: "not_a_deposit"
  });

  // Investment plan configurations
  const investmentPlans = {
    plan_1: { min: 100, max: 2999, percentage: 2.20 },
    plan_2: { min: 3000, max: 9999, percentage: 4.40 },
    plan_3: { min: 10000, max: 29999, percentage: 6.60 },
    plan_4: { min: 30000, max: 59999, percentage: 8.80 }
  };

  useEffect(() => {
    fetchAdminSession();
    fetchUserMetrics();
  }, [userId]);

  const fetchAdminSession = async () => {
    try {
      const session = await getAdminSession();
      if (session.admin?.id) {
        setAdminId(session.admin.id);
      } else {
        toast.error("Admin session expired. Please log in again.");
        router.push('/signin');
      }
    } catch (error) {
      console.error("Error fetching admin session:", error);
      toast.error("Authentication failed");
    }
  };

  const fetchUserMetrics = async () => {
    try {
      setLoading(true);
      const { data: metricsData, error } = await getUserMetrics(userId);
      
      if (error) {
        toast.error(`Failed to load user data: ${error}`);
        router.back();
        return;
      }
      
      if (!metricsData) {
        toast.error("User data not found");
        router.back();
        return;
      }
      
      setMetrics(metricsData);
    } catch (error) {
      console.error("Error fetching user metrics:", error);
      toast.error("Failed to load user metrics. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleAddBonus = () => {
    setShowFundingForm(true);
    // Reset form to bonus defaults
    setFundingData({
      amount: "",
      cryptoType: "BTC",
      transactionType: "bonus",
      description: "",
      sendEmailNotification: true,
      investmentPlan: "not_a_deposit"
    });
  };

  const handleTransactionTypeChange = (newType: "bonus" | "add_funds_with_fee" | "earnings") => {
    const updatedData: FundingFormData = {
      ...fundingData,
      transactionType: newType
    };

    // Set default investment plan based on transaction type
    if (newType === "bonus") {
      updatedData.investmentPlan = "not_a_deposit";
    } else if (newType === "add_funds_with_fee") {
      updatedData.investmentPlan = "plan_1"; // Default plan for add funds
    } else {
      updatedData.investmentPlan = undefined; // No plan for earnings
    }

    setFundingData(updatedData);
  };

  const validateInvestmentPlanAmount = (plan: string, amount: number): { valid: boolean; error?: string } => {
    if (plan === "not_a_deposit") {
      return { valid: true };
    }

    const planConfig = investmentPlans[plan as keyof typeof investmentPlans];
    if (!planConfig) {
      return { valid: false, error: "Invalid investment plan" };
    }

    if (amount < planConfig.min) {
      return { valid: false, error: `Amount must be at least $${planConfig.min} for ${plan.replace('_', ' ').toUpperCase()}` };
    }

    if (amount > planConfig.max) {
      return { valid: false, error: `Amount cannot exceed $${planConfig.max} for ${plan.replace('_', ' ').toUpperCase()}` };
    }

    return { valid: true };
  };

  const handleFundUser = async () => {
    if (!fundingData.amount || parseFloat(fundingData.amount) <= 0) {
      toast.error("Please enter a valid amount greater than 0");
      return;
    }

    if (!fundingData.description.trim()) {
      toast.error("Please provide a description for this transaction");
      return;
    }

    if (!adminId) {
      toast.error("Admin authentication required");
      return;
    }

    const amount = parseFloat(fundingData.amount);

    // Validate investment plan if applicable
    if (fundingData.transactionType === "add_funds_with_fee" && fundingData.investmentPlan) {
      const validation = validateInvestmentPlanAmount(fundingData.investmentPlan, amount);
      if (!validation.valid) {
        toast.error(validation.error);
        return;
      }
    }

    // Validate bonus must use "not_a_deposit"
    if (fundingData.transactionType === "bonus" && fundingData.investmentPlan !== "not_a_deposit") {
      toast.error("Bonus transactions must use 'Not a Deposit' plan");
      return;
    }

    setFundingLoading(true);

    try {
      const result = await adminFundUser({
        userId,
        amount: amount,
        cryptoType: fundingData.cryptoType,
        transactionType: fundingData.transactionType,
        description: fundingData.description,
        sendEmailNotification: fundingData.sendEmailNotification,
        adminId: adminId,
        investmentPlan: fundingData.investmentPlan
      });

      if (result.success) {
        const transactionTypeLabels = {
          bonus: "Bonus",
          add_funds_with_fee: "Add Funds with Fee",
          earnings: "Earnings"
        };

        toast.success(
          `Successfully added $${fundingData.amount} ${transactionTypeLabels[fundingData.transactionType]} to user account`,
          {
            description: fundingData.description
          }
        );
        setShowFundingForm(false);
        setFundingData({
          amount: "",
          cryptoType: "BTC",
          transactionType: "bonus",
          description: "",
          sendEmailNotification: true,
          investmentPlan: "not_a_deposit"
        });
        await fetchUserMetrics(); // Refresh metrics
      } else {
        toast.error(result.error || "Failed to add funds. Please try again.");
      }
    } catch (error) {
      console.error("Error funding user:", error);
      toast.error("An unexpected error occurred while adding funds");
    } finally {
      setFundingLoading(false);
    }
  };

  const startEditing = (field: string, currentValue: number) => {
    setEditingField(field);
    setEditValue(currentValue.toString());
  };

  const cancelEditing = () => {
    setEditingField(null);
    setEditValue("");
  };

  const saveEdit = async () => {
    if (!editingField || !metrics || !adminId) return;

    const numericValue = parseFloat(editValue);
    if (isNaN(numericValue) || numericValue < 0) {
      toast.error("Please enter a valid positive number");
      return;
    }

    setUpdatingField(editingField);

    try {
      // Map the field names to match your database schema
      const fieldMap: { [key: string]: string } = {
        balance: "balance",
        total_earnings: "total_earnings",
        total_bonus: "total_bonus",
        total_penalty: "total_penalty",
        referral_commission: "referral_commission"
      };

      const dbField = fieldMap[editingField];
      if (!dbField) {
        toast.error("This field cannot be edited directly");
        return;
      }

      // Update the user profile
      const { success, error } = await updateUserProfile({
        id: userId,
        [dbField]: numericValue
      } as any);

      if (success) {
        toast.success(
          `${editingField.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')} updated successfully`
        );
        setMetrics({
          ...metrics,
          [editingField]: numericValue
        });
        cancelEditing();
      } else {
        toast.error(error || `Failed to update ${editingField.replace('_', ' ')}`);
      }
    } catch (error) {
      console.error("Error updating field:", error);
      toast.error("Failed to update field. Please try again.");
    } finally {
      setUpdatingField(null);
    }
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  const getFinancialFieldInfo = (transactionType: string): { field: string; description: string } => {
    switch (transactionType) {
      case "bonus":
        return { field: "Balance", description: "Amount will be added to user's available balance" };
      case "add_funds_with_fee":
        return { field: "Total Invested", description: "Amount will be added to user's total invested amount" };
      case "earnings":
        return { field: "Total Earnings", description: "Amount will be added to user's total earnings" };
      default:
        return { field: "Balance", description: "Amount will be added to user's available balance" };
    }
  };

  const getMetricColor = (key: string): string => {
    const colors: { [key: string]: string } = {
      balance: "text-green-600 bg-green-50 border-green-200",
      funded: "text-blue-600 bg-blue-50 border-blue-200",
      active_deposit: "text-purple-600 bg-purple-50 border-purple-200",
      total_earnings: "text-emerald-600 bg-emerald-50 border-emerald-200",
      total_withdrawal: "text-orange-600 bg-orange-50 border-orange-200",
      pending_withdrawal: "text-yellow-600 bg-yellow-50 border-yellow-200",
      total_bonus: "text-indigo-600 bg-indigo-50 border-indigo-200",
      total_penalty: "text-red-600 bg-red-50 border-red-200",
      referral_commission: "text-teal-600 bg-teal-50 border-teal-200",
    };
    return colors[key] || "text-gray-600 bg-gray-50 border-gray-200";
  };

  const getMetricIcon = (key: string) => {
    const icons: { [key: string]: React.ReactNode } = {
      balance: <FaMoneyBillWave className="text-lg" />,
      funded: <FaCoins className="text-lg" />,
      active_deposit: <FaChartLine className="text-lg" />,
      total_earnings: <FaDollarSign className="text-lg" />,
      total_withdrawal: <FaHistory className="text-lg" />,
      pending_withdrawal: <FaExclamationTriangle className="text-lg" />,
      total_bonus: <FaCheckCircle className="text-lg" />,
      total_penalty: <FaExclamationTriangle className="text-lg" />,
      referral_commission: <FaUser className="text-lg" />,
    };
    return icons[key] || <FaDollarSign className="text-lg" />;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading user data...</p>
        </div>
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-xl mb-2">User Not Found</div>
          <p className="text-gray-600 mb-4">The requested user could not be found.</p>
          <button
            onClick={() => router.back()}
            className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const editableFields = [
    { key: "balance", label: "Current Balance", value: metrics.balance, editable: true },
    { key: "funded", label: "Total Deposited", value: metrics.funded, editable: false },
    { key: "active_deposit", label: "Active Investments", value: metrics.active_deposit, editable: false },
    { key: "total_earnings", label: "Total Earnings", value: metrics.total_earnings, editable: true },
    { key: "total_withdrawal", label: "Total Withdrawn", value: metrics.total_withdrawal, editable: false },
    { key: "pending_withdrawal", label: "Pending Withdrawal", value: metrics.pending_withdrawal, editable: false },
    { key: "total_bonus", label: "Total Bonus", value: metrics.total_bonus, editable: true },
    { key: "total_penalty", label: "Total Penalty", value: metrics.total_penalty, editable: true },
    { key: "referral_commission", label: "Referral Commission", value: metrics.referral_commission, editable: true },
  ];

  const financialFieldInfo = getFinancialFieldInfo(fundingData.transactionType);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto space-y-6 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Fund Management</h1>
            <p className="text-gray-600 mt-1">
              Managing funds for <span className="font-semibold">{metrics.username}</span>
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => router.back()}
              className="px-4 py-2 text-gray-700 hover:text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              ← Back to Users
            </button>
            <button
              onClick={handleAddBonus}
              disabled={fundingLoading}
              className="flex items-center gap-2 px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <FaPlus />
              <span>Add Funds</span>
            </button>
          </div>
        </div>

        {/* User Info Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">User Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
              <div className="p-3 bg-blue-100 rounded-full">
                <FaUser className="text-blue-600 text-xl" />
              </div>
              <div>
                <p className="text-sm text-gray-600 font-medium">Username</p>
                <p className="text-lg font-semibold text-gray-900">{metrics.username}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
              <div className="p-3 bg-green-100 rounded-full">
                <FaEnvelope className="text-green-600 text-xl" />
              </div>
              <div>
                <p className="text-sm text-gray-600 font-medium">Email</p>
                <p className="text-lg font-semibold text-gray-900">{metrics.email}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
              <div className="p-3 bg-purple-100 rounded-full">
                <FaPhone className="text-purple-600 text-xl" />
              </div>
              <div>
                <p className="text-sm text-gray-600 font-medium">Account Status</p>
                <p className={`text-lg font-semibold ${metrics.is_active ? 'text-green-600' : 'text-red-600'}`}>
                  {metrics.is_active ? 'Active' : 'Inactive'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Financial Metrics Grid */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Financial Overview</h2>
            <div className="flex items-center gap-2 mt-2 sm:mt-0">
              <span className="text-sm text-gray-500">Last updated: Just now</span>
              <button
                onClick={fetchUserMetrics}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                title="Refresh data"
              >
                <FaSpinner className={`text-sm ${loading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {editableFields.map((metric) => (
              <div 
                key={metric.key} 
                className={`p-4 border-2 rounded-xl transition-all duration-200 hover:shadow-md ${getMetricColor(metric.key)}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3 flex-1">
                    <div className="p-2 rounded-lg bg-white">
                      {getMetricIcon(metric.key)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-600 truncate">
                        {metric.label}
                      </p>
                      {editingField === metric.key ? (
                        <input
                          type="number"
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          className="w-full px-2 py-1 border border-gray-300 rounded text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                          step="0.01"
                          min="0"
                          autoFocus
                        />
                      ) : (
                        <p className="text-lg font-bold truncate">
                          {formatCurrency(metric.value)}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  {metric.editable ? (
                    editingField === metric.key ? (
                      <div className="flex space-x-1 ml-2">
                        <button
                          onClick={saveEdit}
                          disabled={updatingField === metric.key}
                          className="p-1.5 text-green-600 hover:text-green-800 hover:bg-green-50 rounded transition-colors disabled:opacity-50"
                          title="Save changes"
                        >
                          {updatingField === metric.key ? (
                            <FaSpinner className="animate-spin" />
                          ) : (
                            <FaSave size={14} />
                          )}
                        </button>
                        <button
                          onClick={cancelEditing}
                          className="p-1.5 text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition-colors"
                          title="Cancel editing"
                        >
                          <FaTimes size={14} />
                        </button>
                      </div>
                    ) : (
                      <button 
                        onClick={() => startEditing(metric.key, metric.value)}
                        className="p-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded transition-colors ml-2"
                        title="Edit value"
                      >
                        <FaEdit size={14} />
                      </button>
                    )
                  ) : (
                    <span className="text-xs text-gray-400 px-2 py-1 bg-white rounded border ml-2">
                      Auto
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Funding Form Modal */}
    {showFundingForm && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 backdrop-blur-sm overflow-y-auto">
    <div className="bg-white rounded-xl shadow-2xl w-full max-w-md mx-auto my-8 transform transition-all">
      {/* Header */}
      <div className="p-4 sm:p-6 border-b border-gray-200">
        <h3 className="text-lg sm:text-xl font-semibold text-gray-900">Add Funds</h3>
        <p className="text-gray-600 text-sm mt-1">
          Add funds to {metrics.username}&apos;s account
        </p>
      </div>
      
      {/* Form Content */}
      <div className="p-4 sm:p-6 space-y-4 max-h-[calc(100vh-200px)] overflow-y-auto">
        {/* Transaction Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Transaction Type
          </label>
          <select
            value={fundingData.transactionType}
            onChange={(e) => handleTransactionTypeChange(e.target.value as any)}
            className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-colors"
          >
            <option value="bonus">Bonus</option>
            <option value="add_funds_with_fee">Add Funds with Fee</option>
            <option value="earnings">Earnings</option>
          </select>
        </div>

        {/* Financial Field Info */}
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-start gap-2">
            <FaInfoCircle className="text-blue-600 mt-0.5 flex-shrink-0 text-sm sm:text-base" />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-blue-900 break-words">
                Will update: {financialFieldInfo.field}
              </p>
              <p className="text-xs text-blue-700 mt-1 break-words">
                {financialFieldInfo.description}
              </p>
            </div>
          </div>
        </div>

        {/* Investment Plan Selection (for add_funds_with_fee) */}
        {fundingData.transactionType === "add_funds_with_fee" && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Investment Plan
            </label>
            <select
              value={fundingData.investmentPlan || "plan_1"}
              onChange={(e) => setFundingData({ ...fundingData, investmentPlan: e.target.value as any })}
              className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-colors"
            >
              <option value="plan_1">Plan 1 ($100 - $2,999)</option>
              <option value="plan_2">Plan 2 ($3,000 - $9,999)</option>
              <option value="plan_3">Plan 3 ($10,000 - $29,999)</option>
              <option value="plan_4">Plan 4 ($30,000 - $59,999)</option>
            </select>
            {fundingData.investmentPlan && fundingData.investmentPlan !== "not_a_deposit" && (
              <p className="text-xs text-gray-500 mt-2 break-words">
                Min: ${investmentPlans[fundingData.investmentPlan as keyof typeof investmentPlans]?.min.toLocaleString()} | 
                Max: ${investmentPlans[fundingData.investmentPlan as keyof typeof investmentPlans]?.max.toLocaleString()}
              </p>
            )}
          </div>
        )}

        {/* Investment Plan Display (for bonus - fixed to "not_a_deposit") */}
        {fundingData.transactionType === "bonus" && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Investment Plan
            </label>
            <div className="px-3 sm:px-4 py-2.5 sm:py-3 bg-gray-100 border border-gray-300 rounded-lg text-gray-700 text-sm sm:text-base">
              Not a Deposit
            </div>
            <p className="text-xs text-gray-500 mt-2 break-words">
              Bonus transactions are automatically set to &apos;Not a Deposit&apos;
            </p>
          </div>
        )}

        {/* Amount Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Amount (USD) <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            value={fundingData.amount}
            onChange={(e) => setFundingData({ ...fundingData, amount: e.target.value })}
            className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-colors"
            placeholder="0.00"
            step="0.01"
            min="0.01"
            required
          />
        </div>

        {/* Crypto Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Crypto Type
          </label>
          <select
            value={fundingData.cryptoType}
            onChange={(e) => setFundingData({ ...fundingData, cryptoType: e.target.value })}
            className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-colors"
          >
            <option value="BTC">Bitcoin (BTC)</option>
            <option value="ETH">Ethereum (ETH)</option>
            <option value="BNB">Binance Coin (BNB)</option>
            <option value="DOGE">Dogecoin (DOGE)</option>
            <option value="SOL">Solana (SOL)</option>
            <option value="USDT">USDT (TRC20)</option>
          </select>
        </div>

        {/* Description - Now Optional */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description / Reason <span className="text-gray-500 text-xs">(Optional)</span>
          </label>
          <textarea
            value={fundingData.description}
            onChange={(e) => setFundingData({ ...fundingData, description: e.target.value })}
            className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-colors resize-none"
            placeholder="Provide a reason for this transaction (optional)..."
            rows={3}
          />
          <p className="text-xs text-gray-500 mt-1">
            Optional: Add a description for your records
          </p>
        </div>

        {/* Email Notification */}
        <div className="flex items-start p-3 bg-gray-50 rounded-lg">
          <input
            type="checkbox"
            id="emailNotification"
            checked={fundingData.sendEmailNotification}
            onChange={(e) => setFundingData({ ...fundingData, sendEmailNotification: e.target.checked })}
            className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded mt-0.5 flex-shrink-0"
          />
          <label htmlFor="emailNotification" className="ml-3 text-sm text-gray-700 break-words">
            Send email notification to user
          </label>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="flex flex-col sm:flex-row justify-end gap-2 sm:space-x-3 p-4 sm:p-6 border-t border-gray-200 bg-gray-50 rounded-b-xl">
        <button
          onClick={() => setShowFundingForm(false)}
          disabled={fundingLoading}
          className="order-2 sm:order-1 px-4 sm:px-6 py-2.5 text-gray-700 hover:text-gray-900 border border-gray-300 rounded-lg hover:bg-white disabled:opacity-50 transition-colors text-sm sm:text-base"
        >
          Cancel
        </button>
        <button
          onClick={handleFundUser}
          disabled={fundingLoading || !fundingData.amount}
          className="order-1 sm:order-2 flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm sm:text-base flex-1 sm:flex-initial"
        >
          {fundingLoading ? (
            <>
              <FaSpinner className="animate-spin text-sm sm:text-base" />
              <span>Processing...</span>
            </>
          ) : (
            <>
              <FaPlus className="text-sm sm:text-base" />
              <span>Add Funds</span>
            </>
          )}
        </button>
      </div>
    </div>
  </div>
)}
    </div>
  );
};

export default ManageFundsPage;