"use client";
import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { 
  FiChevronDown, 
  FiHome, 
  FiUser, 
  FiDollarSign, 
  FiTrendingUp, 
  FiCreditCard, 
  FiActivity, 
  FiMenu,
  FiX,
  FiLogOut,
  FiSettings,
  FiShare2,
 
  FiPieChart
} from "react-icons/fi";
import { useRouter, usePathname } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { signOut } from '@/lib/auth';
import { AiFillWallet } from "react-icons/ai";

const SignOutButton = () => {
  const router = useRouter();
  const supabase = createClientComponentClient();

  const handleSignOut = async () => {
    try {
      const result = await signOut();
      
      if (result.error) {
        console.error('Sign out error:', result.error);
        return;
      }

      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('Supabase sign out error:', error.message);
        return;
      }

      router.push('/signin');
      router.refresh();
    } catch (err) {
      console.error('Unexpected sign out error:', err);
    }
  };

  return (
    <button
      onClick={handleSignOut}
      className="flex items-center w-full py-2.5 px-4 text-gray-600 hover:text-red-500 rounded-lg hover:bg-red-50 transition-all duration-200 group"
    >
      <FiLogOut className="mr-3 text-lg group-hover:scale-110 transition-transform" />
      <span className="font-medium">Sign Out</span>
    </button>
  );
};

const navItems = [
  { 
    name: "Dashboard", 
    href: "/user/dashboard", 
    icon: <FiHome className="text-lg" /> 
  },
  {
    name: "My Account",
    icon: <FiUser className="text-lg" />,
    dropdown: [
      { name: "Profile Setting", href: "/user/profile-setting", icon: <FiSettings size={16} /> },
      { name: "My Referral", href: "/user/my-referral", icon: <FiShare2 size={16} /> },
      { name: "All Wallet Addresses", href: "/user/all-wallets", icon: <AiFillWallet size={16} /> },
      { name: "New Wallet Address", href: "/user/new-wallets", icon: <AiFillWallet size={16} /> },
    ],
  },
  {
    name: "Deposit",
    icon: <FiDollarSign className="text-lg" />,
    dropdown: [
      { name: "All Deposit", href: "/user/deposit-all", icon: <FiPieChart size={16} /> },
      { name: "New Deposit", href: "/user/deposit-new", icon: <FiDollarSign size={16} /> },
    ],
  },
  {
    name: "Investment",
    icon: <FiTrendingUp className="text-lg" />,
    dropdown: [
      { name: "All Investment", href: "/user/investment-all", icon: <FiActivity size={16} /> },
      { name: "New Investment", href: "/user/investment-new", icon: <FiTrendingUp size={16} /> },
    ],
  },
  {
    name: "Withdrawal",
    icon: <FiCreditCard className="text-lg" />,
    dropdown: [
      { name: "All Withdrawals", href: "/user/withdrawal-all", icon: <FiCreditCard size={16} /> },
      { name: "New Withdrawal", href: "/user/withdrawal-new", icon: <FiCreditCard size={16} /> },
    ],
  },
  { 
    name: "Transactions", 
    href: "/user/transactions", 
    icon: <FiActivity className="text-lg" /> 
  },
];

export default function Navbar() {
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setActiveDropdown(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setActiveDropdown(null);
  }, [pathname]);

  const isActiveLink = (href: string) => {
    return pathname === href;
  };

  return (
    <>
      {/* Desktop Navbar */}
      <nav className="bg-white/95 backdrop-blur-md border-b border-gray-200 text-gray-700 px-4 lg:px-8 py-3 flex items-center justify-between sticky top-0 z-50 shadow-sm">
        <div className="flex items-center flex-1">
          {/* Mobile Menu Button */}
          <button 
            onClick={toggleMobileMenu}
            className="lg:hidden mr-3 p-2 rounded-lg text-gray-600 hover:text-blue-600 hover:bg-gray-100 transition-colors"
          >
            {mobileMenuOpen ? <FiX size={20} /> : <FiMenu size={20} />}
          </button>

          {/* Logo */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
            className="flex items-center text-xl font-bold text-gray-800"
          >
            <span className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg px-2.5 py-1.5 mr-2 shadow-sm">
              C
            </span>
            <span className="hidden sm:block">hainRise Partners</span>
          </motion.div>

          {/* Desktop Nav Items */}
          <div className="hidden lg:flex items-center flex-1 ml-8" ref={dropdownRef}>
            <ul className="flex items-center space-x-1">
              {navItems.map((item) => (
                <li 
                  key={item.name} 
                  className="relative"
                  onMouseEnter={() => item.dropdown && setActiveDropdown(item.name)}
                  onMouseLeave={() => item.dropdown && setActiveDropdown(null)}
                >
                  {item.dropdown ? (
                    <>
                      <button 
                        className={`flex items-center py-2.5 px-4 rounded-lg font-medium transition-all duration-200 group ${
                          activeDropdown === item.name 
                            ? "text-blue-600 bg-blue-50" 
                            : "text-gray-600 hover:text-blue-600 hover:bg-gray-50"
                        }`}
                      >
                        <span className="mr-2 opacity-80">{item.icon}</span>
                        <span>{item.name}</span>
                        <motion.span
                          animate={{ rotate: activeDropdown === item.name ? 180 : 0 }}
                          transition={{ duration: 0.2 }}
                          className="ml-1.5 opacity-70"
                        >
                          <FiChevronDown size={16} />
                        </motion.span>
                      </button>
                      
                      <AnimatePresence>
                        {activeDropdown === item.name && (
                          <motion.ul
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                            transition={{ duration: 0.15, ease: "easeOut" }}
                            className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg w-64 z-50 overflow-hidden py-2"
                          >
                            {item.dropdown.map((sub) => (
                              <motion.li 
                                key={sub.name}
                                whileHover={{ backgroundColor: "#f8fafc" }}
                                transition={{ duration: 0.1 }}
                              >
                                <Link
                                  href={sub.href}
                                  className="flex items-center px-4 py-3 text-gray-600 hover:text-blue-600 transition-colors duration-200 text-sm font-medium"
                                >
                                  <span className="mr-3 opacity-70">{sub.icon}</span>
                                  {sub.name}
                                </Link>
                              </motion.li>
                            ))}
                          </motion.ul>
                        )}
                      </AnimatePresence>
                    </>
                  ) : (
                    <Link
                      href={item.href}
                      className={`flex items-center py-2.5 px-4 rounded-lg font-medium transition-all duration-200 ${
                        isActiveLink(item.href)
                          ? "text-blue-600 bg-blue-50 border border-blue-100"
                          : "text-gray-600 hover:text-blue-600 hover:bg-gray-50"
                      }`}
                    >
                      <span className="mr-2 opacity-80">{item.icon}</span>
                      {item.name}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* User profile and sign out */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center shadow-sm">
            <FiUser className="text-white text-sm" />
          </div>
          <div className="hidden lg:block">
            <SignOutButton />
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black bg-opacity-40 z-40 lg:hidden backdrop-blur-sm"
              onClick={toggleMobileMenu}
            />
            
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="fixed inset-y-0 left-0 w-80 bg-white z-50 overflow-y-auto border-r border-gray-200 shadow-xl"
            >
              <div className="p-6 border-b border-gray-200 flex items-center justify-between bg-white">
                <div className="text-xl font-bold text-gray-800 flex items-center">
                  <span className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg px-2.5 py-1.5 mr-3">C</span>
                  <span>hainRise Partners</span>
                </div>
                <button 
                  onClick={toggleMobileMenu}
                  className="p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  <FiX size={20} />
                </button>
              </div>

              <nav className="p-4">
                <ul className="space-y-1">
                  {navItems.map((item) => (
                    <li key={item.name}>
                      {item.dropdown ? (
                        <div className="mb-1">
                          <button 
                            onClick={() => setActiveDropdown(
                              activeDropdown === item.name ? null : item.name
                            )}
                            className={`flex items-center justify-between w-full py-3 px-4 rounded-lg transition-all duration-200 font-medium ${
                              activeDropdown === item.name
                                ? "text-blue-600 bg-blue-50"
                                : "text-gray-600 hover:text-blue-600 hover:bg-gray-50"
                            }`}
                          >
                            <div className="flex items-center">
                              <span className="mr-3 opacity-80">{item.icon}</span>
                              <span>{item.name}</span>
                            </div>
                            <motion.span
                              animate={{ rotate: activeDropdown === item.name ? 180 : 0 }}
                              transition={{ duration: 0.2 }}
                            >
                              <FiChevronDown size={16} />
                            </motion.span>
                          </button>
                          
                          <AnimatePresence>
                            {activeDropdown === item.name && (
                              <motion.ul
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                transition={{ duration: 0.2 }}
                                className="overflow-hidden pl-4 mt-1"
                              >
                                {item.dropdown.map((sub) => (
                                  <motion.li 
                                    key={sub.name}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -10 }}
                                    transition={{ duration: 0.1 }}
                                  >
                                    <Link
                                      href={sub.href}
                                      className="flex items-center py-2.5 px-4 text-gray-500 hover:text-blue-600 hover:bg-gray-50 rounded-lg text-sm font-medium transition-colors"
                                    >
                                      <span className="mr-3 opacity-70">{sub.icon}</span>
                                      {sub.name}
                                    </Link>
                                  </motion.li>
                                ))}
                              </motion.ul>
                            )}
                          </AnimatePresence>
                        </div>
                      ) : (
                        <Link
                          href={item.href}
                          className={`flex items-center py-3 px-4 rounded-lg transition-all duration-200 font-medium ${
                            isActiveLink(item.href)
                              ? "text-blue-600 bg-blue-50 border border-blue-100"
                              : "text-gray-600 hover:text-blue-600 hover:bg-gray-50"
                          }`}
                        >
                          <span className="mr-3 opacity-80">{item.icon}</span>
                          <span>{item.name}</span>
                        </Link>
                      )}
                    </li>
                  ))}
                  {/* Mobile Sign Out Button */}
                  <li className="mt-4 pt-4 border-t border-gray-200">
                    <SignOutButton />
                  </li>
                </ul>
              </nav>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}