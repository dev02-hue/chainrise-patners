 
export const chartColors = {
  primary: '#3B82F6',
  secondary: '#10B981',
  accent: '#8B5CF6',
  warning: '#F59E0B',
  error: '#EF4444',
  background: '#1F2937'
};

export const areaGradient = (color: string) => (
  <linearGradient id={`color${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
    <stop offset="5%" stopColor={color} stopOpacity={0.3}/>
    <stop offset="95%" stopColor={color} stopOpacity={0}/>
  </linearGradient>
);

export const barGradient = (color: string) => (
  <linearGradient id={`bar${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
    <stop offset="5%" stopColor={color} stopOpacity={0.8}/>
    <stop offset="95%" stopColor={color} stopOpacity={0.2}/>
  </linearGradient>
);