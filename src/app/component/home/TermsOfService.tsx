"use client";

import { motion } from "framer-motion";
import { FiShield, FiFileText, FiAlertTriangle, FiUserCheck } from "react-icons/fi";

const TermsOfService = () => {
  const sections = [
    {
      icon: FiUserCheck,
      title: "Account Terms",
      content: "By creating an account with Quantum Invest, you agree to provide accurate and complete information. You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account."
    },
    {
      icon: FiShield,
      title: "Investment Risks",
      content: "All investments carry inherent risks. Past performance is not indicative of future results. You acknowledge that cryptocurrency investments are volatile and you could lose some or all of your invested capital. We recommend consulting with a financial advisor before investing."
    },
    {
      icon: FiFileText,
      title: "Platform Usage",
      content: "You agree to use our platform lawfully and not engage in any fraudulent activities. We reserve the right to suspend or terminate accounts that violate our terms or engage in suspicious activities. All platform transactions are subject to verification."
    },
    {
      icon: FiAlertTriangle,
      title: "Liability Disclaimer",
      content: "Quantum Invest provides an investment platform but does not guarantee returns. We are not liable for market fluctuations, technical issues, or third-party actions. Users invest at their own risk and should only invest what they can afford to lose."
    }
  ];

  return (
    <section className="py-16 px-6 bg-gradient-to-br from-blue-50 to-blue-100">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-semibold mb-4">
            <FiFileText />
            Legal Documentation
          </div>
          <h2 className="text-4xl font-bold text-gray-800 mb-4">
            Terms of Service
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto font-medium">
            Please read these terms carefully before using our investment platform. 
            By accessing Quantum Invest, you agree to be bound by these terms.
          </p>
        </motion.div>

        {/* Terms Sections */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {sections.map((section, index) => (
            <motion.div
              key={section.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 hover:shadow-lg transition-all duration-300"
            >
              <div className="flex items-start space-x-4">
                <div className="p-3 bg-blue-100 rounded-xl">
                  <section.icon className="text-blue-600 text-xl" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-800 mb-3">
                    {section.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed font-medium">
                    {section.content}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Additional Information */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true }}
          className="mt-12 bg-white rounded-2xl p-8 border border-gray-200"
        >
          <div className="text-center">
            <h3 className="text-2xl font-semibold text-gray-800 mb-4">
              Important Notice
            </h3>
            <p className="text-gray-600 mb-6 font-medium">
              These terms may be updated periodically. Continued use of our platform 
              constitutes acceptance of any changes. For questions, contact our support team.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-blue-500 text-white px-6 py-3 rounded-xl hover:bg-blue-600 transition-all duration-300 font-semibold">
                Download Full Terms
              </button>
              <button className="border border-gray-300 text-gray-700 px-6 py-3 rounded-xl hover:bg-gray-50 transition-all duration-300 font-semibold">
                Contact Legal Team
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default TermsOfService;