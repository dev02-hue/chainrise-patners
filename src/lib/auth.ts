'use server'

import { supabase } from '@/lib/supabaseClient'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { v4 as uuidv4 } from 'uuid'
import nodemailer from 'nodemailer'
import { processReferralBonus } from './referral'
import { redirect } from 'next/navigation'
import { AdminEmailResponse, EmailInput } from '@/types/businesses'

type SignUpInput = {
  name: string
  email: string
  username: string
  phoneNumber: string
  password: string
  confirmPassword: string
  referralCode?: string
  btcAddress?: string
  bnbAddress?: string
  dodgeAddress?: string
  ethAddress?: string
  solanaAddress?: string
  usdttrc20Address?: string
}

const SIGNUP_BONUS_AMOUNT = 5;

type SignInInput = {
  emailOrUsername: string
  password: string
}

type ResetPasswordInput = {
  email: string
}

type ConfirmResetPasswordInput = {
  token: string
  newPassword: string
  confirmNewPassword: string
}

function generateReferralCode(length = 8): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export async function signUp({
  name,
  email,
  username,
  phoneNumber,
  password,
  confirmPassword,
  referralCode,
  btcAddress,
  bnbAddress,
  dodgeAddress,
  ethAddress,
  solanaAddress,
  usdttrc20Address,
}: SignUpInput) {
  try {
    // 1. Validate input
    if (password !== confirmPassword) {
      return { error: 'Passwords do not match' }
    }
    if (password.length < 8) {
      return { error: 'Password must be at least 8 characters long' }
    }

    // 2. Check if username, email or phone already exists
    const { data: existingUser, error: lookupError } = await supabase
      .from('chainrise_profile')
      .select('username, email, phone_number, referral_code')
      .or(`username.eq.${username},email.eq.${email},phone_number.eq.${phoneNumber}`)

    if (lookupError) {
      console.error('User lookup error:', lookupError)
      return { error: 'Error checking existing users' }
    }

    if (existingUser && existingUser.length > 0) {
      if (existingUser.some(user => user.username === username)) {
        return { error: 'Username already taken' }
      }
      if (existingUser.some(user => user.email === email)) {
        return { error: 'Email already registered' }
      }
      if (existingUser.some(user => user.phone_number === phoneNumber)) {
        return { error: 'Phone number already registered' }
      }
    }

    // 2b. Validate referral code if provided
    let referredByUserId: string | null = null;
    if (referralCode) {
      const { data: referrerData, error: referrerError } = await supabase
        .from('chainrise_profile')
        .select('id')
        .eq('referral_code', referralCode)
        .single();

      if (referrerError || !referrerData) {
        return { error: 'Invalid referral code' };
      }
      referredByUserId = referrerData.id;
    }

    // 3. Generate a unique referral code for the new user
    let referralCodeForNewUser = generateReferralCode();
    let isCodeUnique = false;
    let attempts = 0;
    const maxAttempts = 5;

    // Ensure the generated code is unique
    while (!isCodeUnique && attempts < maxAttempts) {
      attempts++;
      const { data: existingCode } = await supabase
        .from('chainrise_profile')
        .select('referral_code')
        .eq('referral_code', referralCodeForNewUser)
        .single();

      if (!existingCode) {
        isCodeUnique = true;
      } else {
        referralCodeForNewUser = generateReferralCode();
      }
    }

    if (!isCodeUnique) {
      return { error: 'Failed to generate unique referral code. Please try again.' };
    }

    // 4. Create user in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
          username,
          phone_number: phoneNumber,
        },
        emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
      },
    })

    if (authError || !authData?.user) {
      console.error('Auth error:', authError)
      return { error: authError?.message || 'Signup failed' }
    }

    const userId = authData.user.id

    // 5. Create user profile with referral data and wallet addresses
    const now = new Date().toISOString()
    const { error: profileError } = await supabase.from('chainrise_profile').insert([{
      id: userId,
      name,
      username,
      email,
      phone_number: phoneNumber,
      referral_code: referralCodeForNewUser,
      referred_by: referredByUserId,
      btc_address: btcAddress || null,
      bnb_address: bnbAddress || null,
      dodge_address: dodgeAddress || null,
      eth_address: ethAddress || null,
      solana_address: solanaAddress || null,
      usdttrc20_address: usdttrc20Address || null,
      created_at: now,
      updated_at: now,
    }])

    if (profileError) {
      await supabase.auth.admin.deleteUser(userId)
      return { error: 'Failed to create profile: ' + profileError.message }
    }

    // 6. Update referrer's stats if applicable
    if (referredByUserId) {
      // Update referrer's stats
      await supabase.rpc('increment_chainrise_referral_count', {
        user_id: referredByUserId
      }).then(({ error }) => {
        if (error) {
          console.error('Failed to update referrer stats:', error);
        }
      });

      // Process signup bonus
      const bonusResult = await processReferralBonus(userId, SIGNUP_BONUS_AMOUNT);
      
      if (bonusResult.error) {
        console.error('Referral bonus processing failed:', bonusResult.error);
      }
    }

    // 7. Send welcome email (with referral code and wallet info)
    try {
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_USERNAME,
          pass: process.env.EMAIL_PASSWORD,
        },
      })

      const walletInfo = [
        btcAddress && `BTC: ${btcAddress}`,
        ethAddress && `ETH: ${ethAddress}`,
        bnbAddress && `BNB: ${bnbAddress}`,
        solanaAddress && `SOL: ${solanaAddress}`,
        dodgeAddress && `DOGE: ${dodgeAddress}`,
        usdttrc20Address && `USDT-TRC20: ${usdttrc20Address}`
      ].filter(Boolean).join('<br>');

      const mailOptions = {
        from: process.env.EMAIL_FROM,
        to: email,
        subject: 'Welcome to ChainRise-Partners - Confirm Your Email',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #059669;">Welcome to ChainRise-Partners!</h2>
            <p>Hello <strong>${name}</strong>,</p>
            <p>Thank you for registering with ChainRise-Partners!</p>
            
            <div style="background: #f8fafc; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #059669; margin-top: 0;">Your Account Details:</h3>
              <p><strong>Username:</strong> ${username}</p>
              <p><strong>Referral Code:</strong> <code style="background: #e2e8f0; padding: 2px 6px; border-radius: 4px;">${referralCodeForNewUser}</code></p>
              <p>Share your referral code with friends to earn rewards!</p>
            </div>

            ${walletInfo ? `
            <div style="background: #f0fdf4; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #059669; margin-top: 0;">Your Wallet Addresses:</h3>
              <p>${walletInfo}</p>
            </div>
            ` : ''}

            <p>Please click the link below to verify your email address:</p>
            <p style="text-align: center; margin: 25px 0;">
              <a href="${process.env.NEXT_PUBLIC_SITE_URL}/auth/confirm-email?token=${authData.session?.access_token}" 
                 style="background: #059669; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                Verify Email Address
              </a>
            </p>
            
            <p style="color: #64748b; font-size: 14px;">
              If you didn't create this account, please contact our support team immediately.
            </p>
            
            <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 25px 0;">
            <p style="color: #64748b; font-size: 12px;">
              ChainRise-Partners - Secure Crypto Investment Platform
            </p>
          </div>
        `,
      }

      await transporter.sendMail(mailOptions)
    } catch (emailError) {
      console.error('Failed to send welcome email:', emailError)
      // Not critical, so we continue
    }

    return {
      user: authData.user,
      session: authData.session,
      message: 'Signup successful! Please check your email for confirmation.',
      referralCode: referralCodeForNewUser,
      wasReferred: !!referredByUserId,
      signupBonus: referredByUserId ? SIGNUP_BONUS_AMOUNT : 0
    }
  } catch (err) {
    console.error('Unexpected signup error:', err)
    return { error: 'An unexpected error occurred during signup' }
  }
}

export async function signIn({ emailOrUsername, password }: SignInInput) {
  try {
    // 1. Validate input
    if (!emailOrUsername || !password) {
      return { error: 'Email/Username and password are required' }
    }

    // 2. Determine if input is email or username
    const isEmail = emailOrUsername.includes('@')
    let email = emailOrUsername
    
    if (!isEmail) {
      // Lookup email by username
      const { data: profile, error: profileError } = await supabase
        .from('chainrise_profile')
        .select('email, is_admin')
        .eq('username', emailOrUsername)
        .single()

      if (profileError || !profile) {
        return { error: 'Invalid username or password' }
      }
      email = profile.email
    }

    // 3. Attempt authentication
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      console.error('Authentication failed:', error.message)
      return { error: 'Invalid credentials' }
    }

    // 4. Get user profile to check admin status
    const { data: userProfile, error: profileError } = await supabase
      .from('chainrise_profile')
      .select('id, username, is_admin, name, email')
      .eq('id', data.user?.id)
      .single()

    if (profileError || !userProfile) {
      console.error('Profile fetch error:', profileError)
      return { error: 'Failed to load user profile' }
    }

    // 5. Handle session
    const sessionToken = data.session?.access_token
    const refreshToken = data.session?.refresh_token
    const userId = data.user?.id
    const isAdmin = userProfile.is_admin

    if (!sessionToken || !refreshToken || !userId) {
      console.error('Incomplete session data')
      return { error: 'Failed to create session' }
    }

    // 6. Set cookies with unique names based on user type
    const cookieStore = await cookies()
    const oneYear = 31536000 // 1 year in seconds

    // Common auth cookies
    cookieStore.set('sb-access-token', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: oneYear,
      path: '/',
      sameSite: 'lax',
    })

    cookieStore.set('sb-refresh-token', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: oneYear,
      path: '/',
      sameSite: 'lax',
    })

    cookieStore.set('user-id', userId, {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      maxAge: oneYear,
      path: '/',
      sameSite: 'lax',
    })

    // User-specific cookies
    cookieStore.set('user-username', userProfile.username, {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      maxAge: oneYear,
      path: '/',
      sameSite: 'lax',
    })

    cookieStore.set('user-name', userProfile.name || '', {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      maxAge: oneYear,
      path: '/',
      sameSite: 'lax',
    })

    cookieStore.set('user-email', userProfile.email, {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      maxAge: oneYear,
      path: '/',
      sameSite: 'lax',
    })

    // Admin-specific cookie (only set if user is admin)
    if (isAdmin) {
      cookieStore.set('user-is-admin', 'true', {
        httpOnly: false,
        secure: process.env.NODE_ENV === 'production',
        maxAge: oneYear,
        path: '/',
        sameSite: 'lax',
      })
    } else {
      // Ensure admin cookie is cleared for regular users
      cookieStore.delete('user-is-admin')
    }

    // Set authentication status
    cookieStore.set('user-authenticated', 'true', {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      maxAge: oneYear,
      path: '/',
      sameSite: 'lax',
    })

    return {
      user: data.user,
      session: data.session,
      isAdmin: isAdmin,
      message: 'Login successful',
      redirectTo: isAdmin ? '/deri' : '/user/dashboard'
    }
  } catch (err) {
    console.error('Unexpected login error:', err)
    return { error: 'An unexpected error occurred' }
  }
}

// Add these to your existing userauth.ts file

// Helper function to check if user is admin
export async function isUserAdmin(): Promise<boolean> {
  try {
    const cookieStore = await cookies();
    const isAdmin = cookieStore.get('user-is-admin')?.value;
    return isAdmin === 'true';
  } catch (err) {
    console.error('Error checking admin status:', err);
    return false;
  }
}

// Helper function to get user session
export async function getUserSession() {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get('user-id')?.value;
    const isAuthenticated = cookieStore.get('user-authenticated')?.value;
    const isAdmin = cookieStore.get('user-is-admin')?.value === 'true';

    if (!userId || isAuthenticated !== 'true') {
      return { isAuthenticated: false, user: null, isAdmin: false };
    }

    return {
      isAuthenticated: true,
      isAdmin,
      user: {
        id: userId,
        username: cookieStore.get('user-username')?.value,
        name: cookieStore.get('user-name')?.value,
        email: cookieStore.get('user-email')?.value,
      }
    };
  } catch (err) {
    console.error('Error getting user session:', err);
    return { isAuthenticated: false, user: null, isAdmin: false };
  }
}

// Route protection for admin routes
export async function requireAdminAuth() {
  const { isAuthenticated, isAdmin } = await getUserSession();
  
  if (!isAuthenticated) {
    redirect('/signin');
  }
  
  if (!isAdmin) {
    redirect('/user/dashboard');
  }
}

// Route protection for user routes
export async function requireUserAuth() {
  const { isAuthenticated } = await getUserSession();
  
  if (!isAuthenticated) {
    redirect('/signin');
  }
}


export async function resetPassword({ email }: ResetPasswordInput) {
  try {
    // 1. Validate input
    if (!email) {
      return { error: 'Email is required' }
    }

    // 2. Find user by email
    const { data: user, error: userError } = await supabase
      .from('chainrise_profile')
      .select('id, name')
      .eq('email', email)
      .single()

    if (userError || !user) {
      return { error: 'No account found with this email' }
    }

    // 3. Generate reset token
    const token = uuidv4()
    const expiresAt = new Date(Date.now() + 3600000) // 1 hour from now

    // 4. Store token in database
    const { error: tokenError } = await supabase
      .from('chainrise_password_reset_tokens')
      .insert({
        user_id: user.id,
        token,
        expires_at: expiresAt.toISOString(),
      })

    if (tokenError) {
      console.error('Failed to store reset token:', tokenError)
      return { error: 'Failed to generate reset link' }
    }

    // 5. Send email with reset link
    try {
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_USERNAME,
          pass: process.env.EMAIL_PASSWORD,
        },
      })

      const resetLink = `${process.env.NEXT_PUBLIC_SITE_URL}/auth/reset-password?token=${token}`

      const mailOptions = {
        from: process.env.EMAIL_FROM,
        to: email,
        subject: 'ChainRise-Partners - Password Reset Request',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #059669;">Password Reset Request</h2>
            <p>Hello <strong>${user.name}</strong>,</p>
            <p>We received a request to reset your ChainRise-Partners account password.</p>
            
            <p style="text-align: center; margin: 25px 0;">
              <a href="${resetLink}" 
                 style="background: #059669; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                Reset Your Password
              </a>
            </p>
            
            <p style="color: #64748b;">This link will expire in 1 hour.</p>
            <p>If you didn't request this, please ignore this email and ensure your account is secure.</p>
            
            <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 25px 0;">
            <p style="color: #64748b; font-size: 12px;">
              ChainRise-Partners Security Team
            </p>
          </div>
        `,
      }

      await transporter.sendMail(mailOptions)
    } catch (emailError) {
      console.error('Failed to send reset email:', emailError)
      return { error: 'Failed to send reset link' }
    }

    return { 
      success: true, 
      message: 'Password reset link sent to your email',
    }
  } catch (err) {
    console.error('Unexpected error in resetPassword:', err)
    return { error: 'An unexpected error occurred. Please try again.' }
  }
}

export async function confirmResetPassword({
  token,
  newPassword,
  confirmNewPassword,
}: ConfirmResetPasswordInput) {
  try {
    // 1. Validate input
    if (!token || !newPassword || !confirmNewPassword) {
      return { error: 'All fields are required' }
    }
    if (newPassword !== confirmNewPassword) {
      return { error: 'Passwords do not match' }
    }
    if (newPassword.length < 8) {
      return { error: 'Password must be at least 8 characters long' }
    }

    // 2. Verify token
    const { data: tokenRecord, error: tokenError } = await supabase
      .from('chainrise_password_reset_tokens')
      .select('*')
      .eq('token', token)
      .gt('expires_at', new Date().toISOString())
      .eq('used', false)
      .single()

    if (tokenError || !tokenRecord) {
      return { error: 'Invalid or expired reset link. Please request a new one.' }
    }

    // 3. Use admin client to reset password
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
      tokenRecord.user_id,
      { password: newPassword }
    )

    if (updateError) {
      console.error('Password update error:', updateError)
      return { error: 'Failed to update password. Please try again.' }
    }

    // 4. Mark token as used
    await supabase
      .from('chainrise_password_reset_tokens')
      .update({ used: true })
      .eq('id', tokenRecord.id)

    return {
      success: true,
      message: 'Password reset successfully! You can now log in with your new password.'
    }
  } catch (err) {
    console.error('Unexpected error in confirmResetPassword:', err)
    return { error: 'An unexpected error occurred. Please try again.' }
  }
}

export async function signOut() {
  try {
    // 1. Sign out from Supabase Auth
    const { error: authError } = await supabase.auth.signOut()
    
    if (authError) {
      console.error('Supabase sign out error:', authError.message)
      return { error: 'Failed to sign out from authentication service' }
    }

    // 2. Clear all auth-related cookies
    const cookieStore = await cookies()
    
    cookieStore.delete('sb-access-token')
    cookieStore.delete('sb-refresh-token')
    cookieStore.delete('user_id')
    cookieStore.delete('username')

    // 3. Return success
    return { success: true, message: 'Signed out successfully' }
  } catch (err) {
    console.error('Unexpected sign out error:', err)
    return { error: 'An unexpected error occurred during sign out' }
  }
}

export async function getSession() {
  try {
    const cookieStore = await cookies()
    const accessToken = cookieStore.get('sb-access-token')?.value
    const refreshToken = cookieStore.get('sb-refresh-token')?.value

    if (!accessToken || !refreshToken) {
      if (typeof window !== 'undefined') {
        window.location.href = '/signin';
      } else {
        redirect('/signin');
      }
      return { session: null, user: null }
    }

    const { data, error } = await supabase.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken,
    })

    if (error || !data.session) {
      return { session: null, user: null }
    }

    return { session: data.session, user: data.user }
  } catch (err) {
    console.error('Error getting session:', err)
    return { session: null, user: null }
  }
}


export async function sendAdminEmail({
  recipientEmail,
  subject,
  message,
}: EmailInput): Promise<AdminEmailResponse> {
  console.log('🔍 sendAdminEmail function called with:', { recipientEmail, subject, message });
  
  try {
    // 1. Verify admin privileges using the session
    console.log('🔍 Step 1: Checking session...');
    const { session } = await getSession()
    console.log('🔍 Session data:', session);
    
    if (!session?.user) {
      console.log('❌ No session or user found');
      return { error: 'Authentication required' }
    }
    console.log('✅ Session verified, user ID:', session.user.id);

    // 2. Check if user is admin
    console.log('🔍 Step 2: Checking admin privileges...');
    const { data: profile, error: profileError } = await supabase
      .from('chainrise_profile')
      .select('is_admin')
      .eq('id', session.user.id)
      .single()

    console.log('🔍 Profile query result:', { profile, profileError });
    
    if (profileError) {
      console.log('❌ Profile query error:', profileError);
      return { error: 'Admin privileges required' }
    }
    
    if (!profile?.is_admin) {
      console.log('❌ User is not admin. is_admin value:', profile?.is_admin);
      return { error: 'Admin privileges required' }
    }
    console.log('✅ Admin privileges verified');

    // 3. Validate recipient email exists in system
    console.log('🔍 Step 3: Validating recipient email...');
    const { data: recipientProfile, error: recipientError } = await supabase
      .from('chainrise_profile')
      .select('id, name')
      .eq('email', recipientEmail)
      .single()

    console.log('🔍 Recipient query result:', { recipientProfile, recipientError });
    
    if (recipientError) {
      console.log('❌ Recipient query error:', recipientError);
      return { error: 'Recipient email not found in system' }
    }
    
    if (!recipientProfile) {
      console.log('❌ No recipient profile found for email:', recipientEmail);
      return { error: 'Recipient email not found in system' }
    }
    console.log('✅ Recipient verified:', recipientProfile.name);

    // 4. Send email using nodemailer
    console.log('🔍 Step 4: Setting up email transporter...');
    console.log('🔍 Email username exists:', !!process.env.EMAIL_USERNAME);
    console.log('🔍 Email password exists:', !!process.env.EMAIL_PASSWORD);
    console.log('🔍 Email from exists:', !!process.env.EMAIL_FROM);
    
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
    })

    console.log('🔍 Creating mail options...');
    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: recipientEmail,
      subject: subject,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #059669;">ChainRise-Partners Admin Message</h2>
          <p>Hello <strong>${recipientProfile.name || 'Valued User'}</strong>,</p>
          
          <div style="background: #f8fafc; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #059669; margin-top: 0;">Message from Admin:</h3>
            <p style="white-space: pre-wrap;">${message}</p>
          </div>

          <p>If you have any questions, please contact our support team.</p>
          
          <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 25px 0;">
          <p style="color: #64748b; font-size: 12px;">
            ChainRise-Partners Admin Team
          </p>
        </div>
      `,
    }

    console.log('🔍 Attempting to send email...');
    const emailResult = await transporter.sendMail(mailOptions)
    console.log('✅ Email sent successfully:', emailResult);

    // 5. Log the email sent for audit purposes
    console.log('🔍 Step 5: Logging email to database...');
    const { error: logError } = await supabase
      .from('chainrise_email_logs')
      .insert({
        admin_id: session.user.id,
        recipient_email: recipientEmail,
        recipient_id: recipientProfile.id,
        subject: subject,
        message: message,
        sent_at: new Date().toISOString(),
      })

    if (logError) {
      console.error('❌ Failed to log email:', logError);
      console.log('⚠️  Email was sent but logging failed');
    } else {
      console.log('✅ Email logged successfully');
    }

    console.log('🎉 Email process completed successfully');
    return {
      success: true,
      message: 'Email sent successfully to ' + recipientEmail,
    }
  } catch (err) {
    console.error('💥 Unexpected error in sendAdminEmail:', err);
    const errorDetails = err instanceof Error
      ? { name: err.name, message: err.message, stack: err.stack }
      : { message: typeof err === 'string' ? err : JSON.stringify(err) };

    console.error('💥 Error details:', errorDetails);
    return { error: 'Failed to send email. Please try again.' }
  }
}