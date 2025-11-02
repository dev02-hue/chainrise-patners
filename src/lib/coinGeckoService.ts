// lib/coinGeckoService.ts

const COINGECKO_API = 'https://api.coingecko.com/api/v3';

// Define the expected data types (for better type safety)
interface CryptoPricesResponse {
  [key: string]: {
    usd: number;
    usd_24h_change?: number;
  };
}

interface MarketDataItem {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number;
  price_change_percentage_24h: number;
  market_cap: number;
  sparkline_in_7d?: {
    price: number[];
  };
}

export async function getCryptoPrices(): Promise<CryptoPricesResponse | null> {
  try {
    const response = await fetch(
      `${COINGECKO_API}/simple/price?ids=bitcoin,ethereum,solana,binancecoin,tether&vs_currencies=usd&include_24hr_change=true`,
      { next: { revalidate: 60 } } // Cache for 60 seconds
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch crypto prices (status ${response.status})`);
    }

    const data: CryptoPricesResponse = await response.json();
    console.log('✅ Crypto Prices Fetched:', data);

    return data;
  } catch (error) {
    console.error('❌ Error fetching crypto prices:', error);
    return null;
  }
}

export async function getMarketData(): Promise<MarketDataItem[] | null> {
  try {
    const response = await fetch(
      `${COINGECKO_API}/coins/markets?vs_currency=usd&ids=bitcoin,ethereum,solana,binancecoin&order=market_cap_desc&per_page=4&page=1&sparkline=true&price_change_percentage=24h`,
      { next: { revalidate: 120 } }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch market data (status ${response.status})`);
    }

    const data: MarketDataItem[] = await response.json();
    console.log('✅ Market Data Fetched:', data);

    return data;
  } catch (error) {
    console.error('❌ Error fetching market data:', error);
    return null;
  }
}
