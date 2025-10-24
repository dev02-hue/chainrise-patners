"use client";

import { useState, useEffect } from 'react';
import { Withdrawal, WithdrawalStatus } from '@/types/businesses';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { FiSearch, FiFilter, FiLoader, FiCheck, FiX, FiAlertCircle, FiRefreshCw } from 'react-icons/fi';
import { approveWithdrawal, getAllWithdrawals, rejectWithdrawal } from '@/lib/withdrawal';

const statusOptions: { value: WithdrawalStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'All Statuses' },
  { value: 'pending', label: 'Pending' },
  { value: 'processing', label: 'Processing' },
  { value: 'completed', label: 'Completed' },
  { value: 'rejected', label: 'Rejected' },
];

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  processing: 'bg-blue-100 text-blue-800 border-blue-200',
  completed: 'bg-green-100 text-green-800 border-green-200',
  rejected: 'bg-red-100 text-red-800 border-red-200',
};

export default function AdminWithdrawalsTable() {
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [loading, setLoading] = useState(true);
  const [count, setCount] = useState(0);
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 10,
  });
  const [filters, setFilters] = useState({
    status: undefined as WithdrawalStatus | undefined,
    userId: '',
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [openRejectDialog, setOpenRejectDialog] = useState(false);
  const [rejectNotes, setRejectNotes] = useState('');
  const [selectedWithdrawal, setSelectedWithdrawal] = useState<Withdrawal | null>(null);
  const [processingAction, setProcessingAction] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const fetchWithdrawals = async () => {
    try {
      setLoading(true);
      const { data, error, count } = await getAllWithdrawals({
        status: filters.status,
        userId: filters.userId,
        limit: pagination.pageSize,
        offset: (pagination.page - 1) * pagination.pageSize,
      });

      if (error) {
        toast.error('Failed to fetch withdrawals', { description: error });
        return;
      }

      // Sort withdrawals by creation date (newest first) and filter only pending/processing
      const sortedWithdrawals = (data || [])
        .filter(w => w.status === 'pending' || w.status === 'processing')
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

      setWithdrawals(sortedWithdrawals);
      setCount(count || 0);
    } catch (error) {
      toast.error('An unexpected error occurred');
      console.error(error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const refreshWithdrawals = async () => {
    setRefreshing(true);
    await fetchWithdrawals();
  };

  useEffect(() => {
    fetchWithdrawals();
  }, [pagination.page, pagination.pageSize, filters.status, filters.userId]);

  const handleApprove = async (withdrawalId: string) => {
    try {
      setProcessingAction(true);
      const { error, currentStatus } = await approveWithdrawal(withdrawalId);

      if (error) {
        toast.error('Failed to approve withdrawal', {
          description: currentStatus ? `Status: ${currentStatus}` : error,
        });
        return;
      }

      toast.success('Withdrawal approved successfully');
      
      // Remove the approved withdrawal from the local state instead of refetching
      setWithdrawals(prev => prev.filter(w => w.id !== withdrawalId));
      setCount(prev => prev - 1);
      
    } catch (error) {
      toast.error('An unexpected error occurred');
      console.error(error);
    } finally {
      setProcessingAction(false);
    }
  };

  const handleReject = async () => {
    if (!selectedWithdrawal) return;

    try {
      setProcessingAction(true);
      const { error, currentStatus } = await rejectWithdrawal(
        selectedWithdrawal.id,
        rejectNotes
      );

      if (error) {
        toast.error('Failed to reject withdrawal', {
          description: currentStatus ? `Status: ${currentStatus}` : error,
        });
        return;
      }

      toast.success('Withdrawal rejected successfully');
      
      // Remove the rejected withdrawal from the local state
      setWithdrawals(prev => prev.filter(w => w.id !== selectedWithdrawal.id));
      setCount(prev => prev - 1);
      
      setOpenRejectDialog(false);
      setRejectNotes('');
      setSelectedWithdrawal(null);
    } catch (error) {
      toast.error('An unexpected error occurred');
      console.error(error);
    } finally {
      setProcessingAction(false);
    }
  };

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setFilters({
      ...filters,
      status: value === 'all' ? undefined : (value as WithdrawalStatus),
    });
    setPagination({ ...pagination, page: 1 });
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setFilters({
      ...filters,
      userId: searchTerm.trim(),
    });
    setPagination({ ...pagination, page: 1 });
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'MMM dd, yyyy HH:mm');
  };

  // Filter only pending and processing withdrawals for display
  const pendingWithdrawals = withdrawals.filter(w => w.status === 'pending' || w.status === 'processing');

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">Withdrawal Requests</h1>
            <p className="text-gray-600">
              Showing {pendingWithdrawals.length} pending withdrawal{pendingWithdrawals.length !== 1 ? 's' : ''}
            </p>
          </div>
          
          <button
            onClick={refreshWithdrawals}
            disabled={refreshing}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-300"
          >
            <FiRefreshCw className={refreshing ? "animate-spin" : ""} />
            {refreshing ? "Refreshing..." : "Refresh"}
          </button>
        </div>
        
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <form onSubmit={handleSearch} className="flex gap-2 w-full md:w-auto">
            <div className="relative flex-grow">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiSearch className="text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search by user ID or email..."
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2 bg-white border border-gray-300 rounded-lg flex items-center gap-2 hover:bg-gray-50 transition-colors"
            >
              <FiFilter />
              <span>Filter</span>
            </button>
          </form>

          <div className="w-full md:w-auto">
            <select
              onChange={handleStatusChange}
              value={filters.status || 'all'}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="bg-white shadow-lg rounded-xl overflow-hidden border border-gray-200">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    User
                  </th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Amount
                  </th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Crypto
                  </th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Wallet Address
                  </th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Date
                  </th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Reference
                  </th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-8 text-center">
                      <div className="flex justify-center items-center">
                        <FiLoader className="animate-spin text-blue-500 text-2xl" />
                        <span className="ml-2 text-gray-600">Loading withdrawals...</span>
                      </div>
                    </td>
                  </tr>
                ) : pendingWithdrawals.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-12 text-center">
                      <div className="text-center">
                        <div className="text-4xl mb-4">🎉</div>
                        <h3 className="text-lg font-semibold text-gray-600 mb-2">All Caught Up!</h3>
                        <p className="text-gray-500">No pending withdrawal requests at the moment.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  pendingWithdrawals.map((withdrawal ) => (
                    <tr 
                      key={withdrawal.id} 
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-medium text-gray-900">{withdrawal.username}</div>
                        <div className="text-sm text-gray-500">{withdrawal.userEmail}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="font-bold text-gray-900">
                          {formatAmount(withdrawal.amount)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                          {withdrawal.cryptoType}
                        </span>
                      </td>
                      <td className="px-6 py-4 max-w-xs">
                        <code className="text-sm font-mono bg-gray-100 px-2 py-1 rounded break-all">
                          {withdrawal.walletAddress}
                        </code>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${statusColors[withdrawal.status as keyof typeof statusColors] ?? 'bg-gray-100 text-gray-800 border-gray-200'}`}>
                          {withdrawal.status.charAt(0).toUpperCase() + withdrawal.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {withdrawal.createdAt ? formatDate(withdrawal.createdAt) : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <code className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
                          {withdrawal.reference}
                        </code>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        {withdrawal.status === 'pending' && (
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleApprove(withdrawal.id)}
                              disabled={processingAction}
                              className="flex items-center gap-2 px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:bg-green-300 disabled:cursor-not-allowed transition-colors"
                            >
                              {processingAction ? (
                                <FiLoader className="animate-spin" />
                              ) : (
                                <FiCheck />
                              )}
                              Approve
                            </button>
                            <button
                              onClick={() => {
                                setSelectedWithdrawal(withdrawal);
                                setOpenRejectDialog(true);
                              }}
                              disabled={processingAction}
                              className="flex items-center gap-2 px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:bg-red-300 disabled:cursor-not-allowed transition-colors"
                            >
                              <FiX />
                              Reject
                            </button>
                          </div>
                        )}
                        {withdrawal.status === 'processing' && (
                          <span className="text-blue-600 text-sm font-medium">Processing...</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination */}
        {pendingWithdrawals.length > 0 && (
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mt-6 px-2 gap-4">
            <div className="text-sm text-gray-500">
              Showing {(pagination.page - 1) * pagination.pageSize + 1} to{' '}
              {Math.min(pagination.page * pagination.pageSize, count)} of {count} withdrawals
            </div>
            <div className="flex gap-2">
              <button
                onClick={() =>
                  setPagination({
                    ...pagination,
                    page: Math.max(1, pagination.page - 1),
                  })
                }
                disabled={pagination.page === 1 || loading}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Previous
              </button>
              <button
                onClick={() =>
                  setPagination({
                    ...pagination,
                    page: pagination.page + 1,
                  })
                }
                disabled={pagination.page * pagination.pageSize >= count || loading}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Reject Dialog */}
      {openRejectDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <div className="flex items-start mb-4">
              <div className="flex-shrink-0">
                <FiAlertCircle className="h-6 w-6 text-red-500" />
              </div>
              <div className="ml-3">
                <h3 className="text-lg font-semibold text-gray-900">Reject Withdrawal?</h3>
                <div className="mt-2 text-sm text-gray-500">
                  Are you sure you want to reject this withdrawal request? Please provide
                  a reason for rejection.
                </div>
              </div>
            </div>
            <textarea
              placeholder="Reason for rejection..."
              value={rejectNotes}
              onChange={(e) => setRejectNotes(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              rows={3}
            />
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  setOpenRejectDialog(false);
                  setRejectNotes('');
                  setSelectedWithdrawal(null);
                }}
                className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                disabled={processingAction}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleReject}
                disabled={!rejectNotes.trim() || processingAction}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-red-300 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
              >
                {processingAction ? (
                  <FiLoader className="animate-spin" />
                ) : null}
                Reject Withdrawal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}