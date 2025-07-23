"use server";
import { getSession } from "./auth";
import { supabase } from "./supabaseClient";

// Types
export interface UserInvestment {
  id: string;
  userId: string;
  planId: number;
  amount: number;
  expectedReturn: number;
  startDate: string;
  endDate: string;
  status: 'active' | 'completed' | 'cancelled';
  nextPayoutDate?: string;
  totalPayouts: number;
  planTitle?: string;
  planPercentage?: number;
}

interface InvestmentPlan {
  title: string;
  percentage: number;
  duration_days?: number;
  interval_days?: number;
}

interface UserInvestmentWithPlan {
  id: string;
  plan_id: number;
  amount: number;
  expected_return: number;
  start_date: string;
  end_date: string;
  status: 'active' | 'completed' | 'cancelled';
  next_payout_date?: string;
  total_payouts: number;
  investment_plans: InvestmentPlan;
}

// Create a new investment
export async function createInvestment(
  planId: string, // Changed from number to string to match UUID type
  amount: number
): Promise<{ success?: boolean; error?: string; investment?: UserInvestment }> {
  try {
    console.log('Starting createInvestment with planId:', planId, 'amount:', amount);

    const session = await getSession();
    if (!session?.user) {
      console.log('No session found - not authenticated');
      return { error: 'Not authenticated' };
    }

    const userId = session.user.id;
    console.log('User ID:', userId);

    // Fetch investment plan with proper UUID handling
    const { data: plan, error: planError } = await supabase
      .from('investment_plans')
      .select('*')
      .eq('id', planId) // Now correctly comparing UUID to UUID
      .single();

    if (planError || !plan) {
      console.error('Plan error:', planError, 'Plan data:', plan);
      return { error: 'Invalid investment plan' };
    }

    const { min_amount, max_amount, percentage, duration_days, interval_days, title } = plan;

    // Set default interval_days if not provided
    const effectiveIntervalDays = interval_days ?? 1; // Default to daily payouts if not set

    console.log('Plan details:', {
      min_amount,
      max_amount,
      percentage,
      duration_days,
      interval_days: effectiveIntervalDays
    });

    // Validate plan data
    if (typeof effectiveIntervalDays !== 'number' || effectiveIntervalDays <= 0) {
      console.error('Invalid interval_days value:', effectiveIntervalDays);
      return { error: 'Invalid investment plan configuration - payout interval not set' };
    }

    if (typeof duration_days !== 'number' || duration_days <= 0) {
      console.error('Invalid duration_days value:', duration_days);
      return { error: 'Invalid investment plan configuration - duration not set' };
    }

    if (amount < min_amount || amount > max_amount) {
      console.log(`Amount ${amount} is outside plan range (${min_amount}-${max_amount})`);
      return { error: `Amount must be between $${min_amount} and $${max_amount} for this plan` };
    }

    // Check user balance
    const { data: user, error: userError } = await supabase
      .from('accilent_profile')
      .select('balance')
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
    const payoutCount = Math.floor(duration_days / effectiveIntervalDays);
    const expectedReturn = amount * (percentage / 100) * payoutCount;
    console.log('Calculated expected return:', expectedReturn);

    const calculateFutureDate = (daysToAdd: number) => {
      const date = new Date(currentDate);
      date.setDate(date.getDate() + daysToAdd);
      return date;
    };

    const endDate = calculateFutureDate(duration_days);
    const nextPayoutDate = calculateFutureDate(effectiveIntervalDays);

    if (isNaN(endDate.getTime()) || isNaN(nextPayoutDate.getTime())) {
      console.error('Invalid date calculation detected');
      return { error: 'Invalid date calculation' };
    }

    console.log('Calculated dates:', {
      endDate,
      nextPayoutDate,
      endDateISO: endDate.toISOString(),
      nextPayoutDateISO: nextPayoutDate.toISOString()
    });

    // Deduct amount from user balance first
    const { error: balanceUpdateError } = await supabase
      .from('accilent_profile')
      .update({ balance: user.balance - amount })
      .eq('id', userId);

    if (balanceUpdateError) {
      console.error('Failed to deduct from user balance:', balanceUpdateError);
      return { error: 'Failed to process investment' };
    }

    // Create investment record
    const { data: investment, error: investmentError } = await supabase
      .from('user_investments')
      .insert({
        user_id: userId,
        plan_id: planId,
        amount,
        expected_return: expectedReturn,
        start_date: currentDate.toISOString(),
        end_date: endDate.toISOString(),
        next_payout_date: nextPayoutDate.toISOString(),
        status: 'active'
      })
      .select()
      .single();

    if (investmentError) {
      console.error('Investment creation failed:', investmentError);
      
      // Rollback balance deduction if investment creation fails
      await supabase
        .from('accilent_profile')
        .update({ balance: user.balance })
        .eq('id', userId);
      
      return { error: 'Failed to create investment' };
    }

    console.log('Investment created successfully:', investment);

    return {
      success: true,
      investment: {
        id: investment.id,
        userId: investment.user_id,
        planId: investment.plan_id,
        amount: investment.amount,
        expectedReturn: investment.expected_return,
        startDate: investment.start_date,
        endDate: investment.end_date,
        status: investment.status,
        nextPayoutDate: investment.next_payout_date,
        totalPayouts: investment.total_payouts || 0,
        planTitle: title,
        planPercentage: percentage
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
      return { error: 'Not authenticated' };
    }

    const userId = session.user.id;

    const { data, error } = await supabase
      .from('user_investments')
      .select<`
        id,
        plan_id,
        amount,
        expected_return,
        start_date,
        end_date,
        status,
        next_payout_date,
        total_payouts,
        investment_plans!inner(title, percentage)
      `, UserInvestmentWithPlan>(`
        id,
        plan_id,
        amount,
        expected_return,
        start_date,
        end_date,
        status,
        next_payout_date,
        total_payouts,
        investment_plans!inner(title, percentage)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching investments:', error);
      return { error: 'Failed to fetch investments' };
    }

    return {
      data: data?.map(inv => ({
        id: inv.id,
        userId: userId,
        planId: inv.plan_id,
        amount: inv.amount,
        expectedReturn: inv.expected_return,
        startDate: inv.start_date,
        endDate: inv.end_date,
        status: inv.status,
        nextPayoutDate: inv.next_payout_date,
        totalPayouts: inv.total_payouts,
        planTitle: inv.investment_plans.title,
        planPercentage: inv.investment_plans.percentage
      })) || []
    };
  } catch (err) {
    console.error('Unexpected error in getUserInvestments:', err);
    return { error: 'An unexpected error occurred' };
  }
}

// Get investment by ID
export async function getInvestmentById(
  investmentId: string
): Promise<{ data?: UserInvestment; error?: string }> {
  try {
    const session = await getSession();
    if (!session?.user) {
      return { error: 'Not authenticated' };
    }

    const userId = session.user.id;

    const { data, error } = await supabase
      .from('user_investments')
      .select<`
        id,
        plan_id,
        amount,
        expected_return,
        start_date,
        end_date,
        status,
        next_payout_date,
        total_payouts,
        investment_plans!inner(title, percentage, duration_days, interval_days)
      `, UserInvestmentWithPlan>(`
        id,
        plan_id,
        amount,
        expected_return,
        start_date,
        end_date,
        status,
        next_payout_date,
        total_payouts,
        investment_plans!inner(title, percentage, duration_days, interval_days)
      `)
      .eq('id', investmentId)
      .eq('user_id', userId)
      .single();

    if (error) {
      console.error('Error fetching investment:', error);
      return { error: 'Failed to fetch investment' };
    }

    if (!data) {
      return { error: 'Investment not found' };
    }

    return {
      data: {
        id: data.id,
        userId: userId,
        planId: data.plan_id,
        amount: data.amount,
        expectedReturn: data.expected_return,
        startDate: data.start_date,
        endDate: data.end_date,
        status: data.status,
        nextPayoutDate: data.next_payout_date,
        totalPayouts: data.total_payouts,
        planTitle: data.investment_plans.title,
        planPercentage: data.investment_plans.percentage
      }
    };
  } catch (err) {
    console.error('Unexpected error in getInvestmentById:', err);
    return { error: 'An unexpected error occurred' };
  }
}