'use client'

import { motion, Variants } from 'framer-motion'
import Image from 'next/image'
 import { FaArrowRight } from 'react-icons/fa'
import { useRouter } from 'next/navigation'  

export default function HeroSection() {
  const router = useRouter()   

  const fadeUp: Variants = {
    hidden: { y: 40, opacity: 0 },
    show: (i: number) => ({
      y: 0,
      opacity: 1,
      transition: { 
        delay: 0.15 * i, 
        duration: 0.6, 
        ease: "easeOut"
      },
    }),
  }

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-[#f1f9f5] via-white to-[#e0f2ec] py-12 sm:py-16 md:py-20 lg:py-28">
     
      
      <div className="container mx-auto flex max-w-7xl flex-col-reverse items-center gap-10 px-4 sm:px-6 md:flex-row md:gap-8 lg:gap-16">
        {/* ——————————————————————————  LEFT CONTENT —————————————————————————— */}
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.25 }}
          className="w-full md:w-1/2"
        >
          <motion.h1
            custom={0}
            variants={fadeUp}
            className="mb-4 text-3xl font-extrabold leading-tight text-teal-900 sm:text-4xl md:mb-6 md:text-5xl lg:text-6xl"
          >
            Let your money{' '}
            <span className="relative whitespace-nowrap">
              <span className="relative z-10">work for you</span>
              <span className="absolute bottom-1 left-0 z-0 h-3 w-full bg-teal-200/60 sm:bottom-2 sm:h-4"></span>
            </span>
          </motion.h1>

          <motion.p
            custom={1}
            variants={fadeUp}
            className="mb-8 max-w-prose text-base leading-relaxed text-gray-700 sm:text-lg sm:leading-relaxed md:mb-10"
          >
            Join us at ChainRise-Patners, where the extraordinary becomes
            the norm. Embark on this journey with us, and let&#39;s shape a
            brighter, more prosperous future together.
          </motion.p>

          {/* Buttons - FIXED */}
          <motion.div
            custom={2}
            variants={fadeUp}
            className="flex flex-wrap items-center gap-3 sm:gap-4"
          >
            {/* Get Started Button */}
            <motion.div
              whileHover={{ 
                scale: 1.03,
                backgroundColor: '#115e59'
              }}
              whileTap={{ scale: 0.97 }}
              className="group inline-flex items-center gap-2 rounded-lg bg-teal-800 px-5 py-2.5 text-sm font-semibold text-white shadow-lg transition-colors hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-300 focus:ring-offset-2 sm:px-6 sm:py-3 sm:text-base cursor-pointer"
              onClick={() => router.push('/signup')}
            >
              Get Started 
              <FaArrowRight className="transition-transform group-hover:translate-x-1" />
            </motion.div>

            {/* Login Button */}
            <motion.div
              whileHover={{ 
                scale: 1.03,
                backgroundColor: '#f0fdfa'
              }}
              whileTap={{ scale: 0.97 }}
              className="inline-flex items-center gap-2 rounded-lg border-2 border-teal-800 bg-white px-5 py-2.5 text-sm font-semibold text-teal-800 transition-colors hover:bg-teal-50 focus:outline-none focus:ring-2 focus:ring-teal-200 focus:ring-offset-2 sm:px-6 sm:py-3 sm:text-base cursor-pointer"
              onClick={() => router.push('/signin')}
            >
              Login
            </motion.div>
          </motion.div>
        </motion.div>

        {/* ——————————————————————————  RIGHT IMAGE —————————————————————————— */}
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
          viewport={{ once: true, amount: 0.25 }}
          className="relative flex w-full justify-center md:w-1/2"
        >
          {/* Circular white frame with responsive sizing */}
          <div className="relative flex h-[280px] w-[280px] items-center justify-center rounded-full bg-white shadow-xl sm:h-[340px] sm:w-[340px] md:h-[380px] md:w-[380px] lg:h-[460px] lg:w-[460px]">
            {/* Animated triangle backdrop */}
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
                backgroundColor: '#a3e635',
              }}
            />

            {/* Person image with responsive sizing */}
            <Image
              src="/hero_thumb_1_1.png"
              alt="Smiling professional giving thumbs‑up"
              width={260}
              height={360}
              className="relative z-10 h-auto w-48 rounded-lg object-cover shadow-md sm:w-52 md:w-56 lg:w-64"
              priority
            />

            {/* Decorative teal circle */}
            <motion.span 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.8, duration: 0.5 }}
              className="absolute right-4 top-4 h-10 w-10 rounded-full bg-teal-800 shadow-md sm:right-6 sm:top-6 sm:h-12 sm:w-12 md:h-14 md:w-14"
            />
            
            {/* Decorative diamond */}
            <motion.span 
              initial={{ scale: 0, rotate: 0 }}
              animate={{ scale: 1, rotate: 45 }}
              transition={{ delay: 1, duration: 0.5 }}
              className="absolute left-4 bottom-12 block h-12 w-12 border-2 border-teal-800 bg-white/30 shadow-md backdrop-blur-sm sm:left-6 sm:bottom-14 sm:h-14 sm:w-14"
            />

            {/* Floating badge for added professionalism */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 1.2, duration: 0.5 }}
              className="absolute -bottom-4 right-8 rounded-full bg-white px-4 py-2 text-xs font-bold text-teal-900 shadow-lg sm:right-12 sm:text-sm"
            >
              Trusted by 10K+ users
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}