"use client";

import Image from "next/image";
import { FaChevronRight } from "react-icons/fa";
import { motion } from "framer-motion";

const InvestmentHeader = () => {
  return (
    <section className="bg-[#eaf5ef] w-full py-20 px-6 md:px-16">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-10">
        
        {/* Left Text Side */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-6"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-[#133b31]">
            Investment Plan
          </h1>
          <div className="flex items-center text-[#133b31] font-medium text-sm space-x-2">
            <span className="text-[#133b31]/70">Home</span>
            <FaChevronRight size={12} className="text-[#133b31]" />
            <span>Investment Plan</span>
          </div>
        </motion.div>

        {/* Right Illustration Side */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="w-[300px] md:w-[400px]"
        >
          <Image
            src="/investment-illustration.png" // replace with actual image
            alt="Investment Plan Illustration"
            width={400}
            height={300}
            className="w-full h-auto object-contain"
          />
        </motion.div>
      </div>
    </section>
  );
};

export default InvestmentHeader;
