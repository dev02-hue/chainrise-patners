"use client";
import { useState } from 'react';
import { initiateWithdrawal } from '@/lib/withdrawal';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { FiArrowRight, FiAlertCircle, FiCheckCircle, FiInfo, FiLoader, FiDollarSign, } from 'react-icons/fi';
import { FaWallet } from 'react-icons/fa';

type FormData = {
  amount: string;
  cryptoType: string;
  walletAddress: string;
};

const cryptoOptions = [
  { value: 'USDT', label: 'USDT', icon: '💲', color: 'bg-emerald-50 text-emerald-600 border-emerald-200' },
  { value: 'BTC', label: 'BTC', icon: '₿', color: 'bg-amber-50 text-amber-600 border-amber-200' },
  { value: 'ETH', label: 'ETH', icon: 'Ξ', color: 'bg-blue-50 text-blue-600 border-blue-200' },
  { value: 'BNB', label: 'BNB', icon: '🅱', color: 'bg-yellow-50 text-yellow-600 border-yellow-200' },
];

export default function WithdrawalForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    amount: '',
    cryptoType: 'USDT',
    walletAddress: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCryptoSelect = (cryptoType: string) => {
    setFormData(prev => ({
      ...prev,
      cryptoType
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const amount = parseFloat(formData.amount);
      if (isNaN(amount) || amount < 10) {
        setError('Minimum withdrawal amount is $10.00');
        return;
      }

      const result = await initiateWithdrawal({
        amount,
        cryptoType: formData.cryptoType,
        walletAddress: formData.walletAddress
      });

      if (result.error) {
        setError(result.error);
      } else {
        setSuccess(true);
        setFormData({
          amount: '',
          cryptoType: 'USDT',
          walletAddress: ''
        });
        setTimeout(() => {
          router.refresh();
          setSuccess(false);
        }, 2000);
      }
    } catch (err) {
      console.error('Withdrawal error:', err);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-lg mx-auto bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-50 to-emerald-50 px-8 py-6 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-1">Withdraw Funds</h2>
            <p className="text-gray-600 text-sm">Transfer cryptocurrency to your external wallet</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-white shadow-sm flex items-center justify-center">
            <FiArrowRight className="text-blue-500 text-xl" />
          </div>
        </div>
      </div>

      <div className="p-8">
        {/* Status Messages */}
        {error && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl flex items-start gap-3"
          >
            <FiAlertCircle className="text-rose-500 text-xl mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium">Withdrawal Error</p>
              <p className="text-sm">{error}</p>
            </div>
          </motion.div>
        )}

        {success && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl flex items-start gap-3"
          >
            <FiCheckCircle className="text-emerald-500 text-xl mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium">Withdrawal Request Submitted</p>
              <p className="text-sm">Your transaction is being processed.</p>
            </div>
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Amount Input */}
          <div>
            <label htmlFor="amount" className="block text-sm font-semibold text-gray-700 mb-3">
              Withdrawal Amount
            </label>
            <div className="relative">
              <div className="absolute left-4 top-3.5 text-gray-400">
                <FiDollarSign className="w-5 h-5" />
              </div>
              <input
                type="number"
                id="amount"
                name="amount"
                value={formData.amount}
                onChange={handleChange}
                className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                placeholder="0.00"
                step="0.01"
                min="10"
                required
              />
              <span className="absolute right-4 top-3.5 text-gray-500 text-sm font-medium">USD</span>
            </div>
            <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
              <FiInfo className="w-3 h-3" />
              Minimum withdrawal amount: $10.00
            </p>
          </div>

          {/* Cryptocurrency Selection */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Select Cryptocurrency
            </label>
            <div className="grid grid-cols-2 gap-3">
              {cryptoOptions.map((option) => (
                <motion.button
                  key={option.value}
                  type="button"
                  onClick={() => handleCryptoSelect(option.value)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`p-4 rounded-xl border-2 transition-all duration-200 flex flex-col items-center gap-2 ${
                    formData.cryptoType === option.value
                      ? `${option.color} border-current shadow-sm`
                      : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
                  }`}
                >
                  <span className="text-2xl">{option.icon}</span>
                  <span className="font-medium text-sm">{option.label}</span>
                </motion.button>
              ))}
            </div>
          </div>

          {/* Wallet Address */}
          <div>
            <label htmlFor="walletAddress" className="block text-sm font-semibold text-gray-700 mb-3">
              Destination Wallet Address
            </label>
            <div className="relative">
              <div className="absolute left-4 top-3.5 text-gray-400">
                <FaWallet className="w-5 h-5" />
              </div>
              <input
                type="text"
                id="walletAddress"
                name="walletAddress"
                value={formData.walletAddress}
                onChange={handleChange}
                className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                placeholder="Enter your external wallet address"
                required
              />
            </div>
          </div>

          {/* Submit Button */}
          <motion.button
            type="submit"
            disabled={isLoading}
            whileHover={{ scale: isLoading ? 1 : 1.02 }}
            whileTap={{ scale: isLoading ? 1 : 0.98 }}
            className={`w-full py-4 px-6 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center gap-3 ${
              isLoading 
                ? 'bg-blue-400 cursor-not-allowed shadow-sm' 
                : 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-md hover:shadow-lg'
            }`}
          >
            {isLoading ? (
              <>
                <FiLoader className="animate-spin w-5 h-5" />
                Processing Withdrawal...
              </>
            ) : (
              <>
                <span>Initiate Withdrawal</span>
                <FiArrowRight className="w-5 h-5" />
              </>
            )}
          </motion.button>
        </form>
      </div>

      {/* Information Panel */}
      <div className="bg-gray-50 px-8 py-6 border-t border-gray-100">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0">
            <FiInfo className="text-blue-500 text-lg" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Withdrawal Guidelines</h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-blue-500 text-xs font-bold">1</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">Processing Time</p>
                  <p className="text-xs text-gray-600">Typically processed within 2 hours during business hours</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-blue-500 text-xs font-bold">2</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">Network Fees</p>
                  <p className="text-xs text-gray-600">Blockchain network fees apply and vary by cryptocurrency</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-blue-500 text-xs font-bold">3</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">Address Verification</p>
                  <p className="text-xs text-gray-600">Double-check wallet address accuracy before submission</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-blue-500 text-xs font-bold">4</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">Irreversible Transactions</p>
                  <p className="text-xs text-gray-600">Cryptocurrency transactions cannot be reversed once processed</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}