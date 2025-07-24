'use client'

import { useRouter } from 'next/navigation'
 import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { signOut } from '@/lib/auth'

export default function SignOutButton() {
  const router = useRouter()
  const supabase = createClientComponentClient()

  const handleSignOut = async () => {
    try {
      // First call the server action to handle server-side sign out
      const result = await signOut()
      
      if (result.error) {
        console.error('Sign out error:', result.error)
        alert('Failed to sign out. Please try again.')
        return
      }

      // Then handle client-side sign out with Supabase
      const { error } = await supabase.auth.signOut()
      
      if (error) {
        console.error('Supabase sign out error:', error.message)
        alert('Failed to sign out. Please try again.')
        return
      }

      // Redirect to home page after successful sign out
      router.push('/')
      router.refresh() // Ensure the page updates with the new auth state

    } catch (err) {
      console.error('Unexpected sign out error:', err)
      alert('An unexpected error occurred during sign out.')
    }
  }

  return (
    <button
      onClick={handleSignOut}
      className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
    >
      Sign Out
    </button>
  )
}