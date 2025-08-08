
/**
 * Utility functions for API rate limiting and retry logic
 */

type RetryOptions = {
  maxRetries?: number;
  initialDelay?: number;
  maxDelay?: number;
  factor?: number;
  onRetry?: (attempt: number, error: Error, delay: number) => void;
};

/**
 * Execute a function with exponential backoff retry logic
 * @param fn The function to execute (should return a promise)
 * @param options Retry configuration options
 * @returns Promise resolving to the function result
 */
export const withRetry = async <T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> => {
  const {
    maxRetries = 5,
    initialDelay = 500, // Start with 500ms delay
    maxDelay = 30000, // Cap at 30 seconds
    factor = 2,
    onRetry = () => {} // Default no-op callback
  } = options;

  let attempt = 0;
  let lastError: Error;

  while (attempt <= maxRetries) {
    try {
      // If it's not the first attempt, add a delay with exponential backoff
      if (attempt > 0) {
        const delay = Math.min(initialDelay * Math.pow(factor, attempt - 1), maxDelay);
        // Add some jitter to avoid thundering herd problem
        const jitteredDelay = delay * (0.8 + Math.random() * 0.4); 
        
        console.info(`Retry attempt ${attempt}/${maxRetries}, waiting ${Math.round(jitteredDelay)}ms...`);
        await new Promise(resolve => setTimeout(resolve, jitteredDelay));
      }
      
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      
      // Some errors should not be retried
      if (isNonRetryableError(lastError)) {
        console.error(`Non-retryable error encountered:`, lastError);
        throw lastError;
      }
      
      attempt++;
      if (attempt <= maxRetries) {
        const nextDelay = Math.min(initialDelay * Math.pow(factor, attempt - 1), maxDelay);
        onRetry(attempt, lastError, nextDelay);
      }
    }
  }

  console.error(`Max retry attempts (${maxRetries}) reached`);
  throw lastError!;
};

/**
 * Determine if an error should not be retried
 */
const isNonRetryableError = (error: Error): boolean => {
  // Auth errors, bad requests, or other client errors should not be retried
  if (error.message?.toLowerCase().includes('api key')) {
    return true;
  }
  
  if (error.message?.toLowerCase().includes('authentication')) {
    return true; 
  }
  
  // Stripe specific error types that should not be retried
  if (error.message?.toLowerCase().includes('invalid_request_error')) {
    return true;
  }
  
  return false;
};

/**
 * Rate limiter using the token bucket algorithm
 */
export class RateLimiter {
  private tokens: number;
  private lastRefill: number;
  private maxTokens: number;
  private refillRate: number; // tokens per ms
  
  /**
   * Create a rate limiter
   * @param maxRequestsPerSecond Maximum requests allowed per second
   * @param burstSize Maximum burst size (defaults to same as rate)
   */
  constructor(maxRequestsPerSecond: number, burstSize?: number) {
    this.maxTokens = burstSize || maxRequestsPerSecond;
    this.tokens = this.maxTokens;
    this.lastRefill = Date.now();
    this.refillRate = maxRequestsPerSecond / 1000; // Convert to tokens per ms
  }
  
  /**
   * Check if a request can be made and consume a token if available
   * @returns true if request is allowed, false if rate limited
   */
  public tryAcquire(): boolean {
    this.refillTokens();
    
    if (this.tokens >= 1) {
      this.tokens -= 1;
      return true;
    }
    
    return false;
  }
  
  /**
   * Wait until a token is available and then consume it
   * @returns Promise that resolves when a token is available
   */
  public async acquire(): Promise<void> {
    this.refillTokens();
    
    if (this.tokens >= 1) {
      this.tokens -= 1;
      return;
    }
    
    // Calculate wait time until next token is available
    const timeUntilNextToken = Math.ceil(1 / this.refillRate);
    await new Promise(resolve => setTimeout(resolve, timeUntilNextToken));
    return this.acquire();
  }
  
  /**
   * Reset the limiter to full capacity
   */
  public reset(): void {
    this.tokens = this.maxTokens;
    this.lastRefill = Date.now();
  }
  
  /**
   * Refill tokens based on elapsed time
   */
  private refillTokens(): void {
    const now = Date.now();
    const elapsedTime = now - this.lastRefill;
    
    if (elapsedTime > 0) {
      // Calculate how many tokens to add based on elapsed time
      const tokensToAdd = elapsedTime * this.refillRate;
      
      this.tokens = Math.min(this.tokens + tokensToAdd, this.maxTokens);
      this.lastRefill = now;
    }
  }
}

// Create and export shared instances of rate limiters for common APIs
export const stripeLimiter = new RateLimiter(10, 15); // 10 req/sec with burst to 15
