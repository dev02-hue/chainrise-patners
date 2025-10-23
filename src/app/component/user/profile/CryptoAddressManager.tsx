'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  deleteCryptoAddress, 
  getCryptoAddresses, 
  updateCryptoAddress,
  updateMultipleCryptoAddresses,
} from '@/lib/updateCryptoAddress'
import { FiCheck, FiCopy, FiEdit, FiSave, FiTrash2, FiAlertCircle, FiShield, FiRefreshCw } from 'react-icons/fi'

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
  const [copiedAddress, setCopiedAddress] = useState<string | null>(null)

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
    setCopiedAddress(address)
    setSuccess(`${type} address copied to clipboard!`)
    setTimeout(() => {
      setCopiedAddress(null)
      setSuccess('')
    }, 3000)
  }

  const hasChanges = (type: CryptoAddressType) => {
    return editing[type]?.trim() !== (addresses[type] || '')
  }

  const hasAnyChanges = () => {
    return CRYPTO_TYPES.some(crypto => hasChanges(crypto.key))
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

          {/* Skeleton Control Bar */}
          <div className="flex justify-between mb-8">
            <div className="h-12 w-48 bg-gray-200 rounded-2xl animate-pulse"></div>
            <div className="h-12 w-32 bg-gray-200 rounded-2xl animate-pulse"></div>
          </div>

          {/* Skeleton Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-2xl shadow-sm p-6 h-64 animate-pulse border"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gray-200 rounded-xl"></div>
                    <div>
                      <div className="h-4 w-24 bg-gray-200 rounded mb-2"></div>
                      <div className="h-3 w-32 bg-gray-200 rounded"></div>
                    </div>
                  </div>
                  <div className="w-20 h-6 bg-gray-200 rounded-full"></div>
                </div>
                <div className="h-24 bg-gray-200 rounded-xl mb-4"></div>
                <div className="h-10 bg-gray-200 rounded-lg"></div>
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
          className="mb-8"
        >
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
                Crypto Wallet Manager
              </h1>
              <p className="text-gray-600 text-lg">Manage all your cryptocurrency wallet addresses in one secure place</p>
            </div>
            
            {/* Quick Actions */}
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => setIsBulkEditing(!isBulkEditing)}
                className={`inline-flex items-center px-4 py-2 font-medium rounded-lg transition-colors duration-200 ${
                  isBulkEditing
                    ? 'bg-amber-600 hover:bg-amber-700 text-white'
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
              >
                <FiEdit className="mr-2" />
                {isBulkEditing ? 'Cancel Bulk Edit' : 'Bulk Edit'}
              </button>
              <button 
                onClick={loadData}
                className="inline-flex items-center px-4 py-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium rounded-lg transition-colors duration-200"
              >
                <FiRefreshCw className="mr-2" />
                Refresh
              </button>
            </div>
          </div>
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
                {CRYPTO_TYPES.filter(crypto => addresses[crypto.key]).length} of {CRYPTO_TYPES.length} wallets configured
              </span>
            </div>
          </div>
        </motion.div>

        {/* Status Messages */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="bg-gradient-to-r from-red-500 to-pink-600 rounded-2xl p-6 text-white shadow-lg mb-8"
            >
              <div className="flex items-center">
                <FiAlertCircle className="mr-3 text-xl" />
                <p className="font-medium">{error}</p>
              </div>
            </motion.div>
          )}

          {success && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="bg-gradient-to-r from-emerald-500 to-green-600 rounded-2xl p-6 text-white shadow-lg mb-8"
            >
              <div className="flex items-center">
                <FiCheck className="mr-3 text-xl" />
                <p className="font-medium">{success}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Bulk Edit Actions */}
        {isBulkEditing && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl p-6 text-white shadow-lg mb-8"
          >
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex items-center">
                <FiEdit className="mr-3 text-xl" />
                <div>
                  <h3 className="text-lg font-semibold">Bulk Edit Mode Active</h3>
                  <p className="text-blue-100 text-sm">
                    You&apos;re editing all wallet addresses simultaneously. Make your changes and save all at once.
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setIsBulkEditing(false)}
                  className="px-4 py-2 bg-white/20 text-white rounded-lg hover:bg-white/30 transition-colors duration-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleBulkSave}
                  disabled={isSaving === 'bulk' || !hasAnyChanges()}
                  className="inline-flex items-center px-6 py-2 bg-white text-blue-600 font-semibold rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors duration-200"
                >
                  {isSaving === 'bulk' ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="flex items-center"
                    >
                      <FiRefreshCw className="mr-2" />
                      Saving...
                    </motion.div>
                  ) : (
                    <>
                      <FiSave className="mr-2" />
                      Save All Changes
                    </>
                  )}
                </button>
              </div>
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
                        <p className="text-sm text-gray-500">{crypto.description}</p>
                      </div>
                    </div>

                    {!isBulkEditing && address && (
                      <span className="inline-flex items-center rounded-full bg-emerald-100 text-emerald-800 px-3 py-1 text-xs font-medium">
                        Configured
                      </span>
                    )}
                  </div>

                  {/* Address Display */}
                  {address && !isBulkEditing && (
                    <div className="mb-4 bg-gray-50 rounded-lg border border-gray-200 p-4">
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-gray-600 font-mono truncate flex-1">
                          {address}
                        </p>
                        <button
                          onClick={() => handleCopyAddress(address, crypto.label)}
                          className="ml-3 flex-shrink-0 inline-flex items-center justify-center w-8 h-8 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
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
                  )}

                  {/* Input Field */}
                  <div className="space-y-3">
                    <input
                      type="text"
                      value={editing[crypto.key] || ''}
                      onChange={(e) => handleEditChange(crypto.key, e.target.value)}
                      placeholder={crypto.placeholder}
                      disabled={isSaving !== null && isSaving !== crypto.key}
                      className="w-full rounded-lg border border-gray-300 bg-gray-50/50 px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    />

                    {!isBulkEditing && (
                      <div className="flex justify-between items-center">
                        <button
                          onClick={() => handleEditChange(crypto.key, '')}
                          disabled={!editing[crypto.key]}
                          className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 disabled:opacity-50 transition-colors duration-200"
                        >
                          <FiTrash2 className="mr-1" />
                          Clear
                        </button>
                        
                        <button
                          onClick={() => handleSave(crypto.key)}
                          disabled={isSaving !== null || !hasChanges(crypto.key)}
                          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors duration-200"
                        >
                          {isSaving === crypto.key ? (
                            <motion.div
                              animate={{ rotate: 360 }}
                              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                              className="flex items-center"
                            >
                              <FiRefreshCw className="mr-2" />
                              Saving...
                            </motion.div>
                          ) : (
                            <>
                              <FiSave className="mr-2" />
                              Save
                            </>
                          )}
                        </button>
                      </div>
                    )}
                  </div>
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
          className="bg-gradient-to-r from-blue-400 to-blue-600 rounded-2xl p-6 text-white shadow-lg"
        >
          <div className="flex items-start">
            <FiShield className="mr-4 text-xl mt-1 flex-shrink-0" />
            <div>
              <h3 className="text-lg font-semibold mb-2">Security First</h3>
              <p className="text-emerald-100 text-sm">
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