'use client'

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiPlus, FiMinus, FiSearch  } from 'react-icons/fi';

const faqs = [
  {
    id: 1,
    question: "How do I create an account with ChainRise-Partners?",
    answer: "Creating an account is simple. Click on the 'Get started' button at the top right corner of our website, fill in your details. The entire process takes less than 5 minutes.",
    category: "account"
  },
  {
    id: 2,
    question: "What are the minimum investment requirements?",
    answer: "Our Starter plan begins with a minimum investment of $100. We offer tiered investment plans to accommodate both new and experienced investors, with our Professional plan accepting up to $100,000.",
    category: "investment"
  },
  {
    id: 3,
    question: "How often are profits paid out?",
    answer: "Profits are paid daily, directly to your ChainRise-Partners wallet. You can withdraw these earnings or reinvest them to compound your returns.",
    category: "payouts"
  },
  {
    id: 4,
    question: "Is my investment secure with ChainRise-Partners?",
    answer: "We employ bank-level security measures including 256-bit SSL encryption, two-factor authentication, and segregated client accounts. Your capital security is our top priority.",
    category: "security"
  },
  {
    id: 5,
    question: "What withdrawal methods are available?",
    answer: "We support multiple withdrawal methods including bank transfers, cryptocurrency (BTC, ETH, USDT), and e-wallets. Withdrawals are processed within 24-48 hours during business days.",
    category: "withdrawals"
  },
  {
    id: 6,
    question: "Can I change my investment plan later?",
    answer: "Yes, you can upgrade your plan at any time. Any additional funds you deposit will automatically follow the terms of your new selected plan.",
    category: "investment"
  },
  {
    id: 7,
    question: "What makes ChainRise-Partners different from other platforms?",
    answer: "We combine cutting-edge technology with personalized service, offering transparent fee structures, daily profit distributions, and dedicated account managers for all our clients.",
    category: "general"
  },
  {
    id: 8,
    question: "Are there any hidden fees?",
    answer: "No hidden fees. We operate with complete transparency. Our fee structure is clearly outlined during the signup process and in your client dashboard.",
    category: "investment"
  }
];

const categories = [
  { id: 'all', name: 'All Questions' },
  { id: 'account', name: 'Account' },
  { id: 'investment', name: 'Investment' },
  { id: 'security', name: 'Security' },
  { id: 'withdrawals', name: 'Withdrawals' },
  { id: 'payouts', name: 'Payouts' }
];

export default function FAQSection() {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');

  const toggleFAQ = (index: number) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  const filteredFAQs = faqs.filter(faq => {
    const matchesSearch = faq.question.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         faq.answer.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = activeCategory === 'all' || faq.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <section className="py-20 bg-gradient-to-br from-slate-50 to-teal-50/30">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Enhanced Header */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-teal-100/50 border border-teal-200 mb-6">
            <div className="w-2 h-2 bg-teal-600 rounded-full"></div>
            <span className="text-teal-700 font-medium text-sm">FAQ</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Frequently Asked <span className="text-teal-600">Questions</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Everything you need to know about our investment platform. Can&apos;t find the answer you&apos;re looking for?
          </p>
        </motion.div>

        {/* Search Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="max-w-2xl mx-auto mb-12"
        >
          <div className="relative">
            <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-xl" />
            <input
              type="text"
              placeholder="Search questions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-6 py-4 bg-white border border-gray-200 rounded-2xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all duration-300 shadow-sm hover:shadow-md"
            />
          </div>
        </motion.div>

        {/* Category Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex flex-wrap justify-center gap-3 mb-12"
        >
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setActiveCategory(category.id)}
              className={`px-6 py-3 rounded-full font-medium transition-all duration-300 ${
                activeCategory === category.id
                  ? 'bg-teal-600 text-white shadow-lg shadow-teal-600/25'
                  : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200 hover:border-teal-200'
              }`}
            >
              {category.name}
            </button>
          ))}
        </motion.div>

        {/* FAQ Items */}
        <div className="max-w-4xl mx-auto">
          {filteredFAQs.length > 0 ? (
            <div className="space-y-4">
              {filteredFAQs.map((faq, index) => (
                <motion.div
                  key={faq.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  className="overflow-hidden"
                >
                  <motion.div
                    onClick={() => toggleFAQ(faq.id)}
                    whileHover={{ 
                      backgroundColor: 'rgba(5, 150, 105, 0.03)',
                      borderColor: 'rgba(5, 150, 105, 0.2)'
                    }}
                    className={`p-8 rounded-2xl cursor-pointer flex justify-between items-start gap-6 transition-all duration-300 ${
                      activeIndex === faq.id 
                        ? 'bg-teal-50 border-2 border-teal-200 shadow-lg' 
                        : 'bg-white border border-gray-200 shadow-sm hover:shadow-md'
                    }`}
                  >
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-gray-900 mb-2 leading-relaxed">
                        {faq.question}
                      </h3>
                      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-100 border border-teal-200">
                        <span className="text-teal-700 text-sm font-medium capitalize">
                          {faq.category}
                        </span>
                      </div>
                    </div>
                    <div className={`p-3 rounded-full transition-all duration-300 ${
                      activeIndex === faq.id 
                        ? 'bg-teal-600 text-white' 
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      {activeIndex === faq.id ? (
                        <FiMinus className="text-lg" />
                      ) : (
                        <FiPlus className="text-lg" />
                      )}
                    </div>
                  </motion.div>

                  <AnimatePresence>
                    {activeIndex === faq.id && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.4, ease: 'easeInOut' }}
                        className="overflow-hidden"
                      >
                        <div className="px-8 pb-8 pt-4 bg-white border-x-2 border-b-2 border-teal-200 rounded-b-2xl">
                          <p className="text-gray-600 leading-relaxed text-lg">
                            {faq.answer}
                          </p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-16"
            >
              <div className="text-gray-400 text-6xl mb-4">?</div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-2">No results found</h3>
              <p className="text-gray-600">Try adjusting your search or filter criteria</p>
            </motion.div>
          )}
        </div>

         
      </div>
    </section>
  );
}