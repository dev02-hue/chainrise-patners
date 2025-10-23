import { DepositAnalytics } from '@/types/businesses';

// Mock data generator for development
export const generateMockAnalytics = (): DepositAnalytics => {
  return {
    overview: {
      totalDeposits: 0,
      totalAmount: 0,
      pendingDeposits: 0,
      completedDeposits: 0,
      averageDeposit: 0,
      growthRate: 0
    },
    timeline: Array.from({ length: 30 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (29 - i));
      return {
        date: date.toISOString().split('T')[0],
        deposits: Math.floor(Math.random() * 50) + 20,
        amount: Math.floor(Math.random() * 20000) + 5000,
        completed: Math.floor(Math.random() * 45) + 15,
        pending: Math.floor(Math.random() * 10) + 1
      };
    }),
    walletAnalytics: [
      {
        cryptoType: 'BTC',
        totalDeposits: 456,
        totalAmount: 187500,
        averageAmount: 411.2,
        successRate: 98.5,
        pendingCount: 7
      },
      {
        cryptoType: 'ETH',
        totalDeposits: 389,
        totalAmount: 142300,
        averageAmount: 365.8,
        successRate: 97.2,
        pendingCount: 11
      },
      {
        cryptoType: 'USDT',
        totalDeposits: 402,
        totalAmount: 128430,
        averageAmount: 319.5,
        successRate: 99.1,
        pendingCount: 5
      }
    ],
    statusDistribution: {
      pending: 23,
      confirmed: 45,
      completed: 1150,
      failed: 12,
      cancelled: 17
    },
    performanceMetrics: {
      approvalRate: 96.8,
      averageProcessingTime: 2.3,
      completionRate: 94.2,
      totalUsers: 856,
      activeUsers: 723
    },
    recentActivity: []
  };
};

// Format currency
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
};

// Format percentage
export const formatPercentage = (value: number): string => {
  return `${value.toFixed(1)}%`;
};

// Format number
export const formatNumber = (num: number): string => {
  return new Intl.NumberFormat('en-US').format(num);
};