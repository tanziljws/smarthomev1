'use client'
import { useState, useEffect } from 'react'
import { DEVICE_TYPES, ROOM_TYPES } from '@/lib/deviceUtils'
import DeviceCard from '@/components/DeviceCard'
import mqtt from 'mqtt'
import ClapIndicator from '@/components/ClapIndicator'
import ClapSettings from '@/components/ClapSettings'
import AIAssistant from '@/components/AIAssistant'
import CustomCommandManager from '@/components/CustomCommandManager'

export default function Devices() {
    const [devices, setDevices] = useState([])
    const [showForm, setShowForm] = useState(false)
    const [formData, setFormData] = useState({
        name: '',
        type: 'light',
        room: 'living'
    })
    const [editingId, setEditingId] = useState(null)
    const [currentRoom, setCurrentRoom] = useState(null)
    const [mqttClient, setMqttClient] = useState(null)
    const [clapCount, setClapCount] = useState(0)

    useEffect(() => {
        fetchDevices()
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
                client.subscribe('smarthome/control')
                client.subscribe('smarthome/status/#')
                client.subscribe('smarthome/clap_response')
            })

            client.on('message', async (topic, message) => {
                const messageStr = message.toString()
                console.log('Received:', topic, messageStr)

                if (topic === 'smarthome/clap_response') {
                    const count = parseInt(message.toString())
                    console.log('Clap detected:', count)
                    setClapCount(count)
                    
                    if (count === 2) {
                        const roomLights = devices.filter(d => 
                            d.type === 'light' && 
                            (!currentRoom || d.room === currentRoom)
                        )
                        
                        const mostAreOn = roomLights.filter(d => d.status).length > roomLights.length / 2
                        
                        for (const light of roomLights) {
                            await handleUpdateDevice({
                                ...light,
                                status: !mostAreOn
                            })
                        }
                    }
                } else if (topic.startsWith('smarthome/status/')) {
                    const relayNumber = topic.split('/').pop()
                    const isOn = messageStr.includes('_ON')
                    
                    const devicesToUpdate = devices.filter(d => d.relay_number === relayNumber)
                    
                    for (const device of devicesToUpdate) {
                        await fetch(`/api/devices/${device.id}`, {
                            method: 'PUT',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                ...device,
                                status: isOn
                            })
                        })
                    }
                    
                    setDevices(prev => prev.map(device => {
                        if (device.relay_number === relayNumber) {
                            return { ...device, status: isOn }
                        }
                        return device
                    }))
                }
            })

            client.on('error', (err) => {
                console.error('MQTT Error:', err)
            })

            setMqttClient(client)
        } catch (error) {
            console.error('Error connecting to MQTT:', error)
        }
    }

    const fetchDevices = async () => {
        const res = await fetch('/api/devices')
        const data = await res.json()
        setDevices(data)
    }

    const handleDeleteDevice = async (id) => {
        try {
            if (confirm('Are you sure you want to delete this device?')) {
                await fetch(`/api/devices/${id}`, { 
                    method: 'DELETE' 
                })
                fetchDevices()
            }
        } catch (error) {
            console.error('Error deleting device:', error)
        }
    }

    const handleUpdateDevice = async (updatedDevice) => {
        try {
            if (mqttClient) {
                const command = `RELAY${updatedDevice.relay_number}_${updatedDevice.status ? 'ON' : 'OFF'}`
                mqttClient.publish('smarthome/control', command)
            }

            await fetch(`/api/devices/${updatedDevice.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatedDevice)
            })

            setDevices(prev => prev.map(device => 
                device.id === updatedDevice.id ? updatedDevice : device
            ))
        } catch (error) {
            console.error('Error updating device:', error)
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        const deviceData = {
            ...formData,
            topic: `smarthome/control/relay${formData.relay_number}`,
            type: 'relay'
        }

        const url = editingId ? `/api/devices/${editingId}` : '/api/devices'
        const method = editingId ? 'PUT' : 'POST'

        try {
            await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(deviceData)
            })

            setShowForm(false)
            setFormData({
                name: '',
                type: 'light',
                room: 'living'
            })
            setEditingId(null)
            fetchDevices()
        } catch (error) {
            console.error('Error saving device:', error)
        }
    }

    const toggleDevice = async (device) => {
        if (mqttClient) {
            const newStatus = !device.status
            const command = `RELAY${device.relay_number}_${newStatus ? 'ON' : 'OFF'}`
            console.log('Publishing:', command)
            mqttClient.publish('smarthome/control', command)
            
            try {
                await fetch(`/api/devices/${device.id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        ...device,
                        status: newStatus
                    })
                })
                
                setDevices(prev => prev.map(d => {
                    if (d.id === device.id) {
                        return { ...d, status: newStatus }
                    }
                    return d
                }))
            } catch (error) {
                console.error('Error updating device status:', error)
            }
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6">
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl shadow-lg p-6 mb-8">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold text-white mb-2">Smart Devices</h1>
                        <p className="text-indigo-100">Control your connected devices</p>
                    </div>
                    <button
                        onClick={() => setShowForm(true)}
                        className="bg-white text-indigo-600 px-6 py-3 rounded-lg font-semibold 
                                 hover:bg-indigo-50 transition-all duration-300 shadow-md
                                 flex items-center gap-2"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                                  d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        Add Device
                    </button>
                </div>
            </div>

            <div className="mb-6 flex gap-2 overflow-x-auto pb-2">
                <button
                    onClick={() => setCurrentRoom(null)}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors
                              whitespace-nowrap
                              ${!currentRoom 
                                ? 'bg-indigo-100 text-indigo-600' 
                                : 'bg-white text-gray-600 hover:bg-gray-50'}`}
                >
                    All Rooms
                </button>
                {ROOM_TYPES.map(room => (
                    <button
                        key={room.id}
                        onClick={() => setCurrentRoom(room.id)}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors
                                  flex items-center gap-2 whitespace-nowrap
                                  ${currentRoom === room.id
                                    ? 'bg-indigo-100 text-indigo-600' 
                                    : 'bg-white text-gray-600 hover:bg-gray-50'}`}
                    >
                        <span>{room.icon}</span>
                        {room.name}
                    </button>
                ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {devices
                    .filter(device => !currentRoom || device.room === currentRoom)
                    .map(device => (
                        <DeviceCard
                            key={device.id}
                            device={device}
                            onUpdate={handleUpdateDevice}
                            onDelete={handleDeleteDevice}
                        />
                    ))}
            </div>

            {showForm && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl w-full max-w-md shadow-xl">
                        <div className="p-6">
                            <h2 className="text-2xl font-bold mb-6">
                                {editingId ? 'Edit Device' : 'Add Device'}
                            </h2>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Device Name
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={e => setFormData({...formData, name: e.target.value})}
                                        className="w-full px-4 py-2 rounded-lg border focus:ring-2 
                                                 focus:ring-indigo-500 focus:border-transparent"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Device Type
                                    </label>
                                    <select
                                        value={formData.type}
                                        onChange={e => setFormData({...formData, type: e.target.value})}
                                        className="w-full px-4 py-2 rounded-lg border focus:ring-2 
                                                 focus:ring-indigo-500 focus:border-transparent"
                                        required
                                    >
                                        {Object.entries(DEVICE_TYPES).map(([key, type]) => (
                                            <option key={key} value={key}>
                                                {type.icon} {type.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Room
                                    </label>
                                    <select
                                        value={formData.room}
                                        onChange={e => setFormData({...formData, room: e.target.value})}
                                        className="w-full px-4 py-2 rounded-lg border focus:ring-2 
                                                 focus:ring-indigo-500 focus:border-transparent"
                                        required
                                    >
                                        {ROOM_TYPES.map(room => (
                                            <option key={room.id} value={room.id}>
                                                {room.icon} {room.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="flex gap-3 justify-end mt-6">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowForm(false)
                                            setEditingId(null)
                                            setFormData({
                                                name: '',
                                                type: 'light',
                                                room: 'living'
                                            })
                                        }}
                                        className="px-6 py-2 rounded-lg font-medium text-gray-700 
                                                 hover:bg-gray-100 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-6 py-2 rounded-lg font-medium bg-indigo-500 
                                                 text-white hover:bg-indigo-600 transition-colors"
                                    >
                                        {editingId ? 'Update' : 'Add'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
            <div className="mt-8">
                <ClapSettings />
            </div>
            <ClapIndicator clapCount={clapCount} />
            <div className="mt-8">
                <CustomCommandManager />
            </div>
            <div className="mt-8">
                <AIAssistant />
            </div>
        </div>
    )
} 