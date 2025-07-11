'use client'

 
import { advantages } from "@/types/advantages"
import { motion } from "framer-motion"
import Image from "next/image"

export default function OurAdvantage() {
  return (
    <section className="py-16 px-4 md:px-12 bg-white">
      <div className="text-center mb-12">
        <motion.h2 
          className="text-sm font-semibold text-teal-700"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          Our Advantage
        </motion.h2>
        <motion.h3
          className="text-3xl md:text-4xl font-bold text-gray-900"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          Empowering Business The Excellence
        </motion.h3>
      </div>

      <div className="grid gap-10 md:grid-cols-2">
        {advantages.map((adv, index) => (
          <motion.div 
            key={index}
            className="bg-white shadow rounded-lg overflow-hidden"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: index * 0.2 }}
            viewport={{ once: true }}
          >
            <div className="h-56 w-full overflow-hidden">
  <Image
    src={adv.image}
    alt={adv.title}
    width={1200}          // pick any large logical width
    height={448}          // keep the same aspect‑ratio you need
    className="h-full w-full object-cover"  // makes it fill the wrapper
    sizes="(max-width: 768px) 100vw, 50vw"  // responsive optimisation (optional)
    priority              // keep if this image is LCP‑critical
  />
</div>

            <div className="p-6">
              <h4 className="text-xl font-semibold text-gray-800 mb-2">{adv.title}</h4>
              <p className="text-gray-600 text-sm">{adv.description}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  )
}
