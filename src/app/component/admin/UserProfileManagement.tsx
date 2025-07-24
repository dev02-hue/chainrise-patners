"use client";
import React, { useState, useEffect } from "react";
import { FaEdit, FaSave, FaTimes, FaUser, FaEnvelope, FaPhone, FaDollarSign } from "react-icons/fa";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { getAllProfiles, updateUserProfile } from "@/lib/getProfileData";
 
interface EditableProfile {
  id: string;
  name: string;
  username: string;
  email: string;
  phoneNumber: string;
  balance: number;
  isEditing?: boolean;
}

const UserProfileManagement = () => {
  const [profiles, setProfiles] = useState<EditableProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchProfiles();
  }, []);

  const fetchProfiles = async () => {
    try {
      setLoading(true);
      const { data, error } = await getAllProfiles();
      
      if (error) {
        setError(error);
      } else if (data) {
        setProfiles(data.map(profile => ({ ...profile, isEditing: false })));
      }
    } catch (err) {
        console.error("Error fetching user profiles:", err);
      setError("Failed to load user profiles");
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
        fetchProfiles(); // Refresh data
      } else {
        toast.error(error || "Failed to update profile");
      }
    } catch (err) {
      console.error("Error updating profile:", err);
      toast.error("An unexpected error occurred");
    }
  };

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

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">User Profiles Management</h2>
      
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
                      className={`p-2 rounded ${profile.isEditing ? 'bg-green-500 text-white' : 'bg-blue-500 text-white'}`}
                    >
                      {profile.isEditing ? <FaSave /> : <FaEdit />}
                    </button>
                    {profile.isEditing && (
                      <button
                        onClick={() => toggleEdit(profile.id)}
                        className="p-2 bg-gray-500 text-white rounded"
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
    </div>
  );
};

export default UserProfileManagement;