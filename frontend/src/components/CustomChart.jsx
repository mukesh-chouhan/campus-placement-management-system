import React from 'react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid,
  Cell
} from 'recharts';

const CustomChart = ({ data = {}, barColor = '#6366f1' }) => {
  // Convert map data to array format for Recharts
  const chartData = Object.entries(data).map(([key, val]) => ({
    name: key,
    value: val
  }));

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div style={{
          backgroundColor: '#fff',
          padding: '12px 16px',
          border: '1px solid var(--border)',
          borderRadius: '8px',
          boxShadow: 'var(--shadow-md)',
          fontFamily: 'var(--font-heading)',
          fontSize: '0.85rem'
        }}>
          <p style={{ fontWeight: 700, margin: 0, color: 'var(--text-main)' }}>{payload[0].payload.name}</p>
          <p style={{ margin: '4px 0 0 0', fontWeight: 600, color: 'var(--primary)' }}>
            Count: {payload[0].value}
          </p>
        </div>
      );
    }
    return null;
  };

  if (chartData.length === 0) {
    return (
      <div style={{ color: 'var(--text-muted)', fontSize: '0.95rem', textAlign: 'center', padding: '40px 0', fontFamily: 'var(--font-body)' }}>
        No metrics logged.
      </div>
    );
  }

  return (
    <div style={{ width: '100%', height: 260, marginTop: 16 }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
          <XAxis 
            dataKey="name" 
            stroke="#94a3b8" 
            fontSize={11} 
            fontWeight={600}
            tickLine={false}
            axisLine={false}
            dy={10}
          />
          <YAxis 
            stroke="#94a3b8" 
            fontSize={11} 
            fontWeight={600}
            tickLine={false}
            axisLine={false}
            dx={-10}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f8fafc' }} />
          <Bar 
            dataKey="value" 
            radius={[6, 6, 0, 0]}
            maxBarSize={45}
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={barColor} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default CustomChart;
