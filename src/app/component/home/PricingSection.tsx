"use client";

import { motion, Variants } from "framer-motion";
import { FaRegCreditCard } from "react-icons/fa";
import { useEffect, useRef } from "react";

const plans = [
  {
    title: "Starter",
    percentage: 5,
    min: "$100.00",
    max: "$5,000.00",
    duration: "Three Days",
    interval: "Daily",
    referral: "10%",
  },
  {
    title: "Advanced",
    percentage: 8,
    min: "$5,000.00",
    max: "$11,500.00",
    duration: "Four Days",
    interval: "Daily",
    referral: "10%",
  },
  {
    title: "Professional",
    percentage: 10,
    min: "$11,500.00",
    max: "$100,000.00",
    duration: "Five Days",
    interval: "Daily",
    referral: "10%",
  },
];

const containerVariant: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
      when: "beforeChildren",
    },
  },
};

const cardVariant: Variants = {
  hidden: { opacity: 0, y: 50, scale: 0.95 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      delay: i * 0.15,
      duration: 0.6,
      type: "spring",
      stiffness: 100,
    },
  }),
  hover: {
    y: -10,
    scale: 1.02,
    boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)",
    transition: { duration: 0.3 },
  },
  focus: {
    scale: 1.03,
    boxShadow: "0 0 0 3px rgba(5, 150, 105, 0.4)",
    transition: { duration: 0.2 },
  },
};

export default function PricingSection() {
  const sectionRef = useRef<HTMLDivElement>(null);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!sectionRef.current) return;

      const focusableElements = sectionRef.current.querySelectorAll(
        'button, [href], [tabindex]:not([tabindex="-1"])'
      );

      if (e.key === "Tab") {
        const firstElement = focusableElements[0] as HTMLElement;
        const lastElement = focusableElements[
          focusableElements.length - 1
        ] as HTMLElement;

        if (e.shiftKey && document.activeElement === firstElement) {
          lastElement.focus();
          e.preventDefault();
        } else if (!e.shiftKey && document.activeElement === lastElement) {
          firstElement.focus();
          e.preventDefault();
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <section
      ref={sectionRef}
      className="bg-white py-20 px-4 md:px-12 lg:px-24"
      id="pricing"
    >
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "0px 0px -100px 0px" }}
        variants={containerVariant}
        className="max-w-7xl mx-auto"
      >
        <motion.div
          variants={{
            hidden: { opacity: 0, y: 20 },
            visible: { opacity: 1, y: 0 },
          }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <motion.h3
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-base md:text-lg text-teal-700 font-medium"
          >
            Investment Plans
          </motion.h3>
          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mt-4 leading-tight"
          >
            Grow Your Wealth <br className="hidden md:block" /> With Our Plans
          </motion.h2>
        </motion.div>

        <motion.div
          variants={containerVariant}
          className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12"
        >
          {plans.map((plan, index) => (
            <motion.div
              key={index}
              className="border border-gray-100 rounded-xl p-8 flex flex-col items-center shadow-sm hover:shadow-lg bg-white transition-all"
              variants={cardVariant}
              custom={index}
              whileHover="hover"
              whileFocus="focus"
              whileTap={{ scale: 0.98 }}
              initial="hidden"
              animate="visible"
              tabIndex={0}
            >
              <div className="relative">
                <motion.div
                  whileHover={{ rotate: 5 }}
                  className="text-5xl font-bold text-gray-900 flex items-center gap-1"
                >
                  <span className="text-3xl">%</span>
                  {plan.percentage}
                  <span className="text-lg font-medium text-gray-500 ml-1">
                    /Daily
                  </span>
                </motion.div>
              </div>

              <motion.h4
                whileHover={{ color: "#047857" }}
                className="mt-4 text-2xl font-semibold text-gray-800"
              >
                {plan.title}
              </motion.h4>

              <motion.div
                whileHover={{ scale: 1.1, rotate: 5 }}
                className="mt-6 text-teal-700 text-5xl"
              >
                <FaRegCreditCard />
              </motion.div>

              <ul className="mt-8 text-gray-700 space-y-3 w-full text-lg">
                <li className="flex items-start">
                  <span className="text-teal-600 mr-2">✓</span>
                  <span>Minimum: <strong>{plan.min}</strong></span>
                </li>
                <li className="flex items-start">
                  <span className="text-teal-600 mr-2">✓</span>
                  <span>Maximum: <strong>{plan.max}</strong></span>
                </li>
                <li className="flex items-start">
                  <span className="text-teal-600 mr-2">✓</span>
                  <span>Percentage: <strong>{plan.percentage}%</strong></span>
                </li>
                <li className="flex items-start">
                  <span className="text-teal-600 mr-2">✓</span>
                  <span>Duration: <strong>{plan.duration}</strong></span>
                </li>
                <li className="flex items-start">
                  <span className="text-teal-600 mr-2">✓</span>
                  <span>Interval: <strong>{plan.interval}</strong></span>
                </li>
                <li className="flex items-start">
                  <span className="text-teal-600 mr-2">✓</span>
                  <span>Referral bonus: <strong>{plan.referral}</strong></span>
                </li>
              </ul>

              <motion.button
                whileHover={{ 
                  backgroundColor: "#047857",
                  color: "white",
                  scale: 1.05 
                }}
                whileFocus={{ 
                  backgroundColor: "#047857",
                  color: "white",
                  scale: 1.05,
                  boxShadow: "0 0 0 3px rgba(5, 150, 105, 0.5)"
                }}
                whileTap={{ scale: 0.95 }}
                className="mt-10 w-full bg-white border-2 border-teal-700 text-teal-800 hover:bg-teal-700 hover:text-white px-6 py-3 rounded-lg font-semibold text-lg transition-colors"
              >
                Get Started
              </motion.button>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>
    </section>
  );
}