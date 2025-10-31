/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";
import { supabase } from "./supabaseClient";

export interface WalletAddress {
  id: string;
  symbol: string;
  name: string;
  wallet_address: string;
  network: string;
  min_deposit: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Create wallet address (Admin only)
export async function createWalletAddress(walletData: {
  symbol: string;
  name: string;
  wallet_address: string;
  network: string;
  min_deposit: number;
}): Promise<{ success?: boolean; error?: string; data?: WalletAddress }> {
  try {
    const { data: wallet, error } = await supabase
      .from('chainrise_wallet_addresses')
      .insert([{
        ...walletData,
        is_active: true
      }])
      .select()
      .single();

    if (error) {
      console.error('Error creating wallet address:', error);
      return { error: 'Failed to create wallet address: ' + error.message };
    }

    return { success: true, data: wallet };
  } catch (err) {
    console.error('Unexpected error in createWalletAddress:', err);
    return { error: 'An unexpected error occurred' };
  }
}

// Get all wallet addresses (for admin)
export async function getAllWalletAddresses(): Promise<{ 
  data?: WalletAddress[]; 
  error?: string 
}> {
  try {
    const { data, error } = await supabase
      .from('chainrise_wallet_addresses')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching wallet addresses:', error);
      return { error: 'Failed to fetch wallet addresses' };
    }

    return { data: data || [] };
  } catch (err) {
    console.error('Unexpected error in getAllWalletAddresses:', err);
    return { error: 'An unexpected error occurred' };
  }
}

// Get active wallet addresses for deposit page
export async function getActiveWalletAddresses(): Promise<{ 
  data?: WalletAddress[]; 
  error?: string 
}> {
  try {
    const { data, error } = await supabase
      .from('chainrise_wallet_addresses')
      .select('*')
      .eq('is_active', true)
      .order('min_deposit', { ascending: true });

    if (error) {
      console.error('Error fetching active wallet addresses:', error);
      return { error: 'Failed to fetch wallet addresses' };
    }

    return { data: data || [] };
  } catch (err) {
    console.error('Unexpected error in getActiveWalletAddresses:', err);
    return { error: 'An unexpected error occurred' };
  }
}

// Update wallet address (Admin only) - FIXED VERSION
export async function updateWalletAddress(
  id: string, 
  updates: Partial<WalletAddress>
): Promise<{ success?: boolean; error?: string; data?: WalletAddress }> {
  try {
    console.log('🔄 [updateWalletAddress] Starting update for ID:', id);
    console.log('📝 [updateWalletAddress] Updates:', updates);

    // First, check if the wallet exists
    const { data: existingWallet, error: checkError } = await supabase
      .from('chainrise_wallet_addresses')
      .select('id')
      .eq('id', id)
      .single();

    if (checkError) {
      console.error('❌ [updateWalletAddress] Wallet not found:', checkError);
      return { error: 'Wallet not found: ' + checkError.message };
    }

    console.log('✅ [updateWalletAddress] Wallet exists:', existingWallet);

    // Perform the update
    const { data: updatedWallets, error: updateError } = await supabase
      .from('chainrise_wallet_addresses')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select(); // Remove .single() and use .select() instead

    if (updateError) {
      console.error('❌ [updateWalletAddress] Update failed:', updateError);
      return { error: 'Failed to update wallet address: ' + updateError.message };
    }

    console.log('📊 [updateWalletAddress] Update result:', updatedWallets);

    // Check if any rows were updated
    if (!updatedWallets || updatedWallets.length === 0) {
      console.error('❌ [updateWalletAddress] No rows were updated');
      return { error: 'No wallet found with the provided ID' };
    }

    // Return the first updated wallet (should be only one)
    const updatedWallet = updatedWallets[0];
    console.log('✅ [updateWalletAddress] Successfully updated wallet:', updatedWallet);

    return { success: true, data: updatedWallet };
  } catch (err) {
    console.error('💥 [updateWalletAddress] Unexpected error:', err);
    return { error: 'An unexpected error occurred' };
  }
}

// Delete wallet address (Admin only)
export async function deleteWalletAddress(id: string): Promise<{ 
  success?: boolean; 
  error?: string 
}> {
  try {
    const { error } = await supabase
      .from('chainrise_wallet_addresses')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting wallet address:', error);
      return { error: 'Failed to delete wallet address: ' + error.message };
    }

    return { success: true };
  } catch (err) {
    console.error('Unexpected error in deleteWalletAddress:', err);
    return { error: 'An unexpected error occurred' };
  }
}

// Toggle wallet address active status
export async function toggleWalletAddressStatus(
  id: string, 
  isActive: boolean
): Promise<{ success?: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('chainrise_wallet_addresses')
      .update({ 
        is_active: isActive,
        updated_at: new Date().toISOString()
      })
      .eq('id', id);

    if (error) {
      console.error('Error toggling wallet status:', error);
      return { error: 'Failed to update wallet status: ' + error.message };
    }

    return { success: true };
  } catch (err) {
    console.error('Unexpected error in toggleWalletAddressStatus:', err);
    return { error: 'An unexpected error occurred' };
  }
}

// Get wallet by ID (helper function)
export async function getWalletById(id: string): Promise<{ 
  data?: WalletAddress; 
  error?: string 
}> {
  try {
    const { data, error } = await supabase
      .from('chainrise_wallet_addresses')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching wallet by ID:', error);
      return { error: 'Failed to fetch wallet: ' + error.message };
    }

    return { data: data || undefined };
  } catch (err) {
    console.error('Unexpected error in getWalletById:', err);
    return { error: 'An unexpected error occurred' };
  }
}