/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from 'react';
import { Withdrawal, WithdrawalStatus } from '@/types/businesses';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { 
  FiSearch, 
   
  FiLoader, 
  FiDownload, 
  FiRefreshCw,
  FiCalendar,
  FiDollarSign,
  FiUser,
  FiArrowUp,
  FiArrowDown,
  
} from 'react-icons/fi';
import { getAllWithdrawals } from '@/lib/withdrawal';
import { FaArrowsUpDown } from 'react-icons/fa6';

type SortField = 'reference' | 'createdAt' | 'amount' | 'status' | 'cryptoType' | 'username';
type SortDirection = 'asc' | 'desc';

const statusOptions: { value: WithdrawalStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'All Statuses' },
  { value: 'pending', label: 'Pending' },
  { value: 'reference', label: 'reference' },
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

const cryptoColors = {
  BTC: 'bg-orange-100 text-orange-800 border-orange-200',
  ETH: 'bg-gray-100 text-gray-800 border-gray-200',
  USDT: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  BNB: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  SOL: 'bg-purple-100 text-purple-800 border-purple-200',
  XRP: 'bg-blue-100 text-blue-800 border-blue-200',
  LTC: 'bg-blue-100 text-blue-800 border-blue-200',
};

export default function WithdrawalsOverview() {
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<WithdrawalStatus | 'all'>('all');
  const [cryptoFilter, setCryptoFilter] = useState<string>('all');
  const [sortField, setSortField] = useState<SortField>('createdAt');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  const fetchWithdrawals = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await getAllWithdrawals();
      if (error) {
        setError(error);
        toast.error('Failed to fetch withdrawals', { description: error });
      } else if (data) {
        setWithdrawals(data);
      }
    } catch (err) {
      const errorMessage = "Failed to fetch withdrawals";
      setError(errorMessage);
      toast.error(errorMessage);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWithdrawals();
  }, []);

  // Filter and sort withdrawals
  const filteredAndSortedWithdrawals = withdrawals
    .filter(withdrawal => {
      const matchesSearch = 
        withdrawal.reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
        withdrawal.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        withdrawal.userEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        withdrawal.walletAddress?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = statusFilter === 'all' || withdrawal.status === statusFilter;
      const matchesCrypto = cryptoFilter === 'all' || withdrawal.cryptoType === cryptoFilter;

      return matchesSearch && matchesStatus && matchesCrypto;
    })
    .sort((a, b) => {
      let aValue: any = a[sortField];
      let bValue: any = b[sortField];

      if (sortField === 'createdAt') {
        aValue = new Date(aValue).getTime();
        bValue = new Date(bValue).getTime();
      }

      if (sortField === 'amount') {
        aValue = a.amount;
        bValue = b.amount;
      }

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedWithdrawals.length / itemsPerPage);
  const paginatedWithdrawals = filteredAndSortedWithdrawals.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
    setCurrentPage(1);
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return <FaArrowsUpDown className="text-gray-400" size={14} />;
    return sortDirection === 'asc' ? <FiArrowUp className="text-blue-500" /> : <FiArrowDown className="text-blue-500" />;
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

  const exportToCSV = () => {
    const headers = ['Reference', 'User', 'Email', 'Amount', 'Crypto', 'Wallet Address', 'Status', 'Date', 'Processed Date'];
    const csvData = filteredAndSortedWithdrawals.map(withdrawal => [
      withdrawal.reference,
      withdrawal.username || 'N/A',
      withdrawal.userEmail || 'N/A',
      `$${withdrawal.amount.toFixed(2)}`,
      withdrawal.cryptoType,
      withdrawal.walletAddress,
      withdrawal.status,
      new Date(withdrawal.createdAt).toLocaleDateString(),
      withdrawal.processedAt ? new Date(withdrawal.processedAt).toLocaleDateString() : 'N/A'
    ]);

    const csvContent = [
      headers.join(','),
      ...csvData.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `withdrawals-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    
    toast.success('CSV exported successfully');
  };

  // Statistics
  const stats = {
    total: withdrawals.length,
    completed: withdrawals.filter(w => w.status === 'completed').length,
    pending: withdrawals.filter(w => w.status === 'pending').length,
    processing: withdrawals.filter(w => w.status === 'processing').length,
    rejected: withdrawals.filter(w => w.status === 'rejected').length,
    totalAmount: withdrawals.reduce((sum, w) => sum + w.amount, 0)
  };

  const uniqueCryptos = [...new Set(withdrawals.map(w => w.cryptoType))];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Withdrawals Overview</h1>
            <p className="text-gray-600 mt-2">Comprehensive view of all withdrawal transactions</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={exportToCSV}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <FiDownload size={16} />
              Export CSV
            </button>
            <button
              onClick={fetchWithdrawals}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-300"
            >
              <FiRefreshCw className={loading ? "animate-spin" : ""} size={16} />
              Refresh
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Withdrawals</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <FiDollarSign className="text-blue-600 text-xl" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
              </div>
              <div className="p-3 bg-yellow-100 rounded-lg">
                <div className="w-6 h-6 border-2 border-yellow-500 rounded-full animate-pulse"></div>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Processing</p>
                <p className="text-2xl font-bold text-blue-600">{stats.processing}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <FiLoader className="text-blue-600 text-xl animate-spin" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Amount</p>
                <p className="text-2xl font-bold text-gray-900">${stats.totalAmount.toLocaleString()}</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-lg">
                <FiDollarSign className="text-purple-600 text-xl" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by reference, user, email, or wallet address..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            {/* Status Filter */}
            <div className="flex gap-4">
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value as WithdrawalStatus | 'all');
                  setCurrentPage(1);
                }}
                className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {statusOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>

              {/* Crypto Filter */}
              <select
                value={cryptoFilter}
                onChange={(e) => {
                  setCryptoFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Crypto</option>
                {uniqueCryptos.map(crypto => (
                  <option key={crypto} value={crypto}>{crypto}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Withdrawals Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <FiLoader className="animate-spin text-blue-500 text-2xl" />
              <span className="ml-2 text-gray-600">Loading withdrawals...</span>
            </div>
          ) : filteredAndSortedWithdrawals.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-4xl mb-4">📊</div>
              <h3 className="text-xl font-semibold text-gray-600 mb-2">No withdrawals found</h3>
              <p className="text-gray-500">Try adjusting your search or filters</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th 
                        className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer"
                        onClick={() => handleSort('reference')}
                      >
                        <div className="flex items-center gap-2">
                          Reference
                          {getSortIcon('reference')}
                        </div>
                      </th>
                      <th 
                        className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer"
                        onClick={() => handleSort('username')}
                      >
                        <div className="flex items-center gap-2">
                          User
                          {getSortIcon('username')}
                        </div>
                      </th>
                      <th 
                        className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer"
                        onClick={() => handleSort('amount')}
                      >
                        <div className="flex items-center gap-2">
                          Amount
                          {getSortIcon('amount')}
                        </div>
                      </th>
                      <th 
                        className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer"
                        onClick={() => handleSort('cryptoType')}
                      >
                        <div className="flex items-center gap-2">
                          Crypto
                          {getSortIcon('cryptoType')}
                        </div>
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Wallet Address
                      </th>
                      <th 
                        className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer"
                        onClick={() => handleSort('status')}
                      >
                        <div className="flex items-center gap-2">
                          Status
                          {getSortIcon('status')}
                        </div>
                      </th>
                      <th 
                        className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer"
                        onClick={() => handleSort('createdAt')}
                      >
                        <div className="flex items-center gap-2">
                          Date
                          {getSortIcon('createdAt')}
                        </div>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {paginatedWithdrawals.map((withdrawal ) => (
                      <tr 
                        key={withdrawal.id} 
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <code className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">
                            {withdrawal.reference}
                          </code>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                              <FiUser className="text-blue-600 text-sm" />
                            </div>
                            <div>
                              <div className="font-medium text-gray-900">{withdrawal.username || "N/A"}</div>
                              <div className="text-sm text-gray-500">{withdrawal.userEmail || "No email"}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-lg font-bold text-gray-900">
                            {formatAmount(withdrawal.amount)}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${
                            cryptoColors[withdrawal.cryptoType as keyof typeof cryptoColors] || 'bg-gray-100 text-gray-800 border-gray-200'
                          }`}>
                            {withdrawal.cryptoType}
                          </span>
                        </td>
                        <td className="px-6 py-4 max-w-xs">
                          <code className="text-sm font-mono bg-gray-100 px-2 py-1 rounded break-all">
                            {withdrawal.walletAddress}
                          </code>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${
                            statusColors[withdrawal.status as keyof typeof statusColors]
                          }`}>
                            {withdrawal.status.charAt(0).toUpperCase() + withdrawal.status.slice(1)}
                          </span>
                          {withdrawal.adminNotes && withdrawal.status === 'rejected' && (
                            <div className="text-xs text-gray-500 mt-1 max-w-xs">
                              Reason: {withdrawal.adminNotes}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <FiCalendar className="text-gray-400" />
                            {formatDate(withdrawal.createdAt)}
                          </div>
                          {withdrawal.processedAt && (
                            <div className="text-xs text-gray-400 mt-1">
                              Processed: {formatDate(withdrawal.processedAt)}
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between px-6 py-4 border-t border-gray-200 bg-gray-50 gap-4">
                  <div className="text-sm text-gray-700">
                    Showing {(currentPage - 1) * itemsPerPage + 1} to{' '}
                    {Math.min(currentPage * itemsPerPage, filteredAndSortedWithdrawals.length)} of{' '}
                    {filteredAndSortedWithdrawals.length} results
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Previous
                    </button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1)
                      .filter(page => 
                        page === 1 || 
                        page === totalPages || 
                        (page >= currentPage - 1 && page <= currentPage + 1)
                      )
                      .map((page, index, array) => (
                        <div key={page} className="flex items-center">
                          {index > 0 && array[index - 1] !== page - 1 && (
                            <span className="px-2 text-gray-500">...</span>
                          )}
                          <button
                            onClick={() => setCurrentPage(page)}
                            className={`px-3 py-2 border rounded-lg transition-colors ${
                              currentPage === page
                                ? 'bg-blue-600 text-white border-blue-600'
                                : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                            }`}
                          >
                            {page}
                          </button>
                        </div>
                      ))
                    }
                    <button
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}