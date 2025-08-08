
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import Stripe from "https://esm.sh/stripe@18.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Helper logging function for debugging
const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[STRIPE-SYNC] ${step}${detailsStr}`);
};

// Enhanced country detection with better error handling and more sources
const getCustomerCountryFromPaymentMethods = async (customerId: string, stripe: any) => {
  try {
    logStep("Fetching payment methods for customer", { customerId });
    
    const paymentMethods = await stripe.paymentMethods.list({
      customer: customerId,
      limit: 20, // Increased limit
      type: 'card' // Focus on card payment methods which are more likely to have billing details
    });
    
    logStep("Payment methods fetched", {
      customerId,
      paymentMethodCount: paymentMethods.data.length
    });
    
    // Check each payment method for billing details
    for (const pm of paymentMethods.data) {
      logStep("Checking payment method", {
        paymentMethodId: pm.id,
        type: pm.type,
        hasBillingDetails: !!pm.billing_details,
        hasAddress: !!pm.billing_details?.address,
        country: pm.billing_details?.address?.country
      });
      
      if (pm.billing_details?.address?.country) {
        logStep("Found country from payment method", {
          paymentMethodId: pm.id,
          country: pm.billing_details.address.country
        });
        return pm.billing_details.address.country;
      }
    }
    
    // Also check for setup intents and payment intents for this customer
    try {
      const setupIntents = await stripe.setupIntents.list({
        customer: customerId,
        limit: 10
      });
      
      for (const si of setupIntents.data) {
        if (si.payment_method_options?.card?.mandate_options?.reference) {
          const paymentMethod = await stripe.paymentMethods.retrieve(si.payment_method);
          if (paymentMethod.billing_details?.address?.country) {
            logStep("Found country from setup intent payment method", {
              country: paymentMethod.billing_details.address.country
            });
            return paymentMethod.billing_details.address.country;
          }
        }
      }
    } catch (error) {
      logStep("Error checking setup intents", { error: error.message });
    }
    
    logStep("No country found in payment methods", { customerId });
    return null;
  } catch (error) {
    logStep("Error fetching payment methods", { customerId, error: error.message });
    return null;
  }
};

// Enhanced country detection with more comprehensive fallbacks
const getCustomerCountry = async (customer: any, stripe: any) => {
  let country = null;
  
  logStep("Starting enhanced country detection", {
    customerId: customer?.id,
    customerEmail: customer?.email,
    customerName: customer?.name
  });
  
  // 1. HIGHEST PRIORITY: Check customer billing address first
  if (customer?.address?.country) {
    country = customer.address.country;
    logStep("✅ Found country from customer billing address", { country });
  }
  
  // 2. Check shipping address as secondary customer address
  if (!country && customer?.shipping?.address?.country) {
    country = customer.shipping.address.country;
    logStep("✅ Found country from customer shipping address", { country });
  }
  
  // 3. Check payment method billing details (previously highest priority)
  if (!country && customer?.id) {
    country = await getCustomerCountryFromPaymentMethods(customer.id, stripe);
    if (country) {
      logStep("✅ Found country from payment methods", { country });
    }
  }
  
  // 4. Check customer's default payment method
  if (!country && customer?.invoice_settings?.default_payment_method) {
    try {
      const defaultPM = await stripe.paymentMethods.retrieve(customer.invoice_settings.default_payment_method);
      if (defaultPM.billing_details?.address?.country) {
        country = defaultPM.billing_details.address.country;
        logStep("✅ Found country from default payment method", { country });
      }
    } catch (error) {
      logStep("Error retrieving default payment method", { error: error.message });
    }
  }
  
  // 5. Check tax information
  if (!country && customer?.tax?.location?.country) {
    country = customer.tax.location.country;
    logStep("✅ Found country from tax location", { country });
  }
  
  // 6. Check metadata
  if (!country && customer?.metadata?.country) {
    country = customer.metadata.country;
    logStep("✅ Found country from metadata", { country });
  }
  
  // 7. Try to get country from recent invoices
  if (!country && customer?.id) {
    try {
      const invoices = await stripe.invoices.list({
        customer: customer.id,
        limit: 5
      });
      
      for (const invoice of invoices.data) {
        if (invoice.customer_address?.country) {
          country = invoice.customer_address.country;
          logStep("✅ Found country from invoice address", { country });
          break;
        }
      }
    } catch (error) {
      logStep("Error checking invoices", { error: error.message });
    }
  }
  
  // 8. Try to get country from recent charges
  if (!country && customer?.id) {
    try {
      const charges = await stripe.charges.list({
        customer: customer.id,
        limit: 5
      });
      
      for (const charge of charges.data) {
        if (charge.billing_details?.address?.country) {
          country = charge.billing_details.address.country;
          logStep("✅ Found country from charge billing details", { country });
          break;
        }
      }
    } catch (error) {
      logStep("Error checking charges", { error: error.message });
    }
  }
  
  if (country) {
    // Comprehensive country code mapping
    const countryMap: Record<string, string> = {
      'US': 'United States',
      'USA': 'United States',
      'CA': 'Canada',
      'CAN': 'Canada',
      'GB': 'United Kingdom',
      'UK': 'United Kingdom',
      'GBR': 'United Kingdom',
      'AU': 'Australia',
      'AUS': 'Australia',
      'DE': 'Germany',
      'DEU': 'Germany',
      'FR': 'France',
      'FRA': 'France',
      'JP': 'Japan',
      'JPN': 'Japan',
      'IN': 'India',
      'IND': 'India',
      'BR': 'Brazil',
      'BRA': 'Brazil',
      'MX': 'Mexico',
      'MEX': 'Mexico',
      'IT': 'Italy',
      'ITA': 'Italy',
      'ES': 'Spain',
      'ESP': 'Spain',
      'NL': 'Netherlands',
      'NLD': 'Netherlands',
      'SE': 'Sweden',
      'SWE': 'Sweden',
      'NO': 'Norway',
      'NOR': 'Norway',
      'DK': 'Denmark',
      'DNK': 'Denmark',
      'FI': 'Finland',
      'FIN': 'Finland',
      'CH': 'Switzerland',
      'CHE': 'Switzerland',
      'AT': 'Austria',
      'AUT': 'Austria',
      'BE': 'Belgium',
      'BEL': 'Belgium',
      'IE': 'Ireland',
      'IRL': 'Ireland',
      'PT': 'Portugal',
      'PRT': 'Portugal',
      'GR': 'Greece',
      'GRC': 'Greece',
      'PL': 'Poland',
      'POL': 'Poland',
      'CZ': 'Czech Republic',
      'CZE': 'Czech Republic',
      'HU': 'Hungary',
      'HUN': 'Hungary',
      'RO': 'Romania',
      'ROU': 'Romania',
      'BG': 'Bulgaria',
      'BGR': 'Bulgaria',
      'HR': 'Croatia',
      'HRV': 'Croatia',
      'SI': 'Slovenia',
      'SVN': 'Slovenia',
      'SK': 'Slovakia',
      'SVK': 'Slovakia',
      'LT': 'Lithuania',
      'LTU': 'Lithuania',
      'LV': 'Latvia',
      'LVA': 'Latvia',
      'EE': 'Estonia',
      'EST': 'Estonia',
      'MT': 'Malta',
      'MLT': 'Malta',
      'CY': 'Cyprus',
      'CYP': 'Cyprus',
      'LU': 'Luxembourg',
      'LUX': 'Luxembourg',
      'IS': 'Iceland',
      'ISL': 'Iceland',
      'LI': 'Liechtenstein',
      'LIE': 'Liechtenstein',
      'MC': 'Monaco',
      'MCO': 'Monaco',
      'SM': 'San Marino',
      'SMR': 'San Marino',
      'VA': 'Vatican City',
      'VAT': 'Vatican City',
      'AD': 'Andorra',
      'AND': 'Andorra'
    };
    
    const upperCountry = country.toUpperCase();
    const mappedCountry = countryMap[upperCountry] || country;
    logStep("Country mapping applied", { original: country, mapped: mappedCountry });
    return mappedCountry;
  }
  
  logStep("❌ No country found after all attempts", { customerId: customer?.id });
  return 'Unknown';
};

// Simplified MRR calculation function
const calculateActualMrr = (actualAmount: number, interval: string, intervalCount: number) => {
  switch (interval) {
    case 'month': return actualAmount / intervalCount;
    case 'year': return (actualAmount / 12) / intervalCount;
    case 'week': return (actualAmount * 52 / 12) / intervalCount;
    case 'day': return (actualAmount * 365 / 12) / intervalCount;
    default: return actualAmount / intervalCount;
  }
};

// Calculate actual subscription amount after discounts and handle proration
const calculateActualAmount = (subscription: any, price: any) => {
  const planAmount = (price.unit_amount || 0) / 100; // Convert from cents
  const quantity = subscription.items.data[0].quantity || 1;
  
  // Calculate total discount amount
  let totalDiscount = 0;
  if (subscription.discount && subscription.discount.coupon) {
    const coupon = subscription.discount.coupon;
    if (coupon.amount_off) {
      // Fixed amount discount
      totalDiscount = coupon.amount_off / 100; // Convert from cents
    } else if (coupon.percent_off) {
      // Percentage discount
      totalDiscount = (planAmount * coupon.percent_off) / 100;
    }
  }
  
  // Handle proration for mid-cycle changes
  let prorationAmount = planAmount;
  
  // Check if there are any pending invoice items for proration
  if (subscription.pending_invoice_item_interval) {
    logStep("Detected pending invoice item interval", {
      subscriptionId: subscription.id,
      pendingInterval: subscription.pending_invoice_item_interval
    });
  }
  
  const actualAmount = (prorationAmount - totalDiscount) * quantity;
  
  logStep("Calculated actual amount with proration handling", {
    subscriptionId: subscription.id,
    planAmount,
    quantity,
    totalDiscount,
    prorationAmount,
    actualAmount
  });
  
  return Math.max(0, actualAmount); // Ensure non-negative
};

// Calculate proper CLV (Customer Lifetime Value) instead of just ARR
const calculateProperCLV = (subscription: any, price: any, customer: any) => {
  const monthlyAmount = calculateActualMrr(
    calculateActualAmount(subscription, price),
    price.recurring?.interval || 'month',
    price.recurring?.interval_count || 1
  );
  
  // Simple CLV calculation: MRR * average customer lifespan (in months)
  // For SaaS, typical customer lifespan ranges from 12-36 months
  // We'll use a conservative 24 months as default
  const avgLifespanMonths = 24;
  
  // More sophisticated CLV could factor in:
  // - Customer creation date to calculate actual tenure
  // - Churn rate analysis
  // - Gross margin
  // - Customer acquisition cost
  
  const clv = monthlyAmount * avgLifespanMonths;
  
  logStep("Calculated proper CLV", {
    subscriptionId: subscription.id,
    monthlyAmount,
    avgLifespanMonths,
    clv
  });
  
  return clv;
};

// Generate friendly plan name
const generatePlanName = (price: any, product: any) => {
  // Use nickname if available
  if (price.nickname) {
    return price.nickname;
  }
  
  // Use product name if available
  if (product?.name) {
    const amount = (price.unit_amount || 0) / 100;
    const currency = price.currency?.toUpperCase() || 'USD';
    const interval = price.recurring?.interval || 'month';
    const intervalCount = price.recurring?.interval_count || 1;
    
    if (intervalCount === 1) {
      return `${product.name} - ${currency} ${amount}/${interval}`;
    } else {
      return `${product.name} - ${currency} ${amount} every ${intervalCount} ${interval}s`;
    }
  }
  
  // Fallback to amount and interval
  const amount = (price.unit_amount || 0) / 100;
  const currency = price.currency?.toUpperCase() || 'USD';
  const interval = price.recurring?.interval || 'month';
  const intervalCount = price.recurring?.interval_count || 1;
  
  if (amount > 0) {
    if (intervalCount === 1) {
      return `${currency} ${amount}/${interval}`;
    } else {
      return `${currency} ${amount} every ${intervalCount} ${interval}s`;
    }
  }
  
  return `Plan ${price.id.substring(price.id.length - 8)}`;
};

// IMPROVED: Check if subscription was active in May 2025 with more lenient logic
const wasActiveInMay2025 = (subscription: any) => {
  const mayStart = new Date('2025-05-01T00:00:00Z').getTime() / 1000;
  const mayEnd = new Date('2025-05-31T23:59:59Z').getTime() / 1000;
  
  const subStart = subscription.start_date || subscription.created;
  const subEnd = subscription.ended_at || subscription.canceled_at;
  
  // More lenient: subscription is active in May if it started before June 1st AND
  // either hasn't ended OR ended after April 30th
  const startedBeforeJune = subStart <= mayEnd;
  const endedAfterApril = !subEnd || subEnd >= mayStart;
  
  const wasActive = startedBeforeJune && endedAfterApril;
  
  logStep("May 2025 activity check", {
    subscriptionId: subscription.id,
    subStart: new Date(subStart * 1000).toISOString(),
    subEnd: subEnd ? new Date(subEnd * 1000).toISOString() : 'ongoing',
    mayStart: new Date(mayStart * 1000).toISOString(),
    mayEnd: new Date(mayEnd * 1000).toISOString(),
    wasActive
  });
  
  return wasActive;
};

// Enhanced decryption function
const decryptApiKey = async (encryptedData: string, secret: string) => {
  try {
    logStep("Starting decryption process", { 
      inputType: typeof encryptedData,
      inputLength: encryptedData.length,
      hasXPrefix: encryptedData.startsWith("\\x")
    });
    
    let cleanData = encryptedData;
    if (cleanData.startsWith("\\x")) {
      cleanData = cleanData.substring(2);
    }
    
    if (!/^[0-9a-fA-F]+$/.test(cleanData)) {
      throw new Error("Invalid hex format in encrypted data");
    }
    
    const hexBytes = new Uint8Array(cleanData.length / 2);
    for (let i = 0; i < cleanData.length; i += 2) {
      hexBytes[i / 2] = parseInt(cleanData.substr(i, 2), 16);
    }
    
    if (hexBytes.length < 13) {
      throw new Error("Encrypted data too short");
    }
    
    const iv = hexBytes.slice(0, 12);
    const ciphertext = hexBytes.slice(12);
    
    const encoder = new TextEncoder();
    const secretData = encoder.encode(secret);
    
    const key = await crypto.subtle.importKey(
      "raw",
      secretData,
      { name: "AES-GCM", length: 256 },
      false,
      ["decrypt"]
    );
    
    const decrypted = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv },
      key,
      ciphertext
    );
    
    const decoder = new TextDecoder();
    const result = decoder.decode(decrypted);
    logStep("Decryption successful");
    return result;
  } catch (error) {
    logStep("Decryption error", { error: error.message });
    throw new Error(`Failed to decrypt Stripe API key: ${error.message}`);
  }
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");
    
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
    
    if (!supabaseUrl || !supabaseServiceKey) {
      logStep("Missing Supabase environment variables");
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: "Supabase environment variables are not configured" 
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { persistSession: false }
    });
    
    let requestBody;
    try {
      requestBody = await req.json();
    } catch (error) {
      logStep("Failed to parse request body", { error: error.message });
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: "Invalid request body" 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }

    const { user_id, filter_may_2025 } = requestBody;
    
    if (!user_id) {
      logStep("Missing user_id parameter");
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: "Missing user_id parameter" 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }

    logStep("Fetching user's Stripe connection", { user_id, filter_may_2025 });
    
    const { data: connectionData, error: connectionError } = await supabase
      .from("stripe_connections")
      .select("*")
      .eq("user_id", user_id)
      .maybeSingle();

    if (connectionError) {
      logStep("Database error fetching connection", { error: connectionError.message });
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: `Database error: ${connectionError.message}` 
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }

    if (!connectionData) {
      logStep("No Stripe connection found for user");
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: "No Stripe connection found for this user",
          require_reconnect: true
        }),
        { 
          status: 404, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }

    if (connectionData.is_valid === false) {
      logStep("Connection marked as invalid");
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: connectionData.error_message || "Stripe connection is invalid. Please re-enter your Stripe key.",
          require_reconnect: true
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }

    // Decrypt the API key
    let apiKey;
    try {
      if (!connectionData.encrypted_api_key) {
        logStep("No encrypted API key found");
        return new Response(
          JSON.stringify({ 
            success: false, 
            message: "No API key found in connection",
            require_reconnect: true
          }),
          { 
            status: 400, 
            headers: { ...corsHeaders, "Content-Type": "application/json" } 
          }
        );
      }

      logStep("Attempting to decrypt API key");
      
      const encryptionSecret = Deno.env.get("ENCRYPTION_SECRET") || supabaseServiceKey.substring(0, 32);
      
      let encryptedData = connectionData.encrypted_api_key;
      if (typeof encryptedData === 'object' && encryptedData !== null) {
        const uint8Array = new Uint8Array(encryptedData);
        encryptedData = Array.from(uint8Array)
          .map(byte => byte.toString(16).padStart(2, '0'))
          .join('');
        encryptedData = '\\x' + encryptedData;
      }
      
      apiKey = await decryptApiKey(encryptedData, encryptionSecret);
      logStep("API key decrypted successfully");
    } catch (error) {
      logStep("Error decrypting API key", { error: error.message });
      
      await supabase
        .from("stripe_connections")
        .update({
          is_valid: false,
          error_message: "Your Stripe API key could not be decrypted. Please re-enter your Stripe key."
        })
        .eq("id", connectionData.id);
      
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: "Your Stripe API key could not be decrypted. Please re-enter your Stripe key.",
          require_reconnect: true
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }

    logStep("Initializing Stripe client");
    const stripe = new Stripe(apiKey, { apiVersion: "2024-06-20" });
    
    try {
      logStep("Fetching Stripe data with enhanced subscription status and proration handling");
      
      // Fetch all data
      const customers = await stripe.customers.list({ limit: 100 });
      const subscriptions = await stripe.subscriptions.list({ limit: 100 });
      const products = await stripe.products.list({ limit: 100 });
      const prices = await stripe.prices.list({ limit: 100 });
      
      logStep("Stripe data fetched successfully", {
        customersCount: customers.data.length,
        subscriptionsCount: subscriptions.data.length,
        productsCount: products.data.length,
        pricesCount: prices.data.length
      });

      // Create lookup maps
      const productMap = new Map();
      products.data.forEach(product => {
        productMap.set(product.id, product);
      });
      
      const priceMap = new Map();
      prices.data.forEach(price => {
        priceMap.set(price.id, price);
      });

      // Filter subscriptions to match Stripe's MRR/ARR calculation exactly
      let subscriptionsToProcess = subscriptions.data;
      
      // Apply May 2025 filter if requested
      if (filter_may_2025) {
        logStep("Applying May 2025 filter");
        subscriptionsToProcess = subscriptionsToProcess.filter(sub => wasActiveInMay2025(sub));
        logStep("May 2025 filtering completed", { 
          originalCount: subscriptions.data.length,
          filteredCount: subscriptionsToProcess.length
        });
      }
      
      // FIXED subscription filtering to properly include trialing and past_due
      const validSubscriptions = subscriptionsToProcess.filter(sub => {
        // Include active, trialing, and past_due subscriptions
        const validStatus = ['active', 'trialing', 'past_due'].includes(sub.status);
        
        // Check if subscription has valid price and amount
        const hasValidPrice = sub.items?.data?.[0]?.price;
        
        let hasNonZeroAmount = false;
        if (hasValidPrice) {
          const price = sub.items.data[0].price;
          const actualAmount = calculateActualAmount(sub, price);
          hasNonZeroAmount = actualAmount > 0;
        }
        
        const isValid = validStatus && hasValidPrice && hasNonZeroAmount;
        
        logStep("Subscription filtering with proper status inclusion", {
          subscriptionId: sub.id,
          status: sub.status,
          validStatus,
          hasValidPrice,
          hasNonZeroAmount,
          isValid,
          statusesIncluded: ['active', 'trialing', 'past_due']
        });
        
        return isValid;
      });
      
      logStep("Subscription filtering completed", { 
        totalSubscriptions: subscriptions.data.length,
        mayFilteredSubscriptions: filter_may_2025 ? subscriptionsToProcess.length : 'not applied',
        validSubscriptions: validSubscriptions.length,
        filteredOut: subscriptions.data.length - validSubscriptions.length
      });

      let totalMrr = 0;
      let totalArr = 0;
      let totalClv = 0; // Changed from totalLtv to totalClv for clarity
      const activeSubscriptionsCount = validSubscriptions.length;
      
      const mrrByCountry: Record<string, number> = {};
      const mrrByPlan: Record<string, number> = {};
      const arrByCountry: Record<string, number> = {};
      const arrByPlan: Record<string, number> = {};
      const clvByCountry: Record<string, number> = {};
      const clvByPlan: Record<string, number> = {};
      const activeSubsByCountry: Record<string, number> = {};
      const activeSubsByPlan: Record<string, number> = {};

      // Country summary for debugging
      const countrySummary: Record<string, number> = {};

      for (const subscription of validSubscriptions) {
        const price = subscription.items.data[0].price;
        
        // Calculate actual amount after discounts and proration
        const actualAmount = calculateActualAmount(subscription, price);
        
        // Calculate MRR using the simplified function
        const actualMonthlyAmount = calculateActualMrr(
          actualAmount, 
          price.recurring?.interval || 'month', 
          price.recurring?.interval_count || 1
        );
        
        const annualAmount = actualMonthlyAmount * 12; // ARR = MRR * 12
        
        // Calculate proper CLV instead of simple LTV
        const customer = customers.data.find(c => c.id === subscription.customer);
        const clv = calculateProperCLV(subscription, price, customer);
        
        totalMrr += actualMonthlyAmount;
        totalArr += annualAmount;
        totalClv += clv;
        
        // Get customer for country detection with ENHANCED payment method lookup
        const customerId = subscription.customer;
        const country = await getCustomerCountry(customer, stripe);
        
        // Track country distribution
        countrySummary[country] = (countrySummary[country] || 0) + 1;
        
        // Generate plan name
        const product = productMap.get(price.product);
        const planName = generatePlanName(price, product);
        
        logStep("Processing valid subscription with enhanced calculations", { 
          subscriptionId: subscription.id, 
          customerId: customerId,
          customerEmail: customer?.email,
          customerName: customer?.name,
          detectedCountry: country,
          priceId: price.id, 
          planName,
          planAmount: (price.unit_amount || 0) / 100,
          actualAmount,
          discount: subscription.discount,
          quantity: subscription.items.data[0].quantity,
          interval: price.recurring?.interval,
          intervalCount: price.recurring?.interval_count,
          actualMonthlyAmount: Math.round(actualMonthlyAmount * 100) / 100,
          calculatedARR: Math.round(annualAmount * 100) / 100,
          calculatedCLV: Math.round(clv * 100) / 100,
          status: subscription.status,
          cancel_at_period_end: subscription.cancel_at_period_end,
          current_period_end: subscription.current_period_end
        });
        
        // Aggregate by country
        mrrByCountry[country] = (mrrByCountry[country] || 0) + actualMonthlyAmount;
        arrByCountry[country] = (arrByCountry[country] || 0) + annualAmount;
        clvByCountry[country] = (clvByCountry[country] || 0) + clv;
        activeSubsByCountry[country] = (activeSubsByCountry[country] || 0) + 1;
        
        // Aggregate by plan
        mrrByPlan[planName] = (mrrByPlan[planName] || 0) + actualMonthlyAmount;
        arrByPlan[planName] = (arrByPlan[planName] || 0) + annualAmount;
        clvByPlan[planName] = (clvByPlan[planName] || 0) + clv;
        activeSubsByPlan[planName] = (activeSubsByPlan[planName] || 0) + 1;
      }
      
      logStep("🌍 ENHANCED COUNTRY DISTRIBUTION SUMMARY", countrySummary);
      
      logStep("Final calculated totals with proper CLV", {
        totalMrr: Math.round(totalMrr * 100) / 100,
        totalArr: Math.round(totalArr * 100) / 100,
        totalClv: Math.round(totalClv * 100) / 100,
        activeSubscriptionsCount,
        countriesFound: Object.keys(mrrByCountry),
        plansFound: Object.keys(mrrByPlan),
        detailedByCountry: Object.fromEntries(
          Object.entries(mrrByCountry).map(([k, v]) => [k, Math.round(v * 100) / 100])
        ),
        detailedByPlan: Object.fromEntries(
          Object.entries(mrrByPlan).map(([k, v]) => [k, Math.round(v * 100) / 100])
        )
      });

      // Store analytics data
      const analyticsData = [];
      
      // Store top-level metrics (using CLV instead of LTV)
      analyticsData.push(
        {
          user_id: user_id,
          data_type: 'mrr',
          value: Math.round(totalMrr * 100) / 100,
          currency: 'USD'
        },
        {
          user_id: user_id,
          data_type: 'arr',
          value: Math.round(totalArr * 100) / 100,
          currency: 'USD'
        },
        {
          user_id: user_id,
          data_type: 'ltv', // Keep as 'ltv' for backward compatibility but now contains proper CLV
          value: Math.round(totalClv * 100) / 100,
          currency: 'USD'
        },
        {
          user_id: user_id,
          data_type: 'active_subscriptions',
          value: activeSubscriptionsCount,
          currency: 'USD'
        }
      );
      
      // Store metrics by country
      for (const [country, mrr] of Object.entries(mrrByCountry)) {
        analyticsData.push(
          {
            user_id: user_id,
            data_type: 'mrr',
            value: Math.round(mrr * 100) / 100,
            segment_type: 'country',
            segment_value: country,
            currency: 'USD'
          },
          {
            user_id: user_id,
            data_type: 'arr',
            value: Math.round((arrByCountry[country] || 0) * 100) / 100,
            segment_type: 'country',
            segment_value: country,
            currency: 'USD'
          },
          {
            user_id: user_id,
            data_type: 'ltv',
            value: Math.round((clvByCountry[country] || 0) * 100) / 100,
            segment_type: 'country',
            segment_value: country,
            currency: 'USD'
          },
          {
            user_id: user_id,
            data_type: 'active_subscriptions',
            value: activeSubsByCountry[country] || 0,
            segment_type: 'country',
            segment_value: country,
            currency: 'USD'
          }
        );
      }
      
      // Store metrics by plan
      for (const [plan, mrr] of Object.entries(mrrByPlan)) {
        analyticsData.push(
          {
            user_id: user_id,
            data_type: 'mrr',
            value: Math.round(mrr * 100) / 100,
            segment_type: 'plan',
            segment_value: plan,
            currency: 'USD'
          },
          {
            user_id: user_id,
            data_type: 'arr',
            value: Math.round((arrByPlan[plan] || 0) * 100) / 100,
            segment_type: 'plan',
            segment_value: plan,
            currency: 'USD'
          },
          {
            user_id: user_id,
            data_type: 'ltv',
            value: Math.round((clvByPlan[plan] || 0) * 100) / 100,
            segment_type: 'plan',
            segment_value: plan,
            currency: 'USD'
          },
          {
            user_id: user_id,
            data_type: 'active_subscriptions',
            value: activeSubsByPlan[plan] || 0,
            segment_type: 'plan',
            segment_value: plan,
            currency: 'USD'
          }
        );
      }

      // Clear existing data and insert new data
      const { error: deleteError } = await supabase
        .from('analytics_data')
        .delete()
        .eq('user_id', user_id);

      if (deleteError) {
        logStep("Error clearing existing analytics data", { error: deleteError.message });
      }

      if (analyticsData.length > 0) {
        const { error: insertError } = await supabase
          .from('analytics_data')
          .insert(analyticsData);

        if (insertError) {
          logStep("Error inserting analytics data", { error: insertError.message });
          throw new Error(`Failed to store analytics data: ${insertError.message}`);
        } else {
          logStep("Analytics data stored successfully", { recordCount: analyticsData.length });
        }
      }

      // Update connection status
      const now = new Date().toISOString();
      
      const { error: updateError } = await supabase
        .from("stripe_connections")
        .update({
          is_valid: true,
          error_message: null,
          last_synced: now
        })
        .eq("id", connectionData.id);

      if (updateError) {
        logStep("Error updating connection", { error: updateError.message });
      }

      logStep("Sync completed successfully with enhanced accuracy");
      
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: filter_may_2025 ? "May 2025 data sync with enhanced accuracy" : "Data sync completed with proper CLV calculation and enhanced country detection",
          customersCount: customers.data.length,
          subscriptionsCount: subscriptions.data.length,
          mayFilteredSubscriptions: filter_may_2025 ? subscriptionsToProcess.length : 'not applied',
          validSubscriptionsCount: validSubscriptions.length,
          productsCount: products.data.length,
          pricesCount: prices.data.length,
          records_processed: customers.data.length + subscriptions.data.length,
          countrySummary,
          enhancedAccuracy: true,
          properCLVCalculation: true,
          prorationHandling: true,
          last_synced: now
        }),
        { 
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    } catch (stripeError) {
      logStep("Stripe API error", { 
        message: stripeError.message,
        type: stripeError.type,
        code: stripeError.code 
      });
      
      const isAuthError = stripeError.message?.toLowerCase().includes('invalid api key') || 
                         stripeError.message?.toLowerCase().includes('unauthorized') ||
                         stripeError.message?.toLowerCase().includes('expired') ||
                         stripeError.code === 'api_key_expired';
      
      if (isAuthError) {
        await supabase
          .from("stripe_connections")
          .update({
            is_valid: false,
            error_message: "Invalid or expired Stripe API key. Please re-enter your Stripe key."
          })
          .eq("id", connectionData.id);
          
        return new Response(
          JSON.stringify({ 
            success: false, 
            message: "Invalid or expired Stripe API key. Please re-enter your Stripe key.",
            require_reconnect: true
          }),
          { 
            status: 400, 
            headers: { ...corsHeaders, "Content-Type": "application/json" } 
          }
        );
      }
      
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: `Stripe API error: ${stripeError.message}`,
          require_reconnect: false
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }
  } catch (error) {
    logStep("Unexpected error in sync function", { 
      message: error.message,
      stack: error.stack 
    });
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        message: error.message || "Failed to sync Stripe data",
        require_reconnect: false
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});
