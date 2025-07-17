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
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Your Crypto Addresses</h2>
        <p className="mt-2 text-gray-600">
          Manage your cryptocurrency wallet addresses for receiving payments
        </p>
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 p-4 text-red-700">
          <p>{error}</p>
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        {CRYPTO_TYPES.map((crypto) => {
          const address = addresses[crypto.key]
          const isCopied = copiedAddress === address

          return (
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
                    <p className="text-sm text-gray-500">
                      {address ? 'Address saved' : 'No address saved'}
                    </p>
                  </div>
                </div>
              </div>

              {address && (
                <div className="mt-4">
                  <div className="flex items-center justify-between rounded-md bg-gray-50 p-3">
                    <p className="truncate font-mono text-sm text-gray-800">
                      {address}
                    </p>
                    <button
                      onClick={() => copyToClipboard(address)}
                      className="ml-2 rounded p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                      aria-label="Copy address"
                    >
                      {isCopied ? (
                        <HiCheck className="h-4 w-4 text-emerald-500" />
                      ) : (
                        <FaRegCopy className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  <p className="mt-1 text-xs text-gray-500">
                    Click the copy icon to copy this address
                  </p>
                </div>
              )}

              {!address && (
                <div className="mt-4 rounded-md bg-gray-50 p-3 text-center">
                  <p className="text-sm text-gray-500">
                    No {crypto.label} address saved yet
                  </p>
                </div>
              )}
            </motion.div>
          )
        })}
      </div>

      <div className="rounded-lg bg-blue-50 p-4">
        <h3 className="text-sm font-medium text-blue-800">Security Note</h3>
        <p className="mt-1 text-sm text-blue-700">
          Always verify wallet addresses before sending funds. Double-check the first and last few characters when copying.
        </p>
      </div>
    </div>
  )
}