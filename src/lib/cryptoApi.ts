/* eslint-disable @typescript-eslint/no-explicit-any */
import { CryptoCurrency, GlobalMarketData } from "@/types/businesses";

// services/cryptoApi.ts
const BASE_URL = 'https://api.coingecko.com/api/v3';

export class CryptoApiService {
  static async getTopCryptos(currency: string = 'usd', limit: number = 50): Promise<CryptoCurrency[]> {
    const response = await fetch(
      `${BASE_URL}/coins/markets?vs_currency=${currency}&order=market_cap_desc&per_page=${limit}&page=1&sparkline=true&price_change_percentage=1h,24h,7d`,
      { next: { revalidate: 60 } } // Cache for 60 seconds
    );
    
    if (!response.ok) {
      throw new Error('Failed to fetch crypto data');
    }
    
    return response.json();
  }

  static async getGlobalMarketData(): Promise<GlobalMarketData> {
    const response = await fetch(
      `${BASE_URL}/global`,
      { next: { revalidate: 60 } }
    );
    
    if (!response.ok) {
      throw new Error('Failed to fetch global market data');
    }
    
    return response.json();
  }

  static async getCoinHistory(coinId: string, days: number = 7): Promise<any> {
    const response = await fetch(
      `${BASE_URL}/coins/${coinId}/market_chart?vs_currency=usd&days=${days}`,
      { next: { revalidate: 300 } } // Cache for 5 minutes
    );
    
    if (!response.ok) {
      throw new Error('Failed to fetch coin history');
    }
    
    return response.json();
  }
}