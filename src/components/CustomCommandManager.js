'use client'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import mqtt from 'mqtt'

export default function CustomCommandManager() {
    const [commands, setCommands] = useState([])
    const [showForm, setShowForm] = useState(false)
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        actions: [{ relay: 1, state: 'OFF' }]
    })
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [mqttClient, setMqttClient] = useState(null)

    useEffect(() => {
        // Setup MQTT connection
        const client = mqtt.connect('ws://192.168.2.84:9001', {
            username: 'root',
            password: 'adminse10'
        })
        setMqttClient(client)

        return () => {
            client?.end()
        }
    }, [])

    const deleteCommand = async (id) => {
        try {
            const response = await fetch('/api/custom-commands', {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ id })
            })

            if (!response.ok) {
                throw new Error('Failed to delete command')
            }

            // Refresh commands list
            fetchCommands()
        } catch (error) {
            console.error('Delete error:', error)
            alert('Failed to delete command')
        }
    }

    const executeCommand = async (command) => {
        try {
            command.actions.forEach(action => {
                const message = `RELAY${action.relay}_${action.state}`
                console.log('Publishing:', message)
                mqttClient?.publish('smarthome/control', message)
                mqttClient?.publish('smarthome/status', message)
            })
            console.log('Command executed:', command.name)
        } catch (error) {
            console.error('Error executing command:', error)
            alert('Failed to execute command')
        }
    }

    // Fetch existing commands
    useEffect(() => {
        fetchCommands()
    }, [])

    const fetchCommands = async () => {
        try {
            setLoading(true)
            setError(null)
            
            const res = await fetch('/api/custom-commands')
            const data = await res.json()
            
            if (!res.ok) {
                throw new Error(data.error || 'Failed to fetch commands')
            }
            
            const commandsList = data.commands || data
            setCommands(Array.isArray(commandsList) ? commandsList : [])
            
        } catch (error) {
            console.error('Fetch error:', error)
            setError(error.message)
            setCommands([])
        } finally {
            setLoading(false)
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        try {
            const formattedActions = formData.actions.map(action => ({
                relay: action.relay,
                state: action.state // "ON" atau "OFF"
            }))

            const response = await fetch('/api/custom-commands', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    actions: formattedActions
                })
            })

            if (!response.ok) throw new Error('Failed to create command')
            
            fetchCommands()
            setShowForm(false)
            setFormData({
                name: '',
                description: '',
                actions: [{ relay: 1, state: 'OFF' }]
            })
        } catch (error) {
            console.error('Submit error:', error)
            alert(error.message)
        }
    }

    return (
        <div className="bg-white rounded-2xl shadow-xl p-6">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">Custom Commands</h2>
                    <p className="text-gray-500">Manage your custom relay commands</p>
                </div>
                <button
                    onClick={() => setShowForm(true)}
                    className="px-4 py-2 bg-green-500 text-white rounded-lg"
                >
                    Add Command
                </button>
            </div>

            {/* Loading State */}
            {loading && (
                <div className="text-center py-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
                </div>
            )}

            {/* Error State */}
            {error && (
                <div className="bg-red-50 text-red-500 p-4 rounded-lg mb-4">
                    {error}
                </div>
            )}

            {/* Command List */}
            <div className="space-y-4">
                {!loading && commands.length === 0 && (
                    <div className="text-center py-4 text-gray-500">
                        No custom commands yet. Create one!
                    </div>
                )}
                
                {commands.map((cmd) => (
                    <div key={cmd.id} className="border rounded-xl p-4">
                        <div className="flex justify-between items-start">
                            <div>
                                <h3 className="font-medium text-gray-800">{cmd.name}</h3>
                                <p className="text-sm text-gray-500">{cmd.description}</p>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => executeCommand(cmd)}
                                    className="px-3 py-1 bg-green-100 text-green-600 rounded-lg 
                                             hover:bg-green-200 transition-colors"
                                >
                                    Run
                                </button>
                                <button
                                    onClick={() => deleteCommand(cmd.id)}
                                    className="px-3 py-1 bg-red-100 text-red-600 rounded-lg
                                             hover:bg-red-200 transition-colors"
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                        <div className="mt-2 flex flex-wrap gap-2">
                            {Array.isArray(cmd.actions) && cmd.actions.map((action, idx) => (
                                <span key={idx} className="px-2 py-1 bg-gray-100 rounded-lg text-sm">
                                    Relay {action.relay}: {action.state}
                                </span>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            {/* Add/Edit Form Modal */}
            <AnimatePresence>
                {showForm && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 flex items-center justify-center"
                    >
                        <motion.div
                            initial={{ scale: 0.95 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0.95 }}
                            className="bg-white rounded-xl p-6 max-w-md w-full mx-4"
                        >
                            <h3 className="text-xl font-bold mb-4">Add Custom Command</h3>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Name</label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                                        className="w-full px-3 py-2 border rounded-lg"
                                        placeholder="e.g., All Lights Off"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Description</label>
                                    <input
                                        type="text"
                                        value={formData.description}
                                        onChange={(e) => setFormData({...formData, description: e.target.value})}
                                        className="w-full px-3 py-2 border rounded-lg"
                                        placeholder="e.g., Turns off all relays"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2">Actions</label>
                                    {formData.actions.map((action, idx) => (
                                        <div key={idx} className="flex gap-2 mb-2">
                                            <select
                                                value={action.relay}
                                                onChange={(e) => {
                                                    const newActions = [...formData.actions]
                                                    newActions[idx].relay = parseInt(e.target.value)
                                                    setFormData({...formData, actions: newActions})
                                                }}
                                                className="px-3 py-2 border rounded-lg"
                                            >
                                                {[1,2,3,4].map(num => (
                                                    <option key={num} value={num}>Relay {num}</option>
                                                ))}
                                            </select>
                                            <select
                                                value={action.state}
                                                onChange={(e) => {
                                                    const newActions = [...formData.actions]
                                                    newActions[idx].state = e.target.value
                                                    setFormData({...formData, actions: newActions})
                                                }}
                                                className="px-3 py-2 border rounded-lg"
                                            >
                                                <option value="ON">ON</option>
                                                <option value="OFF">OFF</option>
                                            </select>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    const newActions = formData.actions.filter((_, i) => i !== idx)
                                                    setFormData({...formData, actions: newActions})
                                                }}
                                                className="px-3 py-2 bg-red-100 text-red-600 rounded-lg"
                                            >
                                                Remove
                                            </button>
                                        </div>
                                    ))}
                                    <button
                                        type="button"
                                        onClick={() => setFormData({
                                            ...formData,
                                            actions: [...formData.actions, { relay: 1, state: 'OFF' }]
                                        })}
                                        className="px-3 py-2 bg-gray-100 text-gray-600 rounded-lg"
                                    >
                                        Add Action
                                    </button>
                                </div>
                                <div className="flex justify-end gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setShowForm(false)}
                                        className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-4 py-2 bg-green-500 text-white rounded-lg"
                                    >
                                        Save Command
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
} 