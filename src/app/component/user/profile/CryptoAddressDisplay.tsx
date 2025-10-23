'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { getCryptoAddresses } from '@/lib/updateCryptoAddress'
import { HiCheck } from 'react-icons/hi'
import { FaRegCopy } from 'react-icons/fa'

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

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 p-4">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-4 py-8"
        >
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 via-blue-600 to-emerald-600 bg-clip-text text-transparent">
            Your Crypto Wallets
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            View and manage your cryptocurrency wallet addresses for receiving payments
          </p>
          <div className="w-24 h-1 bg-gradient-to-r from-purple-500 to-emerald-500 mx-auto rounded-full"></div>
        </motion.div>

        {/* Stats Bar */}
        <div className="flex justify-center">
          <div className="p-4 rounded-2xl bg-white/80 backdrop-blur-sm border border-white/20 shadow-lg">
            <div className="flex items-center space-x-4">
              <div className="w-3 h-3 bg-emerald-400 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-gray-700">
                {Object.values(addresses).filter(Boolean).length} of {CRYPTO_TYPES.length} wallets configured
              </span>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="rounded-2xl bg-gradient-to-r from-red-500 to-pink-600 p-6 text-white shadow-xl"
          >
            <div className="flex items-center">
              <span className="mr-3 text-xl">⚠️</span>
              <p className="font-medium">{error}</p>
            </div>
          </motion.div>
        )}

        {/* Crypto Addresses Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {CRYPTO_TYPES.map((crypto) => {
            const address = addresses[crypto.key]
            const isCopied = copiedAddress === address

            return (
              <motion.div
                key={crypto.key}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="group relative"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white to-gray-50 rounded-3xl transform group-hover:scale-105 transition-all duration-300 shadow-xl"></div>
                <div className="relative rounded-3xl border border-white/50 bg-white/30 backdrop-blur-sm p-6 shadow-2xl">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-4">
                      <div className={`flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-r ${crypto.gradient} text-white text-xl font-bold shadow-lg`}>
                        {crypto.icon}
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900 text-lg">{crypto.label}</h3>
                        <p className="text-sm text-gray-600">
                          {address ? 'Address configured' : 'No address saved'}
                        </p>
                      </div>
                    </div>

                    {address && (
                      <span className="inline-flex items-center rounded-full bg-gradient-to-r from-green-500 to-emerald-600 px-3 py-1 text-xs font-medium text-white shadow-lg">
                        ✅ Ready
                      </span>
                    )}
                  </div>

                  {/* Address Display */}
                  {address && (
                    <div className="mt-4 space-y-3">
                      <div className="rounded-xl bg-gray-50/80 border border-gray-200/50 p-4">
                        <div className="flex items-center justify-between">
                          <p className="text-sm text-gray-600 font-mono truncate flex-1">
                            {address}
                          </p>
                          <button
                            onClick={() => copyToClipboard(address)}
                            className="ml-3 flex-shrink-0 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 p-2 text-white hover:shadow-lg transition-all duration-200 transform hover:scale-105"
                            aria-label="Copy address"
                          >
                            {isCopied ? (
                              <HiCheck className="h-4 w-4" />
                            ) : (
                              <FaRegCopy className="h-4 w-4" />
                            )}
                          </button>
                        </div>
                      </div>
                      <p className="text-xs text-gray-500 text-center">
                        {isCopied ? '✓ Copied to clipboard!' : 'Click the copy button to copy this address'}
                      </p>
                    </div>
                  )}

                  {/* Empty State */}
                  {!address && (
                    <div className="mt-4 rounded-xl bg-gradient-to-r from-gray-100 to-gray-200/50 border border-gray-200/30 p-6 text-center">
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
        </div>

        {/* Security Notice */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-2xl bg-gradient-to-r from-green-300 to-green-800 p-6 text-white shadow-xl"
        >
          <div className="flex items-start">
            <span className="text-2xl mr-4">🔒</span>
            <div>
              <h3 className="text-lg font-bold mb-2">Security First</h3>
              <p className="opacity-90">
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