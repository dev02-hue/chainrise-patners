/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaPlus, 
  FaEdit, 
  FaTrash, 
  FaToggleOn, 
  FaToggleOff,
  FaSearch,
  FaFilter,
  FaBitcoin,
  FaEthereum,
  FaSync,
  FaExclamationTriangle,
 
} from 'react-icons/fa';
import { 
  SiBinance, 
  SiSolana, 
  SiTether 
} from 'react-icons/si';
import { toast } from 'sonner';
import { 
  getAllWalletAddresses, 
  createWalletAddress, 
  updateWalletAddress, 
  deleteWalletAddress,
  toggleWalletAddressStatus,
  WalletAddress 
} from '@/lib/walletAddresses';

// Crypto icon component
const CryptoIcon = ({ symbol, className = "" }: { symbol: string; className?: string }) => {
  const iconClass = `text-lg ${className}`;
  
  const icons: { [key: string]: React.ReactNode } = {
    BTC: <FaBitcoin className={`${iconClass} text-orange-500`} />,
    ETH: <FaEthereum className={`${iconClass} text-gray-600`} />,
    BNB: <SiBinance className={`${iconClass} text-yellow-500`} />,
    SOL: <SiSolana className={`${iconClass} text-purple-500`} />,
    USDT: <SiTether className={`${iconClass} text-emerald-500`} />
  };

  return icons[symbol.toUpperCase()] || <div className={`${iconClass} text-gray-500`} />;
};

// Status badge component
const StatusBadge = ({ isActive }: { isActive: boolean }) => (
  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
    isActive 
      ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' 
      : 'bg-rose-100 text-rose-800 border border-rose-200'
  }`}>
    {isActive ? 'Active' : 'Inactive'}
  </span>
);

// Wallet Form Component
const WalletForm = ({ 
  wallet, 
  onSave, 
  onCancel 
}: { 
  wallet?: WalletAddress;
  onSave: (data: any) => Promise<void>;
  onCancel: () => void;
}) => {
  const [formData, setFormData] = useState({
    symbol: wallet?.symbol || '',
    name: wallet?.name || '',
    wallet_address: wallet?.wallet_address || '',
    network: wallet?.network || '',
    min_deposit: wallet?.min_deposit || 0,
    is_active: wallet?.is_active ?? true
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await onSave(formData);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto"
      >
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-xl font-semibold text-gray-900">
            {wallet ? 'Edit Wallet' : 'Add New Wallet'}
          </h3>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Symbol *
            </label>
            <input
              type="text"
              required
              value={formData.symbol}
              onChange={(e) => setFormData(prev => ({ ...prev, symbol: e.target.value.toUpperCase() }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="BTC, ETH, USDT..."
              maxLength={10}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Name *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Bitcoin, Ethereum, Tether..."
              maxLength={100}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Wallet Address *
            </label>
            <textarea
              required
              value={formData.wallet_address}
              onChange={(e) => setFormData(prev => ({ ...prev, wallet_address: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              placeholder="Enter wallet address..."
              rows={3}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Network *
            </label>
            <input
              type="text"
              required
              value={formData.network}
              onChange={(e) => setFormData(prev => ({ ...prev, network: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Bitcoin Network, Ethereum ERC20..."
              maxLength={100}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Minimum Deposit *
            </label>
            <input
              type="number"
              required
              step="0.00000001"
              min="0"
              value={formData.min_deposit}
              onChange={(e) => setFormData(prev => ({ ...prev, min_deposit: parseFloat(e.target.value) || 0 }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="0.001"
            />
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="is_active"
              checked={formData.is_active}
              onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.checked }))}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="is_active" className="ml-2 text-sm text-gray-700">
              Active (visible on deposit page)
            </label>
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onCancel}
              disabled={loading}
              className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center justify-center"
            >
              {loading ? (
                <FaSync className="animate-spin" />
              ) : (
                wallet ? 'Update Wallet' : 'Create Wallet'
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

// Main Component
export default function WalletManagement() {
  const [wallets, setWallets] = useState<WalletAddress[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [showForm, setShowForm] = useState(false);
  const [editingWallet, setEditingWallet] = useState<WalletAddress | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  // Load wallets
  const loadWallets = async () => {
    try {
      setLoading(true);
      const { data, error } = await getAllWalletAddresses();
      
      if (error) {
        toast.error(`Failed to load wallets: ${error}`);
        return;
      }

      setWallets(data || []);
    } catch (err) {
      toast.error('An unexpected error occurred');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWallets();
  }, []);

  // Filter wallets based on search and status
  const filteredWallets = wallets.filter(wallet => {
    const matchesSearch = wallet.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         wallet.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         wallet.network.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'active' && wallet.is_active) ||
                         (statusFilter === 'inactive' && !wallet.is_active);

    return matchesSearch && matchesStatus;
  });

  // Handle create/update wallet
 // Handle create/update wallet - UPDATED VERSION
const handleSaveWallet = async (formData: any) => {
  try {
    let result;

    if (editingWallet) {
      console.log('🔄 Updating wallet:', editingWallet.id, formData);
      result = await updateWalletAddress(editingWallet.id, formData);
    } else {
      console.log('🆕 Creating new wallet:', formData);
      result = await createWalletAddress(formData);
    }

    console.log('📨 Server response:', result);

    if (result.success) {
      toast.success(`Wallet ${editingWallet ? 'updated' : 'created'} successfully`);
      setShowForm(false);
      setEditingWallet(null);
      await loadWallets();
    } else {
      console.error('❌ Server error:', result.error);
      toast.error(result.error || `Failed to ${editingWallet ? 'update' : 'create'} wallet`);
    }
  } catch (err) {
    console.error('💥 Unexpected error:', err);
    toast.error('An unexpected error occurred');
  }
};

  // Handle toggle status
  const handleToggleStatus = async (wallet: WalletAddress) => {
    try {
      const result = await toggleWalletAddressStatus(wallet.id, !wallet.is_active);
      
      if (result.success) {
        toast.success(`Wallet ${!wallet.is_active ? 'activated' : 'deactivated'} successfully`);
        await loadWallets();
      } else {
        toast.error(result.error || 'Failed to update wallet status');
      }
    } catch (err) {
      toast.error('An unexpected error occurred');
      console.error(err);
    }
  };

  // Handle delete wallet
  const handleDeleteWallet = async (id: string) => {
    try {
      const result = await deleteWalletAddress(id);
      
      if (result.success) {
        toast.success('Wallet deleted successfully');
        setDeleteConfirm(null);
        await loadWallets();
      } else {
        toast.error(result.error || 'Failed to delete wallet');
      }
    } catch (err) {
      toast.error('An unexpected error occurred');
      console.error(err);
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading && wallets.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <FaSync className="w-8 h-8 text-blue-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading wallets...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Wallet Management</h1>
              <p className="text-gray-600 mt-2">Manage cryptocurrency wallet addresses for deposits</p>
            </div>
            <button
              onClick={() => {
                setEditingWallet(null);
                setShowForm(true);
              }}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              <FaPlus className="mr-2" />
              Add New Wallet
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
            <div className="text-2xl font-bold text-gray-900">{wallets.length}</div>
            <div className="text-sm text-gray-600">Total Wallets</div>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
            <div className="text-2xl font-bold text-emerald-600">
              {wallets.filter(w => w.is_active).length}
            </div>
            <div className="text-sm text-gray-600">Active Wallets</div>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
            <div className="text-2xl font-bold text-rose-600">
              {wallets.filter(w => !w.is_active).length}
            </div>
            <div className="text-sm text-gray-600">Inactive Wallets</div>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
            <div className="text-2xl font-bold text-blue-600">
              {new Set(wallets.map(w => w.symbol)).size}
            </div>
            <div className="text-sm text-gray-600">Unique Cryptocurrencies</div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaSearch className="text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search by symbol, name, or network..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="flex items-center space-x-2">
              <FaFilter className="text-gray-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="active">Active Only</option>
                <option value="inactive">Inactive Only</option>
              </select>
            </div>
            <button
              onClick={loadWallets}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center"
            >
              <FaSync className="mr-2" />
              Refresh
            </button>
          </div>
        </div>

        {/* Wallets Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          {filteredWallets.length === 0 ? (
            <div className="text-center py-12">
              <FaExclamationTriangle className="text-gray-400 text-4xl mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No wallets found</h3>
              <p className="text-gray-600 mb-4">
                {searchTerm || statusFilter !== 'all' 
                  ? 'Try adjusting your search or filters' 
                  : 'Get started by adding your first wallet address'
                }
              </p>
              {!searchTerm && statusFilter === 'all' && (
                <button
                  onClick={() => setShowForm(true)}
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <FaPlus className="mr-2" />
                  Add New Wallet
                </button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Crypto
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Details
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Network
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Min Deposit
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Created
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredWallets.map((wallet) => (
                    <motion.tr
                      key={wallet.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <CryptoIcon symbol={wallet.symbol} />
                          <div className="ml-3">
                            <div className="text-sm font-medium text-gray-900">
                              {wallet.symbol}
                            </div>
                            <div className="text-sm text-gray-500">
                              {wallet.name}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 font-mono max-w-xs truncate">
                          {wallet.wallet_address}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{wallet.network}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{wallet.min_deposit}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <StatusBadge isActive={wallet.is_active} />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(wallet.created_at)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => handleToggleStatus(wallet)}
                            className={`p-2 rounded-lg transition-colors ${
                              wallet.is_active 
                                ? 'text-rose-600 hover:bg-rose-50' 
                                : 'text-emerald-600 hover:bg-emerald-50'
                            }`}
                            title={wallet.is_active ? 'Deactivate' : 'Activate'}
                          >
                            {wallet.is_active ? <FaToggleOn size={16} /> : <FaToggleOff size={16} />}
                          </button>
                          <button
                            onClick={() => {
                              setEditingWallet(wallet);
                              setShowForm(true);
                            }}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <FaEdit size={14} />
                          </button>
                          <button
                            onClick={() => setDeleteConfirm(wallet.id)}
                            className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                            title="Delete"
                          >
                            <FaTrash size={14} />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit Form Modal */}
      <AnimatePresence>
        {showForm && (
          <WalletForm
            wallet={editingWallet || undefined}
            onSave={handleSaveWallet}
            onCancel={() => {
              setShowForm(false);
              setEditingWallet(null);
            }}
          />
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-2xl p-6 max-w-sm w-full"
            >
              <div className="text-center">
                <FaExclamationTriangle className="text-rose-500 text-3xl mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Delete Wallet
                </h3>
                <p className="text-gray-600 mb-6">
                  Are you sure you want to delete this wallet address? This action cannot be undone.
                </p>
                <div className="flex space-x-3">
                  <button
                    onClick={() => setDeleteConfirm(null)}
                    className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleDeleteWallet(deleteConfirm)}
                    className="flex-1 px-4 py-2 bg-rose-600 text-white rounded-lg hover:bg-rose-700 transition-colors flex items-center justify-center"
                  >
                    <FaTrash className="mr-2" />
                    Delete
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}