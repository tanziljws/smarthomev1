'use client'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { FiWifi, FiCheck, FiCopy } from 'react-icons/fi'

export default function PairDevice() {
  const [step, setStep] = useState(1)
  const [deviceId, setDeviceId] = useState('')
  
  const copyDeviceId = () => {
    navigator.clipboard.writeText(deviceId)
  }

  return (
    <div className="p-6 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-6">Pair New Device</h1>
      
      {/* Step 1: Power On */}
      <div className={`mb-6 ${step !== 1 && 'opacity-50'}`}>
        <h2 className="font-semibold mb-2">1. Power on your device</h2>
        <p className="text-gray-600 mb-4">
          Plug in your device and wait for the LED to start blinking
        </p>
        {step === 1 && (
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => setStep(2)}
            className="w-full py-2 bg-blue-500 text-white rounded-lg"
          >
            Device is powered on
          </motion.button>
        )}
      </div>

      {/* Step 2: Connect to WiFi */}
      <div className={`mb-6 ${step !== 2 && 'opacity-50'}`}>
        <h2 className="font-semibold mb-2">2. Connect to device WiFi</h2>
        <p className="text-gray-600 mb-4">
          Connect to WiFi network named "SmartHome_XXXX"
        </p>
        {step === 2 && (
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => setStep(3)}
            className="w-full py-2 bg-blue-500 text-white rounded-lg"
          >
            Connected to device WiFi
          </motion.button>
        )}
      </div>

      {/* Step 3: Configure Device */}
      <div className={`mb-6 ${step !== 3 && 'opacity-50'}`}>
        <h2 className="font-semibold mb-2">3. Configure device</h2>
        <p className="text-gray-600 mb-4">
          Copy this Device ID and paste it in the configuration portal at 
          192.168.4.1
        </p>
        {step === 3 && (
          <div className="flex items-center space-x-2 mb-4">
            <input
              type="text"
              value={deviceId}
              readOnly
              className="flex-1 p-2 border rounded"
            />
            <button
              onClick={copyDeviceId}
              className="p-2 text-blue-500 hover:bg-blue-50 rounded"
            >
              <FiCopy />
            </button>
          </div>
        )}
      </div>

      {/* Success Message */}
      {step === 4 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center text-green-500"
        >
          <FiCheck className="w-16 h-16 mx-auto mb-4" />
          <h2 className="text-xl font-bold">Device Paired Successfully!</h2>
        </motion.div>
      )}
    </div>
  )
} 