"use client";

import { businesses } from "@/types/businesses";
import { motion } from "framer-motion";
import Image from "next/image";
 
 
export default function OurBusinesses() {
  return (
    <section className="py-16 bg-white text-gray-800">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-12">
          <motion.h2
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-green-700 font-semibold uppercase tracking-wide text-sm"
          >
            Our Businesses
          </motion.h2>
          <motion.h3
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-3xl md:text-4xl font-bold mt-2"
          >
            Strategic Solutions for Business Growth
          </motion.h3>
        </div>

        <div className="grid gap-10 md:grid-cols-3">
          {businesses.map(({ id, title, description, image, icon: Icon }) => (
            <motion.div
              key={id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: id * 0.1 }}
              className="bg-gray-50 rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300"
            >
              <div className="relative h-48 w-full">
                <Image
                  src={image}
                  alt={title}
                  layout="fill"
                  objectFit="cover"
                  className="rounded-t-xl"
                />
              </div>
              <div className="p-6">
                <div className="flex items-center gap-3 mb-3 text-green-700">
                  <Icon className="text-xl" />
                  <h4 className="text-xl font-semibold">{title}</h4>
                </div>
                <p className="text-sm text-gray-600">{description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
