"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import Link from "next/link";

export const AboutHero = () => {
  return (
    <section className="bg-[#eaf5ef] py-20 px-6 md:px-16">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-10">
        {/* Text Section */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="space-y-4"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-[#003322]">
            About Us
          </h1>

          <div className="text-sm text-gray-600 flex items-center gap-2">
            <Link href={"/"}><span className="hover:text-[#003322] cursor-pointer">Home</span></Link>
            <span className="text-[#003322]">›</span>
            <span className="text-[#003322] font-medium">About Us</span>
          </div>
        </motion.div>

        {/* Image/Illustration Section */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Image
            src="/breadcrumb-thumb.png" // Replace with your actual image path
            alt="About Us Illustration"
            width={400}
            height={300}
            className="object-contain"
          />
        </motion.div>
      </div>
    </section>
  );
};

 