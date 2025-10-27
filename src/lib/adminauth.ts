/* eslint-disable @typescript-eslint/no-explicit-any */
'use server'

import { supabase } from '@/lib/supabaseClient'
 
import { redirect } from 'next/navigation'
import { getSession } from './auth'
import { Profile, UpdateUserProfileInput } from '@/types/businesses'
import { getTotalUsers } from './getProfileData'
import nodemailer from 'nodemailer'
import { cookies } from 'next/headers'
import { createClient } from '@supabase/supabase-js'



 
export async function getAdminSession() {
  try {
    const cookieStore = await cookies();
    const adminId = cookieStore.get('user-id')?.value;
    const isAuthenticated = cookieStore.get('user-authenticated')?.value;
    const isAdmin = cookieStore.get('user-is-admin')?.value === 'true';

    if (!adminId || isAuthenticated !== 'true' || !isAdmin) {
      return { isAuthenticated: false, admin: null };
    }

    return { 
      isAuthenticated: true, 
      admin: {
        id: adminId,
        username: cookieStore.get('user-username')?.value,
        email: cookieStore.get('user-email')?.value,
      }
    };
  } catch (err) {
    console.error('Error getting admin session:', err);
    return { isAuthenticated: false, admin: null };
  }
}


// lib/auth.ts - Add this function
export async function getCurrentUser() {
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error || !user) {
      return { user: null, isAuthenticated: false };
    }

    // Get profile to check admin status
    const { data: profile } = await supabase
      .from('chainrise_profile')
      .select('is_admin, username, email')
      .eq('id', user.id)
      .single();

    return {
      user: {
        ...user,
        is_admin: profile?.is_admin || false,
        username: profile?.username,
        email: profile?.email
      },
      isAuthenticated: true
    };
  } catch (err) {
    console.log(err)
    return { user: null, isAuthenticated: false };
  }
}

// Route protection function for server components
export async function requireAdminAuth() {
  const { isAuthenticated } = await getAdminSession()
  
  if (!isAuthenticated) {
    redirect('/signin')
  }
}

// Function to check if user is authenticated (for client-side use)
export async function checkAdminAuth() {
  return await getAdminSession()
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


export async function getEarningsAnalytics(): Promise<{ 
  data?: {
    weekly: { date: string; earnings: number }[];
    monthly: { month: string; earnings: number }[];
    yearly: { year: string; earnings: number }[];
  }; 
  error?: string 
}> {
  try {
    // For weekly earnings (last 8 weeks)
    const weeklyEarnings = await calculateWeeklyEarnings();
    
    // For monthly earnings (last 12 months)
    const monthlyEarnings = await calculateMonthlyEarnings();
    
    // For yearly earnings (all years)
    const yearlyEarnings = await calculateYearlyEarnings();

    return {
      data: {
        weekly: weeklyEarnings,
        monthly: monthlyEarnings,
        yearly: yearlyEarnings
      }
    };
  } catch (err) {
    console.error('Unexpected error in getEarningsAnalytics:', err);
    return { error: 'An unexpected error occurred' };
  }
}

/**
 * Calculate weekly earnings (last 8 weeks)
 */
async function calculateWeeklyEarnings(): Promise<{ date: string; earnings: number }[]> {
  try {
    const { data: transactions, error } = await supabase
      .from('chainrise_transactions')
      .select('created_at, amount, type')
      .eq('type', 'profit')
      .gte('created_at', new Date(Date.now() - 8 * 7 * 24 * 60 * 60 * 1000).toISOString())
      .order('created_at', { ascending: true });

    if (error || !transactions) {
      console.error('Error fetching weekly earnings:', error);
      return [];
    }

    // Group by week
    const weeklyData: { [key: string]: number } = {};
    
    transactions.forEach(transaction => {
      const date = new Date(transaction.created_at);
      const weekStart = new Date(date);
      weekStart.setDate(date.getDate() - date.getDay()); // Start of week (Sunday)
      const weekKey = weekStart.toISOString().split('T')[0];
      
      weeklyData[weekKey] = (weeklyData[weekKey] || 0) + transaction.amount;
    });

    // Format for chart
    return Object.entries(weeklyData).map(([date, earnings]) => ({
      date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      earnings
    })).slice(-8); // Last 8 weeks
  } catch (err) {
    console.error('Error in calculateWeeklyEarnings:', err);
    return [];
  }
}

/**
 * Calculate monthly earnings (last 12 months)
 */
async function calculateMonthlyEarnings(): Promise<{ month: string; earnings: number }[]> {
  try {
    const { data: transactions, error } = await supabase
      .from('chainrise_transactions')
      .select('created_at, amount, type')
      .eq('type', 'profit')
      .gte('created_at', new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString())
      .order('created_at', { ascending: true });

    if (error || !transactions) {
      console.error('Error fetching monthly earnings:', error);
      return [];
    }

    // Group by month
    const monthlyData: { [key: string]: number } = {};
    
    transactions.forEach(transaction => {
      const date = new Date(transaction.created_at);
      const monthKey = date.toISOString().substring(0, 7); // YYYY-MM format
      
      monthlyData[monthKey] = (monthlyData[monthKey] || 0) + transaction.amount;
    });

    // Format for chart
    return Object.entries(monthlyData).map(([month, earnings]) => ({
      month: new Date(month + '-01').toLocaleDateString('en-US', { year: 'numeric', month: 'short' }),
      earnings
    })).slice(-12); // Last 12 months
  } catch (err) {
    console.error('Error in calculateMonthlyEarnings:', err);
    return [];
  }
}

/**
 * Calculate yearly earnings
 */
async function calculateYearlyEarnings(): Promise<{ year: string; earnings: number }[]> {
  try {
    const { data: transactions, error } = await supabase
      .from('chainrise_transactions')
      .select('created_at, amount, type')
      .eq('type', 'profit')
      .order('created_at', { ascending: true });

    if (error || !transactions) {
      console.error('Error fetching yearly earnings:', error);
      return [];
    }

    // Group by year
    const yearlyData: { [key: string]: number } = {};
    
    transactions.forEach(transaction => {
      const date = new Date(transaction.created_at);
      const yearKey = date.getFullYear().toString();
      
      yearlyData[yearKey] = (yearlyData[yearKey] || 0) + transaction.amount;
    });

    // Format for chart
    return Object.entries(yearlyData).map(([year, earnings]) => ({
      year,
      earnings
    }));
  } catch (err) {
    console.error('Error in calculateYearlyEarnings:', err);
    return [];
  }
}

export async function getPlatformStats(): Promise<{ 
  data?: {
    totalBalance: number;
    totalEarnings: number;
    totalInvested: number;
    activeUsers: number;
    totalUsers: number;
  }; 
  error?: string 
}> {
  try {
    // Get total users
    const { data: totalUsers, error: usersError } = await getTotalUsers();
    if (usersError) {
      return { error: usersError };
    }

    // Get platform-wide sums
    const { data: stats, error: statsError } = await supabase
      .from('chainrise_profile')
      .select('balance, total_earnings, total_invested, is_active')
      .not('balance', 'is', null);

    if (statsError) {
      console.error('Error fetching platform stats:', statsError);
      return { error: 'Failed to fetch platform statistics' };
    }

    if (!stats) {
      return { 
        data: {
          totalBalance: 0,
          totalEarnings: 0,
          totalInvested: 0,
          activeUsers: 0,
          totalUsers: totalUsers || 0
        }
      };
    }

    const totals = stats.reduce((acc, profile) => ({
      totalBalance: acc.totalBalance + (profile.balance || 0),
      totalEarnings: acc.totalEarnings + (profile.total_earnings || 0),
      totalInvested: acc.totalInvested + (profile.total_invested || 0),
      activeUsers: acc.activeUsers + (profile.is_active ? 1 : 0)
    }), {
      totalBalance: 0,
      totalEarnings: 0,
      totalInvested: 0,
      activeUsers: 0
    });

    return {
      data: {
        ...totals,
        totalUsers: totalUsers || 0
      }
    };
  } catch (err) {
    console.error('Unexpected error in getPlatformStats:', err);
    return { error: 'An unexpected error occurred' };
  }
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

// Admin funding function
export async function adminFundUser({
  userId,
  amount,
  cryptoType,
  transactionType = 'bonus',
  description,
  sendEmailNotification = true,
  adminId
}: {
  userId: string;
  amount: number;
  cryptoType: string;
  transactionType?: 'bonus' | 'deposit' | 'refund' | 'correction';
  description: string;
  sendEmailNotification?: boolean;
  adminId: string;
}): Promise<{ success?: boolean; error?: string; depositId?: string; newBalance?: number }> {
  try {
    console.log('[adminFundUser] Starting admin funding process:', {
      userId, amount, cryptoType, transactionType, description, adminId
    });

    // 1. Use the database function to update balance (bypasses RLS)
    console.log('[adminFundUser] Calling database function...');
    
    const { data: dbResult, error: rpcError } = await supabase.rpc('admin_update_user_balance', {
      target_user_id: userId,
      admin_user_id: adminId,
      amount_to_add: amount,
      transaction_type: transactionType,
      description_text: description
    });

    console.log('[adminFundUser] Database function result:', { dbResult, rpcError });

    if (rpcError) {
      console.error('[adminFundUser] Database function failed:', rpcError);
      return { error: 'Database update failed: ' + rpcError.message };
    }

    if (dbResult?.error) {
      console.error('[adminFundUser] Database function returned error:', dbResult.error);
      return { error: dbResult.error };
    }

    if (!dbResult?.success) {
      console.error('[adminFundUser] Database function did not return success');
      return { error: 'Balance update failed unexpectedly' };
    }

    console.log('[adminFundUser] Balance updated successfully via database function:', dbResult);

    // 2. Create deposit record
    const reference = `ADM-${transactionType.toUpperCase()}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    
    console.log('[adminFundUser] Creating deposit record...');
    
    const { data: deposit, error: depositError } = await supabase
      .from('chainrise_deposits')
      .insert([{
        user_id: userId,
        amount,
        crypto_type: cryptoType,
        wallet_address: 'ADMIN_FUNDING',
        reference,
        status: 'completed',
        processed_at: new Date().toISOString(),
        admin_notes: `Admin funding: ${description} | By: ${adminId}`,
        is_admin_funded: true,
        admin_id: adminId,
        transaction_type: transactionType
      }])
      .select()
      .single();

    if (depositError || !deposit) {
      console.error('[adminFundUser] Deposit creation failed:', depositError);
      
      // Note: We can't easily rollback the database function, but the deposit is the audit trail
      return { error: 'Failed to create funding record: ' + depositError?.message };
    }

    console.log('[adminFundUser] Deposit record created:', deposit.id);

    // 3. Record transaction
    console.log('[adminFundUser] Recording transaction...');
    
    const { error: transactionError } = await supabase
      .from('chainrise_transactions')
      .insert({
        user_id: userId,
        type: 'admin_funding',
        amount: amount,
        currency: 'USD',
        description: `Admin ${transactionType}: ${description}`,
        reference: reference,
        status: 'completed',
        metadata: {
          deposit_id: deposit.id,
          admin_id: adminId,
          transaction_type: transactionType,
          description: description,
          previous_balance: dbResult.previous_balance,
          new_balance: dbResult.new_balance
        }
      });

    if (transactionError) {
      console.error('[adminFundUser] Transaction record failed:', transactionError);
    }

    // 4. Send notification
    if (sendEmailNotification) {
      console.log('[adminFundUser] Sending notification...');
      await sendAdminFundingNotificationToUser({
        userId,
        amount,
        transactionType,
        description,
        reference,
        adminId
      });
    }

    console.log('[adminFundUser] Admin funding completed successfully');
    return { 
      success: true, 
      depositId: deposit.id,
      newBalance: dbResult.new_balance
    };
  } catch (err) {
    console.error('[adminFundUser] Unexpected error:', err);
    return { error: 'An unexpected error occurred: ' + (err instanceof Error ? err.message : 'Unknown error') };
  }
}


// Get comprehensive user metrics for admin dashboard
export async function getUserMetrics(userId: string): Promise<{
  data?: {
    // Basic info
    username: string;
    email: string;
    created_at: string;
    is_active: boolean;
    
    // Balance info
    balance: number;
    total_earnings: number;
    total_invested: number;
    
    // Calculated metrics
    funded: number; // Total deposits
    earned: number; // Total earnings from investments
    active_deposit: number; // Sum of active investments
    total_withdrawal: number;
    pending_withdrawal: number;
    total_bonus: number;
    total_penalty: number;
    referral_commission: number;
  };
  error?: string;
}> {
  try {
    // 1. Get user basic info
    const { data: user, error: userError } = await supabase
      .from('chainrise_profile')
      .select('*')
      .eq('id', userId)
      .single();

    if (userError || !user) {
      return { error: 'User not found' };
    }

    // 2. Calculate total deposits (funded)
    const { data: deposits  } = await supabase
      .from('chainrise_deposits')
      .select('amount')
      .eq('user_id', userId)
      .eq('status', 'completed');

    const funded = deposits?.reduce((sum, dep) => sum + dep.amount, 0) || 0;

    // 3. Calculate active investments
    const { data: activeInvestments  } = await supabase
      .from('chainrise_investments')
      .select('current_balance')
      .eq('user_id', userId)
      .eq('status', 'active');

    const active_deposit = activeInvestments?.reduce((sum, inv) => sum + inv.current_balance, 0) || 0;

    // 4. Calculate withdrawal totals
    const { data: withdrawals  } = await supabase
      .from('chainrise_withdrawals')
      .select('amount, status')
      .eq('user_id', userId);

    const total_withdrawal = withdrawals
      ?.filter(w => w.status === 'completed')
      .reduce((sum, w) => sum + w.amount, 0) || 0;

    const pending_withdrawal = withdrawals
      ?.filter(w => w.status === 'pending')
      .reduce((sum, w) => sum + w.amount, 0) || 0;

    return {
      data: {
        username: user.username,
        email: user.email,
        created_at: user.created_at,
        is_active: user.is_active,
        balance: user.balance,
        total_earnings: user.total_earnings,
        total_invested: user.total_invested,
        funded,
        earned: user.total_earnings || 0,
        active_deposit,
        total_withdrawal,
        pending_withdrawal,
        total_bonus: user.total_bonus || 0,
        total_penalty: user.total_penalty || 0,
        referral_commission: user.referral_commission || 0
      }
    };
  } catch (err) {
    console.error('[getUserMetrics] Unexpected error:', err);
    return { error: 'An unexpected error occurred' };
  }
}

// Get all users with metrics for admin dashboard
export async function getAllUsersWithMetrics(filters?: {
  is_active?: boolean;
  search?: string;
  limit?: number;
  offset?: number;
}): Promise<{ 
  data?: any[]; 
  error?: string; 
  count?: number 
}> {
  try {
    let query = supabase
      .from('chainrise_profile')
      .select(`
        id,
        username,
        email,
        created_at,
        is_active,
        balance,
        total_earnings,
        total_invested,
        total_bonus,
        total_penalty,
        referral_commission
      `, { count: 'exact' })
      .order('created_at', { ascending: false });

    if (filters?.is_active !== undefined) {
      query = query.eq('is_active', filters.is_active);
    }

    if (filters?.search) {
      query = query.or(`username.ilike.%${filters.search}%,email.ilike.%${filters.search}%`);
    }

    if (filters?.limit) {
      query = query.limit(filters.limit);
    }

    if (filters?.offset !== undefined && filters.limit) {
      query = query.range(filters.offset, filters.offset + filters.limit - 1);
    }

    const { data: users, error, count } = await query;

    if (error) {
      return { error: 'Failed to fetch users' };
    }

    // For each user, calculate additional metrics
    const usersWithMetrics = await Promise.all(
      (users || []).map(async (user) => {
        const metrics = await getUserMetrics(user.id);
        return {
          ...user,
          funded: metrics.data?.funded || 0,
          earned: metrics.data?.earned || 0,
          active_deposit: metrics.data?.active_deposit || 0,
          total_withdrawal: metrics.data?.total_withdrawal || 0,
          pending_withdrawal: metrics.data?.pending_withdrawal || 0
        };
      })
    );

    return {
      data: usersWithMetrics,
      count: count || 0
    };
  } catch (err) {
    console.error('[getAllUsersWithMetrics] Unexpected error:', err);
    return { error: 'An unexpected error occurred' };
  }
}

// Update user profile (admin function)
export async function adminUpdateUserProfile({
  userId,
  adminId,
  updates
}: {
  userId: string;
  adminId: string;
  updates: {
    name?: string;
    username?: string;
    phone_number?: string;
    btc_address?: string;
    bnb_address?: string;
    dodge_address?: string;
    eth_address?: string;
    solana_address?: string;
    usdttrc20_address?: string;
  };
}): Promise<{ success?: boolean; error?: string }> {
  try {
    console.log('🔧 [adminUpdateUserProfile] STARTING UPDATE:', { 
      userId, 
      adminId, 
      updates
    });

    // 1. Verify admin privileges
    const { data: admin, error: adminError } = await supabase
      .from('chainrise_profile')
      .select('id, username, is_admin')
      .eq('id', adminId)
      .single();

    if (adminError || !admin || !admin.is_admin) {
      console.error('❌ [adminUpdateUserProfile] Admin verification failed');
      return { error: 'Unauthorized: Admin privileges required' };
    }

    console.log('✅ [adminUpdateUserProfile] Admin verified');

    // 2. Use a different approach - DON'T use .single() on UPDATE
    console.log('🔄 [adminUpdateUserProfile] Attempting update without .single()...');
    
    const updateData = {
      ...updates,
      updated_at: new Date().toISOString()
    };

    // Method 1: Try update without .single() first
    const { error: updateError, count } = await supabase
      .from('chainrise_profile')
      .update(updateData)
      .eq('id', userId);

    console.log('📊 [adminUpdateUserProfile] Update result (no .single()):', {
      updateError,
      count,
      rowsAffected: count
    });

    if (updateError) {
      console.error('❌ [adminUpdateUserProfile] Update failed:', updateError);
      return { error: `Update failed: ${updateError.message}` };
    }

    // If count is 0, no rows were updated due to RLS
    if (count === 0) {
      console.warn('⚠️ [adminUpdateUserProfile] No rows updated - RLS likely blocking');
      
      // Method 2: Use RPC function as fallback
      console.log('🔄 [adminUpdateUserProfile] Trying RPC fallback...');
      return await adminUpdateUserProfileRPC({ userId, adminId, updates });
    }

    console.log(`✅ [adminUpdateUserProfile] Update successful - ${count} row(s) affected`);
    return { success: true };

  } catch (err) {
    console.error('💥 [adminUpdateUserProfile] Unexpected error:', err);
    return { error: 'An unexpected error occurred' };
  }
}

// RPC-based fallback function
async function adminUpdateUserProfileRPC({
  userId,
  adminId,
  updates
}: {
  userId: string;
  adminId: string;
  updates: any;
}): Promise<{ success?: boolean; error?: string }> {
  try {
    console.log('🔧 [adminUpdateUserProfileRPC] Using RPC fallback...');
    
    const { data: result, error } = await supabase.rpc('admin_update_user_profile', {
      target_user_id: userId,
      admin_user_id: adminId,
      name_text: updates.name,
      username_text: updates.username,
      phone_text: updates.phone_number,
      btc_address_text: updates.btc_address,
      bnb_address_text: updates.bnb_address,
      dodge_address_text: updates.dodge_address,
      eth_address_text: updates.eth_address,
      solana_address_text: updates.solana_address,
      usdt_address_text: updates.usdttrc20_address
    });

    console.log('📊 [adminUpdateUserProfileRPC] RPC result:', { result, error });

    if (error) {
      console.error('❌ [adminUpdateUserProfileRPC] RPC failed:', error);
      return { error: `RPC update failed: ${error.message}` };
    }

    if (result?.error) {
      console.error('❌ [adminUpdateUserProfileRPC] RPC returned error:', result.error);
      return { error: result.error };
    }

    console.log('✅ [adminUpdateUserProfileRPC] RPC update successful');
    return { success: true };

  } catch (err) {
    console.error('💥 [adminUpdateUserProfileRPC] Unexpected error:', err);
    return { error: 'RPC fallback failed' };
  }
}

 


// Send notification for admin funding
async function sendAdminFundingNotificationToUser(params: {
  userId: string;
  amount: number;
  transactionType: string;
  description: string;
  reference: string;
  adminId: string;
}) {
  try {
    const { data: user } = await supabase
      .from('chainrise_profile')
      .select('email, name')
      .eq('id', params.userId)
      .single();

    if (!user?.email) return;

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USERNAME!,
        pass: process.env.EMAIL_PASSWORD!,
      },
    });

    const subject = `Account Credited: $${params.amount} ${params.transactionType}`;
    
    const mailOptions = {
      from: `ChainRise Admin <${process.env.EMAIL_USERNAME}>`,
      to: user.email,
      subject,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2a52be;">Account Credited ✅</h2>
          <p>Dear ${user.name || 'Valued Customer'},</p>
          <p>Your account has been credited with <strong>$${params.amount}</strong>.</p>
          <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Type:</strong> ${params.transactionType}</p>
            <p><strong>Amount:</strong> $${params.amount}</p>
            <p><strong>Reference:</strong> ${params.reference}</p>
            <p><strong>Description:</strong> ${params.description}</p>
          </div>
          <p>This amount has been added to your available balance and can be used for investments.</p>
          <p>Thank you for choosing ChainRise!</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`Admin funding notification sent to ${user.email}`);
  } catch (error) {
    console.error('Failed to send admin funding notification:', error);
  }
}


// Admin ban user function
export async function adminBanUser({
  userId,
  adminId,
  reason = ''
}: {
  userId: string;
  adminId: string;
  reason?: string;
}): Promise<{ success?: boolean; error?: string }> {
  try {
    console.log('[adminBanUser] Starting ban process:', { userId, adminId, reason });

    // 1. Verify admin privileges
    const { data: admin, error: adminError } = await supabase
      .from('chainrise_profile')
      .select('is_admin')
      .eq('id', adminId)
      .single();

    if (adminError || !admin || !admin.is_admin) {
      console.error('[adminBanUser] Admin verification failed:', adminError);
      return { error: 'Unauthorized: Admin privileges required' };
    }

    // 2. Verify target user exists and is not already banned
    const { data: user, error: userError } = await supabase
      .from('chainrise_profile')
      .select('id, username, email, is_banned')
      .eq('id', userId)
      .single();

    if (userError || !user) {
      console.error('[adminBanUser] User verification failed:', userError);
      return { error: 'User not found' };
    }

    if (user.is_banned) {
      return { error: 'User is already banned' };
    }

    // 3. Update user ban status
    const { error: updateError } = await supabase
      .from('chainrise_profile')
      .update({
        is_banned: true,
        banned_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', userId);

    if (updateError) {
      console.error('[adminBanUser] Ban update failed:', updateError);
      return { error: 'Failed to ban user' };
    }

    // 4. Record ban action in admin logs (optional but recommended)
    await supabase
      .from('chainrise_admin_actions')
      .insert({
        admin_id: adminId,
        user_id: userId,
        action_type: 'ban',
        description: `User banned: ${reason}`,
        metadata: {
          reason: reason,
          previous_status: 'active'
        }
      });

    // 5. Send notification to user (optional)
    await sendUserBanNotification({
      userId,
      reason,
      adminId
    });

    console.log('[adminBanUser] User banned successfully');
    return { success: true };
  } catch (err) {
    console.error('[adminBanUser] Unexpected error:', err);
    return { error: 'An unexpected error occurred' };
  }
}

// Admin unban user function
export async function adminUnbanUser({
  userId,
  adminId,
  reason = ''
}: {
  userId: string;
  adminId: string;
  reason?: string;
}): Promise<{ success?: boolean; error?: string }> {
  try {
    console.log('[adminUnbanUser] Starting unban process:', { userId, adminId, reason });

    // 1. Verify admin privileges
    const { data: admin, error: adminError } = await supabase
      .from('chainrise_profile')
      .select('is_admin')
      .eq('id', adminId)
      .single();

    if (adminError || !admin || !admin.is_admin) {
      console.error('[adminUnbanUser] Admin verification failed:', adminError);
      return { error: 'Unauthorized: Admin privileges required' };
    }

    // 2. Verify target user exists and is actually banned
    const { data: user, error: userError } = await supabase
      .from('chainrise_profile')
      .select('id, username, email, is_banned')
      .eq('id', userId)
      .single();

    if (userError || !user) {
      console.error('[adminUnbanUser] User verification failed:', userError);
      return { error: 'User not found' };
    }

    if (!user.is_banned) {
      return { error: 'User is not banned' };
    }

    // 3. Update user ban status
    const { error: updateError } = await supabase
      .from('chainrise_profile')
      .update({
        is_banned: false,
        banned_at: null,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId);

    if (updateError) {
      console.error('[adminUnbanUser] Unban update failed:', updateError);
      return { error: 'Failed to unban user' };
    }

    // 4. Record unban action
    await supabase
      .from('chainrise_admin_actions')
      .insert({
        admin_id: adminId,
        user_id: userId,
        action_type: 'unban',
        description: `User unbanned: ${reason}`,
        metadata: {
          reason: reason
        }
      });

    console.log('[adminUnbanUser] User unbanned successfully');
    return { success: true };
  } catch (err) {
    console.error('[adminUnbanUser] Unexpected error:', err);
    return { error: 'An unexpected error occurred' };
  }
}

// Admin deactivate user function
export async function adminDeactivateUser({
  userId,
  adminId,
  reason = ''
}: {
  userId: string;
  adminId: string;
  reason?: string;
}): Promise<{ success?: boolean; error?: string }> {
  try {
    console.log('[adminDeactivateUser] Starting deactivation process:', { userId, adminId, reason });

    // 1. Verify admin privileges
    const { data: admin, error: adminError } = await supabase
      .from('chainrise_profile')
      .select('is_admin')
      .eq('id', adminId)
      .single();

    if (adminError || !admin || !admin.is_admin) {
      console.error('[adminDeactivateUser] Admin verification failed:', adminError);
      return { error: 'Unauthorized: Admin privileges required' };
    }

    // 2. Verify target user exists and is active
    const { data: user, error: userError } = await supabase
      .from('chainrise_profile')
      .select('id, username, email, is_active')
      .eq('id', userId)
      .single();

    if (userError || !user) {
      console.error('[adminDeactivateUser] User verification failed:', userError);
      return { error: 'User not found' };
    }

    if (!user.is_active) {
      return { error: 'User is already deactivated' };
    }

    // 3. Update user active status
    const { error: updateError } = await supabase
      .from('chainrise_profile')
      .update({
        is_active: false,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId);

    if (updateError) {
      console.error('[adminDeactivateUser] Deactivation failed:', updateError);
      return { error: 'Failed to deactivate user' };
    }

    // 4. Record deactivation action
    await supabase
      .from('chainrise_admin_actions')
      .insert({
        admin_id: adminId,
        user_id: userId,
        action_type: 'deactivate',
        description: `User deactivated: ${reason}`,
        metadata: {
          reason: reason
        }
      });

    console.log('[adminDeactivateUser] User deactivated successfully');
    return { success: true };
  } catch (err) {
    console.error('[adminDeactivateUser] Unexpected error:', err);
    return { error: 'An unexpected error occurred' };
  }
}

// Admin activate user function
export async function adminActivateUser({
  userId,
  adminId,
  reason = ''
}: {
  userId: string;
  adminId: string;
  reason?: string;
}): Promise<{ success?: boolean; error?: string }> {
  try {
    console.log('[adminActivateUser] Starting activation process:', { userId, adminId, reason });

    // 1. Verify admin privileges
    const { data: admin, error: adminError } = await supabase
      .from('chainrise_profile')
      .select('is_admin')
      .eq('id', adminId)
      .single();

    if (adminError || !admin || !admin.is_admin) {
      console.error('[adminActivateUser] Admin verification failed:', adminError);
      return { error: 'Unauthorized: Admin privileges required' };
    }

    // 2. Verify target user exists and is inactive
    const { data: user, error: userError } = await supabase
      .from('chainrise_profile')
      .select('id, username, email, is_active')
      .eq('id', userId)
      .single();

    if (userError || !user) {
      console.error('[adminActivateUser] User verification failed:', userError);
      return { error: 'User not found' };
    }

    if (user.is_active) {
      return { error: 'User is already active' };
    }

    // 3. Update user active status
    const { error: updateError } = await supabase
      .from('chainrise_profile')
      .update({
        is_active: true,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId);

    if (updateError) {
      console.error('[adminActivateUser] Activation failed:', updateError);
      return { error: 'Failed to activate user' };
    }

    // 4. Record activation action
    await supabase
      .from('chainrise_admin_actions')
      .insert({
        admin_id: adminId,
        user_id: userId,
        action_type: 'activate',
        description: `User activated: ${reason}`,
        metadata: {
          reason: reason
        }
      });

    console.log('[adminActivateUser] User activated successfully');
    return { success: true };
  } catch (err) {
    console.error('[adminActivateUser] Unexpected error:', err);
    return { error: 'An unexpected error occurred' };
  }
}

// Admin soft delete user function
export async function adminSoftDeleteUser({
  userId,
  adminId,
  reason = ''
}: {
  userId: string;
  adminId: string;
  reason?: string;
}): Promise<{ success?: boolean; error?: string }> {
  try {
    console.log('[adminSoftDeleteUser] Starting soft delete process:', { userId, adminId, reason });

    // 1. Verify admin privileges
    const { data: admin, error: adminError } = await supabase
      .from('chainrise_profile')
      .select('is_admin')
      .eq('id', adminId)
      .single();

    if (adminError || !admin || !admin.is_admin) {
      console.error('[adminSoftDeleteUser] Admin verification failed:', adminError);
      return { error: 'Unauthorized: Admin privileges required' };
    }

    // 2. Verify target user exists and is not already deleted
    const { data: user, error: userError } = await supabase
      .from('chainrise_profile')
      .select('id, username, email, is_deleted')
      .eq('id', userId)
      .single();

    if (userError || !user) {
      console.error('[adminSoftDeleteUser] User verification failed:', userError);
      return { error: 'User not found' };
    }

    if (user.is_deleted) {
      return { error: 'User is already deleted' };
    }

    // 3. Create Supabase admin client with service role key
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // 4. Update user in Auth system using service role key
    const { error: authError } = await supabaseAdmin.auth.admin.updateUserById(
      userId,
      { 
        user_metadata: {
          soft_deleted: true,
          deleted_at: new Date().toISOString(),
          deleted_reason: reason
        }
      }
    );

    if (authError) {
      console.warn('[adminSoftDeleteUser] Auth update warning:', authError);
      // Continue with profile update even if auth update fails
    }

    // 5. Update user delete status in profile
    const { error: updateError } = await supabase
      .from('chainrise_profile')
      .update({
        is_deleted: true,
        deleted_at: new Date().toISOString(),
        deleted_by: adminId,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId);

    if (updateError) {
      console.error('[adminSoftDeleteUser] Soft delete failed:', updateError);
      return { error: 'Failed to delete user' };
    }

    // 6. Record delete action
    await supabase
      .from('chainrise_admin_actions')
      .insert({
        admin_id: adminId,
        user_id: userId,
        action_type: 'soft_delete',
        description: `User soft deleted: ${reason}`,
        metadata: {
          reason: reason
        }
      });

    console.log('[adminSoftDeleteUser] User soft deleted successfully');
    return { success: true };
  } catch (err) {
    console.error('[adminSoftDeleteUser] Unexpected error:', err);
    return { error: 'An unexpected error occurred' };
  }
}

// Admin restore user function
export async function adminRestoreUser({
  userId,
  adminId,
  reason = ''
}: {
  userId: string;
  adminId: string;
  reason?: string;
}): Promise<{ success?: boolean; error?: string }> {
  try {
    console.log('[adminRestoreUser] Starting restore process:', { userId, adminId, reason });

    // 1. Verify admin privileges
    const { data: admin, error: adminError } = await supabase
      .from('chainrise_profile')
      .select('is_admin')
      .eq('id', adminId)
      .single();

    if (adminError || !admin || !admin.is_admin) {
      console.error('[adminRestoreUser] Admin verification failed:', adminError);
      return { error: 'Unauthorized: Admin privileges required' };
    }

    // 2. Verify target user exists and is deleted
    const { data: user, error: userError } = await supabase
      .from('chainrise_profile')
      .select('id, username, email, is_deleted')
      .eq('id', userId)
      .single();

    if (userError || !user) {
      console.error('[adminRestoreUser] User verification failed:', userError);
      return { error: 'User not found' };
    }

    if (!user.is_deleted) {
      return { error: 'User is not deleted' };
    }

    // 3. Create Supabase admin client with service role key
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // 4. Update user in Auth system using service role key
    const { error: authError } = await supabaseAdmin.auth.admin.updateUserById(
      userId,
      { 
        user_metadata: {
          soft_deleted: false
        }
      }
    );

    if (authError) {
      console.warn('[adminRestoreUser] Auth update warning:', authError);
      // Continue with profile update even if auth update fails
    }

    // 5. Update user delete status
    const { error: updateError } = await supabase
      .from('chainrise_profile')
      .update({
        is_deleted: false,
        deleted_at: null,
        deleted_by: null,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId);

    if (updateError) {
      console.error('[adminRestoreUser] Restore failed:', updateError);
      return { error: 'Failed to restore user' };
    }

    // 6. Record restore action
    await supabase
      .from('chainrise_admin_actions')
      .insert({
        admin_id: adminId,
        user_id: userId,
        action_type: 'restore',
        description: `User restored: ${reason}`,
        metadata: {
          reason: reason
        }
      });

    console.log('[adminRestoreUser] User restored successfully');
    return { success: true };
  } catch (err) {
    console.error('[adminRestoreUser] Unexpected error:', err);
    return { error: 'An unexpected error occurred' };
  }
}

// Send ban notification to user
async function sendUserBanNotification(params: {
  userId: string;
  reason: string;
  adminId: string;
}) {
  try {
    const { data: user } = await supabase
      .from('chainrise_profile')
      .select('email, name')
      .eq('id', params.userId)
      .single();

    if (!user?.email) return;

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USERNAME!,
        pass: process.env.EMAIL_PASSWORD!,
      },
    });

    const mailOptions = {
      from: `ChainRise Admin <${process.env.EMAIL_USERNAME}>`,
      to: user.email,
      subject: 'Account Suspension Notice',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #dc3545;">Account Suspended</h2>
          <p>Dear ${user.name || 'Valued Customer'},</p>
          <p>We regret to inform you that your ChainRise account has been suspended.</p>
          ${params.reason ? `<p><strong>Reason:</strong> ${params.reason}</p>` : ''}
          <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p><strong>What this means:</strong></p>
            <ul>
              <li>You will not be able to log in to your account</li>
              <li>All active investments will be paused</li>
              <li>Pending withdrawals will be put on hold</li>
            </ul>
          </div>
          <p>If you believe this is an error, please contact our support team for assistance.</p>
          <p>Best regards,<br>ChainRise Support Team</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`Ban notification sent to ${user.email}`);
  } catch (error) {
    console.error('Failed to send ban notification:', error);
  }
}

// Add these to your existing adminauth.ts file

// Get single user profile for editing
export async function getUserProfile(userId: string): Promise<{ data?: any; error?: string }> {
  try {
    const { data: profile, error } = await supabase
      .from('chainrise_profile')
      .select('*')
      .eq('id', userId)
      .single();

    if (error || !profile) {
      return { error: 'User not found' };
    }

    return { data: profile };
  } catch (err) {
    console.error('[getUserProfile] Unexpected error:', err);
    return { error: 'An unexpected error occurred' };
  }
}



export async function setUserWithdrawalLimits({
  userId,
  adminId,
  minWithdrawal,
  maxWithdrawal,
  dailyLimit,
  weeklyLimit,
  monthlyLimit
}: {
  userId: string;
  adminId: string;
  minWithdrawal?: number;
  maxWithdrawal?: number;
  dailyLimit?: number;
  weeklyLimit?: number;
  monthlyLimit?: number;
}): Promise<{ success?: boolean; error?: string }> {
  try {
    // Verify admin privileges
    const { data: admin } = await supabase
      .from('chainrise_profile')
      .select('is_admin')
      .eq('id', adminId)
      .single();

    if (!admin?.is_admin) {
      return { error: 'Unauthorized: Admin privileges required' };
    }

    const { error } = await supabase.rpc('admin_set_withdrawal_limits', {
      target_user_id: userId,
      admin_id: adminId,
      min_withdrawal: minWithdrawal,
      max_withdrawal: maxWithdrawal,
      daily_limit: dailyLimit,
      weekly_limit: weeklyLimit,
      monthly_limit: monthlyLimit
    });

    if (error) {
      console.error('[setUserWithdrawalLimits] Failed:', error);
      return { error: 'Failed to set withdrawal limits: ' + error.message };
    }

    return { success: true };
  } catch (err) {
    console.error('[setUserWithdrawalLimits] Unexpected error:', err);
    return { error: 'An unexpected error occurred' };
  }
}

// Get user withdrawal limits
export async function getUserWithdrawalLimits(userId: string): Promise<{
  data?: {
    min_withdrawal: number;
    max_withdrawal: number;
    daily_limit: number;
    weekly_limit: number;
    monthly_limit: number;
    is_active: boolean;
  };
  error?: string;
}> {
  try {
    const { data: limits, error } = await supabase
      .from('chainrise_withdrawal_limits')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows found
      return { error: 'Failed to fetch withdrawal limits' };
    }

    // Return defaults if no custom limits set
    if (!limits) {
      return {
        data: {
          min_withdrawal: 10.00,
          max_withdrawal: 1000.00,
          daily_limit: 5000.00,
          weekly_limit: 20000.00,
          monthly_limit: 50000.00,
          is_active: true
        }
      };
    }

    return { data: limits };
  } catch (err) {
    console.error('[getUserWithdrawalLimits] Unexpected error:', err);
    return { error: 'An unexpected error occurred' };
  }
}


 export async function adminUpdateUserEmail({
  userId,
  adminId,
  newEmail
}: {
  userId: string;
  adminId: string;
  newEmail: string;
}): Promise<{ success?: boolean; error?: string }> {
  try {
    console.log('🔧 [adminUpdateUserEmail] STARTING EMAIL UPDATE:', { 
      userId, 
      adminId, 
      newEmail 
    });

    // 1. Verify admin privileges
    const { data: admin, error: adminError } = await supabase
      .from('chainrise_profile')
      .select('is_admin')
      .eq('id', adminId)
      .single();

    if (adminError || !admin || !admin.is_admin) {
      console.error('❌ [adminUpdateUserEmail] Admin verification failed');
      return { error: 'Unauthorized: Admin privileges required' };
    }

    console.log('✅ [adminUpdateUserEmail] Admin verified');

    // 2. Create Supabase admin client with service role key
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    // 3. Update email in Auth system
    console.log('🔄 [adminUpdateUserEmail] Updating auth email...');
    const { error: authError } = await supabaseAdmin.auth.admin.updateUserById(
      userId,
      { email: newEmail }
    );

    if (authError) {
      console.error('❌ [adminUpdateUserEmail] Auth update failed:', authError);
      return { error: `Failed to update auth email: ${authError.message}` };
    }

    console.log('✅ [adminUpdateUserEmail] Auth email updated successfully');

    // 4. Update email in profile table
    console.log('🔄 [adminUpdateUserEmail] Updating profile email...');
    const { error: profileError } = await supabase
      .from('chainrise_profile')
      .update({
        email: newEmail,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId);

    if (profileError) {
      console.error('❌ [adminUpdateUserEmail] Profile update failed:', profileError);
      
      // Attempt to revert auth email if profile update fails
      console.log('🔄 [adminUpdateUserEmail] Attempting to revert auth email...');
      const { data: oldUser } = await supabase
        .from('chainrise_profile')
        .select('email')
        .eq('id', userId)
        .single();
      
      if (oldUser?.email) {
        await supabaseAdmin.auth.admin.updateUserById(userId, { email: oldUser.email });
      }
      
      return { error: `Failed to update profile email: ${profileError.message}` };
    }

    console.log('✅ [adminUpdateUserEmail] Profile email updated successfully');

    // 5. Record the action in admin logs
    await supabase
      .from('chainrise_admin_actions')
      .insert({
        admin_id: adminId,
        user_id: userId,
        action_type: 'update_email',
        description: `User email updated to: ${newEmail}`,
        metadata: {
          previous_email: '', // You might want to fetch and store the old email
          new_email: newEmail
        }
      });

    // 6. Send notification to user
    await sendEmailUpdateNotification({
      userId,
      newEmail,
      adminId
    });

    console.log('✅ [adminUpdateUserEmail] Email update completed successfully');
    return { success: true };

  } catch (err) {
    console.error('💥 [adminUpdateUserEmail] Unexpected error:', err);
    return { error: 'An unexpected error occurred: ' + (err instanceof Error ? err.message : 'Unknown error') };
  }
}

// Send email update notification
async function sendEmailUpdateNotification(params: {
  userId: string;
  newEmail: string;
  adminId: string;
}) {
  try {
    const { data: user } = await supabase
      .from('chainrise_profile')
      .select('email, name')
      .eq('id', params.userId)
      .single();

    if (!user?.email) return;

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USERNAME!,
        pass: process.env.EMAIL_PASSWORD!,
      },
    });

    const mailOptions = {
      from: `ChainRise Admin <${process.env.EMAIL_USERNAME}>`,
      to: user.email, // Send to OLD email address
      subject: 'Email Address Updated',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2a52be;">Email Address Updated</h2>
          <p>Dear ${user.name || 'Valued Customer'},</p>
          <p>Your account email address has been updated by an administrator.</p>
          <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p><strong>New Email Address:</strong> ${params.newEmail}</p>
            <p><strong>Update Date:</strong> ${new Date().toLocaleDateString()}</p>
          </div>
          <p>Please use your new email address (<strong>${params.newEmail}</strong>) for all future logins and communications.</p>
          <p>If you did not request this change, please contact our support team immediately.</p>
          <p>Best regards,<br>ChainRise Support Team</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`Email update notification sent to ${user.email}`);
  } catch (error) {
    console.error('Failed to send email update notification:', error);
  }
}


// Add these to your adminauth.ts file
 