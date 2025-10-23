"use client";

import { motion } from "framer-motion";
import { FiLock, FiEye, FiShare2, FiDatabase, FiUser, FiShield } from "react-icons/fi";

const PrivacyPolicy = () => {
  const privacySections = [
    {
      icon: FiUser,
      title: "Information We Collect",
      content: "We collect necessary information to provide our services, including personal details, investment preferences, and transaction history. This data helps us personalize your experience and ensure platform security."
    },
    {
      icon: FiLock,
      title: "Data Protection",
      content: "Your data is protected using bank-level encryption and security measures. We implement strict access controls and regularly audit our systems to prevent unauthorized access to your personal information."
    },
    {
      icon: FiShare2,
      title: "Third-Party Sharing",
      content: "We do not sell your personal data. Limited information may be shared with verified partners for essential services like payment processing, always under strict confidentiality agreements."
    },
    {
      icon: FiDatabase,
      title: "Data Retention",
      content: "We retain your information only as long as necessary to provide our services and comply with legal obligations. You can request data deletion at any time, subject to regulatory requirements."
    },
    {
      icon: FiEye,
      title: "Your Rights",
      content: "You have the right to access, correct, or delete your personal data. You can also object to processing and request data portability. Contact our support team to exercise these rights."
    },
    {
      icon: FiShield,
      title: "Security Measures",
      content: "Our platform employs multi-layered security including SSL encryption, two-factor authentication, and regular security audits. We're committed to protecting your information from unauthorized access."
    }
  ];

  return (
    <section className="py-16 px-6 bg-gradient-to-br from-emerald-50 to-blue-50">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 bg-emerald-100 text-emerald-700 px-4 py-2 rounded-full text-sm font-semibold mb-4">
            <FiLock />
            Data Protection
          </div>
          <h2 className="text-4xl font-bold text-gray-800 mb-4">
            Privacy Policy
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto font-medium">
            Your privacy is our priority. Learn how we collect, use, and protect 
            your personal information while providing exceptional investment services.
          </p>
        </motion.div>

        {/* Privacy Sections Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {privacySections.map((section, index) => (
            <motion.div
              key={section.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 hover:shadow-lg transition-all duration-300 group"
            >
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-emerald-100 rounded-xl mb-4 group-hover:bg-emerald-200 transition-colors">
                  <section.icon className="text-emerald-600 text-xl" />
                </div>
                <h3 className="text-lg font-semibold text-gray-800 mb-3">
                  {section.title}
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed font-medium">
                  {section.content}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Compliance & Contact */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true }}
          className="bg-white rounded-2xl p-8 border border-gray-200"
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
              <h3 className="text-2xl font-semibold text-gray-800 mb-4">
                Compliance & Regulations
              </h3>
              <p className="text-gray-600 mb-4 font-medium">
                We adhere to global data protection regulations including GDPR and CCPA. 
                Our privacy practices are regularly reviewed and updated to maintain 
                the highest standards of data protection.
              </p>
              <ul className="text-gray-600 space-y-2 font-medium">
                <li>• Regular security audits and compliance checks</li>
                <li>• Transparent data processing practices</li>
                <li>• User consent for all data collection</li>
                <li>• Secure data storage and transmission</li>
              </ul>
            </div>
            
            <div className="bg-gray-50 rounded-xl p-6">
              <h4 className="text-lg font-semibold text-gray-800 mb-4">
                Contact Our Privacy Team
              </h4>
              <p className="text-gray-600 mb-4 text-sm font-medium">
                For privacy-related inquiries or to exercise your data rights, 
                contact our dedicated privacy team.
              </p>
              <div className="space-y-3">
                <button className="w-full bg-emerald-500 text-white py-3 rounded-xl hover:bg-emerald-600 transition-all duration-300 font-semibold">
                  Email Privacy Team
                </button>
                <button className="w-full border border-gray-300 text-gray-700 py-3 rounded-xl hover:bg-gray-50 transition-all duration-300 font-semibold">
                  Request Data Report
                </button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Last Updated */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          viewport={{ once: true }}
          className="text-center mt-8"
        >
          <p className="text-gray-500 text-sm font-medium">
            Last updated: {new Date().toLocaleDateString('en-US', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default PrivacyPolicy;