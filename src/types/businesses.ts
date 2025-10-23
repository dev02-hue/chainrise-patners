// data/businesses.ts
import { FaLeaf, FaBitcoin, FaChartLine } from "react-icons/fa";

export const businesses = [
  {
    id: 1,
    title: "Agriculture",
    icon: FaLeaf,
    image: "/iceben-agriculture.jpg",
    description:
      "Accilent Finance Limited invests in innovative farming techniques and advanced agribusiness ventures. Our focus is on productivity, profitability, and sustainability in agriculture.",
  },
  {
    id: 2,
    title: "Crypto Mining",
    icon: FaBitcoin,
    image: "/iceben-crypto.jpg",
    description:
      "As pioneers in the digital currency revolution, we invest in cutting-edge crypto mining operations to maximize returns through strategic asset allocation and secure technology.",
  },
  {
    id: 3,
    title: "Stock Trading",
    icon: FaChartLine,
    image: "/iceben-stock.jpg",
    description:
      "Our stock trading platform uses real-time analytics and market insights to identify opportunities and generate consistent returns for our clients.",
  },
];




 
export interface DepositInput {
  planId: string; // Changed from number to string to match UUID
  amount: number;
  cryptoType: string; // Changed from CryptoType to string
  transactionHash?: string;
}

export interface User {
  id: string;
  username: string;
  email: string;
  is_banned?: boolean;  // ✅ optional (matches what Supabase returns)
  banned_at?: string | null;
}



 export interface InvestmentPlan {
  id: string; // Changed from number to string to match UUID
  title: string;
  description: string;
  min_amount: number; // Changed from minAmount to match server
  max_amount: number | null; // Changed from maxAmount to match server
  daily_profit_percentage: number; // Changed from percentage to match server
  duration_days: number; // Changed from durationDays to match server
  total_return_percentage: number;
  features: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CryptoPaymentOption {
  id: string; // Changed from number to string to match UUID
  name: string;
  symbol: string;
  network: string;
  walletAddress: string;
}

export type DepositStatus = 'pending' | 'confirmed' | 'completed' | 'failed' | 'cancelled';

export type CryptoType = 'BTC' | 'ETH' | 'BNB' | 'DOGE' | 'SOL' | 'USDT' | 'XRP' | 'LTC';

export interface Deposit {
  id: string;
  amount: number;
  cryptoType: string; // Changed from CryptoType to string for flexibility
  status: DepositStatus;
  reference: string;
  createdAt: string;
  processedAt?: string;
  transactionHash?: string;
  adminNotes?: string;
  planTitle?: string;
  userEmail?: string;
  username?: string;
}


// Withdrawal status types
export type WithdrawalStatus =
  | "pending"
  | "processing"
  | "rejected"
  | "completed"
  | "cancelled";


// Input for initiating a withdrawal
export interface WithdrawalInput {
  amount: number;
  cryptoType: string;
  walletAddress: string;
}

// Withdrawal object
export interface Withdrawal {
  id: string;
  amount: number;
  cryptoType: string;
  status: WithdrawalStatus;
  reference: string;
  walletAddress: string;
  createdAt: string;
  processedAt?: string;
  adminNotes?: string;
  userEmail?: string;       // Only for admin views
  username?: string;   
  name?: string;     // Only for admin views
}

export type ProfileData = {
  name: string;
  username: string;
  referralCode: string;
  email: string;
  phoneNumber: string;
  balance: number;
};

export interface UpdateInvestmentPlanInput {
  id: string;
  title?: string;
  description?: string;
  min_amount?: number;
  max_amount?: number | null;
  daily_profit_percentage?: number;
  duration_days?: number;
  total_return_percentage?: number;
  features?: string[];
  is_active?: boolean;
}

export interface UpdateUserProfileInput {
  id: string;
  name: string;
  username: string;
  email: string;
  phoneNumber: string;
  balance: number;
}


export interface Profile {
  id: string;
  name: string;
  username: string;
  email: string;
  phoneNumber: string;
  balance: number;
  btcAddress?: string;
  bnbAddress?: string;
  dodgeAddress?: string;
  ethAddress?: string;
  solanaAddress?: string;
  usdttrc20Address?: string;
  referralCode?: string;
  referredBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateProfileInput {
  name?: string;
  username?: string;
  email?: string;
  phoneNumber?: string;
  currentPassword?: string;
  btcAddress?: string;
  bnbAddress?: string;
  dodgeAddress?: string;
  ethAddress?: string;
  solanaAddress?: string;
  usdttrc20Address?: string;
}

 // Add these to your existing types in deposit.ts

export interface DepositAnalytics {
  overview: DepositOverview;
  timeline: DepositTimelineData[];
  walletAnalytics: WalletAnalytics[];
  statusDistribution: StatusDistribution;
  performanceMetrics: PerformanceMetrics;
  recentActivity: Deposit[];
}

export interface DepositOverview {
  totalDeposits: number;
  totalAmount: number;
  pendingDeposits: number;
  completedDeposits: number;
  averageDeposit: number;
  growthRate: number;
}

export interface DepositTimelineData {
  date: string;
  deposits: number;
  amount: number;
  completed: number;
  pending: number;
}

export interface WalletAnalytics {
  cryptoType: string;
  totalDeposits: number;
  totalAmount: number;
  averageAmount: number;
  successRate: number;
  pendingCount: number;
}

export interface StatusDistribution {
  pending: number;
  confirmed: number;
  completed: number;
  failed: number;
  cancelled: number;
}

export interface PerformanceMetrics {
  approvalRate: number;
  averageProcessingTime: number; // in hours
  completionRate: number;
  totalUsers: number;
  activeUsers: number;
}


export type EmailInput = {
  recipientEmail: string
  subject: string
  message: string
}

export type AdminEmailResponse = {
  success?: boolean
  error?: string
  message?: string
}


// Add these to your existing types

export type BanUserInput = {
  userId: string;
  reason?: string;
  duration?: number; // in hours, undefined = permanent
}

export type DeleteUserInput = {
  userId: string;
  confirm?: boolean;
}

export type UserManagementResponse = {
  success: boolean;
  message: string;
  userId?: string;
  action?: 'banned' | 'unbanned' | 'deleted';
}

export type BanRecord = {
  id: string;
  user_id: string;
  banned_by: string;
  reason: string | null;
  banned_at: string;
  expires_at: string | null;
  is_active: boolean;
}