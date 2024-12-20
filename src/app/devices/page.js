'use client'
import { useState, useEffect } from 'react'
import { FiSearch, FiPlus, FiWifi, FiPower, FiThermometer, FiGrid, FiList } from 'react-icons/fi'
import { motion } from 'framer-motion'
import Link from 'next/link'

export default function Devices() {
  const [devices, setDevices] = useState([])
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    fetchDevices()
  }, [])

  const fetchDevices = async () => {
    try {
      const res = await fetch('/api/devices')
      const data = await res.json()
      setDevices(data)
    } catch (error) {
      console.error('Error:', error)
    }
  }

  const getDeviceIcon = (type) => {
    switch (type) {
      case 'relay':
        return <FiPower className="w-6 h-6" />
      case 'sensor':
        return <FiThermometer className="w-6 h-6" />
      default:
        return <FiWifi className="w-6 h-6" />
    }
  }

  return (
    <div className="p-6 min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Enhanced Header */}
      <div className="mb-12 relative">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative z-10"
        >
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-blue-500 rounded-2xl shadow-lg shadow-blue-500/30">
              <FiGrid className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600
                           bg-clip-text text-transparent drop-shadow-sm">
                My Devices
              </h1>
              <p className="text-gray-600 mt-2 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                {devices.length} devices connected
              </p>
            </div>
          </div>
        </motion.div>

        {/* Decorative Elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-blue-400/10 via-indigo-400/10 to-purple-400/10
                      rounded-full blur-3xl -z-10 animate-pulse" />
        <div className="absolute -top-10 -left-10 w-72 h-72 bg-gradient-to-br from-green-400/10 via-emerald-400/10 to-teal-400/10
                      rounded-full blur-3xl -z-10 animate-pulse delay-1000" />
      </div>

      {/* Enhanced Controls */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row gap-4 mb-8 backdrop-blur-xl
                 bg-white/60 p-6 rounded-3xl shadow-xl border border-white/50"
      >
        <div className="flex-1">
          <div className="relative">
            <input
              type="text"
              placeholder="Search devices..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white/50
                       border border-white/60 focus:ring-2 focus:ring-blue-500/50
                       focus:border-blue-500/50 transition-all placeholder-gray-400
                       shadow-inner"
            />
            <FiSearch className="absolute left-4 top-4 text-gray-400 w-5 h-5" />
          </div>
        </div>

        <div className="flex gap-4">
          <select
            className="px-6 py-4 rounded-2xl bg-white/50 border border-white/60
                     focus:ring-2 focus:ring-blue-500/50 text-gray-600
                     shadow-inner cursor-pointer"
            defaultValue="all"
          >
            <option value="all">All Devices</option>
            <option value="relay">Smart Switches</option>
            <option value="sensor">Sensors</option>
          </select>

          <Link href="/devices/scan">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="px-8 py-4 bg-gradient-to-r from-blue-500 to-indigo-500
                       text-white rounded-2xl flex items-center gap-3 shadow-lg
                       shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40
                       transition-all font-medium"
            >
              <FiPlus className="w-5 h-5" />
              <span>Add Device</span>
            </motion.button>
          </Link>
        </div>
      </motion.div>

      {/* Enhanced Device Grid */}
      <motion.div
        initial="hidden"
        animate="show"
        variants={{
          hidden: { opacity: 0 },
          show: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
          }
        }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
      >
        {devices.map(device => (
          <motion.div
            key={device.id}
            variants={{
              hidden: { opacity: 0, y: 20 },
              show: { opacity: 1, y: 0 }
            }}
          >
            <Link href={`/devices/${device.id}`}>
              <motion.div
                whileHover={{ y: -6, scale: 1.02 }}
                className="bg-white/70 backdrop-blur-xl p-8 rounded-3xl shadow-xl
                         border border-white/60 transition-all relative overflow-hidden
                         group hover:shadow-2xl hover:shadow-blue-500/10"
              >
                {/* Enhanced Status Badge */}
                <div className="absolute top-6 right-6">
                  <div className={`px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2
                    ${device.is_online
                      ? 'bg-green-100/80 text-green-700 shadow-lg shadow-green-500/20'
                      : 'bg-gray-100/80 text-gray-700'}`}
                  >
                    {device.is_online && (
                      <motion.div
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="w-2 h-2 rounded-full bg-green-500"
                      />
                    )}
                    {device.is_online ? 'Online' : 'Offline'}
                  </div>
                </div>

                {/* Enhanced Device Icon & Info */}
                <div className="flex items-start gap-6">
                  <motion.div
                    whileHover={{ rotate: 15 }}
                    className={`p-5 rounded-2xl ${
                      device.is_online
                        ? 'bg-gradient-to-br from-blue-500 to-indigo-500 text-white'
                        : 'bg-gradient-to-br from-gray-200 to-gray-100 text-gray-600'
                    } shadow-lg`}
                  >
                    {getDeviceIcon(device.type)}
                  </motion.div>
                  <div>
                    <h3 className="text-xl font-bold mb-2 text-gray-800">
                      {device.name}
                    </h3>
                    <p className="text-gray-500 flex items-center gap-2">
                      <FiWifi className="w-4 h-4" />
                      {device.location || 'No location set'}
                    </p>
                  </div>
                </div>

                {/* Enhanced Additional Info */}
                <div className="mt-6 pt-6 border-t border-gray-100">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500 text-sm">
                      ID: <span className="font-mono text-indigo-600">{device.device_id}</span>
                    </span>
                    <span className="px-3 py-1.5 rounded-xl bg-indigo-50 text-indigo-600
                                 font-medium text-sm shadow-sm">
                      {device.type}
                    </span>
                  </div>
                </div>

                {/* Enhanced Hover Effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-indigo-500/5 to-purple-500/5
                             opacity-0 group-hover:opacity-100 transition-all duration-500" />
              </motion.div>
            </Link>
          </motion.div>
        ))}
      </motion.div>
    </div>
  )
}
