import { ProfileData } from "@/types/businesses";
import { getSession } from "./auth";
import { supabase } from "./supabaseClient";
import { redirect } from "next/navigation";



export async function getTotalDeposit(): Promise<number> {
  try {
    console.log('[getTotalDeposit] Getting user session...');
    const session = await getSession();

    if (!session?.user) {
      console.warn('[getTotalDeposit] No authenticated user found');

      if (typeof window !== 'undefined') {
        window.location.href = '/signin';
      } else {
        redirect('/signin'); // For Next.js App Router
      }

      return 0;
    }

    const userId = session.user.id;
    console.log('[getTotalDeposit] Fetching completed deposits for user:', userId);

    // ✅ Only fetch deposits where status = 'completed'
    const { data: deposits, error } = await supabase
      .from('chainrise_deposits')
      .select('amount')
      .eq('user_id', userId)
      .eq('status', 'completed'); // <-- filter added here

    if (error) {
      console.error('[getTotalDeposit] Supabase error:', error);
      return 0;
    }

    // ✅ Safely calculate total
    const total =
      deposits?.reduce((acc, curr) => acc + Number(curr.amount || 0), 0) || 0;

    console.log(`[getTotalDeposit] Total completed deposit: $${total.toFixed(2)}`);

    return total;
  } catch (err) {
    console.error('[getTotalDeposit] Unexpected error:', err);
    return 0;
  }
}




  export async function getTotalInvestment(): Promise<number> {
    try {
      console.log('[getTotalInvestment] Getting user session...');
      const session = await getSession();
  
      if (!session?.user) {
        console.warn('[getTotalInvestment] No authenticated user found');

        if (typeof window !== 'undefined') {
          window.location.href = '/signin';
        } else {
          redirect('/signin'); // for use in server-side functions (Next.js App Router only)
        }
        return 0;
      }
  
      const userId = session.user.id;
  
      console.log('[getTotalInvestment] Fetching investments for user:', userId);
  
      const { data: investments, error } = await supabase
        .from('chainrise_investments')
        .select('amount, status')
        .eq('user_id', userId);
  
      if (error) {
        console.error('[getTotalInvestment] Supabase error:', error);
        return 0;
      }
  
      // Sum only active investments (optional, based on status)
      const total = investments
        ?.filter(inv => inv.status === 'active') // or remove this filter if you want all
        .reduce((acc, curr) => acc + Number(curr.amount), 0) || 0;
  
      console.log(`[getTotalInvestment] Total investment: $${total.toFixed(2)}`);
      return total;
    } catch (err) {
      console.error('[getTotalInvestment] Unexpected error:', err);
      return 0;
    }
  }


  /**
 * Fetch the total amount of completed chainrise_withdrawals for the logged-in user.
 * @returns total completed withdrawal amount (0 if none or error)
 */
export async function getTotalCompletedWithdrawal(): Promise<number> {
    try {
      const session = await getSession();
      if (!session?.user) {
        console.warn('[getTotalCompletedWithdrawal] No session found');
        if (typeof window !== 'undefined') {
          window.location.href = '/signin';
        } else {
          redirect('/signin'); // for use in server-side functions (Next.js App Router only)
        }
        return 0;
      }
  
      const userId = session.user.id;
      console.log('[getTotalCompletedWithdrawal] Fetching completed chainrise_withdrawals for user:', userId);
  
      const { data, error } = await supabase
        .from('chainrise_withdrawals')
        .select('amount')
        .eq('user_id', userId)
        .eq('status', 'completed');
  
      if (error) {
        console.error('[getTotalCompletedWithdrawal] Supabase error:', error);
        return 0;
      }
  
      const total = (data ?? []).reduce((sum, row) => sum + Number(row.amount || 0), 0);
      console.log('[getTotalCompletedWithdrawal] Total completed withdrawal:', total);
      return total;
    } catch (err) {
      console.error('[getTotalCompletedWithdrawal] Unexpected error:', err);
      return 0;
    }
  }


  export async function getTotalPendingWithdrawal(): Promise<number> {
    try {
      const session = await getSession();
      if (!session?.user) {
        console.warn('[getTotalPendingWithdrawal] No session found');
        if (typeof window !== 'undefined') {
          window.location.href = '/signin';
        } else {
          redirect('/signin'); // for use in server-side functions (Next.js App Router only)
        }
        return 0;
      }
  
      const userId = session.user.id;
      console.log('[getTotalPendingWithdrawal] Fetching pending withdrawals for user:', userId);
  
      const { data, error } = await supabase
        .from('chainrise_withdrawals')
        .select('amount')
        .eq('user_id', userId)
        .eq('status', 'pending');
  
      if (error) {
        console.error('[getTotalPendingWithdrawal] Supabase error:', error);
        return 0;
      }
  
      const total = (data ?? []).reduce((sum, row) => sum + Number(row.amount || 0), 0);
      console.log('[getTotalPendingWithdrawal] Total pending withdrawal:', total);
      return total;
    } catch (err) {
      console.error('[getTotalPendingWithdrawal] Unexpected error:', err);
      return 0;
    }
  }
  

  export async function getProfileData(): Promise<{ data?: ProfileData; error?: string }> {
    try {
      // 1. Get current session
      const { session } = await getSession();
      if (!session?.user) {
        if (typeof window !== 'undefined') {
          window.location.href = '/signin';
        } else {
          redirect('/signin'); // for use in server-side functions (Next.js App Router only)
        }
        return { error: 'Not authenticated' };
      }
  
      // 2. Fetch profile data including balance
      const { data: profile, error } = await supabase
        .from('chainrise_profile')
        .select('name,referral_code, username, email, phone_number, balance')
        .eq('id', session.user.id)
        .single();
  
      if (error || !profile) {
        console.error('Error fetching profile:', error);
        return { error: 'Failed to fetch profile data' };
      }
  
      // 3. Return formatted data
      return {
        data: {
          name: profile.name,
          username: profile.username,
          referralCode: profile.referral_code,
          email: profile.email,
          phoneNumber: profile.phone_number,
          balance: profile.balance,
        },
      };
    } catch (err) {
      console.error('Unexpected error in getProfileData:', err);
      return { error: 'An unexpected error occurred' };
    }
  }
  