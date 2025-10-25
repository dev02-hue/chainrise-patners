'use client'

import { motion, Variants } from 'framer-motion'
import { FaArrowRight, FaChartLine, FaShieldAlt, FaPiggyBank } from 'react-icons/fa'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'

export default function HeroSection() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState(0)
  const [displayedText, setDisplayedText] = useState('')
  const [currentIndex, setCurrentIndex] = useState(0)

  const fullText = "ChainRise-Patners provides innovative financial services designed to help you achieve your personal and business goals with confidence."

  // Typing effect for the description
  useEffect(() => {
    if (currentIndex < fullText.length) {
      const timeout = setTimeout(() => {
        setDisplayedText(fullText.slice(0, currentIndex + 1))
        setCurrentIndex(currentIndex + 1)
      }, 20) // Adjust typing speed here (lower = faster)
      
      return () => clearTimeout(timeout)
    }
  }, [currentIndex, fullText])

  // Reset typing effect when tab changes
  useEffect(() => {
    setDisplayedText('')
    setCurrentIndex(0)
  }, [activeTab])

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

  const tabs = [
    {
      title: "Wealth Growth Strategies",
      description: "Watch your capital multiply through our expertly managed high-yield investment opportunities.",
      icon: <FaChartLine className="text-teal-600" />,
    },
    {
      title: "Fortified Banking Protection",
      description: "Experience peace of mind with military-grade encryption and 24/7 fraud prevention systems.",
      icon: <FaShieldAlt className="text-teal-600" />,
    },
    {
      title: "Automated Wealth Building",
      description: "Transform your saving habits into lasting wealth with intelligent, goal-oriented savings programs.",
      icon: <FaPiggyBank className="text-teal-600" />,
    }
  ]

  const handleButtonClick = (path: string) => {
    router.push(path)
  }

  return (
    <section className="relative overflow-hidden bg-white px-4 py-12 sm:px-6 sm:py-16 md:py-20 lg:py-20 xl:py-32">
      <div className="mx-auto w-full max-w-7xl">
        <div className="flex flex-col items-center gap-8 md:flex-row md:items-stretch md:gap-6 lg:gap-12 xl:gap-16">
          {/* Left Content */}
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.25 }}
            className="w-full md:w-1/2"
          >
            <motion.div
              custom={0}
              variants={fadeUp}
              className="mb-4 inline-flex items-center rounded-full bg-teal-100 px-3 py-1 text-xs font-medium text-teal-800 sm:px-4 sm:py-2 sm:text-sm"
            >
              <span className="mr-1 h-2 w-2 rounded-full bg-teal-600 sm:mr-2"></span>
              Trusted by 10,000+ clients
            </motion.div>

            <motion.h1
              custom={1}
              variants={fadeUp}
              className="mb-4 text-2xl font-bold leading-tight text-gray-900 xs:text-3xl sm:text-4xl md:mb-6 md:text-[2.8rem] lg:text-[3.2rem] xl:text-[3.5rem]"
            >
              Modern <span className="text-teal-600">Financial</span> Solutions for Your Future
            </motion.h1>

            <motion.div
              custom={2}
              variants={fadeUp}
              className="mb-6 max-w-prose text-base leading-relaxed text-gray-600 sm:text-lg sm:leading-relaxed md:mb-8"
            >
              <p className="min-h-[60px]">
                {displayedText}
                <span className="ml-1 inline-block h-4 w-0.5 bg-teal-600 animate-pulse"></span>
              </p>
            </motion.div>

            {/* Tabs Navigation - Stack on small screens */}
            <motion.div
              custom={3}
              variants={fadeUp}
              className="mb-6 flex flex-col border-b border-gray-200 sm:flex-row"
            >
              {tabs.map((tab, index) => (
                <button
                  key={index}
                  onClick={() => setActiveTab(index)}
                  className={`flex items-center gap-1 px-3 py-2 text-xs font-medium transition-colors sm:gap-2 sm:px-4 sm:py-3 sm:text-sm ${activeTab === index ? 'border-b-2 border-teal-600 text-teal-600' : 'text-gray-500 hover:text-gray-700'}`}
                  type="button"
                >
                  <span className="text-sm sm:text-base">{tab.icon}</span>
                  <span>{tab.title}</span>
                </button>
              ))}
            </motion.div>

            {/* Active Tab Content */}
            <motion.div
              custom={4}
              variants={fadeUp}
              className="mb-6"
            >
              <h3 className="mb-1 text-lg font-semibold text-gray-900 sm:text-xl">{tabs[activeTab].title}</h3>
              <p className="text-sm text-gray-600 sm:text-base">{tabs[activeTab].description}</p>
            </motion.div>

            {/* Buttons - Stack on small screens */}
            <motion.div
              custom={5}
              variants={fadeUp}
              className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:gap-4"
            >
              <button
                onClick={() => handleButtonClick('/signup')}
                className="group inline-flex items-center justify-center gap-2 rounded-lg bg-teal-600 px-4 py-2 text-sm font-semibold text-white shadow-md transition-colors hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-300 focus:ring-offset-2 sm:px-6 sm:py-3 sm:text-base"
                type="button"
              >
                Get Started
                <FaArrowRight className="text-xs transition-transform group-hover:translate-x-1 sm:text-sm" />
              </button>

              <button
                onClick={() => handleButtonClick('/signin')}
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 shadow-sm transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-teal-200 focus:ring-offset-2 sm:px-6 sm:py-3 sm:text-base"
                type="button"
              >
                Login
              </button>
            </motion.div>
          </motion.div>

          {/* Right Content - Replaced image with animated cards */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ 
              opacity: 1, 
              x: 0,
              transition: { 
                duration: 0.7, 
                ease: "easeOut",
                delay: 0.2
              } 
            }}
            viewport={{ once: true, amount: 0.25 }}
            className="relative mt-8 w-full xs:mt-10 md:mt-0 md:w-1/2"
          >
            <div className="relative h-full min-h-[300px] rounded-xl bg-gradient-to-br from-teal-50 to-white p-4 shadow-xl sm:min-h-[350px] sm:p-6 md:min-h-[400px] md:p-8">
              {/* Main content area with animated financial metrics */}
              <div className="flex h-full flex-col justify-center space-y-6 rounded-lg bg-white p-6 shadow-md">
                {/* Animated metrics cards */}
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="space-y-4"
                >
                  <div className="text-center">
                    <motion.h3 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.8 }}
                      className="mb-2 text-lg font-semibold text-gray-900 sm:text-xl"
                    >
                      Your Financial Dashboard
                    </motion.h3>
                    <motion.p 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 1 }}
                      className="text-sm text-gray-600"
                    >
                      Real-time insights and growth tracking
                    </motion.p>
                  </div>

                  {/* Metric cards */}
                  <div className="grid grid-cols-2 gap-4">
                    <motion.div
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 1.2 }}
                      className="rounded-lg bg-teal-50 p-3 text-center"
                    >
                      <div className="text-lg font-bold text-teal-600">15.2%</div>
                      <div className="text-xs text-gray-600">Avg. Return</div>
                    </motion.div>
                    
                    <motion.div
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 1.4 }}
                      className="rounded-lg bg-teal-50 p-3 text-center"
                    >
                      <div className="text-lg font-bold text-teal-600">24/7</div>
                      <div className="text-xs text-gray-600">Support</div>
                    </motion.div>
                  </div>

                  {/* Progress bar */}
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: "100%" }}
                    transition={{ delay: 1.6, duration: 1 }}
                    className="mt-4"
                  >
                    <div className="mb-1 flex justify-between text-sm">
                      <span className="text-gray-600">Portfolio Growth</span>
                      <span className="font-medium text-teal-600">+12.8%</span>
                    </div>
                    <div className="h-2 rounded-full bg-gray-200">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: "65%" }}
                        transition={{ delay: 1.8, duration: 1.5 }}
                        className="h-full rounded-full bg-teal-600"
                      />
                    </div>
                  </motion.div>
                </motion.div>
              </div>

              {/* Floating card 1 */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.8, duration: 0.5 }}
                className="absolute -left-2 top-4 rounded-lg bg-white p-2 shadow-lg xs:-left-3 xs:top-6 xs:p-3 sm:-left-4 sm:top-8 sm:p-4"
              >
                <div className="text-xs font-medium text-gray-900 xs:text-sm">24/7 Support</div>
                <div className="text-[0.65rem] text-gray-500 xs:text-xs">Always here to help</div>
              </motion.div>

              {/* Floating card 2 */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 1, duration: 0.5 }}
                className="absolute -right-2 bottom-4 rounded-lg bg-teal-600 p-2 text-white shadow-lg xs:-right-3 xs:bottom-6 xs:p-3 sm:-right-4 sm:bottom-8 sm:p-4"
              >
                <div className="text-xs font-medium xs:text-sm">99.9% Uptime</div>
                <div className="text-[0.65rem] opacity-80 xs:text-xs">Reliable service</div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}