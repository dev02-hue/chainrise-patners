'use client'

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiPlus, FiMinus } from 'react-icons/fi';

const faqs = [
  {
    question: "How do I create an account with Accilent Finance?",
    answer: "Creating an account is simple. Click on the 'Register' button at the top right corner of our website, fill in your details, verify your email address, and complete your profile setup. The entire process takes less than 5 minutes."
  },
  {
    question: "What are the minimum investment requirements?",
    answer: "Our Starter plan begins with a minimum investment of $100. We offer tiered investment plans to accommodate both new and experienced investors, with our Professional plan accepting up to $100,000."
  },
  {
    question: "How often are profits paid out?",
    answer: "Profits are paid daily, directly to your Accilent Finance wallet. You can withdraw these earnings or reinvest them to compound your returns."
  },
  {
    question: "Is my investment secure with Accilent Finance?",
    answer: "We employ bank-level security measures including 256-bit SSL encryption, two-factor authentication, and segregated client accounts. Your capital security is our top priority."
  },
  {
    question: "What withdrawal methods are available?",
    answer: "We support multiple withdrawal methods including bank transfers, cryptocurrency (BTC, ETH, USDT), and e-wallets. Withdrawals are processed within 24-48 hours during business days."
  },
  {
    question: "Can I change my investment plan later?",
    answer: "Yes, you can upgrade your plan at any time. Any additional funds you deposit will automatically follow the terms of your new selected plan."
  }
];

export default function FAQSection() {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  return (
    <section className="py-16 bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-4 max-w-4xl">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h2>
          <p className="text-lg text-gray-600">
            Find answers to common questions about our investment platform
          </p>
        </motion.div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className="overflow-hidden"
            >
              <motion.div
                onClick={() => toggleFAQ(index)}
                whileHover={{ backgroundColor: 'rgba(5, 150, 105, 0.05)' }}
                className={`p-6 rounded-xl cursor-pointer flex justify-between items-center ${activeIndex === index ? 'bg-teal-50 border border-teal-100' : 'bg-white border border-gray-200'}`}
              >
                <h3 className="text-lg font-semibold text-gray-800 pr-4">
                  {faq.question}
                </h3>
                {activeIndex === index ? (
                  <FiMinus className="text-teal-600 flex-shrink-0" />
                ) : (
                  <FiPlus className="text-gray-500 flex-shrink-0" />
                )}
              </motion.div>

              <AnimatePresence>
                {activeIndex === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: 'easeInOut' }}
                    className="overflow-hidden"
                  >
                    <div className="px-6 pb-6 pt-2 bg-white border-l border-r border-b border-gray-200 rounded-b-xl">
                      <p className="text-gray-600 leading-relaxed">
                        {faq.answer}
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>

       
      </div>
    </section>
  );
}