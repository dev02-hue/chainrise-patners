"use client";

import React, { useState } from "react";
import { motion  } from "framer-motion";
import { FaStar, FaChevronLeft, FaChevronRight, FaPlay, FaPause } from "react-icons/fa";
import Image from "next/image";

const testimonials = [
  {
    id: 1,
    name: "James Laurence",
    role: "Senior Portfolio Manager",
    company: "WealthFront Capital",
    image: "/premium_photo-1678703870782-918c21aac2b2.avif",
    mainImage: "/premium_photo-1678703870782-918c21aac2b2.avif",
    rating: 5,
    text: "This is the best investment platform ever made in history. I've seen my returns grow consistently by 28% quarter over quarter. The analytics and reporting features are unparalleled.",
    stats: { returns: "28%", timeframe: "QoQ Growth" }
  },
  {
    id: 2,
    name: "Sarah Chen",
    role: "CTO",
    company: "TechGrowth Inc",
    image: "/halil-ibrahim-cetinkaya-G59cSsFxL0M-unsplash.jpg",
    mainImage: "/halil-ibrahim-cetinkaya-G59cSsFxL0M-unsplash.jpg",
    rating: 5,
    text: "ChainRise-Partners transformed how we manage our corporate investments. The platform's intuitive interface and real-time insights helped us optimize our investment strategy.",
    stats: { returns: "42%", timeframe: "Annual ROI" }
  },
  {
    id: 3,
    name: "Marcus Rodriguez",
    role: "Fund Manager",
    company: "BlueOcean Investments",
    image: "/nartan-buyukyildiz-qo1SX1HDPnM-unsplash.jpg",
    mainImage: "/nartan-buyukyildiz-qo1SX1HDPnM-unsplash.jpg",
    rating: 4,
    text: "Outstanding customer support and robust security features. We've moved 60% of our assets to ChainRise-Partners and the results have been exceptional.",
    stats: { returns: "35%", timeframe: "Since Migration" }
  },
  {
    id: 4,
    name: "Emily Watson",
    role: "Financial Advisor",
    company: "PrimeWealth Group",
    image: "/colton-sturgeon-mE5oHZrWN-Q-unsplash.jpg",
    mainImage: "/colton-sturgeon-mE5oHZrWN-Q-unsplash.jpg",
    rating: 5,
    text: "The automated reporting and compliance features save us 20+ hours weekly. Our clients love the transparency and daily profit distributions.",
    stats: { returns: "31%", timeframe: "Client Portfolio" }
  }
];

const StarRating = ({ rating }: { rating: number }) => {
  return (
    <div className="flex gap-1">
      {[...Array(5)].map((_, i) => (
        <motion.div
          key={i}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: i * 0.1 }}
        >
          {i < rating ? (
            <FaStar className="w-5 h-5 text-yellow-400 fill-current" />
          ) : (
            <FaStar className="w-5 h-5 text-gray-300 fill-current" />
          )}
        </motion.div>
      ))}
    </div>
  );
};

export const TestimonialSection = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  const nextTestimonial = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  const goToTestimonial = (index: number) => {
    setCurrentIndex(index);
  };

  // Auto-play functionality
  React.useEffect(() => {
    if (!isAutoPlaying) return;

    const interval = setInterval(() => {
      nextTestimonial();
    }, 5000);

    return () => clearInterval(interval);
  }, [isAutoPlaying, currentIndex]);

  const currentTestimonial = testimonials[currentIndex];

  return (
    <section className="bg-gradient-to-br from-slate-50 to-emerald-50/30 py-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-emerald-100/20 via-transparent to-transparent" />
      <div className="absolute bottom-0 left-0 w-72 h-72 bg-emerald-200/10 rounded-full blur-3xl -translate-x-1/2 translate-y-1/2" />
      
      <div className="max-w-7xl mx-auto relative z-10">
        {/* Enhanced Heading */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-white/80 backdrop-blur-sm border border-emerald-200 shadow-sm mb-6"
          >
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            <span className="text-sm font-semibold tracking-wider text-emerald-700 uppercase">
              Trusted by Industry Leaders
            </span>
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
          </motion.div>
          
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
            What Our <span className="text-emerald-600">Clients Say</span>
          </h2>
          
          <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Discover why top financial professionals choose ChainRise-Partners for their investment needs
          </p>
        </motion.div>

        {/* Main Testimonial Content */}
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Client Image with Stats */}
            <motion.div
              key={`image-${currentTestimonial.id}`}
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="relative"
            >
              <div className="relative rounded-3xl overflow-hidden shadow-2xl">
                <Image
                  src={currentTestimonial.mainImage}
                  alt={currentTestimonial.name}
                  width={500}
                  height={500}
                  className="w-full h-[500px] object-cover"
                />
                
                {/* Stats Overlay */}
                <div className="absolute bottom-6 left-6 right-6 bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-lg">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-emerald-600 mb-1">
                      {currentTestimonial.stats.returns}
                    </div>
                    <div className="text-sm font-medium text-gray-600">
                      {currentTestimonial.stats.timeframe}
                    </div>
                  </div>
                </div>
              </div>

              {/* Background Decorative Element */}
              <div className="absolute -top-6 -left-6 w-24 h-24 bg-emerald-400/10 rounded-full -z-10" />
              <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-emerald-600/5 rounded-full -z-10" />
            </motion.div>

            {/* Testimonial Content */}
            <motion.div
              key={`content-${currentTestimonial.id}`}
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="relative"
            >
              <div className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100 relative">
                {/* Rating */}
                <div className="mb-6">
                  <StarRating rating={currentTestimonial.rating} />
                </div>

                {/* Quote */}
                <blockquote className="text-2xl leading-relaxed text-gray-700 mb-8 font-light">
                  &apos;{currentTestimonial.text}&apos;
                </blockquote>

                {/* Client Info */}
                <div className="flex items-center gap-4 mb-6">
                  <div className="relative">
                    <Image
                      src={currentTestimonial.image}
                      alt={currentTestimonial.name}
                      width={60}
                      height={60}
                      className="rounded-full border-4 border-emerald-100"
                    />
                    <div className="absolute bottom-0 right-0 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white" />
                  </div>
                  <div>
                    <div className="font-bold text-gray-900 text-lg">
                      {currentTestimonial.name}
                    </div>
                    <div className="text-gray-600">{currentTestimonial.role}</div>
                    <div className="text-sm text-emerald-600 font-medium">
                      {currentTestimonial.company}
                    </div>
                  </div>
                </div>

                {/* Navigation Controls */}
                <div className="flex items-center justify-between pt-6 border-t border-gray-100">
                  <div className="flex items-center gap-4">
                    <button
                      onClick={prevTestimonial}
                      className="p-3 rounded-full bg-gray-100 hover:bg-emerald-100 text-gray-600 hover:text-emerald-600 transition-all duration-300 hover:scale-110"
                    >
                      <FaChevronLeft className="w-4 h-4" />
                    </button>
                    
                    <button
                      onClick={() => setIsAutoPlaying(!isAutoPlaying)}
                      className="p-3 rounded-full bg-gray-100 hover:bg-emerald-100 text-gray-600 hover:text-emerald-600 transition-all duration-300 hover:scale-110"
                    >
                      {isAutoPlaying ? <FaPause className="w-4 h-4" /> : <FaPlay className="w-4 h-4" />}
                    </button>
                    
                    <button
                      onClick={nextTestimonial}
                      className="p-3 rounded-full bg-gray-100 hover:bg-emerald-100 text-gray-600 hover:text-emerald-600 transition-all duration-300 hover:scale-110"
                    >
                      <FaChevronRight className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Progress Dots */}
                  <div className="flex gap-2">
                    {testimonials.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => goToTestimonial(index)}
                        className={`w-3 h-3 rounded-full transition-all duration-300 ${
                          index === currentIndex
                            ? 'bg-emerald-600 w-8'
                            : 'bg-gray-300 hover:bg-gray-400'
                        }`}
                      />
                    ))}
                  </div>
                </div>

                {/* Quotation Mark */}
                <div className="absolute top-8 right-8 text-emerald-50 text-8xl -z-10">
                  &ldquo;
                </div>
              </div>
            </motion.div>
          </div>

          {/* Trust Badges */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mt-16 text-center"
          >
            <p className="text-gray-500 text-sm font-medium mb-6">TRUSTED BY COMPANIES WORLDWIDE</p>
            <div className="flex flex-wrap justify-center items-center gap-8 opacity-60">
              {['Fortune 500', 'Forbes', 'Bloomberg', 'Financial Times', 'Wall Street Journal'].map((company) => (
                <div key={company} className="text-gray-400 font-semibold text-lg">
                  {company}
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};