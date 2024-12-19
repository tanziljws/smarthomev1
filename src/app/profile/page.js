'use client'
import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { motion, AnimatePresence } from 'framer-motion'
import { FiUser, FiBell, FiMoon, FiSun, FiSmartphone, FiMail, FiMapPin, FiSave } from 'react-icons/fi'

export default function Profile() {
  const { data: session } = useSession()
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState(null)
  const [activeTab, setActiveTab] = useState('personal')
  const [formData, setFormData] = useState({
    displayName: '',
    phone: '',
    address: '',
    email: '',
    notifications: {
      email: true,
      push: true,
      whatsapp: false
    },
    theme: 'light'
  })

  useEffect(() => {
    if (session?.user) {
      fetch('/api/user/profile')
        .then(res => res.json())
        .then(data => {
          setFormData(prev => ({
            ...prev,
            displayName: data.display_name || session.user.name,
            email: session.user.email,
            phone: data.phone || '',
            address: data.address || '',
            notifications: data.notifications || prev.notifications,
            theme: data.theme || prev.theme
          }))
        })
    }
  }, [session])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch('/api/user/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (res.ok) {
        setMessage({ type: 'success', text: 'Profile updated successfully!' })
      } else {
        throw new Error('Failed to update profile')
      }
    } catch (error) {
      setMessage({ type: 'error', text: error.message })
    } finally {
      setLoading(false)
      setTimeout(() => setMessage(null), 3000)
    }
  }

  if (!session) {
    return <div>Please sign in to view this page.</div>
  }

  const tabs = [
    { id: 'personal', label: 'Personal Info', icon: FiUser },
    { id: 'notifications', label: 'Notifications', icon: FiBell },
    { id: 'appearance', label: 'Appearance', icon: FiMoon }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl shadow-xl overflow-hidden"
        >
          {/* Profile Header */}
          <div className="relative h-48 bg-gradient-to-r from-blue-500 to-indigo-600">
            <div className="absolute -bottom-16 left-8">
              <div className="relative">
                <img
                  src={session.user.image || '/default-avatar.png'}
                  alt="Profile"
                  className="w-32 h-32 rounded-full border-4 border-white shadow-lg"
                />
                <motion.div
                  className="absolute bottom-0 right-0 bg-white p-2 rounded-full shadow-lg cursor-pointer"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <FiUser className="w-5 h-5 text-blue-500" />
                </motion.div>
              </div>
            </div>
          </div>

          <div className="mt-20 px-8 pb-8">
            <h1 className="text-3xl font-bold text-gray-800">{formData.displayName}</h1>
            <p className="text-gray-600">{formData.email}</p>

            {/* Tabs */}
            <div className="flex space-x-1 mt-8 bg-gray-100 p-1 rounded-xl">
              {tabs.map((tab) => (
                <motion.button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg flex-1 ${
                    activeTab === tab.id 
                      ? 'bg-white shadow-sm' 
                      : 'hover:bg-white/50'
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <tab.icon className={`w-5 h-5 ${
                    activeTab === tab.id ? 'text-blue-500' : 'text-gray-500'
                  }`} />
                  <span className={activeTab === tab.id ? 'text-blue-500' : 'text-gray-500'}>
                    {tab.label}
                  </span>
                </motion.button>
              ))}
            </div>

            <form onSubmit={handleSubmit} className="mt-8">
              <AnimatePresence mode="wait">
                {activeTab === 'personal' && (
                  <motion.div
                    key="personal"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-6"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="flex items-center text-gray-700 font-medium">
                          <FiUser className="w-5 h-5 mr-2" />
                          Display Name
                        </label>
                        <input
                          type="text"
                          value={formData.displayName}
                          onChange={(e) => setFormData({...formData, displayName: e.target.value})}
                          className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 
                                   focus:ring-blue-500 focus:border-transparent transition-all"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="flex items-center text-gray-700 font-medium">
                          <FiMail className="w-5 h-5 mr-2" />
                          Email
                        </label>
                        <input
                          type="email"
                          value={formData.email}
                          disabled
                          className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="flex items-center text-gray-700 font-medium">
                          <FiSmartphone className="w-5 h-5 mr-2" />
                          Phone Number
                        </label>
                        <input
                          type="tel"
                          value={formData.phone}
                          onChange={(e) => setFormData({...formData, phone: e.target.value})}
                          className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 
                                   focus:ring-blue-500 focus:border-transparent transition-all"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="flex items-center text-gray-700 font-medium">
                          <FiMapPin className="w-5 h-5 mr-2" />
                          Address
                        </label>
                        <textarea
                          value={formData.address}
                          onChange={(e) => setFormData({...formData, address: e.target.value})}
                          className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 
                                   focus:ring-blue-500 focus:border-transparent transition-all"
                          rows={3}
                        />
                      </div>
                    </div>
                  </motion.div>
                )}

                {activeTab === 'notifications' && (
                  <motion.div
                    key="notifications"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-6"
                  >
                    <div className="bg-white rounded-xl space-y-4">
                      {Object.entries({
                        email: { label: 'Email Notifications', icon: FiMail },
                        push: { label: 'Push Notifications', icon: FiBell },
                        whatsapp: { label: 'WhatsApp Notifications', icon: FiSmartphone }
                      }).map(([key, { label, icon: Icon }]) => (
                        <label key={key} className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-xl transition-colors">
                          <div className="flex items-center space-x-3">
                            <Icon className="w-5 h-5 text-gray-500" />
                            <span className="text-gray-700">{label}</span>
                          </div>
                          <div className="relative">
                            <input
                              type="checkbox"
                              checked={formData.notifications[key]}
                              onChange={(e) => setFormData({
                                ...formData,
                                notifications: {
                                  ...formData.notifications,
                                  [key]: e.target.checked
                                }
                              })}
                              className="sr-only"
                            />
                            <div className={`w-14 h-7 rounded-full transition-colors ${
                              formData.notifications[key] ? 'bg-blue-500' : 'bg-gray-200'
                            }`}>
                              <div className={`absolute w-5 h-5 rounded-full bg-white shadow-sm transform transition-transform top-1 ${
                                formData.notifications[key] ? 'translate-x-8' : 'translate-x-1'
                              }`} />
                            </div>
                          </div>
                        </label>
                      ))}
                    </div>
                  </motion.div>
                )}

                {activeTab === 'appearance' && (
                  <motion.div
                    key="appearance"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-6"
                  >
                    <div className="grid grid-cols-2 gap-4">
                      {['light', 'dark'].map((theme) => (
                        <motion.label
                          key={theme}
                          className={`flex flex-col items-center p-6 rounded-xl cursor-pointer border-2 transition-all ${
                            formData.theme === theme 
                              ? 'border-blue-500 bg-blue-50' 
                              : 'border-gray-200 hover:border-blue-200'
                          }`}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          {theme === 'light' ? (
                            <FiSun className="w-8 h-8 text-orange-400 mb-3" />
                          ) : (
                            <FiMoon className="w-8 h-8 text-indigo-400 mb-3" />
                          )}
                          <input
                            type="radio"
                            name="theme"
                            value={theme}
                            checked={formData.theme === theme}
                            onChange={(e) => setFormData({...formData, theme: e.target.value})}
                            className="sr-only"
                          />
                          <span className="capitalize text-gray-700 font-medium">
                            {theme} Mode
                          </span>
                        </motion.label>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Save Button */}
              <motion.button
                type="submit"
                disabled={loading}
                className="mt-8 w-full flex items-center justify-center space-x-2 px-8 py-4 
                         bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl
                         hover:from-blue-600 hover:to-indigo-700 focus:ring-2 focus:ring-blue-500 
                         focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed
                         transition-all"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <FiSave className="w-5 h-5" />
                <span>{loading ? 'Saving...' : 'Save Changes'}</span>
              </motion.button>
            </form>

            {/* Success/Error Message */}
            <AnimatePresence>
              {message && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className={`mt-4 p-4 rounded-xl flex items-center space-x-2 ${
                    message.type === 'success' 
                      ? 'bg-green-50 text-green-700 border border-green-200' 
                      : 'bg-red-50 text-red-700 border border-red-200'
                  }`}
                >
                  {message.type === 'success' ? (
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  )}
                  <span>{message.text}</span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </div>
  )
} 