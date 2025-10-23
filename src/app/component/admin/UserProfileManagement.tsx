"use client";
import React, { useState, useEffect } from "react";
import { 
  FaEdit, 
  FaSave, 
  FaTimes, 
  FaUser, 
  FaEnvelope, 
  FaPhone, 
  FaDollarSign,
  FaUsers,
  FaChartLine,
  FaMoneyBillWave,
  FaPiggyBank
} from "react-icons/fa";
import { motion } from "framer-motion";
import { toast } from "sonner";
 
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  
} from 'recharts';
import { getAllProfiles, getEarningsAnalytics, getPlatformStats, updateUserProfile } from "@/lib/getProfileData";

interface EditableProfile {
  id: string;
  name: string;
  username: string;
  email: string;
  phoneNumber: string;
  balance: number;
  isEditing?: boolean;
}

interface PlatformStats {
  totalBalance: number;
  totalEarnings: number;
  totalInvested: number;
  activeUsers: number;
  totalUsers: number;
}

interface EarningsData {
  weekly: { date: string; earnings: number }[];
  monthly: { month: string; earnings: number }[];
  yearly: { year: string; earnings: number }[];
}

const UserProfileManagement = () => {
  const [profiles, setProfiles] = useState<EditableProfile[]>([]);
  const [platformStats, setPlatformStats] = useState<PlatformStats | null>(null);
  const [earningsData, setEarningsData] = useState<EarningsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'profiles' | 'analytics'>('profiles');

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      
      // Fetch profiles
      const { data: profilesData, error: profilesError } = await getAllProfiles();
      if (profilesError) {
        setError(profilesError);
        return;
      }

      // Fetch platform stats
      const { data: stats, error: statsError } = await getPlatformStats();
      if (statsError) {
        console.error('Stats error:', statsError);
      }

      // Fetch earnings analytics
      const { data: earnings, error: earningsError } = await getEarningsAnalytics();
      if (earningsError) {
        console.error('Earnings error:', earningsError);
      }

      if (profilesData) {
        setProfiles(profilesData.map(profile => ({ 
          ...profile, 
          isEditing: false 
        })));
      }
      
      if (stats) {
        setPlatformStats(stats);
      }
      
      if (earnings) {
        setEarningsData(earnings);
      }

    } catch (err) {
      console.error("Error fetching data:", err);
      setError("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const toggleEdit = (id: string) => {
    setProfiles(profiles.map(profile => 
      profile.id === id ? { ...profile, isEditing: !profile.isEditing } : profile
    ));
  };

  const handleChange = (id: string, field: keyof EditableProfile, value: string | number) => {
    setProfiles(profiles.map(profile => 
      profile.id === id ? { ...profile, [field]: value } : profile
    ));
  };

  const handleUpdate = async (profile: EditableProfile) => {
    try {
      const { success, error } = await updateUserProfile({
        id: profile.id,
        name: profile.name,
        username: profile.username,
        email: profile.email,
        phoneNumber: profile.phoneNumber,
        balance: profile.balance
      });

      if (success) {
        toast.success("Profile updated successfully");
        toggleEdit(profile.id);
        fetchAllData(); // Refresh all data
      } else {
        toast.error(error || "Failed to update profile");
      }
    } catch (err) {
      console.error("Error updating profile:", err);
      toast.error("An unexpected error occurred");
    }
  };

  // Colors for charts
  // const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

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
        <button 
          onClick={fetchAllData}
          className="ml-4 px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">User Management & Analytics</h2>
        <div className="flex space-x-2">
          <button
            onClick={() => setActiveTab('profiles')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              activeTab === 'profiles' 
                ? 'bg-emerald-600 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            User Profiles
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              activeTab === 'analytics' 
                ? 'bg-emerald-600 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Platform Analytics
          </button>
        </div>
      </div>

      {activeTab === 'profiles' ? (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white rounded-lg overflow-hidden">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Username</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Balance</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {profiles.map((profile) => (
                <motion.tr
                  key={profile.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    {profile.isEditing ? (
                      <div className="flex items-center">
                        <FaUser className="text-gray-500 mr-2" />
                        <input
                          type="text"
                          value={profile.name}
                          onChange={(e) => handleChange(profile.id, 'name', e.target.value)}
                          className="w-full px-2 py-1 border rounded"
                        />
                      </div>
                    ) : (
                      <div className="flex items-center">
                        <FaUser className="text-gray-500 mr-2" />
                        {profile.name}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {profile.isEditing ? (
                      <input
                        type="text"
                        value={profile.username}
                        onChange={(e) => handleChange(profile.id, 'username', e.target.value)}
                        className="w-full px-2 py-1 border rounded"
                      />
                    ) : (
                      profile.username
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {profile.isEditing ? (
                      <div className="flex items-center">
                        <FaEnvelope className="text-gray-500 mr-2" />
                        <input
                          type="email"
                          value={profile.email}
                          onChange={(e) => handleChange(profile.id, 'email', e.target.value)}
                          className="w-full px-2 py-1 border rounded"
                        />
                      </div>
                    ) : (
                      <div className="flex items-center">
                        <FaEnvelope className="text-gray-500 mr-2" />
                        {profile.email}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {profile.isEditing ? (
                      <div className="flex items-center">
                        <FaPhone className="text-gray-500 mr-2" />
                        <input
                          type="tel"
                          value={profile.phoneNumber}
                          onChange={(e) => handleChange(profile.id, 'phoneNumber', e.target.value)}
                          className="w-full px-2 py-1 border rounded"
                        />
                      </div>
                    ) : (
                      <div className="flex items-center">
                        <FaPhone className="text-gray-500 mr-2" />
                        {profile.phoneNumber}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {profile.isEditing ? (
                      <div className="flex items-center">
                        <FaDollarSign className="text-gray-500 mr-2" />
                        <input
                          type="number"
                          value={profile.balance}
                          onChange={(e) => handleChange(profile.id, 'balance', parseFloat(e.target.value))}
                          className="w-full px-2 py-1 border rounded"
                          step="0.01"
                        />
                      </div>
                    ) : (
                      <div className="flex items-center">
                        <FaDollarSign className="text-gray-500 mr-2" />
                        ${profile.balance.toFixed(2)}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => profile.isEditing ? handleUpdate(profile) : toggleEdit(profile.id)}
                        className={`p-2 rounded ${
                          profile.isEditing 
                            ? 'bg-green-500 text-white hover:bg-green-600' 
                            : 'bg-blue-500 text-white hover:bg-blue-600'
                        }`}
                      >
                        {profile.isEditing ? <FaSave /> : <FaEdit />}
                      </button>
                      {profile.isEditing && (
                        <button
                          onClick={() => toggleEdit(profile.id)}
                          className="p-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                        >
                          <FaTimes />
                        </button>
                      )}
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Platform Stats Cards */}
          {platformStats && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <div className="flex items-center">
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <FaUsers className="text-blue-600 text-xl" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Users</p>
                    <p className="text-2xl font-bold text-gray-900">{platformStats.totalUsers}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <div className="flex items-center">
                  <div className="p-3 bg-green-100 rounded-lg">
                    <FaMoneyBillWave className="text-green-600 text-xl" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Balance</p>
                    <p className="text-2xl font-bold text-gray-900">${platformStats.totalBalance.toFixed(2)}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <div className="flex items-center">
                  <div className="p-3 bg-purple-100 rounded-lg">
                    <FaChartLine className="text-purple-600 text-xl" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Earnings</p>
                    <p className="text-2xl font-bold text-gray-900">${platformStats.totalEarnings.toFixed(2)}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <div className="flex items-center">
                  <div className="p-3 bg-orange-100 rounded-lg">
                    <FaPiggyBank className="text-orange-600 text-xl" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Invested</p>
                    <p className="text-2xl font-bold text-gray-900">${platformStats.totalInvested.toFixed(2)}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Earnings Charts */}
          {earningsData && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Weekly Earnings Chart */}
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <h3 className="text-lg font-semibold mb-4">Weekly Earnings</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={earningsData.weekly}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`$${value}`, 'Earnings']} />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="earnings" 
                      stroke="#0088FE" 
                      strokeWidth={2}
                      name="Weekly Earnings"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Monthly Earnings Chart */}
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <h3 className="text-lg font-semibold mb-4">Monthly Earnings</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={earningsData.monthly}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`$${value}`, 'Earnings']} />
                    <Legend />
                    <Bar 
                      dataKey="earnings" 
                      fill="#00C49F" 
                      name="Monthly Earnings"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Yearly Earnings Chart */}
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 col-span-1 lg:col-span-2">
                <h3 className="text-lg font-semibold mb-4">Yearly Earnings</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={earningsData.yearly}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="year" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`$${value}`, 'Earnings']} />
                    <Legend />
                    <Bar 
                      dataKey="earnings" 
                      fill="#FF8042" 
                      name="Yearly Earnings"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default UserProfileManagement;