'use client'
import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { FiPower, FiWifi, FiSettings, FiInfo, FiRefreshCw, FiCpu, FiToggleLeft, FiZap, FiClock } from 'react-icons/fi'
import mqtt from 'mqtt'

const MQTT_CONFIG = {
  url: 'ws://192.168.2.84:9001',
  username: 'root',
  password: 'adminse10',
  keepalive: 60,
  reconnectPeriod: 5000,
  connectTimeout: 30 * 1000
}

export default function DeviceControl() {
  const { id } = useParams()
  const [device, setDevice] = useState(null)
  const [status, setStatus] = useState({
    online: false,
    relays: [false, false, false, false]
  })
  const [client, setClient] = useState(null)
  const [error, setError] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [lastToggled, setLastToggled] = useState(null)
  const [showPowerRipple, setShowPowerRipple] = useState(false)

  // Fetch device info first
  useEffect(() => {
    const fetchDevice = async () => {
      try {
        const res = await fetch(`/api/devices/${id}`)
        const data = await res.json()
        setDevice(data)
        console.log('Device data:', data)
      } catch (error) {
        console.error('Error fetching device:', error)
      }
    }
    fetchDevice()
  }, [id])

  // Connect to MQTT
  useEffect(() => {
    if (!device?.device_id) return

    console.log('Connecting to MQTT for device:', device.device_id)
    const mqttClient = mqtt.connect(MQTT_CONFIG.url, {
      ...MQTT_CONFIG,
      clientId: `webclient_${Math.random().toString(16).substr(2, 8)}`
    })

    // Tambahkan error boundary
    try {
      // Add connection error handling
      mqttClient.on('error', (err) => {
        console.error('MQTT connection error:', err)
        setStatus(prev => ({ ...prev, online: false }))
      })

      // Add reconnect handling
      mqttClient.on('reconnect', () => {
        console.log('Attempting to reconnect to MQTT...')
      })

      mqttClient.on('connect', () => {
        console.log('Connected to MQTT')
        // Request initial status after connection
        mqttClient.publish(`smarthome/${device.device_id}/get_status`, '')

        // Subscribe to topics
        const topics = [
          `smarthome/${device.device_id}/status`,
          'smarthome/newdevice'
        ]
        topics.forEach(topic => mqttClient.subscribe(topic))
      })

      mqttClient.on('message', (topic, message) => {
        console.log('Message received:', topic, message.toString())
        try {
          const data = JSON.parse(message.toString())

          if (topic === 'smarthome/newdevice') {
            if (data.deviceId === device.device_id) {
              setStatus(prev => ({ ...prev, online: true }))
            }
          }
          else if (topic === `smarthome/${device.device_id}/status`) {
            setStatus({
              online: data.online,
              relays: data.relays || [false, false, false, false]
            })
          }
        } catch (error) {
          console.error('Error parsing message:', error)
        }
      })

      setClient(mqttClient)
    } catch (err) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }

    return () => {
      if (mqttClient) {
        const topics = [
          `smarthome/${device.device_id}/status`,
          'smarthome/newdevice'
        ]
        topics.forEach(topic => mqttClient.unsubscribe(topic))
        mqttClient.end(true) // Force disconnect
      }
    }
  }, [device])

  const toggleRelay = async (index) => {
    if (!client || !device || !status.online) return

    setLastToggled(index)
    setShowPowerRipple(true)
    setTimeout(() => setShowPowerRipple(false), 1000)

    const maxRetries = 3
    let retryCount = 0

    while (retryCount < maxRetries) {
      try {
        const topic = `smarthome/${device.device_id}/control`
        const message = {
          relay: index,
          state: !status.relays[index]
        }

        await new Promise((resolve, reject) => {
          client.publish(topic, JSON.stringify(message), { qos: 1 }, (err) => {
            if (err) reject(err)
            else resolve()
          })
        })
        break
      } catch (error) {
        retryCount++
        if (retryCount === maxRetries) {
          throw error
        }
        await new Promise(resolve => setTimeout(resolve, 1000))
      }
    }
  }

  const toggleAllRelays = () => {
    if (!client || !device) return
    console.log('Toggling all relays')

    const topic = `smarthome/${device.device_id}/control`
    const message = {
      all: !status.relays.some(state => state)
    }

    console.log('Publishing to', topic, message)
    client.publish(topic, JSON.stringify(message))
  }

  const updateDeviceId = async () => {
    if (!device) return

    try {
      // Ambil device ID dari message MQTT terakhir
      const newDeviceId = 'ESP_f21c81' // Device ID dari ESP8266

      const res = await fetch(`/api/devices/${device.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...device,
          device_id: newDeviceId,
          topic: `smarthome/${newDeviceId}`
        })
      })

      if (!res.ok) {
        throw new Error('Failed to update device')
      }

      // Refresh page untuk mendapatkan data terbaru
      window.location.reload()
    } catch (error) {
      console.error('Error updating device:', error)
      alert('Failed to update device ID')
    }
  }

  if (!device) return <div>Loading...</div>

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header dengan efek glassmorphism */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-lg p-6 mb-8"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-800
                           bg-clip-text text-transparent">
                {device?.name}
              </h1>
              <div className="flex items-center gap-2 mt-2">
                <FiCpu className="text-blue-500" />
                <span className="text-gray-600">{device?.device_id}</span>
              </div>
            </div>

            {/* Status badge dengan animasi pulse */}
            <motion.div
              animate={{
                scale: status.online ? [1, 1.05, 1] : 1,
                transition: { repeat: Infinity, duration: 2 }
              }}
              className={`px-4 py-2 rounded-full flex items-center gap-2
                ${status.online
                  ? 'bg-green-100 text-green-800 shadow-green-500/20'
                  : 'bg-red-100 text-red-800'} shadow-lg`}
            >
              <FiWifi className={status.online ? 'animate-pulse' : ''} />
              {status.online ? 'Online' : 'Offline'}
            </motion.div>
          </div>
        </motion.div>

        {/* Grid Relay dengan efek hover yang lebih menarik */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <AnimatePresence>
            {status.relays.map((isOn, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                whileHover={{ scale: 1.05 }}
                className="relative"
              >
                <button
                  onClick={() => toggleRelay(index)}
                  disabled={!status.online}
                  className={`w-full aspect-square rounded-2xl p-6 relative overflow-hidden
                    transition-all duration-500 transform
                    ${isOn
                      ? 'bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700'
                      : 'bg-white hover:bg-gray-50'
                    } ${!status.online && 'opacity-50 cursor-not-allowed'}
                    shadow-lg hover:shadow-xl`}
                >
                  {/* Power ripple effect */}
                  {showPowerRipple && lastToggled === index && (
                    <motion.div
                      initial={{ scale: 0, opacity: 1 }}
                      animate={{ scale: 2, opacity: 0 }}
                      transition={{ duration: 0.5 }}
                      className="absolute inset-0 bg-white rounded-full"
                    />
                  )}

                  <div className="relative z-10 h-full flex flex-col items-center justify-between">
                    <div className="text-center">
                      <h3 className={`text-lg font-semibold mb-1
                        ${isOn ? 'text-white' : 'text-gray-800'}`}>
                        Relay {index + 1}
                      </h3>
                      <p className={`text-sm ${isOn ? 'text-blue-100' : 'text-gray-500'}`}>
                        {isOn ? 'Aktif' : 'Nonaktif'}
                      </p>
                    </div>

                    <motion.div
                      animate={{
                        rotate: isOn ? 360 : 0,
                        scale: isOn ? [1, 1.2, 1] : 1
                      }}
                      transition={{ duration: 0.5 }}
                    >
                      <FiZap className={`w-10 h-10 ${
                        isOn ? 'text-white' : 'text-gray-400'
                      }`} />
                    </motion.div>
                  </div>
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Master Control dengan efek gradient animasi */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-lg p-6 mb-8 relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10
                        animate-gradient-x"></div>
          <div className="relative z-10 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-800">Kontrol Master</h2>
              <p className="text-gray-500">Kontrol semua relay sekaligus</p>
            </div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={toggleAllRelays}
              disabled={!status.online}
              className={`px-6 py-3 rounded-xl flex items-center gap-2 shadow-lg
                ${status.relays.some(state => state)
                  ? 'bg-gradient-to-r from-red-500 to-red-600'
                  : 'bg-gradient-to-r from-blue-500 to-blue-600'
                } text-white font-medium`}
            >
              <FiToggleLeft className="w-5 h-5" />
              {status.relays.some(state => state) ? 'Matikan Semua' : 'Nyalakan Semua'}
            </motion.button>
          </div>
        </motion.div>

        {/* Info Panel dengan statistik */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-lg p-6"
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100">
              <FiClock className="w-6 h-6 text-blue-500 mb-2" />
              <p className="text-sm text-gray-500">Uptime</p>
              <p className="font-mono font-medium text-gray-800">24h 13m</p>
            </div>
            {/* ... statistik lainnya ... */}
          </div>
        </motion.div>
      </div>
    </div>
  )
}
