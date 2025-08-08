
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import Stripe from "https://esm.sh/stripe@18.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[MONTHLY-BREAKDOWN] ${step}${detailsStr}`);
};

// Enhanced country detection with better error handling and more sources
const getCustomerCountryFromPaymentMethods = async (customerId: string, stripe: any) => {
  try {
    logStep("Fetching payment methods for monthly breakdown", { customerId });
    
    const paymentMethods = await stripe.paymentMethods.list({
      customer: customerId,
      limit: 20,
      type: 'card'
    });
    
    logStep("Payment methods found for monthly breakdown", {
      customerId,
      paymentMethodCount: paymentMethods.data.length
    });
    
    for (const pm of paymentMethods.data) {
      logStep("Checking payment method for monthly breakdown", {
        paymentMethodId: pm.id,
        type: pm.type,
        country: pm.billing_details?.address?.country
      });
      
      if (pm.billing_details?.address?.country) {
        logStep("Found country from payment method in monthly breakdown", {
          paymentMethodId: pm.id,
          country: pm.billing_details.address.country
        });
        return pm.billing_details.address.country;
      }
    }
    
    // Also check setup intents
    try {
      const setupIntents = await stripe.setupIntents.list({
        customer: customerId,
        limit: 10
      });
      
      for (const si of setupIntents.data) {
        if (si.payment_method) {
          const paymentMethod = await stripe.paymentMethods.retrieve(si.payment_method);
          if (paymentMethod.billing_details?.address?.country) {
            logStep("Found country from setup intent in monthly breakdown", {
              country: paymentMethod.billing_details.address.country
            });
            return paymentMethod.billing_details.address.country;
          }
        }
      }
    } catch (error) {
      logStep("Error checking setup intents in monthly breakdown", { error: error.message });
    }
    
    logStep("No country found in payment methods for monthly breakdown", { customerId });
    return null;
  } catch (error) {
    logStep("Error fetching payment methods for monthly breakdown", { customerId, error: error.message });
    return null;
  }
};

const getCustomerCountry = async (customer: any, stripe: any) => {
  let country = null;
  
  logStep("Starting country detection for monthly breakdown", {
    customerId: customer?.id,
    customerEmail: customer?.email
  });
  
  // 1. HIGHEST PRIORITY: Check customer billing address first
  if (customer?.address?.country) {
    country = customer.address.country;
    logStep("✅ Found country from customer billing address in monthly breakdown", { country });
  }
  
  // 2. Check shipping address as secondary customer address
  if (!country && customer?.shipping?.address?.country) {
    country = customer.shipping.address.country;
    logStep("✅ Found country from customer shipping address in monthly breakdown", { country });
  }
  
  // 3. Check payment method billing details
  if (!country && customer?.id) {
    country = await getCustomerCountryFromPaymentMethods(customer.id, stripe);
    if (country) {
      logStep("✅ Found country from payment methods in monthly breakdown", { country });
    }
  }
  
  // 4. Check customer's default payment method
  if (!country && customer?.invoice_settings?.default_payment_method) {
    try {
      const defaultPM = await stripe.paymentMethods.retrieve(customer.invoice_settings.default_payment_method);
      if (defaultPM.billing_details?.address?.country) {
        country = defaultPM.billing_details.address.country;
        logStep("✅ Found country from default payment method in monthly breakdown", { country });
      }
    } catch (error) {
      logStep("Error retrieving default payment method in monthly breakdown", { error: error.message });
    }
  }
  
  // 5. Check tax information
  if (!country && customer?.tax?.location?.country) {
    country = customer.tax.location.country;
    logStep("✅ Found country from tax location in monthly breakdown", { country });
  }
  
  // 6. Check metadata
  if (!country && customer?.metadata?.country) {
    country = customer.metadata.country;
    logStep("✅ Found country from metadata in monthly breakdown", { country });
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
          logStep("✅ Found country from invoice address in monthly breakdown", { country });
          break;
        }
      }
    } catch (error) {
      logStep("Error checking invoices in monthly breakdown", { error: error.message });
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
          logStep("✅ Found country from charge billing details in monthly breakdown", { country });
          break;
        }
      }
    } catch (error) {
      logStep("Error checking charges in monthly breakdown", { error: error.message });
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
    logStep("Country mapping in monthly breakdown", { original: country, mapped: mappedCountry });
    return mappedCountry;
  }
  
  logStep("❌ No country found for customer in monthly breakdown", { customerId: customer?.id });
  return 'Unknown';
};

const calculateActualMrr = (actualAmount: number, interval: string, intervalCount: number) => {
  switch (interval) {
    case 'month': return actualAmount / intervalCount;
    case 'year': return (actualAmount / 12) / intervalCount;
    case 'week': return (actualAmount * 52 / 12) / intervalCount;
    case 'day': return (actualAmount * 365 / 12) / intervalCount;
    default: return actualAmount / intervalCount;
  }
};

const calculateActualAmount = (subscription: any, price: any) => {
  const planAmount = (price.unit_amount || 0) / 100;
  const quantity = subscription.items.data[0].quantity || 1;
  
  let totalDiscount = 0;
  if (subscription.discount && subscription.discount.coupon) {
    const coupon = subscription.discount.coupon;
    if (coupon.amount_off) {
      totalDiscount = coupon.amount_off / 100;
    } else if (coupon.percent_off) {
      totalDiscount = (planAmount * coupon.percent_off) / 100;
    }
  }
  
  return Math.max(0, (planAmount - totalDiscount) * quantity);
};

const decryptApiKey = async (encryptedData: string, secret: string) => {
  try {
    let cleanData = encryptedData;
    if (cleanData.startsWith("\\x")) {
      cleanData = cleanData.substring(2);
    }
    
    const hexBytes = new Uint8Array(cleanData.length / 2);
    for (let i = 0; i < cleanData.length; i += 2) {
      hexBytes[i / 2] = parseInt(cleanData.substr(i, 2), 16);
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
    return decoder.decode(decrypted);
  } catch (error) {
    throw new Error(`Failed to decrypt Stripe API key: ${error.message}`);
  }
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Monthly breakdown function started");
    
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { persistSession: false }
    });
    
    const requestBody = await req.json();
    const { user_id } = requestBody;
    
    if (!user_id) {
      throw new Error("Missing user_id parameter");
    }

    logStep("Fetching user's Stripe connection", { user_id });
    
    const { data: connectionData, error: connectionError } = await supabase
      .from("stripe_connections")
      .select("*")
      .eq("user_id", user_id)
      .maybeSingle();

    if (connectionError || !connectionData) {
      throw new Error("No Stripe connection found for this user");
    }

    // Decrypt API key
    const encryptionSecret = Deno.env.get("ENCRYPTION_SECRET") || supabaseServiceKey.substring(0, 32);
    
    let encryptedData = connectionData.encrypted_api_key;
    if (typeof encryptedData === 'object' && encryptedData !== null) {
      const uint8Array = new Uint8Array(encryptedData);
      encryptedData = Array.from(uint8Array)
        .map(byte => byte.toString(16).padStart(2, '0'))
        .join('');
      encryptedData = '\\x' + encryptedData;
    }
    
    const apiKey = await decryptApiKey(encryptedData, encryptionSecret);
    logStep("API key decrypted successfully");

    const stripe = new Stripe(apiKey, { apiVersion: "2024-06-20" });
    
    // Fetch data
    const customers = await stripe.customers.list({ limit: 100 });
    const subscriptions = await stripe.subscriptions.list({ limit: 100 });
    const products = await stripe.products.list({ limit: 100 });
    const prices = await stripe.prices.list({ limit: 100 });
    
    logStep("Stripe data fetched for monthly breakdown", {
      customersCount: customers.data.length,
      subscriptionsCount: subscriptions.data.length
    });

    const productMap = new Map();
    products.data.forEach(product => {
      productMap.set(product.id, product);
    });

    // Group subscriptions by month with proper filtering
    const monthlyMetrics = new Map();
    const currentDate = new Date();

    // Filter to only include currently active subscriptions
    const validSubscriptions = subscriptions.data.filter(sub => {
      const validStatus = ['active', 'trialing', 'past_due'].includes(sub.status);
      const hasValidPrice = sub.items?.data?.[0]?.price;
      
      if (!hasValidPrice) return false;
      
      const price = sub.items.data[0].price;
      const actualAmount = calculateActualAmount(sub, price);
      return validStatus && actualAmount > 0;
    });

    logStep("Processing subscriptions for monthly breakdown", { validCount: validSubscriptions.length });

    for (const subscription of validSubscriptions) {
      const price = subscription.items.data[0].price;
      const actualAmount = calculateActualAmount(subscription, price);
      const actualMonthlyAmount = calculateActualMrr(
        actualAmount, 
        price.recurring?.interval || 'month', 
        price.recurring?.interval_count || 1
      );

      // Get customer country
      const customerId = subscription.customer;
      const customer = customers.data.find(c => c.id === customerId);
      const country = await getCustomerCountry(customer, stripe);

      // Only process timestamps that are in the past or current month
      const relevantTimestamps = [
        subscription.created,
        subscription.start_date,
        subscription.current_period_start
      ].filter(ts => {
        if (!ts || ts <= 0) return false;
        const tsDate = new Date(ts * 1000);
        return tsDate <= currentDate;
      });

      // Remove duplicates and sort
      const uniqueTimestamps = [...new Set(relevantTimestamps)].sort((a, b) => a - b);
      
      logStep("Processing subscription timestamps for monthly breakdown", {
        subscriptionId: subscription.id,
        customerId,
        detectedCountry: country,
        timestamps: uniqueTimestamps.map(ts => new Date(ts * 1000).toISOString())
      });
      
      for (const timestamp of uniqueTimestamps) {
        const date = new Date(timestamp * 1000);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        
        if (!monthlyMetrics.has(monthKey)) {
          monthlyMetrics.set(monthKey, {
            month: date.toLocaleDateString('en-US', { month: 'long' }),
            year: date.getFullYear(),
            total_subscriptions: 0,
            total_mrr: 0,
            total_arr: 0,
            countries: new Set(),
            subscriptionIds: new Set()
          });
        }

        const monthData = monthlyMetrics.get(monthKey);
        
        // Only count each subscription once per month
        if (!monthData.subscriptionIds.has(subscription.id)) {
          monthData.total_subscriptions += 1;
          monthData.total_mrr += actualMonthlyAmount;
          monthData.total_arr += actualMonthlyAmount * 12;
          monthData.subscriptionIds.add(subscription.id);
        }
        
        monthData.countries.add(country);
      }
    }

    // Convert to array and sort by date (most recent first)
    const monthlyData = Array.from(monthlyMetrics.entries())
      .map(([key, data]) => ({
        month: data.month,
        year: data.year,
        total_subscriptions: data.total_subscriptions,
        countries: Array.from(data.countries),
        total_mrr: Math.round(data.total_mrr * 100) / 100,
        total_arr: Math.round(data.total_arr * 100) / 100
      }))
      .sort((a, b) => {
        if (a.year !== b.year) return b.year - a.year;
        return new Date(`${b.month} 1, ${b.year}`).getMonth() - new Date(`${a.month} 1, ${a.year}`).getMonth();
      });

    logStep("Monthly breakdown completed", { 
      monthsFound: monthlyData.length,
      totalValidSubscriptions: validSubscriptions.length
    });

    return new Response(
      JSON.stringify({ 
        success: true,
        monthlyData,
        totalValidSubscriptions: validSubscriptions.length
      }),
      { 
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  } catch (error) {
    logStep("ERROR in monthly-breakdown", { message: error.message });
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || "Failed to fetch monthly breakdown"
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});
