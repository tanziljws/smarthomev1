'use client'
import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { motion } from 'framer-motion'
import { FiPlus, FiTrash2, FiWifi, FiSearch, FiPower, FiSettings, FiClock, FiZap } from 'react-icons/fi'
import Link from 'next/link'
import { DEVICE_TYPES } from '@/lib/deviceUtils'

export default function Devices() {
  const { data: session } = useSession()
  const [devices, setDevices] = useState([])
  const [showAddModal, setShowAddModal] = useState(false)
  const [filter, setFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    if (session) {
      fetchDevices()
    }
  }, [session])

  const fetchDevices = async () => {
    try {
      const res = await fetch('/api/devices')
      const data = await res.json()
      setDevices(data)
    } catch (error) {
      console.error('Error fetching devices:', error)
    }
  }

  const handleDelete = async (id, e) => {
    e.preventDefault()
    if (confirm('Are you sure you want to delete this device?')) {
      try {
        const res = await fetch(`/api/devices/${id}`, {
          method: 'DELETE'
        })
        if (res.ok) {
          fetchDevices()
        }
      } catch (error) {
        console.error('Error deleting device:', error)
      }
    }
  }

  const handleAddDevice = async (deviceData) => {
    try {
      const res = await fetch('/api/devices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(deviceData)
      })
      
      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.message || 'Failed to add device')
      }

      await fetchDevices() // Refresh list setelah berhasil
      setShowAddModal(false)
    } catch (error) {
      console.error('Error adding device:', error)
      alert(error.message)
    }
  }

  const filteredDevices = devices.filter(device => {
    const matchesFilter = filter === 'all' || device.type === filter
    const matchesSearch = device.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         device.location?.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesFilter && matchesSearch
  })

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">My Devices</h1>
        <p className="text-gray-500">Manage and control your smart home devices</p>
      </div>

      {/* Controls Section */}
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="flex-1">
          <div className="relative">
            <input
              type="text"
              placeholder="Search devices..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border bg-white/50 
                       backdrop-blur-sm focus:ring-2 focus:ring-blue-500"
            />
            <FiSearch className="absolute left-3 top-3 text-gray-400" />
          </div>
        </div>

        <div className="flex gap-3">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-4 py-2 rounded-lg border bg-white/50 backdrop-blur-sm"
          >
            <option value="all">All Devices</option>
            <option value="relay">Smart Switches</option>
            <option value="sensor">Sensors</option>
          </select>

          <Link href="/devices/new">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="bg-green-500 text-white px-4 py-2 rounded-lg 
                       flex items-center space-x-2 shadow-lg"
            >
              <FiSearch className="text-lg" />
              <span>Scan</span>
            </motion.button>
          </Link>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowAddModal(true)}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg 
                     flex items-center space-x-2 shadow-lg"
          >
            <FiPlus className="text-lg" />
            <span>Add</span>
          </motion.button>
        </div>
      </div>

      {/* Device Grid with new card design */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredDevices.map((device) => (
          <Link href={`/devices/${device.id}`} key={device.id}>
            <motion.div
              layout
              whileHover={{ y: -4 }}
              className="bg-white/80 backdrop-blur-sm p-6 rounded-xl shadow-lg 
                       hover:shadow-xl transition-all duration-300 border border-gray-100"
            >
              {/* Status Badge */}
              <div className="absolute -top-2 -right-2">
                <span className={`px-3 py-1 rounded-full text-xs font-medium
                  ${device.is_online 
                    ? 'bg-green-100 text-green-700' 
                    : 'bg-gray-100 text-gray-700'}`}>
                  {device.is_online ? 'Online' : 'Offline'}
                </span>
              </div>

              {/* Device Icon & Info */}
              <div className="flex items-start gap-4 mb-4">
                <div className={`p-3 rounded-lg ${
                  device.is_online ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'
                }`}>
                  {DEVICE_TYPES[device.type]?.icon || '🔌'}
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold mb-1">{device.name}</h3>
                  <p className="text-gray-500 text-sm">{device.location || 'No location set'}</p>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="flex items-center gap-3 mt-4 pt-4 border-t">
                <button className="flex-1 flex items-center justify-center gap-2 p-2 
                                 rounded-lg hover:bg-gray-100 transition-colors">
                  <FiPower className="text-blue-500" />
                  <span className="text-sm">Power</span>
                </button>
                <button className="flex-1 flex items-center justify-center gap-2 p-2 
                                 rounded-lg hover:bg-gray-100 transition-colors">
                  <FiClock className="text-purple-500" />
                  <span className="text-sm">Schedule</span>
                </button>
                <button className="flex-1 flex items-center justify-center gap-2 p-2 
                                 rounded-lg hover:bg-gray-100 transition-colors">
                  <FiSettings className="text-gray-500" />
                  <span className="text-sm">Settings</span>
                </button>
              </div>

              {/* Device Stats */}
              {device.type === 'relay' && (
                <div className="mt-4 pt-4 border-t grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <FiZap className="text-yellow-500" />
                    <div className="text-sm">
                      <div className="font-medium">Power</div>
                      <div className="text-gray-500">0.0 kW</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <FiClock className="text-green-500" />
                    <div className="text-sm">
                      <div className="font-medium">Runtime</div>
                      <div className="text-gray-500">2.5 hrs</div>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </Link>
        ))}
      </div>

      {/* Add Device Modal */}
      {showAddModal && (
        <AddDeviceModal
          onClose={() => setShowAddModal(false)}
          onAdd={handleAddDevice}
        />
      )}
    </div>
  )
}

// Add Device Modal Component
function AddDeviceModal({ onClose, onAdd }) {
  const [formData, setFormData] = useState({
    name: '',
    device_id: '',
    type: 'relay',
    relay_number: '4',
    location: '',
    features: [],
    settings: {}
  })

  const deviceTypeOptions = {
    relay: {
      name: 'Smart Relay',
      icon: '🔌',
      features: ['power', 'timer', 'energy_monitoring'],
      settings: {
        channels: [1, 2, 4, 8]
      }
    },
    bulb: {
      name: 'Smart Bulb',
      icon: '💡',
      features: ['power', 'brightness', 'color', 'scene'],
      settings: {
        maxBrightness: 100,
        colorTemp: {
          min: 2700,
          max: 6500
        },
        rgbSupport: true
      }
    },
    strip: {
      name: 'LED Strip',
      icon: '✨',
      features: ['power', 'brightness', 'color', 'effects'],
      settings: {
        length: [1, 2, 5, 10], // dalam meter
        ledsPerMeter: [30, 60, 144],
        rgbSupport: true
      }
    },
    sensor: {
      name: 'Sensor Hub',
      icon: '📊',
      features: ['temperature', 'humidity', 'motion'],
      settings: {
        readInterval: [30, 60, 300] // dalam detik
      }
    }
  }

  const [selectedFeatures, setSelectedFeatures] = useState([])
  const [advancedMode, setAdvancedMode] = useState(false)

  useEffect(() => {
    // Update features when device type changes
    const type = deviceTypeOptions[formData.type]
    if (type) {
      setSelectedFeatures(type.features)
      setFormData(prev => ({
        ...prev,
        settings: type.settings
      }))
    }
  }, [formData.type])

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    const deviceId = formData.device_id || `ESP_${Math.random().toString(36).substr(2, 6)}`
    
    const payload = {
      name: formData.name,
      device_id: deviceId,
      type: formData.type,
      features: selectedFeatures,
      settings: formData.settings,
      topic: `smarthome/${deviceId}`,
      location: formData.location || null,
      // Tambahan untuk smart bulb
      ...(formData.type === 'bulb' && {
        brightness: 100,
        color_temp: 2700,
        rgb_color: [255, 255, 255],
        effects: []
      })
    }

    try {
      const res = await fetch('/api/devices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.message || 'Failed to add device')
      }

      const data = await res.json()
      onAdd(data)
      onClose()
    } catch (error) {
      console.error('Error adding device:', error)
      alert(error.message)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-xl p-6 w-full max-w-lg"
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">Add New Device</h2>
          <button
            onClick={() => setAdvancedMode(!advancedMode)}
            className="text-sm text-blue-500 hover:underline"
          >
            {advancedMode ? 'Simple Mode' : 'Advanced Mode'}
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Device Type Selection with Icons */}
          <div className="grid grid-cols-2 gap-4">
            {Object.entries(deviceTypeOptions).map(([type, info]) => (
              <button
                key={type}
                type="button"
                onClick={() => setFormData({...formData, type})}
                className={`p-4 rounded-lg border-2 transition-all ${
                  formData.type === type 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-200 hover:border-blue-200'
                }`}
              >
                <div className="text-2xl mb-2">{info.icon}</div>
                <div className="font-medium">{info.name}</div>
              </button>
            ))}
          </div>

          {/* Basic Info */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Device Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="w-full px-3 py-2 rounded-lg border focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Location
              </label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({...formData, location: e.target.value})}
                className="w-full px-3 py-2 rounded-lg border focus:ring-2 focus:ring-blue-500"
                placeholder="e.g. Living Room"
              />
            </div>
          </div>

          {/* Advanced Settings */}
          {advancedMode && (
            <div className="space-y-4 border-t pt-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Device ID (Optional)
                </label>
                <input
                  type="text"
                  value={formData.device_id}
                  onChange={(e) => setFormData({...formData, device_id: e.target.value})}
                  className="w-full px-3 py-2 rounded-lg border"
                  placeholder="Leave empty for auto-generate"
                />
              </div>

              {/* Type-specific settings */}
              {formData.type === 'bulb' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Features
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {deviceTypeOptions.bulb.features.map(feature => (
                        <label key={feature} className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={selectedFeatures.includes(feature)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedFeatures([...selectedFeatures, feature])
                              } else {
                                setSelectedFeatures(selectedFeatures.filter(f => f !== feature))
                              }
                            }}
                            className="rounded text-blue-500"
                          />
                          <span className="text-sm">{feature}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg 
                       hover:bg-blue-600 transition-colors"
            >
              Add Device
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  )
} 