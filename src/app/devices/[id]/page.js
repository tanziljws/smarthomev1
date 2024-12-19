'use client'
import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { FiPower, FiWifi } from 'react-icons/fi'
import mqtt from 'mqtt'

export default function DeviceControl() {
  const { id } = useParams()
  const [device, setDevice] = useState(null)
  const [status, setStatus] = useState({
    online: false,
    relays: [false, false, false, false]
  })
  const [client, setClient] = useState(null)

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
    const mqttClient = mqtt.connect('ws://192.168.2.84:9001', {
      username: 'root',
      password: 'adminse10',
      clientId: `webclient_${Math.random().toString(16).substr(2, 8)}`,
      keepalive: 60,
      reconnectPeriod: 5000, // Reconnect every 5 seconds if connection lost
      connectTimeout: 30 * 1000 // 30 seconds timeout
    })

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
    } catch (error) {
      console.error('Error toggling relay:', error)
      alert('Failed to toggle relay. Please try again.')
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
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Device Control</h1>
          <p className="text-gray-500">{device.name}</p>
        </div>
        <div className="flex items-center space-x-4">
          <span className={`px-3 py-1 rounded-full flex items-center ${
            status.online ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}>
            <FiWifi className="mr-2" />
            {status.online ? 'Online' : 'Offline'}
          </span>
          
          {/* Tambah tombol update jika device ID tidak sesuai */}
          {status.online && device.device_id !== 'ESP_f21c81' && (
            <button
              onClick={updateDeviceId}
              className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full"
            >
              Update Device ID
            </button>
          )}
        </div>
      </div>

      {/* Relay Controls */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        {status.relays.map((isOn, index) => (
          <motion.button
            key={index}
            whileTap={{ scale: 0.95 }}
            onClick={() => toggleRelay(index)}
            className={`p-4 rounded-xl flex items-center justify-between ${
              isOn ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-600'
            }`}
          >
            <span>Relay {index + 1}</span>
            <FiPower />
          </motion.button>
        ))}
      </div>

      {/* All Relays Control */}
      <motion.button
        whileTap={{ scale: 0.95 }}
        onClick={toggleAllRelays}
        className="w-full py-3 bg-gray-800 text-white rounded-xl
                 hover:bg-gray-700 transition-colors"
      >
        Toggle All Relays
      </motion.button>

      {/* Debug Info */}
      <div className="mt-6 p-4 bg-gray-100 rounded-lg text-sm">
        <p>Database ID: {id}</p>
        <p>Device ID: {device.device_id}</p>
        <p>MQTT Status: {client ? 'Connected' : 'Disconnected'}</p>
        <p>Relay States: {JSON.stringify(status.relays)}</p>
      </div>
    </div>
  )
} 