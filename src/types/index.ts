// User and Authentication types
export interface User {
  id: string;
  email: string;
  stripe_customer_id?: string;
  created_at: string;
  trial_ends_at?: string;
  subscription_tier?: 'free' | 'tier1' | 'tier2';
  subscribed?: boolean;
}

// Stripe types for our data
export interface Customer {
  id: string;
  user_id: string;
  stripe_id: string;
  email: string;
  name?: string;
  country?: string;
  created_at: string;
}

export interface Subscription {
  id: string;
  user_id: string;
  stripe_id: string;
  customer_id: string;
  status: 'active' | 'past_due' | 'canceled' | 'incomplete' | 'trialing';
  plan_id: string;
  plan_name: string;
  billing_interval: 'month' | 'year' | 'week' | 'day';
  amount: number;
  currency: string;
  start_date: string;
  cancel_date?: string;
  created_at: string;
}

// Analytics metrics types
export interface AnalyticsMetrics {
  mrr: number;
  arr: number;
  ltv: number;
  active_subscriptions: number;
  currency: string;
}

export interface SegmentedMetrics {
  [segment: string]: AnalyticsMetrics;
}

export interface MetricTrend {
  value: number;
  percentage: number;
  direction: 'up' | 'down' | 'flat';
}

export interface MetricWithTrend {
  current: number;
  trend: MetricTrend;
  currency?: string;
}

export interface DashboardData {
  mrr: MetricWithTrend;
  arr: MetricWithTrend;
  ltv: MetricWithTrend;
  active_subscriptions: MetricWithTrend;
  by_country: SegmentedMetrics;
  by_plan: SegmentedMetrics;
  currency: string;
}

// Context types for state management
export interface AuthState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
}

export interface StripeState {
  isConnected: boolean;
  isLoading: boolean;
  isValid?: boolean;
  error: string | null;
  lastSynced: string | null;
  accountId?: string | null;
  requireReconnect?: boolean;
}
