'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  deleteCryptoAddress, 
  getCryptoAddresses, 
  updateCryptoAddress,
  updateMultipleCryptoAddresses,
 
} from '@/lib/updateCryptoAddress'

type CryptoAddressType = 'btc_address' | 'bnb_address' | 'dodge_address' | 'eth_address' | 'solana_address' | 'usdttrc20_address'

interface CryptoType {
  key: CryptoAddressType
  label: string
  placeholder: string
  icon: string
  description: string
  gradient: string
}

const CRYPTO_TYPES: CryptoType[] = [
  {
    key: 'btc_address',
    label: 'Bitcoin (BTC)',
    placeholder: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa',
    icon: '₿',
    description: 'Bitcoin wallet address',
    gradient: 'from-orange-500 to-yellow-500'
  },
  {
    key: 'eth_address',
    label: 'Ethereum (ETH)',
    placeholder: '0x71C7656EC7ab88b098defB751B7401B5f6d8976F',
    icon: '⟠',
    description: 'Ethereum wallet address',
    gradient: 'from-purple-600 to-blue-500'
  },
  {
    key: 'bnb_address',
    label: 'Binance Coin (BNB)',
    placeholder: 'bnb1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjxq4nd',
    icon: 'Ⓝ',
    description: 'BNB wallet address',
    gradient: 'from-yellow-400 to-amber-500'
  },
  {
    key: 'solana_address',
    label: 'Solana (SOL)',
    placeholder: 'HN5XQ9Y6H8ZFi1uXJ3Q3XmZqJK3JZqJK3JZqJK3JZqJK',
    icon: '◎',
    description: 'Solana wallet address',
    gradient: 'from-green-500 to-purple-600'
  },
  {
    key: 'usdttrc20_address',
    label: 'USDT (TRC20)',
    placeholder: 'TNPZJ8ZY1Xk3h1VY6bK1vSo1vY6bK1vSo',
    icon: '₮',
    description: 'USDT TRC20 wallet address',
    gradient: 'from-emerald-500 to-teal-600'
  },
  {
    key: 'dodge_address',
    label: 'Dogecoin (DOGE)',
    placeholder: 'D8vXg2Xk3h1VY6bK1vSo1vY6bK1vSo',
    icon: 'Ð',
    description: 'Dogecoin wallet address',
    gradient: 'from-amber-500 to-yellow-400'
  },
]

export default function CryptoAddressManager() {
  const [addresses, setAddresses] = useState<Record<CryptoAddressType, string | null>>({} as Record<CryptoAddressType, string | null>)
  const [editing, setEditing] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState<string | null>(null)
  const [isBulkEditing, setIsBulkEditing] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setIsLoading(true)
      const addressesResult = await getCryptoAddresses()

      if (addressesResult.data) {
        setAddresses(addressesResult.data)
        const editState: Record<string, string> = {}
        CRYPTO_TYPES.forEach(crypto => {
          editState[crypto.key] = addressesResult.data![crypto.key] || ''
        })
        setEditing(editState)
      }

      if (addressesResult.error) {
        throw new Error(addressesResult.error)
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data')
    } finally {
      setIsLoading(false)
    }
  }

  const handleEditChange = (type: CryptoAddressType, value: string) => {
    setEditing(prev => ({ ...prev, [type]: value }))
  }

  const handleSave = async (type: CryptoAddressType) => {
    try {
      setIsSaving(type)
      setError('')
      setSuccess('')

      const address = editing[type]?.trim() || ''

      if (address === '') {
        const { error } = await deleteCryptoAddress({ type })
        if (error) throw new Error(error)
        
        setAddresses(prev => ({ ...prev, [type]: null }))
        setSuccess(`${CRYPTO_TYPES.find(c => c.key === type)?.label} address removed`)
      } else {
        const { error } = await updateCryptoAddress({ type, address })
        if (error) throw new Error(error)
        
        setAddresses(prev => ({ ...prev, [type]: address }))
        setSuccess(`${CRYPTO_TYPES.find(c => c.key === type)?.label} address updated`)
      }

      setTimeout(() => setSuccess(''), 5000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update address')
    } finally {
      setIsSaving(null)
    }
  }

  const handleBulkSave = async () => {
    try {
      setIsSaving('bulk')
      setError('')
      setSuccess('')

      const updates: Partial<Record<CryptoAddressType, string>> = {}

      CRYPTO_TYPES.forEach(crypto => {
        const address = editing[crypto.key]?.trim() || ''
        if (address) {
          updates[crypto.key] = address
        }
      })

      const { error } = await updateMultipleCryptoAddresses(updates)
      if (error) throw new Error(error)

      setAddresses(prev => ({ ...prev, ...updates }))
      setSuccess('All addresses updated successfully')
      setIsBulkEditing(false)
      setTimeout(() => setSuccess(''), 5000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update addresses')
    } finally {
      setIsSaving(null)
    }
  }

  const handleCopyAddress = (address: string | null, type: string) => {
    if (!address) return
    
    navigator.clipboard.writeText(address)
    setSuccess(`${type} address copied to clipboard!`)
    setTimeout(() => setSuccess(''), 3000)
  }

  const hasChanges = (type: CryptoAddressType) => {
    return editing[type]?.trim() !== (addresses[type] || '')
  }

  const hasAnyChanges = () => {
    return CRYPTO_TYPES.some(crypto => hasChanges(crypto.key))
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
            Crypto Wallet Manager
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Manage all your cryptocurrency wallet addresses in one secure place
          </p>
          <div className="w-24 h-1 bg-gradient-to-r from-purple-500 to-emerald-500 mx-auto rounded-full"></div>
        </motion.div>

        {/* Control Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div className="p-3 rounded-2xl bg-white/80 backdrop-blur-sm border border-white/20 shadow-lg">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-emerald-400 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium text-gray-700">
                  {CRYPTO_TYPES.filter(crypto => addresses[crypto.key]).length} of {CRYPTO_TYPES.length} wallets configured
                </span>
              </div>
            </div>
          </div>
          
          <div className="flex space-x-3">
            {isBulkEditing ? (
              <>
                <button
                  onClick={() => setIsBulkEditing(false)}
                  className="inline-flex items-center rounded-2xl border border-gray-300 bg-white/80 backdrop-blur-sm px-6 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  Cancel
                </button>
                <button
                  onClick={handleBulkSave}
                  disabled={isSaving === 'bulk' || !hasAnyChanges()}
                  className="inline-flex items-center rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 px-6 py-3 text-sm font-medium text-white hover:from-emerald-600 hover:to-teal-700 disabled:opacity-50 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  {isSaving === 'bulk' ? 'Saving All...' : 'Save All Changes'}
                </button>
              </>
            ) : (
              <button
                onClick={() => setIsBulkEditing(true)}
                className="inline-flex items-center rounded-2xl bg-gradient-to-r from-blue-500 to-purple-600 px-6 py-3 text-sm font-medium text-white hover:from-blue-600 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                ✨ Bulk Edit Mode
              </button>
            )}
          </div>
        </div>

        {/* Status Messages */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="rounded-2xl bg-gradient-to-r from-red-500 to-pink-600 p-6 text-white shadow-xl"
            >
              <div className="flex items-center">
                <span className="mr-3 text-xl">⚠️</span>
                <p className="font-medium">{error}</p>
              </div>
            </motion.div>
          )}

          {success && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 p-6 text-white shadow-xl"
            >
              <div className="flex items-center">
                <span className="mr-3 text-xl">✅</span>
                <p className="font-medium">{success}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Crypto Addresses Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {CRYPTO_TYPES.map((crypto) => (
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
                      <p className="text-sm text-gray-600">{crypto.description}</p>
                    </div>
                  </div>

                  {!isBulkEditing && addresses[crypto.key] && (
                    <span className="inline-flex items-center rounded-full bg-gradient-to-r from-green-500 to-emerald-600 px-3 py-1 text-xs font-medium text-white shadow-lg">
                      ✅ Configured
                    </span>
                  )}
                </div>

                {/* Address Display */}
                {addresses[crypto.key] && !isBulkEditing && (
                  <div className="mb-4 p-3 rounded-xl bg-gray-50/80 border border-gray-200/50">
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-gray-600 font-mono truncate flex-1">
                        {addresses[crypto.key]}
                      </p>
                      <button
                        onClick={() => handleCopyAddress(addresses[crypto.key], crypto.label)}
                        className="ml-2 text-xs bg-gradient-to-r from-blue-500 to-purple-600 text-white px-2 py-1 rounded-lg hover:shadow-lg transition-all duration-200"
                      >
                        Copy
                      </button>
                    </div>
                  </div>
                )}

                {/* Input Field */}
                <div className="space-y-3">
                  <input
                    type="text"
                    value={editing[crypto.key] || ''}
                    onChange={(e) => handleEditChange(crypto.key, e.target.value)}
                    placeholder={crypto.placeholder}
                    disabled={isSaving !== null && isSaving !== crypto.key}
                    className="w-full rounded-xl border border-gray-300 bg-white/80 px-4 py-3 focus:border-transparent focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all duration-200 shadow-lg"
                  />

                  {!isBulkEditing && (
                    <div className="flex justify-between items-center">
                      <button
                        onClick={() => handleEditChange(crypto.key, '')}
                        disabled={!editing[crypto.key]}
                        className="text-sm text-gray-500 hover:text-gray-700 disabled:opacity-50 transition-colors duration-200"
                      >
                        🗑️ Clear
                      </button>
                      
                      <button
                        onClick={() => handleSave(crypto.key)}
                        disabled={
                          isSaving !== null || 
                          !hasChanges(crypto.key)
                        }
                        className="inline-flex items-center rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 px-4 py-2 text-sm font-medium text-white hover:from-emerald-600 hover:to-teal-700 disabled:opacity-50 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                      >
                        {isSaving === crypto.key ? (
                          <>
                            <div className="mr-2 h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                            Saving...
                          </>
                        ) : (
                          '💾 Save'
                        )}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Bulk Edit Notice */}
        {isBulkEditing && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="rounded-2xl bg-gradient-to-r from-blue-500 to-purple-600 p-6 text-white shadow-xl"
          >
            <div className="flex items-start">
              <span className="text-2xl mr-4">💡</span>
              <div>
                <h3 className="text-lg font-bold mb-2">Bulk Edit Mode Active</h3>
                <p className="opacity-90">
                  You&apos;re editing all wallet addresses simultaneously. Make your changes above and click &apos;Save All Changes&apos; when ready.
                </p>
              </div>
            </div>
          </motion.div>
        )}

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
                Always double-check wallet addresses before saving. Cryptocurrency transactions are irreversible. 
                Keep your private keys secure and never share them with anyone.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}