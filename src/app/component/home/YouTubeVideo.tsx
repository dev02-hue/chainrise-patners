'use client'

import { motion, Variants } from 'framer-motion'
import { useState } from 'react'

export default function YouTubeVideo() {
  const [isLoaded, setIsLoaded] = useState(false)
  const videoId = '11jPbVO8ook'
  
  // Properly typed variants
  const fadeIn: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut" as const // Explicitly typed as const
      }
    }
  }

  return (
    <section className="py-16 md:py-24 lg:py-28 bg-gray-50">
      <div className="container mx-auto px-6 max-w-7xl">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "0px 0px -100px 0px" }}
          variants={fadeIn}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Watch Our Introduction
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Learn more about our services and how we can help you achieve your financial goals.
          </p>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeIn}
          className="relative aspect-video w-full max-w-4xl mx-auto bg-gray-200 rounded-xl overflow-hidden shadow-xl"
        >
          {!isLoaded && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-16 h-16 border-4 border-gray-300 border-t-teal-600 rounded-full animate-spin"></div>
            </div>
          )}
          
          <iframe
            src={`https://www.youtube.com/embed/${videoId}?autoplay=0&rel=0&modestbranding=1`}
            title="Accilent Finance Limited Introduction"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className={`w-full h-full ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
            onLoad={() => setIsLoaded(true)}
            loading="lazy"
          />
          
          {!isLoaded && (
            <button 
              className="absolute inset-0 w-full h-full flex items-center justify-center"
              aria-label="Load video"
              onClick={() => setIsLoaded(true)}
            >
              <div className="w-20 h-20 bg-teal-600 bg-opacity-90 rounded-full flex items-center justify-center hover:bg-opacity-100 transition-all">
                <svg className="w-10 h-10 text-white ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </button>
          )}
        </motion.div>

         
      </div>
    </section>
  )
}