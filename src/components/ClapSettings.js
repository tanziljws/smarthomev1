'use client'
import { useState, useEffect } from 'react'
import mqtt from 'mqtt'
import { motion, AnimatePresence } from 'framer-motion'

export default function ClapSettings() {
    const [settings, setSettings] = useState({
        enabled: true,
        deviceId: 0  // Start from 0
    })
    const [mqttClient, setMqttClient] = useState(null)
    const [showSuccess, setShowSuccess] = useState(false)

    // Mapping relay yang disesuaikan dengan urutan sebenarnya
    const RELAY_MAPPING = {
        0: 0,  // Relay 1 di UI -> deviceId 4
        1: 1,  // Relay 2 di UI -> deviceId 1
        2: 2,  // Relay 3 di UI -> deviceId 2
        3: 3  // Relay 4 di UI -> deviceId 3
    }

    useEffect(() => {
        connectMQTT()
        return () => {
            if (mqttClient) {
                mqttClient.end()
            }
        }
    }, [])

    const connectMQTT = () => {
        try {
            const client = mqtt.connect('ws://192.168.2.84:9001', {
                username: 'root',
                password: 'adminse10'
            })
            
            client.on('connect', () => {
                console.log('Connected to MQTT')
                client.subscribe('smarthome/clap_setting')
                // Request current settings
                client.publish('smarthome/clap_setting/get', '')
            })

            client.on('message', (topic, message) => {
                if (topic === 'smarthome/clap_setting') {
                    try {
                        const data = JSON.parse(message.toString())
                        // Convert received deviceId back to UI relay number
                        const relayNumber = Object.entries(RELAY_MAPPING)
                            .find(([key, value]) => value === data.deviceId)?.[0]
                        setSettings({
                            ...data,
                            deviceId: parseInt(relayNumber || data.deviceId)
                        })
                    } catch (error) {
                        console.error('Error parsing clap settings:', error)
                    }
                }
            })

            setMqttClient(client)
        } catch (error) {
            console.error('Error connecting to MQTT:', error)
        }
    }

    const handleSave = () => {
        if (mqttClient) {
            mqttClient.publish('smarthome/clap_setting', JSON.stringify(settings))
            // Show success message
            setShowSuccess(true)
            setTimeout(() => setShowSuccess(false), 2000)
        }
    }

    return (
        <div className="bg-gradient-to-br from-white to-blue-50 rounded-2xl shadow-xl p-8 
                      border border-blue-100">
            <div className="flex items-center gap-4 mb-6">
                <div className="p-3 bg-blue-500 rounded-xl text-white">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                              d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                    </svg>
                </div>
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">Clap Settings</h2>
                    <p className="text-gray-500">Configure your clap detection preferences</p>
                </div>
            </div>
            
            <div className="space-y-6">
                {/* Enable/Disable Toggle with better styling */}
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <label className="font-medium text-gray-800">Clap Detection</label>
                            <p className="text-sm text-gray-500">Enable or disable clap detection</p>
                        </div>
                        <button
                            onClick={() => setSettings(prev => ({
                                ...prev,
                                enabled: !prev.enabled
                            }))}
                            className={`relative inline-flex h-7 w-14 items-center rounded-full
                                      transition-colors duration-300 ${
                                settings.enabled ? 'bg-blue-500' : 'bg-gray-200'
                            }`}
                        >
                            <span
                                className={`inline-block h-5 w-5 transform rounded-full bg-white
                                          shadow-md transition-transform duration-300 ${
                                    settings.enabled ? 'translate-x-8' : 'translate-x-1'
                                }`}
                            />
                        </button>
                    </div>
                </div>

                {/* Device Selection with improved UI */}
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                    <label className="block font-medium text-gray-800 mb-1">
                        Control Target
                    </label>
                    <p className="text-sm text-gray-500 mb-4">
                        Select which relay to control with clap detection
                    </p>
                    <div className="grid grid-cols-2 gap-3">
                        {[0, 1, 2, 3].map(id => (
                            <motion.button
                                key={id}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => setSettings(prev => ({
                                    ...prev,
                                    deviceId: id
                                }))}
                                className={`p-4 rounded-xl font-medium
                                          transition-all duration-300 
                                          flex flex-col items-center gap-2
                                          ${settings.deviceId === id
                                    ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/20'
                                    : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                                }`}
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                          d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                                <span>Relay {id + 1}</span>
                            </motion.button>
                        ))}
                    </div>
                </div>

                {/* Save Button with animation */}
                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleSave}
                    className="w-full py-3 px-4 bg-blue-500 text-white font-medium
                             rounded-xl hover:bg-blue-600 transition-colors duration-300
                             flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                              d="M5 13l4 4L19 7" />
                    </svg>
                    Save Changes
                </motion.button>
            </div>

            {/* Success Message */}
            <AnimatePresence>
                {showSuccess && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="fixed bottom-8 right-8 bg-green-500 text-white px-6 py-3
                                 rounded-xl shadow-lg flex items-center gap-2"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                  d="M5 13l4 4L19 7" />
                        </svg>
                        Settings saved successfully!
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
} 