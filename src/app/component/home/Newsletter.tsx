"use client";

import { motion } from "framer-motion";
import { FaPaperPlane } from "react-icons/fa";

export default function Newsletter() {
  return (
    <section className="bg-[#155E5A] py-14 px-6 md:px-12 text-white rounded-t-3xl">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center md:text-left"
        >
          <h2 className="text-3xl md:text-4xl font-bold">Newsletter</h2>
          <p className="mt-2 text-gray-200 text-sm md:text-base">
            Get weekly emails about our products and services
          </p>
        </motion.div>

        <motion.form
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="flex flex-col md:flex-row items-center gap-3 w-full md:max-w-md"
          onSubmit={(e) => {
            e.preventDefault();
            // Handle submission logic here
          }}
        >
          <input
            type="email"
            placeholder="Email Address"
            required
            className="flex-1 w-full rounded-full px-5 py-3 text-gray-800 focus:outline-none border border-gray-300"
          />
          <button
            type="submit"
            className="bg-lime-400 hover:bg-lime-500 text-black font-semibold px-6 py-3 rounded-full flex items-center gap-2 shadow-md transition"
          >
            Subscribe <FaPaperPlane />
          </button>
        </motion.form>
      </div>
    </section>
  );
}
