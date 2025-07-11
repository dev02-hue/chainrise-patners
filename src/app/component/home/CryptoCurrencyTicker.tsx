"use client";
import { motion } from "framer-motion";
import { FiArrowUpRight, FiTrendingUp, FiTrendingDown } from "react-icons/fi";

const CryptoCurrencyTicker = () => {
  // Sample crypto data
  const cryptoData = [
    { symbol: "BTC", name: "Bitcoin", price: "$63,245.78", change: "+2.34%", isUp: true },
    { symbol: "ETH", name: "Ethereum", price: "$3,412.56", change: "-1.12%", isUp: false },
    { symbol: "SOL", name: "Solana", price: "$142.89", change: "+5.67%", isUp: true },
    { symbol: "ADA", name: "Cardano", price: "$0.4523", change: "-0.89%", isUp: false },
    { symbol: "DOT", name: "Polkadot", price: "$6.78", change: "+3.45%", isUp: true },
    { symbol: "AVAX", name: "Avalanche", price: "$35.21", change: "+7.12%", isUp: true },
    { symbol: "LINK", name: "Chainlink", price: "$14.56", change: "-2.34%", isUp: false },
  ];

  return (
    <div className="bg-gray-900 border-y border-gray-800 py-4 overflow-hidden    dark:border-gray-200 h-16 flex items-center mt-14">
      <div className="w-full overflow-hidden">
        <motion.div
          className="flex items-center"
          animate={{
            x: ["0%", "-100%"],
          }}
          transition={{
            duration: 20, // Faster animation (was 30)
            repeat: Infinity,
            ease: "linear",
          }}
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
              <span className="mx-3 text-gray-400 dark:text-gray-600 text-lg">
                {crypto.price}
              </span>
              <span className={`flex items-center ${crypto.isUp ? 'text-green-400' : 'text-red-400'} text-lg`}>
                {crypto.isUp ? <FiTrendingUp className="mr-1.5" /> : <FiTrendingDown className="mr-1.5" />}
                {crypto.change}
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