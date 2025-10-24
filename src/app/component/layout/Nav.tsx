'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  FaFacebookF, 
  FaInstagram, 
  FaLinkedinIn, 
  FaTwitter,
  FaSearch,
  FaUserCircle
} from 'react-icons/fa'
import { HiOutlineMenuAlt3, HiX } from 'react-icons/hi'
// import TranslateBody from '../user/TranslateBody'

const navLinks = [
  { label: 'Home', href: '/' },
  { label: 'About Us', href: '/about' },
  // { label: 'Our Team', href: '/team' },
  { label: 'Investment Plans', href: '/plans' },
  { label: 'Resources', href: '/team' },
  { label: 'Contact', href: '/contact' },
]

export default function Navigation() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const toggleMenu = () => setMenuOpen(!menuOpen)
  const toggleSearch = () => setSearchOpen(!searchOpen)

  return (
    <>
      {/* Top Announcement Bar */}
      <div className="bg-teal-700 text-white text-sm py-2 px-4 text-center w-full">
        <p className="text-base sm:text-sm">Get 5% bonus on your first investment - Limited time offer</p>
      </div>

      {/* Main Navigation */}
      <header className={`fixed w-full z-50 transition-all duration-300 ${scrolled ? 'bg-white shadow-md py-2' : 'bg-white/90 backdrop-blur-sm py-3 sm:py-4'}`}>
        <div className="max-w-7xl mx-auto px-3 sm:px-4 flex justify-between items-center">
          {/* Logo */}
          <Link href="/" className="flex items-center min-w-0 flex-shrink">
            <motion.div 
              whileHover={{ scale: 1.05 }}
              className="flex items-center"
            >
              <span className="text-2xl sm:text-3xl font-bold text-teal-600 whitespace-nowrap">ChainRise-</span>
              <span className="text-xl sm:text-2xl font-bold text-gray-800 ml-0 sm:ml-1 whitespace-nowrap">Patners</span>
              <span className="text-xs font-medium bg-teal-100 text-teal-800 px-2 py-1 rounded-full ml-1 sm:ml-2 hidden xs:inline-block">PRO</span>
            </motion.div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-6 xl:space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`relative px-1 py-2 text-base font-medium transition-colors whitespace-nowrap ${
                  pathname === link.href 
                    ? 'text-teal-600 font-semibold' 
                    : 'text-gray-700 hover:text-teal-600'
                }`}
              >
                {link.label}
                {pathname === link.href && (
                  <motion.span 
                    layoutId="nav-underline"
                    className="absolute left-0 bottom-0 h-0.5 w-full bg-teal-600"
                    transition={{ type: 'spring', bounce: 0.25, duration: 0.5 }}
                  />
                )}
              </Link>
            ))}
          </nav>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            {/* Search Button */}
            <button 
              onClick={toggleSearch}
              className="p-2 text-gray-600 hover:text-teal-600 transition-colors"
              aria-label="Search"
            >
              <FaSearch className="text-lg sm:text-base" />
            </button>

            {/* User/Login */}
            <Link 
              href="/signin" 
              className="hidden sm:flex items-center space-x-2 p-2 text-gray-600 hover:text-teal-600 transition-colors"
            >
              <FaUserCircle className="text-xl" />
              <span className="text-base font-medium hidden md:inline">Login</span>
            </Link>

            {/* Social Icons - Desktop */}
            <div className="hidden md:flex items-center space-x-3 ml-2 sm:ml-4">
              <a href="#" className="text-gray-500 hover:text-teal-600 transition-colors p-1">
                <FaFacebookF className="text-base" />
              </a>
              <a href="#" className="text-gray-500 hover:text-teal-600 transition-colors p-1">
                <FaTwitter className="text-base" />
              </a>
              <a href="#" className="text-gray-500 hover:text-teal-600 transition-colors p-1">
                <FaLinkedinIn className="text-base" />
              </a>
              <a href="#" className="text-gray-500 hover:text-teal-600 transition-colors p-1">
                <FaInstagram className="text-base" />
              </a>
            </div>

            {/* Language Selector - Desktop */}
            {/* <div className="hidden md:block ml-2 sm:ml-4">
              <TranslateBody />
            </div> */}

            {/* Mobile Menu Button */}
            <button
              onClick={toggleMenu}
              className="lg:hidden p-2 text-gray-600 hover:text-teal-600 transition-colors"
              aria-label="Menu"
            >
              {menuOpen ? (
                <HiX className="text-2xl" />
              ) : (
                <HiOutlineMenuAlt3 className="text-2xl" />
              )}
            </button>
          </div>
        </div>

        {/* Search Panel */}
        <AnimatePresence>
          {searchOpen && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="absolute top-full left-0 w-full bg-white shadow-md z-40"
            >
              <div className="max-w-7xl mx-auto px-3 sm:px-4 py-3 flex flex-col sm:flex-row gap-2 sm:gap-0">
                <input
                  type="text"
                  placeholder="Search for investments, plans..."
                  className="flex-1 border-b border-gray-200 py-3 sm:py-2 px-3 focus:outline-none focus:border-teal-600 text-base"
                />
                <button className="px-4 py-3 sm:py-2 bg-teal-600 text-white rounded hover:bg-teal-700 transition-colors text-base whitespace-nowrap">
                  Search
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {menuOpen && (
          <>
            {/* Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-40 lg:hidden"
              onClick={toggleMenu}
            />
            
            {/* Menu Panel */}
            <motion.aside
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'tween' }}
              className="fixed top-0 right-0 w-full max-w-sm h-full bg-white shadow-xl z-50 overflow-y-auto"
            >
              <div className="flex flex-col h-full">
                {/* Header */}
                <div className="flex justify-between items-center p-4 sm:p-6 border-b">
                  <Link href="/" className="text-xl font-bold text-teal-600" onClick={toggleMenu}>
                    ChainRise-Patners
                  </Link>
                  <button onClick={toggleMenu} className="p-2">
                    <HiX className="text-2xl text-gray-500" />
                  </button>
                </div>

                {/* Navigation */}
                <nav className="flex-1 p-4 sm:p-6">
                  <ul className="space-y-2 sm:space-y-4">
                    {navLinks.map((link) => (
                      <li key={link.href}>
                        <Link
                          href={link.href}
                          onClick={toggleMenu}
                          className={`block py-3 px-3 text-lg font-medium transition-colors rounded-lg ${
                            pathname === link.href
                              ? 'text-teal-600 bg-teal-50 border-l-4 border-teal-600 pl-4'
                              : 'text-gray-700 hover:text-teal-600 hover:bg-gray-50'
                          }`}
                        >
                          {link.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </nav>

                {/* Footer */}
                <div className="p-4 sm:p-6 border-t">
                  <div className="mb-4 sm:mb-6">
                    <Link 
                      href="/signin" 
                      className="flex items-center justify-center w-full py-3 px-4 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors text-base"
                      onClick={toggleMenu}
                    >
                      <FaUserCircle className="mr-2 text-lg" />
                      Login 
                    </Link>
                  </div>

                  <div className="flex justify-center space-x-6 mb-4 sm:mb-6">
                    <a href="#" className="text-gray-500 hover:text-teal-600 p-2">
                      <FaFacebookF className="text-lg" />
                    </a>
                    <a href="#" className="text-gray-500 hover:text-teal-600 p-2">
                      <FaTwitter className="text-lg" />
                    </a>
                    <a href="#" className="text-gray-500 hover:text-teal-600 p-2">
                      <FaLinkedinIn className="text-lg" />
                    </a>
                    <a href="#" className="text-gray-500 hover:text-teal-600 p-2">
                      <FaInstagram className="text-lg" />
                    </a>
                  </div>

                  {/* <div className="flex justify-center">
                    <TranslateBody />
                  </div> */}
                </div>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Add padding to prevent content from being hidden under fixed header */}
      <div className="pt-16 sm:pt-20"></div>
    </>
  )
}