"use server";
import { supabase } from "@/lib/supabaseClient";
import { getSession } from "./auth";

type ReferralStats = {
  totalEarnings: number;
  totalReferrals: number;
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
      .from('accilent_profile')
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

    // 3. Update referrer's balance and stats
    const { error: updateError } = await supabase.rpc('update_referral_earnings', {
      user_id: referrerId,
      bonus_amount: bonusAmount,
    });

    if (updateError) {
      console.error('Error updating referrer balance:', updateError);
      return { error: 'Failed to process referral bonus' };
    }

    // 4. Record the referral transaction
    const { error: transactionError } = await supabase
      .from('referral_transactions')
      .insert({
        referrer_id: referrerId,
        referee_id: depositUserId,
        deposit_amount: amount,
        bonus_amount: bonusAmount,
        status: 'completed'
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
        .from('accilent_profile')
        .select('referral_count, referral_earnings ')
        .eq('id', userId)
        .single();
  
      if (statsError || !statsData) {
        console.error('Error fetching referral stats:', statsError);
        return { error: 'Failed to fetch referral stats' };
      }
  
      // Get detailed referral list
      const { data: referralsData, error: referralsError } = await supabase
        .from('referral_transactions')
        .select(`
          id,
          referee_id,
          deposit_amount,
          bonus_amount,
          created_at,
          status,
          accilent_profile:referee_id(name, email)
        `)
        .eq('referrer_id', userId)
        .order('created_at', { ascending: false });
  
      if (referralsError) {
        console.error('Error fetching referral details:', referralsError);
        return { error: 'Failed to fetch referral details' };
      }
  
      const referrals = referralsData?.map(ref => ({
        id: ref.id,
        name: ref.accilent_profile?.[0]?.name || 'Unknown', // Access first element of array
        email: ref.accilent_profile?.[0]?.email || 'Unknown', // Access first element of array
        joinedAt: ref.created_at,
        depositAmount: ref.deposit_amount,
        earningsFromReferral: ref.bonus_amount,
        status: ref.status
      })) || [];
  
      return {
        data: {
          totalEarnings: statsData.referral_earnings || 0,
          totalReferrals: statsData.referral_count || 0,
          referrals,
        //   referralCode: statsData.referral_code // Added referral code to response
        }
      };
    } catch (err) {
      console.error('Unexpected error in getReferralStats:', err);
      return { error: 'An unexpected error occurred' };
    }
  }