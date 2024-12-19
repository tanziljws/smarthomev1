'use client'
import { useState, useEffect } from 'react'
import mqtt from 'mqtt'

export default function NewDevices() {
  const [devices, setDevices] = useState([])

  useEffect(() => {
    // Connect ke MQTT
    const client = mqtt.connect('ws://192.168.2.84:9001', {
      username: 'root',
      password: 'adminse10'
    })

    client.on('connect', () => {
      console.log('Connected to MQTT')
      client.subscribe('smarthome/newdevice')
    })

    client.on('message', (topic, message) => {
      try {
        const device = JSON.parse(message.toString())
        setDevices(prev => [...prev, device])
      } catch (error) {
        console.error('Error parsing message:', error)
      }
    })

    return () => client.end()
  }, [])

  const addDevice = async (device) => {
    try {
      const res = await fetch('/api/devices', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          deviceId: device.deviceId,
          name: `New Device`,
          type: 'relay'
        })
      })

      if (res.ok) {
        // Remove from list
        setDevices(prev => 
          prev.filter(d => d.deviceId !== device.deviceId)
        )
        alert('Device added successfully!')
      }
    } catch (error) {
      console.error('Error:', error)
    }
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">New Devices</h1>

      {devices.length === 0 ? (
        <p className="text-gray-500">No new devices found...</p>
      ) : (
        <div className="space-y-4">
          {devices.map(device => (
            <div key={device.deviceId} 
                 className="bg-white p-4 rounded-lg shadow flex justify-between items-center">
              <div>
                <p className="font-medium">ID: {device.deviceId}</p>
                <p className="text-sm text-gray-500">IP: {device.ip}</p>
              </div>
              <button
                onClick={() => addDevice(device)}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg"
              >
                Add Device
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
} 