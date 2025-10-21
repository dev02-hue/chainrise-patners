'use client'

import { motion, Variants } from 'framer-motion'
import Image from 'next/image'
import { FaArrowRight, FaChartLine, FaShieldAlt, FaPiggyBank } from 'react-icons/fa'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function HeroSection() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState(0)

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
  image: "/kanchanara-9pCV2MB65y8-unsplash.jpg"
},
{
  title: "Fortified Banking Protection",
  description: "Experience peace of mind with military-grade encryption and 24/7 fraud prevention systems.",
  icon: <FaShieldAlt className="text-teal-600" />,
  image: "/kanchanara-9pCV2MB65y8-unsplash.jpg"
},
{
  title: "Automated Wealth Building",
  description: "Transform your saving habits into lasting wealth with intelligent, goal-oriented savings programs.",
  icon: <FaPiggyBank className="text-teal-600" />,
  image: "/kanchanara-9pCV2MB65y8-unsplash.jpg"
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

            <motion.p
              custom={2}
              variants={fadeUp}
              className="mb-6 max-w-prose text-base leading-relaxed text-gray-600 sm:text-lg sm:leading-relaxed md:mb-8"
            >
              ChainRise-Patners provides innovative financial services designed to help you achieve your personal and business goals with confidence.
            </motion.p>

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

          {/* Right Image - Hidden on smallest screens if needed */}
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
              {/* Main image with floating elements */}
              <div className="h-full w-full overflow-hidden rounded-lg">
                <Image
                  src={tabs[activeTab].image}
                  alt={tabs[activeTab].title}
                  fill
                  className="object-cover"
                  priority
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 50vw"
                />
              </div>

              {/* Floating card 1 - Adjust position and size for small screens */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.8, duration: 0.5 }}
                className="absolute -left-2 top-4 rounded-lg bg-white p-2 shadow-lg xs:-left-3 xs:top-6 xs:p-3 sm:-left-4 sm:top-8 sm:p-4"
              >
                <div className="text-xs font-medium text-gray-900 xs:text-sm">24/7 Support</div>
                <div className="text-[0.65rem] text-gray-500 xs:text-xs">Always here to help</div>
              </motion.div>

              {/* Floating card 2 - Adjust position and size for small screens */}
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