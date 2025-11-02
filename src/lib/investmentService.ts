/* eslint-disable @typescript-eslint/no-explicit-any */
// lib/investmentService.ts

import { supabase } from "./supabaseClient";

console.log('🔧 [investmentService] Investment service module loaded');

export async function processInvestmentMaturity(): Promise<{ 
  success: boolean; 
  processed?: number; 
  error?: string;
  details?: any;
}> {
  console.log('🚀 [processInvestmentMaturity] Function called - starting main investment processing');
  
  try {
    console.log('🔄 [processInvestmentMaturity] Starting investment maturity processing...');
    console.log('📊 [processInvestmentMaturity] Step 1: Updating days remaining for all investments');

    // 1. Update days remaining for all investments
    await updateInvestmentDaysRemaining();

    console.log('📊 [processInvestmentMaturity] Step 2: Processing matured investments (60 days completed)');
    // 2. Process matured investments (60 days completed)
    const maturityResult = await processMaturedInvestments();
    
    console.log('📊 [processInvestmentMaturity] Step 3: Processing daily earnings for active investments');
    // 3. Process daily earnings for active investments
    const earningsResult = await processDailyInvestmentEarnings();

    const totalProcessed = (maturityResult.processed || 0) + (earningsResult.processed || 0);

    console.log(`✅ [processInvestmentMaturity] Completed: ${totalProcessed} total processed`);
    console.log('📈 [processInvestmentMaturity] Maturity Result:', JSON.stringify(maturityResult, null, 2));
    console.log('💰 [processInvestmentMaturity] Earnings Result:', JSON.stringify(earningsResult, null, 2));
    
    return {
      success: true,
      processed: totalProcessed,
      details: {
        matured: maturityResult,
        earnings: earningsResult
      }
    };
  } catch (err) {
    console.error('💥 [processInvestmentMaturity] Unexpected error:', err);
    console.error('🔍 [processInvestmentMaturity] Error details:', {
      name: err instanceof Error ? err.name : 'Unknown',
      message: err instanceof Error ? err.message : 'Unknown error',
      stack: err instanceof Error ? err.stack : 'No stack trace'
    });
    return { 
      success: false, 
      error: 'Unexpected system error: ' + (err instanceof Error ? err.message : 'Unknown error')
    };
  }
}

async function updateInvestmentDaysRemaining(): Promise<void> {
  console.log('🕒 [updateInvestmentDaysRemaining] Starting days remaining update process');
  
  try {
    console.log('📅 [updateInvestmentDaysRemaining] Updating days remaining...');
    console.log('🔍 [updateInvestmentDaysRemaining] Fetching locked investments from database');

    // Fetch investments to compute days_remaining in JS (supabase.sql is not available)
    const { data: investments, error: fetchError } = await supabase
      .from('admin_fee_deposits')
      .select('id, maturity_date')
      .eq('is_locked', true)
      .eq('status', 'locked');

    console.log('📋 [updateInvestmentDaysRemaining] Database query completed');
    console.log('🔍 [updateInvestmentDaysRemaining] Fetch error:', fetchError);
    console.log('🔍 [updateInvestmentDaysRemaining] Found investments:', investments?.length);

    if (fetchError) {
      console.error('❌ [updateInvestmentDaysRemaining] Database fetch error:', fetchError);
      throw fetchError;
    }

    if (!investments || investments.length === 0) {
      console.log('📅 [updateInvestmentDaysRemaining] No locked investments found to update');
      console.log('✅ [updateInvestmentDaysRemaining] No work needed - exiting function');
      return;
    }

    console.log(`📅 [updateInvestmentDaysRemaining] Processing ${investments.length} investments`);
    
    const msPerDay = 1000 * 60 * 60 * 24;
    let updateCount = 0;
    
    for (const inv of investments) {
      console.log(`🔢 [updateInvestmentDaysRemaining] Processing investment ${inv.id}`);
      console.log(`📅 [updateInvestmentDaysRemaining] Investment ${inv.id} maturity date:`, inv.maturity_date);
      
      const maturity = inv.maturity_date ? new Date(inv.maturity_date) : null;
      const now = new Date();
      const daysRemaining = maturity
        ? Math.max(0, Math.floor((maturity.getTime() - now.getTime()) / msPerDay))
        : 0;

      console.log(`📅 [updateInvestmentDaysRemaining] Investment ${inv.id} days remaining: ${daysRemaining}`);

      const { error: updateError } = await supabase
        .from('admin_fee_deposits')
        .update({
          days_remaining: daysRemaining,
          updated_at: new Date().toISOString()
        })
        .eq('id', inv.id);

      if (updateError) {
        console.error(`❌ [updateInvestmentDaysRemaining] Failed to update investment ${inv.id}:`, updateError);
        throw updateError;
      }

      updateCount++;
      console.log(`✅ [updateInvestmentDaysRemaining] Successfully updated investment ${inv.id}`);
    }

    console.log(`✅ [updateInvestmentDaysRemaining] Days remaining updated for ${updateCount} investments`);
    console.log('📊 [updateInvestmentDaysRemaining] Update process completed successfully');
  } catch (err) {
    console.error('❌ [updateInvestmentDaysRemaining] Error in days remaining update:', err);
    console.error('🔍 [updateInvestmentDaysRemaining] Error context:', {
      timestamp: new Date().toISOString(),
      errorType: err instanceof Error ? err.constructor.name : 'Unknown'
    });
    throw err;
  }
}

async function processMaturedInvestments(): Promise<{ processed?: number; error?: string }> {
  console.log('🔓 [processMaturedInvestments] Starting matured investments processing');
  
  try {
    console.log('🔓 [processMaturedInvestments] Processing matured investments...');
    console.log('🔍 [processMaturedInvestments] Querying for matured investments (days_remaining <= 0)');

    // Get investments that have matured (0 days remaining)
    const { data: maturedInvestments, error } = await supabase
      .from('admin_fee_deposits')
      .select('*')
      .eq('is_locked', true)
      .eq('status', 'locked')
      .lte('days_remaining', 0);

    console.log('📋 [processMaturedInvestments] Database query completed');
    console.log('🔍 [processMaturedInvestments] Query error:', error);
    console.log('🔍 [processMaturedInvestments] Matured investments found:', maturedInvestments?.length);

    if (error) {
      console.error('[processMaturedInvestments] Database error:', error);
      return { error: error.message };
    }

    if (!maturedInvestments || maturedInvestments.length === 0) {
      console.log('🔓 [processMaturedInvestments] No matured investments found');
      console.log('✅ [processMaturedInvestments] No investments to process - returning 0 processed');
      return { processed: 0 };
    }

    console.log(`🔓 [processMaturedInvestments] Found ${maturedInvestments.length} matured investments to process`);
    
    let processedCount = 0;
    const errors: string[] = [];

    console.log('🔄 [processMaturedInvestments] Starting individual investment processing loop');
    
    for (const investment of maturedInvestments) {
      console.log(`🔄 [processMaturedInvestments] Processing investment ${investment.id}`);
      console.log(`📊 [processMaturedInvestments] Investment details:`, {
        id: investment.id,
        amount: investment.amount,
        plan: investment.investment_plan,
        userId: investment.user_id
      });
      
      try {
        const result = await releaseMaturedInvestment(investment);
        if (result.success) {
          processedCount++;
          console.log(`✅ [processMaturedInvestments] Successfully processed investment ${investment.id}`);
        } else {
          errors.push(`Investment ${investment.id}: ${result.error}`);
          console.error(`❌ [processMaturedInvestments] Failed to process investment ${investment.id}:`, result.error);
        }
      } catch (err) {
        const errorMsg = `Investment ${investment.id}: ${err instanceof Error ? err.message : 'Unknown error'}`;
        errors.push(errorMsg);
        console.error(`💥 [processMaturedInvestments] Exception processing investment ${investment.id}:`, err);
      }
    }

    console.log(`📊 [processMaturedInvestments] Processing completed: ${processedCount} successful, ${errors.length} errors`);

    if (errors.length > 0) {
      console.error(`🔓 [processMaturedInvestments] Completed with ${errors.length} errors`);
      console.error('❌ [processMaturedInvestments] Error details:', errors);
      return { 
        processed: processedCount, 
        error: `Completed with ${errors.length} errors: ${errors.join('; ')}` 
      };
    }

    console.log(`✅ [processMaturedInvestments] Released ${processedCount} matured investments`);
    console.log('🎉 [processMaturedInvestments] All investments processed successfully');
    return { processed: processedCount };
  } catch (err) {
    console.error('💥 [processMaturedInvestments] Unexpected error in main function:', err);
    console.error('🔍 [processMaturedInvestments] Error context:', {
      timestamp: new Date().toISOString(),
      errorDetails: err instanceof Error ? {
        name: err.name,
        message: err.message,
        stack: err.stack
      } : 'Unknown error'
    });
    return { error: 'Unexpected error processing matured investments' };
  }
}

async function releaseMaturedInvestment(investment: any): Promise<{ success: boolean; error?: string }> {
  console.log(`🔄 [releaseMaturedInvestment] Starting release process for investment ${investment.id}`);
  
  try {
    console.log(`🔄 [releaseMaturedInvestment] Releasing investment ${investment.id}`);
    console.log(`📊 [releaseMaturedInvestment] Investment details:`, {
      id: investment.id,
      amount: investment.amount,
      userId: investment.user_id,
      plan: investment.investment_plan
    });

    // 1. Get user's current balance and total_invested
    console.log(`🔍 [releaseMaturedInvestment] Step 1: Fetching user profile for user ${investment.user_id}`);
    const { data: userProfile, error: userError } = await supabase
      .from('chainrise_profile')
      .select('balance, total_invested')
      .eq('id', investment.user_id)
      .single();

    console.log(`📋 [releaseMaturedInvestment] User profile fetch completed`);
    console.log(`🔍 [releaseMaturedInvestment] User profile error:`, userError);
    console.log(`🔍 [releaseMaturedInvestment] User profile data:`, userProfile);

    if (userError) {
      console.error(`❌ [releaseMaturedInvestment] Failed to fetch user profile:`, userError);
      throw userError;
    }

    // 2. Update user profile - move from total_invested to balance
    console.log(`🔍 [releaseMaturedInvestment] Step 2: Updating user profile`);
    console.log(`📊 [releaseMaturedInvestment] Before update - Balance: ${userProfile.balance}, Total Invested: ${userProfile.total_invested}`);
    console.log(`📊 [releaseMaturedInvestment] Moving $${investment.amount} from total_invested to balance`);

    const { error: updateError } = await supabase
      .from('chainrise_profile')
      .update({
        total_invested: (userProfile.total_invested || 0) - investment.amount,
        balance: (userProfile.balance || 0) + investment.amount,
        updated_at: new Date().toISOString()
      })
      .eq('id', investment.user_id);

    console.log(`📋 [releaseMaturedInvestment] User profile update completed`);
    console.log(`🔍 [releaseMaturedInvestment] Update error:`, updateError);

    if (updateError) {
      console.error(`❌ [releaseMaturedInvestment] Failed to update user profile:`, updateError);
      throw updateError;
    }

    // 3. Update investment record
    console.log(`🔍 [releaseMaturedInvestment] Step 3: Updating investment record status`);
    const { error: investmentError } = await supabase
      .from('admin_fee_deposits')
      .update({
        status: 'completed',
        is_locked: false,
        locked_amount: 0,
        released_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', investment.id);

    console.log(`📋 [releaseMaturedInvestment] Investment record update completed`);
    console.log(`🔍 [releaseMaturedInvestment] Investment update error:`, investmentError);

    if (investmentError) {
      console.error(`❌ [releaseMaturedInvestment] Failed to update investment record:`, investmentError);
      throw investmentError;
    }

    // 4. Record transaction
    console.log(`🔍 [releaseMaturedInvestment] Step 4: Recording transaction`);
    const transactionData = {
      user_id: investment.user_id,
      type: 'investment_maturity',
      amount: investment.amount,
      currency: 'USD',
      description: `Investment maturity release from ${investment.investment_plan}`,
      reference: `MATURITY-${investment.id}-${Date.now()}`,
      status: 'completed',
      metadata: {
        investment_id: investment.id,
        investment_plan: investment.investment_plan,
        locked_days: 60
      }
    };

    console.log(`📊 [releaseMaturedInvestment] Transaction data:`, transactionData);

    const { error: transactionError } = await supabase
      .from('chainrise_transactions')
      .insert(transactionData);

    console.log(`📋 [releaseMaturedInvestment] Transaction recording completed`);
    console.log(`🔍 [releaseMaturedInvestment] Transaction error:`, transactionError);

    if (transactionError) {
      console.error(`❌ [releaseMaturedInvestment] Failed to record transaction:`, transactionError);
      // Don't throw here - transaction recording failure shouldn't fail the whole process
    } else {
      console.log(`✅ [releaseMaturedInvestment] Transaction recorded successfully`);
    }

    console.log(`✅ [releaseMaturedInvestment] Successfully released investment ${investment.id}`);
    console.log(`🎉 [releaseMaturedInvestment] Investment release process completed successfully`);
    return { success: true };
  } catch (err) {
    console.error(`💥 [releaseMaturedInvestment] Error for investment ${investment.id}:`, err);
    console.error(`🔍 [releaseMaturedInvestment] Error context for investment ${investment.id}:`, {
      investmentId: investment.id,
      userId: investment.user_id,
      amount: investment.amount,
      error: err instanceof Error ? err.message : 'Unknown error'
    });
    return { success: false, error: err instanceof Error ? err.message : 'Unknown error' };
  }
}

async function processDailyInvestmentEarnings(): Promise<{ processed?: number; error?: string }> {
  console.log('💰 [processDailyInvestmentEarnings] Starting daily earnings processing');
  
  try {
    console.log('💰 [processDailyInvestmentEarnings] Processing daily earnings...');
    console.log('🔍 [processDailyInvestmentEarnings] Querying for active locked investments');

    // Get all active locked investments
    const { data: activeInvestments, error } = await supabase
      .from('admin_fee_deposits')
      .select('*')
      .eq('is_locked', true)
      .eq('status', 'locked')
      .gte('days_remaining', 1);

    console.log('📋 [processDailyInvestmentEarnings] Database query completed');
    console.log('🔍 [processDailyInvestmentEarnings] Query error:', error);
    console.log('🔍 [processDailyInvestmentEarnings] Active investments found:', activeInvestments?.length);

    if (error) {
      console.error('[processDailyInvestmentEarnings] Database error:', error);
      return { error: error.message };
    }

    if (!activeInvestments || activeInvestments.length === 0) {
      console.log('💰 [processDailyInvestmentEarnings] No active investments found');
      console.log('✅ [processDailyInvestmentEarnings] No earnings to process - returning 0 processed');
      return { processed: 0 };
    }

    console.log(`💰 [processDailyInvestmentEarnings] Found ${activeInvestments.length} active investments for earnings calculation`);
    
    let processedCount = 0;
    const errors: string[] = [];

    console.log('🔄 [processDailyInvestmentEarnings] Starting individual earnings calculation loop');
    
    for (const investment of activeInvestments) {
      console.log(`🔄 [processDailyInvestmentEarnings] Processing earnings for investment ${investment.id}`);
      console.log(`📊 [processDailyInvestmentEarnings] Investment details:`, {
        id: investment.id,
        amount: investment.amount,
        plan: investment.investment_plan,
        daysRemaining: investment.days_remaining
      });
      
      try {
        const earningsResult = await calculateAndAddDailyEarnings(investment);
        if (earningsResult.success) {
          processedCount++;
          console.log(`✅ [processDailyInvestmentEarnings] Successfully processed earnings for investment ${investment.id}`);
        } else {
          errors.push(`Investment ${investment.id}: ${earningsResult.error}`);
          console.error(`❌ [processDailyInvestmentEarnings] Failed to process earnings for investment ${investment.id}:`, earningsResult.error);
        }
      } catch (err) {
        const errorMsg = `Investment ${investment.id}: ${err instanceof Error ? err.message : 'Unknown error'}`;
        errors.push(errorMsg);
        console.error(`💥 [processDailyInvestmentEarnings] Exception processing earnings for investment ${investment.id}:`, err);
      }
    }

    console.log(`📊 [processDailyInvestmentEarnings] Earnings processing completed: ${processedCount} successful, ${errors.length} errors`);

    if (errors.length > 0) {
      console.error(`💰 [processDailyInvestmentEarnings] Completed with ${errors.length} errors`);
      console.error('❌ [processDailyInvestmentEarnings] Error details:', errors);
      return { 
        processed: processedCount, 
        error: `Completed with ${errors.length} errors: ${errors.join('; ')}` 
      };
    }

    console.log(`✅ [processDailyInvestmentEarnings] Processed ${processedCount} investments`);
    console.log('🎉 [processDailyInvestmentEarnings] All earnings processed successfully');
    return { processed: processedCount };
  } catch (err) {
    console.error('💥 [processDailyInvestmentEarnings] Unexpected error in main function:', err);
    console.error('🔍 [processDailyInvestmentEarnings] Error context:', {
      timestamp: new Date().toISOString(),
      errorDetails: err instanceof Error ? {
        name: err.name,
        message: err.message,
        stack: err.stack
      } : 'Unknown error'
    });
    return { error: 'Unexpected error processing daily earnings' };
  }
}

async function calculateAndAddDailyEarnings(investment: any): Promise<{ success: boolean; error?: string }> {
  console.log(`💰 [calculateAndAddDailyEarnings] Starting earnings calculation for investment ${investment.id}`);
  
  try {
    const dailyPercentage = getDailyPercentageForPlan(investment.investment_plan);
    const dailyEarnings = (investment.amount * dailyPercentage) / 100;

    console.log(`📈 [calculateAndAddDailyEarnings] Investment ${investment.id}: $${investment.amount} × ${dailyPercentage}% = $${dailyEarnings.toFixed(2)}`);
    console.log(`📊 [calculateAndAddDailyEarnings] Earnings calculation details:`, {
      investmentId: investment.id,
      principal: investment.amount,
      dailyPercentage: dailyPercentage,
      dailyEarnings: dailyEarnings
    });

    // Update user balance and total_earnings
    console.log(`🔍 [calculateAndAddDailyEarnings] Step 1: Fetching user profile for user ${investment.user_id}`);
    const { data: userProfile, error: userError } = await supabase
      .from('chainrise_profile')
      .select('balance, total_earnings')
      .eq('id', investment.user_id)
      .single();

    console.log(`📋 [calculateAndAddDailyEarnings] User profile fetch completed`);
    console.log(`🔍 [calculateAndAddDailyEarnings] User profile error:`, userError);
    console.log(`🔍 [calculateAndAddDailyEarnings] Current user balance: ${userProfile?.balance}, total_earnings: ${userProfile?.total_earnings}`);

    if (userError) {
      console.error(`❌ [calculateAndAddDailyEarnings] Failed to fetch user profile:`, userError);
      throw userError;
    }

    console.log(`🔍 [calculateAndAddDailyEarnings] Step 2: Updating user balance and earnings`);
    console.log(`📊 [calculateAndAddDailyEarnings] Adding $${dailyEarnings} to balance and total_earnings`);

    const { error: updateError } = await supabase
      .from('chainrise_profile')
      .update({
        balance: (userProfile.balance || 0) + dailyEarnings,
        total_earnings: (userProfile.total_earnings || 0) + dailyEarnings,
        updated_at: new Date().toISOString()
      })
      .eq('id', investment.user_id);

    console.log(`📋 [calculateAndAddDailyEarnings] User profile update completed`);
    console.log(`🔍 [calculateAndAddDailyEarnings] Update error:`, updateError);

    if (updateError) {
      console.error(`❌ [calculateAndAddDailyEarnings] Failed to update user profile:`, updateError);
      throw updateError;
    }

    // Record earnings transaction
    console.log(`🔍 [calculateAndAddDailyEarnings] Step 3: Recording earnings transaction`);
    const transactionData = {
      user_id: investment.user_id,
      type: 'investment_earnings',
      amount: dailyEarnings,
      currency: 'USD',
      description: `Daily earnings from ${investment.investment_plan} investment`,
      reference: `EARN-${investment.id}-${Date.now()}`,
      status: 'completed',
      metadata: {
        investment_id: investment.id,
        investment_plan: investment.investment_plan,
        principal_amount: investment.amount,
        daily_percentage: dailyPercentage,
        days_remaining: investment.days_remaining
      }
    };

    console.log(`📊 [calculateAndAddDailyEarnings] Transaction data:`, transactionData);

    const { error: transactionError } = await supabase
      .from('chainrise_transactions')
      .insert(transactionData);

    console.log(`📋 [calculateAndAddDailyEarnings] Transaction recording completed`);
    console.log(`🔍 [calculateAndAddDailyEarnings] Transaction error:`, transactionError);

    if (transactionError) {
      console.error(`❌ [calculateAndAddDailyEarnings] Failed to record transaction:`, transactionError);
      // Don't throw here - transaction recording failure shouldn't fail the whole process
    } else {
      console.log(`✅ [calculateAndAddDailyEarnings] Earnings transaction recorded successfully`);
    }

    console.log(`✅ [calculateAndAddDailyEarnings] Successfully processed earnings for investment ${investment.id}`);
    console.log(`🎉 [calculateAndAddDailyEarnings] Earnings calculation completed successfully`);
    return { success: true };
  } catch (err) {
    console.error(`💥 [calculateAndAddDailyEarnings] Error for investment ${investment.id}:`, err);
    console.error(`🔍 [calculateAndAddDailyEarnings] Error context for investment ${investment.id}:`, {
      investmentId: investment.id,
      userId: investment.user_id,
      amount: investment.amount,
      plan: investment.investment_plan,
      error: err instanceof Error ? err.message : 'Unknown error'
    });
    return { success: false, error: err instanceof Error ? err.message : 'Unknown error' };
  }
}



export async function getUserInvestments(userId: string) {
  console.log(`📋 [getUserInvestments] Fetching investments for user: ${userId}`);
  
  try {
    console.log(`🔍 [getUserInvestments] Querying database for user ${userId}`);
    const { data: investments, error } = await supabase
      .from('admin_fee_deposits')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    console.log(`📋 [getUserInvestments] Database query completed`);
    console.log(`🔍 [getUserInvestments] Query error:`, error);
    console.log(`🔍 [getUserInvestments] Investments found:`, investments?.length);

    if (error) {
      console.error(`❌ [getUserInvestments] Database error for user ${userId}:`, error);
      throw error;
    }

    // Calculate totals
    console.log(`📊 [getUserInvestments] Calculating investment totals for user ${userId}`);
    const totals = {
      totalInvested: investments?.reduce((sum, inv) => sum + (inv.amount || 0), 0) || 0,
      totalLocked: investments?.filter(inv => inv.is_locked).reduce((sum, inv) => sum + (inv.locked_amount || 0), 0) || 0,
      totalEarnings: investments?.reduce((sum, inv) => sum + ((inv.amount * getDailyPercentageForPlan(inv.investment_plan)) / 100 * (60 - (inv.days_remaining || 0))), 0) || 0,
      activeInvestments: investments?.filter(inv => inv.is_locked).length || 0,
      maturedInvestments: investments?.filter(inv => !inv.is_locked && inv.status === 'completed').length || 0
    };

    console.log(`📊 [getUserInvestments] Totals calculated for user ${userId}:`, totals);
    console.log(`✅ [getUserInvestments] Successfully fetched investments for user ${userId}`);

    return { investments, totals, error: null };
  } catch (error) {
    console.error(`💥 [getUserInvestments] Error fetching user investments for user ${userId}:`, error);
    console.error(`🔍 [getUserInvestments] Error details:`, {
      userId: userId,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    return { investments: null, totals: null, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

export async function getInvestmentStats(userId: string) {
  console.log(`📊 [getInvestmentStats] Fetching investment stats for user: ${userId}`);
  
  try {
    console.log(`🔍 [getInvestmentStats] Querying database for user ${userId}`);
    const { data: investments, error } = await supabase
      .from('admin_fee_deposits')
      .select('*')
      .eq('user_id', userId);

    console.log(`📋 [getInvestmentStats] Database query completed`);
    console.log(`🔍 [getInvestmentStats] Query error:`, error);
    console.log(`🔍 [getInvestmentStats] Investments found for stats:`, investments?.length);

    if (error) {
      console.error(`❌ [getInvestmentStats] Database error for user ${userId}:`, error);
      throw error;
    }

    console.log(`📊 [getInvestmentStats] Calculating statistics for user ${userId}`);
    const stats = {
      totalValue: investments?.reduce((sum, inv) => sum + (inv.amount || 0), 0) || 0,
      dailyEarnings: investments?.filter(inv => inv.is_locked).reduce((sum, inv) => sum + ((inv.amount * getDailyPercentageForPlan(inv.investment_plan)) / 100), 0) || 0,
      monthlyEarnings: investments?.filter(inv => inv.is_locked).reduce((sum, inv) => sum + ((inv.amount * getDailyPercentageForPlan(inv.investment_plan)) / 100 * 30), 0) || 0,
      availableBalance: 0, // This would come from user profile
      lockedBalance: investments?.filter(inv => inv.is_locked).reduce((sum, inv) => sum + (inv.locked_amount || 0), 0) || 0
    };

    console.log(`📊 [getInvestmentStats] Statistics calculated for user ${userId}:`, stats);
    console.log(`✅ [getInvestmentStats] Successfully fetched investment stats for user ${userId}`);

    return { stats, error: null };
  } catch (error) {
    console.error(`💥 [getInvestmentStats] Error fetching investment stats for user ${userId}:`, error);
    console.error(`🔍 [getInvestmentStats] Error details:`, {
      userId: userId,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    return { stats: null, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

console.log('✅ [investmentService] Investment service module fully loaded and ready');


function getDailyPercentageForPlan(plan: string): number {
  console.log(`📊 [getDailyPercentageForPlan] Getting daily percentage for plan: ${plan}`);
  
  const planPercentages: { [key: string]: number } = {
    'plan_1': 2.20,
    'plan_2': 4.40,
    'plan_3': 6.60,
    'plan_4': 8.80
  };
  
  const percentage = planPercentages[plan] || 0;
  console.log(`📊 [getDailyPercentageForPlan] Plan ${plan} has daily percentage: ${percentage}%`);
  
  return percentage;
}