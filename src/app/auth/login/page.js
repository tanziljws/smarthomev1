'use client'
import { useState, useEffect } from 'react'
import { signIn, useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { FiMail, FiSmartphone, FiLock, FiArrowRight } from 'react-icons/fi'
import { FcGoogle } from 'react-icons/fc'

export default function Login() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [isWhatsappTab, setIsWhatsappTab] = useState(false)
  const [whatsapp, setWhatsapp] = useState('')
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [isOtpSent, setIsOtpSent] = useState(false)

  useEffect(() => {
    if (session) {
      router.push('/')
    }
  }, [session, router])

  const handleOtpChange = (index, value) => {
    if (value.length > 1) return // Prevent multiple digits
    const newOtp = [...otp]
    newOtp[index] = value
    setOtp(newOtp)
    
    // Auto focus next input
    if (value && index < 5) {
      const nextInput = document.querySelector(`input[name=otp-${index + 1}]`)
      if (nextInput) nextInput.focus()
    }
  }

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.querySelector(`input[name=otp-${index - 1}]`)
      if (prevInput) prevInput.focus()
    }
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full"
      >
        {/* Logo or App Name */}
        <div className="text-center mb-8">
          <motion.h1
            initial={{ scale: 0.5 }}
            animate={{ scale: 1 }}
            className="text-4xl font-bold bg-gradient-to-r from-blue-500 to-indigo-600 
                     bg-clip-text text-transparent"
          >
            Smart Home
          </motion.h1>
          <p className="text-gray-600 mt-2">Control your home, anywhere</p>
        </div>

        <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
          {/* Login Tabs */}
          <div className="flex mb-8">
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsWhatsappTab(false)}
              className={`flex-1 py-4 text-center transition-colors relative ${
                !isWhatsappTab ? 'text-blue-600' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Sign in with Google
              {!isWhatsappTab && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"
                />
              )}
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsWhatsappTab(true)}
              className={`flex-1 py-4 text-center transition-colors relative ${
                isWhatsappTab ? 'text-blue-600' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              WhatsApp Login
              {isWhatsappTab && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"
                />
              )}
            </motion.button>
          </div>

          <div className="px-8 pb-8">
            <motion.div
              initial={{ opacity: 0, x: isWhatsappTab ? 20 : -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.2 }}
            >
              {isWhatsappTab ? (
                <div className="space-y-6">
                  {!isOtpSent ? (
                    <div className="space-y-4">
                      <div className="relative">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          WhatsApp Number
                        </label>
                        <div className="relative">
                          <FiSmartphone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                          <input
                            type="tel"
                            value={whatsapp}
                            onChange={(e) => setWhatsapp(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 
                                     focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="+62xxx"
                          />
                        </div>
                      </div>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setIsOtpSent(true)}
                        className="w-full py-3 bg-green-500 text-white rounded-xl
                                 hover:bg-green-600 transition-colors flex items-center 
                                 justify-center space-x-2"
                      >
                        <span>Send OTP</span>
                        <FiArrowRight />
                      </motion.button>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-3">
                          Enter OTP Code
                        </label>
                        <div className="flex justify-between gap-2">
                          {otp.map((digit, index) => (
                            <input
                              key={index}
                              type="text"
                              name={`otp-${index}`}
                              maxLength={1}
                              value={digit}
                              onChange={(e) => handleOtpChange(index, e.target.value)}
                              onKeyDown={(e) => handleKeyDown(index, e)}
                              className="w-12 h-12 text-center text-lg font-semibold rounded-lg border 
                                       border-gray-200 focus:ring-2 focus:ring-blue-500 
                                       focus:border-transparent"
                            />
                          ))}
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <button
                          onClick={() => setIsOtpSent(false)}
                          className="text-sm text-gray-600 hover:text-gray-800"
                        >
                          Change Number
                        </button>
                        <button className="text-sm text-blue-600 hover:text-blue-800">
                          Resend OTP
                        </button>
                      </div>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="w-full py-3 bg-blue-500 text-white rounded-xl
                                 hover:bg-blue-600 transition-colors"
                      >
                        Verify & Login
                      </motion.button>
                    </div>
                  )}
                </div>
              ) : (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => signIn('google')}
                  className="w-full py-3 px-4 bg-white border-2 border-gray-200 rounded-xl
                           hover:bg-gray-50 transition-colors flex items-center justify-center 
                           space-x-2 group"
                >
                  <FcGoogle className="w-5 h-5" />
                  <span className="text-gray-700 group-hover:text-gray-900">
                    Continue with Google
                  </span>
                </motion.button>
              )}
            </motion.div>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-gray-600 mt-8">
          By continuing, you agree to our{' '}
          <a href="#" className="text-blue-600 hover:underline">Terms of Service</a>
          {' '}and{' '}
          <a href="#" className="text-blue-600 hover:underline">Privacy Policy</a>
        </p>
      </motion.div>
    </div>
  )
} 