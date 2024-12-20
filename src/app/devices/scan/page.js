'use client'
import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FiWifi, FiAlertCircle, FiCheckCircle } from 'react-icons/fi'
import { useRouter } from 'next/navigation'
import mqtt from 'mqtt'

export default function ScanDevices() {
  const [scanning, setScanning] = useState(true)
  const [foundDevices, setFoundDevices] = useState([])
  const [notification, setNotification] = useState(null)
  const mqttClientRef = useRef(null)
  const router = useRouter()

  useEffect(() => {
    let mounted = true

    const connectMqtt = async () => {
      try {
        const client = mqtt.connect('ws://192.168.2.84:9001', {
          username: 'root',
          password: 'adminse10',
          clientId: `webclient_${Math.random().toString(16).substr(2, 8)}`,
          keepalive: 30,
          reconnectPeriod: 1000,
          connectTimeout: 30 * 1000,
          clean: true
        })

        mqttClientRef.current = client

        client.on('connect', () => {
          console.log('Connected to MQTT')
          if (mounted) {
            client.subscribe('smarthome/newdevice', (err) => {
              if (err) console.error('Subscribe error:', err)
            })
          }
        })

        client.on('error', (err) => {
          console.error('MQTT Error:', err)
          if (mounted) setScanning(false)
        })

        client.on('message', (topic, message) => {
          if (!mounted) return
          try {
            const device = JSON.parse(message.toString())
            setFoundDevices(prev => {
              if (!prev.find(d => d.deviceId === device.deviceId)) {
                return [...prev, device]
              }
              return prev
            })
          } catch (error) {
            console.error('Error parsing message:', error)
          }
        })

        client.on('close', () => {
          console.log('MQTT connection closed')
          if (mounted) setScanning(false)
        })

      } catch (error) {
        console.error('Error connecting to MQTT:', error)
        if (mounted) setScanning(false)
      }
    }

    connectMqtt()

    return () => {
      mounted = false
      if (mqttClientRef.current) {
        console.log('Cleaning up MQTT connection')
        mqttClientRef.current.end(true, () => {
          console.log('MQTT connection ended')
        })
      }
    }
  }, [])

  const addDevice = async (device) => {
    try {
      const res = await fetch('/api/devices', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: `Device ${device.deviceId}`,
          device_id: device.deviceId,
          type: device.type || 'relay',
          relay_number: device.numRelays || '4'
        })
      })

      const data = await res.json()

      if (res.status === 409) {
        setNotification({
          type: 'warning',
          message: 'Device sudah terdaftar',
          deviceId: device.deviceId
        })
        return
      }

      if (!res.ok) {
        throw new Error(data.error || 'Failed to add device')
      }

      setNotification({
        type: 'success',
        message: 'Device berhasil ditambahkan',
        deviceId: device.deviceId
      })

      // Redirect setelah 2 detik
      setTimeout(() => {
        router.push('/devices')
      }, 2000)

    } catch (error) {
      console.error('Error:', error)
      setNotification({
        type: 'error',
        message: 'Gagal menambahkan device: ' + error.message,
        deviceId: device.deviceId
      })
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-xl mx-auto relative">
        {/* Background Decoration */}
        <div className="absolute top-0 right-0 w-72 h-72 bg-gradient-to-br from-blue-400/10 to-purple-400/10
                      rounded-full blur-3xl -z-10" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-gradient-to-tr from-green-400/10 to-emerald-400/10
                      rounded-full blur-3xl -z-10" />

        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600
                       bg-clip-text text-transparent drop-shadow-sm">
            Add New Device
          </h1>
          <p className="text-gray-600 mt-3 text-lg">
            Power on your device and make sure the LED is blinking
          </p>
        </motion.div>

        {/* Scanning Animation with enhanced visuals */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center py-12 relative"
        >
          <div className="relative">
            <motion.div
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.7, 1, 0.7]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="relative z-10"
            >
              <FiWifi className="w-20 h-20 text-blue-500" />
            </motion.div>

            {/* Multiple ripple effects */}
            {[1, 2, 3].map((i) => (
              <motion.div
                key={i}
                animate={{
                  scale: [1, 2.5],
                  opacity: [0.5, 0]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeOut",
                  delay: i * 0.4
                }}
                className="absolute inset-0 border-4 border-blue-500/20 rounded-full"
              />
            ))}
          </div>
          <motion.p
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="mt-8 text-lg font-medium text-gray-600"
          >
            Scanning for devices...
          </motion.p>
        </motion.div>

        {/* Notification Toast dengan styling yang lebih menarik */}
        <AnimatePresence>
          {notification && (
            <motion.div
              initial={{ opacity: 0, y: -50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -50 }}
              className={`fixed top-4 right-4 p-4 rounded-xl shadow-lg flex items-center gap-3
                        backdrop-blur-lg border ${
                          notification.type === 'success'
                            ? 'bg-green-100/90 text-green-700 border-green-200'
                            : notification.type === 'warning'
                            ? 'bg-yellow-100/90 text-yellow-700 border-yellow-200'
                            : 'bg-red-100/90 text-red-700 border-red-200'
                        }`}
            >
              <motion.div
                animate={{ rotate: [0, 15, -15, 0] }}
                transition={{ duration: 0.5 }}
              >
                {notification.type === 'success' ? <FiCheckCircle className="w-6 h-6" /> :
                 notification.type === 'warning' ? <FiAlertCircle className="w-6 h-6" /> :
                 <FiAlertCircle className="w-6 h-6" />}
              </motion.div>
              <div>
                <p className="font-medium">{notification.message}</p>
                <p className="text-sm opacity-75">Device ID: {notification.deviceId}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Found Devices dengan card design yang lebih menarik */}
        <motion.div
          className="space-y-4 mt-8"
          initial="hidden"
          animate="show"
          variants={{
            hidden: { opacity: 0 },
            show: {
              opacity: 1,
              transition: {
                staggerChildren: 0.1
              }
            }
          }}
        >
          <h2 className="text-2xl font-semibold mb-6 text-gray-800">Found Devices</h2>
          {foundDevices.map(device => (
            <motion.div
              variants={{
                hidden: { opacity: 0, y: 20 },
                show: { opacity: 1, y: 0 }
              }}
              key={device.deviceId}
              className="bg-white/70 backdrop-blur-sm p-6 rounded-2xl shadow-lg
                       border border-white/60 hover:shadow-xl transition-all
                       hover:bg-white/80"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-blue-100 to-blue-50">
                    <FiWifi className="w-8 h-8 text-blue-500" />
                  </div>
                  <div>
                    <h3 className="font-medium text-lg text-gray-800">
                      Device ID: {device.deviceId}
                    </h3>
                    <p className="text-gray-500">IP: {device.ip}</p>
                  </div>
                </div>
                <motion.button
                  whileHover={{ scale: 1.02, boxShadow: "0 10px 20px -10px rgba(59, 130, 246, 0.3)" }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => addDevice(device)}
                  className="px-6 py-2.5 bg-gradient-to-br from-blue-500 to-indigo-600
                           text-white rounded-xl shadow-lg hover:shadow-blue-500/25
                           font-medium transition-all flex items-center gap-2"
                >
                  <FiWifi className="w-4 h-4" />
                  Add Device
                </motion.button>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  )
}
