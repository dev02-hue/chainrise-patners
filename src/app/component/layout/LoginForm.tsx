"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  FaFacebookF,
  FaLinkedinIn,
  FaTwitter,
  FaInstagram,
  FaArrowRight,
} from "react-icons/fa";
import Link from "next/link";
import { signIn } from "@/lib/auth"; // Import the signIn function

const LoginForm = () => {
  const [emailOrUsername, setEmailOrUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const result = await signIn({
      emailOrUsername,
      password
    });

    setLoading(false);

    if (result.error) {
      setError(result.error);
    } else {
      // Redirect or handle successful login
      window.location.href = "/user/dashboard"; // Or use Next.js router
    }
  };

  return (
    <section
      id="login"
      className="min-h-[90vh] flex items-center justify-center px-4 sm:px-8 bg-white"
    >
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
        className="w-full max-w-7xl grid grid-cols-1 lg:grid-cols-2 gap-16 items-center"
      >
        {/* Left Column: Heading & Socials */}
        <div className="space-y-6">
          <div className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-emerald-600">
            <span>✨</span> Contact Us
          </div>
          <h2 className="text-4xl sm:text-5xl font-extrabold text-gray-800">
            Login to dashboard
          </h2>
          <p className="text-gray-600 max-w-md">
            Fill in the form below to login to your account dashboard.
          </p>
          <div className="flex gap-4 pt-4">
            {[FaFacebookF, FaLinkedinIn, FaTwitter, FaInstagram].map((Icon, i) => (
              <Link
                key={i}
                href="#"
                className="w-11 h-11 flex items-center justify-center rounded-md border border-gray-200 hover:bg-emerald-50 transition"
                aria-label={`Follow us on ${Icon.name.replace("Fa", "")}`}
              >
                <Icon className="text-gray-600" />
              </Link>
            ))}
          </div>
        </div>

        {/* Right Column: Login Form */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-10">
          <form onSubmit={handleSubmit} className="space-y-6 w-full max-w-md">
            {error && (
              <div className="p-4 bg-red-50 text-red-700 rounded-md text-sm">
                {error}
              </div>
            )}
            
            <div className="space-y-4">
              <div>
                <input
                  type="text"
                  name="emailOrUsername"
                  placeholder="Email or Username"
                  value={emailOrUsername}
                  onChange={(e) => setEmailOrUsername(e.target.value)}
                  required
                  className="w-full px-5 py-4 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition"
                />
              </div>
              <div>
                <input
                  type="password"
                  name="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-5 py-4 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="group w-full inline-flex items-center justify-center gap-2 py-4 px-6 rounded-md bg-emerald-700 text-white font-medium shadow hover:bg-emerald-800 focus:outline-none focus:ring-4 focus:ring-emerald-300 transition disabled:opacity-60 disabled:pointer-events-none"
            >
              {loading ? "Logging in..." : "Login"}
              <FaArrowRight className="text-lg group-hover:translate-x-1 transition-transform" />
            </button>

            <div className="text-sm text-center text-gray-600">
              <Link 
                href="/forgot-password" 
                className="text-emerald-700 hover:underline block"
              >
                Forgot your password?
              </Link>
              <Link 
                href="/register" 
                className="text-emerald-700 hover:underline block mt-1"
              >
                Don&apos;t have an account? Register
              </Link>
            </div>
          </form>
        </div>
      </motion.div>
    </section>
  );
};

export default LoginForm;