"use client";

import { businesses } from "@/types/businesses";
import { motion } from "framer-motion";
import Image from "next/image";
import { useState } from "react";

export default function OurBusinesses() {
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);

  return (
    <section className="py-20 bg-gradient-to-b from-white to-gray-50 text-gray-800">
      <div className="max-w-7xl mx-auto px-6">
        {/* Enhanced Header */}
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 mb-4"
          >
            <div className="w-8 h-px bg-green-600"></div>
            <span className="text-green-700 font-semibold uppercase tracking-wider text-sm">
              Our Businesses
            </span>
            <div className="w-8 h-px bg-green-600"></div>
          </motion.div>
          
          <motion.h3
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-4xl md:text-5xl font-bold mt-2 mb-4"
          >
            Strategic Solutions for <span className="text-green-700">Business Growth</span>
          </motion.h3>
          
          <motion.p
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed"
          >
            We deliver innovative solutions tailored to drive your business forward 
            in today&apos;s competitive landscape.
          </motion.p>
        </div>

        {/* Enhanced Cards Grid */}
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {businesses.map(({ id, title, description, image, icon: Icon }) => (
            <motion.div
              key={id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              whileHover={{ y: -8, scale: 1.02, transition: { duration: 0.3 } }}
              transition={{ 
                duration: 0.5, 
                delay: id * 0.1
              }}
              onHoverStart={() => setHoveredCard(id)}
              onHoverEnd={() => setHoveredCard(null)}
              className="group relative bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-500 border border-gray-100"
            >
              {/* Background Gradient Effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-white to-gray-50 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              
              {/* Image Container with Overlay */}
              <div className="relative h-56 w-full overflow-hidden">
                <Image
                  src={image}
                  alt={title}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-110"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
                <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-colors duration-300" />
                
                {/* Hover Indicator */}
                <div className={`absolute bottom-4 left-6 w-12 h-0.5 bg-green-600 transform transition-all duration-500 ${
                  hoveredCard === id ? 'w-16' : 'w-12'
                }`} />
              </div>

              {/* Content */}
              <div className="relative p-7">
                <div className="flex items-start gap-4 mb-4">
                  <div className="flex-shrink-0">
                    <div className="p-3 bg-green-50 rounded-xl group-hover:bg-green-100 transition-colors duration-300">
                      <Icon className="text-2xl text-green-700 transition-transform duration-300 group-hover:scale-110" />
                    </div>
                  </div>
                  <h4 className="text-xl font-bold text-gray-900 group-hover:text-green-800 transition-colors duration-300 pt-1">
                    {title}
                  </h4>
                </div>
                
                <p className="text-gray-600 leading-relaxed mb-6 line-clamp-3">
                  {description}
                </p>

                {/* CTA Button */}
                <motion.button
                  whileHover={{ x: 4 }}
                  transition={{ type: "spring", stiffness: 400, damping: 10 }}
                  className="flex items-center gap-2 text-green-700 font-semibold text-sm hover:text-green-800 transition-colors duration-300 group/btn"
                >
                  Learn More
                  <svg 
                    className="w-4 h-4 transition-transform duration-300 group-hover/btn:translate-x-1" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </motion.button>
              </div>

              {/* Border Glow Effect */}
              <div className="absolute inset-0 rounded-2xl border-2 border-transparent bg-gradient-to-r from-green-500/0 via-green-600/0 to-green-700/0 group-hover:from-green-500/10 group-hover:via-green-600/10 group-hover:to-green-700/10 transition-all duration-500" />
            </motion.div>
          ))}
        </div>

         
      </div>
    </section>
  );
}