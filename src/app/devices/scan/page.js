'use client'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { FiSearch, FiWifi, FiPlus } from 'react-icons/fi'
import { useRouter } from 'next/navigation'

export default function ScanDevices() {
  const [scanning, setScanning] = useState(false)
  const [foundDevices, setFoundDevices] = useState([])
  const [connecting, setConnecting] = useState(false)
  const router = useRouter()

  const startScan = async () => {
    setScanning(true)
    // Mulai scan network untuk device baru
    await fetch('/api/devices/scan', { method: 'POST' })
    
    // Subscribe ke MQTT topic untuk device discovery
    // Biasanya device akan broadcast info mereka
  }

  const handleDeviceFound = (device) => {
    setFoundDevices(prev => [...prev, device])
  }

  const connectDevice = async (device) => {
    setConnecting(true)
    try {
      const res = await fetch('/api/devices/connect', {
        method: 'POST',
        body: JSON.stringify(device)
      })
      
      if (res.ok) {
        // Device berhasil terhubung
        router.push('/devices')
      }
    } catch (error) {
      console.error('Failed to connect device:', error)
    }
    setConnecting(false)
  }

  return (
    <div className="p-6 max-w-xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold mb-2">Add New Device</h1>
        <p className="text-gray-500">
          Power on your device and make sure the LED is blinking
        </p>
      </div>

      {!scanning ? (
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={startScan}
          className="w-full py-4 bg-blue-500 text-white rounded-xl 
                   flex items-center justify-center gap-2"
        >
          <FiSearch className="text-xl" />
          <span>Start Scanning</span>
        </motion.button>
      ) : (
        <div className="space-y-6">
          {/* Scanning Animation */}
          <div className="flex flex-col items-center">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            >
              <FiWifi className="text-4xl text-blue-500" />
            </motion.div>
            <p className="mt-4 text-gray-600">Scanning for devices...</p>
          </div>

          {/* Found Devices */}
          <div className="space-y-4">
            {foundDevices.map(device => (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                key={device.id}
                className="bg-white p-4 rounded-xl shadow-lg"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">{device.name}</h3>
                    <p className="text-sm text-gray-500">{device.type}</p>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => connectDevice(device)}
                    className="px-4 py-2 bg-green-500 text-white rounded-lg"
                  >
                    <FiPlus />
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
} 