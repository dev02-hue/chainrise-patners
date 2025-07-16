'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { getProfileData, updateProfile } from '@/lib/getProfileData'
 
export default function ProfileSettings() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    username: '',
    phone: '',
  })
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data, error } = await getProfileData()
        if (error) throw new Error(error)
        if (data) {
          setForm({
            name: data.name,
            email: data.email,
            username: data.username,
            phone: data.phoneNumber,
          })
        }
      } catch (err) {
        console.log(err)
        setError('Failed to load profile data')
      } finally {
        setIsLoading(false)
      }
    }
    fetchProfile()
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError('')
    setSuccess('')

    try {
      const { error } = await updateProfile({
        name: form.name,
        username: form.username,
        phoneNumber: form.phone,
      })

      if (error) throw new Error(error)

      setSuccess('Profile updated successfully!')
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update profile')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-white to-emerald-50">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-emerald-50 px-4 py-10 md:px-8 lg:px-16">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mx-auto max-w-4xl rounded-xl border border-gray-200 bg-white p-8 shadow-sm"
      >
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900">Profile Settings</h2>
          <p className="mt-2 text-gray-600">
            Update your personal information and manage your account details
          </p>
        </div>

        {error && (
          <div className="mb-6 rounded-lg bg-red-50 p-4 text-red-700">
            <p>{error}</p>
          </div>
        )}

        {success && (
          <div className="mb-6 rounded-lg bg-emerald-50 p-4 text-emerald-700">
            <p>{success}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <label htmlFor="name" className="mb-2 block text-sm font-medium text-gray-700">
                Full Name
              </label>
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                type="text"
                id="name"
                className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-gray-900 focus:border-emerald-500 focus:ring-emerald-500"
                required
              />
            </div>

            <div>
              <label htmlFor="username" className="mb-2 block text-sm font-medium text-gray-700">
                Username
              </label>
              <input
                name="username"
                value={form.username}
                onChange={handleChange}
                type="text"
                id="username"
                className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-gray-900 focus:border-emerald-500 focus:ring-emerald-500"
                required
              />
            </div>

            <div>
              <label htmlFor="phone" className="mb-2 block text-sm font-medium text-gray-700">
                Phone Number
              </label>
              <input
                name="phone"
                value={form.phone}
                onChange={handleChange}
                type="tel"
                id="phone"
                className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-gray-900 focus:border-emerald-500 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label htmlFor="email" className="mb-2 block text-sm font-medium text-gray-700">
                Email Address
              </label>
              <input
                name="email"
                value={form.email}
                type="email"
                id="email"
                className="block w-full rounded-lg border border-gray-300 bg-gray-100 p-2.5 text-gray-500 focus:border-gray-300 focus:ring-gray-300"
                disabled
              />
              <p className="mt-1 text-xs text-gray-500">
                Contact support if you need to change your email
              </p>
            </div>
          </div>

          <div className="flex items-center justify-end pt-6">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center justify-center rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-emerald-700 focus:outline-none focus:ring-4 focus:ring-emerald-300 disabled:opacity-70"
            >
              {isSubmitting ? (
                <>
                  <svg
                    className="mr-2 h-4 w-4 animate-spin text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}