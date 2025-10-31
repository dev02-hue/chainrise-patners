/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaBitcoin, 
  FaEthereum, 
  FaExchangeAlt,
  FaHistory,
  FaQrcode,
  FaCopy,
  FaCheck,
  FaShieldAlt,
  FaRocket,
  FaDollarSign,
  FaExclamationTriangle,
  FaSpinner
} from 'react-icons/fa';
import { 
  SiBinance, 
  SiSolana, 
  SiTether,
  SiRipple,
  SiLitecoin
} from 'react-icons/si';
import { getActiveWalletAddresses, WalletAddress } from '@/lib/walletAddresses';

// Types
interface CryptoAsset {
  id: string;
  symbol: string;
  name: string;
  walletAddress: string;
  network: string;
  minDeposit: number;
}

interface DepositRecord {
  id: string;
  amount: number;
  cryptoType: string;
  status: 'pending' | 'confirmed' | 'completed' | 'failed';
  createdAt: string;
  transactionHash?: string;
}

interface DepositForm {
  amount: number;
  cryptoType: string;
  transactionHash?: string;
}

// Constants
const MINIMUM_DEPOSIT = 100;

// Custom hooks - UPDATED TO USE REAL DATA
const useCryptoAssets = () => {
  const [assets, setAssets] = useState<CryptoAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAssets = async () => {
      try {
        setLoading(true);
        setError('');
        
        // Fetch real wallet addresses from server
        const { data: walletData, error: fetchError } = await getActiveWalletAddresses();
        
        if (fetchError) {
          setError(fetchError);
          return;
        }

        if (walletData && walletData.length > 0) {
          // Transform server data to match component interface
          const transformedAssets: CryptoAsset[] = walletData.map((wallet: WalletAddress) => ({
            id: wallet.id,
            symbol: wallet.symbol,
            name: wallet.name,
            walletAddress: wallet.wallet_address,
            network: wallet.network,
            minDeposit: wallet.min_deposit
          }));
          setAssets(transformedAssets);
        } else {
          setError('No active wallet addresses found');
        }
      } catch (err) {
        console.error('Failed to fetch crypto assets:', err);
        setError('Failed to load wallet addresses');
      } finally {
        setLoading(false);
      }
    };

    fetchAssets();
  }, []);

  return { assets, loading, error };
};

const useDepositHistory = () => {
  const [deposits, setDeposits] = useState<DepositRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulated deposits history
    const mockDeposits: DepositRecord[] = [
      {
        id: '1',
        amount: 1004,
        cryptoType: 'BTC',
        status: 'completed',
        createdAt: new Date().toISOString(),
        transactionHash: 'abc123'
      }
    ];
    setDeposits(mockDeposits);
    setLoading(false);
  }, []);

  return { deposits, loading };
};

// Components
const CryptoIcon = ({ symbol, className = "" }: { symbol: string; className?: string }) => {
  const iconClass = `text-xl ${className}`;
  
  const icons: { [key: string]: React.ReactNode } = {
    BTC: <FaBitcoin className={`${iconClass} text-orange-500`} />,
    ETH: <FaEthereum className={`${iconClass} text-gray-600`} />,
    BNB: <SiBinance className={`${iconClass} text-yellow-500`} />,
    SOL: <SiSolana className={`${iconClass} text-purple-500`} />,
    USDT: <SiTether className={`${iconClass} text-emerald-500`} />,
    XRP: <SiRipple className={`${iconClass} text-blue-500`} />,
    LTC: <SiLitecoin className={`${iconClass} text-blue-400`} />
  };

  return icons[symbol.toUpperCase()] || <div className={`${iconClass} text-gray-500`} />;
};

const StatusBadge = ({ status }: { status: string }) => {
  const statusConfig = {
    completed: { color: 'bg-emerald-100 text-emerald-800 border-emerald-200', label: 'Completed' },
    confirmed: { color: 'bg-blue-100 text-blue-800 border-blue-200', label: 'Confirmed' },
    pending: { color: 'bg-amber-100 text-amber-800 border-amber-200', label: 'Pending' },
    failed: { color: 'bg-rose-100 text-rose-800 border-rose-200', label: 'Failed' }
  };

  const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;

  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${config.color}`}>
      {config.label}
    </span>
  );
};

const AmountInput = ({ 
  value, 
  onChange, 
  className = "" 
}: { 
  value: number;
  onChange: (amount: number) => void;
  className?: string;
}) => {
  const [customAmount, setCustomAmount] = useState(value > 0 ? value.toString() : '');
  const [isCustom, setIsCustom] = useState(false);

  const handleCustomAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    setCustomAmount(inputValue);
    
    const numValue = parseFloat(inputValue);
    if (!isNaN(numValue) && numValue >= MINIMUM_DEPOSIT) {
      onChange(numValue);
    }
  };

  const handleQuickAmountSelect = (amount: number) => {
    setCustomAmount('');
    setIsCustom(false);
    onChange(amount);
  };

  const handleCustomClick = () => {
    setIsCustom(true);
    if (value >= MINIMUM_DEPOSIT) {
      setCustomAmount(value.toString());
    }
  };

  const isAmountValid = value >= MINIMUM_DEPOSIT;

  return (
    <div className={className}>
      <label className="block text-sm font-semibold text-gray-700 mb-3">
        Deposit Amount (Minimum: ${MINIMUM_DEPOSIT})
      </label>
      
      {/* Quick Amount Buttons */}
      {!isCustom && (
        <div className="grid grid-cols-3 gap-3 mb-4">
          {[1004, 2500, 5000, 7500, 10000, 25000].map(amount => (
            <motion.button
              key={amount}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="button"
              onClick={() => handleQuickAmountSelect(amount)}
              className={`p-4 rounded-xl border-2 font-semibold transition-all ${
                value === amount && !isCustom
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
              }`}
            >
              ${amount.toLocaleString()}
            </motion.button>
          ))}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type="button"
            onClick={handleCustomClick}
            className="p-4 rounded-xl border-2 border-gray-200 bg-white text-gray-700 hover:border-gray-300 font-semibold col-span-3 flex items-center justify-center space-x-2"
          >
            <FaDollarSign className="text-sm" />
            <span>Custom Amount</span>
          </motion.button>
        </div>
      )}

      {/* Custom Amount Input */}
      {isCustom && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="space-y-3"
        >
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <FaDollarSign className="text-gray-400" />
            </div>
            <input
              type="number"
              value={customAmount}
              onChange={handleCustomAmountChange}
              placeholder={`Enter amount (minimum $${MINIMUM_DEPOSIT})`}
              className="w-full pl-10 pr-4 py-4 bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 text-lg font-semibold"
              min={MINIMUM_DEPOSIT}
              step="1"
            />
          </div>
          
          {/* Validation Message */}
          {customAmount && !isAmountValid && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-rose-600 text-sm font-medium"
            >
              Minimum deposit amount is ${MINIMUM_DEPOSIT}
            </motion.p>
          )}
          
          {isAmountValid && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-emerald-600 text-sm font-medium"
            >
              ✓ Amount meets minimum requirement
            </motion.p>
          )}

          <button
            type="button"
            onClick={() => {
              setIsCustom(false);
              setCustomAmount('');
              onChange(0);
            }}
            className="text-blue-600 hover:text-blue-700 text-sm font-medium transition-colors"
          >
            ← Back to quick amounts
          </button>
        </motion.div>
      )}

      {/* Selected Amount Display */}
      {value > 0 && !isCustom && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-center"
        >
          <p className="text-blue-800 font-semibold">
            Selected: <span className="text-lg">${value.toLocaleString()}</span>
          </p>
          <button
            type="button"
            onClick={handleCustomClick}
            className="text-blue-600 hover:text-blue-700 text-sm font-medium mt-2 transition-colors"
          >
            Change amount
          </button>
        </motion.div>
      )}
    </div>
  );
};

const DepositWizard = () => {
  const [currentStep, setCurrentStep] = useState<'select' | 'address' | 'confirm'>('select');
  const [formData, setFormData] = useState<DepositForm>({ amount: 0, cryptoType: '' });
  const [copiedAddress, setCopiedAddress] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { assets, loading: assetsLoading, error: assetsError } = useCryptoAssets();

  const selectedAsset = assets.find(asset => asset.symbol === formData.cryptoType);
  const isAmountValid = formData.amount >= MINIMUM_DEPOSIT;
  const canProceed = isAmountValid && formData.cryptoType;

  const handleAmountChange = (amount: number) => {
    setFormData(prev => ({ ...prev, amount }));
  };

  const handleCryptoSelect = (cryptoType: string) => {
    setFormData(prev => ({ ...prev, cryptoType }));
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedAddress(text);
      setTimeout(() => setCopiedAddress(''), 2000);
    } catch (err) {
      console.error('Failed to copy text:', err);
    }
  };

  const handleSubmit = async () => {
    if (!canProceed) return;

    setIsSubmitting(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsSubmitting(false);
    setCurrentStep('confirm');
  };

  if (currentStep === 'confirm') {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center py-12"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring" }}
          className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6"
        >
          <FaCheck className="text-emerald-600 text-3xl" />
        </motion.div>
        <h3 className="text-2xl font-bold text-gray-800 mb-2">Deposit Initiated!</h3>
        <p className="text-gray-600 mb-6 max-w-md mx-auto">
          Your deposit of <strong>${formData.amount.toLocaleString()}</strong> in {selectedAsset?.name} has been queued for processing.
        </p>
        <div className="bg-gray-50 rounded-xl p-4 mb-6 text-sm">
          <p className="text-gray-600">
            Transaction ID: <span className="font-mono">{Math.random().toString(36).substr(2, 9).toUpperCase()}</span>
          </p>
        </div>
        <button
          onClick={() => {
            setCurrentStep('select');
            setFormData({ amount: 0, cryptoType: '' });
          }}
          className="bg-blue-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors"
        >
          Make Another Deposit
        </button>
      </motion.div>
    );
  }

  if (currentStep === 'address') {
    return (
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="space-y-6"
      >
        <div className="flex items-center justify-between">
          <button
            onClick={() => setCurrentStep('select')}
            className="text-gray-500 hover:text-gray-700 transition-colors flex items-center space-x-2"
          >
            ← Back to selection
          </button>
          <h3 className="text-lg font-semibold">Send Crypto</h3>
          <div className="w-6" /> {/* Spacer for balance */}
        </div>

        {selectedAsset && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-6 border border-blue-200"
          >
            {/* Deposit Summary */}
            <div className="bg-white rounded-xl p-4 mb-6 border border-gray-200">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <CryptoIcon symbol={selectedAsset.symbol} />
                  <div>
                    <h4 className="font-semibold text-gray-800">{selectedAsset.name}</h4>
                    <p className="text-sm text-gray-600">{selectedAsset.network}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-gray-800">${formData.amount.toLocaleString()}</div>
                  <div className="text-sm text-gray-600">Amount</div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-semibold text-gray-700 mb-2 block">
                  Wallet Address
                </label>
                <div className="relative">
                  <code className="block p-4 bg-white rounded-xl border border-gray-300 text-sm break-all pr-20">
                    {selectedAsset.walletAddress}
                  </code>
                  <div className="absolute right-2 top-2 flex space-x-2">
                    <button
                      type="button"
                      onClick={() => copyToClipboard(selectedAsset.walletAddress)}
                      className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      {copiedAddress === selectedAsset.walletAddress ? (
                        <FaCheck className="text-emerald-600" />
                      ) : (
                        <FaCopy className="text-gray-600" />
                      )}
                    </button>
                    <button 
                      type="button"
                      className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      <FaQrcode className="text-gray-600" />
                    </button>
                  </div>
                </div>
                {copiedAddress === selectedAsset.walletAddress && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-emerald-600 text-sm mt-2 font-medium"
                  >
                    ✓ Copied to clipboard!
                  </motion.p>
                )}
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                <div className="flex items-start space-x-3">
                  <div className="text-amber-600 mt-0.5">⚠️</div>
                  <div className="text-sm">
                    <p className="font-semibold text-amber-800 mb-1">Important Instructions</p>
                    <ul className="text-amber-700 space-y-1">
                      <li>• Send only {selectedAsset.symbol} on {selectedAsset.network}</li>
                      <li>• Minimum deposit: {selectedAsset.minDeposit} {selectedAsset.symbol}</li>
                      <li>• Network fees are not included</li>
                      <li>• Transactions typically take 2-30 minutes</li>
                      <li>• Ensure you send exactly ${formData.amount.toLocaleString()} worth of {selectedAsset.symbol}</li>
                    </ul>
                  </div>
                </div>
              </div>

              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="w-full bg-blue-600 text-white py-4 rounded-xl font-semibold hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Processing...</span>
                  </>
                ) : (
                  <span>I&apos;ve Sent the Crypto</span>
                )}
              </button>
            </div>
          </motion.div>
        )}
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Amount Selection */}
      <AmountInput 
        value={formData.amount} 
        onChange={handleAmountChange}
      />

      {/* Crypto Selection */}
      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Choose Crypto</h3>
        {assetsLoading ? (
          <div className="flex flex-col items-center justify-center py-12 space-y-4">
            <FaSpinner className="w-8 h-8 text-blue-500 animate-spin" />
            <p className="text-gray-600 text-sm">Loading wallet addresses...</p>
          </div>
        ) : assetsError ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-rose-50 border border-rose-200 rounded-2xl p-6 text-center"
          >
            <FaExclamationTriangle className="text-rose-500 text-2xl mx-auto mb-3" />
            <h4 className="text-rose-800 font-semibold mb-2">Unable to Load Wallets</h4>
            <p className="text-rose-700 text-sm">{assetsError}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 bg-rose-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-rose-700 transition-colors"
            >
              Try Again
            </button>
          </motion.div>
        ) : assets.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">💸</div>
            <h3 className="text-xl font-semibold text-gray-600 mb-2">No Wallets Available</h3>
            <p className="text-gray-500">Please contact support for assistance</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {assets.map(asset => (
              <motion.button
                key={asset.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="button"
                onClick={() => handleCryptoSelect(asset.symbol)}
                className={`p-4 rounded-xl border-2 transition-all text-left ${
                  formData.cryptoType === asset.symbol
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 bg-white hover:border-blue-300'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <CryptoIcon symbol={asset.symbol} />
                  <div>
                    <div className="font-semibold text-gray-800">{asset.symbol}</div>
                    <div className="text-sm text-gray-600">{asset.name}</div>
                  </div>
                </div>
              </motion.button>
            ))}
          </div>
        )}
      </div>

      {/* Continue Button */}
      {canProceed && (
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          onClick={() => setCurrentStep('address')}
          className="w-full bg-blue-600 text-white py-4 rounded-xl font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
        >
          <span>Continue to Payment</span>
          <FaCheck className="text-sm" />
        </motion.button>
      )}
    </motion.div>
  );
};

const DepositHistory = () => {
  const { deposits, loading } = useDepositHistory();

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {deposits.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">💸</div>
          <h3 className="text-xl font-semibold text-gray-600 mb-2">No Deposits Yet</h3>
          <p className="text-gray-500">Make your first deposit to get started</p>
        </div>
      ) : (
        deposits.map(deposit => (
          <motion.div
            key={deposit.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl p-6 border border-gray-200 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-blue-100 rounded-xl">
                  <CryptoIcon symbol={deposit.cryptoType} />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800">Deposit</h4>
                  <p className="text-sm text-gray-600">
                    {new Date(deposit.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-xl font-bold text-gray-800 mb-1">
                  ${deposit.amount.toLocaleString()}
                </div>
                <StatusBadge status={deposit.status} />
              </div>
            </div>
          </motion.div>
        ))
      )}
    </div>
  );
};

export default function CryptoDepositPlatform() {
  const [activeView, setActiveView] = useState<'deposit' | 'history'>('deposit');

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-8 px-4">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            Crypto Deposit
          </h1>
          <p className="text-gray-600">Minimum deposit: <strong>${MINIMUM_DEPOSIT}</strong></p>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 gap-4 mb-8"
        >
          <div className="bg-white rounded-2xl p-4 border border-gray-200 text-center">
            <FaShieldAlt className="text-emerald-500 text-xl mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-800">100%</div>
            <div className="text-xs text-gray-600">Secure</div>
          </div>
          <div className="bg-white rounded-2xl p-4 border border-gray-200 text-center">
            <FaRocket className="text-blue-500 text-xl mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-800">Fast</div>
            <div className="text-xs text-gray-600">Processing</div>
          </div>
        </motion.div>

        {/* Navigation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white/80 backdrop-blur-sm rounded-2xl p-2 shadow-sm border border-gray-200 mb-8"
        >
          <div className="flex gap-2">
            {[
              { id: 'deposit', label: 'Make Deposit', icon: FaExchangeAlt },
              { id: 'history', label: 'History', icon: FaHistory }
            ].map(tab => (
              <motion.button
                key={tab.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setActiveView(tab.id as any)}
                className={`relative flex-1 px-4 py-3 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center space-x-2 ${
                  activeView === tab.id 
                    ? 'text-white' 
                    : 'text-gray-600 hover:text-blue-600'
                }`}
              >
                {activeView === tab.id && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
                <tab.icon className="relative z-10" />
                <span className="relative z-10 text-sm">{tab.label}</span>
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeView}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden"
          >
            <div className="p-6">
              {activeView === 'deposit' ? <DepositWizard /> : <DepositHistory />}
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Security Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-center mt-6"
        >
          <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
            <FaShieldAlt className="text-emerald-500" />
            <span>Bank-grade security • 24/7 monitoring • Insured funds</span>
          </div>
        </motion.div>
      </div>
    </div>
  );
}