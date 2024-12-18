'use client'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { processCommand } from '@/lib/gemini'
import mqtt from 'mqtt'

export default function AIAssistant() {
    const [input, setInput] = useState('')
    const [processing, setProcessing] = useState(false)
    const [response, setResponse] = useState(null)
    const [listening, setListening] = useState(false)
    const [mqttClient, setMqttClient] = useState(null)
    const [history, setHistory] = useState([])

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

    const handleCommand = async () => {
        if (!input.trim()) return

        setProcessing(true)
        try {
            const aiResponse = await processCommand(input)
            const result = JSON.parse(aiResponse)

            if (result.type === 'relay_command') {
                // Kirim setiap command ke MQTT
                result.actions.forEach(action => {
                    // Kirim ke topic control dan status
                    mqttClient?.publish('smarthome/control', action)
                    mqttClient?.publish('smarthome/status', action)
                })
            }

            setResponse('Commands executed successfully!')
        } catch (error) {
            console.error('Error:', error)
            setResponse('Failed to execute command')
        } finally {
            setProcessing(false)
        }
    }

    const startListening = () => {
        if (!('webkitSpeechRecognition' in window)) {
            alert('Speech recognition is not supported in this browser.')
            return
        }

        const recognition = new webkitSpeechRecognition()
        recognition.continuous = false
        recognition.interimResults = false
        recognition.lang = 'id-ID'

        recognition.onstart = () => {
            setListening(true)
        }

        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript
            setInput(transcript)
            handleCommand(transcript)
        }

        recognition.onerror = (event) => {
            console.error('Speech recognition error:', event.error)
            setListening(false)
        }

        recognition.onend = () => {
            setListening(false)
        }

        recognition.start()
    }

    return (
        <div className="bg-white rounded-2xl shadow-xl p-6 max-w-2xl mx-auto">
            <div className="flex items-center gap-4 mb-6">
                <div className="p-3 bg-green-500 rounded-xl text-white">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                              d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                    </svg>
                </div>
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">Smart Assistant</h2>
                    <p className="text-gray-500">Powered by Google Gemini</p>
                </div>
            </div>

            {/* Command History */}
            {history.length > 0 && (
                <div className="mb-6 p-4 bg-gray-50 rounded-xl max-h-48 overflow-y-auto">
                    <h3 className="text-sm font-medium text-gray-500 mb-2">Recent Commands</h3>
                    {history.map((item, index) => (
                        <div key={index} className="text-sm mb-2 pb-2 border-b border-gray-200 last:border-0">
                            <div className="text-gray-800 font-medium">{item.command}</div>
                            <div className="text-gray-500 text-xs">
                                {new Date(item.timestamp).toLocaleTimeString()}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Suggestion Chips */}
            <div className="mb-4 flex flex-wrap gap-2">
                {[
                    "Nyalakan lampu ruang tamu",
                    "Matikan semua lampu",
                    "Atur suhu AC ke 24°",
                    "Hidupkan kipas angin"
                ].map((suggestion, index) => (
                    <button
                        key={index}
                        onClick={() => {
                            setInput(suggestion)
                            handleCommand(suggestion)
                        }}
                        className="px-3 py-1 bg-green-50 text-green-600 rounded-full
                                 text-sm hover:bg-green-100 transition-colors"
                    >
                        {suggestion}
                    </button>
                ))}
            </div>

            {/* Input Area */}
            <div className="flex gap-2">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Coba: 'Nyalakan lampu ruang tamu'"
                    className="flex-1 px-4 py-3 rounded-xl border border-gray-200 
                             focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    onKeyPress={(e) => e.key === 'Enter' && handleCommand()}
                />
                
                {/* Voice Input Button */}
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={startListening}
                    className={`p-3 rounded-xl ${
                        listening 
                            ? 'bg-red-500 text-white' 
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                              d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                    </svg>
                </motion.button>

                {/* Send Button */}
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleCommand}
                    disabled={processing}
                    className="px-6 py-3 bg-green-500 text-white rounded-xl
                             hover:bg-green-600 disabled:opacity-50"
                >
                    {processing ? (
                        <svg className="w-6 h-6 animate-spin" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" 
                                    stroke="currentColor" strokeWidth="4" fill="none" />
                            <path className="opacity-75" fill="currentColor"
                                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                    ) : (
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                  d="M14 5l7 7m0 0l-7 7m7-7H3" />
                        </svg>
                    )}
                </motion.button>
            </div>

            {/* Response Area */}
            <AnimatePresence>
                {response && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="mt-4 p-4 bg-gray-50 rounded-xl"
                    >
                        <div className="flex items-start gap-3">
                            <div className="p-2 bg-green-100 rounded-lg">
                                <svg className="w-5 h-5 text-green-500" fill="none" 
                                     stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" 
                                          strokeWidth={2}
                                          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <div className="flex-1">
                                <div className="font-medium text-gray-800">Assistant</div>
                                <div className="text-gray-600 mt-1">{response}</div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
} 