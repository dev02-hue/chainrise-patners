'use client'

import { AdvantageItem, AdvantagesSectionProps } from '@/types/advantages'
import { motion } from 'framer-motion'
import Image from 'next/image'

interface MediaRendererProps {
  media: AdvantageItem['media']
  className?: string
}

function MediaRenderer({ media, className = '' }: MediaRendererProps) {
  if (media.type === 'video') {
    return (
      <div className={`relative w-full h-full ${className}`}>
        <iframe
          src={media.src}
          className="w-full h-full rounded-lg"
          title={media.alt || "Video content"}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    )
  }

  return (
    <div className={`relative w-full h-full ${className}`}>
      <Image
        src={media.src}
        alt={media.alt || ''}
        fill
        className="object-cover rounded-lg"
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
      />
    </div>
  )
}

function AdvantageCard({ advantage, index }: { advantage: AdvantageItem; index: number }) {
  return (
    <motion.div 
      className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200 h-full flex flex-col"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      viewport={{ once: true }}
    >
      {/* Media Container */}
      <div className="relative h-48 sm:h-56 md:h-64 lg:h-56 xl:h-64 w-full">
        <MediaRenderer media={advantage.media} />
      </div>

      {/* Content */}
      <div className="p-4 sm:p-6 flex-1 flex flex-col">
        <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 sm:mb-3">
          {advantage.title}
        </h3>
        
        <p className="text-gray-600 text-sm sm:text-base leading-relaxed flex-1">
          {advantage.description}
        </p>

        {advantage.cta && (
          <a
            href={advantage.cta.href}
            className="inline-flex items-center text-teal-600 font-semibold text-sm sm:text-base hover:text-teal-700 transition-colors mt-3 sm:mt-4"
          >
            {advantage.cta.text}
            <svg 
              className="w-4 h-4 ml-2" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </a>
        )}
      </div>
    </motion.div>
  )
}

export default function OurAdvantage({ advantages, className = '' }: AdvantagesSectionProps) {
  return (
    <section className={`py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8 bg-white ${className}`}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div 
          className="text-center mb-8 sm:mb-12 lg:mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <motion.span
            className="inline-block text-sm font-semibold text-teal-600 uppercase tracking-wider mb-2 sm:mb-3"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
          >
            Our Advantage
          </motion.span>
          
          <motion.h2
            className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 max-w-4xl mx-auto"
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            viewport={{ once: true }}
          >
            Empowering Business Through Excellence
          </motion.h2>
        </motion.div>

        {/* Advantages Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
          {advantages.map((advantage, index) => (
            <AdvantageCard
              key={advantage.id}
              advantage={advantage}
              index={index}
            />
          ))}
        </div>

         
      </div>
    </section>
  )
}