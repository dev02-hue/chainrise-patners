/* eslint-disable @typescript-eslint/no-explicit-any */
import { Deposit, DepositAnalytics, DepositOverview, DepositTimelineData, PerformanceMetrics, StatusDistribution, WalletAnalytics } from "@/types/businesses";
import { getSession } from "./auth";
import { supabase } from "./supabaseClient";
import { getUserDeposits } from "./investmentplan";

// Comprehensive Deposit Analytics
export async function getDepositAnalytics(
  timeframe: '24h' | '7d' | '30d' | '90d' | '1y' | 'all' = '30d',
  userId?: string
): Promise<{ data?: DepositAnalytics; error?: string }> {
  try {
    const session = await getSession();
    if (!session?.user) {
      return { error: 'Not authenticated' };
    }

    // Calculate date range
    const dateRange = calculateDateRange(timeframe);
    
    // Fetch all necessary data in parallel
    const [
      overviewData,
      timelineData,
      walletData,
      statusData,
      performanceData,
      recentDeposits
    ] = await Promise.all([
      getDepositOverview(dateRange, userId),
      getDepositTimeline(dateRange, userId),
      getWalletAnalytics(dateRange, userId),
      getStatusDistribution(dateRange, userId),
      getPerformanceMetrics(dateRange, userId),
      getRecentDeposits(userId)
    ]);

    return {
      data: {
        overview: overviewData,
        timeline: timelineData,
        walletAnalytics: walletData,
        statusDistribution: statusData,
        performanceMetrics: performanceData,
        recentActivity: recentDeposits
      }
    };
  } catch (err) {
    console.error('Error in getDepositAnalytics:', err);
    return { error: 'Failed to fetch analytics' };
  }
}

// Real-time deposit monitoring
export async function subscribeToDepositUpdates(
  callback: (payload: any) => void,
  userId?: string
) {
  const query = supabase
    .channel('deposit-updates')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'chainrise_deposits',
        ...(userId && { filter: `user_id=eq.${userId}` })
      },
      callback
    )
    .subscribe();

  return () => {
    supabase.removeChannel(query);
  };
}

// Export analytics data
export async function exportDepositAnalytics(
  timeframe: string,
  format: 'csv' | 'json' = 'csv'
): Promise<{ data?: string; error?: string }> {
  try {
    const { data: analytics, error } = await getDepositAnalytics(timeframe as any);
    
    if (error) {
      return { error };
    }

    if (format === 'csv') {
      const csv = convertAnalyticsToCSV(analytics);
      return { data: csv };
    } else {
      return { data: JSON.stringify(analytics, null, 2) };
    }
  } catch (err) {
    console.error('Error exporting analytics:', err);
    return { error: 'Failed to export analytics' };
  }
}

function convertAnalyticsToCSV(analytics: DepositAnalytics | undefined): string {
  if (!analytics) return '';
  
  const headers = ['Metric', 'Value'];
  const rows = [
    ['Total Deposits', analytics.overview.totalDeposits],
    ['Total Amount', analytics.overview.totalAmount],
    ['Pending Deposits', analytics.overview.pendingDeposits],
    ['Average Deposit', analytics.overview.averageDeposit],
    ['Growth Rate', analytics.overview.growthRate],
    ['Approval Rate', analytics.performanceMetrics.approvalRate],
    ['Completion Rate', analytics.performanceMetrics.completionRate]
  ];

  return [headers, ...rows].map(row => row.join(',')).join('\n');
}

// Alert system for unusual activity
export async function checkDepositAnomalies(): Promise<{ anomalies: string[]; error?: string }> {
  try {
    const anomalies: string[] = [];
    
    // Check for unusually large deposits
    const { data: largeDeposits } = await supabase
      .from('chainrise_deposits')
      .select('amount, created_at, user_id')
      .gte('amount', 10000) // $10,000 threshold
      .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

    if (largeDeposits && largeDeposits.length > 0) {
      anomalies.push(`Large deposits detected: ${largeDeposits.length} deposits over $10,000 in last 24h`);
    }

    // Check for rapid successive deposits
    const { data: rapidDeposits } = await supabase.rpc('check_rapid_deposits');
    if (rapidDeposits && rapidDeposits.length > 0) {
      anomalies.push(`Rapid deposit activity detected for ${rapidDeposits.length} users`);
    }

    return { anomalies };
  } catch (err) {
    console.error('Error checking deposit anomalies:', err);
    return { anomalies: [], error: 'Failed to check anomalies' };
  }
}

// Individual Analytics Components
async function getDepositOverview(dateRange: { start: Date; end: Date }, userId?: string): Promise<DepositOverview> {
  let query = supabase
    .from('chainrise_deposits')
    .select('amount, status, created_at', { count: 'exact' })
    .gte('created_at', dateRange.start.toISOString())
    .lte('created_at', dateRange.end.toISOString());

  if (userId) {
    query = query.eq('user_id', userId);
  }

  const { data, count, error } = await query;

  if (error || !data) {
    return getDefaultOverview();
  }

  const totalAmount = data.reduce((sum, deposit) => sum + deposit.amount, 0);
  const pendingDeposits = data.filter(d => d.status === 'pending').length;
  const completedDeposits = data.filter(d => d.status === 'completed').length;
  const previousPeriodData = await getPreviousPeriodData(dateRange, userId);
  
  const growthRate = previousPeriodData.totalAmount > 0 
    ? ((totalAmount - previousPeriodData.totalAmount) / previousPeriodData.totalAmount) * 100
    : 0;

  return {
    totalDeposits: count || 0,
    totalAmount,
    pendingDeposits,
    completedDeposits,
    averageDeposit: count ? totalAmount / count : 0,
    growthRate
  };
}

async function getDepositTimeline(dateRange: { start: Date; end: Date }, userId?: string): Promise<DepositTimelineData[]> {
  const { data, error } = await supabase.rpc('get_deposit_timeline', {
    start_date: dateRange.start.toISOString(),
    end_date: dateRange.end.toISOString(),
    user_id: userId || null
  });

  if (error) {
    console.error('Error fetching timeline:', error);
    return [];
  }

  return data || [];
}

async function getWalletAnalytics(dateRange: { start: Date; end: Date }, userId?: string): Promise<WalletAnalytics[]> {
  const { data, error } = await supabase.rpc('get_wallet_analytics', {
    start_date: dateRange.start.toISOString(),
    end_date: dateRange.end.toISOString(),
    user_id: userId || null
  });

  if (error) {
    console.error('Error fetching wallet analytics:', error);
    return [];
  }

  return data || [];
}

async function getStatusDistribution(dateRange: { start: Date; end: Date }, userId?: string): Promise<StatusDistribution> {
  let query = supabase
    .from('chainrise_deposits')
    .select('status')
    .gte('created_at', dateRange.start.toISOString())
    .lte('created_at', dateRange.end.toISOString());

  if (userId) {
    query = query.eq('user_id', userId);
  }

  const { data, error } = await query;

  if (error || !data) {
    return getDefaultStatusDistribution();
  }

  return {
    pending: data.filter(d => d.status === 'pending').length,
    confirmed: data.filter(d => d.status === 'confirmed').length,
    completed: data.filter(d => d.status === 'completed').length,
    failed: data.filter(d => d.status === 'failed').length,
    cancelled: data.filter(d => d.status === 'cancelled').length
  };
}

async function getPerformanceMetrics(dateRange: { start: Date; end: Date }, userId?: string): Promise<PerformanceMetrics> {
  const { data, error } = await supabase.rpc('get_deposit_performance_metrics', {
    start_date: dateRange.start.toISOString(),
    end_date: dateRange.end.toISOString(),
    user_id: userId || null
  });

  if (error || !data || data.length === 0) {
    return getDefaultPerformanceMetrics();
  }

  return data[0];
}

async function getRecentDeposits(userId?: string, limit: number = 10): Promise<Deposit[]> {
  const { data } = await getUserDeposits({ limit });
  return data || [];
}

// Helper Functions
function calculateDateRange(timeframe: string): { start: Date; end: Date } {
  const end = new Date();
  const start = new Date();

  switch (timeframe) {
    case '24h':
      start.setDate(start.getDate() - 1);
      break;
    case '7d':
      start.setDate(start.getDate() - 7);
      break;
    case '30d':
      start.setDate(start.getDate() - 30);
      break;
    case '90d':
      start.setDate(start.getDate() - 90);
      break;
    case '1y':
      start.setFullYear(start.getFullYear() - 1);
      break;
    case 'all':
      start.setFullYear(2020); // From beginning
      break;
    default:
      start.setDate(start.getDate() - 30);
  }

  return { start, end };
}

async function getPreviousPeriodData(currentRange: { start: Date; end: Date }, userId?: string) {
  const periodMs = currentRange.end.getTime() - currentRange.start.getTime();
  const previousEnd = new Date(currentRange.start.getTime() - 1);
  const previousStart = new Date(previousEnd.getTime() - periodMs);

  return getDepositOverview({ start: previousStart, end: previousEnd }, userId);
}

// Default values for error cases
function getDefaultOverview(): DepositOverview {
  return {
    totalDeposits: 0,
    totalAmount: 0,
    pendingDeposits: 0,
    completedDeposits: 0,
    averageDeposit: 0,
    growthRate: 0
  };
}

function getDefaultStatusDistribution(): StatusDistribution {
  return {
    pending: 0,
    confirmed: 0,
    completed: 0,
    failed: 0,
    cancelled: 0
  };
}

function getDefaultPerformanceMetrics(): PerformanceMetrics {
  return {
    approvalRate: 0,
    averageProcessingTime: 0,
    completionRate: 0,
    totalUsers: 0,
    activeUsers: 0
  };
}