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
  { label: 'Our Team', href: '/team' },
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
      <div className="bg-teal-700 text-white text-sm py-2 px-4 text-center">
        <p>Get 5% bonus on your first investment - Limited time offer</p>
      </div>

      {/* Main Navigation */}
      <header className={`fixed w-full z-50 transition-all duration-300 ${scrolled ? 'bg-white shadow-md py-2' : 'bg-white/90 backdrop-blur-sm py-4'}`}>
        <div className="container mx-auto px-4 flex justify-between items-center">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <motion.div 
              whileHover={{ scale: 1.05 }}
              className="flex items-center"
            >
              <span className="text-3xl font-bold text-teal-600">ChainRise-</span>
              <span className="text-2xl font-bold text-gray-800 ml-1">Patners</span>
              <span className="text-xs font-medium bg-teal-100 text-teal-800 px-2 py-1 rounded-full ml-2">PRO</span>
            </motion.div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`relative px-1 py-2 text-sm font-medium transition-colors ${
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
          <div className="flex items-center space-x-4">
            {/* Search Button */}
            <button 
              onClick={toggleSearch}
              className="p-2 text-gray-600 hover:text-teal-600 transition-colors"
              aria-label="Search"
            >
              <FaSearch className="text-lg" />
            </button>

            {/* User/Login */}
            <Link 
              href="/signin" 
              className="hidden md:flex items-center space-x-2 p-2 text-gray-600 hover:text-teal-600 transition-colors"
            >
              <FaUserCircle className="text-xl" />
              <span className="text-sm font-medium">Login</span>
            </Link>

            {/* Social Icons - Desktop */}
            <div className="hidden md:flex items-center space-x-3 ml-4">
              <a href="#" className="text-gray-500 hover:text-teal-600 transition-colors">
                <FaFacebookF className="text-sm" />
              </a>
              <a href="#" className="text-gray-500 hover:text-teal-600 transition-colors">
                <FaTwitter className="text-sm" />
              </a>
              <a href="#" className="text-gray-500 hover:text-teal-600 transition-colors">
                <FaLinkedinIn className="text-sm" />
              </a>
              <a href="#" className="text-gray-500 hover:text-teal-600 transition-colors">
                <FaInstagram className="text-sm" />
              </a>
            </div>

            {/* Language Selector - Desktop */}
            {/* <div className="hidden md:block ml-4">
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
              <div className="container mx-auto px-4 py-3 flex">
                <input
                  type="text"
                  placeholder="Search for investments, plans..."
                  className="flex-1 border-b border-gray-200 py-2 px-3 focus:outline-none focus:border-teal-600"
                />
                <button className="ml-4 px-4 py-2 bg-teal-600 text-white rounded hover:bg-teal-700 transition-colors">
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
              className="fixed top-0 right-0 w-80 h-full bg-white shadow-xl z-50 overflow-y-auto"
            >
              <div className="flex flex-col h-full">
                {/* Header */}
                <div className="flex justify-between items-center p-6 border-b">
                  <Link href="/" className="text-xl font-bold text-teal-600">
                    Accilent
                  </Link>
                  <button onClick={toggleMenu}>
                    <HiX className="text-2xl text-gray-500" />
                  </button>
                </div>

                {/* Navigation */}
                <nav className="flex-1 p-6">
                  <ul className="space-y-4">
                    {navLinks.map((link) => (
                      <li key={link.href}>
                        <Link
                          href={link.href}
                          onClick={toggleMenu}
                          className={`block py-3 px-2 text-lg font-medium transition-colors ${
                            pathname === link.href
                              ? 'text-teal-600 border-l-4 border-teal-600 pl-4'
                              : 'text-gray-700 hover:text-teal-600 hover:bg-gray-50 rounded'
                          }`}
                        >
                          {link.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </nav>

                {/* Footer */}
                <div className="p-6 border-t">
                  <div className="mb-6">
                    <Link 
                      href="/signin" 
                      className="flex items-center justify-center w-full py-3 px-4 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
                    >
                      <FaUserCircle className="mr-2" />
                      Login 
                    </Link>
                  </div>

                  <div className="flex justify-center space-x-6 mb-6">
                    <a href="#" className="text-gray-500 hover:text-teal-600">
                      <FaFacebookF />
                    </a>
                    <a href="#" className="text-gray-500 hover:text-teal-600">
                      <FaTwitter />
                    </a>
                    <a href="#" className="text-gray-500 hover:text-teal-600">
                      <FaLinkedinIn />
                    </a>
                    <a href="#" className="text-gray-500 hover:text-teal-600">
                      <FaInstagram />
                    </a>
                  </div>

                
                </div>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  )
}