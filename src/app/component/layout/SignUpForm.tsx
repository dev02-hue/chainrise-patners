"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  FaFacebookF,
  FaLinkedinIn,
  FaTwitter,
  FaInstagram,
  FaArrowRight,
  FaSpinner,
} from "react-icons/fa";
import { signUp } from "@/lib/auth";
import Link from "next/link";
import { useRouter } from "next/navigation";

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

const SignUpForm: React.FC = () => {
  const [form, setForm] = useState<FormState>(initialState);
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const router = useRouter();

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

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    
    if (!form.name.trim()) newErrors.name = "Name is required";
    if (!form.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      newErrors.email = "Please enter a valid email";
    }
    if (!form.username.trim()) newErrors.username = "Username is required";
    if (!form.phoneNumber.trim()) {
      newErrors.phoneNumber = "Phone number is required";
    } else if (!/^[\d\s\+\-\(\)]{8,}$/.test(form.phoneNumber)) {
      newErrors.phoneNumber = "Please enter a valid phone number";
    }
    if (!form.password) {
      newErrors.password = "Password is required";
    } else if (form.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    }
    if (form.password !== form.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
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
        setSuccessMessage(result.message || "Registration successful!");
        setForm(initialState);
        // Redirect to login after 2 seconds
        setTimeout(() => router.push("/signin"), 2000);
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
    <section className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 mt-5">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center"
      >
        {/* Left Column: Introduction */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center lg:text-left space-y-5"
        >
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-medium uppercase tracking-wider text-emerald-600"
          >
            <span>✨</span> Get Started
          </motion.div>
          
          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 leading-tight"
          >
            Create Your Account
          </motion.h2>
          
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-gray-600 max-w-md mx-auto lg:mx-0 text-sm sm:text-base"
          >
            Join our platform to access exclusive features and content.
          </motion.p>
          
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="flex justify-center lg:justify-start gap-3 pt-2"
          >
            {[FaFacebookF, FaLinkedinIn, FaTwitter, FaInstagram].map((Icon, i) => (
              <Link
                key={i}
                href="#"
                className="w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-md border border-gray-200 hover:bg-emerald-50 hover:border-emerald-100 transition-colors duration-200"
                aria-label={`Follow us on ${Icon.name.replace("Fa", "")}`}
              >
                <Icon className="text-gray-600 text-sm sm:text-base" />
              </Link>
            ))}
          </motion.div>
        </motion.div>

        {/* Right Column: Registration Form */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="bg-white rounded-xl sm:rounded-2xl border border-gray-200 shadow-xs sm:shadow-sm p-6 sm:p-8 md:p-10"
        >
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1">
              <h3 className="text-xl sm:text-2xl font-semibold text-gray-900">Register</h3>
              <p className="text-sm text-gray-500">Create your account in minutes</p>
            </div>
            
            {(errors.form || successMessage) && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`p-3 rounded-md text-sm flex items-center ${
                  errors.form ? "bg-red-50 text-red-700" : "bg-emerald-50 text-emerald-700"
                }`}
              >
                <svg 
                  className={`w-4 h-4 mr-2 flex-shrink-0 ${
                    errors.form ? "text-red-500" : "text-emerald-500"
                  }`} 
                  fill="currentColor" 
                  viewBox="0 0 20 20"
                >
                  <path 
                    fillRule="evenodd" 
                    d={errors.form ? 
                      "M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" : 
                      "M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    } 
                    clipRule="evenodd" 
                  />
                </svg>
                {errors.form || successMessage}
              </motion.div>
            )}
            
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name
                </label>
                <input
                  id="name"
                  type="text"
                  name="name"
                  placeholder="John Doe"
                  value={form.name}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 text-sm sm:text-base border ${
                    errors.name ? "border-red-300 focus:ring-red-500" : "border-gray-300 focus:ring-emerald-500"
                  } rounded-lg focus:ring-2 focus:border-transparent transition placeholder-gray-400`}
                  autoComplete="name"
                />
                {errors.name && (
                  <p className="mt-1 text-xs text-red-600">{errors.name}</p>
                )}
              </div>
              
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  name="email"
                  placeholder="john@example.com"
                  value={form.email}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 text-sm sm:text-base border ${
                    errors.email ? "border-red-300 focus:ring-red-500" : "border-gray-300 focus:ring-emerald-500"
                  } rounded-lg focus:ring-2 focus:border-transparent transition placeholder-gray-400`}
                  autoComplete="email"
                />
                {errors.email && (
                  <p className="mt-1 text-xs text-red-600">{errors.email}</p>
                )}
              </div>
              
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                  Username
                </label>
                <input
                  id="username"
                  type="text"
                  name="username"
                  placeholder="johndoe"
                  value={form.username}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 text-sm sm:text-base border ${
                    errors.username ? "border-red-300 focus:ring-red-500" : "border-gray-300 focus:ring-emerald-500"
                  } rounded-lg focus:ring-2 focus:border-transparent transition placeholder-gray-400`}
                  autoComplete="username"
                />
                {errors.username && (
                  <p className="mt-1 text-xs text-red-600">{errors.username}</p>
                )}
              </div>
              
              <div>
                <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number
                </label>
                <input
                  id="phoneNumber"
                  type="tel"
                  name="phoneNumber"
                  placeholder="+1 (555) 123-4567"
                  value={form.phoneNumber}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 text-sm sm:text-base border ${
                    errors.phoneNumber ? "border-red-300 focus:ring-red-500" : "border-gray-300 focus:ring-emerald-500"
                  } rounded-lg focus:ring-2 focus:border-transparent transition placeholder-gray-400`}
                  autoComplete="tel"
                />
                {errors.phoneNumber && (
                  <p className="mt-1 text-xs text-red-600">{errors.phoneNumber}</p>
                )}
              </div>
              
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  name="password"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 text-sm sm:text-base border ${
                    errors.password ? "border-red-300 focus:ring-red-500" : "border-gray-300 focus:ring-emerald-500"
                  } rounded-lg focus:ring-2 focus:border-transparent transition placeholder-gray-400`}
                  autoComplete="new-password"
                />
                {errors.password && (
                  <p className="mt-1 text-xs text-red-600">{errors.password}</p>
                )}
              </div>
              
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm Password
                </label>
                <input
                  id="confirmPassword"
                  type="password"
                  name="confirmPassword"
                  placeholder="••••••••"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 text-sm sm:text-base border ${
                    errors.confirmPassword ? "border-red-300 focus:ring-red-500" : "border-gray-300 focus:ring-emerald-500"
                  } rounded-lg focus:ring-2 focus:border-transparent transition placeholder-gray-400`}
                  autoComplete="new-password"
                />
                {errors.confirmPassword && (
                  <p className="mt-1 text-xs text-red-600">{errors.confirmPassword}</p>
                )}
              </div>
            </div>

            <div className="flex items-center">
              <input
                id="terms"
                name="terms"
                type="checkbox"
                required
                className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded"
              />
              <label htmlFor="terms" className="ml-2 block text-xs sm:text-sm text-gray-700">
                I agree to the <Link href="/terms" className="text-emerald-600 hover:underline">Terms of Service</Link> and <Link href="/privacy" className="text-emerald-600 hover:underline">Privacy Policy</Link>
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="group w-full inline-flex items-center justify-center gap-2 py-3 px-6 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-medium shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed"
              aria-label={loading ? "Creating account..." : "Create account"}
            >
              {loading ? (
                <>
                  <FaSpinner className="animate-spin" />
                  <span>Creating account...</span>
                </>
              ) : (
                <>
                  <span>Create Account</span>
                  <FaArrowRight className="text-sm group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>

            <div className="text-center text-sm text-gray-600">
              <p>
                Already have an account?{" "}
                <Link 
                  href="/signin" 
                  className="text-emerald-600 hover:text-emerald-700 font-medium hover:underline"
                >
                  Sign in
                </Link>
              </p>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </section>
  );
};

export default SignUpForm;