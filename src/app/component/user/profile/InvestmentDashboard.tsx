/* eslint-disable @typescript-eslint/no-explicit-any */
// components/investment/InvestmentDashboard.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiTrendingUp, 
  FiLock, 
  FiUnlock, 
  FiDollarSign, 
  FiPieChart,
  FiRefreshCw,
  FiCalendar,
  FiClock
} from 'react-icons/fi';
import { 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend,
  LineChart,
  Line
} from 'recharts';
import { processInvestmentMaturity, getUserInvestments, getInvestmentStats } from '@/lib/investmentService';

interface Investment {
  id: string;
  amount: number;
  investment_plan: string;
  is_locked: boolean;
  locked_amount: number;
  days_remaining: number;
  maturity_date: string;
  created_at: string;
  status: string;
  crypto_type: string;
  released_at?: string;
}

interface InvestmentStats {
  totalValue: number;
  dailyEarnings: number;
  monthlyEarnings: number;
  availableBalance: number;
  lockedBalance: number;
  totalEarnings?: number;
}

interface InvestmentTotals {
  totalInvested: number;
  totalLocked: number;
  totalEarnings: number;
  activeInvestments: number;
  maturedInvestments: number;
}

interface ServiceResponse {
  investments?: Investment[];
  totals?: InvestmentTotals;
  stats?: InvestmentStats;
  error?: string | null;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#A28DFF', '#FF6699'];

const InvestmentDashboard = ({ userId }: { userId: string }) => {
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [stats, setStats] = useState<InvestmentStats | null>(null);
  const [totals, setTotals] = useState<InvestmentTotals>({
    totalInvested: 0,
    totalLocked: 0,
    totalEarnings: 0,
    activeInvestments: 0,
    maturedInvestments: 0
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchInvestmentData();
  }, [userId]);

  const fetchInvestmentData = async () => {
    setRefreshing(true);
    try {
      console.log('🔄 [Dashboard] Fetching investment data for user:', userId);
      
      const [investmentsResult, statsResult] = await Promise.all([
        getUserInvestments(userId) as Promise<ServiceResponse>,
        getInvestmentStats(userId) as Promise<ServiceResponse>
      ]);

      console.log('📊 [Dashboard] Investments result:', investmentsResult);
      console.log('📈 [Dashboard] Stats result:', statsResult);

      if (investmentsResult?.investments) {
        setInvestments(investmentsResult.investments);
        
        // Calculate totals if not provided by service
        const calculatedTotals: InvestmentTotals = investmentsResult.totals || {
          totalInvested: investmentsResult.investments.reduce((sum: number, inv: Investment) => sum + (inv.amount || 0), 0),
          totalLocked: investmentsResult.investments.filter((inv: Investment) => inv.is_locked).reduce((sum: number, inv: Investment) => sum + (inv.locked_amount || 0), 0),
          totalEarnings: investmentsResult.investments.filter((inv: Investment) => inv.is_locked).reduce((sum: number, inv: Investment) => {
            const dailyRate = getDailyPercentage(inv.investment_plan);
            return sum + (inv.amount * dailyRate / 100 * (60 - (inv.days_remaining || 0)));
          }, 0),
          activeInvestments: investmentsResult.investments.filter((inv: Investment) => inv.is_locked).length,
          maturedInvestments: investmentsResult.investments.filter((inv: Investment) => !inv.is_locked && inv.status === 'completed').length
        };
        
        setTotals(calculatedTotals);
      }

      if (statsResult?.stats) {
        setStats(statsResult.stats);
      }

    } catch (error) {
      console.error('💥 [Dashboard] Error fetching investment data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleProcessMaturity = async () => {
    setProcessing(true);
    try {
      console.log('🔄 [Dashboard] Processing investment maturity...');
      const result = await processInvestmentMaturity();
      console.log('✅ [Dashboard] Maturity processing result:', result);
      
      if (result.success) {
        // Refresh data after processing
        await fetchInvestmentData();
      } else {
        console.error('❌ [Dashboard] Maturity processing failed:', result.error);
      }
    } catch (error) {
      console.error('💥 [Dashboard] Error processing maturity:', error);
    } finally {
      setProcessing(false);
    }
  };

  const chartData = investments
    .filter(inv => inv.is_locked)
    .map(inv => ({
      name: `Plan ${inv.investment_plan?.split('_')[1] || '1'}`,
      value: inv.amount,
      daysRemaining: inv.days_remaining,
      plan: inv.investment_plan
    }));

  const earningsTimelineData = generateEarningsTimeline(investments);

  if (loading) {
    return <InvestmentDashboardSkeleton />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
                Investment Portfolio
              </h1>
              <p className="text-gray-600 text-lg">
                Track your investments and earnings in real-time
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleProcessMaturity}
                disabled={processing}
                className="inline-flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors duration-200 disabled:opacity-50"
              >
                <FiClock className={`mr-2 ${processing ? 'animate-spin' : ''}`} />
                {processing ? 'Processing...' : 'Process Maturity'}
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={fetchInvestmentData}
                disabled={refreshing}
                className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors duration-200 disabled:opacity-50"
              >
                <FiRefreshCw className={`mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                {refreshing ? 'Refreshing...' : 'Refresh Data'}
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Investment Stats */}
        <InvestmentStats totals={totals} stats={stats} />

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <InvestmentAllocationChart data={chartData} />
          <EarningsProjectionChart investments={investments} />
        </div>

        {/* Earnings Timeline */}
        <EarningsTimelineChart data={earningsTimelineData} />

        {/* Investments List */}
        <InvestmentList 
          investments={investments} 
          onRefresh={fetchInvestmentData}
        />
      </div>
    </div>
  );
};

// Investment Stats Component
const InvestmentStats = ({ totals, stats }: { totals: InvestmentTotals, stats: InvestmentStats | null }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.2 }}
    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
  >
    {[
      { 
        title: 'Total Invested', 
        value: totals.totalInvested, 
        icon: FiDollarSign,
        color: 'blue',
        format: 'currency',
        description: 'All-time investments'
      },
      { 
        title: 'Locked Funds', 
        value: totals.totalLocked, 
        icon: FiLock,
        color: 'orange',
        format: 'currency',
        description: 'Currently locked'
      },
      { 
        title: 'Active Plans', 
        value: totals.activeInvestments, 
        icon: FiTrendingUp,
        color: 'green',
        format: 'number',
        description: 'Active investments'
      },
      { 
        title: 'Total Earnings', 
        value: stats?.totalEarnings || totals.totalEarnings, 
        icon: FiPieChart,
        color: 'purple',
        format: 'currency',
        description: 'All-time earnings'
      }
    ].map((stat, index) => (
      <motion.div
        key={stat.title}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 + index * 0.1 }}
        className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-all duration-300"
      >
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-sm font-medium text-gray-600 mb-1">{stat.title}</p>
            <p className="text-2xl font-bold text-gray-900">
              {stat.format === 'currency' 
                ? `$${stat.value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                : stat.value.toLocaleString()
              }
            </p>
            <p className="text-xs text-gray-500 mt-1">{stat.description}</p>
          </div>
          <div className={`p-3 rounded-xl ${
            stat.color === 'blue' ? 'bg-blue-50' :
            stat.color === 'orange' ? 'bg-orange-50' :
            stat.color === 'green' ? 'bg-green-50' : 'bg-purple-50'
          }`}>
            <stat.icon className={`${
              stat.color === 'blue' ? 'text-blue-500' :
              stat.color === 'orange' ? 'text-orange-500' :
              stat.color === 'green' ? 'text-green-500' : 'text-purple-500'
            } text-xl`} />
          </div>
        </div>
        
        {/* Additional stats for specific cards */}
        {stat.title === 'Total Earnings' && stats && (
          <div className="border-t border-gray-100 pt-3 mt-3">
            <div className="flex justify-between text-xs">
              <span className="text-gray-600">Daily:</span>
              <span className="font-semibold text-green-600">
                +${stats.dailyEarnings.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between text-xs mt-1">
              <span className="text-gray-600">Monthly:</span>
              <span className="font-semibold text-blue-600">
                +${stats.monthlyEarnings.toFixed(2)}
              </span>
            </div>
          </div>
        )}
      </motion.div>
    ))}
  </motion.div>
);

// Chart Components
const InvestmentAllocationChart = ({ data }: { data: any[] }) => {
  // Fix for Pie chart label type issue
  const renderCustomizedLabel = ({
    cx, cy, midAngle, innerRadius, outerRadius, percent
  }: any) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text 
        x={x} 
        y={y} 
        fill="white" 
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central"
        fontSize={12}
        fontWeight="bold"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Investment Allocation</h3>
        <FiPieChart className="text-gray-400 text-xl" />
      </div>
      {data.length > 0 ? (
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={renderCustomizedLabel}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip 
              formatter={(value: number) => [
                `$${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, 
                'Amount'
              ]} 
            />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      ) : (
        <div className="h-64 flex items-center justify-center text-gray-500">
          No active investments to display
        </div>
      )}
    </motion.div>
  );
};

const EarningsProjectionChart = ({ investments }: { investments: Investment[] }) => {
  const projectionData = investments
    .filter(inv => inv.is_locked)
    .map(inv => {
      const dailyEarnings = (inv.amount * getDailyPercentage(inv.investment_plan)) / 100;
      return {
        name: `Plan ${inv.investment_plan?.split('_')[1] || '1'}`,
        daily: dailyEarnings,
        monthly: dailyEarnings * 30,
        yearly: dailyEarnings * 365
      };
    });

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Earnings Projection</h3>
        <FiTrendingUp className="text-gray-400 text-xl" />
      </div>
      {projectionData.length > 0 ? (
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={projectionData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip 
              formatter={(value: number) => [
                `$${value.toFixed(2)}`, 
                'Earnings'
              ]} 
            />
            <Legend />
            <Bar dataKey="daily" fill="#0088FE" name="Daily" />
            <Bar dataKey="monthly" fill="#00C49F" name="Monthly" />
          </BarChart>
        </ResponsiveContainer>
      ) : (
        <div className="h-64 flex items-center justify-center text-gray-500">
          No active investments to display
        </div>
      )}
    </motion.div>
  );
};

const EarningsTimelineChart = ({ data }: { data: any[] }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.3 }}
    className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100 mb-8"
  >
    <div className="flex items-center justify-between mb-4">
      <h3 className="text-lg font-semibold text-gray-900">Earnings Timeline</h3>
      <FiCalendar className="text-gray-400 text-xl" />
    </div>
    {data.length > 0 ? (
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip 
            formatter={(value: number) => [
              `$${value.toFixed(2)}`, 
              'Earnings'
            ]} 
          />
          <Legend />
          <Line 
            type="monotone" 
            dataKey="earnings" 
            stroke="#8884d8" 
            strokeWidth={2}
            name="Daily Earnings"
          />
          <Line 
            type="monotone" 
            dataKey="cumulative" 
            stroke="#00C49F" 
            strokeWidth={2}
            name="Cumulative"
          />
        </LineChart>
      </ResponsiveContainer>
    ) : (
      <div className="h-64 flex items-center justify-center text-gray-500">
        No earnings data to display
      </div>
    )}
  </motion.div>
);

// Investment List Component
const InvestmentList = ({ investments }: { investments: Investment[], onRefresh: () => void }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.4 }}
    className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
  >
    <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center">
      <div>
        <h3 className="text-lg font-semibold text-gray-900">Your Investments</h3>
        <p className="text-sm text-gray-600 mt-1">Active and completed investment plans</p>
      </div>
      <div className="text-sm text-gray-500">
        {investments.filter(inv => inv.is_locked).length} active • {investments.filter(inv => !inv.is_locked).length} completed
      </div>
    </div>
    
    <div className="divide-y divide-gray-100">
      <AnimatePresence>
        {investments.length > 0 ? (
          investments.map((investment, index) => (
            <InvestmentListItem 
              key={investment.id} 
              investment={investment} 
              index={index}
            />
          ))
        ) : (
          <div className="p-8 text-center text-gray-500">
            <FiDollarSign className="mx-auto text-4xl text-gray-300 mb-3" />
            <p className="text-lg font-medium">No investments yet</p>
            <p className="text-sm">Start investing to see your portfolio here</p>
          </div>
        )}
      </AnimatePresence>
    </div>
  </motion.div>
);

const InvestmentListItem = ({ investment, index }: { 
  investment: Investment; 
  index: number;
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="p-6 hover:bg-gray-50 transition-colors cursor-pointer"
      onClick={() => setIsExpanded(!isExpanded)}
    >
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className={`p-3 rounded-xl ${
            investment.is_locked ? 'bg-orange-50' : 'bg-green-50'
          }`}>
            {investment.is_locked ? (
              <FiLock className="text-orange-500 text-xl" />
            ) : (
              <FiUnlock className="text-green-500 text-xl" />
            )}
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 capitalize">
              {investment.investment_plan?.replace('_', ' ') || 'Basic'} Plan
            </h4>
            <p className="text-sm text-gray-600">
              ${investment.amount.toLocaleString()} • {investment.crypto_type || 'USDT'}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Created: {new Date(investment.created_at).toLocaleDateString()}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-6">
          {investment.is_locked && (
            <div className="text-center">
              <p className="text-sm text-gray-600">Days Remaining</p>
              <p className="text-lg font-bold text-orange-600">
                {investment.days_remaining}
              </p>
            </div>
          )}
          
          <div className="text-center">
            <p className="text-sm text-gray-600">Status</p>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              investment.is_locked 
                ? 'bg-orange-100 text-orange-800'
                : 'bg-green-100 text-green-800'
            }`}>
              {investment.is_locked ? 'Active' : 'Completed'}
            </span>
          </div>
          
          {investment.is_locked && (
            <div className="text-right">
              <p className="text-sm text-gray-600">Daily Earnings</p>
              <p className="text-lg font-bold text-green-600">
                +${((investment.amount * getDailyPercentage(investment.investment_plan)) / 100).toFixed(2)}
              </p>
            </div>
          )}
        </div>
      </div>
      
      {investment.is_locked && (
        <div className="mt-4 bg-gray-50 rounded-lg p-3">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-gray-600">Matures on:</span>
            <span className="font-medium">
              {new Date(investment.maturity_date).toLocaleDateString()}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-500"
              style={{ width: `${Math.max(5, ((60 - investment.days_remaining) / 60) * 100)}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>Start</span>
            <span>{Math.round(((60 - investment.days_remaining) / 60) * 100)}% Complete</span>
            <span>Maturity</span>
          </div>
        </div>
      )}

      {isExpanded && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200"
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-gray-600">Investment ID</p>
              <p className="font-mono text-xs">{investment.id}</p>
            </div>
            <div>
              <p className="text-gray-600">Locked Amount</p>
              <p className="font-semibold">${investment.locked_amount.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-gray-600">Daily Rate</p>
              <p className="font-semibold text-green-600">
                {getDailyPercentage(investment.investment_plan)}%
              </p>
            </div>
            <div>
              <p className="text-gray-600">Total Earnings</p>
              <p className="font-semibold">
                ${((investment.amount * getDailyPercentage(investment.investment_plan)) / 100 * (60 - investment.days_remaining)).toFixed(2)}
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

// Helper functions
function getDailyPercentage(plan: string): number {
  const planPercentages: { [key: string]: number } = {
    'plan_1': 2.20,
    'plan_2': 4.40,
    'plan_3': 6.60,
    'plan_4': 8.80
  };
  return planPercentages[plan] || 2.20;
}

function generateEarningsTimeline(investments: Investment[]): any[] {
  const activeInvestments = investments.filter(inv => inv.is_locked);
  if (activeInvestments.length === 0) return [];

  const dailyEarnings = activeInvestments.reduce((sum, inv) => {
    return sum + ((inv.amount * getDailyPercentage(inv.investment_plan)) / 100);
  }, 0);

  return Array.from({ length: 30 }, (_, i) => ({
    name: `Day ${i + 1}`,
    earnings: dailyEarnings,
    cumulative: dailyEarnings * (i + 1)
  }));
}

// Skeleton Loader
const InvestmentDashboardSkeleton = () => (
  <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30 py-8">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="animate-pulse">
        {/* Header skeleton */}
        <div className="h-8 w-64 bg-gray-200 rounded-lg mb-2"></div>
        <div className="h-4 w-96 bg-gray-200 rounded mb-8"></div>
        
        {/* Stats skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl p-6 h-32">
              <div className="h-4 w-32 bg-gray-200 rounded mb-2"></div>
              <div className="h-8 w-24 bg-gray-200 rounded mb-3"></div>
              <div className="h-3 w-40 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
        
        {/* Charts skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-2xl p-6 h-80">
            <div className="h-6 w-48 bg-gray-200 rounded mb-4"></div>
            <div className="h-64 bg-gray-100 rounded"></div>
          </div>
          <div className="bg-white rounded-2xl p-6 h-80">
            <div className="h-6 w-48 bg-gray-200 rounded mb-4"></div>
            <div className="h-64 bg-gray-100 rounded"></div>
          </div>
        </div>
        
        {/* List skeleton */}
        <div className="bg-white rounded-2xl p-6">
          <div className="h-6 w-48 bg-gray-200 rounded mb-6"></div>
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-24 bg-gray-100 rounded mb-4"></div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

export default InvestmentDashboard;