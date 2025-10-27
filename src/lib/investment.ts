/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";
import { redirect } from "next/navigation";
import { getSession } from "./auth";
import { supabase } from "./supabaseClient";

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
          total_invested: user.total_invested // Rollback total_invested too
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
// Update this function in your investment.ts
export async function calculateDailyProfits(): Promise<{ success?: boolean; error?: string; data?: any }> {
  try {
    console.log('🔄 Starting daily profit calculation...', new Date().toISOString());

    // Call the PostgreSQL function to calculate profits
    const { data, error } = await supabase.rpc('calculate_daily_profits');

    console.log('📊 Raw RPC response:', { data, error });

    if (error) {
      console.error('❌ Error calculating daily profits:', error);
      console.error('🔍 Error details:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      });
      return { 
        error: 'Failed to calculate daily profits: ' + error.message,
        data: { details: error.details, hint: error.hint, code: error.code }
      };
    }

    console.log('✅ Daily profits calculated successfully');
    console.log('📈 Result data:', data);
    return { success: true, data };
  } catch (err) {
    console.error('💥 Unexpected error in calculateDailyProfits:', err);
    const error = err as Error;
    return { 
      error: 'An unexpected error occurred: ' + error.message,
      data: { stack: error.stack }
    };
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

    // Add to user balance using proper Supabase syntax
    const { error: balanceError } = await supabase
      .from('chainrise_profile')
      .update({ 
        balance: (userBalance: number) => `${userBalance} + ${amount}`,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId);

    if (balanceError) {
      console.error('Balance update error:', balanceError);
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

// Get investment plans
export async function getInvestmentPlans(): Promise<{ data?: any[]; error?: string }> {
  try {
    const { data, error } = await supabase
      .from('chainrise_investment_plans')
      .select('*')
      .eq('is_active', true)
      .order('min_amount', { ascending: true });

    if (error) {
      console.error('Error fetching investment plans:', error);
      return { error: 'Failed to fetch investment plans' };
    }

    return { data: data || [] };
  } catch (err) {
    console.error('Unexpected error in getInvestmentPlans:', err);
    return { error: 'An unexpected error occurred' };
  }
}