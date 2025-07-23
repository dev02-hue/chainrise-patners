"use client";
import { useState } from 'react';
import { initiateWithdrawal } from '@/lib/withdrawal';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { FiArrowRight, FiAlertCircle, FiCheckCircle, FiInfo, FiLoader } from 'react-icons/fi';

type FormData = {
  amount: string;
  cryptoType: string;
  walletAddress: string;
};

const cryptoOptions = [
  { value: 'USDT', label: 'USDT (Tether)', icon: '💲' },
  { value: 'BTC', label: 'Bitcoin (BTC)', icon: '₿' },
  { value: 'ETH', label: 'Ethereum (ETH)', icon: 'Ξ' },
  { value: 'BNB', label: 'BNB', icon: '🅱' },
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
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
      className="max-w-md mx-auto bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100"
    >
      <div className="p-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Withdraw Funds</h2>
          <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center">
            <FiArrowRight className="text-blue-600 text-xl" />
          </div>
        </div>
        
        {error && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg flex items-start gap-3"
          >
            <FiAlertCircle className="text-red-500 text-xl mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium">Error</p>
              <p className="text-sm">{error}</p>
            </div>
          </motion.div>
        )}

        {success && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-green-50 text-green-700 rounded-lg flex items-start gap-3"
          >
            <FiCheckCircle className="text-green-500 text-xl mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium">Success!</p>
              <p className="text-sm">Withdrawal request submitted successfully.</p>
            </div>
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-2">
              Amount (USD)
            </label>
            <div className="relative">
              <input
                type="number"
                id="amount"
                name="amount"
                value={formData.amount}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="0.00"
                step="0.01"
                min="10"
                required
              />
              <span className="absolute right-4 top-3.5 text-gray-400">USD</span>
            </div>
            <p className="text-xs text-gray-500 mt-2">Minimum withdrawal: $10.00</p>
          </div>

          <div>
            <label htmlFor="cryptoType" className="block text-sm font-medium text-gray-700 mb-2">
              Cryptocurrency
            </label>
            <div className="relative">
              <select
                id="cryptoType"
                name="cryptoType"
                value={formData.cryptoType}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                {cryptoOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.icon} {option.label}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
          </div>

          <div>
            <label htmlFor="walletAddress" className="block text-sm font-medium text-gray-700 mb-2">
              Wallet Address
            </label>
            <input
              type="text"
              id="walletAddress"
              name="walletAddress"
              value={formData.walletAddress}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter your wallet address"
              required
            />
          </div>

          <motion.button
            type="submit"
            disabled={isLoading}
            whileTap={{ scale: isLoading ? 1 : 0.98 }}
            className={`w-full py-3 px-6 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${
              isLoading 
                ? 'bg-blue-400 cursor-not-allowed' 
                : 'bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white shadow-md'
            }`}
          >
            {isLoading ? (
              <>
                <FiLoader className="animate-spin" />
                Processing...
              </>
            ) : (
              <>
                Withdraw
                <FiArrowRight />
              </>
            )}
          </motion.button>
        </form>
      </div>

      <div className="bg-gray-50 px-8 py-6 border-t border-gray-100">
        <div className="flex items-start gap-3">
          <FiInfo className="text-blue-500 text-xl mt-0.5 flex-shrink-0" />
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2">Withdrawal Information</h3>
            <ul className="text-xs text-gray-600 space-y-2">
              <li className="flex items-start gap-2">
                <span className="text-blue-500">•</span>
                <span>Processing time: 2hours max</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-500">•</span>
                <span>Network fees may apply (varies by cryptocurrency)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-500">•</span>
                <span>Double-check wallet address before submitting</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-500">•</span>
                <span>Transactions cannot be reversed once processed</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </motion.div>
  );
}