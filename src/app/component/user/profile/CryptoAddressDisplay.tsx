'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { getCryptoAddresses } from '@/lib/updateCryptoAddress'
import { FiCheck, FiCopy, FiAlertCircle, FiShield } from 'react-icons/fi'

type CryptoType = {
  key: 'btc_address' | 'bnb_address' | 'dodge_address' | 'eth_address' | 'solana_address' | 'usdttrc20_address'
  label: string
  placeholder: string
  icon: string
  gradient: string
}

const CRYPTO_TYPES: CryptoType[] = [
  {
    key: 'btc_address',
    label: 'Bitcoin (BTC)',
    placeholder: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa',
    icon: '₿',
    gradient: 'from-orange-500 to-yellow-500'
  },
  {
    key: 'eth_address',
    label: 'Ethereum (ETH)',
    placeholder: '0x71C7656EC7ab88b098defB751B7401B5f6d8976F',
    icon: '⟠',
    gradient: 'from-purple-600 to-blue-500'
  },
  {
    key: 'bnb_address',
    label: 'Binance Coin (BNB)',
    placeholder: 'bnb1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjxq4nd',
    icon: 'Ⓝ',
    gradient: 'from-yellow-400 to-amber-500'
  },
  {
    key: 'solana_address',
    label: 'Solana (SOL)',
    placeholder: 'HN5XQ9Y6H8ZFi1uXJ3Q3XmZqJK3JZqJK3JZqJK3JZqJK',
    icon: '◎',
    gradient: 'from-green-500 to-purple-600'
  },
  {
    key: 'usdttrc20_address',
    label: 'USDT (TRC20)',
    placeholder: 'TNPZJ8ZY1Xk3h1VY6bK1vSo1vY6bK1vSo',
    icon: '₮',
    gradient: 'from-emerald-500 to-teal-600'
  },
  {
    key: 'dodge_address',
    label: 'Dogecoin (DOGE)',
    placeholder: 'D8vXg2Xk3h1VY6bK1vSo1vY6bK1vSo',
    icon: 'Ð',
    gradient: 'from-amber-500 to-yellow-400'
  },
]

export default function CryptoAddressDisplay() {
  const [addresses, setAddresses] = useState<Record<string, string | null>>({})
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [copiedAddress, setCopiedAddress] = useState<string | null>(null)

  useEffect(() => {
    const loadAddresses = async () => {
      try {
        setIsLoading(true)
        const { data, error } = await getCryptoAddresses()
        
        if (error) throw new Error(error)
        if (data) {
          setAddresses(data)
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load addresses')
      } finally {
        setIsLoading(false)
      }
    }
    loadAddresses()
  }, [])

  const copyToClipboard = (address: string) => {
    navigator.clipboard.writeText(address)
    setCopiedAddress(address)
    setTimeout(() => setCopiedAddress(null), 2000)
  }

  // Loading State
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Skeleton Header */}
          <div className="mb-8 text-center">
            <div className="h-8 w-64 bg-gray-200 rounded-lg animate-pulse mx-auto mb-2"></div>
            <div className="h-4 w-96 bg-gray-200 rounded animate-pulse mx-auto"></div>
          </div>

          {/* Skeleton Stats */}
          <div className="flex justify-center mb-8">
            <div className="h-12 w-48 bg-gray-200 rounded-2xl animate-pulse"></div>
          </div>

          {/* Skeleton Cards Grid */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-2xl shadow-sm p-6 h-48 animate-pulse border"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gray-200 rounded-xl"></div>
                    <div>
                      <div className="h-4 w-24 bg-gray-200 rounded mb-2"></div>
                      <div className="h-3 w-32 bg-gray-200 rounded"></div>
                    </div>
                  </div>
                  <div className="w-16 h-6 bg-gray-200 rounded-full"></div>
                </div>
                <div className="h-20 bg-gray-200 rounded-xl"></div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-8 text-center"
        >
          <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
            Your Crypto Wallets
          </h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            View and manage your cryptocurrency wallet addresses for receiving payments
          </p>
        </motion.div>

        {/* Stats Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-center mb-8"
        >
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 px-6 py-4">
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-emerald-400 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-gray-700">
                {Object.values(addresses).filter(Boolean).length} of {CRYPTO_TYPES.length} wallets configured
              </span>
            </div>
          </div>
        </motion.div>

        {/* Error Message */}
        {error && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gradient-to-r from-red-500 to-pink-600 rounded-2xl p-6 text-white shadow-lg mb-8"
          >
            <div className="flex items-center">
              <FiAlertCircle className="mr-3 text-xl" />
              <p className="font-medium">{error}</p>
            </div>
          </motion.div>
        )}

        {/* Crypto Addresses Grid */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={{
            visible: {
              transition: {
                staggerChildren: 0.1
              }
            }
          }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8"
        >
          {CRYPTO_TYPES.map((crypto) => {
            const address = addresses[crypto.key]
            const isCopied = copiedAddress === address
            const cardVariants = {
              hidden: { opacity: 0, y: 20 },
              visible: { opacity: 1, y: 0 }
            }

            return (
              <motion.div
                key={crypto.key}
                variants={cardVariants}
                transition={{ duration: 0.3, type: "spring", stiffness: 100 }}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all duration-300 hover:translate-y-[-2px]"
              >
                <div className="p-6">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-4">
                      <div className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-r ${crypto.gradient} text-white text-lg font-bold shadow-sm`}>
                        {crypto.icon}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{crypto.label}</h3>
                        <p className="text-sm text-gray-500">
                          {address ? 'Address configured' : 'No address saved'}
                        </p>
                      </div>
                    </div>

                    {address && (
                      <span className="inline-flex items-center rounded-full bg-emerald-100 text-emerald-800 px-3 py-1 text-xs font-medium">
                        Ready
                      </span>
                    )}
                  </div>

                  {/* Address Display */}
                  {address && (
                    <div className="mt-4 space-y-3">
                      <div className="bg-gray-50 rounded-lg border border-gray-200 p-4">
                        <div className="flex items-center justify-between">
                          <p className="text-sm text-gray-600 font-mono truncate flex-1">
                            {address}
                          </p>
                          <button
                            onClick={() => copyToClipboard(address)}
                            className="ml-3 flex-shrink-0 inline-flex items-center justify-center w-10 h-10 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
                            aria-label="Copy address"
                          >
                            <AnimatePresence mode="wait" initial={false}>
                              {isCopied ? (
                                <motion.span
                                  key="check"
                                  initial={{ opacity: 0, scale: 0.8 }}
                                  animate={{ opacity: 1, scale: 1 }}
                                  exit={{ opacity: 0, scale: 0.8 }}
                                >
                                  <FiCheck className="h-4 w-4" />
                                </motion.span>
                              ) : (
                                <motion.span
                                  key="copy"
                                  initial={{ opacity: 0, scale: 0.8 }}
                                  animate={{ opacity: 1, scale: 1 }}
                                  exit={{ opacity: 0, scale: 0.8 }}
                                >
                                  <FiCopy className="h-4 w-4" />
                                </motion.span>
                              )}
                            </AnimatePresence>
                          </button>
                        </div>
                      </div>
                      <p className="text-xs text-gray-500 text-center">
                        {isCopied ? '✓ Copied to clipboard!' : 'Click to copy address'}
                      </p>
                    </div>
                  )}

                  {/* Empty State */}
                  {!address && (
                    <div className="mt-4 bg-gray-50 rounded-lg border border-gray-200 p-6 text-center">
                      <div className="text-gray-400 text-2xl mb-2">💳</div>
                      <p className="text-sm text-gray-600 font-medium">
                        No {crypto.label} address saved
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Add your wallet address to receive payments
                      </p>
                    </div>
                  )}
                </div>
              </motion.div>
            )
          })}
        </motion.div>

        {/* Security Notice */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-r from-blu2-400 to-blue-600 rounded-2xl p-6 text-white shadow-lg"
        >
          <div className="flex items-start">
            <FiShield className="mr-4 text-xl mt-1 flex-shrink-0" />
            <div>
              <h3 className="text-lg font-semibold mb-2">Security First</h3>
              <p className="text-emerald-100 text-sm">
                Always verify wallet addresses before sending funds. Double-check the first and last few characters when copying. 
                Never share your private keys or recovery phrases with anyone.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}