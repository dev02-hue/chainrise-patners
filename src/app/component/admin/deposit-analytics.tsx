/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useState, useEffect } from 'react';
import { motion  } from 'framer-motion';
import { 
  FiTrendingUp, 
  FiDollarSign, 
  FiClock, 
  FiCheckCircle, 
  FiAlertCircle,
  FiDownload,
  FiRefreshCw,
  FiPieChart,
  FiBarChart2,
  FiActivity
} from 'react-icons/fi';
import {
 
  AreaChart,
  Area,
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
  Legend
} from 'recharts';
import { DepositAnalytics } from '@/types/businesses';
import { generateMockAnalytics, formatCurrency, formatPercentage, formatNumber } from '@/lib/deposit-analytics';
import { chartColors, areaGradient, barGradient } from '@/lib/chart-config';

const timeframeOptions = [
  { value: '24h', label: '24 Hours' },
  { value: '7d', label: '7 Days' },
  { value: '30d', label: '30 Days' },
  { value: '90d', label: '90 Days' },
  { value: '1y', label: '1 Year' },
  { value: 'all', label: 'All Time' }
];

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
  hover: { scale: 1.02, transition: { duration: 0.2 } }
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

export default function DepositAnalyticsDashboard() {
  const [timeframe, setTimeframe] = useState<'24h' | '7d' | '30d' | '90d' | '1y' | 'all'>('30d');
  const [analytics, setAnalytics] = useState<DepositAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchAnalytics = async () => {
    setRefreshing(true);
    try {
      // Simulate API call - replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      const mockData = generateMockAnalytics();
      setAnalytics(mockData);
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [timeframe]);

  const handleExport = (format: 'csv' | 'json') => {
    // Implement export functionality
    console.log(`Exporting as ${format}`);
  };

  const handleRefresh = () => {
    fetchAnalytics();
  };

  if (loading) {
    return <LoadingState />;
  }

  if (!analytics) {
    return <ErrorState onRetry={fetchAnalytics} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Deposit Analytics</h1>
            <p className="text-gray-600 mt-2">Comprehensive overview of deposit performance and trends</p>
          </div>
          <div className="flex items-center space-x-4 mt-4 sm:mt-0">
            <select
              value={timeframe}
              onChange={(e) => setTimeframe(e.target.value as any)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {timeframeOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
            >
              <FiRefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Overview Cards */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
      >
        <StatCard
          title="Total Deposits"
          value={formatNumber(analytics.overview.totalDeposits)}
          change={analytics.overview.growthRate}
          icon={<FiDollarSign className="w-6 h-6" />}
          color="blue"
        />
        <StatCard
          title="Total Amount"
          value={formatCurrency(analytics.overview.totalAmount)}
          change={8.7}
          icon={<FiTrendingUp className="w-6 h-6" />}
          color="green"
        />
        <StatCard
          title="Pending Deposits"
          value={formatNumber(analytics.overview.pendingDeposits)}
          change={-2.1}
          icon={<FiClock className="w-6 h-6" />}
          color="yellow"
        />
        <StatCard
          title="Completed Deposits"
          value={formatNumber(analytics.overview.completedDeposits)}
          change={15.3}
          icon={<FiCheckCircle className="w-6 h-6" />}
          color="purple"
        />
      </motion.div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Timeline Chart */}
        <ChartCard title="Deposit Timeline" icon={<FiActivity />}>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={analytics.timeline}>
              <defs>
                {areaGradient(chartColors.primary)}
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis 
                dataKey="date" 
                tick={{ fontSize: 12 }}
                tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip 
                formatter={(value: number, name: string) => [
                  name === 'amount' ? formatCurrency(value) : value,
                  name === 'amount' ? 'Amount' : name.charAt(0).toUpperCase() + name.slice(1)
                ]}
                labelFormatter={(label) => `Date: ${new Date(label).toLocaleDateString()}`}
              />
              <Area 
                type="monotone" 
                dataKey="amount" 
                stroke={chartColors.primary} 
                fill="url(#color3B82F6)" 
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Status Distribution */}
        <ChartCard title="Status Distribution" icon={<FiPieChart />}>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={Object.entries(analytics.statusDistribution).map(([name, value]) => ({
                  name: name.charAt(0).toUpperCase() + name.slice(1),
                  value
                }))}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={2}
                dataKey="value"
              >
                {Object.entries(analytics.statusDistribution).map(([name], index) => (
                  <Cell 
                    key={name} 
                    fill={[
                      chartColors.primary,
                      chartColors.secondary,
                      chartColors.accent,
                      chartColors.warning,
                      chartColors.error
                    ][index % 5]} 
                  />
                ))}
              </Pie>
              <Tooltip formatter={(value: number) => [value, 'Deposits']} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Wallet Performance */}
        <ChartCard title="Wallet Performance" icon={<FiBarChart2 />}>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={analytics.walletAnalytics}>
              <defs>
                {barGradient(chartColors.primary)}
                {barGradient(chartColors.secondary)}
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis dataKey="cryptoType" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip 
                formatter={(value: number, name: string) => [
                  name === 'totalAmount' ? formatCurrency(value) : 
                  name === 'successRate' ? formatPercentage(value) : value,
                  name === 'totalAmount' ? 'Total Amount' : 
                  name === 'successRate' ? 'Success Rate' : 'Total Deposits'
                ]}
              />
              <Legend />
              <Bar 
                dataKey="totalAmount" 
                fill="url(#bar3B82F6)" 
                radius={[4, 4, 0, 0]}
                name="Total Amount"
              />
              <Bar 
                dataKey="totalDeposits" 
                fill="url(#bar10B981)" 
                radius={[4, 4, 0, 0]}
                name="Total Deposits"
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Performance Metrics */}
        <ChartCard title="Performance Metrics" icon={<FiTrendingUp />}>
          <div className="space-y-4 p-4">
            {[
              { label: 'Approval Rate', value: analytics.performanceMetrics.approvalRate, color: 'green' },
              { label: 'Completion Rate', value: analytics.performanceMetrics.completionRate, color: 'blue' },
              { label: 'Avg Processing Time', value: analytics.performanceMetrics.averageProcessingTime, suffix: 'hours', color: 'purple' },
              { label: 'Active Users', value: analytics.performanceMetrics.activeUsers, color: 'orange' }
            ].map((metric, index) => (
              <motion.div
                key={metric.label}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200"
              >
                <span className="text-gray-700 font-medium">{metric.label}</span>
                <span className={`text-lg font-bold ${
                  metric.color === 'green' ? 'text-green-600' :
                  metric.color === 'blue' ? 'text-blue-600' :
                  metric.color === 'purple' ? 'text-purple-600' : 'text-orange-600'
                }`}>
                  {metric.suffix ? `${metric.value} ${metric.suffix}` : formatPercentage(metric.value)}
                </span>
              </motion.div>
            ))}
          </div>
        </ChartCard>
      </div>

      {/* Recent Activity */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-gray-900">Recent Activity</h3>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleExport('csv')}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <FiDownload className="w-4 h-4" />
            <span>Export CSV</span>
          </motion.button>
        </div>
        <div className="text-center text-gray-500 py-8">
          <FiAlertCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>Recent deposit activity will appear here</p>
        </div>
      </motion.div>
    </div>
  );
}

// Sub-components
const StatCard = ({ title, value, change, icon, color }: {
  title: string;
  value: string;
  change: number;
  icon: React.ReactNode;
  color: 'blue' | 'green' | 'yellow' | 'purple';
}) => {
  const colorClasses = {
    blue: 'from-blue-500 to-blue-600',
    green: 'from-green-500 to-green-600',
    yellow: 'from-yellow-500 to-yellow-600',
    purple: 'from-purple-500 to-purple-600'
  };

  return (
    <motion.div
      variants={cardVariants}
      whileHover="hover"
      className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-600 text-sm font-medium mb-2">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mb-1">{value}</p>
          <div className={`flex items-center space-x-1 text-sm ${
            change >= 0 ? 'text-green-600' : 'text-red-600'
          }`}>
            <FiTrendingUp className={`w-4 h-4 ${change < 0 ? 'hidden' : ''}`} />
            <FiTrendingUp className={`w-4 h-4 transform rotate-180 ${change >= 0 ? 'hidden' : ''}`} />
            <span>{change >= 0 ? '+' : ''}{change.toFixed(1)}%</span>
          </div>
        </div>
        <div className={`p-3 rounded-lg bg-gradient-to-br ${colorClasses[color]} text-white`}>
          {icon}
        </div>
      </div>
    </motion.div>
  );
};

const ChartCard = ({ title, icon, children }: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) => (
  <motion.div
    variants={cardVariants}
    className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
  >
    <div className="flex items-center space-x-3 mb-6">
      <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
    </div>
    {children}
  </motion.div>
);

const LoadingState = () => (
  <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="text-center"
    >
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"
      />
      <p className="text-gray-600">Loading analytics...</p>
    </motion.div>
  </div>
);

const ErrorState = ({ onRetry }: { onRetry: () => void }) => (
  <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-center"
    >
      <FiAlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
      <h3 className="text-xl font-semibold text-gray-900 mb-2">Failed to load analytics</h3>
      <p className="text-gray-600 mb-6">Please try again later</p>
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={onRetry}
        className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
      >
        Retry
      </motion.button>
    </motion.div>
  </div>
);