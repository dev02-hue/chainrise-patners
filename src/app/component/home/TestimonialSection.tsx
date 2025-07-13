"use client";

import React from "react";
import { motion } from "framer-motion";
import { FaStar, FaRegStar } from "react-icons/fa";
import Image from "next/image";

export const TestimonialSection = () => {
  return (
    <section
      id="testimonials"
      className="bg-white py-24 px-4 sm:px-6 lg:px-8 relative"
    >
      <div className="max-w-7xl mx-auto">
        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 text-sm font-semibold tracking-wide uppercase text-emerald-600">
            <span>✨</span> Clients Testimonial
          </div>
          <h2 className="mt-2 text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-800">
            Your Business Goals
          </h2>
        </motion.div>

        {/* Testimonial Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 items-center"
        >
          {/* Client Image */}
          <div className="flex justify-center md:justify-start">
            <Image
              src="/testimonial-1-1.png"
              alt="Client Image"
              width={300}
              height={300}
              className="rounded-2xl shadow-lg object-cover"
            />
          </div>

          {/* Quote Block */}
          <div className="bg-emerald-50 rounded-2xl p-8 shadow-md relative">
            {/* Stars */}
            <div className="flex mb-4 text-yellow-400">
              <FaStar />
              <FaStar />
              <FaStar />
              <FaStar />
              <FaRegStar />
            </div>

            {/* Quote */}
            <p className="text-lg text-gray-700 mb-6">
              This is the best investment platform ever made in history. I highly
              recommend people to use this platform
            </p>

            {/* Client Info */}
            <div className="flex items-center gap-4">
              <Image
                src="/O5Ht1F2KlfAjBREUv3pLusp7XqFVUcEau5jgXFDl.png"
                alt="James Laurence"
                width={48}
                height={48}
                className="rounded-full"
              />
              <div>
                <p className="font-semibold text-gray-900">James Laurence</p>
                <p className="text-sm text-gray-500">Client</p>
              </div>
            </div>

            {/* Quotation Mark Icon */}
            <div className="absolute bottom-6 right-6 text-emerald-100 text-6xl">
              &ldquo;&rdquo;
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

 