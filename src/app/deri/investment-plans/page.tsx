/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { useState, useEffect } from "react";
import { FaEdit, FaSave, FaTimes, FaPercent, FaDollarSign, FaCalendarAlt, FaList, FaCheck, FaTimes as FaTimesIcon } from "react-icons/fa";
import { motion } from "framer-motion";
import { InvestmentPlan } from "@/types/businesses";
import { getInvestmentPlans, updateInvestmentPlan } from "@/lib/investmentplan";
import { toast } from "sonner";

interface EditablePlan extends InvestmentPlan {
  isEditing?: boolean;
  originalPlan?: InvestmentPlan; // Store original values for cancel
}

const InvestmentPlansAdmin = () => {
  const [plans, setPlans] = useState<EditablePlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      setLoading(true);
      setError(null);
      const { data, error } = await getInvestmentPlans();
      
      if (error) {
        setError(error);
        toast.error(error);
      } else if (data) {
        setPlans(data.map(plan => ({ 
          ...plan, 
          isEditing: false,
          originalPlan: plan // Store original values
        })));
      }
    } catch (err) {
      console.error("Error fetching investment plans:", err);
      setError("Failed to load investment plans");
      toast.error("Failed to load investment plans");
    } finally {
      setLoading(false);
    }
  };

  const toggleEdit = (id: string) => {
    setPlans(plans.map(plan => {
      if (plan.id === id) {
        if (!plan.isEditing) {
          // Entering edit mode - store current values as original
          return { ...plan, isEditing: true, originalPlan: { ...plan } };
        } else {
          // Canceling edit mode - restore original values
          return plan.originalPlan 
            ? { ...plan.originalPlan, isEditing: false, originalPlan: plan.originalPlan }
            : { ...plan, isEditing: false };
        }
      }
      return plan;
    }));
  };

  const handleChange = (
    id: string, 
    field: keyof InvestmentPlan, 
    value: string | number | boolean | string[]
  ) => {
    setPlans(plans.map(plan => {
      if (plan.id === id) {
        // Convert string inputs to appropriate types
        let processedValue: any = value;
        
        if (field === 'daily_profit_percentage' || field === 'total_return_percentage') {
          processedValue = typeof value === 'string' ? parseFloat(value) : value;
        }
        else if (field === 'min_amount' || field === 'max_amount') {
          processedValue = typeof value === 'string' ? parseFloat(value) : value;
          if (field === 'max_amount' && value === '') {
            processedValue = null; // Handle null max_amount
          }
        }
        else if (field === 'duration_days') {
          processedValue = typeof value === 'string' ? parseInt(value) : value;
        }
        else if (field === 'is_active') {
          processedValue = Boolean(value);
        }
        else if (field === 'features' && typeof value === 'string') {
          // Convert comma-separated string back to array
          processedValue = value.split(',').map(f => f.trim()).filter(f => f);
        }

        return { ...plan, [field]: processedValue };
      }
      return plan;
    }));
  };

  const handleUpdate = async (plan: EditablePlan) => {
    try {
      // Prepare update data
      const updateData = {
        id: plan.id,
        title: plan.title,
        description: plan.description,
        min_amount: plan.min_amount,
        max_amount: plan.max_amount,
        daily_profit_percentage: plan.daily_profit_percentage,
        duration_days: plan.duration_days,
        total_return_percentage: plan.total_return_percentage,
        features: plan.features,
        is_active: plan.is_active
      };

      const { success, error } = await updateInvestmentPlan(updateData);

      if (success) {
        toast.success("Plan updated successfully");
        // Refresh data to get updated timestamps
        await fetchPlans();
      } else {
        toast.error(error || "Failed to update plan");
        // Restore original values on error
        toggleEdit(plan.id);
      }
    } catch (err) {
      console.error("Error updating investment plan:", err);
      toast.error("An unexpected error occurred");
      // Restore original values on error
      toggleEdit(plan.id);
    }
  };

  const handleFeatureChange = (id: string, index: number, value: string) => {
    setPlans(plans.map(plan => {
      if (plan.id === id) {
        const newFeatures = [...plan.features];
        newFeatures[index] = value;
        return { ...plan, features: newFeatures };
      }
      return plan;
    }));
  };

  const addFeature = (id: string) => {
    setPlans(plans.map(plan => {
      if (plan.id === id) {
        return { ...plan, features: [...plan.features, ''] };
      }
      return plan;
    }));
  };

  const removeFeature = (id: string, index: number) => {
    setPlans(plans.map(plan => {
      if (plan.id === id) {
        const newFeatures = plan.features.filter((_, i) => i !== index);
        return { ...plan, features: newFeatures };
      }
      return plan;
    }));
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
        <button 
          onClick={fetchPlans}
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
        <h2 className="text-2xl font-bold text-gray-800">Investment Plans Management</h2>
        <button
          onClick={fetchPlans}
          className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
        >
          Refresh Plans
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <motion.div
            key={plan.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className={`bg-white rounded-xl shadow-sm border overflow-hidden ${
              plan.is_active ? 'border-gray-200' : 'border-red-200 bg-red-50'
            }`}
          >
            <div className="p-6 border-b border-gray-200 bg-gray-50">
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-2">
                  {plan.isEditing ? (
                    <input
                      type="text"
                      value={plan.title}
                      onChange={(e) => handleChange(plan.id, 'title', e.target.value)}
                      className="text-lg font-semibold w-full px-2 py-1 border rounded"
                    />
                  ) : (
                    <h3 className="text-lg font-semibold text-gray-800">{plan.title}</h3>
                  )}
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    plan.is_active 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {plan.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <div className="flex space-x-2">
                  {plan.isEditing ? (
                    <>
                      <button
                        onClick={() => handleUpdate(plan)}
                        className="p-2 text-green-600 hover:text-green-800"
                        title="Save"
                      >
                        <FaSave />
                      </button>
                      <button
                        onClick={() => toggleEdit(plan.id)}
                        className="p-2 text-red-600 hover:text-red-800"
                        title="Cancel"
                      >
                        <FaTimes />
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => toggleEdit(plan.id)}
                      className="p-2 text-emerald-600 hover:text-emerald-800"
                      title="Edit"
                    >
                      <FaEdit />
                    </button>
                  )}
                </div>
              </div>
              
              {plan.isEditing && (
                <div className="mt-3">
                  <textarea
                    value={plan.description}
                    onChange={(e) => handleChange(plan.id, 'description', e.target.value)}
                    className="w-full px-2 py-1 border rounded text-sm"
                    rows={2}
                    placeholder="Plan description"
                  />
                </div>
              )}
            </div>

            <div className="p-6 space-y-4">
              {/* Daily Profit Percentage */}
              <div className="flex items-center space-x-3">
                <FaPercent className="text-gray-500" />
                {plan.isEditing ? (
                  <div className="flex-1">
                    <label className="text-sm text-gray-600">Daily Profit %</label>
                    <input
                      type="number"
                      value={plan.daily_profit_percentage}
                      onChange={(e) => handleChange(plan.id, 'daily_profit_percentage', e.target.value)}
                      className="w-full px-2 py-1 border rounded"
                      step="0.01"
                      min="0"
                    />
                  </div>
                ) : (
                  <span>Daily Profit: {plan.daily_profit_percentage}%</span>
                )}
              </div>

              {/* Total Return Percentage */}
              <div className="flex items-center space-x-3">
                <FaPercent className="text-gray-500" />
                {plan.isEditing ? (
                  <div className="flex-1">
                    <label className="text-sm text-gray-600">Total Return %</label>
                    <input
                      type="number"
                      value={plan.total_return_percentage}
                      onChange={(e) => handleChange(plan.id, 'total_return_percentage', e.target.value)}
                      className="w-full px-2 py-1 border rounded"
                      step="0.01"
                      min="0"
                    />
                  </div>
                ) : (
                  <span>Total Return: {plan.total_return_percentage}%</span>
                )}
              </div>

              {/* Investment Range */}
              <div className="flex items-center space-x-3">
                <FaDollarSign className="text-gray-500" />
                {plan.isEditing ? (
                  <div className="flex-1 space-y-2">
                    <label className="text-sm text-gray-600">Investment Range</label>
                    <div className="flex space-x-2">
                      <input
                        type="number"
                        value={plan.min_amount}
                        onChange={(e) => handleChange(plan.id, 'min_amount', e.target.value)}
                        className="w-1/2 px-2 py-1 border rounded"
                        step="1"
                        min="0"
                        placeholder="Min"
                      />
                      <span className="flex items-center text-gray-500">to</span>
                      <input
                        type="number"
                        value={plan.max_amount || ''}
                        onChange={(e) => handleChange(plan.id, 'max_amount', e.target.value)}
                        className="w-1/2 px-2 py-1 border rounded"
                        step="1"
                        min="0"
                        placeholder="No max"
                      />
                    </div>
                  </div>
                ) : (
                  <span>
                    Range: ${plan.min_amount} - {plan.max_amount ? `$${plan.max_amount}` : 'No max'}
                  </span>
                )}
              </div>

              {/* Duration */}
              <div className="flex items-center space-x-3">
                <FaCalendarAlt className="text-gray-500" />
                {plan.isEditing ? (
                  <div className="flex-1">
                    <label className="text-sm text-gray-600">Duration (days)</label>
                    <input
                      type="number"
                      value={plan.duration_days}
                      onChange={(e) => handleChange(plan.id, 'duration_days', e.target.value)}
                      className="w-full px-2 py-1 border rounded"
                      min="1"
                    />
                  </div>
                ) : (
                  <span>Duration: {plan.duration_days} days</span>
                )}
              </div>

              {/* Features */}
              <div className="flex items-start space-x-3">
                <FaList className="text-gray-500 mt-1" />
                {plan.isEditing ? (
                  <div className="flex-1">
                    <label className="text-sm text-gray-600">Features</label>
                    <div className="space-y-2">
                      {plan.features.map((feature, index) => (
                        <div key={index} className="flex space-x-2">
                          <input
                            type="text"
                            value={feature}
                            onChange={(e) => handleFeatureChange(plan.id, index, e.target.value)}
                            className="flex-1 px-2 py-1 border rounded text-sm"
                            placeholder={`Feature ${index + 1}`}
                          />
                          <button
                            onClick={() => removeFeature(plan.id, index)}
                            className="p-1 text-red-500 hover:text-red-700"
                          >
                            <FaTimesIcon />
                          </button>
                        </div>
                      ))}
                      <button
                        onClick={() => addFeature(plan.id)}
                        className="text-sm text-emerald-600 hover:text-emerald-800"
                      >
                        + Add Feature
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex-1">
                    <span className="text-sm text-gray-600">Features:</span>
                    <ul className="list-disc list-inside text-sm mt-1">
                      {plan.features.map((feature, index) => (
                        <li key={index}>{feature}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Active Status */}
              {plan.isEditing && (
                <div className="flex items-center space-x-3">
                  <FaCheck className="text-gray-500" />
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={plan.is_active}
                      onChange={(e) => handleChange(plan.id, 'is_active', e.target.checked)}
                      className="rounded border-gray-300"
                      id={`active-${plan.id}`}
                    />
                    <label htmlFor={`active-${plan.id}`} className="text-sm text-gray-600">
                      Plan is active
                    </label>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default InvestmentPlansAdmin;