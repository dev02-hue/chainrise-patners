/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";
import { Withdrawal, WithdrawalInput, WithdrawalStatus } from "@/types/businesses";
import { getSession } from "./auth";
import { supabase } from "./supabaseClient";
import nodemailer from "nodemailer";
import { redirect } from "next/navigation";

// Initiate a withdrawal request
export async function initiateWithdrawal({
  amount,
  cryptoType,
  walletAddress
}: WithdrawalInput): Promise<{ success?: boolean; error?: string; withdrawalId?: string }> {
  try {
    console.log('[initiateWithdrawal] Starting withdrawal process with params:', {
      amount,
      cryptoType,
      walletAddress
    });

    // 1. Get current session
    console.log('[initiateWithdrawal] Getting user session...');
    const session = await getSession();
    if (!session?.user) {
      console.warn('[initiateWithdrawal] No authenticated user found');
      if (typeof window !== 'undefined') {
        window.location.href = '/signin';
      } else {
        redirect('/signin');
      }
      return { error: 'Not authenticated' };
    }
    console.log('[initiateWithdrawal] User authenticated:', session.user.id);

    const userId = session.user.id;

    // 2. Check user balance
    console.log('[initiateWithdrawal] Checking user balance...');
    const { data: profile, error: profileError } = await supabase
      .from('chainrise_profile')
      .select('balance')
      .eq('id', userId)
      .single();

    if (profileError || !profile) {
      console.error('[initiateWithdrawal] Failed to fetch user balance:', profileError);
      return { error: 'Failed to fetch user balance' };
    }

    if (profile.balance < amount) {
      console.warn(`[initiateWithdrawal] Insufficient balance (${profile.balance} < ${amount})`);
      return { error: 'Insufficient balance for withdrawal' };
    }

    // 3. Validate minimum withdrawal amount
    const MIN_WITHDRAWAL = 10;
    if (amount < MIN_WITHDRAWAL) {
      console.warn(`[initiateWithdrawal] Amount ${amount} below minimum ${MIN_WITHDRAWAL}`);
      return { error: `Minimum withdrawal amount is $${MIN_WITHDRAWAL}` };
    }

    // 4. Generate reference
    const reference = `WDR-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    console.log('[initiateWithdrawal] Generated reference:', reference);

    // 5. Create withdrawal record
    console.log('[initiateWithdrawal] Creating withdrawal record...');
    const { data: withdrawal, error: withdrawalError } = await supabase
      .from('chainrise_withdrawals')
      .insert([{
        user_id: userId,
        amount,
        crypto_type: cryptoType,
        wallet_address: walletAddress,
        reference,
        status: 'pending'
      }])
      .select()
      .single();

    if (withdrawalError || !withdrawal) {
      console.error('[initiateWithdrawal] Withdrawal creation failed:', withdrawalError);
      return { error: 'Failed to initiate withdrawal' };
    }
    console.log('[initiateWithdrawal] Withdrawal created successfully:', withdrawal.id);

    // 6. Notify admin
    console.log('[initiateWithdrawal] Sending admin notification...');
    await sendWithdrawalNotificationToAdmin({
      userId,
      userEmail: session.user.email || '',
      amount,
      cryptoType,
      walletAddress,
      reference,
      withdrawalId: withdrawal.id
    });
    console.log('[initiateWithdrawal] Admin notification sent');

    console.log('[initiateWithdrawal] Withdrawal process completed successfully');
    return { success: true, withdrawalId: withdrawal.id };
  } catch (err) {
    console.error('[initiateWithdrawal] Unexpected error:', err);
    return { error: 'An unexpected error occurred' };
  }
}

// Approve a withdrawal
export async function approveWithdrawal(withdrawalId: string): Promise<{ success?: boolean; error?: string; currentStatus?: string }> {
  try {
    // 1. Verify withdrawal exists and is pending
   const { data: withdrawal, error: fetchError } = await supabase
  .from('chainrise_withdrawals')
  .select('status, user_id, amount, crypto_type')
  .eq('id', withdrawalId)
  .single();


    if (fetchError || !withdrawal) {
      console.error('Withdrawal fetch failed:', fetchError);
      return { error: 'Withdrawal not found' };
    }

    if (withdrawal.status !== 'pending') {
      return { 
        error: 'Withdrawal already processed',
        currentStatus: withdrawal.status 
      };
    }

    // 2. Check user balance again (in case it changed since request)
    const { data: profile, error: profileError } = await supabase
      .from('chainrise_profile')
      .select('balance')
      .eq('id', withdrawal.user_id)
      .single();

    if (profileError || !profile) {
      return { error: 'Failed to fetch user balance' };
    }

    if (profile.balance < withdrawal.amount) {
      return { error: 'User has insufficient balance' };
    }

    // 3. Update status to processing
    const { error: processingError } = await supabase
      .from('chainrise_withdrawals')
      .update({ 
        status: 'processing',
        updated_at: new Date().toISOString()
      })
      .eq('id', withdrawalId);

    if (processingError) {
      console.error('Failed to set to processing:', processingError);
      return { error: 'Failed to process withdrawal' };
    }

    // 4. Deduct from user balance
    const { data: user, error: userError } = await supabase
      .from('chainrise_profile')
      .select('balance')
      .eq('id', withdrawal.user_id)
      .single();

    if (userError || !user) {
      console.error('User balance fetch failed:', userError);
      // Revert status back to pending if balance update fails
      await supabase
        .from('chainrise_withdrawals')
        .update({ status: 'pending' })
        .eq('id', withdrawalId);
      return { error: 'Failed to fetch user balance' };
    }

    const { error: balanceError } = await supabase
      .from('chainrise_profile')
      .update({ 
        balance: user.balance - withdrawal.amount,
        updated_at: new Date().toISOString()
      })
      .eq('id', withdrawal.user_id);

    if (balanceError) {
      console.error('Balance update failed:', balanceError);
      // Revert status back to pending if balance update fails
      await supabase
        .from('chainrise_withdrawals')
        .update({ status: 'pending' })
        .eq('id', withdrawalId);
      return { error: 'Failed to update user balance' };
    }

    // 5. Mark withdrawal as completed
    const { error: completeError } = await supabase
      .from('chainrise_withdrawals')
      .update({ 
        status: 'completed',
        processed_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', withdrawalId);

    if (completeError) {
      console.error('Completion failed:', completeError);
      return { error: 'Failed to complete withdrawal' };
    }

    // 6. Record transaction
    await supabase
      .from('chainrise_transactions')
      .insert({
        user_id: withdrawal.user_id,
        type: 'withdrawal',
        amount: withdrawal.amount,
        currency: 'USD',
        description: `Withdrawal processed`,
        reference: `WDR-COMPLETED-${withdrawalId.slice(0, 8)}`,
        status: 'completed',
        metadata: {
          withdrawal_id: withdrawalId,
          crypto_type: withdrawal.crypto_type
        }
      });

    // 7. Send confirmation to user
    await sendWithdrawalConfirmationToUser(withdrawal.user_id, withdrawal.amount, withdrawalId);

    return { success: true };
  } catch (err) {
    console.error('Unexpected error in approveWithdrawal:', err);
    return { error: 'An unexpected error occurred' };
  }
}

// Reject a withdrawal
export async function rejectWithdrawal(withdrawalId: string, adminNotes: string = ''): Promise<{ success?: boolean; error?: string; currentStatus?: string }> {
  try {
    // 1. Verify withdrawal exists and is pending
    const { data: withdrawal, error: fetchError } = await supabase
      .from('chainrise_withdrawals')
      .select('status')
      .eq('id', withdrawalId)
      .single();

    if (fetchError || !withdrawal) {
      console.error('Withdrawal fetch failed:', fetchError);
      return { error: 'Withdrawal not found' };
    }

    if (withdrawal.status !== 'pending') {
      return { 
        error: 'Withdrawal already processed',
        currentStatus: withdrawal.status 
      };
    }

    // 2. Update status to cancelled
    const { error: updateError } = await supabase
      .from('chainrise_withdrawals')
      .update({ 
        status: 'cancelled',
        processed_at: new Date().toISOString(),
        admin_notes: adminNotes,
        updated_at: new Date().toISOString()
      })
      .eq('id', withdrawalId);

    if (updateError) {
      console.error('Rejection failed:', updateError);
      return { error: 'Failed to reject withdrawal' };
    }

    return { success: true };
  } catch (err) {
    console.error('Unexpected error in rejectWithdrawal:', err);
    return { error: 'An unexpected error occurred' };
  }
}

// Get user withdrawals
export async function getUserWithdrawals(
  filters: {
    status?: WithdrawalStatus;
    limit?: number;
    offset?: number;
  } = {}
): Promise<{ data?: Withdrawal[]; error?: string; count?: number }> {
  try {
    // 1. Get current session
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

    // 2. Build base query
    let query = supabase
      .from('chainrise_withdrawals')
      .select(`
        id,
        amount,
        crypto_type,
        status,
        reference,
        created_at,
        processed_at,
        wallet_address,
        admin_notes
      `, { count: 'exact' })
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    // 3. Apply filters
    if (filters.status) {
      query = query.eq('status', filters.status);
    }

    if (filters.limit) {
      query = query.limit(filters.limit);
    }

    if (filters.offset !== undefined && filters.limit) {
      query = query.range(filters.offset, filters.offset + filters.limit - 1);
    }

    // 4. Execute query
    const { data, error, count } = await query;

    if (error) {
      console.error('Error fetching withdrawals:', error);
      return { error: 'Failed to fetch withdrawals' };
    }

    return {
      data: data?.map(withdrawal => ({
        id: withdrawal.id,
        amount: withdrawal.amount,
        cryptoType: withdrawal.crypto_type,
        status: withdrawal.status,
        reference: withdrawal.reference,
        createdAt: withdrawal.created_at,
        processedAt: withdrawal.processed_at,
        walletAddress: withdrawal.wallet_address,
        adminNotes: withdrawal.admin_notes
      })),
      count: count || 0
    };
  } catch (err) {
    console.error('Unexpected error in getUserWithdrawals:', err);
    return { error: 'An unexpected error occurred' };
  }
}

// Get all withdrawals (admin)
export async function getAllWithdrawals(
  filters: {
    status?: WithdrawalStatus;
    userId?: string;
    limit?: number;
    offset?: number;
  } = {}
): Promise<{ data?: Withdrawal[]; error?: string; count?: number }> {
  try {
    // 1. Build base query
    let query = supabase
      .from('chainrise_withdrawals')
      .select(`
        id,
        amount,
        crypto_type,
        status,
        reference,
        created_at,
        processed_at,
        wallet_address,
        admin_notes,
        chainrise_profile!inner(email, username, name)
      `, { count: 'exact' })
      .order('created_at', { ascending: false });

    // 2. Apply filters
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

    // 3. Execute query
    const { data, error, count } = await query;

    if (error) {
      console.error('Error fetching withdrawals:', error);
      return { error: 'Failed to fetch withdrawals' };
    }

    return {
      data: data?.map(withdrawal => ({
        id: withdrawal.id,
        amount: withdrawal.amount,
        cryptoType: withdrawal.crypto_type,
        status: withdrawal.status,
        reference: withdrawal.reference,
        createdAt: withdrawal.created_at,
        processedAt: withdrawal.processed_at,
        walletAddress: withdrawal.wallet_address,
        adminNotes: withdrawal.admin_notes,
        userEmail: (withdrawal as any).chainrise_profile?.email,
        username: (withdrawal as any).chainrise_profile?.username,
        userName: (withdrawal as any).chainrise_profile?.name
      })),
      count: count || 0
    };
  } catch (err) {
    console.error('Unexpected error in getAllWithdrawals:', err);
    return { error: 'An unexpected error occurred' };
  }
}

// Helper function to send withdrawal notification to admin
async function sendWithdrawalNotificationToAdmin(params: {
  userId: string;
  userEmail: string;
  amount: number;
  cryptoType: string;
  walletAddress: string;
  reference: string;
  withdrawalId: string;
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
      subject: `New Withdrawal Request - $${params.amount} ${params.cryptoType}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2a52be;">New Withdrawal Request</h2>
          <p><strong>User ID:</strong> ${params.userId}</p>
          <p><strong>User Email:</strong> ${params.userEmail}</p>
          <p><strong>Amount:</strong> $${params.amount}</p>
          <p><strong>Crypto Type:</strong> ${params.cryptoType}</p>
          <p><strong>Wallet Address:</strong> ${params.walletAddress}</p>
          <p><strong>Reference:</strong> ${params.reference}</p>
          
          <div style="margin-top: 30px;">
            <a href="${process.env.ADMIN_URL}/withdrawals/${params.withdrawalId}/approve" 
               style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
              Approve Withdrawal
            </a>
            <a href="${process.env.ADMIN_URL}/withdrawals/${params.withdrawalId}/reject" 
               style="background-color: #f44336; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin-left: 10px;">
              Reject Withdrawal
            </a>
          </div>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`Withdrawal notification sent to admin for withdrawal: ${params.withdrawalId}`);
  } catch (error) {
    console.error('Failed to send withdrawal notification:', error);
  }
}

// Helper function to send withdrawal confirmation to user
async function sendWithdrawalConfirmationToUser(userId: string, amount: number, withdrawalId: string) {
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
      subject: `Withdrawal of $${amount} Processed`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2a52be;">Withdrawal Processed ✅</h2>
          <p>Dear ${user.name || 'Valued Customer'},</p>
          <p>We're pleased to inform you that your withdrawal of <strong>$${amount}</strong> has been processed and sent to your wallet.</p>
          <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Withdrawal ID:</strong> ${withdrawalId}</p>
            <p><strong>Amount:</strong> $${amount}</p>
            <p><strong>Status:</strong> Completed</p>
          </div>
          <p>The funds should arrive in your wallet shortly, depending on the blockchain network confirmation times.</p>
          <p>Thank you for choosing ChainRise!</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`Withdrawal confirmation email sent to ${user.email}`);
  } catch (error) {
    console.error('Failed to send withdrawal confirmation:', error);
  }
}

// Get withdrawal by ID
export async function getWithdrawalById(withdrawalId: string): Promise<{ data?: Withdrawal; error?: string }> {
  try {
    const { data: withdrawal, error } = await supabase
      .from('chainrise_withdrawals')
      .select(`
        id,
        amount,
        crypto_type,
        status,
        reference,
        created_at,
        processed_at,
        wallet_address,
        admin_notes,
        chainrise_profile!inner(email, username, name)
      `)
      .eq('id', withdrawalId)
      .single();

    if (error) {
      console.error('Error fetching withdrawal:', error);
      return { error: 'Failed to fetch withdrawal' };
    }

    if (!withdrawal) {
      return { error: 'Withdrawal not found' };
    }

    return {
      data: {
        id: withdrawal.id,
        amount: withdrawal.amount,
        cryptoType: withdrawal.crypto_type,
        status: withdrawal.status,
        reference: withdrawal.reference,
        createdAt: withdrawal.created_at,
        processedAt: withdrawal.processed_at,
        walletAddress: withdrawal.wallet_address,
        adminNotes: withdrawal.admin_notes,
        userEmail: (withdrawal as any).chainrise_profile?.email,
        username: (withdrawal as any).chainrise_profile?.username,
        name: (withdrawal as any).chainrise_profile?.name
      }
    };
  } catch (err) {
    console.error('Unexpected error in getWithdrawalById:', err);
    return { error: 'An unexpected error occurred' };
  }
}

// Update withdrawal status
export async function updateWithdrawalStatus(
  withdrawalId: string, 
  status: WithdrawalStatus, 
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
      .from('chainrise_withdrawals')
      .update(updateData)
      .eq('id', withdrawalId);

    if (error) {
      console.error('Error updating withdrawal status:', error);
      return { error: 'Failed to update withdrawal status' };
    }

    return { success: true };
  } catch (err) {
    console.error('Unexpected error in updateWithdrawalStatus:', err);
    return { error: 'An unexpected error occurred' };
  }
}