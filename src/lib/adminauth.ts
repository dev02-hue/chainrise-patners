'use server'

import { supabase } from '@/lib/supabaseClient'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

type AdminSignUpInput = {
  username: string
  email: string
  password: string
  confirmPassword: string
}

type AdminSignInInput = {
  emailOrUsername: string
  password: string
}

export async function adminSignUp({
  username,
  email,
  password,
  confirmPassword,
}: AdminSignUpInput): Promise<{ error?: string; success?: boolean }> {
  try {
    // 1. Validate input
    if (password !== confirmPassword) {
      return { error: 'Passwords do not match' }
    }
    if (password.length < 8) {
      return { error: 'Password must be at least 8 characters long' }
    }

    // 2. Check if username or email already exists in admin table
    const { data: existingAdmin, error: lookupError } = await supabase
      .from('admin_users')
      .select('username, email')
      .or(`username.eq.${username},email.eq.${email}`)

    if (lookupError) {
      console.error('Admin lookup error:', lookupError)
      return { error: 'Error checking existing admin users' }
    }

    if (existingAdmin && existingAdmin.length > 0) {
      if (existingAdmin.some(admin => admin.username === username)) {
        return { error: 'Username already taken' }
      }
      if (existingAdmin.some(admin => admin.email === email)) {
        return { error: 'Email already registered' }
      }
    }

    // 3. Create admin user in admin table
    const now = new Date().toISOString()
    const { data: adminData, error: adminError } = await supabase
      .from('admin_users')
      .insert([{
        username,
        email,
        password, // Note: In production, you should hash the password!
        created_at: now,
        updated_at: now,
      }])
      .select()
      .single()

    if (adminError) {
      console.error('Admin creation error:', adminError)
      return { error: 'Failed to create admin account: ' + adminError.message }
    }

    // 4. Set admin session
    const cookieStore = await cookies()
    const oneYear = 31536000 // 1 year in seconds

    cookieStore.set('admin-id', adminData.id, {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      maxAge: oneYear,
      path: '/',
      sameSite: 'lax',
    })

    cookieStore.set('admin-username', adminData.username, {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      maxAge: oneYear,
      path: '/',
      sameSite: 'lax',
    })

    cookieStore.set('admin-email', adminData.email, {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      maxAge: oneYear,
      path: '/',
      sameSite: 'lax',
    })

    cookieStore.set('admin-authenticated', 'true', {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      maxAge: oneYear,
      path: '/',
      sameSite: 'lax',
    })

    // 5. Return success - let the client handle redirect
    return { success: true }

  } catch (err) {
    console.error('Unexpected admin signup error:', err)
    return { error: 'An unexpected error occurred during admin signup' }
  }
}

export async function adminSignIn({ emailOrUsername, password }: AdminSignInInput): Promise<{ error?: string; success?: boolean }> {
  try {
    // 1. Validate input
    if (!emailOrUsername || !password) {
      return { error: 'Email/Username and password are required' }
    }

    // 2. Attempt authentication against admin table
    const { data: admin, error } = await supabase
      .from('admin_users')
      .select('*')
      .or(`email.eq.${emailOrUsername},username.eq.${emailOrUsername}`)
      .eq('password', password) // Note: In production, use hashed passwords!
      .single()

    if (error || !admin) {
      console.error('Admin authentication failed:', error)
      return { error: 'Invalid admin credentials' }
    }

    // 3. Set admin session cookies
    const cookieStore = await cookies()
    const oneYear = 31536000 // 1 year in seconds

    cookieStore.set('admin-id', admin.id, {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      maxAge: oneYear,
      path: '/',
      sameSite: 'lax',
    })

    cookieStore.set('admin-username', admin.username, {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      maxAge: oneYear,
      path: '/',
      sameSite: 'lax',
    })

    cookieStore.set('admin-email', admin.email, {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      maxAge: oneYear,
      path: '/',
      sameSite: 'lax',
    })

    cookieStore.set('admin-authenticated', 'true', {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      maxAge: oneYear,
      path: '/',
      sameSite: 'lax',
    })

    // 4. Return success - let the client handle redirect
    return { success: true }

  } catch (err) {
    console.error('Unexpected admin login error:', err)
    return { error: 'An unexpected error occurred during admin login' }
  }
}

export async function adminSignOut() {
  try {
    // Clear all admin auth cookies
    const cookieStore = await cookies()
    
    cookieStore.delete('admin-id')
    cookieStore.delete('admin-username')
    cookieStore.delete('admin-email')
    cookieStore.delete('admin-authenticated')

    // Redirect to admin login page
    redirect('/head')
  } catch (err) {
    console.error('Unexpected admin sign out error:', err)
    redirect('/head')
  }
}

export async function getAdminSession() {
  try {
    const cookieStore = await cookies()
    const adminId = cookieStore.get('admin-id')?.value
    const isAuthenticated = cookieStore.get('admin-authenticated')?.value

    if (!adminId || isAuthenticated !== 'true') {
      return { isAuthenticated: false, admin: null }
    }

    // Verify admin still exists in database
    const { data: admin, error } = await supabase
      .from('admin_users')
      .select('id, username, email')
      .eq('id', adminId)
      .single()

    if (error || !admin) {
      // Clear invalid session
      const cookieStore = await cookies()
      cookieStore.delete('admin-id')
      cookieStore.delete('admin-username')
      cookieStore.delete('admin-email')
      cookieStore.delete('admin-authenticated')
      return { isAuthenticated: false, admin: null }
    }

    return { 
      isAuthenticated: true, 
      admin: {
        id: admin.id,
        username: admin.username,
        email: admin.email
      }
    }
  } catch (err) {
    console.error('Error getting admin session:', err)
    return { isAuthenticated: false, admin: null }
  }
}

// Route protection function for server components
export async function requireAdminAuth() {
  const { isAuthenticated } = await getAdminSession()
  
  if (!isAuthenticated) {
    redirect('/head')
  }
}

// Function to check if user is authenticated (for client-side use)
export async function checkAdminAuth() {
  return await getAdminSession()
}