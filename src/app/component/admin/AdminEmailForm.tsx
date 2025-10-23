'use client'

import { sendAdminEmail } from '@/lib/auth'
import { useState } from 'react'
 
interface AdminEmailFormProps {
  onEmailSent?: () => void
}

export default function AdminEmailForm({ onEmailSent }: AdminEmailFormProps) {
  const [formData, setFormData] = useState({
    recipientEmail: '',
    subject: '',
    message: ''
  })
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{
    success?: boolean
    error?: string
    message?: string
  } | null>(null)

  console.log('🔍 AdminEmailForm rendered with state:', { formData, loading, result });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    console.log(`🔍 Form field changed: ${name} = ${value}`);
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    console.log('🔍 Form submitted with data:', formData);
    
    setLoading(true)
    setResult(null)
    console.log('🔍 Loading state set to true');

    try {
      console.log('🔍 Calling sendAdminEmail function...');
      const response = await sendAdminEmail(formData)
      console.log('🔍 sendAdminEmail response:', response);
      
      setResult(response)
      console.log('🔍 Result state updated:', response);
      
      if (response.success) {
        console.log('🔍 Email sent successfully, clearing form...');
        setFormData({ recipientEmail: '', subject: '', message: '' })
        console.log('🔍 Form cleared, calling onEmailSent callback...');
        onEmailSent?.()
      } else {
        console.log('🔍 Email failed with error:', response.error);
      }
    } catch (error) {
      console.error('💥 Error in handleSubmit:', error);
      if (error instanceof Error) {
        console.error('💥 Error details:', {
          name: error.name,
          message: error.message,
          stack: error.stack
        });
        setResult({ error: error.message })
      } else {
        console.error('💥 Non-Error thrown:', error);
        setResult({ error: 'An unexpected error occurred' })
      }
    } finally {
      console.log('🔍 Setting loading state to false');
      setLoading(false)
    }
  }

  console.log('🔍 Rendering form component...');

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Send Email to User</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="recipientEmail" className="block text-sm font-medium text-gray-700 mb-1">
            Recipient Email
          </label>
          <input
            type="email"
            id="recipientEmail"
            name="recipientEmail"
            value={formData.recipientEmail}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            placeholder="Enter user's email address"
            onFocus={() => console.log('🔍 Recipient email input focused')}
            onBlur={() => console.log('🔍 Recipient email input blurred')}
          />
        </div>

        <div>
          <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">
            Subject
          </label>
          <input
            type="text"
            id="subject"
            name="subject"
            value={formData.subject}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            placeholder="Enter email subject"
            onFocus={() => console.log('🔍 Subject input focused')}
            onBlur={() => console.log('🔍 Subject input blurred')}
          />
        </div>

        <div>
          <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
            Message
          </label>
          <textarea
            id="message"
            name="message"
            value={formData.message}
            onChange={handleChange}
            required
            rows={6}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent resize-vertical"
            placeholder="Enter your message to the user..."
            onFocus={() => console.log('🔍 Message textarea focused')}
            onBlur={() => console.log('🔍 Message textarea blurred')}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          onClick={() => console.log('🔍 Send button clicked')}
          onMouseEnter={() => console.log('🔍 Send button hovered')}
        >
          {loading ? 'Sending...' : 'Send Email'}
        </button>
      </form>

      {result && (
        <div className={`mt-4 p-4 rounded-md ${
          result.success 
            ? 'bg-green-50 border border-green-200 text-green-800'
            : 'bg-red-50 border border-red-200 text-red-800'
        }`}>
          {result.success ? (
            <p className="flex items-center">
              <span className="mr-2">✓</span>
              {result.message}
            </p>
          ) : (
            <p className="flex items-center">
              <span className="mr-2">⚠</span>
              {result.error}
            </p>
          )}
        </div>
      )}
    </div>
  )
}