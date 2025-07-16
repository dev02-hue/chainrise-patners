"use client";
import { motion, useAnimation, AnimatePresence } from "framer-motion";
import { FiArrowUpRight, FiTrendingUp, FiTrendingDown } from "react-icons/fi";
import { useEffect, useState } from "react";

interface CryptoData {
  symbol: string;
  name: string;
  price: number;
  change: number;
  isUp: boolean;
}

const CryptoCurrencyTicker = () => {
  // Initial crypto data with numerical values for animation
  const initialData: CryptoData[] = [
    { symbol: "BTC", name: "Bitcoin", price: 110245.78, change: 2.34, isUp: true },
    { symbol: "ETH", name: "Ethereum", price: 3412.56, change: -1.12, isUp: false },
    { symbol: "SOL", name: "Solana", price: 142.89, change: 5.67, isUp: true },
    { symbol: "ADA", name: "Cardano", price: 0.4523, change: -0.89, isUp: false },
    { symbol: "DOT", name: "Polkadot", price: 6.78, change: 3.45, isUp: true },
    { symbol: "AVAX", name: "Avalanche", price: 35.21, change: 7.12, isUp: true },
    { symbol: "LINK", name: "Chainlink", price: 14.56, change: -2.34, isUp: false },
  ];

  const [cryptoData, setCryptoData] = useState<CryptoData[]>(initialData);
  const controls = useAnimation();

  // Function to format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: value < 1 ? 4 : 2,
      maximumFractionDigits: value < 1 ? 4 : 2,
    }).format(value);
  };

  // Function to simulate price changes
  const updatePrices = () => {
    setCryptoData(prevData =>
      prevData.map(item => {
        // Generate random change between -3% and +3%
        const randomChange = (Math.random() * 6 - 3) / 100;
        const newPrice = item.price * (1 + randomChange);
        const change = (randomChange * 100);
        
        return {
          ...item,
          price: newPrice,
          change: parseFloat(change.toFixed(2)),
          isUp: change >= 0,
        };
      })
    );
  };

  // Animate the ticker and update prices periodically
  useEffect(() => {
    // Start the ticker animation
    controls.start({
      x: ["0%", "-100%"],
      transition: {
        duration: 30,
        repeat: Infinity,
        ease: "linear",
      },
    });

    // Update prices every 5 seconds
    const interval = setInterval(updatePrices, 5000);

    return () => clearInterval(interval);
  }, [controls]);

  return (
    <div className="bg-gray-900 border-y border-gray-800 py-4 overflow-hidden dark:border-gray-200 h-16 flex items-center mt-14">
      <div className="w-full overflow-hidden">
        <motion.div
          className="flex items-center"
          animate={controls}
        >
          {[...cryptoData, ...cryptoData].map((crypto, index) => (
            <motion.a
              key={`${crypto.symbol}-${index}`}
              href="#"
              className="flex items-center px-6 py-2 whitespace-nowrap group"
              whileHover={{ scale: 1.03 }}
            >
              <span className="font-medium text-gray-300 dark:text-gray-800 group-hover:text-blue-400 dark:group-hover:text-blue-500 text-lg">
                {crypto.symbol}
              </span>
              
              <span className="mx-3 text-gray-400 dark:text-gray-600 text-lg w-24 text-right">
                <AnimatePresence mode="wait">
                  <motion.span
                    key={crypto.price}
                    initial={{ y: crypto.isUp ? 10 : -10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: crypto.isUp ? -10 : 10, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    {formatCurrency(crypto.price)}
                  </motion.span>
                </AnimatePresence>
              </span>
              
              <span className={`flex items-center ${crypto.isUp ? 'text-green-400' : 'text-red-400'} text-lg w-20`}>
                <AnimatePresence mode="wait">
                  <motion.span
                    key={crypto.change}
                    initial={{ y: crypto.isUp ? 10 : -10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: crypto.isUp ? -10 : 10, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="flex items-center"
                  >
                    {crypto.isUp ? (
                      <FiTrendingUp className="mr-1.5" />
                    ) : (
                      <FiTrendingDown className="mr-1.5" />
                    )}
                    {crypto.change > 0 ? '+' : ''}{crypto.change}%
                  </motion.span>
                </AnimatePresence>
              </span>
              
              <FiArrowUpRight className="ml-3 w-5 h-5 text-gray-400 dark:text-gray-600" />
            </motion.a>
          ))}
        </motion.div>
      </div>
    </div>
  );
};

export default CryptoCurrencyTicker;