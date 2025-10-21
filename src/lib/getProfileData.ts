/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";
import nodemailer from "nodemailer";
import { cookies } from "next/headers"
import { supabase } from "./supabaseClient"
import { getSession } from "./auth"
import { Deposit, DepositStatus, Profile, UpdateProfileInput, UpdateUserProfileInput, Withdrawal, WithdrawalStatus } from "@/types/businesses";
import { redirect } from "next/navigation";

// Add this type definition near your other type definitions
type ProfileData = {
  name: string
  username: string
  email: string
  balance?: number
  phoneNumber: string
  btcAddress?: string
  bnbAddress?: string
  dodgeAddress?: string
  ethAddress?: string
  solanaAddress?: string
  usdttrc20Address?: string
  referralCode?: string
}

export async function updateUserProfile(input: UpdateUserProfileInput): Promise<{ success: boolean; error?: string }> {
  try {
    const { session } = await getSession();
    if (!session?.user) {
      if (typeof window !== 'undefined') {
        window.location.href = '/signin';
      } else {
        redirect('/signin');
      }
      return { success: false, error: 'Not authenticated' };
    }

    const { id, name, username, email, phoneNumber, balance } = input;

    const { error } = await supabase
      .from('chainrise_profile')
      .update({
        name,
        username,
        email,
        phone_number: phoneNumber,
        balance,
        updated_at: new Date().toISOString() 
      })
      .eq('id', id);

    if (error) {
      console.error('Error updating user profile:', error);
      return { success: false, error: 'Failed to update profile' };
    }

    return { success: true };
  } catch (err) {
    console.error('Unexpected error in updateUserProfile:', err);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

export async function getAllProfiles(): Promise<{ data?: Profile[]; error?: string }> {
  try {
    // 1. Ensure user is authenticated
    const { session } = await getSession();
    if (!session?.user) {
      if (typeof window !== 'undefined') {
        window.location.href = '/signin';
      } else {
        redirect('/signin');
      }
      return { error: 'Not authenticated' };
    }

    // 2. Fetch all profiles with wallet addresses
    const { data: profiles, error } = await supabase
      .from('chainrise_profile')
      .select(`
        id, 
        name, 
        username, 
        email, 
        phone_number, 
        balance,
        total_earnings,
        total_invested,
        btc_address,
        bnb_address,
        dodge_address,
        eth_address,
        solana_address,
        usdttrc20_address,
        referral_code,
        referred_by,
        is_verified,
        is_active,
        last_login,
        created_at,
        updated_at
      `);

    if (error || !profiles) {
      console.error('Error fetching all profiles:', error);
      return { error: 'Failed to fetch profiles' };
    }

    // 3. Return formatted profiles
    const formatted = profiles.map(profile => ({
      id: profile.id,
      name: profile.name,
      username: profile.username,
      email: profile.email,
      balance: profile.balance || 0,
      totalEarnings: profile.total_earnings || 0,
      totalInvested: profile.total_invested || 0,
      phoneNumber: profile.phone_number,
      btcAddress: profile.btc_address,
      bnbAddress: profile.bnb_address,
      dodgeAddress: profile.dodge_address,
      ethAddress: profile.eth_address,
      solanaAddress: profile.solana_address,
      usdttrc20Address: profile.usdttrc20_address,
      referralCode: profile.referral_code,
      referredBy: profile.referred_by,
      isVerified: profile.is_verified,
      isActive: profile.is_active,
      lastLogin: profile.last_login,
      createdAt: profile.created_at,
      updatedAt: profile.updated_at,
    }));

    return { data: formatted };
  } catch (err) {
    console.error('Unexpected error in getAllProfiles:', err);
    return { error: 'An unexpected error occurred' };
  }
}

/**
 * Fetches the current user's profile data with wallet addresses
 */
export async function getProfileData(): Promise<{ data?: ProfileData; error?: string }> {
  try {
    console.log('📥 [getProfileData] Starting...');

    const { session } = await getSession();
    console.log('🧑‍💻 [getProfileData] Session data:', session);

    if (!session?.user) {
      console.warn('⚠️ [getProfileData] No session found — redirecting to /signin...');
      if (typeof window !== 'undefined') {
        window.location.href = '/signin';
      } else {
        redirect('/signin');
      }
      return { error: 'Not authenticated' };
    }

    console.log('📡 [getProfileData] Fetching profile for user ID:', session.user.id);
    console.log('📡 [getProfileData] User email:', session.user.email);

    const { data: profile, error } = await supabase
      .from('chainrise_profile')
      .select(`
        name,
        username,
        email,
        phone_number,
        btc_address,
        bnb_address,
        dodge_address,
        eth_address,
        solana_address,
        usdttrc20_address
      `)
      .eq('id', session.user.id)
      .single();

    console.log('🔍 [getProfileData] Supabase query result:', { profile, error });
    console.log('🔍 [getProfileData] Error code:', error?.code);
    console.log('🔍 [getProfileData] Error message:', error?.message);

    if (error?.code === 'PGRST116' || !profile) {
      console.warn('⚠️ [getProfileData] No profile found — creating one automatically...');
      
      // Create a default profile
      const { error: insertError } = await supabase
        .from('chainrise_profile')
        .insert({
          id: session.user.id,
          email: session.user.email,
          name: session.user.user_metadata?.full_name || session.user.user_metadata?.name || 'User',
          username: session.user.user_metadata?.username || `user_${session.user.id.slice(0, 8)}`,
          balance: 0,
          total_earnings: 0,
          total_invested: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

      console.log('📝 [getProfileData] Profile creation result:', { insertError });

      if (insertError) {
        console.error('❌ [getProfileData] Failed to create new profile:', insertError);
        return { error: 'Failed to fetch or create profile data' };
      }

      // Try to fetch the newly created profile
      console.log('🔄 [getProfileData] Fetching newly created profile...');
      const { data: newProfile, error: newError } = await supabase
        .from('chainrise_profile')
        .select(`
          name,
          username,
          email,
          phone_number,
          btc_address,
          bnb_address,
          dodge_address,
          eth_address,
          solana_address,
          usdttrc20_address
        `)
        .eq('id', session.user.id)
        .single();

      console.log('🔄 [getProfileData] New profile fetch result:', { newProfile, newError });

      if (newError || !newProfile) {
        console.error('❌ [getProfileData] Failed to fetch newly created profile:', newError);
        return { error: 'Failed to fetch profile data after creation' };
      }

      const formattedProfile: ProfileData = {
        name: newProfile.name,
        username: newProfile.username,
        email: newProfile.email,
        phoneNumber: newProfile.phone_number,
        btcAddress: newProfile.btc_address,
        bnbAddress: newProfile.bnb_address,
        dodgeAddress: newProfile.dodge_address,
        ethAddress: newProfile.eth_address,
        solanaAddress: newProfile.solana_address,
        usdttrc20Address: newProfile.usdttrc20_address,
      };

      console.log('🎉 [getProfileData] Successfully created and formatted profile:', formattedProfile);
      return { data: formattedProfile };
    }

    if (error || !profile) {
      console.error('❌ [getProfileData] Error fetching profile:', error);
      return { error: 'Failed to fetch profile data' };
    }

    const formattedProfile: ProfileData = {
      name: profile.name,
      username: profile.username,
      email: profile.email,
      phoneNumber: profile.phone_number,
      btcAddress: profile.btc_address,
      bnbAddress: profile.bnb_address,
      dodgeAddress: profile.dodge_address,
      ethAddress: profile.eth_address,
      solanaAddress: profile.solana_address,
      usdttrc20Address: profile.usdttrc20_address,
    };

    console.log('🎉 [getProfileData] Successfully fetched and formatted profile:', formattedProfile);
    return { data: formattedProfile };
  } catch (err) {
    console.error('💥 [getProfileData] Unexpected error:', err);
    return { error: 'An unexpected error occurred' };
  }
}
/**
 * Updates the user's profile information including wallet addresses
 */
export async function updateProfile({
  name,
  username,
  email,
  phoneNumber,
  currentPassword,
  btcAddress,
  bnbAddress,
  dodgeAddress,
  ethAddress,
  solanaAddress,
  usdttrc20Address,
}: UpdateProfileInput & {
  btcAddress?: string;
  bnbAddress?: string;
  dodgeAddress?: string;
  ethAddress?: string;
  solanaAddress?: string;
  usdttrc20Address?: string;
}): Promise<{ success?: boolean; error?: string }> {
  try {
    // 1. Get current session
    const { session } = await getSession()
    if (!session?.user) {
      if (typeof window !== 'undefined') {
        window.location.href = '/signin';
      } else {
        redirect('/signin');
      }
      return { error: 'Not authenticated' }
    }

    const userId = session.user.id
    const updates: Partial<{
      name: string
      username: string
      email: string
      phone_number: string
      btc_address: string
      bnb_address: string
      dodge_address: string
      eth_address: string
      solana_address: string
      usdttrc20_address: string
      updated_at: string
    }> = {}
    let requiresReauth = false

    // 2. Prepare updates including wallet addresses
    if (name !== undefined) updates.name = name
    if (username !== undefined) updates.username = username
    if (phoneNumber !== undefined) updates.phone_number = phoneNumber
    if (btcAddress !== undefined) updates.btc_address = btcAddress
    if (bnbAddress !== undefined) updates.bnb_address = bnbAddress
    if (dodgeAddress !== undefined) updates.dodge_address = dodgeAddress
    if (ethAddress !== undefined) updates.eth_address = ethAddress
    if (solanaAddress !== undefined) updates.solana_address = solanaAddress
    if (usdttrc20Address !== undefined) updates.usdttrc20_address = usdttrc20Address
    
    // Email changes require special handling
    if (email !== undefined && email !== session.user.email) {
      if (!currentPassword) {
        return { error: 'Current password is required to change email' }
      }

      // Verify current password
      const { error: verifyError } = await supabase.auth.signInWithPassword({
        email: session.user.email || '',
        password: currentPassword,
      })

      if (verifyError) {
        return { error: 'Current password is incorrect' }
      }

      updates.email = email
      requiresReauth = true
    }

    // 3. Check for username/email/phone conflicts if they're being updated
    if (username || email || phoneNumber) {
      const conditions = []
      if (username) conditions.push(`username.eq.${username}`)
      if (email) conditions.push(`email.eq.${email}`)
      if (phoneNumber) conditions.push(`phone_number.eq.${phoneNumber}`)

      const { data: existingUsers, error: lookupError } = await supabase
        .from('chainrise_profile')
        .select('username, email, phone_number')
        .or(conditions.join(','))
        .neq('id', userId)

      if (lookupError) {
        console.error('User lookup error:', lookupError)
        return { error: 'Error checking existing users' }
      }

      if (existingUsers && existingUsers.length > 0) {
        if (username && existingUsers.some(u => u.username === username)) {
          return { error: 'Username already taken' }
        }
        if (email && existingUsers.some(u => u.email === email)) {
          return { error: 'Email already registered' }
        }
        if (phoneNumber && existingUsers.some(u => u.phone_number === phoneNumber)) {
          return { error: 'Phone number already registered' }
        }
      }
    }

    // 4. Update profile in database if there are changes
    if (Object.keys(updates).length > 0) {
      updates.updated_at = new Date().toISOString()

      const { error: updateError } = await supabase
        .from('chainrise_profile')
        .update(updates)
        .eq('id', userId)

      if (updateError) {
        console.error('Error updating profile:', updateError)
        return { error: 'Failed to update profile' }
      }

      // 5. If email was changed, update auth and send verification
      if (email && requiresReauth) {
        const { error: emailError } = await supabase.auth.updateUser({
          email,
        })

        if (emailError) {
          console.error('Error updating auth email:', emailError)
          return { error: 'Failed to update email. Please try again.' }
        }

        // Send verification email
        try {
          const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
              user: process.env.EMAIL_USERNAME,
              pass: process.env.EMAIL_PASSWORD,
            },
          })

          await transporter.sendMail({
            from: process.env.EMAIL_FROM,
            to: email,
            subject: 'Verify your new email address - ChainRise Partners',
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #059669;">Email Address Updated</h2>
                <p>Hello <strong>${name || session.user.user_metadata.name}</strong>,</p>
                <p>You've updated your email address for your ChainRise Partners account.</p>
                <p>Please check your inbox for a verification email to complete the process.</p>
                
                <div style="background: #f0fdf4; padding: 15px; border-radius: 8px; margin: 20px 0;">
                  <h3 style="color: #059669; margin-top: 0;">Security Notice</h3>
                  <p>If you didn't make this change, please contact our support team immediately.</p>
                </div>
                
                <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 25px 0;">
                <p style="color: #64748b; font-size: 12px;">
                  ChainRise Partners Security Team
                </p>
              </div>
            `,
          })
        } catch (emailError) {
          console.error('Failed to send verification email:', emailError)
          // Not critical, so we continue
        }
      }

      // 6. Update session cookies if username changed
      if (username) {
        const cookieStore = await cookies()
        cookieStore.set('username', username, {
          httpOnly: false,
          secure: process.env.NODE_ENV === 'production',
          maxAge: 31536000, // 1 year
          path: '/',
          sameSite: 'lax',
        })
      }

      // 7. Send wallet update confirmation if any wallet addresses were updated
      const walletUpdates = [btcAddress, bnbAddress, dodgeAddress, ethAddress, solanaAddress, usdttrc20Address].filter(Boolean);
      if (walletUpdates.length > 0) {
        try {
          const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
              user: process.env.EMAIL_USERNAME,
              pass: process.env.EMAIL_PASSWORD,
            },
          })

          const updatedWallets = [
            btcAddress && 'Bitcoin',
            bnbAddress && 'BNB',
            dodgeAddress && 'Dogecoin',
            ethAddress && 'Ethereum',
            solanaAddress && 'Solana',
            usdttrc20Address && 'USDT-TRC20'
          ].filter(Boolean).join(', ');

          await transporter.sendMail({
            from: process.env.EMAIL_FROM,
            to: session.user.email!,
            subject: 'Wallet Addresses Updated - ChainRise Partners',
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #059669;">Wallet Addresses Updated</h2>
                <p>Hello <strong>${name || session.user.user_metadata.name}</strong>,</p>
                <p>Your cryptocurrency wallet addresses have been successfully updated.</p>
                
                <div style="background: #f0fdf4; padding: 15px; border-radius: 8px; margin: 20px 0;">
                  <h3 style="color: #059669; margin-top: 0;">Updated Wallets:</h3>
                  <p><strong>${updatedWallets}</strong></p>
                  <p style="font-size: 14px; color: #64748b;">
                    These addresses will be used for all future cryptocurrency transactions.
                  </p>
                </div>
                
                <div style="background: #fef3c7; padding: 15px; border-radius: 8px; margin: 20px 0;">
                  <h3 style="color: #d97706; margin-top: 0;">Security Reminder</h3>
                  <p style="font-size: 14px;">
                    Always ensure you're using correct wallet addresses for each cryptocurrency.
                    Sending funds to the wrong address may result in permanent loss.
                  </p>
                </div>
                
                <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 25px 0;">
                <p style="color: #64748b; font-size: 12px;">
                  ChainRise Partners - Secure Crypto Investment Platform
                </p>
              </div>
            `,
          })
        } catch (walletEmailError) {
          console.error('Failed to send wallet update email:', walletEmailError)
          // Not critical, so we continue
        }
      }
    }

    return { success: true }
  } catch (err) {
    console.error('Unexpected error in updateProfile:', err)
    return { error: 'An unexpected error occurred' }
  }
}

export async function getUserTransactions(
  type: 'deposits' | 'withdrawals',
  filters: {
    status?: DepositStatus | WithdrawalStatus;
    limit?: number;
    offset?: number;
  } = {}
): Promise<{ data?: (Deposit | Withdrawal)[]; error?: string; count?: number }> {
  try {
    // 1. Get current session
    const session = await getSession();
    if (!session?.user) {
      if (typeof window !== 'undefined') {
        window.location.href = '/signin';
      } else {
        redirect('/signin');
      }
      return { error: 'Not authenticated' };
    }

    const userId = session.user.id;

    // 2. Build base query based on transaction type using ChainRise tables
    let query;
    
    if (type === 'deposits') {
      query = supabase
        .from('chainrise_deposits')
        .select(`
          id,
          amount,
          crypto_type,
          status,
          reference,
          created_at,
          processed_at,
          transaction_hash,
          wallet_address,
          investment_plan_id,
          admin_notes,
          chainrise_investment_plans (
            title
          )
        `, { count: 'exact' })
        .eq('user_id', userId);
    } else {
      query = supabase
        .from('chainrise_withdrawals')
        .select(`
          id,
          amount,
          crypto_type,
          status,
          reference,
          created_at,
          processed_at,
          wallet_address,
          admin_notes,
          transaction_hash
        `, { count: 'exact' })
        .eq('user_id', userId);
    }

    // Apply common ordering
    query = query.order('created_at', { ascending: false });

    // 3. Apply filters
    if (filters.status) {
      query = query.eq('status', filters.status);
    }

    if (filters.limit) {
      query = query.limit(filters.limit);
    }

    if (filters.offset !== undefined && filters.limit) {
      query = query.range(filters.offset, filters.offset + filters.limit - 1);
    }

    // 4. Execute query
    const { data, error, count } = await query;

    if (error) {
      console.error(`Error fetching ${type}:`, error);
      return { error: `Failed to fetch ${type}` };
    }

    // 5. Transform data based on type with proper type handling
    let transformedData;
    if (type === 'deposits') {
      transformedData = data?.map(transaction => {
        // Type assertion for deposit transaction with joined data
        const depositTransaction = transaction as any;
        return {
          id: depositTransaction.id,
          amount: depositTransaction.amount,
          cryptoType: depositTransaction.crypto_type,
          status: depositTransaction.status,
          reference: depositTransaction.reference,
          createdAt: depositTransaction.created_at,
          processedAt: depositTransaction.processed_at,
          transactionHash: depositTransaction.transaction_hash,
          walletAddress: depositTransaction.wallet_address,
          investmentPlanId: depositTransaction.investment_plan_id,
          adminNotes: depositTransaction.admin_notes,
          planTitle: depositTransaction.chainrise_investment_plans?.[0]?.title 
        };
      });
    } else {
      transformedData = data?.map(transaction => {
        // Type assertion for withdrawal transaction
        const withdrawalTransaction = transaction as any;
        return {
          id: withdrawalTransaction.id,
          amount: withdrawalTransaction.amount,
          cryptoType: withdrawalTransaction.crypto_type,
          status: withdrawalTransaction.status,
          reference: withdrawalTransaction.reference,
          createdAt: withdrawalTransaction.created_at,
          processedAt: withdrawalTransaction.processed_at,
          walletAddress: withdrawalTransaction.wallet_address,
          adminNotes: withdrawalTransaction.admin_notes,
          transactionHash: withdrawalTransaction.transaction_hash
        };
      });
    }

    return {
      data: transformedData,
      count: count || 0
    };
  } catch (err) {
    console.error(`Unexpected error in getUserTransactions (${type}):`, err);
    return { error: 'An unexpected error occurred' };
  }
}
/**
 * Get user's wallet addresses for transaction forms
 */
export async function getUserWalletAddresses(): Promise<{ 
  data?: {
    btcAddress?: string;
    bnbAddress?: string;
    dodgeAddress?: string;
    ethAddress?: string;
    solanaAddress?: string;
    usdttrc20Address?: string;
  }; 
  error?: string 
}> {
  try {
    const { session } = await getSession();
    if (!session?.user) {
      return { error: 'Not authenticated' };
    }

    const { data: profile, error } = await supabase
      .from('chainrise_profile')
      .select(`
        btc_address,
        bnb_address,
        dodge_address,
        eth_address,
        solana_address,
        usdttrc20_address
      `)
      .eq('id', session.user.id)
      .single();

    if (error) {
      console.error('Error fetching wallet addresses:', error);
      return { error: 'Failed to fetch wallet addresses' };
    }

    return {
      data: {
        btcAddress: profile.btc_address,
        bnbAddress: profile.bnb_address,
        dodgeAddress: profile.dodge_address,
        ethAddress: profile.eth_address,
        solanaAddress: profile.solana_address,
        usdttrc20Address: profile.usdttrc20_address,
      }
    };
  } catch (err) {
    console.error('Unexpected error in getUserWalletAddresses:', err);
    return { error: 'An unexpected error occurred' };
  }
}

/**
 * Update specific wallet address
 */
export async function updateWalletAddress(
  walletType: 'btc' | 'bnb' | 'dodge' | 'eth' | 'solana' | 'usdttrc20',
  address: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { session } = await getSession();
    if (!session?.user) {
      return { success: false, error: 'Not authenticated' };
    }

    const updateField = `${walletType}_address`;
    const { error } = await supabase
      .from('chainrise_profile')
      .update({ 
        [updateField]: address,
        updated_at: new Date().toISOString()
      })
      .eq('id', session.user.id);

    if (error) {
      console.error(`Error updating ${walletType} address:`, error);
      return { success: false, error: `Failed to update ${walletType.toUpperCase()} address` };
    }

    return { success: true };
  } catch (err) {
    console.error('Unexpected error in updateWalletAddress:', err);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

/**
 * Get user dashboard statistics
 */
export async function getUserDashboardStats(): Promise<{ 
  data?: {
    totalBalance: number;
    totalEarnings: number;
    totalInvested: number;
    activeInvestments: number;
    pendingDeposits: number;
    pendingWithdrawals: number;
  }; 
  error?: string 
}> {
  try {
    const { session } = await getSession();
    if (!session?.user) {
      return { error: 'Not authenticated' };
    }

    const userId = session.user.id;

    // Get profile stats - use maybeSingle to handle missing profiles
    const { data: profile, error: profileError } = await supabase
      .from('chainrise_profile')
      .select('balance, total_earnings, total_invested')
      .eq('id', userId)
      .maybeSingle(); // Changed from single() to maybeSingle()

    if (profileError) {
      console.error('Error fetching profile stats:', profileError);
      return { error: 'Failed to fetch dashboard statistics' };
    }

    // If profile doesn't exist, create a default one
    if (!profile) {
      console.warn('User profile not found, creating default profile...');
      
      // Create a default profile for the user
      const { error: createError } = await supabase
        .from('chainrise_profile')
        .insert([
          {
            id: userId,
            name: session.user.user_metadata?.name || 'User',
            username: session.user.user_metadata?.username || `user_${userId.slice(0, 8)}`,
            email: session.user.email,
            balance: 0,
            total_earnings: 0,
            total_invested: 0,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        ]);

      if (createError) {
        console.error('Error creating default profile:', createError);
        // Continue with default values even if creation fails
      }

      // Return default values
      return {
        data: {
          totalBalance: 0,
          totalEarnings: 0,
          totalInvested: 0,
          activeInvestments: 0,
          pendingDeposits: 0,
          pendingWithdrawals: 0,
        }
      };
    }

    // Get active investments count (handle errors gracefully)
    let activeInvestments = 0;
    try {
      const { count } = await supabase
        .from('chainrise_investments')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('status', 'active');
      activeInvestments = count || 0;
    } catch (error) {
      console.warn('Error fetching active investments:', error);
    }

    // Get pending deposits count
    let pendingDeposits = 0;
    try {
      const { count } = await supabase
        .from('chainrise_deposits')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('status', 'pending');
      pendingDeposits = count || 0;
    } catch (error) {
      console.warn('Error fetching pending deposits:', error);
    }

    // Get pending withdrawals count
    let pendingWithdrawals = 0;
    try {
      const { count } = await supabase
        .from('chainrise_withdrawals')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('status', 'pending');
      pendingWithdrawals = count || 0;
    } catch (error) {
      console.warn('Error fetching pending withdrawals:', error);
    }

    return {
      data: {
        totalBalance: profile.balance || 0,
        totalEarnings: profile.total_earnings || 0,
        totalInvested: profile.total_invested || 0,
        activeInvestments,
        pendingDeposits,
        pendingWithdrawals,
      }
    };
  } catch (err) {
    console.error('Unexpected error in getUserDashboardStats:', err);
    return { error: 'An unexpected error occurred' };
  }
}