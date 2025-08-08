
/**
 * Define state type for the Stripe context
 */
export interface StripeState {
  isLoading: boolean;
  isConnected: boolean;
  isValid: boolean;
  lastSynced: string | null;
  error: string | null;
  accountId: string | null;
  requireReconnect: boolean;
}

/**
 * Define context type with state and functions
 */
export interface StripeContextType {
  stripeState: StripeState;
  connectStripe: () => Promise<void>;
  disconnectStripe: () => Promise<void>;
  syncStripeData: () => Promise<any>;
}

/**
 * Initial state for the Stripe context
 */
export const initialStripeState: StripeState = {
  isLoading: false,
  isConnected: false,
  isValid: true,
  lastSynced: null,
  error: null,
  accountId: null,
  requireReconnect: false
};
