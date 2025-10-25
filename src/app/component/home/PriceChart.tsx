/* eslint-disable @typescript-eslint/no-explicit-any */
// components/EnhancedPriceChart.tsx
"use client";

import React from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Area, CartesianGrid } from 'recharts';

interface EnhancedPriceChartProps {
  data: number[];
  color: string;
  height?: number;
  showTooltip?: boolean;
  showGrid?: boolean;
  simplified?: boolean;
}

const EnhancedPriceChart: React.FC<EnhancedPriceChartProps> = ({ 
  data, 
  color, 
  height = 40,
  showTooltip = false,
  showGrid = false,
  simplified = true
}) => {
  const chartData = data.map((price, index) => ({
    index,
    price,
    name: `Point ${index}`
  }));

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900/95 backdrop-blur-sm border border-slate-700 rounded-lg p-2 shadow-2xl">
          <p className="text-white text-xs font-medium">
            ${payload[0].value.toFixed(6)}
          </p>
        </div>
      );
    }
    return null;
  };

  if (simplified) {
    return (
      <ResponsiveContainer width="100%" height={height}>
        <LineChart data={chartData} margin={{ top: 2, right: 0, left: 0, bottom: 2 }}>
          <defs>
            <linearGradient id={`gradient-${color}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.3}/>
              <stop offset="100%" stopColor={color} stopOpacity={0}/>
            </linearGradient>
          </defs>
          
          <Line
            type="monotone"
            dataKey="price"
            stroke={color}
            strokeWidth={1.5}
            dot={false}
            isAnimationActive={false}
          />
          
          <Area
            type="monotone"
            dataKey="price"
            stroke="none"
            fill={`url(#gradient-${color})`}
          />
        </LineChart>
      </ResponsiveContainer>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart
        data={chartData}
        margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
      >
        {showGrid && (
          <CartesianGrid 
            strokeDasharray="3 3" 
            stroke="#374151" 
            opacity={0.3} 
            horizontal={false}
          />
        )}
        
        <defs>
          <linearGradient id={`detailedGradient-${color}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={color} stopOpacity={0.4}/>
            <stop offset="95%" stopColor={color} stopOpacity={0}/>
          </linearGradient>
        </defs>
        
        <Line
          type="monotone"
          dataKey="price"
          stroke={color}
          strokeWidth={2}
          dot={false}
          activeDot={{ 
            r: 3, 
            fill: color, 
            stroke: '#fff', 
            strokeWidth: 1 
          }}
        />
        
        <Area
          type="monotone"
          dataKey="price"
          stroke="none"
          fill={`url(#detailedGradient-${color})`}
        />
        
        {showTooltip && (
          <Tooltip 
            content={<CustomTooltip />}
            cursor={{ 
              stroke: '#6B7280', 
              strokeWidth: 1,
              strokeDasharray: '3 3'
            }}
          />
        )}
        
        {!simplified && (
          <>
            <XAxis 
              dataKey="index" 
              hide 
              axisLine={false}
              tickLine={false}
            />
            <YAxis 
              hide 
              domain={['dataMin - dataMin * 0.01', 'dataMax + dataMax * 0.01']}
              axisLine={false}
              tickLine={false}
            />
          </>
        )}
      </LineChart>
    </ResponsiveContainer>
  );
};

export default EnhancedPriceChart;