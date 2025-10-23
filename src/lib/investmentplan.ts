/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";
import { redirect } from "next/navigation";
import { getSession } from "./auth";
import { supabase } from "./supabaseClient";
import nodemailer from "nodemailer";
import { processReferralBonus } from "./referral";

// Types
export interface UserInvestment {
  id: string;
  userId: string;
  planId: string;
  amount: number;
  currentBalance: number;
  totalEarned: number;
  startDate: string;
  endDate: string;
  withdrawalLockUntil?: string;
  status: 'active' | 'completed' | 'cancelled';
  lastProfitCalculated?: string;
  planTitle?: string;
  dailyProfitPercentage?: number;
}

export interface InvestmentPlan {
  id: string;
  title: string;
  description: string;
  min_amount: number;
  max_amount: number | null;
  daily_profit_percentage: number;
  duration_days: number;
  total_return_percentage: number;
  features: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Deposit {
  id: string;
  amount: number;
  cryptoType: string;
  status: 'pending' | 'confirmed' | 'completed' | 'failed' | 'cancelled';
  reference: string;
  createdAt: string;
  processedAt?: string;
  transactionHash?: string;
  adminNotes?: string;
  planTitle?: string;
  userEmail?: string;
  username?: string;
}

export interface CryptoPaymentOption {
  id: string;
  name: string;
  symbol: string;
  network: string;
  walletAddress: string;
}

export interface DepositInput {
  planId: string;
  amount: number;
  cryptoType: string;
  transactionHash?: string;
}

export type DepositStatus = 'pending' | 'confirmed' | 'completed' | 'failed' | 'cancelled';

// Investment Plan Functions
export async function getInvestmentPlans(): Promise<{ data?: InvestmentPlan[]; error?: string }> {
  try {
    const { data: plans, error } = await supabase
      .from('chainrise_investment_plans')
      .select('*')
      .eq('is_active', true)
      .order('min_amount', { ascending: true });

    if (error) {
      console.error('Error fetching investment plans:', error);
      return { error: 'Failed to fetch investment plans' };
    }

    return { data: plans || [] };
  } catch (err) {
    console.error('Unexpected error in getInvestmentPlans:', err);
    return { error: 'An unexpected error occurred' };
  }
}

export async function updateInvestmentPlan(input: any): Promise<{ success: boolean; error?: string }> {
  try {
    const { id, ...updateFields } = input;

    const { error } = await supabase
      .from('chainrise_investment_plans')
      .update({
        ...updateFields,
        updated_at: new Date().toISOString()
      })
      .eq('id', id);

    if (error) {
      console.error('Error updating investment plan:', error);
      return { success: false, error: 'Failed to update investment plan' };
    }

    return { success: true };
  } catch (err) {
    console.error('Unexpected error in updateInvestmentPlan:', err);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

// Crypto Payment Options
export async function getCryptoPaymentOptions(): Promise<{ data?: CryptoPaymentOption[]; error?: string }> {
  try {
    const { data: options, error } = await supabase
      .from('chainrise_crypto_payment_options')
      .select('*')
      .eq('is_active', true);

    if (error) {
      console.error('Error fetching crypto payment options:', error);
      return { error: 'Failed to fetch payment options' };
    }

    return {
      data: options?.map(option => ({
        id: option.id,
        name: option.name,
        symbol: option.symbol,
        network: option.network,
        walletAddress: option.wallet_address
      })) || []
    };
  } catch (err) {
    console.error('Unexpected error in getCryptoPaymentOptions:', err);
    return { error: 'An unexpected error occurred' };
  }
}

// Create a new investment
export async function createInvestment(
  planId: string,
  amount: number
): Promise<{ success?: boolean; error?: string; investment?: UserInvestment }> {
  try {
    console.log('Starting createInvestment with planId:', planId, 'amount:', amount);

    const session = await getSession();
    if (!session?.user) {
      console.log('No session found - not authenticated');
      if (typeof window !== 'undefined') {
        window.location.href = '/signin';
      } else {
        redirect('/signin');
      }
      return { error: 'Not authenticated' };
    }

    const userId = session.user.id;
    console.log('User ID:', userId);

    // Fetch investment plan
    const { data: plan, error: planError } = await supabase
      .from('chainrise_investment_plans')
      .select('*')
      .eq('id', planId)
      .single();

    if (planError || !plan) {
      console.error('Plan error:', planError, 'Plan data:', plan);
      return { error: 'Invalid investment plan' };
    }

    const { min_amount, max_amount, daily_profit_percentage, duration_days } = plan;

    console.log('Plan details:', {
      min_amount,
      max_amount,
      daily_profit_percentage,
      duration_days
    });

    // Validate amount range
    if (amount < min_amount || (max_amount && amount > max_amount)) {
      console.log(`Amount ${amount} is outside plan range (${min_amount}-${max_amount})`);
      return { error: `Amount must be between $${min_amount} and $${max_amount} for this plan` };
    }

    // Check user balance and total_invested
    const { data: user, error: userError } = await supabase
      .from('chainrise_profile')
      .select('balance, total_invested')
      .eq('id', userId)
      .single();

    if (userError || !user) {
      console.error('User balance error:', userError, 'User data:', user);
      return { error: 'Failed to fetch user balance' };
    }

    console.log('User balance:', user.balance);
    if (user.balance < amount) {
      return { error: 'Insufficient balance' };
    }

    const currentDate = new Date();
    const endDate = new Date(currentDate);
    endDate.setDate(endDate.getDate() + duration_days);
    
    // Withdrawal lock period (2 months from start)
    const withdrawalLockUntil = new Date(currentDate);
    withdrawalLockUntil.setMonth(withdrawalLockUntil.getMonth() + 2);

    console.log('Calculated dates:', {
      endDate: endDate.toISOString(),
      withdrawalLockUntil: withdrawalLockUntil.toISOString()
    });

    // Start transaction: Deduct amount from user balance
    const { error: balanceUpdateError } = await supabase
      .from('chainrise_profile')
      .update({ 
        balance: user.balance - amount,
        total_invested: (user.total_invested || 0) + amount
      })
      .eq('id', userId);

    if (balanceUpdateError) {
      console.error('Failed to deduct from user balance:', balanceUpdateError);
      return { error: 'Failed to process investment' };
    }

    // Create investment record
    const { data: investment, error: investmentError } = await supabase
      .from('chainrise_investments')
      .insert({
        user_id: userId,
        plan_id: planId,
        amount: amount,
        current_balance: amount, // Start with initial amount
        total_earned: 0.00,
        start_date: currentDate.toISOString(),
        end_date: endDate.toISOString(),
        withdrawal_lock_until: withdrawalLockUntil.toISOString(),
        status: 'active',
        last_profit_calculated: currentDate.toISOString()
      })
      .select(`
        *,
        chainrise_investment_plans!inner (
          title,
          daily_profit_percentage
        )
      `)
      .single();

    if (investmentError) {
      console.error('Investment creation failed:', investmentError);
      
      // Rollback balance deduction if investment creation fails
      await supabase
        .from('chainrise_profile')
        .update({ 
          balance: user.balance,
          total_invested: user.total_invested
        })
        .eq('id', userId);
      
      return { error: 'Failed to create investment' };
    }

    // Record transaction
    await supabase
      .from('chainrise_transactions')
      .insert({
        user_id: userId,
        type: 'investment',
        amount: amount,
        currency: 'USD',
        description: `Investment in ${plan.title}`,
        reference: `INV-${investment.id.slice(0, 8)}`,
        status: 'completed',
        metadata: {
          plan_id: planId,
          investment_id: investment.id,
          plan_title: plan.title
        }
      });

    console.log('Investment created successfully:', investment);

    // Type-safe extraction of nested data
    const investmentData = investment as any;
    const planData = investmentData.chainrise_investment_plans;

    return {
      success: true,
      investment: {
        id: investmentData.id,
        userId: investmentData.user_id,
        planId: investmentData.plan_id,
        amount: investmentData.amount,
        currentBalance: investmentData.current_balance,
        totalEarned: investmentData.total_earned,
        startDate: investmentData.start_date,
        endDate: investmentData.end_date,
        withdrawalLockUntil: investmentData.withdrawal_lock_until,
        status: investmentData.status,
        lastProfitCalculated: investmentData.last_profit_calculated,
        planTitle: planData?.title,
        dailyProfitPercentage: planData?.daily_profit_percentage
      }
    };
  } catch (err) {
    console.error('Unexpected error in createInvestment:', err);
    return { error: 'An unexpected error occurred' };
  }
}

// Get user investments
export async function getUserInvestments(): Promise<{ data?: UserInvestment[]; error?: string }> {
  try {
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

    const { data, error } = await supabase
      .from('chainrise_investments')
      .select(`
        id,
        user_id,
        plan_id,
        amount,
        current_balance,
        total_earned,
        start_date,
        end_date,
        withdrawal_lock_until,
        status,
        last_profit_calculated,
        created_at,
        chainrise_investment_plans!inner (
          title,
          daily_profit_percentage
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching investments:', error);
      return { error: 'Failed to fetch investments' };
    }

    // Type-safe mapping
    const investments: UserInvestment[] = (data || []).map((inv: any) => ({
      id: inv.id,
      userId: inv.user_id,
      planId: inv.plan_id,
      amount: inv.amount,
      currentBalance: inv.current_balance,
      totalEarned: inv.total_earned,
      startDate: inv.start_date,
      endDate: inv.end_date,
      withdrawalLockUntil: inv.withdrawal_lock_until,
      status: inv.status,
      lastProfitCalculated: inv.last_profit_calculated,
      planTitle: inv.chainrise_investment_plans?.title,
      dailyProfitPercentage: inv.chainrise_investment_plans?.daily_profit_percentage
    }));

    return { data: investments };
  } catch (err) {
    console.error('Unexpected error in getUserInvestments:', err);
    return { error: 'An unexpected error occurred' };
  }
}

// Calculate daily profits (to be called by a cron job)
export async function calculateDailyProfits(): Promise<{ success?: boolean; error?: string }> {
  try {
    console.log('Starting daily profit calculation...');

    // Call the PostgreSQL function to calculate profits
    const { error } = await supabase.rpc('calculate_daily_profits');

    if (error) {
      console.error('Error calculating daily profits:', error);
      return { error: 'Failed to calculate daily profits' };
    }

    console.log('Daily profits calculated successfully');
    return { success: true };
  } catch (err) {
    console.error('Unexpected error in calculateDailyProfits:', err);
    return { error: 'An unexpected error occurred' };
  }
}

// Check withdrawal eligibility
export async function checkWithdrawalEligibility(
  investmentId?: string
): Promise<{ 
  canWithdraw?: boolean; 
  availableAmount?: number; 
  message?: string; 
  error?: string 
}> {
  try {
    const session = await getSession();
    if (!session?.user) {
      return { error: 'Not authenticated' };
    }

    const userId = session.user.id;

    const { data, error } = await supabase.rpc('check_withdrawal_eligibility', {
      user_uuid: userId,
      investment_uuid: investmentId || null
    });

    if (error) {
      console.error('Error checking withdrawal eligibility:', error);
      return { error: 'Failed to check withdrawal eligibility' };
    }

    if (data && data.length > 0) {
      return {
        canWithdraw: data[0].can_withdraw,
        availableAmount: data[0].available_amount,
        message: data[0].message
      };
    }

    return { error: 'No data returned' };
  } catch (err) {
    console.error('Unexpected error in checkWithdrawalEligibility:', err);
    return { error: 'An unexpected error occurred' };
  }
}

// Withdraw from investment
export async function withdrawFromInvestment(
  investmentId: string,
  amount: number
): Promise<{ success?: boolean; error?: string }> {
  try {
    const session = await getSession();
    if (!session?.user) {
      return { error: 'Not authenticated' };
    }

    const userId = session.user.id;

    // First check eligibility
    const eligibility = await checkWithdrawalEligibility(investmentId);
    if (eligibility.error || !eligibility.canWithdraw) {
      return { error: eligibility.message || 'Withdrawal not allowed' };
    }

    if (amount > (eligibility.availableAmount || 0)) {
      return { error: 'Insufficient funds available for withdrawal' };
    }

    // Start transaction
    const { data: investment, error: investmentError } = await supabase
      .from('chainrise_investments')
      .select('current_balance, plan_id')
      .eq('id', investmentId)
      .eq('user_id', userId)
      .single();

    if (investmentError || !investment) {
      return { error: 'Investment not found' };
    }

    // Update investment balance
    const { error: updateError } = await supabase
      .from('chainrise_investments')
      .update({ 
        current_balance: investment.current_balance - amount,
        updated_at: new Date().toISOString()
      })
      .eq('id', investmentId);

    if (updateError) {
      return { error: 'Failed to update investment balance' };
    }

    // Add to user balance using proper Supabase increment
    const { data: user, error: userError } = await supabase
      .from('chainrise_profile')
      .select('balance')
      .eq('id', userId)
      .single();

    if (userError || !user) {
      // Rollback investment update
      await supabase
        .from('chainrise_investments')
        .update({ 
          current_balance: investment.current_balance,
          updated_at: new Date().toISOString()
        })
        .eq('id', investmentId);
      return { error: 'Failed to fetch user balance' };
    }

    const { error: balanceError } = await supabase
      .from('chainrise_profile')
      .update({ 
        balance: user.balance + amount,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId);

    if (balanceError) {
      // Rollback investment update
      await supabase
        .from('chainrise_investments')
        .update({ 
          current_balance: investment.current_balance,
          updated_at: new Date().toISOString()
        })
        .eq('id', investmentId);
      
      return { error: 'Failed to process withdrawal' };
    }

    // Record withdrawal transaction
    await supabase
      .from('chainrise_transactions')
      .insert({
        user_id: userId,
        type: 'withdrawal',
        amount: amount,
        currency: 'USD',
        description: `Withdrawal from investment`,
        reference: `WD-${investmentId.slice(0, 8)}-${Date.now()}`,
        status: 'completed',
        metadata: {
          investment_id: investmentId,
          plan_id: investment.plan_id
        }
      });

    return { success: true };
  } catch (err) {
    console.error('Unexpected error in withdrawFromInvestment:', err);
    return { error: 'An unexpected error occurred' };
  }
}

// Manual profit withdrawal (withdraw only profits)
export async function withdrawProfitsFromInvestment(
  investmentId: string
): Promise<{ success?: boolean; error?: string; amount?: number }> {
  try {
    const session = await getSession();
    if (!session?.user) {
      return { error: 'Not authenticated' };
    }

    const userId = session.user.id;

    // Get investment details
    const { data: investment, error: investmentError } = await supabase
      .from('chainrise_investments')
      .select('current_balance, amount, total_earned')
      .eq('id', investmentId)
      .eq('user_id', userId)
      .single();

    if (investmentError || !investment) {
      return { error: 'Investment not found' };
    }

    // Calculate available profits (current balance minus initial amount)
    const availableProfits = investment.current_balance - investment.amount;
    
    if (availableProfits <= 0) {
      return { error: 'No profits available for withdrawal' };
    }

    // Withdraw only the profits
    return await withdrawFromInvestment(investmentId, availableProfits);
  } catch (err) {
    console.error('Unexpected error in withdrawProfitsFromInvestment:', err);
    return { error: 'An unexpected error occurred' };
  }
}

// Deposit Functions
export async function initiateDeposit({
  planId,
  amount,
  cryptoType,
  transactionHash
}: DepositInput): Promise<{ success?: boolean; error?: string; depositId?: string }> {
  try {
    console.log('[initiateDeposit] Starting deposit process');

    const session = await getSession();
    if (!session?.user) {
      console.warn('[initiateDeposit] No authenticated user found');
      if (typeof window !== 'undefined') {
        window.location.href = '/signin';
      } else {
        redirect('/signin');
      }
      return { error: 'Not authenticated' };
    }

    const userId = session.user.id;

    // Validate plan
    const { data: plan, error: planError } = await supabase
      .from('chainrise_investment_plans')
      .select('min_amount, max_amount, title')
      .eq('id', planId)
      .single();

    if (planError || !plan) {
      console.error('[initiateDeposit] Plan validation failed:', planError || 'Plan not found');
      return { error: 'Invalid investment plan' };
    }

    if (amount < plan.min_amount || (plan.max_amount && amount > plan.max_amount)) {
      return { error: `Amount must be between $${plan.min_amount} and $${plan.max_amount} for this plan` };
    }

    // Get crypto wallet address
    const { data: cryptoOption, error: cryptoError } = await supabase
      .from('chainrise_crypto_payment_options')
      .select('wallet_address')
      .eq('symbol', cryptoType)
      .single();

    if (cryptoError || !cryptoOption) {
      return { error: 'Invalid cryptocurrency selected' };
    }

    // Generate reference
    const reference = `DEP-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    // Create deposit record
    const { data: deposit, error: depositError } = await supabase
      .from('chainrise_deposits')
      .insert([{
        user_id: userId,
        investment_plan_id: planId,
        amount,
        crypto_type: cryptoType,
        wallet_address: cryptoOption.wallet_address,
        transaction_hash: transactionHash,
        reference,
        status: 'pending'
      }])
      .select()
      .single();

    if (depositError || !deposit) {
      console.error('[initiateDeposit] Deposit creation failed:', depositError);
      return { error: 'Failed to initiate deposit' };
    }

    // Notify admin
    await sendDepositNotificationToAdmin({
      userId,
      userEmail: session.user.email || '',
      amount,
      planTitle: plan.title,
      cryptoType,
      reference,
      depositId: deposit.id,
      walletAddress: cryptoOption.wallet_address,
      transactionHash
    });

    return { success: true, depositId: deposit.id };
  } catch (err) {
    console.error('[initiateDeposit] Unexpected error:', err);
    return { error: 'An unexpected error occurred' };
  }
}

// Get user deposits
export async function getUserDeposits(
  filters: {
    status?: DepositStatus;
    limit?: number;
    offset?: number;
  } = {}
): Promise<{ data?: Deposit[]; error?: string; count?: number }> {
  try {
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

    let query = supabase
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
        admin_notes,
        chainrise_investment_plans!inner(title)
      `, { count: 'exact' })
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (filters.status) {
      query = query.eq('status', filters.status);
    }

    if (filters.limit) {
      query = query.limit(filters.limit);
    }

    if (filters.offset !== undefined && filters.limit) {
      query = query.range(filters.offset, filters.offset + filters.limit - 1);
    }

    const { data, error, count } = await query;

    if (error) {
      console.error('Error fetching deposits:', error);
      return { error: 'Failed to fetch deposits' };
    }

    return {
      data: data?.map(deposit => ({
        id: deposit.id,
        amount: deposit.amount,
        cryptoType: deposit.crypto_type,
        status: deposit.status,
        reference: deposit.reference,
        createdAt: deposit.created_at,
        processedAt: deposit.processed_at,
        transactionHash: deposit.transaction_hash,
        adminNotes: deposit.admin_notes,
        planTitle: (deposit as any).chainrise_investment_plans?.title
      })),
      count: count || 0
    };
  } catch (err) {
    console.error('Unexpected error in getUserDeposits:', err);
    return { error: 'An unexpected error occurred' };
  }
}

// Get all deposits (admin)
export async function getAllDeposits(
  filters: {
    status?: DepositStatus;
    userId?: string;
    limit?: number;
    offset?: number;
  } = {}
): Promise<{ data?: Deposit[]; error?: string; count?: number }> {
  try {
    let query = supabase
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
        admin_notes,
        chainrise_investment_plans!inner(title),
        chainrise_profile!inner(email, username)
      `, { count: 'exact' })
      .order('created_at', { ascending: false });

    if (filters.status) {
      query = query.eq('status', filters.status);
    }

    if (filters.userId) {
      query = query.eq('user_id', filters.userId);
    }

    if (filters.limit) {
      query = query.limit(filters.limit);
    }

    if (filters.offset !== undefined && filters.limit) {
      query = query.range(filters.offset, filters.offset + filters.limit - 1);
    }

    const { data, error, count } = await query;

    if (error) {
      console.error('Error fetching deposits:', error);
      return { error: 'Failed to fetch deposits' };
    }

    return {
      data: data?.map(deposit => ({
        id: deposit.id,
        amount: deposit.amount,
        cryptoType: deposit.crypto_type,
        status: deposit.status,
        reference: deposit.reference,
        createdAt: deposit.created_at,
        processedAt: deposit.processed_at,
        transactionHash: deposit.transaction_hash,
        adminNotes: deposit.admin_notes,
        planTitle: (deposit as any).chainrise_investment_plans?.title,
        userEmail: (deposit as any).chainrise_profile?.email,
        username: (deposit as any).chainrise_profile?.username
      })),
      count: count || 0
    };
  } catch (err) {
    console.error('Unexpected error in getAllDeposits:', err);
    return { error: 'An unexpected error occurred' };
  }
}

// Helper function to send deposit notification to admin
async function sendDepositNotificationToAdmin(params: {
  userId: string;
  userEmail: string;
  amount: number;
  planTitle: string;
  cryptoType: string;
  reference: string;
  depositId: string;
  walletAddress: string;
  transactionHash?: string;
}) {
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    const mailOptions = {
      from: `ChainRise <${process.env.EMAIL_USERNAME}>`,
      to: process.env.ADMIN_EMAIL,
      subject: `New Deposit Request - $${params.amount} ${params.cryptoType}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2a52be;">New Deposit Request</h2>
          <p><strong>User ID:</strong> ${params.userId}</p>
          <p><strong>User Email:</strong> ${params.userEmail}</p>
          <p><strong>Plan:</strong> ${params.planTitle}</p>
          <p><strong>Amount:</strong> $${params.amount}</p>
          <p><strong>Crypto Type:</strong> ${params.cryptoType}</p>
          <p><strong>Wallet Address:</strong> ${params.walletAddress}</p>
          ${params.transactionHash ? `<p><strong>Transaction Hash:</strong> ${params.transactionHash}</p>` : ''}
          <p><strong>Reference:</strong> ${params.reference}</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error('Failed to send admin notification:', error);
  }
}



export async function approveDeposit(depositId: string): Promise<{ success?: boolean; error?: string; currentStatus?: string }> {
  try {
    // 1. Verify deposit exists and is pending
    const { data: deposit, error: fetchError } = await supabase
      .from('chainrise_deposits')
      .select('status, user_id, amount, investment_plan_id')
      .eq('id', depositId)
      .single();

    if (fetchError || !deposit) {
      console.error('Deposit fetch failed:', fetchError);
      return { error: 'Deposit not found' };
    }

    if (deposit.status !== 'pending') {
      return { 
        error: 'Deposit already processed',
        currentStatus: deposit.status 
      };
    }

    // 2. Process referral bonus if this is the user's first deposit
    if (deposit.amount > 0) {
      const { error: referralError } = await processReferralBonus(deposit.user_id, deposit.amount);
      if (referralError) {
        console.error('Referral bonus processing failed:', referralError);
        // Continue with deposit approval even if referral bonus fails
      }
    }

    // 3. Update status to completed and add to user balance
    const { error: updateError } = await supabase
      .from('chainrise_deposits')
      .update({ 
        status: 'completed',
        processed_at: new Date().toISOString()
      })
      .eq('id', depositId);

    if (updateError) {
      console.error('Approval failed:', updateError);
      return { error: 'Failed to approve deposit' };
    }

    // 4. Add deposit amount to user balance
    const { data: user, error: userError } = await supabase
      .from('chainrise_profile')
      .select('balance')
      .eq('id', deposit.user_id)
      .single();

    if (userError || !user) {
      console.error('User balance fetch failed:', userError);
      // Continue anyway since the deposit is marked as completed
    } else {
      const { error: balanceError } = await supabase
        .from('chainrise_profile')
        .update({ 
          balance: user.balance + deposit.amount,
          updated_at: new Date().toISOString()
        })
        .eq('id', deposit.user_id);

      if (balanceError) {
        console.error('Balance update failed:', balanceError);
        // Log the error but don't fail the approval
      }

      // Record transaction
      await supabase
        .from('chainrise_transactions')
        .insert({
          user_id: deposit.user_id,
          type: 'deposit',
          amount: deposit.amount,
          currency: 'USD',
          description: `Deposit approved`,
          reference: `DEP-APPROVED-${depositId.slice(0, 8)}`,
          status: 'completed',
          metadata: {
            deposit_id: depositId,
            plan_id: deposit.investment_plan_id
          }
        });
    }

    // 5. Send confirmation to user
    await sendDepositConfirmationToUser(deposit.user_id, deposit.amount, depositId);

    return { success: true };
  } catch (err) {
    console.error('Unexpected error in approveDeposit:', err);
    return { error: 'An unexpected error occurred' };
  }
}

// Reject a deposit (Admin function)
export async function rejectDeposit(depositId: string, adminNotes: string = ''): Promise<{ success?: boolean; error?: string; currentStatus?: string }> {
  try {
    // 1. Verify deposit exists and is pending
    const { data: deposit, error: fetchError } = await supabase
      .from('chainrise_deposits')
      .select('status, user_id, amount')
      .eq('id', depositId)
      .single();

    if (fetchError || !deposit) {
      console.error('Deposit fetch failed:', fetchError);
      return { error: 'Deposit not found' };
    }

    if (deposit.status !== 'pending') {
      return { 
        error: 'Deposit already processed',
        currentStatus: deposit.status 
      };
    }

    // 2. Update status to rejected
    const { error: updateError } = await supabase
      .from('chainrise_deposits')
      .update({ 
        status: 'cancelled',
        processed_at: new Date().toISOString(),
        admin_notes: adminNotes
      })
      .eq('id', depositId);

    if (updateError) {
      console.error('Rejection failed:', updateError);
      return { error: 'Failed to reject deposit' };
    }

    // 3. Send rejection notification to user
    await sendDepositRejectionToUser(deposit.user_id, deposit.amount, depositId, adminNotes);

    return { success: true };
  } catch (err) {
    console.error('Unexpected error in rejectDeposit:', err);
    return { error: 'An unexpected error occurred' };
  }
}

// Confirm deposit (when transaction hash is provided)
export async function confirmDeposit(depositId: string, transactionHash: string): Promise<{ success?: boolean; error?: string }> {
  try {
    const { data: deposit, error: fetchError } = await supabase
      .from('chainrise_deposits')
      .select('status, user_id')
      .eq('id', depositId)
      .single();

    if (fetchError || !deposit) {
      console.error('Deposit fetch failed:', fetchError);
      return { error: 'Deposit not found' };
    }

    if (deposit.status !== 'pending') {
      return { error: 'Deposit already processed' };
    }

    const { error: updateError } = await supabase
      .from('chainrise_deposits')
      .update({ 
        status: 'confirmed',
        transaction_hash: transactionHash,
        confirmed_at: new Date().toISOString()
      })
      .eq('id', depositId);

    if (updateError) {
      console.error('Confirmation failed:', updateError);
      return { error: 'Failed to confirm deposit' };
    }

    return { success: true };
  } catch (err) {
    console.error('Unexpected error in confirmDeposit:', err);
    return { error: 'An unexpected error occurred' };
  }
}

// Helper function to send deposit confirmation to user
async function sendDepositConfirmationToUser(userId: string, amount: number, depositId: string) {
  try {
    const { data: user } = await supabase
      .from('chainrise_profile')
      .select('email, name')
      .eq('id', userId)
      .single();

    if (!user?.email) return;

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    const mailOptions = {
      from: `ChainRise <${process.env.EMAIL_USERNAME}>`,
      to: user.email,
      subject: `Deposit of $${amount} Approved`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2a52be;">Deposit Approved ✅</h2>
          <p>Dear ${user.name || 'Valued Customer'},</p>
          <p>We're pleased to inform you that your deposit of <strong>$${amount}</strong> has been approved and your account balance has been updated.</p>
          <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Deposit ID:</strong> ${depositId}</p>
            <p><strong>Amount:</strong> $${amount}</p>
            <p><strong>Status:</strong> Completed</p>
          </div>
          <p>You can now use these funds to make investments in any of our available plans.</p>
          <p>Thank you for choosing ChainRise!</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`Deposit confirmation email sent to ${user.email}`);
  } catch (error) {
    console.error('Failed to send deposit confirmation:', error);
  }
}

// Helper function to send deposit rejection to user
async function sendDepositRejectionToUser(userId: string, amount: number, depositId: string, adminNotes: string) {
  try {
    const { data: user } = await supabase
      .from('chainrise_profile')
      .select('email, name')
      .eq('id', userId)
      .single();

    if (!user?.email) return;

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    const mailOptions = {
      from: `ChainRise <${process.env.EMAIL_USERNAME}>`,
      to: user.email,
      subject: `Deposit of $${amount} Requires Attention`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #dc3545;">Deposit Requires Attention</h2>
          <p>Dear ${user.name || 'Valued Customer'},</p>
          <p>We regret to inform you that your deposit of <strong>$${amount}</strong> could not be processed.</p>
          <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Deposit ID:</strong> ${depositId}</p>
            <p><strong>Amount:</strong> $${amount}</p>
            <p><strong>Status:</strong> Cancelled</p>
            ${adminNotes ? `<p><strong>Admin Notes:</strong> ${adminNotes}</p>` : ''}
          </div>
          <p>If you believe this is an error, please contact our support team with your deposit details.</p>
          <p>Best regards,<br>ChainRise Support Team</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`Deposit rejection email sent to ${user.email}`);
  } catch (error) {
    console.error('Failed to send deposit rejection:', error);
  }
}

// Get deposit by ID
export async function getDepositById(depositId: string): Promise<{ data?: Deposit; error?: string }> {
  try {
    const { data: deposit, error } = await supabase
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
        admin_notes,
        wallet_address,
        chainrise_investment_plans!inner(title),
        chainrise_profile!inner(email, username, name)
      `)
      .eq('id', depositId)
      .single();

    if (error) {
      console.error('Error fetching deposit:', error);
      return { error: 'Failed to fetch deposit' };
    }

    if (!deposit) {
      return { error: 'Deposit not found' };
    }

    return {
      data: {
        id: deposit.id,
        amount: deposit.amount,
        cryptoType: deposit.crypto_type,
        status: deposit.status,
        reference: deposit.reference,
        createdAt: deposit.created_at,
        processedAt: deposit.processed_at,
        transactionHash: deposit.transaction_hash,
        adminNotes: deposit.admin_notes,
        planTitle: (deposit as any).chainrise_investment_plans?.title,
        userEmail: (deposit as any).chainrise_profile?.email,
        username: (deposit as any).chainrise_profile?.username
      }
    };
  } catch (err) {
    console.error('Unexpected error in getDepositById:', err);
    return { error: 'An unexpected error occurred' };
  }
}

// Update deposit status
export async function updateDepositStatus(
  depositId: string, 
  status: DepositStatus, 
  adminNotes?: string
): Promise<{ success?: boolean; error?: string }> {
  try {
    const updateData: any = { 
      status,
      updated_at: new Date().toISOString()
    };

    if (status === 'completed' || status === 'cancelled') {
      updateData.processed_at = new Date().toISOString();
    }

    if (adminNotes) {
      updateData.admin_notes = adminNotes;
    }

    const { error } = await supabase
      .from('chainrise_deposits')
      .update(updateData)
      .eq('id', depositId);

    if (error) {
      console.error('Error updating deposit status:', error);
      return { error: 'Failed to update deposit status' };
    }

    return { success: true };
  } catch (err) {
    console.error('Unexpected error in updateDepositStatus:', err);
    return { error: 'An unexpected error occurred' };
  }
}