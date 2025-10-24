"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FaCheck, FaTimes, FaSpinner, FaSync } from "react-icons/fa";
import { approveDeposit, getAllDeposits, rejectDeposit } from "@/lib/investmentplan";

interface Deposit {
  id: string;
  amount: number;
  cryptoType: string;
  status: string;
  reference: string;
  createdAt: string;
  processedAt?: string;
  transactionHash?: string;
  adminNotes?: string;
  planTitle?: string;
  userEmail?: string;
  username?: string;
}

export default function DepositManager() {
  const [deposits, setDeposits] = useState<Deposit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedDepositId, setSelectedDepositId] = useState<string | null>(null);

  const fetchDeposits = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await getAllDeposits();
      if (error) {
        setError(error);
      } else if (data) {
        // Sort deposits by creation date (newest first) and filter only pending deposits
        const sortedAndFilteredDeposits = data
          .filter(deposit => deposit.status === 'pending')
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        
        setDeposits(sortedAndFilteredDeposits);
      }
    } catch (err) {
      console.log(err);
      setError("Failed to fetch deposits");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeposits();
  }, []);

  const handleApprove = async (depositId: string) => {
    setProcessingId(depositId);
    setError(null);
    try {
      const result = await approveDeposit(depositId);
      if (result.error) {
        setError(result.error);
      } else {
        // Remove the approved deposit from the local state instead of updating its status
        setDeposits(prev => prev.filter(deposit => deposit.id !== depositId));
        
        // Show success message
        setError("Deposit approved successfully!");
        setTimeout(() => setError(null), 3000);
      }
    } catch (err) {
      console.log(err);
      setError("Failed to approve deposit");
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async () => {
    if (!selectedDepositId) return;
    
    setProcessingId(selectedDepositId);
    setError(null);
    try {
      const result = await rejectDeposit(selectedDepositId, rejectReason);
      if (result.error) {
        setError(result.error);
      } else {
        // Remove the rejected deposit from the local state instead of updating its status
        setDeposits(prev => prev.filter(deposit => deposit.id !== selectedDepositId));
        
        setShowRejectModal(false);
        setRejectReason("");
        
        // Show success message
        setError("Deposit rejected successfully!");
        setTimeout(() => setError(null), 3000);
      }
    } catch (err) {
      console.log(err);
      setError("Failed to reject deposit");
    } finally {
      setProcessingId(null);
    }
  };

  const openRejectModal = (depositId: string) => {
    setSelectedDepositId(depositId);
    setShowRejectModal(true);
  };

  // Filter only pending deposits for display
  const pendingDeposits = deposits.filter(deposit => deposit.status === 'pending');

  return (
    <div className="p-4 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Pending Deposits</h1>
          <p className="text-gray-600 text-sm mt-1">
            Showing {pendingDeposits.length} pending deposit{pendingDeposits.length !== 1 ? 's' : ''}
          </p>
        </div>
        <button
          onClick={fetchDeposits}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors disabled:bg-blue-300"
        >
          {loading ? <FaSpinner className="animate-spin" /> : <FaSync />}
          Refresh
        </button>
      </div>

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`px-4 py-3 rounded mb-4 ${
            error.includes("successfully") 
              ? "bg-green-100 border border-green-400 text-green-700" 
              : "bg-red-100 border border-red-400 text-red-700"
          }`}
        >
          {error}
        </motion.div>
      )}

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <FaSpinner className="animate-spin text-4xl text-blue-500" />
        </div>
      ) : pendingDeposits.length === 0 ? (
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300"
        >
          <div className="text-6xl mb-4">🎉</div>
          <h3 className="text-xl font-semibold text-gray-600 mb-2">All Caught Up!</h3>
          <p className="text-gray-500 max-w-md mx-auto">
            No pending deposits at the moment. New deposits will appear here automatically.
          </p>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="overflow-x-auto bg-white rounded-lg shadow-sm border border-gray-200"
        >
          <table className="min-w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="py-4 px-6 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Reference
                </th>
                <th className="py-4 px-6 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  User
                </th>
                <th className="py-4 px-6 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Plan
                </th>
                <th className="py-4 px-6 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Amount
                </th>
                <th className="py-4 px-6 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Crypto
                </th>
                <th className="py-4 px-6 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Date
                </th>
                <th className="py-4 px-6 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {pendingDeposits.map((deposit, index) => (
                <motion.tr
                  key={deposit.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="py-4 px-6">
                    <code className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">
                      {deposit.reference}
                    </code>
                  </td>
                  <td className="py-4 px-6">
                    <div className="font-medium text-gray-900">{deposit.username || "N/A"}</div>
                    <div className="text-sm text-gray-500">{deposit.userEmail || "No email"}</div>
                  </td>
                  <td className="py-4 px-6">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {deposit.planTitle || "N/A"}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <span className="font-semibold text-gray-900">
                      ${deposit.amount.toFixed(2)}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                      {deposit.cryptoType}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-sm text-gray-500">
                    <div>{new Date(deposit.createdAt).toLocaleDateString()}</div>
                    <div className="text-xs text-gray-400">
                      {new Date(deposit.createdAt).toLocaleTimeString()}
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex gap-2">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleApprove(deposit.id)}
                        disabled={processingId === deposit.id}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                          processingId === deposit.id
                            ? "bg-green-400 cursor-not-allowed"
                            : "bg-green-500 hover:bg-green-600"
                        } text-white shadow-sm`}
                      >
                        {processingId === deposit.id ? (
                          <FaSpinner className="animate-spin" size={14} />
                        ) : (
                          <FaCheck size={14} />
                        )}
                        Approve
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => openRejectModal(deposit.id)}
                        disabled={processingId === deposit.id}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white text-sm font-medium shadow-sm transition-colors disabled:bg-red-300 disabled:cursor-not-allowed"
                      >
                        <FaTimes size={14} />
                        Reject
                      </motion.button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </motion.div>
      )}

      {/* Reject Modal */}
      {showRejectModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          onClick={() => setShowRejectModal(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-xl shadow-xl w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">Reject Deposit</h2>
              <p className="text-gray-600 mt-1">Please provide a reason for rejecting this deposit:</p>
            </div>
            
            <div className="p-6">
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                rows={4}
                placeholder="Enter rejection reason..."
              />
            </div>
            
            <div className="flex justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50 rounded-b-xl">
              <button
                onClick={() => {
                  setShowRejectModal(false);
                  setRejectReason("");
                }}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
                disabled={!!processingId}
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                disabled={!rejectReason.trim() || !!processingId}
                className={`px-4 py-2 rounded-lg text-white transition-colors ${
                  !rejectReason.trim() || processingId
                    ? "bg-red-400 cursor-not-allowed"
                    : "bg-red-500 hover:bg-red-600"
                }`}
              >
                {processingId ? (
                  <span className="flex items-center gap-2">
                    <FaSpinner className="animate-spin" />
                    Processing...
                  </span>
                ) : (
                  "Confirm Reject"
                )}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}