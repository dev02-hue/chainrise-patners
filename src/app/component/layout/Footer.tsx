"use client";

import { useState } from "react";
import {
  FaInstagram,
  FaLinkedinIn,
  FaTwitter,
  FaFacebookF,
  FaPhoneAlt,
  FaEnvelope,
  FaMapMarkerAlt,
  FaChevronRight,
  FaShieldAlt,
  FaAward,
  FaHeadset,
} from "react-icons/fa";
import { motion } from "framer-motion";
import Link from "next/link";

const Footer = () => {
  const [email, setEmail] = useState("");

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle subscription logic here
    console.log("Subscribed:", email);
    setEmail("");
    // Add toast notification in real implementation
  };

  const usefulLinks = [
    { name: "Investment Plans", href: "/plans" },
    { name: "About Us", href: "/about" },
    { name: "Our Team", href: "/team" },
    { name: "Resources", href: "/resources" },
    { name: "FAQ", href: "/faq" },
    { name: "Contact", href: "/contact" },
  ];

  const companyLinks = [
    { name: "Software Corner", href: "/software" },
    { name: "Application Center", href: "/apps" },
    { name: "Research Section", href: "/research" },
    { name: "Developing Corner", href: "/development" },
    { name: "Careers", href: "/careers" },
    { name: "News & Updates", href: "/news" },
  ];

  const legalLinks = [
    { name: "Privacy Policy", href: "/privacy" },
    { name: "Terms of Service", href: "/terms" },
    { name: "Cookie Policy", href: "/cookies" },
    { name: "Disclaimer", href: "/disclaimer" },
    { name: "Compliance", href: "/compliance" },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6
      }
    }
  };

  return (
    <footer className="bg-gradient-to-b from-gray-900 to-[#001a12] text-white relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(120,255,200,0.15)_1px,transparent_0)] bg-[length:40px_40px]"></div>
      </div>

      {/* Trust Badges */}
      <div className="bg-teal-900/50 border-b border-teal-700/30">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex flex-wrap justify-center items-center gap-8 text-sm">
            <div className="flex items-center gap-2">
              <FaShieldAlt className="text-teal-400" />
              <span>Secure & Regulated</span>
            </div>
            <div className="flex items-center gap-2">
              <FaAward className="text-teal-400" />
              <span>Award Winning Platform</span>
            </div>
            <div className="flex items-center gap-2">
              <FaHeadset className="text-teal-400" />
              <span>24/7 Customer Support</span>
            </div>
          </div>
        </div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 py-16">
        <motion.div 
          className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-5 gap-8 lg:gap-12"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          {/* Company Info */}
          <motion.div 
            className="xl:col-span-2 space-y-6"
            variants={itemVariants}
          >
            <div className="space-y-4">
              <motion.h2 
                className="text-4xl font-bold bg-gradient-to-r from-teal-400 to-lime-400 bg-clip-text text-transparent"
                whileHover={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                ChainRise-Patners
              </motion.h2>
              <p className="text-gray-300 leading-relaxed text-lg max-w-2xl">
                We are an international financial company engaged in investment activities, 
                specializing in trading on financial markets and cryptocurrency exchanges 
                performed by qualified professional traders.
              </p>
            </div>

            {/* Newsletter Subscription */}
            <motion.div 
              className="space-y-4"
              variants={itemVariants}
            >
              <h4 className="text-lg font-semibold text-white">Stay Updated</h4>
              <form onSubmit={handleSubscribe} className="flex gap-2 max-w-md">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="flex-1 px-4 py-3 bg-white/10 border border-teal-500/30 rounded-lg focus:outline-none focus:border-teal-400 placeholder-gray-400 text-white backdrop-blur-sm"
                  required
                />
                <motion.button
                  type="submit"
                  className="px-6 py-3 bg-gradient-to-r from-teal-500 to-lime-500 text-gray-900 font-semibold rounded-lg hover:shadow-lg transition-all duration-300 flex items-center gap-2"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Subscribe
                  <FaChevronRight className="text-sm" />
                </motion.button>
              </form>
              <p className="text-sm text-gray-400">
                Get the latest investment insights and market updates
              </p>
            </motion.div>

            {/* Social Media */}
            <motion.div 
              className="space-y-4"
              variants={itemVariants}
            >
              <h4 className="text-lg font-semibold text-white">Follow Us</h4>
              <div className="flex gap-3">
                {[
                  { Icon: FaFacebookF, href: "#", color: "hover:bg-blue-600" },
                  { Icon: FaTwitter, href: "#", color: "hover:bg-sky-500" },
                  { Icon: FaLinkedinIn, href: "#", color: "hover:bg-blue-700" },
                  { Icon: FaInstagram, href: "#", color: "hover:bg-pink-600" },
                ].map(({ Icon, href, color }, index) => (
                  <motion.a
                    key={index}
                    href={href}
                    className={`p-3 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 ${color} hover:text-white transition-all duration-300 group`}
                    whileHover={{ scale: 1.1, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Icon className="text-lg group-hover:scale-110 transition-transform" />
                  </motion.a>
                ))}
              </div>
            </motion.div>
          </motion.div>

          {/* Useful Links */}
          <motion.div variants={itemVariants}>
            <h4 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
              Quick Links
              <div className="w-8 h-0.5 bg-teal-400"></div>
            </h4>
            <ul className="space-y-3">
              {usefulLinks.map((link, index) => (
                <li key={index}>
                  <Link 
                    href={link.href}
                    className="text-gray-300 hover:text-teal-400 transition-colors duration-200 flex items-center gap-2 group py-2"
                  >
                    <FaChevronRight className="text-teal-500 text-xs group-hover:translate-x-1 transition-transform" />
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Company Links */}
          <motion.div variants={itemVariants}>
            <h4 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
              Company
              <div className="w-8 h-0.5 bg-teal-400"></div>
            </h4>
            <ul className="space-y-3">
              {companyLinks.map((link, index) => (
                <li key={index}>
                  <Link 
                    href={link.href}
                    className="text-gray-300 hover:text-teal-400 transition-colors duration-200 flex items-center gap-2 group py-2"
                  >
                    <FaChevronRight className="text-teal-500 text-xs group-hover:translate-x-1 transition-transform" />
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Contact Info */}
          <motion.div variants={itemVariants}>
            <h4 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
              Contact Us
              <div className="w-8 h-0.5 bg-teal-400"></div>
            </h4>
            <ul className="space-y-4 text-gray-300">
              <li className="flex items-start gap-3 group hover:text-teal-400 transition-colors">
                <FaPhoneAlt className="text-teal-400 mt-1 flex-shrink-0 group-hover:scale-110 transition-transform" />
                <div>
                  <div className="font-medium">+447552536736</div>
                  <div className="text-sm text-gray-400">Mon-Fri 9AM-6PM</div>
                </div>
              </li>
              <li className="flex items-start gap-3 group hover:text-teal-400 transition-colors">
                <FaEnvelope className="text-teal-400 mt-1 flex-shrink-0 group-hover:scale-110 transition-transform" />
                <div>
                  <div className="font-medium">support@ChainRisePatners.com</div>
                  <div className="text-sm text-gray-400">Quick response</div>
                </div>
              </li>
              <li className="flex items-start gap-3 group hover:text-teal-400 transition-colors">
                <FaMapMarkerAlt className="text-teal-400 mt-1 flex-shrink-0 group-hover:scale-110 transition-transform" />
                <div>
                  <div className="font-medium">27 Frankley Road</div>
                  <div className="text-sm text-gray-400">New Plymouth Central, New Zealand</div>
                </div>
              </li>
            </ul>
          </motion.div>
        </motion.div>

        {/* Bottom Bar */}
        <motion.div 
          className="border-t border-white/10 mt-12 pt-8 flex flex-col lg:flex-row items-center justify-between gap-4 text-gray-400"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <div className="text-center lg:text-left">
            <p className="text-sm">
              © {new Date().getFullYear()} ChainRise-Patners. All rights reserved. | 
              <span className="text-teal-400 ml-1">Alpha Capital Limited</span>
            </p>
            <p className="text-xs mt-1 text-gray-500">
              Registered at 27 Frankley Road, New Plymouth Central, New Zealand
            </p>
          </div>
          
          <div className="flex flex-wrap justify-center gap-6 text-sm">
            {legalLinks.map((link, index) => (
              <Link 
                key={index}
                href={link.href}
                className="hover:text-teal-400 transition-colors duration-200"
              >
                {link.name}
              </Link>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Security Badge */}
      <div className="bg-black/30 border-t border-white/5 py-4">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p className="text-xs text-gray-500">
            🔒 Secured with SSL Encryption • 💼 Fully Regulated • 🌐 Global Operations
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;