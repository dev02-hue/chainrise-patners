/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { 
  FaBitcoin, 
  FaEthereum, 
  FaExchangeAlt,
  FaHistory,
  FaMoneyBillWave,
  FaChevronRight,
  FaQrcode,
  FaCopy,
  FaBars,
  FaTimes
} from 'react-icons/fa';
import { 
  SiBinance, 
  SiSolana, 
  SiTether,
  SiRipple,
  SiLitecoin
} from 'react-icons/si';

import { CryptoPaymentOption, Deposit, InvestmentPlan, DepositInput } from '@/types/businesses';
import { getCryptoPaymentOptions, getUserDeposits, initiateDeposit } from '@/lib/investmentplan';
import { getInvestmentPlans } from '@/lib/investment';

export default function InvestmentPlatform() {
  const [plans, setPlans] = useState<InvestmentPlan[]>([]);
  const [paymentOptions, setPaymentOptions] = useState<CryptoPaymentOption[]>([]);
  const [deposits, setDeposits] = useState<Deposit[]>([]);
  const [activeTab, setActiveTab] = useState('plans');
  const [loading, setLoading] = useState({
    plans: true,
    paymentOptions: true,
    deposits: true,
    form: false
  });
  const [error, setError] = useState({
    plans: '',
    paymentOptions: '',
    deposits: ''
  });
  const [formData, setFormData] = useState<DepositInput>({
    planId: '',
    amount: 0,
    cryptoType: '',
    transactionHash: ''
  });
  const [copiedAddress, setCopiedAddress] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Enhanced animations
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants: Variants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring" as const,
        stiffness: 100
      }
    }
  };

  const tabVariants: Variants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30
      } as any
    },
    exit: { 
      opacity: 0, 
      scale: 0.95,
      transition: {
        duration: 0.2
      } as any
    }
  };

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(prev => ({ ...prev, plans: true, paymentOptions: true, deposits: true }));

        const [
          { data: plansData, error: plansError },
          { data: paymentData, error: paymentError },
          { data: depositsData, error: depositsError }
        ] = await Promise.all([
          getInvestmentPlans(),
          getCryptoPaymentOptions(),
          getUserDeposits()
        ]);

        if (plansError) {
          setError(prev => ({ ...prev, plans: plansError }));
        } else {
          setPlans(plansData || []);
        }

        if (paymentError) {
          setError(prev => ({ ...prev, paymentOptions: paymentError }));
        } else {
          setPaymentOptions(paymentData || []);
        }

        if (depositsError) {
          setError(prev => ({ ...prev, deposits: depositsError }));
        } else {
          setDeposits(depositsData || []);
        }

      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred";
        setError({
          plans: errorMessage,
          paymentOptions: errorMessage,
          deposits: errorMessage
        });
      } finally {
        setLoading({
          plans: false,
          paymentOptions: false,
          deposits: false,
          form: false
        });
      }
    };
    fetchData();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name === 'amount') {
      setFormData(prev => ({ ...prev, [name]: parseFloat(value) || 0 }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(prev => ({ ...prev, form: true }));

    try {
      if (!formData.planId || formData.amount <= 0 || !formData.cryptoType) {
        throw new Error('Please fill in all required fields');
      }

      const { success, error } = await initiateDeposit({
        planId: formData.planId,
        amount: formData.amount,
        cryptoType: formData.cryptoType,
        transactionHash: formData.transactionHash || undefined
      });

      if (error) throw new Error(error);
      
      if (success) {
        const { data: newDeposits, error: depositsError } = await getUserDeposits();
        if (!depositsError) {
          setDeposits(newDeposits || []);
        }
        
        setFormData({
          planId: '',
          amount: 0,
          cryptoType: '',
          transactionHash: ''
        });
        setActiveTab('history');
        
        // Enhanced success notification
        alert('Deposit initiated successfully! Please wait for admin approval.');
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to initiate deposit");
    } finally {
      setLoading(prev => ({ ...prev, form: false }));
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedAddress(text);
    setTimeout(() => setCopiedAddress(''), 2000);
  };

  const selectedPlan = plans.find(plan => plan.id === formData.planId);
  const selectedCrypto = paymentOptions.find(option => option.symbol === formData.cryptoType);

  const getCryptoIcon = (symbol: string) => {
    const iconClass = "text-base sm:text-xl";
    switch (symbol.toUpperCase()) {
      case 'BTC': return <FaBitcoin className={`${iconClass} text-orange-500`} />;
      case 'ETH': return <FaEthereum className={`${iconClass} text-gray-400`} />;
      case 'BNB': return <SiBinance className={`${iconClass} text-yellow-500`} />;
      case 'SOL': return <SiSolana className={`${iconClass} text-purple-500`} />;
      case 'USDT': return <SiTether className={`${iconClass} text-green-500`} />;
      case 'XRP': return <SiRipple className={`${iconClass} text-blue-500`} />;
      case 'LTC': return <SiLitecoin className={`${iconClass} text-blue-400`} />;
      default: return <div className={`${iconClass} text-gray-500`} />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'confirmed': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'pending': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
      case 'failed': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatPlanDisplay = (plan: InvestmentPlan) => {
    return `${plan.title} ($${plan.min_amount}-${plan.max_amount ? `$${plan.max_amount}` : 'Unlimited'})`;
  };

  // Mobile menu toggle
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-blue-900 py-4 sm:py-8 px-3 sm:px-4">
      <div className="max-w-7xl mx-auto">
        {/* Enhanced Header */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8 sm:mb-12"
        >
          <h1 className="text-2xl xs:text-3xl sm:text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-3 sm:mb-4">
            Quantum Invest
          </h1>
          <p className="text-sm xs:text-base sm:text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto px-2">
            Professional cryptocurrency investment platform with institutional-grade security and returns
          </p>
        </motion.div>

        {/* Mobile Menu Button */}
        <div className="flex justify-center mb-6 sm:hidden">
          <button
            onClick={toggleMobileMenu}
            className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl p-3 shadow-lg border border-gray-200 dark:border-slate-700"
          >
            {isMobileMenuOpen ? <FaTimes /> : <FaBars />}
          </button>
        </div>

        {/* Enhanced Navigation Tabs */}
        <motion.div 
          className={`justify-center mb-8 sm:mb-12 ${isMobileMenuOpen ? 'flex' : 'hidden sm:flex'}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl p-2 shadow-lg border border-gray-200 dark:border-slate-700 w-full max-w-md sm:max-w-none">
            <div className="flex flex-col xs:flex-row space-y-2 xs:space-y-0 xs:space-x-1">
              {[
                { id: 'plans', label: 'Investment Plans', icon: FaMoneyBillWave },
                { id: 'deposit', label: 'Make Deposit', icon: FaExchangeAlt },
                { id: 'history', label: 'Transaction History', icon: FaHistory }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    setIsMobileMenuOpen(false);
                  }}
                  className={`relative px-4 xs:px-6 py-3 rounded-xl font-medium transition-all duration-300 flex items-center justify-center xs:justify-start space-x-2 ${
                    activeTab === tab.id 
                      ? 'text-white' 
                      : 'text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400'
                  }`}
                >
                  {activeTab === tab.id && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl"
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                  <tab.icon className="relative z-10 text-sm xs:text-base" />
                  <span className="relative z-10 text-sm xs:text-base whitespace-nowrap">{tab.label}</span>
                </button>
              ))}
            </div>
          </div>
        </motion.div>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            variants={tabVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-2xl sm:rounded-3xl shadow-xl sm:shadow-2xl border border-gray-200 dark:border-slate-700 overflow-hidden"
          >
            {/* Investment Plans Tab */}
            {activeTab === 'plans' && (
              <div className="p-4 sm:p-6 md:p-8">
                <motion.h2 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-xl xs:text-2xl sm:text-3xl font-bold text-gray-800 dark:text-white mb-6 sm:mb-8 text-center"
                >
                  Premium Investment Strategies
                </motion.h2>
                
                {loading.plans ? (
                  <div className="flex justify-center items-center h-48 sm:h-64">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="w-10 h-10 sm:w-12 sm:h-12 border-4 border-blue-500 border-t-transparent rounded-full"
                    />
                  </div>
                ) : error.plans ? (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl sm:rounded-2xl p-4 sm:p-6 text-center"
                  >
                    <div className="text-red-500 text-lg mb-2">⚠️</div>
                    <p className="text-red-700 dark:text-red-300 text-sm sm:text-base">{error.plans}</p>
                  </motion.div>
                ) : (
                  <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8"
                  >
                    {plans.map((plan ) => (
                      <motion.div
                        key={plan.id}
                        variants={itemVariants}
                        whileHover={{ 
                          y: -4,
                          transition: { type: "spring", stiffness: 300 }
                        }}
                        className="group relative bg-gradient-to-br from-white to-gray-50 dark:from-slate-800 dark:to-slate-700 rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 shadow-lg border border-gray-200 dark:border-slate-600 hover:shadow-xl sm:hover:shadow-2xl transition-all duration-300"
                      >
                        {/* Premium Badge */}
                        <div className="absolute -top-2 xs:-top-3 left-1/2 transform -translate-x-1/2">
                          <span className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-3 py-1 xs:px-4 xs:py-1 rounded-full text-xs xs:text-sm font-medium shadow-lg">
                            {plan.title}
                          </span>
                        </div>

                        <div className="text-center mb-4 sm:mb-6 pt-4 sm:pt-4">
                          <motion.div 
                            className="text-3xl xs:text-4xl sm:text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2"
                            whileInView={{ scale: [0.8, 1] }}
                            transition={{ type: "spring", stiffness: 200 }}
                          >
                            {plan.daily_profit_percentage}%
                          </motion.div>
                          <div className="text-gray-500 dark:text-gray-400 text-sm xs:text-base">Daily Return</div>
                        </div>

                        <div className="space-y-3 sm:space-y-4 mb-6 sm:mb-8">
                          <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-slate-600">
                            <span className="text-gray-600 dark:text-gray-300 text-sm xs:text-base">Investment Range</span>
                            <span className="font-semibold text-gray-800 dark:text-white text-sm xs:text-base">
                              ${plan.min_amount} - {plan.max_amount ? `$${plan.max_amount}` : '∞'}
                            </span>
                          </div>
                          <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-slate-600">
                            <span className="text-gray-600 dark:text-gray-300 text-sm xs:text-base">Duration</span>
                            <span className="font-semibold text-gray-800 dark:text-white text-sm xs:text-base">{plan.duration_days} Days</span>
                          </div>
                          <div className="flex justify-between items-center py-2">
                            <span className="text-gray-600 dark:text-gray-300 text-sm xs:text-base">Total Return</span>
                            <span className="font-semibold text-green-500 text-sm xs:text-base">{plan.total_return_percentage}%</span>
                          </div>
                        </div>

                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => {
                            setFormData(prev => ({ ...prev, planId: plan.id }));
                            setActiveTab('deposit');
                          }}
                          className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-semibold py-3 sm:py-4 px-4 sm:px-6 rounded-xl transition-all duration-300 flex items-center justify-center space-x-2 group text-sm xs:text-base"
                        >
                          <span>Start Investing</span>
                          <FaChevronRight className="transform group-hover:translate-x-1 transition-transform text-xs xs:text-sm" />
                        </motion.button>
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </div>
            )}

            {/* Deposit Form Tab */}
            {activeTab === 'deposit' && (
              <div className="p-4 sm:p-6 md:p-8">
                <motion.h2 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-xl xs:text-2xl sm:text-3xl font-bold text-gray-800 dark:text-white mb-6 sm:mb-8 text-center"
                >
                  Secure Deposit
                </motion.h2>
                
                <form onSubmit={handleSubmit} className="max-w-2xl mx-auto space-y-4 sm:space-y-6">
                  {/* Plan Selection */}
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-blue-200 dark:border-blue-800"
                  >
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                      Investment Plan
                    </label>
                    <select
                      name="planId"
                      value={formData.planId}
                      onChange={handleInputChange}
                      className="w-full p-3 sm:p-4 bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 text-sm sm:text-base"
                      required
                    >
                      <option value="">Select your investment strategy</option>
                      {plans.map(plan => (
                        <option key={plan.id} value={plan.id}>
                          {formatPlanDisplay(plan)}
                        </option>
                      ))}
                    </select>
                  </motion.div>

                  {/* Amount Input */}
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-purple-200 dark:border-purple-800"
                  >
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                      Investment Amount ($)
                    </label>
                    <input
                      type="number"
                      name="amount"
                      value={formData.amount || ''}
                      onChange={handleInputChange}
                      className="w-full p-3 sm:p-4 bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-300 text-sm sm:text-base"
                      min={selectedPlan?.min_amount || 0}
                      max={selectedPlan?.max_amount || 100000}
                      step="0.01"
                      required
                    />
                    {selectedPlan && (
                      <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-2">
                        Range: ${selectedPlan.min_amount} - ${selectedPlan.max_amount || 'Unlimited'}
                      </p>
                    )}
                  </motion.div>

                  {/* Crypto Selection */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-white dark:bg-slate-700 rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-gray-200 dark:border-slate-600"
                  >
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                      Payment Method
                    </label>
                    <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 gap-2 sm:gap-3 mb-4">
                      {paymentOptions.map((option) => (
                        <motion.button
                          key={option.id}
                          type="button"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => setFormData(prev => ({ ...prev, cryptoType: option.symbol }))}
                          className={`p-3 sm:p-4 rounded-lg sm:rounded-xl border-2 transition-all duration-300 flex flex-col items-center space-y-1 sm:space-y-2 ${
                            formData.cryptoType === option.symbol
                              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                              : 'border-gray-200 dark:border-slate-600 hover:border-gray-300'
                          }`}
                        >
                          {getCryptoIcon(option.symbol)}
                          <span className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">
                            {option.symbol}
                          </span>
                        </motion.button>
                      ))}
                    </div>
                  </motion.div>

                  {/* Crypto Address Display */}
                  {selectedCrypto && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-green-200 dark:border-green-800"
                    >
                      <div className="flex items-center justify-between mb-3 sm:mb-4">
                        <div className="flex items-center space-x-2 sm:space-x-3">
                          {getCryptoIcon(selectedCrypto.symbol)}
                          <div>
                            <h4 className="font-semibold text-gray-800 dark:text-white text-sm sm:text-base">{selectedCrypto.name}</h4>
                            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">{selectedCrypto.network} Network</p>
                          </div>
                        </div>
                        <div className="flex space-x-1 sm:space-x-2">
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => copyToClipboard(selectedCrypto.walletAddress)}
                            className="p-2 bg-white dark:bg-slate-700 rounded-lg border border-gray-200 dark:border-slate-600 hover:bg-gray-50 transition-colors"
                          >
                            <FaCopy className="text-gray-600 dark:text-gray-400 text-sm" />
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="p-2 bg-white dark:bg-slate-700 rounded-lg border border-gray-200 dark:border-slate-600 hover:bg-gray-50 transition-colors"
                          >
                            <FaQrcode className="text-gray-600 dark:text-gray-400 text-sm" />
                          </motion.button>
                        </div>
                      </div>
                      
                      <div className="space-y-2 sm:space-y-3">
                        <div>
                          <label className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">
                            Wallet Address
                          </label>
                          <div className="p-2 sm:p-3 bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-600">
                            <code className="text-xs sm:text-sm break-all text-gray-800 dark:text-gray-200">
                              {selectedCrypto.walletAddress}
                            </code>
                          </div>
                          {copiedAddress === selectedCrypto.walletAddress && (
                            <motion.p
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              className="text-green-500 text-xs sm:text-sm mt-1"
                            >
                              ✓ Copied to clipboard!
                            </motion.p>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                          ⚠️ Send only {selectedCrypto.symbol} to this address on the {selectedCrypto.network} network
                        </p>
                      </div>
                    </motion.div>
                  )}

                  {/* Transaction Hash */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                      Transaction Hash (Optional)
                    </label>
                    <input
                      type="text"
                      name="transactionHash"
                      value={formData.transactionHash}
                      onChange={handleInputChange}
                      placeholder="Enter your transaction hash for faster verification"
                      className="w-full p-3 sm:p-4 bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 text-sm sm:text-base"
                    />
                  </motion.div>

                  {/* Submit Button */}
                  <motion.button
                    type="submit"
                    disabled={loading.form}
                    whileHover={{ scale: loading.form ? 1 : 1.02 }}
                    whileTap={{ scale: loading.form ? 1 : 0.98 }}
                    className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold py-3 sm:py-4 px-4 sm:px-6 rounded-xl transition-all duration-300 flex items-center justify-center space-x-2 shadow-lg text-sm sm:text-base"
                  >
                    {loading.form ? (
                      <>
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white border-t-transparent rounded-full"
                        />
                        <span>Processing Deposit...</span>
                      </>
                    ) : (
                      <span>Confirm Deposit</span>
                    )}
                  </motion.button>
                </form>
              </div>
            )}

            {/* Deposit History Tab */}
            {activeTab === 'history' && (
              <div className="p-4 sm:p-6 md:p-8">
                <motion.h2 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-xl xs:text-2xl sm:text-3xl font-bold text-gray-800 dark:text-white mb-6 sm:mb-8 text-center"
                >
                  Transaction History
                </motion.h2>

                {loading.deposits ? (
                  <div className="flex justify-center items-center h-48 sm:h-64">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="w-10 h-10 sm:w-12 sm:h-12 border-4 border-blue-500 border-t-transparent rounded-full"
                    />
                  </div>
                ) : error.deposits ? (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl sm:rounded-2xl p-4 sm:p-6 text-center"
                  >
                    <div className="text-red-500 text-lg mb-2">⚠️</div>
                    <p className="text-red-700 dark:text-red-300 text-sm sm:text-base">{error.deposits}</p>
                  </motion.div>
                ) : deposits.length === 0 ? (
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center py-12 sm:py-16"
                  >
                    <div className="text-4xl sm:text-6xl mb-4">📊</div>
                    <h3 className="text-lg sm:text-xl font-semibold text-gray-600 dark:text-gray-400 mb-2">
                      No Transactions Yet
                    </h3>
                    <p className="text-gray-500 dark:text-gray-500 text-sm sm:text-base">
                      Start your investment journey by making your first deposit
                    </p>
                  </motion.div>
                ) : (
                  <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="space-y-3 sm:space-y-4"
                  >
                    {deposits.map((deposit, index) => (
                      <motion.div
                        key={deposit.id}
                        variants={itemVariants}
                        transition={{ delay: index * 0.1 }}
                        className="bg-white dark:bg-slate-700 rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-gray-200 dark:border-slate-600 hover:shadow-lg transition-all duration-300"
                      >
                        <div className="flex flex-col xs:flex-row xs:items-center justify-between space-y-3 xs:space-y-0">
                          <div className="flex items-center space-x-3">
                            <div className="p-2 sm:p-3 bg-blue-100 dark:bg-blue-900/20 rounded-lg sm:rounded-xl">
                              {getCryptoIcon(deposit.cryptoType)}
                            </div>
                            <div>
                              <h4 className="font-semibold text-gray-800 dark:text-white text-sm sm:text-base">
                                {deposit.planTitle || 'Investment Plan'}
                              </h4>
                              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                                {new Date(deposit.createdAt).toLocaleDateString('en-US', {
                                  year: 'numeric',
                                  month: 'short',
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </p>
                            </div>
                          </div>
                          
                          <div className="text-right">
                            <div className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-white mb-1">
                              ${deposit.amount.toFixed(2)}
                            </div>
                            <span className={`inline-flex items-center px-2 py-1 sm:px-3 sm:py-1 rounded-full text-xs sm:text-sm font-medium border ${getStatusColor(deposit.status)}`}>
                              {deposit.status.charAt(0).toUpperCase() + deposit.status.slice(1)}
                            </span>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}