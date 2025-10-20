'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FaFacebookF,
  FaInstagram,
  FaLinkedinIn,
  FaTwitter,
} from 'react-icons/fa'
import { FiSearch } from 'react-icons/fi'
import { HiOutlineMenu, HiX } from 'react-icons/hi'

const navLinks = [
  { label: 'Home', href: '/' },
  { label: 'About', href: '/about' },
  { label: 'Expert Team', href: '/team' },
  { label: 'Investment Plan', href: '/plans' },
  { label: 'FAQ', href: '/faq' },
  { label: 'Contact', href: '/contact' },
]

export default function Nav() {
  const [menuOpen, setMenuOpen] = useState(false)

  const toggleMenu = () => setMenuOpen((prev) => !prev)

  return (
    <nav className="fixed inset-x-0 top-0 z-50 bg-white shadow-sm">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 md:px-8">
        {/* Logo */}
        <Link href="/" className="text-2xl font-bold">
          <span className="text-green-600">C</span>hainRise-Patners
        </Link>

        {/* Nav links – desktop */}
        <ul className="hidden lg:flex space-x-8 font-medium">
          {navLinks.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className="text-gray-700 transition hover:text-green-600"
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        {/* Right section */}
        <div className="flex items-center space-x-4">
          {/* Search icon (md+) */}
          <button aria-label="search" className="hidden md:block">
            <FiSearch className="text-xl text-gray-700" />
          </button>

          {/* Social icons (md+) */}
          <div className="hidden md:flex items-center space-x-4">
            <a href="#" aria-label="facebook" className="text-gray-700 hover:text-blue-600">
              <FaFacebookF />
            </a>
            <a href="#" aria-label="instagram" className="text-gray-700 hover:text-pink-500">
              <FaInstagram />
            </a>
            <a href="#" aria-label="linkedin" className="text-gray-700 hover:text-blue-700">
              <FaLinkedinIn />
            </a>
            <a href="#" aria-label="twitter" className="text-gray-700 hover:text-sky-500">
              <FaTwitter />
            </a>
          </div>

          {/* Mobile menu toggle */}
          <button onClick={toggleMenu} className="block lg:hidden" aria-label="toggle menu">
            {menuOpen ? (
              <HiX className="text-2xl" />
            ) : (
              <HiOutlineMenu className="text-2xl" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      <AnimatePresence>
        {menuOpen && (
          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween', duration: 0.3 }}
            className="fixed right-0 top-0 h-screen w-72 bg-white shadow-lg lg:hidden"
          >
            <div className="flex h-full flex-col justify-between p-6">
              <ul className="space-y-6">
                {navLinks.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      onClick={() => setMenuOpen(false)}
                      className="block text-lg font-medium text-gray-700 transition hover:text-green-600"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>

              <div className="mt-auto flex items-center space-x-4 pt-6">
                <a href="#" aria-label="facebook" className="text-gray-700 hover:text-blue-600">
                  <FaFacebookF size={20} />
                </a>
                <a href="#" aria-label="instagram" className="text-gray-700 hover:text-pink-500">
                  <FaInstagram size={20} />
                </a>
                <a href="#" aria-label="linkedin" className="text-gray-700 hover:text-blue-700">
                  <FaLinkedinIn size={20} />
                </a>
                <a href="#" aria-label="twitter" className="text-gray-700 hover:text-sky-500">
                  <FaTwitter size={20} />
                </a>
              </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>
    </nav>
  )
}
