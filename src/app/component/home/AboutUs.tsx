"use client";

import Image from "next/image";
import { motion } from "framer-motion";

const AboutUs = () => {
  return (
    <section className="flex flex-col md:flex-row items-center justify-between gap-8 px-6 md:px-12 py-12 max-w-7xl mx-auto">
      {/* Text Content */}
      <motion.div
        initial={{ opacity: 0, x: -40 }}
        whileInView={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
        className="w-full md:w-1/2 space-y-6"
      >
        <div className="text-sm font-semibold text-lime-700 flex items-center gap-2">
          <span>🪴</span>
          About Us
        </div>

        <h2 className="text-3xl md:text-4xl font-bold text-[#003322]">
          Achieve Your Business Goals
        </h2>

        <p className="text-gray-600 text-base leading-relaxed">
          Welcome to ChainRise-Patners Investment Platform, your premier
          gateway to diversified investment opportunities. At Accilent Finance
          Limited, we are committed to maximizing your wealth through strategic
          investments in four dynamic sectors: real estate, agriculture, crypto
          mining, and stock trading.
        </p>

        <p className="text-gray-600 text-base leading-relaxed">
          ChainRise-Patners was founded with a vision to empower
          investors by providing access to a wide array of lucrative markets.
          Our team comprises seasoned professionals with deep expertise in each
          of our focus areas. By combining industry knowledge with cutting-edge
          technology, we aim to deliver superior returns while managing risk
          effectively.
        </p>

        <button className="bg-[#003322] text-white px-6 py-3 rounded-lg hover:bg-[#004533] transition font-medium">
          Read More →
        </button>
      </motion.div>

      {/* Right Side Image */}
      <motion.div
        initial={{ opacity: 0, x: 40 }}
        whileInView={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
        className="w-full md:w-1/2"
      >
        <div className="rounded-2xl overflow-hidden shadow-lg">
          <Image
            src="/berkay-samiloglu-CL8uRS9TkR4-unsplash.jpg" // Replace with actual path or import
            alt="About Accilent"
            width={600}
            height={400}
            className="object-cover w-full h-full"
          />
        </div>
      </motion.div>
    </section>
  );
};

export default AboutUs;
