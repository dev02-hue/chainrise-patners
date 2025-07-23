import React from 'react';
import {
  FaCoins,
  FaArrowUp,
  FaBriefcase,
  FaLink,
  FaArrowDown,
} from 'react-icons/fa';

const UserDashboard: React.FC = () => {
  const user = {
    username: 'alaska001',
    referralLink: `https://accilentfinlimited.com?ref_id=alaska001`,
  };

  const stats = [
    { title: 'Account balance', amount: 0, icon: <FaCoins className="text-green-800 text-3xl" /> },
    { title: 'Total deposit', amount: 0, icon: <FaArrowUp className="text-green-800 text-3xl" /> },
    { title: 'Current investment', amount: 0, icon: <FaBriefcase className="text-green-800 text-3xl" /> },
    { title: 'Total bonus and interest', amount: 0, icon: <FaLink className="text-green-800 text-3xl" /> },
    { title: 'Total withdrawal', amount: 0, icon: <FaArrowDown className="text-green-800 text-3xl" /> },
    { title: 'Pending withdrawal', amount: 0, icon: <FaArrowDown className="text-green-800 text-3xl" /> },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      {/* Success alert */}
      <div className="bg-green-100 border border-green-300 text-green-800 px-4 py-3 rounded mb-4">
        <strong>Success:</strong> signin successful
      </div>

      {/* Welcome and referral */}
      <h1 className="text-2xl font-bold mb-2">User Dashboard</h1>
      <p className="mb-6">
        welcome <strong>{user.username}</strong>, your referral link is:
        <span className="text-red-600 ml-2 break-all">{user.referralLink}</span>
      </p>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {stats.map((stat, index) => (
          <div
            key={index}
            className="bg-white shadow-md rounded-md p-4 flex items-center justify-between border-t-4 border-green-800"
          >
            <div>
              <p className="text-gray-500 text-sm">{stat.title}</p>
              <p className="text-xl font-bold">${Number(stat.amount).toFixed(2)}</p>
            </div>
            {stat.icon}
          </div>
        ))}
      </div>

      {/* Transactions */}
      <h2 className="text-green-700 font-semibold text-lg">Recent Transactions</h2>
    </div>
  );
};

export default UserDashboard;
