'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaBitcoin, 
  FaEthereum, 
  FaDog, 
  FaExchangeAlt,
  FaHistory,
  FaMoneyBillWave,
  FaWallet
} from 'react-icons/fa';
import { 
  SiBinance, 
  SiSolana, 
  SiTether,
  SiRipple,
  SiLitecoin
} from 'react-icons/si';
import { 
  getInvestmentPlans, 
  getCryptoPaymentOptions, 
  initiateDeposit,
  getUserDeposits,
} from '@/lib/investmentplan';
import { CryptoPaymentOption, Deposit, InvestmentPlan } from '@/types/businesses';

export default function InvestmentComponent() {
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
  const [formData, setFormData] = useState({
    planId: '',
    amount: '',
    cryptoType: '',
    transactionHash: ''
  });

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [
          { data: plansData, error: plansError },
          { data: paymentData, error: paymentError },
          { data: depositsData, error: depositsError }
        ] = await Promise.all([
          getInvestmentPlans(),
          getCryptoPaymentOptions(),
          getUserDeposits()
        ]);

        if (plansError) throw new Error(plansError);
        if (paymentError) throw new Error(paymentError);
        if (depositsError) throw new Error(depositsError);

        setPlans(plansData || []);
        setPaymentOptions(paymentData || []);
        setDeposits(depositsData || []);
      } catch (err) {
        setError({
          plans: err instanceof Error ? err.message : "Failed to load plans",
          paymentOptions: err instanceof Error ? err.message : "Failed to load payment options",
          deposits: err instanceof Error ? err.message : "Failed to load deposits"
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
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(prev => ({ ...prev, form: true }));

    try {
      const { success, error } = await initiateDeposit({
        planId: Number(formData.planId),
        amount: Number(formData.amount),
        cryptoType: formData.cryptoType as 'BTC' | 'ETH' | 'BNB' | 'DOGE' | 'SOL' | 'USDT',
        transactionHash: formData.transactionHash
      });

      if (error) throw new Error(error);
      if (success) {
        // Refresh data
        const { data: newDeposits } = await getUserDeposits();
        setDeposits(newDeposits || []);
        setActiveTab('history');
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to initiate deposit");
    } finally {
      setLoading(prev => ({ ...prev, form: false }));
    }
  };

  const selectedPlan = plans.find(plan => plan.id === Number(formData.planId));
  const selectedCrypto = paymentOptions.find(option => option.symbol === formData.cryptoType);

  const getCryptoIcon = (symbol: string) => {
    switch (symbol) {
      case 'BTC': return <FaBitcoin className="text-yellow-500" />;
      case 'ETH': return <FaEthereum className="text-purple-500" />;
      case 'BNB': return <SiBinance className="text-yellow-600" />;
      case 'DOGE': return <FaDog className="text-orange-400" />;
      case 'SOL': return <SiSolana className="text-indigo-500" />;
      case 'USDT': return <SiTether className="text-green-500" />;
      case 'XRP': return <SiRipple className="text-blue-500" />;
      case 'LTC': return <SiLitecoin className="text-gray-400" />;
      default: return <FaWallet className="text-gray-500" />;
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-2 sm:px-4 md:px-6 py-4">
      <motion.h1 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-2xl sm:text-3xl font-bold text-center mb-6 bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent"
      >
        Investment Platform
      </motion.h1>

      {/* Navigation Tabs - Made responsive */}
      <div className="flex overflow-x-auto pb-1 mb-6 scrollbar-hide">
        <div className="flex space-x-1 min-w-max">
          <button
            onClick={() => setActiveTab('plans')}
            className={`px-3 py-2 text-sm sm:text-base sm:px-4 font-medium flex items-center whitespace-nowrap ${
              activeTab === 'plans' 
                ? 'border-b-2 border-green-500 text-green-600' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <FaMoneyBillWave className="mr-1 sm:mr-2" />
            Plans
          </button>
          <button
            onClick={() => setActiveTab('deposit')}
            className={`px-3 py-2 text-sm sm:text-base sm:px-4 font-medium flex items-center whitespace-nowrap ${
              activeTab === 'deposit' 
                ? 'border-b-2 border-green-500 text-green-600' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <FaExchangeAlt className="mr-1 sm:mr-2" />
            Deposit
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-3 py-2 text-sm sm:text-base sm:px-4 font-medium flex items-center whitespace-nowrap ${
              activeTab === 'history' 
                ? 'border-b-2 border-green-500 text-green-600' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <FaHistory className="mr-1 sm:mr-2" />
            History
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, x: activeTab === 'history' ? 50 : -50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: activeTab === 'history' ? -50 : 50 }}
          transition={{ duration: 0.3 }}
        >
          {/* Investment Plans Tab */}
          {activeTab === 'plans' && (
            <div>
              <h2 className="text-xl sm:text-2xl font-semibold mb-4 sm:mb-6">Available Investment Plans</h2>
              {loading.plans ? (
                <div className="flex justify-center items-center h-64">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
                </div>
              ) : error.plans ? (
                <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6">
                  <p>{error.plans}</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                  {plans.map((plan) => (
                    <motion.div
                      key={plan.id}
                      whileHover={{ y: -5 }}
                      className="border border-gray-200 dark:border-gray-700 rounded-lg sm:rounded-xl p-4 sm:p-6 shadow-sm hover:shadow-md transition-shadow"
                    >
                      <div className="flex justify-between items-start mb-3 sm:mb-4">
                        <h3 className="text-lg sm:text-xl font-bold">{plan.title}</h3>
                        <span className="bg-green-100 text-green-800 text-xs font-medium px-2 py-0.5 rounded-full">
                          {plan.durationDays} days
                        </span>
                      </div>
                      <div className="mb-3 sm:mb-4">
                        <p className="text-3xl sm:text-4xl font-bold text-green-600">{plan.percentage}%</p>
                        <p className="text-xs sm:text-sm text-gray-500">Daily Return</p>
                      </div>
                      <ul className="space-y-1 sm:space-y-2 text-xs sm:text-sm mb-4 sm:mb-6">
                        <li className="flex justify-between">
                          <span className="text-gray-500">Min:</span>
                          <span>${plan.minAmount}</span>
                        </li>
                        <li className="flex justify-between">
                          <span className="text-gray-500">Max:</span>
                          <span>${plan.maxAmount}</span>
                        </li>
                        <li className="flex justify-between">
                          <span className="text-gray-500">Referral:</span>
                          <span>10%</span>
                        </li>
                      </ul>
                      <button
                        onClick={() => {
                          setFormData(prev => ({ ...prev, planId: plan.id.toString() }));
                          setActiveTab('deposit');
                        }}
                        className="w-full bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg transition text-sm sm:text-base"
                      >
                        Invest Now
                      </button>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Deposit Form Tab */}
          {activeTab === 'deposit' && (
            <div>
              <h2 className="text-xl sm:text-2xl font-semibold mb-4 sm:mb-6">Make a Deposit</h2>
              <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
                <div>
                  <label htmlFor="planId" className="block text-sm font-medium mb-1 sm:mb-2">Select Investment Plan</label>
                  <select
                    id="planId"
                    name="planId"
                    value={formData.planId}
                    onChange={handleInputChange}
                    className="w-full p-2 sm:p-3 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    required
                  >
                    <option value="">-- Select Plan --</option>
                    {plans.map(plan => (
                      <option key={plan.id} value={plan.id}>
                        {plan.title} (${plan.minAmount}-${plan.maxAmount})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="amount" className="block text-sm font-medium mb-1 sm:mb-2">Amount ($)</label>
                  <input
                    type="number"
                    id="amount"
                    name="amount"
                    value={formData.amount}
                    onChange={handleInputChange}
                    className="w-full p-2 sm:p-3 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    min={selectedPlan?.minAmount || 0}
                    max={selectedPlan?.maxAmount || 100000}
                    step="0.01"
                    required
                  />
                  {selectedPlan && (
                    <p className="text-xs sm:text-sm text-gray-500 mt-1">
                      Must be between ${selectedPlan.minAmount} and ${selectedPlan.maxAmount}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="cryptoType" className="block text-sm font-medium mb-1 sm:mb-2">Payment Method</label>
                  <select
                    id="cryptoType"
                    name="cryptoType"
                    value={formData.cryptoType}
                    onChange={handleInputChange}
                    className="w-full p-2 sm:p-3 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    required
                  >
                    <option value="">-- Select Payment Method --</option>
                    {paymentOptions.map(option => (
                      <option key={option.id} value={option.symbol}>
                        {option.name} ({option.symbol})
                      </option>
                    ))}
                  </select>
                </div>

                {selectedCrypto && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="p-3 sm:p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
                  >
                    <div className="flex items-center mb-2">
                      <div className="mr-2 sm:mr-3 text-xl sm:text-2xl">
                        {getCryptoIcon(selectedCrypto.symbol)}
                      </div>
                      <div>
                        <h4 className="text-sm sm:text-base font-medium">{selectedCrypto.name}</h4>
                        <p className="text-xs sm:text-sm text-gray-500">{selectedCrypto.network} Network</p>
                      </div>
                    </div>
                    <div className="mt-2 sm:mt-3">
                      <p className="text-xs sm:text-sm font-medium mb-1">Wallet Address:</p>
                      <div className="p-2 text-xs sm:text-sm bg-gray-100 dark:bg-gray-700 rounded break-all">
                        {selectedCrypto.walletAddress}
                      </div>
                      <p className="text-xs text-gray-500 mt-1">Send only {selectedCrypto.symbol} to this address</p>
                    </div>
                  </motion.div>
                )}

                <div>
                  <label htmlFor="transactionHash" className="block text-sm font-medium mb-1 sm:mb-2">Transaction Hash (Optional)</label>
                  <input
                    type="text"
                    id="transactionHash"
                    name="transactionHash"
                    value={formData.transactionHash}
                    onChange={handleInputChange}
                    className="w-full p-2 sm:p-3 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    placeholder="Enter transaction hash if available"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading.form}
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2 sm:py-3 px-4 rounded-lg transition flex justify-center items-center text-sm sm:text-base"
                >
                  {loading.form ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 sm:h-5 sm:w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Processing...
                    </>
                  ) : (
                    'Submit Deposit'
                  )}
                </button>
              </form>
            </div>
          )}

          {/* Deposit History Tab */}
          {activeTab === 'history' && (
            <div>
              <h2 className="text-xl sm:text-2xl font-semibold mb-4 sm:mb-6">Your Deposit History</h2>
              {loading.deposits ? (
                <div className="flex justify-center items-center h-64">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
                </div>
              ) : error.deposits ? (
                <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6">
                  <p>{error.deposits}</p>
                </div>
              ) : deposits.length === 0 ? (
                <div className="text-center py-12">
                  <FaHistory className="mx-auto text-4xl text-gray-400 mb-4" />
                  <p className="text-gray-500">No deposit history found</p>
                </div>
              ) : (
                <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-800">
                      <tr>
                        <th className="px-3 py-2 sm:px-6 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Plan</th>
                        <th className="px-3 py-2 sm:px-6 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                        <th className="px-3 py-2 sm:px-6 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Method</th>
                        <th className="px-3 py-2 sm:px-6 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-3 py-2 sm:px-6 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                      {deposits.map((deposit) => (
                        <motion.tr
                          key={deposit.id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ duration: 0.3 }}
                          className="hover:bg-gray-50 dark:hover:bg-gray-800"
                        >
                          <td className="px-3 py-3 sm:px-6 sm:py-4 whitespace-nowrap">
                            <div className="text-sm sm:text-base">{deposit.planTitle || 'N/A'}</div>
                          </td>
                          <td className="px-3 py-3 sm:px-6 sm:py-4 whitespace-nowrap">
                            <div className="text-sm sm:text-base">${deposit.amount.toFixed(2)}</div>
                          </td>
                          <td className="px-3 py-3 sm:px-6 sm:py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 mr-1 sm:mr-2">
                                {getCryptoIcon(deposit.cryptoType)}
                              </div>
                              <span className="text-sm sm:text-base">{deposit.cryptoType}</span>
                            </div>
                          </td>
                          <td className="px-3 py-3 sm:px-6 sm:py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              deposit.status === 'completed' ? 'bg-green-100 text-green-800' :
                              deposit.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {deposit.status}
                            </span>
                          </td>
                          <td className="px-3 py-3 sm:px-6 sm:py-4 whitespace-nowrap">
                            <div className="text-xs sm:text-sm text-gray-500">
                              {new Date(deposit.createdAt).toLocaleDateString()}
                            </div>
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}