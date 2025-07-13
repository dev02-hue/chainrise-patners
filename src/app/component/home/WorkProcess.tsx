"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  FaRegChartBar,
  FaRegLightbulb,
  
  FaRegHandshake,
  FaTools,
//   FaRegCogs,
} from "react-icons/fa";

interface Step {
  id: number;
  title: string;
  description: string;
  Icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
}

// 1️⃣  Data-driven approach – tweak copy here without touching markup
const steps: Step[] = [
  {
    id: 1,
    title: "Comprehensive Market Analysis",
    description:
      "Our process begins with a thorough analysis of the markets we invest in – real estate, agriculture, crypto mining, and stock trading. Advanced data analytics and expert insights allow us to zero‑in on high‑potential opportunities.",
    Icon: FaRegChartBar,
  },
  {
    id: 2,
    title: "Strategic Investment Planning",
    description:
      "Once potential opportunities are identified, we craft a strategic investment plan that balances risk and return. Diversified portfolios leverage strengths across sectors for steady growth.",
    Icon: FaRegLightbulb,
  },
  {
    id: 3,
    title: "Active Management & Optimisation",
    description:
      "Real‑time monitoring and algorithm‑based optimisation keep our portfolios in peak condition, capitalising on emerging opportunities while mitigating risk.",
    Icon: FaTools,
  },
  {
    id: 4,
    title: "Transparent Reporting & Client Engagement",
    description:
      "We pride ourselves on transparency. Detailed performance reports and an always‑on support team keep clients fully in the loop.",
    Icon: FaRegHandshake,
  },
];

// 2️⃣  Motion variants
const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 40 },
  show: { opacity: 1, y: 0 },
};

// 3️⃣  Main component
export  const WorkProcess: React.FC = () => {
  return (
    <section
      id="work-process"
      className="relative bg-[#eef6f2] py-24 px-4 sm:px-6 lg:px-8 overflow-hidden"
    >
      {/* Decorative background blob */}
      <motion.div
        aria-hidden
        initial={{ opacity: 0, scale: 0.8 }}
        whileInView={{ opacity: 0.15, scale: 1.1 }}
        transition={{ duration: 4, ease: "easeOut" }}
        className="pointer-events-none absolute inset-y-0 right-1/2 w-[120%] -translate-x-1/2 rounded-full bg-gradient-to-br from-green-200 via-emerald-100 to-white blur-3xl"
      />

      {/* Section heading */}
      <div className="relative mx-auto max-w-3xl text-center mb-16">
        <motion.span
          initial={{ opacity: 0, y: -10 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 text-sm font-semibold tracking-wide uppercase text-emerald-600"
        >
          {/* Tiny icon */}
          <span className="text-lg">
            <FaTools />
          </span>
          Work Process
        </motion.span>

        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mt-4 text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-800"
        >
          Unleash Business&apos;s Hidden Potential
        </motion.h2>
      </div>

      {/* Steps Grid */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.2 }}
        className="relative grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto"
      >
        {steps.map(({ id, title, description, Icon }) => (
          <motion.article
            key={id}
            variants={itemVariants}
            whileHover={{ y: -4, rotate: 0.2 }}
            className="relative bg-white rounded-2xl shadow-lg p-8 pt-14 flex flex-col h-full group"
          >
            {/* Large faint number as a watermark */}
            <span className="pointer-events-none select-none absolute top-6 right-6 font-extrabold text-7xl tracking-tight text-gray-100 group-hover:text-gray-200 transition-colors duration-300">
              {id.toString().padStart(2, "0")}
            </span>

            {/* Icon */}
            <span className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-emerald-50 text-emerald-600 text-3xl mb-6 shadow group-hover:shadow-md transition-shadow duration-300">
              <Icon />
            </span>

            <h3 className="text-xl font-semibold mb-4 text-gray-800 leading-tight">
              {title}
            </h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              {description}
            </p>
          </motion.article>
        ))}
      </motion.div>
    </section>
  );
};

 