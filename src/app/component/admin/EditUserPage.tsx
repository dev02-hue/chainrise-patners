// components/admin/EditUserPage.tsx
"use client";
import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { toast } from "sonner";
import { FaUser, FaEnvelope, FaPhone, FaBitcoin, FaEthereum } from "react-icons/fa";
import { adminUpdateUserProfile, getAdminSession, getUserProfile } from "@/lib/adminauth";

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

const EditUserPage = () => {
  const router = useRouter();
  const params = useParams();
  const userId = params.id as string;
  
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchUserProfile();
  }, [userId]);

  const fetchUserProfile = async () => {
    try {
      const session = await getAdminSession();

      if (!session.isAuthenticated || !session.admin) {
        router.push("/signin");
        return;
      }

      // Use the getUserProfile function from lib/adminauth instead of API call
      const { data: userData, error } = await getUserProfile(userId);

      if (error) {
        toast.error("Failed to fetch user profile");
        console.error("Error fetching user profile:", error);
        router.back();
        return;
      }

      if (userData) {
        setProfile(userData);
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);
      toast.error("Failed to load user profile");
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

  const handleChange = (field: keyof UserProfile, value: string) => {
    if (profile) {
      setProfile({ ...profile, [field]: value });
    }
  };

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
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Edit User Profile</h2>
        <button
          onClick={() => router.back()}
          className="px-4 py-2 text-gray-600 hover:text-gray-800"
        >
          ← Back
        </button>
      </div>

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
                Email
              </label>
              <input
                type="email"
                value={profile.email}
                readOnly
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 cursor-not-allowed"
              />
 <button
  onClick={() => router.push(`/deri/users/${userId}/email`)}
  className="mt-2 text-sm text-blue-600 hover:text-blue-800"
>
  Change email address
</button>
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
            className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditUserPage;