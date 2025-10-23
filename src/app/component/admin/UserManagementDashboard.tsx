'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  FiUserX, 
  FiUserCheck, 
  FiTrash2, 
  FiAlertTriangle, 
  FiUsers,
  FiClock,
  FiSearch,
  FiFilter,
  FiX
} from 'react-icons/fi'
 
import { BanRecord, User, UserManagementResponse } from '@/types/businesses'
import { banUser, deleteUser, getAllUsers, getBannedUsers, unbanUser } from '@/lib/ban'

 

interface BannedUsersResponse {
  data: BanRecord[] | null
  error: string | null
}

export default function UserManagementDashboard() {
 const [users, setUsers] = useState<User[]>([]); // use the exact same imported type

  const [bannedUsersData, setBannedUsersData] = useState<BannedUsersResponse['data']>(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filter, setFilter] = useState<'all' | 'banned' | 'active'>('all')
  const [notification, setNotification] = useState<{ type: 'success' | 'error', message: string } | null>(null)

  // Fetch users and banned users
  useEffect(() => {
    fetchUsers()
    fetchBannedUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      const response = await getAllUsers()
      if (response.data) {
        setUsers(response.data)
      } else if (response.error) {
        showNotification('error', response.error)
      }
    } catch (error) {
      console.error('Error fetching users:', error)
      showNotification('error', 'Failed to fetch users')
    } finally {
      setLoading(false)
    }
  }

  const fetchBannedUsers = async () => {
    try {
      const response = await getBannedUsers()
      if (response.data) {
        setBannedUsersData(response.data)
      }
    } catch (error) {
      console.error('Error fetching banned users:', error)
    }
  }

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message })
    setTimeout(() => setNotification(null), 5000)
  }

  const handleBanUser = async (userId: string, username: string, duration?: number) => {
    setActionLoading(`ban-${userId}`)
    try {
      const result: UserManagementResponse = await banUser({ userId, duration })
      if (result.success) {
        showNotification('success', result.message)
        await fetchUsers()
        await fetchBannedUsers()
      } else {
        showNotification('error', result.message)
      }
    } catch (error) {
      console.error(error)
      showNotification('error', 'Failed to ban user')
    } finally {
      setActionLoading(null)
    }
  }

  const handleUnbanUser = async (userId: string ) => {
    setActionLoading(`unban-${userId}`)
    try {
      const result: UserManagementResponse = await unbanUser(userId)
      if (result.success) {
        showNotification('success', result.message)
        await fetchUsers()
        await fetchBannedUsers()
      } else {
        showNotification('error', result.message)
      }
    } catch (error) {
      console.error(error)
      showNotification('error', 'Failed to unban user')
    } finally {
      setActionLoading(null)
    }
  }

  const handleDeleteUser = async (userId: string, username: string) => {
    if (!confirm(`Are you sure you want to permanently delete user "${username}"? This action cannot be undone.`)) {
      return
    }

    setActionLoading(`delete-${userId}`)
    try {
      const result: UserManagementResponse = await deleteUser({ userId, confirm: true })
      if (result.success) {
        showNotification('success', result.message)
        await fetchUsers()
        await fetchBannedUsers()
      } else {
        showNotification('error', result.message)
      }
    } catch (error) {
      console.error(error)
      showNotification('error', 'Failed to delete user')
    } finally {
      setActionLoading(null)
    }
  }

  // Filter users based on search and filter
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filter === 'all' || 
                         (filter === 'banned' && user.is_banned) ||
                         (filter === 'active' && !user.is_banned)
    return matchesSearch && matchesFilter
  })

  const totalBanned = users.filter(user => user.is_banned).length
  const totalActive = users.filter(user => !user.is_banned).length

  // Calculate ban statistics from banned users data
  const permanentBans = bannedUsersData?.filter(ban => !ban.expires_at).length || 0
  const temporaryBans = bannedUsersData?.filter(ban => ban.expires_at).length || 0

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
              ))}
            </div>
            <div className="h-64 bg-gray-200 rounded-lg"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-2">User Management</h1>
          <p className="text-gray-600">Manage user accounts, bans, and permissions</p>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Users</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{users.length}</p>
              </div>
              <div className="p-3 bg-blue-50 rounded-lg">
                <FiUsers className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Users</p>
                <p className="text-3xl font-bold text-green-600 mt-2">{totalActive}</p>
              </div>
              <div className="p-3 bg-green-50 rounded-lg">
                <FiUserCheck className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Banned Users</p>
                <p className="text-3xl font-bold text-red-600 mt-2">{totalBanned}</p>
                <div className="text-xs text-gray-500 mt-1">
                  {permanentBans} permanent, {temporaryBans} temporary
                </div>
              </div>
              <div className="p-3 bg-red-50 rounded-lg">
                <FiUserX className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Current Bans</p>
                <p className="text-3xl font-bold text-orange-600 mt-2">{bannedUsersData?.length || 0}</p>
                <div className="text-xs text-gray-500 mt-1">
                  Active ban records
                </div>
              </div>
              <div className="p-3 bg-orange-50 rounded-lg">
                <FiAlertTriangle className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </motion.div>
        </div>

        {/* Controls */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6"
        >
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="flex-1 w-full sm:max-w-md">
              <div className="relative">
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search users by username or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <FiFilter className="text-gray-400 w-5 h-5" />
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value as 'all' | 'banned' | 'active')}
                  className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Users</option>
                  <option value="active">Active Only</option>
                  <option value="banned">Banned Only</option>
                </select>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Users Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
        >
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                <AnimatePresence>
                  {filteredUsers.map((user, index) => (
                    <motion.tr
                      key={user.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ delay: index * 0.1 }}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {user.username}
                          </div>
                          <div className="text-sm text-gray-500">
                            {user.email}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {user.is_banned ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            <FiUserX className="w-3 h-3 mr-1" />
                            Banned
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            <FiUserCheck className="w-3 h-3 mr-1" />
                            Active
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center gap-2">
                          {user.is_banned ? (
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => handleUnbanUser(user.id )}
                              disabled={actionLoading === `unban-${user.id}`}
                              className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {actionLoading === `unban-${user.id}` ? (
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                              ) : (
                                <FiUserCheck className="w-4 h-4 mr-2" />
                              )}
                              Unban
                            </motion.button>
                          ) : (
                            <div className="flex items-center gap-2">
                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => handleBanUser(user.id, user.username, 24)}
                                disabled={actionLoading === `ban-${user.id}`}
                                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                {actionLoading === `ban-${user.id}` ? (
                                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                                ) : (
                                  <FiClock className="w-4 h-4 mr-2" />
                                )}
                                24h Ban
                              </motion.button>
                              
                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => handleBanUser(user.id, user.username)}
                                disabled={actionLoading === `ban-${user.id}`}
                                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                {actionLoading === `ban-${user.id}` ? (
                                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                                ) : (
                                  <FiUserX className="w-4 h-4 mr-2" />
                                )}
                                Permanent Ban
                              </motion.button>
                            </div>
                          )}
                          
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleDeleteUser(user.id, user.username)}
                            disabled={actionLoading === `delete-${user.id}`}
                            className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm leading-4 font-medium rounded-md text-red-600 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {actionLoading === `delete-${user.id}` ? (
                              <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin mr-2" />
                            ) : (
                              <FiTrash2 className="w-4 h-4 mr-2" />
                            )}
                            Delete
                          </motion.button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
          
          {filteredUsers.length === 0 && (
            <div className="text-center py-12">
              <FiUsers className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No users found</h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchTerm ? 'Try adjusting your search terms' : 'No users match your current filters'}
              </p>
            </div>
          )}
        </motion.div>

        {/* Notification */}
        <AnimatePresence>
          {notification && (
            <motion.div
              initial={{ opacity: 0, y: 50, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 50, scale: 0.9 }}
              className={`fixed bottom-4 right-4 p-4 rounded-lg shadow-lg border ${
                notification.type === 'success' 
                  ? 'bg-green-50 border-green-200 text-green-800' 
                  : 'bg-red-50 border-red-200 text-red-800'
              }`}
            >
              <div className="flex items-center gap-3">
                {notification.type === 'success' ? (
                  <FiUserCheck className="w-5 h-5" />
                ) : (
                  <FiAlertTriangle className="w-5 h-5" />
                )}
                <span className="font-medium">{notification.message}</span>
                <button
                  onClick={() => setNotification(null)}
                  className="ml-4 hover:opacity-70 transition-opacity"
                >
                  <FiX className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}