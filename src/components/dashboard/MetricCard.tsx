
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, DollarSign, Users, Activity, BarChart3 } from "lucide-react";

interface MetricCardProps {
  title: string;
  value: number | string;
  currency?: string;
  trend?: {
    value: number;
    percentage: number;
    direction: 'up' | 'down' | 'flat';
  } | null;
  icon?: 'dollar' | 'users' | 'activity' | 'chart';
  className?: string;
}

const MetricCard = ({ title, value, currency = 'USD', trend, icon = 'dollar', className = '' }: MetricCardProps) => {
  const getIcon = () => {
    switch (icon) {
      case 'users':
        return <Users className="h-4 w-4" />;
      case 'activity':
        return <Activity className="h-4 w-4" />;
      case 'chart':
        return <BarChart3 className="h-4 w-4" />;
      default:
        return <DollarSign className="h-4 w-4" />;
    }
  };

  const formatValue = (val: number | string) => {
    if (typeof val === 'string') return val;
    
    // For currency values, format with proper currency symbol and commas
    if (icon === 'dollar' || title.toLowerCase().includes('revenue') || title.toLowerCase().includes('mrr') || title.toLowerCase().includes('arr') || title.toLowerCase().includes('ltv')) {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }).format(val);
    }
    
    // For count values, format with commas but no decimals
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(val);
  };

  const getTrendColor = () => {
    if (!trend) return '';
    switch (trend.direction) {
      case 'up':
        return 'text-green-600';
      case 'down':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const getTrendIcon = () => {
    if (!trend) return null;
    switch (trend.direction) {
      case 'up':
        return <TrendingUp className="h-3 w-3" />;
      case 'down':
        return <TrendingDown className="h-3 w-3" />;
      default:
        return null;
    }
  };

  return (
    <Card className={`${className}`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-gray-600">
          {title}
        </CardTitle>
        <div className="text-gray-400">
          {getIcon()}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-gray-900">
          {formatValue(value)}
        </div>
        {trend && (
          <div className={`flex items-center space-x-1 text-xs ${getTrendColor()}`}>
            {getTrendIcon()}
            <span>
              {trend.percentage > 0 ? '+' : ''}{trend.percentage.toFixed(1)}%
            </span>
            <span className="text-gray-500">vs last period</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default MetricCard;
