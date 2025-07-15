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
import { signUp } from "@/lib/auth";
import Link from "next/link";

interface FormState {
  name: string;
  email: string;
  username: string;
  phoneNumber: string;
  password: string;
  confirmPassword: string;
}

interface FormErrors {
  name?: string;
  email?: string;
  username?: string;
  phoneNumber?: string;
  password?: string;
  confirmPassword?: string;
  form?: string;
}

const initialState: FormState = {
  name: "",
  email: "",
  username: "",
  phoneNumber: "",
  password: "",
  confirmPassword: "",
};

const containerVariants = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { staggerChildren: 0.1 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

// Add this new CSS for larger input fields
const inputStyle = "w-full px-5 py-4 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition";

export const SignUpForm: React.FC = () => {
  const [form, setForm] = useState<FormState>(initialState);
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    // Clear error when user types
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});
    setSuccessMessage(null);

    try {
      const result = await signUp({
        name: form.name,
        email: form.email,
        username: form.username,
        phoneNumber: form.phoneNumber,
        password: form.password,
        confirmPassword: form.confirmPassword,
      });

      if (result.error) {
        setErrors({ form: result.error });
      } else {
        setSuccessMessage(result.message || "Signup successful!");
        setForm(initialState);
      }
    } catch (error) {
      setErrors({
        form: "An unexpected error occurred. Please try again later.",
      });
      console.error("Signup error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="min-h-[90vh] flex items-center justify-center bg-white px-4 sm:px-6 mt-10" id="signup">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.2 }}
        className="w-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 lg:gap-16 py-8"
      >
        {/* Left – Intro */}
        <motion.div variants={itemVariants} className="space-y-4 md:space-y-6 self-center">
          <div className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-emerald-600">
            <span>✨</span> Contact Us
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-gray-800">
            Account opening form
          </h2>
          <p className="text-gray-600 text-sm sm:text-base">
            Fill in the form below to create an account on our platform.
          </p>

          {/* Social buttons */}
          <div className="flex gap-3 sm:gap-4 pt-2 sm:pt-4">
            {[FaFacebookF, FaLinkedinIn, FaTwitter, FaInstagram].map(
              (Icon, idx) => (
                <Link
                  key={idx}
                  href="#"
                  className="w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-md border border-gray-200 hover:bg-emerald-50 transition"
                  aria-label={`Follow us on ${Icon.name.replace("Fa", "")}`}
                >
                  <Icon className="text-gray-600 text-sm sm:text-base" />
                </Link>
              )
            )}
          </div>
        </motion.div>

        {/* Right – Form Card */}
        <motion.div
          variants={itemVariants}
          className="bg-white rounded-xl sm:rounded-2xl border border-gray-200 shadow-sm p-6 sm:p-8 lg:p-10 self-center"
        >
          {errors.form && (
            <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-red-50 text-red-700 rounded-md text-sm sm:text-base">
              {errors.form}
            </div>
          )}
          {successMessage && (
            <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-emerald-50 text-emerald-700 rounded-md text-sm sm:text-base">
              {successMessage}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
            <div className="grid grid-cols-1 gap-4 sm:gap-5">
              <div className="space-y-2">
                <input
                  type="text"
                  name="name"
                  placeholder="Name"
                  value={form.name}
                  onChange={handleChange}
                  required
                  className={inputStyle}
                  aria-label="Full name"
                />
                {errors.name && (
                  <p className="text-red-500 text-xs sm:text-sm mt-1">{errors.name}</p>
                )}
              </div>
              <div className="space-y-2">
                <input
                  type="email"
                  name="email"
                  placeholder="Email"
                  value={form.email}
                  onChange={handleChange}
                  required
                  className={inputStyle}
                  aria-label="Email address"
                />
                {errors.email && (
                  <p className="text-red-500 text-xs sm:text-sm mt-1">{errors.email}</p>
                )}
              </div>
              <div className="space-y-2">
                <input
                  type="text"
                  name="username"
                  placeholder="Username"
                  value={form.username}
                  onChange={handleChange}
                  required
                  className={inputStyle}
                  aria-label="Username"
                />
                {errors.username && (
                  <p className="text-red-500 text-xs sm:text-sm mt-1">{errors.username}</p>
                )}
              </div>
              <div className="space-y-2">
                <input
                  type="tel"
                  name="phoneNumber"
                  placeholder="Phone Number"
                  value={form.phoneNumber}
                  onChange={handleChange}
                  required
                  className={inputStyle}
                  aria-label="Phone number"
                />
                {errors.phoneNumber && (
                  <p className="text-red-500 text-xs sm:text-sm mt-1">{errors.phoneNumber}</p>
                )}
              </div>
              <div className="space-y-2">
                <input
                  type="password"
                  name="password"
                  placeholder="Password"
                  value={form.password}
                  onChange={handleChange}
                  required
                  className={inputStyle}
                  aria-label="Password"
                />
                {errors.password && (
                  <p className="text-red-500 text-xs sm:text-sm mt-1">{errors.password}</p>
                )}
              </div>
              <div className="space-y-2">
                <input
                  type="password"
                  name="confirmPassword"
                  placeholder="Confirm Password"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  required
                  className={inputStyle}
                  aria-label="Confirm password"
                />
                {errors.confirmPassword && (
                  <p className="text-red-500 text-xs sm:text-sm mt-1">
                    {errors.confirmPassword}
                  </p>
                )}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="group w-full inline-flex items-center justify-center gap-2 py-4 px-6 rounded-md bg-emerald-700 text-white font-medium shadow hover:bg-emerald-800 transition disabled:opacity-60 disabled:pointer-events-none text-base"
              aria-label={loading ? "Submitting form" : "Submit form"}
            >
              {loading ? "Submitting…" : "Submit"}
              <FaArrowRight className="text-base group-hover:translate-x-1 transition-transform" />
            </button>

            <p className="text-center text-xs sm:text-sm text-gray-600">
              Already have an account?{" "}
              <Link
                href="/signin"
                className="text-emerald-700 font-medium hover:underline"
              >
                Login to your account
              </Link>
            </p>
          </form>
        </motion.div>
      </motion.div>
    </section>
  );
};