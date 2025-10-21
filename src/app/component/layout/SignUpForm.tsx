"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  FaFacebookF,
  FaLinkedinIn,
  FaTwitter,
  FaInstagram,
  FaArrowRight,
  FaSpinner,
  FaWallet,
  FaBitcoin,
  FaEthereum,
} from "react-icons/fa";
import { SiBinance, SiSolana, SiDogecoin, SiTether } from "react-icons/si";
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
  referralCode?: string;
  btcAddress?: string;
  bnbAddress?: string;
  dodgeAddress?: string;
  ethAddress?: string;
  solanaAddress?: string;
  usdttrc20Address?: string;
}

interface FormErrors {
  name?: string;
  email?: string;
  username?: string;
  phoneNumber?: string;
  password?: string;
  confirmPassword?: string;
  referralCode?: string;
  btcAddress?: string;
  bnbAddress?: string;
  dodgeAddress?: string;
  ethAddress?: string;
  solanaAddress?: string;
  usdttrc20Address?: string;
  form?: string;
}

// Form persistence keys
const FORM_STORAGE_KEY = 'chainrise_signup_form';
const FORM_TIMESTAMP_KEY = 'chainrise_form_timestamp';
const FORM_EXPIRY_TIME = 24 * 60 * 60 * 1000; // 24 hours

const initialState: FormState = {
  name: "",
  email: "",
  username: "",
  phoneNumber: "",
  password: "",
  confirmPassword: "",
  referralCode: "",
  btcAddress: "",
  bnbAddress: "",
  dodgeAddress: "",
  ethAddress: "",
  solanaAddress: "",
  usdttrc20Address: "",
};

const SignUpForm: React.FC = () => {
  const [form, setForm] = useState<FormState>(initialState);
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState(1);
  const router = useRouter();

  // Load saved form data from localStorage on component mount
  useEffect(() => {
    const savedForm = localStorage.getItem(FORM_STORAGE_KEY);
    const savedTimestamp = localStorage.getItem(FORM_TIMESTAMP_KEY);
    
    if (savedForm && savedTimestamp) {
      const timestamp = parseInt(savedTimestamp);
      const now = Date.now();
      
      // Check if form data is still valid (within 24 hours)
      if (now - timestamp < FORM_EXPIRY_TIME) {
        try {
          const parsedForm = JSON.parse(savedForm);
          setForm(parsedForm);
        } catch (error) {
          console.error('Error parsing saved form data:', error);
          clearFormData();
        }
      } else {
        // Clear expired form data
        clearFormData();
      }
    }
  }, []);

  // Save form data to localStorage whenever form changes
  useEffect(() => {
    if (Object.values(form).some(value => value !== "")) {
      localStorage.setItem(FORM_STORAGE_KEY, JSON.stringify(form));
      localStorage.setItem(FORM_TIMESTAMP_KEY, Date.now().toString());
    }
  }, [form]);

  // Check for referral code in URL on component mount
  useEffect(() => {
    const refCode = typeof window !== 'undefined' 
      ? new URLSearchParams(window.location.search).get('ref_id')
      : null;

    if (refCode) {
      setForm(prev => ({ ...prev, referralCode: refCode }));
    }
  }, []);

  const clearFormData = () => {
    localStorage.removeItem(FORM_STORAGE_KEY);
    localStorage.removeItem(FORM_TIMESTAMP_KEY);
    setForm(initialState);
  };

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

  const validateStep = (step: number): boolean => {
    const newErrors: FormErrors = {};
    
    if (step === 1) {
      if (!form.name.trim()) newErrors.name = "Full name is required";
      if (!form.email.trim()) {
        newErrors.email = "Email is required";
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
        newErrors.email = "Please enter a valid email address";
      }
      if (!form.username.trim()) newErrors.username = "Username is required";
      if (!form.phoneNumber.trim()) {
        newErrors.phoneNumber = "Phone number is required";
      } else if (!/^[\d\s\+\-\(\)]{8,}$/.test(form.phoneNumber)) {
        newErrors.phoneNumber = "Please enter a valid phone number";
      }
    }
    
   

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => prev + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => prev - 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const validateForm = (): boolean => {
    return validateStep(1) && validateStep(2);
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
        referralCode: form.referralCode || undefined,
        btcAddress: form.btcAddress || undefined,
        bnbAddress: form.bnbAddress || undefined,
        dodgeAddress: form.dodgeAddress || undefined,
        ethAddress: form.ethAddress || undefined,
        solanaAddress: form.solanaAddress || undefined,
        usdttrc20Address: form.usdttrc20Address || undefined,
      });

      if (result.error) {
        setErrors({ form: result.error });
      } else {
        setSuccessMessage(result.message || "Registration successful! Please check your email for verification.");
        clearFormData(); // Clear form data on successful submission
        // Redirect to login after 3 seconds
        setTimeout(() => router.push("/signin"), 3000);
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

  const walletIcons = {
    btcAddress: FaBitcoin,
    ethAddress: FaEthereum,
    bnbAddress: SiBinance,
    solanaAddress: SiSolana,
    dodgeAddress: SiDogecoin,
    usdttrc20Address: SiTether,
  };

  const walletLabels = {
    btcAddress: "Bitcoin (BTC) Address",
    ethAddress: "Ethereum (ETH) Address",
    bnbAddress: "BNB Smart Chain Address",
    solanaAddress: "Solana (SOL) Address",
    dodgeAddress: "Dogecoin (DOGE) Address",
    usdttrc20Address: "USDT (TRC20) Address",
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-5"
          >
            <div className="space-y-1">
              <h3 className="text-xl sm:text-2xl font-semibold text-gray-900">Personal Information</h3>
              <p className="text-sm text-gray-500">Tell us about yourself</p>
            </div>

            <div className="grid grid-cols-1 gap-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name *
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
                  Email Address *
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
                  Username *
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
                  Phone Number *
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
            </div>

            <div className="flex justify-end pt-4">
              <button
                type="button"
                onClick={nextStep}
                className="inline-flex items-center gap-2 py-3 px-6 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-medium shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 transition-all duration-200"
              >
                <span>Continue to Security</span>
                <FaArrowRight className="text-sm" />
              </button>
            </div>
          </motion.div>
        );

      case 2:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-5"
          >
            <div className="space-y-1">
              <h3 className="text-xl sm:text-2xl font-semibold text-gray-900">Account Security</h3>
              <p className="text-sm text-gray-500">Create a secure password</p>
            </div>

            <div className="grid grid-cols-1 gap-4">
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  Password *
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
                <p className="mt-1 text-xs text-gray-500">
                  Must be at least 8 characters with uppercase, lowercase, and numbers
                </p>
              </div>
              
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm Password *
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

              <div>
                <label htmlFor="referralCode" className="block text-sm font-medium text-gray-700 mb-1">
                  Referral Code (optional)
                </label>
                <input
                  id="referralCode"
                  type="text"
                  name="referralCode"
                  placeholder="Enter referral code if you have one"
                  value={form.referralCode}
                  onChange={handleChange}
                  className="w-full px-4 py-3 text-sm sm:text-base border border-gray-300 focus:ring-emerald-500 focus:border-transparent rounded-lg transition placeholder-gray-400"
                />
              </div>
            </div>

            <div className="flex justify-between pt-4">
              <button
                type="button"
                onClick={prevStep}
                className="inline-flex items-center gap-2 py-3 px-6 rounded-lg border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium transition-all duration-200"
              >
                <FaArrowRight className="text-sm rotate-180" />
                <span>Back</span>
              </button>
              <button
                type="button"
                onClick={nextStep}
                className="inline-flex items-center gap-2 py-3 px-6 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-medium shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 transition-all duration-200"
              >
                <span>Continue to Wallet Setup</span>
                <FaArrowRight className="text-sm" />
              </button>
            </div>
          </motion.div>
        );

      case 3:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-5"
          >
            <div className="space-y-1">
              <h3 className="text-xl sm:text-2xl font-semibold text-gray-900">Wallet Addresses (Optional)</h3>
              <p className="text-sm text-gray-500">Add your cryptocurrency wallet addresses for faster transactions</p>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {Object.entries(walletLabels).map(([key, label]) => {
                const Icon = walletIcons[key as keyof typeof walletIcons];
                return (
                  <div key={key}>
                    <label htmlFor={key} className=" text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                      <Icon className="text-lg" />
                      {label}
                    </label>
                    <input
                      id={key}
                      type="text"
                      name={key}
                      placeholder={`Enter your ${label.toLowerCase()}`}
                      value={form[key as keyof FormState] as string}
                      onChange={handleChange}
                      className="w-full px-4 py-3 text-sm sm:text-base border border-gray-300 focus:ring-emerald-500 focus:border-transparent rounded-lg transition placeholder-gray-400"
                    />
                  </div>
                );
              })}
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

            <div className="flex justify-between pt-4">
              <button
                type="button"
                onClick={prevStep}
                className="inline-flex items-center gap-2 py-3 px-6 rounded-lg border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium transition-all duration-200"
              >
                <FaArrowRight className="text-sm rotate-180" />
                <span>Back</span>
              </button>
              <button
                type="submit"
                disabled={loading}
                className="group inline-flex items-center justify-center gap-2 py-3 px-6 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-medium shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <FaSpinner className="animate-spin" />
                    <span>Creating Account...</span>
                  </>
                ) : (
                  <>
                    <FaWallet className="text-sm" />
                    <span>Create Account</span>
                  </>
                )}
              </button>
            </div>
          </motion.div>
        );

      default:
        return null;
    }
  };

  return (
    <section className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-emerald-50 px-4 py-12 sm:px-6 mt-5">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center"
      >
        {/* Left Column: Introduction */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center lg:text-left space-y-6"
        >
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-medium uppercase tracking-wider text-emerald-600 bg-emerald-100 px-3 py-1 rounded-full"
          >
            <span>🚀</span> Join ChainRise-Partners
          </motion.div>
          
          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 leading-tight"
          >
            Start Your Investment Journey
          </motion.h2>
          
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-gray-600 max-w-md mx-auto lg:mx-0 text-sm sm:text-base leading-relaxed"
          >
            Create your account to access premium investment opportunities, 
            real-time market insights, and secure crypto transactions.
            {form.referralCode && (
              <span className="block mt-3 text-emerald-600 font-medium">
                Using referral code: <strong>{form.referralCode}</strong>
              </span>
            )}
          </motion.p>

          {/* Progress Steps */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="space-y-4 pt-4"
          >
            <div className="flex items-center justify-center lg:justify-start gap-4">
              {[1, 2, 3].map((step) => (
                <div key={step} className="flex items-center gap-2">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    currentStep >= step 
                      ? 'bg-emerald-600 text-white' 
                      : 'bg-gray-200 text-gray-500'
                  }`}>
                    {step}
                  </div>
                  {step < 3 && (
                    <div className={`w-6 h-0.5 ${
                      currentStep > step ? 'bg-emerald-600' : 'bg-gray-300'
                    }`} />
                  )}
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-500">
              Step {currentStep} of 3: {
                currentStep === 1 ? 'Personal Info' : 
                currentStep === 2 ? 'Security' : 'Wallet Setup'
              }
            </p>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="flex justify-center lg:justify-start gap-3 pt-4"
          >
            {[FaFacebookF, FaLinkedinIn, FaTwitter, FaInstagram].map((Icon, i) => (
              <Link
                key={i}
                href="#"
                className="w-10 h-10 flex items-center justify-center rounded-lg bg-white border border-gray-200 hover:bg-emerald-50 hover:border-emerald-100 transition-colors duration-200 shadow-sm"
                aria-label={`Follow us on ${Icon.name.replace("Fa", "")}`}
              >
                <Icon className="text-gray-600 text-base" />
              </Link>
            ))}
          </motion.div>
        </motion.div>

        {/* Right Column: Registration Form */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 sm:p-8 md:p-10"
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            {(errors.form || successMessage) && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`p-4 rounded-lg text-sm flex items-center ${
                  errors.form 
                    ? "bg-red-50 text-red-700 border border-red-200" 
                    : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                }`}
              >
                <div className={`w-5 h-5 mr-3 flex-shrink-0 ${
                  errors.form ? "text-red-500" : "text-emerald-500"
                }`}>
                  {errors.form ? (
                    <svg fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <svg fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
                {errors.form || successMessage}
              </motion.div>
            )}
            
            {renderStep()}

            <div className="text-center text-sm text-gray-600 pt-4 border-t border-gray-100">
              <p>
                Already have an account? 
                <Link 
                  href="/signin" 
                  className="text-emerald-600 hover:text-emerald-700 font-medium hover:underline ml-1"
                >
                  Sign in here
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