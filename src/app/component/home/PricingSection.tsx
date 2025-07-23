"use client";

import { motion, Variants } from "framer-motion";
import { FaRegCreditCard, FaChartLine, FaCoins, FaGem } from "react-icons/fa";
import Image from "next/image";
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
    image: "/premium_photo-1682309799578-6e685bacd4e1.avif", // Path to your image
    icon: <FaCoins className="text-yellow-500" />,
    features: ["Ideal for beginners", "Low risk", "Quick returns"],
    popular: false,
  },
  {
    title: "Advanced",
    percentage: 8,
    min: "$5,000.00",
    max: "$11,500.00",
    duration: "Four Days",
    interval: "Daily",
    referral: "10%",
    image: "/premium_photo-1682309799578-6e685bacd4e1.avif", // Path to your image
    icon: <FaChartLine className="text-blue-500" />,
    features: ["Balanced growth", "Medium risk", "Priority support"],
    popular: true,
  },
  {
    title: "Professional",
    percentage: 10,
    min: "$11,500.00",
    max: "$100,000.00",
    duration: "Five Days",
    interval: "Daily",
    referral: "10%",
    image: "/premium_photo-1682309799578-6e685bacd4e1.avif", // Path to your image
    icon: <FaGem className="text-purple-500" />,
    features: ["High returns", "VIP services", "Personal advisor"],
    popular: false,
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
      className="relative bg-gradient-to-b from-gray-50 to-white py-20 px-4 md:px-12 lg:px-24 overflow-hidden"
      id="pricing"
    >
      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-full h-full opacity-5">
        <div className="absolute top-20 left-10 w-40 h-40 bg-teal-300 rounded-full filter blur-3xl"></div>
        <div className="absolute bottom-10 right-10 w-60 h-60 bg-purple-300 rounded-full filter blur-3xl"></div>
      </div>

      <div className="max-w-7xl mx-auto relative">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "0px 0px -100px 0px" }}
          variants={containerVariant}
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
              className="text-base md:text-lg text-teal-600 font-medium tracking-wider uppercase"
            >
              Investment Plans
            </motion.h3>
            <motion.h2
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mt-4 leading-tight"
            >
              Tailored Investment <br className="hidden md:block" /> Solutions
            </motion.h2>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="mt-6 text-lg text-gray-600 max-w-3xl mx-auto"
            >
              Choose the perfect plan that matches your financial goals and risk
              appetite. Our transparent pricing ensures you know exactly what
              you&apos;re getting.
            </motion.p>
          </motion.div>

          <motion.div
            variants={containerVariant}
            className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12"
          >
            {plans.map((plan, index) => (
              <motion.div
                key={index}
                className={`relative border border-gray-200 rounded-2xl p-8 flex flex-col items-center shadow-sm hover:shadow-xl bg-white transition-all ${
                  plan.popular ? "ring-2 ring-teal-500" : ""
                }`}
                variants={cardVariant}
                custom={index}
                whileHover="hover"
                whileFocus="focus"
                whileTap={{ scale: 0.98 }}
                initial="hidden"
                animate="visible"
                tabIndex={0}
              >
                {plan.popular && (
                  <div className="absolute -top-3 right-6 bg-teal-500 text-white text-xs font-bold px-4 py-1 rounded-full">
                    MOST POPULAR
                  </div>
                )}

                {/* Plan Image - Professional Integration */}
                <div className="relative w-full h-40 mb-6 rounded-lg overflow-hidden">
                  <Image
                    src={plan.image}
                    alt={`${plan.title} investment plan`}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    priority={index === 0}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                  <div className="absolute bottom-4 left-4 text-white">
                    <h3 className="text-2xl font-bold">{plan.title}</h3>
                    <p className="text-teal-300 font-medium">
                      {plan.percentage}% Daily Returns
                    </p>
                  </div>
                </div>

                <div className="relative w-full">
                  <div className="text-5xl font-bold text-gray-900 flex items-center gap-1">
                    <span className="text-3xl">%</span>
                    {plan.percentage}
                    <span className="text-lg font-medium text-gray-500 ml-1">
                      /Daily
                    </span>
                  </div>

                  <div className="mt-6 flex flex-col space-y-4">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-teal-100 rounded-lg text-teal-600">
                        {plan.icon}
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-800">
                          Investment Range
                        </h4>
                        <p className="text-gray-600">
                          {plan.min} - {plan.max}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-teal-100 rounded-lg text-teal-600">
                        <FaRegCreditCard />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-800">
                          Duration
                        </h4>
                        <p className="text-gray-600">{plan.duration}</p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-8">
                    <h5 className="font-semibold text-gray-800 mb-3">
                      Key Features:
                    </h5>
                    <ul className="space-y-2">
                      {plan.features.map((feature, i) => (
                        <li key={i} className="flex items-start">
                          <span className="text-teal-600 mr-2">✓</span>
                          <span className="text-gray-700">{feature}</span>
                        </li>
                      ))}
                      <li className="flex items-start">
                        <span className="text-teal-600 mr-2">✓</span>
                        <span className="text-gray-700">
                          Referral bonus: <strong>{plan.referral}</strong>
                        </span>
                      </li>
                    </ul>
                  </div>

                  <motion.button
                    whileHover={{
                      backgroundColor: "#047857",
                      color: "white",
                      scale: 1.05,
                    }}
                    whileFocus={{
                      backgroundColor: "#047857",
                      color: "white",
                      scale: 1.05,
                      boxShadow: "0 0 0 3px rgba(5, 150, 105, 0.5)",
                    }}
                    whileTap={{ scale: 0.95 }}
                    className={`mt-10 w-full ${
                      plan.popular
                        ? "bg-teal-600 text-white"
                        : "bg-white border-2 border-teal-600 text-teal-700"
                    } px-6 py-3 rounded-lg font-semibold text-lg transition-colors`}
                  >
                    {plan.popular ? "Get Premium Plan" : "Get Started"}
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            viewport={{ once: true }}
            className="mt-16 text-center text-gray-600"
          >
            {/* <p>
              Need help choosing?{" "}
              <a
                href="#contact"
                className="text-teal-600 hover:text-teal-800 font-medium underline"
              >
                Contact our advisors
              </a>
            </p> */}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}