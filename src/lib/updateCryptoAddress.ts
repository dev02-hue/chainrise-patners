"use server";
 import { supabase } from "./supabaseClient";
import { getSession } from "./auth";
import { redirect } from "next/navigation";

type CryptoAddressType = 
  | 'btc_address'
  | 'bnb_address'
  | 'dodge_address'
  | 'eth_address'
  | 'solana_address'
  | 'usdttrc20_address';

type CryptoAddressInput = {
  type: CryptoAddressType;
  address: string;
};

type DeleteCryptoAddressInput = {
  type: CryptoAddressType;
};

/**
 * Adds or updates a cryptocurrency address for the current user
 */
export async function updateCryptoAddress({
  type,
  address,
}: CryptoAddressInput): Promise<{ success?: boolean; error?: string }> {
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

    // 2. Validate address (basic validation)
    if (!address || typeof address !== 'string' || address.trim().length === 0) {
      return { error: 'Invalid address format' };
    }

    // 3. Prepare update object
    const updates = {
      [type]: address.trim(),
      updated_at: new Date().toISOString(),
    };

    // 4. Update the profile in database
    const { error } = await supabase
      .from('accilent_profile')
      .update(updates)
      .eq('id', session.user.id);

    if (error) {
      console.error(`Error updating ${type}:`, error);
      return { error: `Failed to update ${type}` };
    }

    return { success: true };
  } catch (err) {
    console.error(`Unexpected error in updateCryptoAddress (${type}):`, err);
    return { error: 'An unexpected error occurred' };
  }
}

/**
 * Deletes a cryptocurrency address for the current user
 */
export async function deleteCryptoAddress({
  type,
}: DeleteCryptoAddressInput): Promise<{ success?: boolean; error?: string }> {
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

    // 2. Prepare update object (setting to null)
    const updates = {
      [type]: null,
      updated_at: new Date().toISOString(),
    };

    // 3. Update the profile in database
    const { error } = await supabase
      .from('accilent_profile')
      .update(updates)
      .eq('id', session.user.id);

    if (error) {
      console.error(`Error deleting ${type}:`, error);
      return { error: `Failed to delete ${type}` };
    }

    return { success: true };
  } catch (err) {
    console.error(`Unexpected error in deleteCryptoAddress (${type}):`, err);
    return { error: 'An unexpected error occurred' };
  }
}

/**
 * Gets all cryptocurrency addresses for the current user
 */
export async function getCryptoAddresses(): Promise<{
  data?: Record<CryptoAddressType, string | null>;
  error?: string;
}> {
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

    // 2. Fetch crypto addresses
    const { data: profile, error } = await supabase
      .from('accilent_profile')
      .select('btc_address, bnb_address, dodge_address, eth_address, solana_address, usdttrc20_address')
      .eq('id', session.user.id)
      .single();

    if (error || !profile) {
      console.error('Error fetching crypto addresses:', error);
      return { error: 'Failed to fetch crypto addresses' };
    }

    // 3. Return formatted data
    return {
      data: {
        btc_address: profile.btc_address,
        bnb_address: profile.bnb_address,
        dodge_address: profile.dodge_address,
        eth_address: profile.eth_address,
        solana_address: profile.solana_address,
        usdttrc20_address: profile.usdttrc20_address,
      },
    };
  } catch (err) {
    console.error('Unexpected error in getCryptoAddresses:', err);
    return { error: 'An unexpected error occurred' };
  }
}


