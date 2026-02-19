import React from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ElementType;
  trend?: string;
  trendUp?: boolean;
  onClick?: () => void;
  className?: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, subtitle, icon: Icon, trend, trendUp, onClick, className }) => (
  <div
    onClick={onClick}
    className={`glass-card rounded-xl p-6 transition-all duration-300 ${onClick ? 'cursor-pointer hover:shadow-lg hover:-translate-y-1 active:scale-95' : 'hover:shadow-card-hover'} ${className || ''}`}
  >
    <div className="flex items-start justify-between">
      <div>
        <p className="text-sm font-medium text-muted-foreground">{title}</p>
        <p className="text-3xl font-bold text-foreground mt-1">{value}</p>
        {subtitle && <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>}
        {trend && (
          <p className={`text-xs mt-2 font-medium ${trendUp ? 'text-success' : 'text-destructive'}`}>
            {trend}
          </p>
        )}
      </div>
      <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center shadow-lg shadow-sky-900/20">
        <Icon className="w-6 h-6 text-primary-foreground" />
      </div>
    </div>
  </div>
);

export default StatCard;
