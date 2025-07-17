'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { deleteCryptoAddress, getCryptoAddresses, updateCryptoAddress } from '@/lib/updateCryptoAddress'
 
type CryptoType = {
  key: 'btc_address' | 'bnb_address' | 'dodge_address' | 'eth_address' | 'solana_address' | 'usdttrc20_address'
  label: string
  placeholder: string
  icon: string
}

const CRYPTO_TYPES: CryptoType[] = [
  {
    key: 'btc_address',
    label: 'Bitcoin (BTC)',
    placeholder: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa',
    icon: '₿',
  },
  {
    key: 'eth_address',
    label: 'Ethereum (ETH)',
    placeholder: '0x71C7656EC7ab88b098defB751B7401B5f6d8976F',
    icon: '⟠',
  },
  {
    key: 'bnb_address',
    label: 'Binance Coin (BNB)',
    placeholder: 'bnb1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjxq4nd',
    icon: 'Ⓝ',
  },
  {
    key: 'solana_address',
    label: 'Solana (SOL)',
    placeholder: 'HN5XQ9Y6H8ZFi1uXJ3Q3XmZqJK3JZqJK3JZqJK3JZqJK',
    icon: '◎',
  },
  {
    key: 'usdttrc20_address',
    label: 'USDT (TRC20)',
    placeholder: 'TNPZJ8ZY1Xk3h1VY6bK1vSo1vY6bK1vSo',
    icon: '₮',
  },
  {
    key: 'dodge_address',
    label: 'Dogecoin (DOGE)',
    placeholder: 'D8vXg2Xk3h1VY6bK1vSo1vY6bK1vSo',
    icon: 'Ð',
  },
]

export default function CryptoAddressManager() {
  const [addresses, setAddresses] = useState<Record<string, string | null>>({})
  const [editing, setEditing] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    const loadAddresses = async () => {
      try {
        setIsLoading(true)
        const { data, error } = await getCryptoAddresses()
        
        if (error) throw new Error(error)
        if (data) {
          setAddresses(data)
          // Initialize editing state with current addresses
          const editState: Record<string, string> = {}
          CRYPTO_TYPES.forEach(crypto => {
            editState[crypto.key] = data[crypto.key] || ''
          })
          setEditing(editState)
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load addresses')
      } finally {
        setIsLoading(false)
      }
    }
    loadAddresses()
  }, [])

  const handleEditChange = (type: string, value: string) => {
    setEditing(prev => ({ ...prev, [type]: value }))
  }

  const handleSave = async (type: CryptoType['key']) => {
    try {
      setIsLoading(true)
      setError('')
      setSuccess('')

      const address = editing[type]
      
      if (address.trim() === '') {
        // If empty, delete the address
        const { error } = await deleteCryptoAddress({ type })
        if (error) throw new Error(error)
        
        setAddresses(prev => ({ ...prev, [type]: null }))
        setSuccess(`${CRYPTO_TYPES.find(c => c.key === type)?.label} address removed`)
      } else {
        // Update the address
        const { error } = await updateCryptoAddress({ type, address })
        if (error) throw new Error(error)
        
        setAddresses(prev => ({ ...prev, [type]: address }))
        setSuccess(`${CRYPTO_TYPES.find(c => c.key === type)?.label} address updated`)
      }

      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update address')
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent"></div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Crypto Addresses</h2>
        <p className="mt-2 text-gray-600">
          Manage your cryptocurrency wallet addresses for receiving payments
        </p>
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 p-4 text-red-700">
          <p>{error}</p>
        </div>
      )}

      {success && (
        <div className="rounded-lg bg-emerald-50 p-4 text-emerald-700">
          <p>{success}</p>
        </div>
      )}

      <div className="space-y-6">
        {CRYPTO_TYPES.map((crypto) => (
          <motion.div
            key={crypto.key}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-xl font-medium text-emerald-800">
                  {crypto.icon}
                </span>
                <div>
                  <h3 className="font-medium text-gray-900">{crypto.label}</h3>
                  {addresses[crypto.key] ? (
                    <p className="text-sm text-gray-500">
                      Current: <span className="font-mono">{addresses[crypto.key]}</span>
                    </p>
                  ) : (
                    <p className="text-sm text-gray-500">No address saved</p>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-4 flex flex-col space-y-3 sm:flex-row sm:space-x-3 sm:space-y-0">
              <input
                type="text"
                value={editing[crypto.key] || ''}
                onChange={(e) => handleEditChange(crypto.key, e.target.value)}
                placeholder={crypto.placeholder}
                className="flex-1 rounded-md border border-gray-300 px-4 py-2 focus:border-emerald-500 focus:ring-emerald-500"
              />
              <button
                type="button"
                onClick={() => handleSave(crypto.key)}
                disabled={isLoading || editing[crypto.key] === (addresses[crypto.key] || '')}
                className="inline-flex items-center justify-center rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 disabled:opacity-50"
              >
                {isLoading ? 'Saving...' : 'Save'}
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="rounded-lg bg-blue-50 p-4">
        <h3 className="text-sm font-medium text-blue-800">Security Note</h3>
        <p className="mt-1 text-sm text-blue-700">
          Always double-check wallet addresses before saving. Accilent will never ask you to send funds to these addresses.
        </p>
      </div>
    </div>
  )
}