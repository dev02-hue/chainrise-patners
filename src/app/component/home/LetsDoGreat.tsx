"use client";
import Image from 'next/image';
import { motion, useInView } from "framer-motion";
import { useEffect, useState, useRef } from "react";
import { 
 
  Line, 
  AreaChart, 
  Area, 
  ResponsiveContainer, 
  YAxis, 
  XAxis, 
  Tooltip 
} from 'recharts';

// Mock data for the growth chart
const growthData = [
  { month: 'Jan', clients: 15000 },
  { month: 'Feb', clients: 22000 },
  { month: 'Mar', clients: 35000 },
  { month: 'Apr', clients: 45000 },
  { month: 'May', clients: 58000 },
  { month: 'Jun', clients: 72000 },
  { month: 'Jul', clients: 86704 },
];

const LetsDoGreat = () => {
  const [count, setCount] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });

  const target = 86704;
  const duration = 3000; // milliseconds

  useEffect(() => {
    if (isInView) {
      setIsVisible(true);
      
      let startTimestamp: number;
      const step = (timestamp: number) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        
        // Easing function for smooth animation
        const easeOutQuart = 1 - Math.pow(1 - progress, 4);
        setCount(Math.floor(easeOutQuart * target));
        
        if (progress < 1) {
          window.requestAnimationFrame(step);
        }
      };
      
      window.requestAnimationFrame(step);
    }
  }, [isInView, duration, target]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white/95 backdrop-blur-sm border border-gray-200 rounded-lg p-3 shadow-lg">
          <p className="text-gray-900 font-semibold">{`${label}`}</p>
          <p className="text-teal-600">
            <span className="font-medium">Clients:</span> {payload[0].value.toLocaleString()}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <section 
      ref={sectionRef}
      className="relative overflow-hidden bg-gradient-to-br from-gray-900 to-[#002E22] text-white rounded-3xl my-12 md:my-16 shadow-2xl"
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.15)_1px,transparent_0)] bg-[length:20px_20px]"></div>
      </div>

      <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between p-6 md:p-12 lg:p-16">
        {/* Left Content */}
        <motion.div 
          className="w-full lg:w-1/2 space-y-6 lg:space-y-8"
          initial={{ opacity: 0, x: -30 }}
          animate={isVisible ? { opacity: 1, x: 0 } : { opacity: 0, x: -30 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <div className="space-y-4">
            <motion.span
              initial={{ opacity: 0, y: 20 }}
              animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="inline-block px-4 py-2 bg-teal-500/20 border border-teal-400/30 rounded-full text-teal-300 text-sm font-medium backdrop-blur-sm"
            >
              Join Our Success Story
            </motion.span>
            
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.7, delay: 0.3 }}
              className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight"
            >
              Let&apos;s Achieve{' '}
              <span className="bg-gradient-to-r from-teal-400 to-lime-400 bg-clip-text text-transparent">
                Greatness
              </span>{' '}
              Together
            </motion.h2>
          </div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={isVisible ? { opacity: 1 } : { opacity: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="text-lg md:text-xl text-gray-300 leading-relaxed max-w-2xl"
          >
            Join <span className="font-semibold text-teal-300">ChainRise-Patners</span> today and become part of our global community of successful investors. 
            Start your journey toward financial freedom with our proven investment strategies.
          </motion.p>

          {/* Stats Grid */}
          <motion.div 
            className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6 pt-4"
            initial={{ opacity: 0, y: 20 }}
            animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.6, delay: 0.7 }}
          >
            <div className="text-center p-4 bg-white/5 rounded-xl backdrop-blur-sm border border-white/10">
              <div className="text-2xl md:text-3xl font-bold text-lime-400">98%</div>
              <div className="text-sm text-gray-400 mt-1">Success Rate</div>
            </div>
            <div className="text-center p-4 bg-white/5 rounded-xl backdrop-blur-sm border border-white/10">
              <div className="text-2xl md:text-3xl font-bold text-lime-400">24/7</div>
              <div className="text-sm text-gray-400 mt-1">Support</div>
            </div>
            <div className="text-center p-4 bg-white/5 rounded-xl backdrop-blur-sm border border-white/10">
              <div className="text-2xl md:text-3xl font-bold text-lime-400">5★</div>
              <div className="text-sm text-gray-400 mt-1">Rated Platform</div>
            </div>
          </motion.div>
        </motion.div>

        {/* Right Content */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0, x: 30 }}
          animate={isVisible ? { scale: 1, opacity: 1, x: 0 } : { scale: 0.9, opacity: 0, x: 30 }}
          transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
          className="w-full lg:w-2/5 mt-8 lg:mt-0"
        >
          <div className="bg-gradient-to-br from-lime-400 to-teal-500 text-gray-900 p-6 md:p-8 rounded-2xl shadow-2xl border border-lime-300/50">
            {/* Client Avatars */}
            <div className="flex justify-center items-center mb-6">
              <div className="flex -space-x-3">
                {[1, 2, 3, 4, 5].map((item) => (
                  <div key={item} className="relative">
                    <Image
                      src={`/client-img-1-${item}.png`}
                      alt={`Client ${item}`}
                      width={48}
                      height={48}
                      className="rounded-full border-2 border-white shadow-lg"
                    />
                    {item === 5 && (
                      <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center">
                        <span className="text-white text-xs font-bold">+{count > 86700 ? (count - 86700).toLocaleString() : '0'}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Animated Counter */}
            <div className="text-center mb-6">
              <motion.div 
                className="text-4xl md:text-5xl font-bold mb-2"
                key={count}
                initial={{ scale: 1.2 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200 }}
              >
                {count.toLocaleString()}+
              </motion.div>
              <p className="text-gray-700 font-medium">Global Community Members</p>
            </div>

            {/* Growth Chart */}
            <div className="h-32 mb-6">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={growthData}>
                  <defs>
                    <linearGradient id="colorClients" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#84cc16" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#84cc16" stopOpacity={0.1}/>
                    </linearGradient>
                  </defs>
                  <XAxis 
                    dataKey="month" 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#4b5563', fontSize: 12 }}
                  />
                  <YAxis 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#4b5563', fontSize: 12 }}
                    width={40}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Area 
                    type="monotone" 
                    dataKey="clients" 
                    stroke="#84cc16" 
                    strokeWidth={3}
                    fill="url(#colorClients)" 
                    dot={{ fill: '#84cc16', strokeWidth: 2, r: 4 }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="clients" 
                    stroke="#ffffff" 
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 6, fill: '#ffffff' }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* CTA Button */}
            <motion.button 
              className="w-full bg-gray-900 text-white py-4 px-6 rounded-xl font-semibold text-lg hover:bg-gray-800 transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center gap-3 group"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <span>Start Your Journey</span>
              <motion.svg 
                className="w-5 h-5 group-hover:translate-x-1 transition-transform"
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </motion.svg>
            </motion.button>

            {/* Trust Badge */}
            <div className="text-center mt-4">
              <p className="text-sm text-gray-600 flex items-center justify-center gap-2">
                <span>🔒</span>
                Secure & Trusted Platform
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default LetsDoGreat;