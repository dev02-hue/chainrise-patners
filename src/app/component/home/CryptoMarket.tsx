"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  FiTrendingUp, 
  FiTrendingDown, 
  FiStar, 
  FiSearch, 
  
  FiRefreshCw,
  FiArrowUp,
  FiArrowDown,
  
} from "react-icons/fi";
import { CryptoCurrency, GlobalMarketData } from "@/types/businesses";
import { CryptoApiService } from "@/lib/cryptoApi";
 

interface CurrencyOption {
  symbol: string;
  name: string;
  code: string;
}

const CURRENCIES: CurrencyOption[] = [
  { symbol: "$", name: "US Dollar", code: "usd" },
  { symbol: "€", name: "Euro", code: "eur" },
  { symbol: "£", name: "British Pound", code: "gbp" },
  { symbol: "¥", name: "Japanese Yen", code: "jpy" },
  { symbol: "A$", name: "Australian Dollar", code: "aud" },
  { symbol: "C$", name: "Canadian Dollar", code: "cad" },
];

const CryptoMarket: React.FC = () => {
  const [cryptos, setCryptos] = useState<CryptoCurrency[]>([]);
  const [globalData, setGlobalData] = useState<GlobalMarketData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedCurrency, setSelectedCurrency] = useState<string>("usd");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<keyof CryptoCurrency>("market_cap_rank");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [refreshing, setRefreshing] = useState(false);
  const [favorites, setFavorites] = useState<string[]>([]);

  useEffect(() => {
    loadMarketData();
    const interval = setInterval(loadMarketData, 60000); // Refresh every minute
    return () => clearInterval(interval);
  }, [selectedCurrency]);

  const loadMarketData = async () => {
    try {
      setRefreshing(true);
      const [cryptoData, globalData] = await Promise.all([
        CryptoApiService.getTopCryptos(selectedCurrency, 100),
        CryptoApiService.getGlobalMarketData()
      ]);
      setCryptos(cryptoData);
      setGlobalData(globalData);
    } catch (error) {
      console.error("Error loading market data:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const toggleFavorite = (coinId: string) => {
    setFavorites(prev => 
      prev.includes(coinId) 
        ? prev.filter(id => id !== coinId)
        : [...prev, coinId]
    );
  };

  const handleSort = (column: keyof CryptoCurrency) => {
    if (sortBy === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortBy(column);
      setSortDirection("desc");
    }
  };

  const filteredCryptos = cryptos
    .filter(crypto => 
      crypto.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      crypto.symbol.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      const aValue = a[sortBy] as number;
      const bValue = b[sortBy] as number;
      return sortDirection === "asc" ? aValue - bValue : bValue - aValue;
    });

  

  const formatCurrency = (num: number, currency: string = selectedCurrency) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase(),
      minimumFractionDigits: num < 1 ? 4 : 2,
      maximumFractionDigits: num < 1 ? 4 : 2,
    }).format(num);
  };

  const formatMarketCap = (num: number) => {
    if (num >= 1e12) return `$${(num / 1e12).toFixed(2)}T`;
    if (num >= 1e9) return `$${(num / 1e9).toFixed(2)}B`;
    if (num >= 1e6) return `$${(num / 1e6).toFixed(2)}M`;
    return formatCurrency(num);
  };

  if (loading) {
    return <MarketDataSkeleton />;
  }

  return (
    <section className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-white/5 backdrop-blur-sm border border-white/10 mb-6">
            <FiTrendingUp className="text-green-400 text-xl" />
            <span className="text-sm font-semibold text-green-400 uppercase tracking-wider">
              Live Market Data
            </span>
          </div>
          
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6">
            Cryptocurrency <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-blue-400">Market</span>
          </h1>
          
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Real-time cryptocurrency prices, market caps, and trading volumes
          </p>
        </motion.div>

        {/* Global Market Stats */}
        {globalData && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
          >
            <GlobalStatCard
              title="Total Market Cap"
              value={formatMarketCap(globalData.data.total_market_cap.usd)}
              change={globalData.data.market_cap_change_percentage_24h_usd}
            />
            <GlobalStatCard
              title="24h Volume"
              value={formatMarketCap(globalData.data.total_volume.usd)}
            />
            <GlobalStatCard
              title="Active Currencies"
              value={globalData.data.active_cryptocurrencies.toLocaleString()}
            />
            <GlobalStatCard
              title="BTC Dominance"
              value={`${globalData.data.market_cap_percentage.btc.toFixed(1)}%`}
            />
          </motion.div>
        )}

        {/* Controls */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 mb-8 border border-white/10"
        >
          <div className="flex flex-col lg:flex-row gap-6 items-center justify-between">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-xl" />
              <input
                type="text"
                placeholder="Search cryptocurrencies..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-6 py-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300"
              />
            </div>

            {/* Currency Selector */}
            <div className="flex items-center gap-4">
              <select
                value={selectedCurrency}
                onChange={(e) => setSelectedCurrency(e.target.value)}
                className="bg-white/5 border border-white/10 rounded-xl py-4 px-6 text-white focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300"
              >
                {CURRENCIES.map(currency => (
                  <option key={currency.code} value={currency.code}>
                    {currency.symbol} {currency.name}
                  </option>
                ))}
              </select>

              {/* Refresh Button */}
              <button
                onClick={loadMarketData}
                disabled={refreshing}
                className="p-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white transition-all duration-300 hover:scale-105 disabled:opacity-50"
              >
                <FiRefreshCw className={`text-xl ${refreshing ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>
        </motion.div>

        {/* Crypto Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white/5 backdrop-blur-sm rounded-2xl overflow-hidden border border-white/10"
        >
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="py-6 px-6 text-left">
                    <button
                      onClick={() => handleSort("market_cap_rank")}
                      className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
                    >
                      #
                      <SortIcon sorted={sortBy === "market_cap_rank"} direction={sortDirection} />
                    </button>
                  </th>
                  <th className="py-6 px-6 text-left text-gray-400">Coin</th>
                  <th className="py-6 px-6 text-right">
                    <button
                      onClick={() => handleSort("current_price")}
                      className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors ml-auto"
                    >
                      Price
                      <SortIcon sorted={sortBy === "current_price"} direction={sortDirection} />
                    </button>
                  </th>
                  <th className="py-6 px-6 text-right">
                    <button
                      onClick={() => handleSort("price_change_percentage_24h")}
                      className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors ml-auto"
                    >
                      24h %
                      <SortIcon sorted={sortBy === "price_change_percentage_24h"} direction={sortDirection} />
                    </button>
                  </th>
                  <th className="py-6 px-6 text-right">
                    <button
                      onClick={() => handleSort("market_cap")}
                      className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors ml-auto"
                    >
                      Market Cap
                      <SortIcon sorted={sortBy === "market_cap"} direction={sortDirection} />
                    </button>
                  </th>
                  <th className="py-6 px-6 text-right">
                    <button
                      onClick={() => handleSort("total_volume")}
                      className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors ml-auto"
                    >
                      Volume (24h)
                      <SortIcon sorted={sortBy === "total_volume"} direction={sortDirection} />
                    </button>
                  </th>
                  <th className="py-6 px-6 text-right text-gray-400">Last 7 Days</th>
                  <th className="py-6 px-6 text-center">
                    <FiStar className="text-gray-400 mx-auto" />
                  </th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence>
                  {filteredCryptos.map((crypto, index) => (
                    <CryptoRow
                      key={crypto.id}
                      crypto={crypto}
                      index={index}
                      currency={selectedCurrency}
                      isFavorite={favorites.includes(crypto.id)}
                      onToggleFavorite={() => toggleFavorite(crypto.id)}
                      formatCurrency={formatCurrency}
                      formatMarketCap={formatMarketCap}
                    />
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

// Supporting Components
const GlobalStatCard: React.FC<{ title: string; value: string; change?: number }> = ({ 
  title, 
  value, 
  change 
}) => (
  <motion.div
    whileHover={{ scale: 1.05 }}
    className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 hover:border-white/20 transition-all duration-300"
  >
    <h3 className="text-gray-400 text-sm font-semibold mb-2">{title}</h3>
    <div className="flex items-center gap-2">
      <p className="text-2xl font-bold text-white">{value}</p>
      {change !== undefined && (
        <span className={`text-sm font-semibold ${
          change >= 0 ? 'text-green-400' : 'text-red-400'
        }`}>
          {change >= 0 ? '+' : ''}{change.toFixed(2)}%
        </span>
      )}
    </div>
  </motion.div>
);

const SortIcon: React.FC<{ sorted: boolean; direction: "asc" | "desc" }> = ({ sorted, direction }) => (
  <div className="flex flex-col">
    <FiArrowUp className={`w-3 h-3 ${sorted && direction === "asc" ? "text-green-400" : "text-gray-400"}`} />
    <FiArrowDown className={`w-3 h-3 -mt-1 ${sorted && direction === "desc" ? "text-red-400" : "text-gray-400"}`} />
  </div>
);

const CryptoRow: React.FC<{
  crypto: CryptoCurrency;
  index: number;
  currency: string;
  isFavorite: boolean;
  onToggleFavorite: () => void;
  formatCurrency: (num: number, currency?: string) => string;
  formatMarketCap: (num: number) => string;
}> = ({ crypto, index, currency, isFavorite, onToggleFavorite, formatCurrency, formatMarketCap }) => {
  const isPositive = crypto.price_change_percentage_24h >= 0;

  return (
    <motion.tr
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className="border-b border-white/5 hover:bg-white/5 transition-colors duration-200 group"
    >
      <td className="py-4 px-6">
        <div className="flex items-center gap-4">
          <span className="text-gray-400 font-semibold">{crypto.market_cap_rank}</span>
          <button
            onClick={onToggleFavorite}
            className="opacity-0 group-hover:opacity-100 transition-opacity duration-200"
          >
            <FiStar className={`w-4 h-4 ${
              isFavorite ? "text-yellow-400 fill-yellow-400" : "text-gray-400"
            }`} />
          </button>
        </div>
      </td>
      
      <td className="py-4 px-6">
        <div className="flex items-center gap-4">
          <img
            src={crypto.image}
            alt={crypto.name}
            className="w-10 h-10 rounded-full"
          />
          <div>
            <h3 className="font-semibold text-white">{crypto.name}</h3>
            <p className="text-gray-400 text-sm uppercase">{crypto.symbol}</p>
          </div>
        </div>
      </td>
      
      <td className="py-4 px-6 text-right">
        <p className="text-white font-semibold">
          {formatCurrency(crypto.current_price, currency)}
        </p>
      </td>
      
      <td className="py-4 px-6 text-right">
        <div className={`inline-flex items-center gap-1 px-3 py-1 rounded-full ${
          isPositive ? 'bg-green-400/20 text-green-400' : 'bg-red-400/20 text-red-400'
        }`}>
          {isPositive ? <FiTrendingUp className="w-4 h-4" /> : <FiTrendingDown className="w-4 h-4" />}
          {Math.abs(crypto.price_change_percentage_24h).toFixed(2)}%
        </div>
      </td>
      
      <td className="py-4 px-6 text-right">
        <p className="text-white font-semibold">
          {formatMarketCap(crypto.market_cap)}
        </p>
      </td>
      
      <td className="py-4 px-6 text-right">
        <p className="text-gray-300">
          {formatMarketCap(crypto.total_volume)}
        </p>
      </td>
      
      <td className="py-4 px-6 text-right">
        <div className="w-24 h-10 bg-white/10 rounded ml-auto">
          {/* Sparkline chart would go here */}
        </div>
      </td>
      
      <td className="py-4 px-6 text-center">
        <button
          onClick={onToggleFavorite}
          className="opacity-0 group-hover:opacity-100 transition-opacity duration-200"
        >
          <FiStar className={`w-4 h-4 ${
            isFavorite ? "text-yellow-400 fill-yellow-400" : "text-gray-400"
          }`} />
        </button>
      </td>
    </motion.tr>
  );
};

const MarketDataSkeleton: React.FC = () => (
  <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 py-12 px-4 sm:px-6 lg:px-8">
    <div className="max-w-7xl mx-auto">
      <div className="animate-pulse">
        {/* Skeleton content */}
        <div className="h-12 bg-white/10 rounded-xl w-64 mx-auto mb-8"></div>
        <div className="h-16 bg-white/10 rounded-xl w-96 mx-auto mb-12"></div>
        
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-24 bg-white/10 rounded-2xl"></div>
          ))}
        </div>
        
        <div className="h-20 bg-white/10 rounded-2xl mb-8"></div>
        
        {[...Array(10)].map((_, i) => (
          <div key={i} className="h-16 bg-white/10 rounded-xl mb-4"></div>
        ))}
      </div>
    </div>
  </div>
);

export default CryptoMarket;