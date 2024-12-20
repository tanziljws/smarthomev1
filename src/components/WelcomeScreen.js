'use client'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { FiUser, FiPhone, FiMapPin, FiArrowRight } from 'react-icons/fi'

export default function WelcomeScreen({ user, onComplete }) {
  const [formData, setFormData] = useState({
    displayName: user?.name || '',
    phone: '',
    address: ''
  })
  const [step, setStep] = useState(1)

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const res = await fetch('/api/user/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (res.ok) {
        setStep(2)
        setTimeout(() => {
          onComplete()
        }, 2000)
      }
    } catch (error) {
      console.error('Error saving profile:', error)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 bg-gradient-to-br from-blue-50 via-white to-indigo-50 z-50
                flex items-center justify-center p-6"
    >
      {/* Decorative Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-blue-400/20 to-indigo-400/20
                      rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-br from-indigo-400/20 to-purple-400/20
                      rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      {step === 1 ? (
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          className="max-w-md w-full relative"
        >
          {/* Welcome Card */}
          <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/50 overflow-hidden">
            {/* Header Section */}
            <div className="bg-gradient-to-r from-blue-500 to-indigo-500 p-8 text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />
              <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="relative"
              >
                <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mb-4 backdrop-blur-sm">
                  <span className="text-4xl">🏠</span>
                </div>
                <h2 className="text-3xl font-bold">Welcome to Smart Home!</h2>
                <p className="text-blue-100 mt-2">Let's set up your profile to get started</p>
              </motion.div>
            </div>

            {/* Form Section */}
            <div className="p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                      <FiUser className="w-4 h-4 text-blue-500" />
                      Display Name
                    </label>
                    <input
                      type="text"
                      value={formData.displayName}
                      onChange={(e) => setFormData({...formData, displayName: e.target.value})}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200
                               focus:ring-2 focus:ring-blue-500 focus:border-transparent
                               bg-white/50 backdrop-blur-sm transition-all"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                      <FiPhone className="w-4 h-4 text-blue-500" />
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200
                               focus:ring-2 focus:ring-blue-500 focus:border-transparent
                               bg-white/50 backdrop-blur-sm transition-all"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                      <FiMapPin className="w-4 h-4 text-blue-500" />
                      Address
                    </label>
                    <textarea
                      value={formData.address}
                      onChange={(e) => setFormData({...formData, address: e.target.value})}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200
                               focus:ring-2 focus:ring-blue-500 focus:border-transparent
                               bg-white/50 backdrop-blur-sm transition-all"
                      rows={3}
                      required
                    />
                  </div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  className="w-full py-4 bg-gradient-to-r from-blue-500 to-indigo-500
                           text-white rounded-xl font-medium shadow-lg shadow-blue-500/25
                           hover:shadow-xl hover:shadow-blue-500/40 transition-all
                           flex items-center justify-center gap-2 group"
                >
                  <span>Start Your Journey</span>
                  <FiArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </motion.button>
              </form>
            </div>
          </div>
        </motion.div>
      ) : (
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white/70 backdrop-blur-xl p-12 rounded-3xl shadow-2xl
                   border border-white/50 text-center relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-indigo-500/5" />
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              rotate: [0, 360]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              repeatType: "reverse"
            }}
            className="text-7xl mb-8 inline-block"
          >
            🎉
          </motion.div>
          <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-indigo-600
                       bg-clip-text text-transparent">
            Welcome, {formData.displayName}!
          </h2>
          <p className="text-gray-600 text-lg">
            Your smart home journey begins now
          </p>
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-8 flex justify-center gap-2"
          >
            {[0, 1, 2].map((i) => (
              <div key={i}
                   className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"
                   style={{ animationDelay: `${i * 0.2}s` }}
              />
            ))}
          </motion.div>
        </motion.div>
      )}
    </motion.div>
  )
} 
