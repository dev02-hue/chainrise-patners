/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import { supabase } from "@/lib/supabaseClient";

 

 

// Calculate daily profits (to be called by a cron job)
export async function calculateDailyProfits(): Promise<{ 
  success?: boolean; 
  error?: string; 
  data?: any;
  summary?: {
    totalUsersProcessed: number;
    totalProfitsDistributed: number;
    usersWithInvestments: number;
  }
}> {
  try {
    console.log('🔄 Starting daily profit calculation...', new Date().toISOString());

    // Get all users with total_invested > 0
    const { data: users, error: usersError } = await supabase
      .from('chainrise_profile')
      .select('id, total_invested, balance, total_earnings')
      .gt('total_invested', 0)
      .eq('is_active', true);

    if (usersError) {
      console.error('❌ Error fetching users:', usersError);
      return { error: 'Failed to fetch users: ' + usersError.message };
    }

    if (!users || users.length === 0) {
      console.log('ℹ️ No users with investments found');
      return { 
        success: true, 
        data: { message: 'No users with investments found' },
        summary: {
          totalUsersProcessed: 0,
          totalProfitsDistributed: 0,
          usersWithInvestments: 0
        }
      };
    }

    console.log(`📊 Processing ${users.length} users with investments`);

    let totalProfitsDistributed = 0;
    let usersWithInvestments = 0;

    // Process each user
    for (const user of users) {
      try {
        const userTotalInvested = user.total_invested || 0;
        
        if (userTotalInvested <= 0) continue;

        usersWithInvestments++;
        
        // Determine which investment plan the user is in based on their total_invested
        let dailyProfitPercentage = 0;
        
        if (userTotalInvested >= 30000 && userTotalInvested <= 59999) {
          dailyProfitPercentage = 8.80; // Plan 4
        } else if (userTotalInvested >= 10000 && userTotalInvested <= 29999) {
          dailyProfitPercentage = 6.60; // Plan 3
        } else if (userTotalInvested >= 3000 && userTotalInvested <= 9999) {
          dailyProfitPercentage = 4.40; // Plan 2
        } else if (userTotalInvested >= 100 && userTotalInvested <= 2999) {
          dailyProfitPercentage = 2.20; // Plan 1
        } else {
          console.log(`⚠️ User ${user.id} has investment amount ${userTotalInvested} outside plan ranges`);
          continue;
        }

        // Calculate daily profit
        const dailyProfit = (userTotalInvested * dailyProfitPercentage) / 100;
        
        console.log(`💰 User ${user.id}:`, {
          totalInvested: userTotalInvested,
          planPercentage: dailyProfitPercentage,
          dailyProfit: dailyProfit
        });

        // Update user's balance and total_earnings
        const { error: updateError } = await supabase
          .from('chainrise_profile')
          .update({
            balance: (user.balance || 0) + dailyProfit,
            total_earnings: (user.total_earnings || 0) + dailyProfit,
            updated_at: new Date().toISOString()
          })
          .eq('id', user.id);

        if (updateError) {
          console.error(`❌ Failed to update user ${user.id}:`, updateError);
          continue;
        }

        totalProfitsDistributed += dailyProfit;

        // Record the profit transaction
        await supabase
          .from('chainrise_transactions')
          .insert({
            user_id: user.id,
            type: 'profit',
            amount: dailyProfit,
            currency: 'USD',
            description: `Daily profit from investment (${dailyProfitPercentage}% ROI)`,
            reference: `PROFIT-${Date.now()}-${user.id.slice(0, 8)}`,
            status: 'completed',
            metadata: {
              investment_amount: userTotalInvested,
              profit_percentage: dailyProfitPercentage,
              calculated_at: new Date().toISOString()
            }
          });

        console.log(`✅ Successfully distributed $${dailyProfit.toFixed(2)} to user ${user.id}`);

      } catch (userError) {
        console.error(`❌ Error processing user ${user.id}:`, userError);
        continue;
      }
    }

    const summary = {
      totalUsersProcessed: users.length,
      totalProfitsDistributed: parseFloat(totalProfitsDistributed.toFixed(2)),
      usersWithInvestments: usersWithInvestments
    };

    console.log('✅ Daily profits calculation completed:', summary);

    return { 
      success: true, 
      data: { 
        message: `Distributed $${totalProfitsDistributed.toFixed(2)} in profits to ${usersWithInvestments} users` 
      },
      summary 
    };

  } catch (err) {
    console.error('💥 Unexpected error in calculateDailyProfits:', err);
    const error = err as Error;
    return { 
      error: 'An unexpected error occurred: ' + error.message,
      data: { stack: error.stack }
    };
  }
}

// Optional: Get user's current investment plan based on total_invested
export async function getUserInvestmentPlan(userId: string): Promise<{
  data?: {
    plan: string;
    percentage: number;
    totalInvested: number;
    dailyProfit: number;
  };
  error?: string;
}> {
  try {
    const { data: user, error } = await supabase
      .from('chainrise_profile')
      .select('total_invested')
      .eq('id', userId)
      .single();

    if (error || !user) {
      return { error: 'User not found' };
    }

    const totalInvested = user.total_invested || 0;
    
    if (totalInvested <= 0) {
      return { error: 'User has no investments' };
    }

    let plan = '';
    let percentage = 0;

    if (totalInvested >= 30000 && totalInvested <= 59999) {
      plan = 'Plan 4';
      percentage = 8.80;
    } else if (totalInvested >= 10000 && totalInvested <= 29999) {
      plan = 'Plan 3';
      percentage = 6.60;
    } else if (totalInvested >= 3000 && totalInvested <= 9999) {
      plan = 'Plan 2';
      percentage = 4.40;
    } else if (totalInvested >= 100 && totalInvested <= 2999) {
      plan = 'Plan 1';
      percentage = 2.20;
    } else {
      return { error: 'Investment amount outside plan ranges' };
    }

    const dailyProfit = (totalInvested * percentage) / 100;

    return {
      data: {
        plan,
        percentage,
        totalInvested,
        dailyProfit: parseFloat(dailyProfit.toFixed(2))
      }
    };
  } catch (err) {
    console.error('Error getting user investment plan:', err);
    return { error: 'Failed to get investment plan' };
  }
}

// Optional: Manual profit calculation for a specific user (for testing)
export async function calculateUserProfit(userId: string): Promise<{
  success?: boolean;
  error?: string;
  data?: {
    previousBalance: number;
    newBalance: number;
    previousEarnings: number;
    newEarnings: number;
    profitAmount: number;
    plan: string;
  };
}> {
  try {
    const { data: user, error } = await supabase
      .from('chainrise_profile')
      .select('balance, total_earnings, total_invested')
      .eq('id', userId)
      .single();

    if (error || !user) {
      return { error: 'User not found' };
    }

    const totalInvested = user.total_invested || 0;
    
    if (totalInvested <= 0) {
      return { error: 'User has no investments' };
    }

    // Determine investment plan and calculate profit
    let plan = '';
    let percentage = 0;

    if (totalInvested >= 30000 && totalInvested <= 59999) {
      plan = 'Plan 4';
      percentage = 8.80;
    } else if (totalInvested >= 10000 && totalInvested <= 29999) {
      plan = 'Plan 3';
      percentage = 6.60;
    } else if (totalInvested >= 3000 && totalInvested <= 9999) {
      plan = 'Plan 2';
      percentage = 4.40;
    } else if (totalInvested >= 100 && totalInvested <= 2999) {
      plan = 'Plan 1';
      percentage = 2.20;
    } else {
      return { error: 'Investment amount outside plan ranges' };
    }

    const profitAmount = (totalInvested * percentage) / 100;
    const newBalance = (user.balance || 0) + profitAmount;
    const newEarnings = (user.total_earnings || 0) + profitAmount;

    // Update user
    const { error: updateError } = await supabase
      .from('chainrise_profile')
      .update({
        balance: newBalance,
        total_earnings: newEarnings,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId);

    if (updateError) {
      return { error: 'Failed to update user balance' };
    }

    // Record transaction
    await supabase
      .from('chainrise_transactions')
      .insert({
        user_id: userId,
        type: 'profit',
        amount: profitAmount,
        currency: 'USD',
        description: `Manual profit calculation (${plan} - ${percentage}% ROI)`,
        reference: `MANUAL-PROFIT-${Date.now()}`,
        status: 'completed',
        metadata: {
          plan: plan,
          percentage: percentage,
          investment_amount: totalInvested,
          calculated_at: new Date().toISOString()
        }
      });

    return {
      success: true,
      data: {
        previousBalance: user.balance || 0,
        newBalance: newBalance,
        previousEarnings: user.total_earnings || 0,
        newEarnings: newEarnings,
        profitAmount: parseFloat(profitAmount.toFixed(2)),
        plan: plan
      }
    };
  } catch (err) {
    console.error('Error in calculateUserProfit:', err);
    return { error: 'Failed to calculate user profit' };
  }
}