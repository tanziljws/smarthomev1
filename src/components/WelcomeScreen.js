'use client'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { signOut } from 'next-auth/react'

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
      className="fixed inset-0 bg-white z-50 flex items-center justify-center"
    >
      {step === 1 ? (
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="max-w-md w-full p-8 bg-white rounded-2xl shadow-xl"
        >
          <h2 className="text-3xl font-bold text-center mb-8">
            Welcome to Smart Home! 🏠
          </h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Display Name
              </label>
              <input
                type="text"
                value={formData.displayName}
                onChange={(e) => setFormData({...formData, displayName: e.target.value})}
                className="w-full px-4 py-2 rounded-lg border focus:ring-2 
                         focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                className="w-full px-4 py-2 rounded-lg border focus:ring-2 
                         focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Address
              </label>
              <textarea
                value={formData.address}
                onChange={(e) => setFormData({...formData, address: e.target.value})}
                className="w-full px-4 py-2 rounded-lg border focus:ring-2 
                         focus:ring-blue-500 focus:border-transparent"
                rows={3}
                required
              />
            </div>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              className="w-full py-3 bg-blue-500 text-white rounded-lg
                       hover:bg-blue-600 transition-colors"
            >
              Continue
            </motion.button>
          </form>
        </motion.div>
      ) : (
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center"
        >
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              rotate: [0, 360]
            }}
            transition={{ duration: 1.5 }}
            className="text-6xl mb-4"
          >
            🎉
          </motion.div>
          <h2 className="text-3xl font-bold mb-2">
            Welcome, {formData.displayName}!
          </h2>
          <p className="text-gray-600">
            Your smart home journey begins now
          </p>
        </motion.div>
      )}
    </motion.div>
  )
} 