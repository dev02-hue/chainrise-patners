/* eslint-disable @typescript-eslint/no-explicit-any */
'use server'

import { supabase } from '@/lib/supabaseClient'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { getSession } from './auth'
import { Profile, UpdateUserProfileInput } from '@/types/businesses'
import { getTotalUsers } from './getProfileData'
import nodemailer from 'nodemailer'



// Updated admin session management
export async function getAdminSession() {
  try {

    const cookieStore = await cookies()
    const adminId = cookieStore.get('admin-id')?.value
    const isAuthenticated = cookieStore.get('admin-authenticated')?.value

    if (!adminId || isAuthenticated !== 'true') {
      return { isAuthenticated: false, admin: null }
    }

    // Verify admin exists in chainrise_profile and has admin privileges
    const { data: admin, error } = await supabase
      .from('chainrise_profile')
      .select('id, username, email, is_admin')
      .eq('id', adminId)
      .eq('is_admin', true) // Ensure they're actually an admin
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
  transactionType = 'bonus', // 'bonus', 'deposit', 'refund', 'correction'
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
}): Promise<{ success?: boolean; error?: string; depositId?: string }> {
  try {
    console.log('[adminFundUser] Starting admin funding process:', {
      userId, amount, cryptoType, transactionType, description, adminId
    });

    // 1. Verify admin privileges
    const { data: admin, error: adminError } = await supabase
      .from('chainrise_profile')
      .select('is_admin')
      .eq('id', adminId)
      .single();

    if (adminError || !admin || !admin.is_admin) {
      console.error('[adminFundUser] Admin verification failed:', adminError);
      return { error: 'Unauthorized: Admin privileges required' };
    }

    // 2. Verify target user exists and is active
    const { data: user, error: userError } = await supabase
      .from('chainrise_profile')
      .select('id, email, username, is_banned, is_active, balance, total_bonus, total_penalty, total_deposited')
      .eq('id', userId)
      .single();

    if (userError || !user) {
      console.error('[adminFundUser] User verification failed:', userError);
      return { error: 'User not found' };
    }

    if (user.is_banned) {
      return { error: 'Cannot fund banned user' };
    }

    if (!user.is_active) {
      return { error: 'Cannot fund inactive user' };
    }

    // 3. Validate amount
    if (amount <= 0) {
      return { error: 'Amount must be greater than 0' };
    }

    // 4. Generate reference
    const reference = `ADM-${transactionType.toUpperCase()}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    // 5. Create admin deposit record
    const { data: deposit, error: depositError } = await supabase
      .from('chainrise_deposits')
      .insert([{
        user_id: userId,
        amount,
        crypto_type: cryptoType,
        wallet_address: 'ADMIN_FUNDING', // Special indicator for admin funding
        reference,
        status: 'completed', // Auto-complete admin deposits
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
      return { error: 'Failed to create funding record' };
    }

    // 6. Update user balance and relevant totals
    const updateData: any = {
      balance: user.balance + amount,
      updated_at: new Date().toISOString()
    };

    // Update specific totals based on transaction type
    if (transactionType === 'bonus') {
      updateData.total_bonus = (user.total_bonus || 0) + amount;
    } else if (transactionType === 'deposit') {
      // For regular deposits, you might want to track differently
      updateData.total_deposited = (user.total_deposited || 0) + amount;
    }

    const { error: updateError } = await supabase
      .from('chainrise_profile')
      .update(updateData)
      .eq('id', userId);

    if (updateError) {
      console.error('[adminFundUser] User balance update failed:', updateError);
      
      // Rollback deposit record
      await supabase
        .from('chainrise_deposits')
        .delete()
        .eq('id', deposit.id);
      
      return { error: 'Failed to update user balance' };
    }

    // 7. Record transaction
    await supabase
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
          description: description
        }
      });

    // 8. Send notification if requested
    if (sendEmailNotification) {
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
    return { success: true, depositId: deposit.id };
  } catch (err) {
    console.error('[adminFundUser] Unexpected error:', err);
    return { error: 'An unexpected error occurred' };
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
    // Verify admin privileges
    const { data: admin } = await supabase
      .from('chainrise_profile')
      .select('is_admin')
      .eq('id', adminId)
      .single();

    if (!admin?.is_admin) {
      return { error: 'Unauthorized: Admin privileges required' };
    }

    const { error } = await supabase
      .from('chainrise_profile')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId);

    if (error) {
      console.error('[adminUpdateUserProfile] Update failed:', error);
      return { error: 'Failed to update user profile' };
    }

    return { success: true };
  } catch (err) {
    console.error('[adminUpdateUserProfile] Unexpected error:', err);
    return { error: 'An unexpected error occurred' };
  }
}

// Update user email (requires auth update)
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
    // Verify admin privileges
    const { data: admin } = await supabase
      .from('chainrise_profile')
      .select('is_admin')
      .eq('id', adminId)
      .single();

    if (!admin?.is_admin) {
      return { error: 'Unauthorized: Admin privileges required' };
    }

    // Update in auth system (this would require Supabase admin API)
    // Note: This might require additional setup with Supabase Admin API
    
    // Update in profile table
    const { error } = await supabase
      .from('chainrise_profile')
      .update({
        email: newEmail,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId);

    if (error) {
      console.error('[adminUpdateUserEmail] Update failed:', error);
      return { error: 'Failed to update user email' };
    }

    return { success: true };
  } catch (err) {
    console.error('[adminUpdateUserEmail] Unexpected error:', err);
    return { error: 'An unexpected error occurred' };
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

    // 3. Update user delete status
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

    // 4. Record delete action
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

    // 3. Update user delete status
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

    // 4. Record restore action
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