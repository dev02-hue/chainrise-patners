/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";
import { supabase } from "@/lib/supabaseClient";
import { getSession } from "./auth";

type ReferralStats = {
  totalEarnings: number;
  totalReferrals: number;
  referralCode: string;
  referrals: Array<{
    id: string;
    name: string;
    email: string;
    joinedAt: string;
    depositAmount?: number;
    earningsFromReferral?: number;
    status: string;
  }>;
};

export async function processReferralBonus(depositUserId: string, amount: number) {
  try {
    // 1. Get the user who made the deposit and check if they were referred
    const { data: refereeData, error: refereeError } = await supabase
      .from('chainrise_profile')
      .select('referred_by')
      .eq('id', depositUserId)
      .single();

    if (refereeError || !refereeData) {
      console.error('Error fetching referee data:', refereeError);
      return { error: 'Failed to process referral bonus' };
    }

    const referrerId = refereeData.referred_by;
    if (!referrerId) {
      // No referrer, nothing to do
      return { success: true };
    }

    // 2. Calculate 10% bonus
    const bonusAmount = amount * 0.1;

    // 3. First get current balance to update it properly
    const { data: currentUserData, error: fetchError } = await supabase
      .from('chainrise_profile')
      .select('balance, total_earnings, referral_count')
      .eq('id', referrerId)
      .single();

    if (fetchError || !currentUserData) {
      console.error('Error fetching current user data:', fetchError);
      return { error: 'Failed to process referral bonus' };
    }

    // 4. Update referrer's balance and stats
    const { error: updateError } = await supabase
      .from('chainrise_profile')
      .update({
        balance: (currentUserData.balance || 0) + bonusAmount,
        total_earnings: (currentUserData.total_earnings || 0) + bonusAmount,
        referral_count: (currentUserData.referral_count || 0) + 1,
        updated_at: new Date().toISOString()
      })
      .eq('id', referrerId);

    if (updateError) {
      console.error('Error updating referrer balance:', updateError);
      return { error: 'Failed to process referral bonus' };
    }

    // 5. Record the referral bonus transaction
    const { error: bonusError } = await supabase
      .from('chainrise_referral_bonuses')
      .insert({
        referrer_id: referrerId,
        referred_user_id: depositUserId,
        amount: bonusAmount,
        bonus_type: 'deposit',
        status: 'paid'
      });

    if (bonusError) {
      console.error('Error recording referral bonus:', bonusError);
      // Not critical, so we continue
    }

    // 6. Record the transaction
    const { error: transactionError } = await supabase
      .from('chainrise_transactions')
      .insert({
        user_id: referrerId,
        type: 'referral_bonus',
        amount: bonusAmount,
        currency: 'USD',
        description: `Referral bonus from $${amount} deposit`,
        reference: `REF-${Date.now()}`,
        status: 'completed',
        metadata: {
          referred_user_id: depositUserId,
          deposit_amount: amount,
          bonus_type: 'deposit'
        }
      });

    if (transactionError) {
      console.error('Error recording referral transaction:', transactionError);
      // Not critical, so we continue
    }

    return { success: true };
  } catch (err) {
    console.error('Unexpected error in processReferralBonus:', err);
    return { error: 'An unexpected error occurred' };
  }
}
export async function getReferralStats(): Promise<{ data?: ReferralStats; error?: string }> {
  try {
    const session = await getSession();
    if (!session?.user) {
      return { error: 'Not authenticated' };
    }

    const userId = session.user.id;

    // Get total earnings and referral count
    const { data: statsData, error: statsError } = await supabase
      .from('chainrise_profile')
      .select('referral_count, total_earnings, referral_code')
      .eq('id', userId)
      .single();

    if (statsError || !statsData) {
      console.error('Error fetching referral stats:', statsError);
      return { error: 'Failed to fetch referral stats' };
    }

    // Get detailed referral list from referral bonuses
    const { data: referralsData, error: referralsError } = await supabase
      .from('chainrise_referral_bonuses')
      .select(`
        id,
        amount,
        bonus_type,
        status,
        created_at,
        referred_user_id,
        chainrise_profile!chainrise_referral_bonuses_referred_user_id_fkey(
          name,
          email,
          created_at
        )
      `)
      .eq('referrer_id', userId)
      .order('created_at', { ascending: false });

    if (referralsError) {
      console.error('Error fetching referral details:', referralsError);
      return { error: 'Failed to fetch referral details' };
    }

    // Get referred users who haven't made deposits yet
    const { data: referredUsersData, error: referredUsersError } = await supabase
      .from('chainrise_profile')
      .select('id, name, email, created_at, total_invested')
      .eq('referred_by', userId)
      .order('created_at', { ascending: false });

    if (referredUsersError) {
      console.error('Error fetching referred users:', referredUsersError);
      return { error: 'Failed to fetch referred users' };
    }

    // Combine data from both sources
    const referrals = referredUsersData?.map(user => {
      // Find if this user has generated any referral bonuses
      const bonus = referralsData?.find(bonus => 
        bonus.referred_user_id === user.id
      );

      return {
        id: user.id,
        name: user.name || 'Unknown',
        email: user.email || 'Unknown',
        joinedAt: user.created_at,
        depositAmount: user.total_invested || 0,
        earningsFromReferral: bonus?.amount || 0,
        status: user.total_invested && user.total_invested > 0 ? 'active' : 'pending'
      };
    }) || [];

    return {
      data: {
        totalEarnings: statsData.total_earnings || 0,
        totalReferrals: statsData.referral_count || 0,
        referralCode: statsData.referral_code || '',
        referrals,
      }
    };
  } catch (err) {
    console.error('Unexpected error in getReferralStats:', err);
    return { error: 'An unexpected error occurred' };
  }
}

export async function getReferralEarnings(): Promise<{ data?: { total: number; history: any[] }; error?: string }> {
  try {
    const session = await getSession();
    if (!session?.user) {
      return { error: 'Not authenticated' };
    }

    const userId = session.user.id;

    // Get referral earnings from transactions
    const { data: earningsData, error: earningsError } = await supabase
      .from('chainrise_transactions')
      .select('*')
      .eq('user_id', userId)
      .eq('type', 'referral_bonus')
      .order('created_at', { ascending: false });

    if (earningsError) {
      console.error('Error fetching referral earnings:', earningsError);
      return { error: 'Failed to fetch referral earnings' };
    }

    const total = earningsData?.reduce((sum, transaction) => sum + transaction.amount, 0) || 0;

    return {
      data: {
        total,
        history: earningsData || []
      }
    };
  } catch (err) {
    console.error('Unexpected error in getReferralEarnings:', err);
    return { error: 'An unexpected error occurred' };
  }
}

export async function generateReferralCode(): Promise<{ data?: { code: string }; error?: string }> {
  try {
    const session = await getSession();
    if (!session?.user) {
      return { error: 'Not authenticated' };
    }

    const userId = session.user.id;

    // Generate a unique referral code
    const referralCode = `CHAIN${Math.random().toString(36).substr(2, 8).toUpperCase()}`;

    // Update user's referral code
    const { error: updateError } = await supabase
      .from('chainrise_profile')
      .update({ 
        referral_code: referralCode,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId);

    if (updateError) {
      console.error('Error generating referral code:', updateError);
      return { error: 'Failed to generate referral code' };
    }

    return {
      data: { code: referralCode }
    };
  } catch (err) {
    console.error('Unexpected error in generateReferralCode:', err);
    return { error: 'An unexpected error occurred' };
  }
}

export async function getReferralLeaderboard(): Promise<{ data?: any[]; error?: string }> {
  try {
    const session = await getSession();
    if (!session?.user) {
      return { error: 'Not authenticated' };
    }

    // Get top referrers
    const { data: leaderboardData, error: leaderboardError } = await supabase
      .from('chainrise_profile')
      .select('name, email, referral_count, total_earnings')
      .gt('referral_count', 0)
      .order('total_earnings', { ascending: false })
      .limit(10);

    if (leaderboardError) {
      console.error('Error fetching leaderboard:', leaderboardError);
      return { error: 'Failed to fetch leaderboard' };
    }

    return {
      data: leaderboardData || []
    };
  } catch (err) {
    console.error('Unexpected error in getReferralLeaderboard:', err);
    return { error: 'An unexpected error occurred' };
  }
}

export async function validateReferralCode(referralCode: string): Promise<{ valid: boolean; error?: string }> {
  try {
    if (!referralCode || referralCode.trim().length === 0) {
      return { valid: false, error: 'Referral code is required' };
    }

    // Check if referral code exists and is not the user's own code
    const session = await getSession();
    const currentUserId = session?.user?.id;

    const { data: referrerData, error } = await supabase
      .from('chainrise_profile')
      .select('id, name, is_active')
      .eq('referral_code', referralCode.trim().toUpperCase())
      .neq('id', currentUserId) // Can't use own referral code
      .single();

    if (error || !referrerData) {
      return { valid: false, error: 'Invalid referral code' };
    }

    if (!referrerData.is_active) {
      return { valid: false, error: 'Referrer account is not active' };
    }

    return { valid: true };
  } catch (err) {
    console.error('Unexpected error in validateReferralCode:', err);
    return { valid: false, error: 'Failed to validate referral code' };
  }
}

export async function applyReferralCode(referralCode: string): Promise<{ success?: boolean; error?: string }> {
  try {
    const session = await getSession();
    if (!session?.user) {
      return { error: 'Not authenticated' };
    }

    const userId = session.user.id;

    // Validate referral code first
    const validation = await validateReferralCode(referralCode);
    if (!validation.valid) {
      return { error: validation.error };
    }

    // Get referrer info
    const { data: referrerData } = await supabase
      .from('chainrise_profile')
      .select('id')
      .eq('referral_code', referralCode.trim().toUpperCase())
      .single();

    if (!referrerData) {
      return { error: 'Referrer not found' };
    }

    // Update user's referred_by field
    const { error: updateError } = await supabase
      .from('chainrise_profile')
      .update({
        referred_by: referrerData.id,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId);

    if (updateError) {
      console.error('Error applying referral code:', updateError);
      return { error: 'Failed to apply referral code' };
    }

    // Record signup bonus for referrer if this is first time
    const signupBonus = 10.00; // $10 signup bonus

    const { error: bonusError } = await supabase
      .from('chainrise_referral_bonuses')
      .insert({
        referrer_id: referrerData.id,
        referred_user_id: userId,
        amount: signupBonus,
        bonus_type: 'signup',
        status: 'pending' // Will be paid when user makes first deposit
      });

    if (bonusError) {
      console.error('Error recording signup bonus:', bonusError);
      // Continue anyway
    }

    return { success: true };
  } catch (err) {
    console.error('Unexpected error in applyReferralCode:', err);
    return { error: 'An unexpected error occurred' };
  }
}