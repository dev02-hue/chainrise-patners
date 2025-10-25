"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  FaRegChartBar,
  FaRegLightbulb,
  FaRegHandshake,
  FaTools,
  FaArrowRight,
  FaPlay,
  FaPause,
} from "react-icons/fa";

interface Step {
  id: number;
  title: string;
  description: string;
  Icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  features: string[];
  stats?: { value: string; label: string };
}

const steps: Step[] = [
  {
    id: 1,
    title: "Comprehensive Market Analysis",
    description:
      "Our process begins with a thorough analysis of the markets we invest in – real estate, agriculture, crypto mining, and stock trading. Advanced data analytics and expert insights allow us to zero‑in on high‑potential opportunities.",
    Icon: FaRegChartBar,
    features: [
      "Real-time market scanning",
      "AI-powered trend analysis",
      "Risk assessment modeling",
      "Competitive landscape mapping"
    ],
    stats: { value: "99.8%", label: "Accuracy Rate" }
  },
  {
    id: 2,
    title: "Strategic Investment Planning",
    description:
      "Once potential opportunities are identified, we craft a strategic investment plan that balances risk and return. Diversified portfolios leverage strengths across sectors for steady growth.",
    Icon: FaRegLightbulb,
    features: [
      "Portfolio optimization",
      "Risk-adjusted return modeling",
      "Sector diversification",
      "Liquidity management"
    ],
    stats: { value: "28%", label: "Avg. ROI" }
  },
  {
    id: 3,
    title: "Active Management & Optimization",
    description:
      "Real‑time monitoring and algorithm‑based optimisation keep our portfolios in peak condition, capitalising on emerging opportunities while mitigating risk.",
    Icon: FaTools,
    features: [
      "Algorithmic rebalancing",
      "24/7 portfolio monitoring",
      "Dynamic risk adjustment",
      "Performance analytics"
    ],
    stats: { value: "24/7", label: "Monitoring" }
  },
  {
    id: 4,
    title: "Transparent Reporting & Client Engagement",
    description:
      "We pride ourselves on transparency. Detailed performance reports and an always‑on support team keep clients fully in the loop with real-time insights and personalized support.",
    Icon: FaRegHandshake,
    features: [
      "Real-time dashboards",
      "Detailed performance reports",
      "Dedicated account managers",
      "Quarterly strategy reviews"
    ],
    stats: { value: "100%", label: "Transparency" }
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 60, scale: 0.9 },
  show: { 
    opacity: 1, 
    y: 0, 
    scale: 1,
    transition: {
      type: "spring" as const,
      stiffness: 100,
      damping: 15
    }
  },
};

export const WorkProcess: React.FC = () => {
  const [activeStep, setActiveStep] = useState(1);
  const [autoPlay, setAutoPlay] = useState(true);

  // Auto-advance steps
  React.useEffect(() => {
    if (!autoPlay) return;

    const interval = setInterval(() => {
      setActiveStep((prev) => (prev % steps.length) + 1);
    }, 4000);

    return () => clearInterval(interval);
  }, [autoPlay]);

  const currentStep = steps.find(step => step.id === activeStep);

  return (
    <section className="relative bg-gradient-to-br from-slate-50 via-white to-emerald-50/30 py-28 px-4 sm:px-6 lg:px-8 overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-emerald-100/40 via-transparent to-transparent" />
      <div className="absolute top-1/4 -right-24 w-96 h-96 bg-emerald-200/10 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 -left-24 w-96 h-96 bg-blue-200/10 rounded-full blur-3xl" />
      
      {/* Grid Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(5,150,105,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(5,150,105,0.03)_1px,transparent_1px)] bg-[size:64px_64px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_50%,black,transparent)]" />

      <div className="relative max-w-7xl mx-auto">
        {/* Enhanced Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-20"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-white/80 backdrop-blur-sm border border-emerald-200 shadow-sm mb-8"
          >
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            <span className="text-sm font-semibold tracking-wider text-emerald-700 uppercase">
              Systematic Approach
            </span>
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6"
          >
            Our <span className="text-emerald-600">Proven Process</span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed"
          >
            A systematic, data-driven approach to unlocking your business&apos;s full potential through strategic investment management
          </motion.p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
          {/* Steps Grid */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            {steps.map((step) => (
              <motion.button
                key={step.id}
                variants={itemVariants}
                onClick={() => setActiveStep(step.id)}
                whileHover={{ 
                  y: -8,
                  scale: 1.02,
                  transition: { type: "spring" as const, stiffness: 400, damping: 25 }
                }}
                whileTap={{ scale: 0.98 }}
                className={`relative text-left p-8 rounded-3xl border-2 transition-all duration-500 group overflow-hidden ${
                  activeStep === step.id
                    ? "bg-white border-emerald-500 shadow-2xl shadow-emerald-500/20"
                    : "bg-white/70 border-gray-200/80 shadow-lg hover:shadow-xl hover:border-emerald-300"
                }`}
              >
                {/* Background Gradient */}
                <div className={`absolute inset-0 rounded-3xl transition-all duration-500 ${
                  activeStep === step.id
                    ? "bg-gradient-to-br from-emerald-50/80 to-white"
                    : "bg-gradient-to-br from-white to-gray-50/80"
                }`} />

                {/* Step Number */}
                <div className={`absolute top-6 right-6 font-black text-7xl tracking-tight transition-all duration-500 ${
                  activeStep === step.id
                    ? "text-emerald-500/10 group-hover:text-emerald-500/20"
                    : "text-gray-200 group-hover:text-gray-300"
                }`}>
                  {step.id.toString().padStart(2, "0")}
                </div>

                {/* Icon */}
                <div className={`relative w-16 h-16 rounded-2xl flex items-center justify-center mb-6 transition-all duration-500 ${
                  activeStep === step.id
                    ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/25"
                    : "bg-emerald-100 text-emerald-600 group-hover:bg-emerald-200"
                }`}>
                  <step.Icon className="text-2xl" />
                </div>

                {/* Content */}
                <h3 className={`text-xl font-bold mb-3 relative transition-colors duration-300 ${
                  activeStep === step.id ? "text-gray-900" : "text-gray-800"
                }`}>
                  {step.title}
                </h3>

                <p className="text-gray-600 text-sm leading-relaxed mb-4 line-clamp-2">
                  {step.description}
                </p>

                {/* Stats */}
                {step.stats && (
                  <div className="flex items-center gap-2 mt-4">
                    <div className={`px-3 py-1 rounded-full text-sm font-semibold ${
                      activeStep === step.id
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-gray-100 text-gray-600"
                    }`}>
                      {step.stats.value}
                    </div>
                    <span className="text-sm text-gray-500">{step.stats.label}</span>
                  </div>
                )}

                {/* Active Indicator */}
                {activeStep === step.id && (
                  <motion.div
                    layoutId="activeStep"
                    className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 to-green-400 rounded-b-3xl"
                    transition={{ type: "spring" as const, stiffness: 300, damping: 30 }}
                  />
                )}
              </motion.button>
            ))}
          </motion.div>

          {/* Detailed View */}
          <motion.div
            key={activeStep}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="bg-white rounded-3xl shadow-2xl p-8 border border-gray-100 sticky top-8"
          >
            {currentStep && (
              <div className="space-y-6">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-emerald-500 rounded-xl flex items-center justify-center text-white text-lg font-bold">
                      {currentStep.id.toString().padStart(2, "0")}
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900">
                        {currentStep.title}
                      </h3>
                      <p className="text-emerald-600 font-medium">
                        Step {currentStep.id} of {steps.length}
                      </p>
                    </div>
                  </div>

                  {/* Auto-play Control */}
                  <button
                    onClick={() => setAutoPlay(!autoPlay)}
                    className="p-3 rounded-full bg-gray-100 hover:bg-emerald-100 text-gray-600 hover:text-emerald-600 transition-all duration-300"
                  >
                    {autoPlay ? <FaPause className="w-4 h-4" /> : <FaPlay className="w-4 h-4" />}
                  </button>
                </div>

                <p className="text-gray-600 text-lg leading-relaxed">
                  {currentStep.description}
                </p>

                {/* Features List */}
                <div className="space-y-3">
                  <h4 className="font-semibold text-gray-900 text-lg">Key Features:</h4>
                  <div className="grid gap-3">
                    {currentStep.features.map((feature, index) => (
                      <motion.div
                        key={feature}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex items-center gap-3 p-3 rounded-xl bg-emerald-50/50 border border-emerald-100"
                      >
                        <div className="w-2 h-2 bg-emerald-500 rounded-full" />
                        <span className="text-gray-700">{feature}</span>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* CTA */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full bg-gradient-to-r from-emerald-600 to-green-500 text-white py-4 rounded-xl font-semibold flex items-center justify-center gap-3 hover:shadow-lg hover:shadow-emerald-500/25 transition-all duration-300 mt-8"
                >
                  Learn More About This Step
                  <FaArrowRight className="w-4 h-4" />
                </motion.button>
              </div>
            )}
          </motion.div>
        </div>

        {/* Progress Indicator */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="flex justify-center items-center gap-4 mt-16"
        >
          {steps.map((step) => (
            <button
              key={step.id}
              onClick={() => setActiveStep(step.id)}
              className={`flex flex-col items-center gap-2 group ${
                activeStep === step.id ? "text-emerald-600" : "text-gray-400"
              }`}
            >
              <div className={`w-3 h-3 rounded-full transition-all duration-300 ${
                activeStep === step.id
                  ? "bg-emerald-500 scale-125"
                  : "bg-gray-300 group-hover:bg-gray-400"
              }`} />
              <span className="text-xs font-medium">Step {step.id}</span>
            </button>
          ))}
        </motion.div>
      </div>
    </section>
  );
};