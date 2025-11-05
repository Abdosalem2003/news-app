/**
 * Gold Price Service - CLIENT SIDE (Updated Oct 29, 2025)
 * Fetches real-time gold prices with priority on server proxy
 * 
 * Strategy:
 * 1. Try Server Proxy first (bypasses CORS, most reliable)
 * 2. If proxy fails, try direct APIs that allow CORS
 * 3. Fallback to estimated data if all fail
 */

export interface GoldPriceResult {
  priceUSD: number;
  success: boolean;
  source: string;
  timestamp: Date;
}

/**
 * 1. Server Proxy - PRIMARY METHOD (No CORS issues)
 */
async function fetchFromServerProxy(): Promise<GoldPriceResult | null> {
  try {
    console.log('🔄 [PRIMARY] Fetching from Server Proxy (No CORS)...');
    const response = await fetch('/api/gold-price', {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
      cache: 'no-cache'
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('📊 Server Proxy Response:', data);
      
      if (data.priceUSD && data.success) {
        console.log('✅ SUCCESS: Gold price from Server Proxy:', data.priceUSD, 'USD/oz');
        console.log('📍 Original Source:', data.source);
        return {
          priceUSD: data.priceUSD,
          success: true,
          source: data.source,
          timestamp: new Date(data.timestamp)
        };
      }
    } else {
      console.warn('⚠️ Server Proxy returned status:', response.status);
    }
  } catch (error) {
    console.error('❌ Server Proxy error:', error);
  }
  return null;
}

/**
 * 2. GoldPrice.org - Direct (may have CORS issues)
 */
async function fetchFromGoldPriceOrg(): Promise<GoldPriceResult | null> {
  try {
    console.log('🔄 [BACKUP 1] Fetching from GoldPrice.org directly...');
    const response = await fetch('https://data-asg.goldprice.org/dbXRates/USD', {
      method: 'GET',
      mode: 'cors',
      headers: {
        'Accept': 'application/json',
      },
      cache: 'no-cache'
    });
    
    if (response.ok) {
      const data = await response.json();
      
      if (data.items && data.items[0] && data.items[0].xauPrice) {
        const price = parseFloat(data.items[0].xauPrice);
        if (price > 1500 && price < 5000) {
          console.log('✅ SUCCESS: Gold price from GoldPrice.org:', price, 'USD/oz');
          return {
            priceUSD: price,
            success: true,
            source: 'GoldPrice.org',
            timestamp: new Date()
          };
        }
      }
    }
  } catch (error) {
    console.error('❌ GoldPrice.org error (CORS blocked?):', error);
  }
  return null;
}

/**
 * 3. CoinGecko - PAX Gold (Gold-backed token)
 */
async function fetchFromCoinGecko(): Promise<GoldPriceResult | null> {
  try {
    console.log('🔄 [BACKUP 2] Fetching from CoinGecko (PAX Gold)...');
    const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=pax-gold&vs_currencies=usd', {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
      cache: 'no-cache'
    });
    
    if (response.ok) {
      const data = await response.json();
      
      if (data['pax-gold'] && data['pax-gold'].usd) {
        const price = parseFloat(data['pax-gold'].usd);
        if (price > 1500 && price < 5000) {
          console.log('✅ SUCCESS: Gold price from CoinGecko:', price, 'USD/oz');
          return {
            priceUSD: price,
            success: true,
            source: 'CoinGecko (PAX Gold)',
            timestamp: new Date()
          };
        }
      }
    }
  } catch (error) {
    console.error('❌ CoinGecko error:', error);
  }
  return null;
}

/**
 * Main function to fetch gold price with fallback
 */
export async function fetchGoldPrice(): Promise<GoldPriceResult> {
  console.log('🌍 Starting REAL gold price fetch from global markets...');
  console.log('💡 Priority: Server Proxy → GoldPrice.org → CoinGecko');
  
  // Try all sources in priority order
  const sources = [
    { name: 'Server Proxy', fn: fetchFromServerProxy },
    { name: 'GoldPrice.org', fn: fetchFromGoldPriceOrg },
    { name: 'CoinGecko', fn: fetchFromCoinGecko }
  ];
  
  for (const source of sources) {
    console.log(`\n🔍 Trying ${source.name}...`);
    const result = await source.fn();
    
    if (result && result.success) {
      console.log(`\n🎉 SUCCESS! Got real gold price from ${source.name}`);
      console.log(`💰 FINAL RESULT: $${result.priceUSD.toFixed(2)}/oz from ${result.source}`);
      return result;
    }
  }
  
  // All failed - return estimated
  console.warn('\n⚠️ ALL APIS FAILED - Using estimated data');
  return {
    priceUSD: 2065 + (Math.random() - 0.5) * 30,
    success: false,
    source: 'Estimated (All APIs failed)',
    timestamp: new Date()
  };
}

/**
 * Get cached gold price (5 minutes cache)
 */
let cachedPrice: GoldPriceResult | null = null;
let cacheTime: number = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export async function getCachedGoldPrice(): Promise<GoldPriceResult> {
  const now = Date.now();
  
  // Return cached if still valid
  if (cachedPrice && (now - cacheTime) < CACHE_DURATION) {
    console.log('📦 Using cached gold price:', cachedPrice.priceUSD);
    return cachedPrice;
  }
  
  // Fetch new price
  console.log('🔄 Cache expired or empty, fetching new price...');
  const result = await fetchGoldPrice();
  
  // Cache only successful results
  if (result.success) {
    cachedPrice = result;
    cacheTime = now;
  }
  
  return result;
}

/**
 * Format price for display
 */
export function formatGoldPrice(price: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(price);
}

/**
 * Get price change indicator
 */
export function getPriceChangeIndicator(currentPrice: number, previousPrice: number): {
  change: number;
  percentage: number;
  direction: 'up' | 'down' | 'neutral';
} {
  const change = currentPrice - previousPrice;
  const percentage = (change / previousPrice) * 100;
  
  return {
    change,
    percentage,
    direction: change > 0 ? 'up' : change < 0 ? 'down' : 'neutral'
  };
}

/**
 * Convert price per troy ounce to price per gram
 * 1 troy ounce = 31.1035 grams
 */
export function convertToGram(pricePerOunce: number): number {
  return pricePerOunce / 31.1035;
}

/**
 * Calculate prices for different karat purities
 */
export function calculateKaratPrices(pricePerGram: number) {
  return {
    gold24k: pricePerGram,                    // 100% pure
    gold22k: pricePerGram * (22 / 24),        // 91.67% pure
    gold21k: pricePerGram * (21 / 24),        // 87.5% pure
    gold18k: pricePerGram * (18 / 24),        // 75% pure
    goldPound: pricePerGram * 8 * (22 / 24),  // Egyptian gold pound (8 grams, 22k)
  };
}

/**
 * Alias for fetchGoldPrice (for backward compatibility)
 */
export async function fetchRealGoldPrice(): Promise<GoldPriceResult> {
  return await fetchGoldPrice();
}
