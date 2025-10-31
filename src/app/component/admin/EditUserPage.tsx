/* eslint-disable @typescript-eslint/no-explicit-any */
// components/admin/EditUserPage.tsx
"use client";
import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { toast } from "sonner";
import { FaUser, FaEnvelope, FaPhone, FaBitcoin, FaEthereum, FaCog, FaMoneyBillWave } from "react-icons/fa";
import { 
  adminUpdateUserProfile, 
  getAdminSession, 
  getUserProfile, 
  setUserWithdrawalLimits, 
  getUserWithdrawalLimits,
  adminUpdateUserEmail 
} from "@/lib/adminauth";

interface UserProfile {
  id: string;
  name: string;
  username: string;
  email: string;
  phone_number: string;
  btc_address: string;
  bnb_address: string;
  dodge_address: string;
  eth_address: string;
  solana_address: string;
  usdttrc20_address: string;
}

interface WithdrawalLimits {
  min_withdrawal: number;
  max_withdrawal: number;
  daily_limit: number;
  weekly_limit: number;
  monthly_limit: number;
  is_active: boolean;
}

const EditUserPage = () => {
  const router = useRouter();
  const params = useParams();
  const userId = params.id as string;
  
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [withdrawalLimits, setWithdrawalLimits] = useState<WithdrawalLimits>({
    min_withdrawal: 10,
    max_withdrawal: 1000000,
    daily_limit: 500000,
    weekly_limit: 500000,
    monthly_limit: 500000,
    is_active: true
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savingEmail, setSavingEmail] = useState(false);
  const [savingLimits, setSavingLimits] = useState(false);
  const [showLimitsModal, setShowLimitsModal] = useState(false);
  const [adminSession, setAdminSession] = useState<any>(null);
  const [originalEmail, setOriginalEmail] = useState<string>("");

  useEffect(() => {
    fetchUserData();
  }, [userId]);

  const fetchUserData = async () => {
    try {
      const session = await getAdminSession();

      if (!session.isAuthenticated || !session.admin) {
        router.push("/signin");
        return;
      }
      setAdminSession(session);

      // Fetch user profile
      const { data: userData, error } = await getUserProfile(userId);
      if (error) {
        toast.error("Failed to fetch user profile");
        console.error("Error fetching user profile:", error);
        router.back();
        return;
      }

      if (userData) {
        setProfile(userData);
        setOriginalEmail(userData.email); // Store original email for comparison
      }

      // Fetch withdrawal limits
      const { data: limitsData } = await getUserWithdrawalLimits(userId);
      if (limitsData) {
        setWithdrawalLimits(limitsData);
      }

    } catch (error) {
      console.error("Error fetching user data:", error);
      toast.error("Failed to load user data");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!profile) return;

    try {
      setSaving(true);
      const session = await getAdminSession();
      if (!session.admin) {
        toast.error("Admin session expired");
        return;
      }

      const { success, error } = await adminUpdateUserProfile({
        userId: profile.id,
        adminId: session.admin.id,
        updates: {
          name: profile.name,
          username: profile.username,
          phone_number: profile.phone_number,
          btc_address: profile.btc_address,
          bnb_address: profile.bnb_address,
          dodge_address: profile.dodge_address,
          eth_address: profile.eth_address,
          solana_address: profile.solana_address,
          usdttrc20_address: profile.usdttrc20_address,
        }
      });

      if (success) {
        toast.success("Profile updated successfully");
        router.back();
      } else {
        toast.error(error || "Failed to update profile");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  // New function to handle email updates
  const handleEmailUpdate = async () => {
    if (!profile || !profile.email) {
      toast.error("Email is required");
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(profile.email)) {
      toast.error("Please enter a valid email address");
      return;
    }

    // Check if email actually changed
    if (profile.email === originalEmail) {
      toast.info("Email address is the same as current");
      return;
    }

    try {
      setSavingEmail(true);
      const session = await getAdminSession();
      if (!session.admin) {
        toast.error("Admin session expired");
        return;
      }

      const { success, error } = await adminUpdateUserEmail({
        userId: profile.id,
        adminId: session.admin.id,
        newEmail: profile.email
      });

      if (success) {
        toast.success("Email updated successfully");
        setOriginalEmail(profile.email); // Update original email
        // Optionally refetch user data to ensure consistency
        await fetchUserData();
      } else {
        toast.error(error || "Failed to update email");
        // Revert the email in UI to original
        setProfile(prev => prev ? { ...prev, email: originalEmail } : null);
      }
    } catch (error) {
      console.error("Error updating email:", error);
      toast.error("Failed to update email");
      // Revert the email in UI to original
      setProfile(prev => prev ? { ...prev, email: originalEmail } : null);
    } finally {
      setSavingEmail(false);
    }
  };

  const handleUpdateLimits = async () => {
    if (!adminSession?.admin) {
      toast.error("Admin session expired");
      return;
    }

    try {
      setSavingLimits(true);
      const { success, error } = await setUserWithdrawalLimits({
        userId,
        adminId: adminSession.admin.id,
        minWithdrawal: withdrawalLimits.min_withdrawal,
        maxWithdrawal: withdrawalLimits.max_withdrawal,
        dailyLimit: withdrawalLimits.daily_limit,
        weeklyLimit: withdrawalLimits.weekly_limit,
        monthlyLimit: withdrawalLimits.monthly_limit
      });

      if (success) {
        toast.success('Withdrawal limits updated successfully');
        setShowLimitsModal(false);
      } else {
        toast.error(error || 'Failed to update limits');
      }
    } catch (error) {
      console.error('Error updating limits:', error);
      toast.error('Failed to update limits');
    } finally {
      setSavingLimits(false);
    }
  };

  const handleChange = (field: keyof UserProfile, value: string) => {
    if (profile) {
      setProfile({ ...profile, [field]: value });
    }
  };

  const handleLimitChange = (field: keyof WithdrawalLimits, value: number) => {
    setWithdrawalLimits(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Helper function to safely get limit value for input fields
  const getLimitValue = (field: keyof WithdrawalLimits): number => {
    const value = withdrawalLimits[field];
    // Only return numeric values, exclude boolean (is_active)
    return typeof value === 'number' ? value : 0;
  };

  // Check if email has been modified
  const isEmailModified = profile && profile.email !== originalEmail;

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  if (!profile) {
    return <div>User not found</div>;
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header with Withdrawal Limits Button */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Edit User Profile</h2>
        <div className="flex space-x-3">
          <button
            onClick={() => setShowLimitsModal(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <FaCog className="text-sm" />
            <span>Withdrawal Limits</span>
          </button>
          <button
            onClick={() => router.back()}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            ← Back
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Profile Form */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow p-6 space-y-6">
            {/* Basic Information */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Basic Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <FaUser className="inline mr-2" />
                    Name
                  </label>
                  <input
                    type="text"
                    value={profile.name}
                    onChange={(e) => handleChange("name", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Username
                  </label>
                  <input
                    type="text"
                    value={profile.username}
                    onChange={(e) => handleChange("username", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <FaEnvelope className="inline mr-2" />
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={profile.email}
                    onChange={(e) => handleChange("email", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="user@example.com"
                  />
                  {isEmailModified && (
                    <div className="mt-2 flex items-center space-x-2">
                      <span className="text-sm text-amber-600">
                        Email modified - save to update authentication
                      </span>
                      <button
                        onClick={handleEmailUpdate}
                        disabled={savingEmail}
                        className="px-3 py-1 bg-amber-600 text-white text-sm rounded-md hover:bg-amber-700 disabled:opacity-50 transition-colors"
                      >
                        {savingEmail ? "Updating..." : "Update Email"}
                      </button>
                    </div>
                  )}
                  <p className="mt-1 text-sm text-gray-500">
                    Changing email will update both authentication and profile records
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <FaPhone className="inline mr-2" />
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={profile.phone_number}
                    onChange={(e) => handleChange("phone_number", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>
            </div>

            {/* Wallet Addresses */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Wallet Addresses</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <FaBitcoin className="inline mr-2 text-orange-500" />
                    Bitcoin Address
                  </label>
                  <input
                    type="text"
                    value={profile.btc_address}
                    onChange={(e) => handleChange("btc_address", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="BTC wallet address"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <FaEthereum className="inline mr-2 text-purple-500" />
                    Ethereum Address
                  </label>
                  <input
                    type="text"
                    value={profile.eth_address}
                    onChange={(e) => handleChange("eth_address", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="ETH wallet address"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    BNB Address
                  </label>
                  <input
                    type="text"
                    value={profile.bnb_address}
                    onChange={(e) => handleChange("bnb_address", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="BNB wallet address"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Dogecoin Address
                  </label>
                  <input
                    type="text"
                    value={profile.dodge_address}
                    onChange={(e) => handleChange("dodge_address", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="DOGE wallet address"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Solana Address
                  </label>
                  <input
                    type="text"
                    value={profile.solana_address}
                    onChange={(e) => handleChange("solana_address", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="SOL wallet address"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    USDT (TRC20) Address
                  </label>
                  <input
                    type="text"
                    value={profile.usdttrc20_address}
                    onChange={(e) => handleChange("usdttrc20_address", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="USDT TRC20 wallet address"
                  />
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-4 pt-4 border-t">
              <button
                onClick={() => router.back()}
                className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-6 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 disabled:opacity-50 transition-colors"
              >
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>

        {/* Withdrawal Limits Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Withdrawal Limits</h3>
              <FaMoneyBillWave className="text-green-500" />
            </div>
            
            <div className="space-y-4">
              {[
                { label: "Min Withdrawal", value: withdrawalLimits.min_withdrawal, color: "text-blue-600" },
                { label: "Max Withdrawal", value: withdrawalLimits.max_withdrawal, color: "text-blue-600" },
                { label: "Daily Limit", value: withdrawalLimits.daily_limit, color: "text-green-600" },
                { label: "Weekly Limit", value: withdrawalLimits.weekly_limit, color: "text-orange-600" },
                { label: "Monthly Limit", value: withdrawalLimits.monthly_limit, color: "text-red-600" },
              ].map((limit, index) => (
                <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm font-medium text-gray-600">{limit.label}</span>
                  <span className={`font-semibold ${limit.color}`}>${limit.value.toFixed(2)}</span>
                </div>
              ))}
            </div>

            <button
              onClick={() => setShowLimitsModal(true)}
              className="w-full mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Configure Limits
            </button>
          </div>
        </div>
      </div>

      {/* Withdrawal Limits Modal */}
      {showLimitsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Configure Withdrawal Limits</h3>
            
            <div className="space-y-4">
              {[
                { key: 'min_withdrawal', label: 'Minimum Withdrawal', placeholder: '10.00' },
                { key: 'max_withdrawal', label: 'Maximum Withdrawal', placeholder: '1000.00' },
                { key: 'daily_limit', label: 'Daily Limit', placeholder: '5000.00' },
                { key: 'weekly_limit', label: 'Weekly Limit', placeholder: '20000.00' },
                { key: 'monthly_limit', label: 'Monthly Limit', placeholder: '50000.00' },
              ].map((field) => (
                <div key={field.key}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {field.label} ($)
                  </label>
                  <input
                    type="number"
                    value={getLimitValue(field.key as keyof WithdrawalLimits)}
                    onChange={(e) => handleLimitChange(
                      field.key as keyof WithdrawalLimits, 
                      parseFloat(e.target.value) || 0
                    )}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder={field.placeholder}
                    step="0.01"
                    min="0"
                  />
                </div>
              ))}
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowLimitsModal(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                disabled={savingLimits}
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateLimits}
                disabled={savingLimits}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                {savingLimits ? "Saving..." : "Save Limits"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EditUserPage;