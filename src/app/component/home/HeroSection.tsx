'use client'

import { motion, Variants } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { FaArrowRight } from 'react-icons/fa'

export default function HeroSection() {
  // Properly typed variants
  const fadeUp: Variants = {
    hidden: { y: 40, opacity: 0 },
    show: (i: number) => ({
      y: 0,
      opacity: 1,
      transition: { 
        delay: 0.15 * i, 
        duration: 0.6, 
        ease: "easeOut" // Changed from number[] to string
      },
    }),
  }

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-[#f1f9f5] to-[#e0f2ec] py-20 md:py-28 lg:py-32">
      <div className="container mx-auto flex max-w-7xl flex-col-reverse items-center gap-16 px-6 md:flex-row md:gap-10 lg:gap-20">
        {/* ——————————————————————————  LEFT  —————————————————————————— */}
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.3 }}
          className="w-full md:w-1/2"
        >
          <motion.h1
            custom={0}
            variants={fadeUp}
            className="mb-6 text-4xl font-extrabold leading-tight text-teal-900 sm:text-5xl lg:text-6xl"
          >
            Let your money
            <br className="hidden lg:block" /> work for you
          </motion.h1>

          <motion.p
            custom={1}
            variants={fadeUp}
            className="mb-10 max-w-prose text-lg leading-relaxed text-gray-700"
          >
            Join us at Accilent Finance Limited, where the extraordinary becomes
            the norm. Embark on this journey with us, and let&#39;s shape a
            brighter, more prosperous future. Your potential is limitless, and
            with Accilent Finance Limited, the sky is just the beginning!
          </motion.p>

          {/* Buttons */}
          <motion.div
            custom={2}
            variants={fadeUp}
            className="flex flex-wrap items-center gap-4 sm:gap-6"
          >
            <Link href="/register" passHref legacyBehavior>
              <motion.a
                whileHover={{ 
                  scale: 1.05,
                  backgroundColor: '#115e59'
                }}
                whileTap={{ scale: 0.97 }}
                className="group inline-flex items-center gap-2 rounded-lg bg-teal-800 px-6 py-3 text-base font-semibold text-white shadow-lg hover:bg-teal-700 focus:outline-none focus:ring-4 focus:ring-teal-300 sm:px-8"
              >
                Get Started 
                <FaArrowRight className="transition-transform group-hover:translate-x-1" />
              </motion.a>
            </Link>

            <Link href="/login" passHref legacyBehavior>
              <motion.a
                whileHover={{ 
                  scale: 1.05,
                  backgroundColor: '#f0fdfa'
                }}
                whileTap={{ scale: 0.97 }}
                className="inline-flex items-center gap-2 rounded-lg border-2 border-teal-800 bg-white px-6 py-3 text-base font-semibold text-teal-800 transition hover:bg-teal-50 focus:outline-none focus:ring-4 focus:ring-teal-200 sm:px-8"
              >
                Login
              </motion.a>
            </Link>
          </motion.div>
        </motion.div>

        {/* ——————————————————————————  RIGHT  —————————————————————————— */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          whileInView={{ 
            scale: 1, 
            opacity: 1, 
            transition: { 
              duration: 0.7, 
              ease: "easeOut",
              delay: 0.2
            } 
          }}
          viewport={{ once: true, amount: 0.3 }}
          className="relative flex w-full justify-center md:w-1/2"
        >
          {/* Circular white frame */}
          <div className="relative flex h-[340px] w-[340px] items-center justify-center rounded-full bg-white shadow-2xl md:h-[420px] md:w-[420px] lg:h-[500px] lg:w-[500px]">
            {/* Lime‑green triangle backdrop */}
            <motion.div
              initial={{ rotate: -10 }}
              animate={{ rotate: 10 }}
              transition={{
                duration: 8,
                repeat: Infinity,
                repeatType: 'reverse',
                ease: "easeInOut"
              }}
              className="absolute -z-10 h-[70%] w-[70%] origin-center"
              style={{
                clipPath: 'polygon(50% 0%, 100% 100%, 0% 100%)',
                backgroundColor: '#c1fa00',
              }}
            />

            {/* Person image */}
            <Image
              src="/hero_thumb_1_1.png"
              alt="Smiling professional giving thumbs‑up"
              width={260}
              height={360}
              className="relative z-10 h-auto w-52 rounded-lg object-cover shadow-md md:w-60 lg:w-72"
              priority
            />

            {/* Decorative teal circle */}
            <motion.span 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.8, duration: 0.5 }}
              className="absolute right-8 top-8 h-14 w-14 rounded-full bg-teal-900 shadow-md"
            />
            
            {/* Decorative diamond */}
            <motion.span 
              initial={{ scale: 0, rotate: 0 }}
              animate={{ scale: 1, rotate: 45 }}
              transition={{ delay: 1, duration: 0.5 }}
              className="absolute left-8 bottom-16 block h-16 w-16 border-2 border-teal-900 bg-white/30 shadow-md backdrop-blur-sm"
            />
          </div>
        </motion.div>
      </div>
    </section>
  )
}