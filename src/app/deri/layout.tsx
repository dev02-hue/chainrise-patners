// app/deri/layout.tsx
"use client"
import Link from "next/link";
import { ReactNode, useState } from "react";
import { AiFillTrademarkCircle } from "react-icons/ai";
import { BsDatabaseCheck } from "react-icons/bs";
import { FiUsers, FiUpload, FiDownload, FiMenu, FiX, FiHome, FiTrendingUp, FiMail } from "react-icons/fi";
import { MdAnalytics } from "react-icons/md";
import { RiUserUnfollowLine } from "react-icons/ri";
 
export default function AdminLayout({ children }: { children: ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const menuItems = [
    // { href: "/deri", label: "Dashboard", icon: MdDashboard },
    {
    href: "/deri",
    label: "All Users",
    icon: FiUsers,
  },
  {
    href: "/deri/deposit",
    label: "Deposit Request",
    icon: FiUpload,
  },
  {
    href: "/deri/all-deposit",
    label: "All Deposits",
    icon: BsDatabaseCheck, // ✅ represents a verified or completed deposit
  },
  {
    href: "/deri/deposit-analytics",
    label: "Deposit Analytics",
    icon: MdAnalytics,
  },
  {
    href: "/deri/email-user",
    label: "Mail User",
    icon: FiMail,
  },
  {
    href: "/deri/withdrawal",
    label: "Withdrawal Request",
    icon: FiDownload,
  },
  {
    href: "/deri/all-withdrawal",
    label: "All Withdrawals",
    icon: FiTrendingUp, // ✅ looks like financial growth/transactions
  },
  {
    href: "/deri/investment-plans",
    label: "Investment Plans",
    icon: AiFillTrademarkCircle,
  },
  {
    href: "/deri/ban-delete",
    label: "Ban/Delete User",
    icon: RiUserUnfollowLine, // ✅ clearly shows removing or banning a user
  },
  ];

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={`
          fixed md:static inset-y-0 left-0 z-30
          w-64 bg-white border-r border-gray-200
          transform transition-transform duration-300 ease-in-out
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
          flex flex-col
        `}
      >
        {/* Sidebar Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
              <FiHome className="text-white text-sm" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-800">Quantum Invest</h1>
              <p className="text-xs text-gray-500 font-medium">Admin Panel</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {menuItems.map((item ,index) => (
            <Link
              key={`${item.href}-${index}`}
              href={item.href}
              className="flex items-center space-x-3 px-4 py-3 rounded-xl text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-all duration-200 group"
              onClick={() => setIsSidebarOpen(false)}
            >
              <item.icon className="text-lg text-gray-400 group-hover:text-blue-500 transition-colors" />
              <span className="font-medium text-sm">{item.label}</span>
            </Link>
          ))}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-gray-200">
          <div className="px-4 py-3 bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl">
            <p className="text-xs text-gray-600 font-medium">Admin Access</p>
            <p className="text-xs text-gray-500 mt-1">Secure Management Portal</p>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <header className="bg-white border-b border-gray-200">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors md:hidden"
              >
                {isSidebarOpen ? <FiX size={20} /> : <FiMenu size={20} />}
              </button>
              <div>
                <h1 className="text-lg font-semibold text-gray-800">Admin Dashboard</h1>
                <p className="text-sm text-gray-500">Manage your investment platform</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-semibold">A</span>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 bg-gray-50 overflow-auto">
          <div className="p-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}