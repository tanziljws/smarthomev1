'use client'
import { useState, useEffect } from 'react'
import CCTVViewer from '@/components/CCTVViewer'
import { motion, AnimatePresence } from 'framer-motion'

export default function CCTVManagement() {
    const [cctvs, setCCTVs] = useState([])
    const [showForm, setShowForm] = useState(false)
    const [formData, setFormData] = useState({
        name: '',
        stream_url: '',
        location: '',
        features: {
            motion_detection: true,
            recording: true,
            audio: false
        }
    })
    const [editingId, setEditingId] = useState(null)
    const [selectedCCTV, setSelectedCCTV] = useState(null)
    const [viewMode, setViewMode] = useState('grid') // 'grid' or 'single'
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchCCTVs()
    }, [])

    const fetchCCTVs = async () => {
        try {
            setLoading(true)
            const res = await fetch('/api/cctv')
            const data = await res.json()
            setCCTVs(data)
        } catch (error) {
            console.error('Error fetching CCTVs:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        const url = editingId ? `/api/cctv/${editingId}` : '/api/cctv'
        const method = editingId ? 'PUT' : 'POST'

        try {
            await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            })

            setShowForm(false)
            setFormData({
                name: '',
                stream_url: '',
                location: '',
                features: {
                    motion_detection: true,
                    recording: true,
                    audio: false
                }
            })
            setEditingId(null)
            fetchCCTVs()
        } catch (error) {
            console.error('Error saving CCTV:', error)
        }
    }

    const handleDelete = async (id) => {
        if (confirm('Are you sure you want to delete this CCTV?')) {
            try {
                await fetch(`/api/cctv/${id}`, { method: 'DELETE' })
                fetchCCTVs()
                if (selectedCCTV?.id === id) {
                    setSelectedCCTV(null)
                }
            } catch (error) {
                console.error('Error deleting CCTV:', error)
            }
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6">
            {/* Modern Header */}
            <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div>
                        <h1 className="text-4xl font-bold text-gray-800 mb-2">
                            Surveillance Center
                        </h1>
                        <p className="text-gray-500">
                            Monitoring {cctvs.length} cameras • Last updated {new Date().toLocaleTimeString()}
                        </p>
                    </div>
                    <div className="flex flex-wrap gap-4">
                        {/* View Mode Toggle */}
                        <button
                            onClick={() => setViewMode(viewMode === 'grid' ? 'single' : 'grid')}
                            className="group relative px-6 py-3 rounded-xl 
                                     bg-gray-100 hover:bg-gray-200
                                     transition-all duration-300
                                     flex items-center gap-3"
                        >
                            <span className="text-gray-700">
                                {viewMode === 'grid' ? (
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                                              d="M4 6h16M4 12h16m-7 6h7" />
                                    </svg>
                                ) : (
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                                              d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                                    </svg>
                                )}
                            </span>
                            <span className="text-gray-700 font-medium">
                                {viewMode === 'grid' ? 'Single View' : 'Grid View'}
                            </span>
                        </button>

                        {/* Add Camera Button */}
                        <button
                            onClick={() => setShowForm(true)}
                            className="group relative px-6 py-3 rounded-xl 
                                     bg-blue-500 hover:bg-blue-600
                                     transition-all duration-300
                                     flex items-center gap-3 shadow-lg shadow-blue-500/20"
                        >
                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                                      d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                            <span className="text-white font-medium">Add Camera</span>
                        </button>
                    </div>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-8">
                    {[
                        { label: 'Active Cameras', value: cctvs.length, icon: '📹', color: 'blue' },
                        { label: 'Motion Detected', value: '2', icon: '🏃', color: 'green' },
                        { label: 'Recording', value: '4', icon: '⏺️', color: 'red' },
                        { label: 'Storage Used', value: '1.2TB', icon: '💾', color: 'purple' }
                    ].map((stat, index) => (
                        <div key={index} 
                             className={`bg-${stat.color}-50 rounded-xl p-4 
                                      border border-${stat.color}-100`}>
                            <div className="flex items-center gap-3">
                                <span className="text-2xl">{stat.icon}</span>
                                <div>
                                    <div className={`text-${stat.color}-600 font-medium`}>
                                        {stat.label}
                                    </div>
                                    <div className="text-2xl font-bold text-gray-800">
                                        {stat.value}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Loading State */}
            {loading ? (
                <div className="flex justify-center items-center h-64">
                    <div className="relative">
                        <div className="w-16 h-16 border-4 border-blue-200 rounded-full 
                                      animate-spin border-t-blue-500" />
                    </div>
                </div>
            ) : (
                <>
                    {/* Grid View */}
                    {viewMode === 'grid' ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {cctvs.map((cctv, index) => (
                                <motion.div
                                    key={cctv.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    transition={{ duration: 0.3, delay: index * 0.1 }}
                                >
                                    <div className="bg-white rounded-2xl overflow-hidden shadow-xl
                                                  hover:shadow-2xl transition-all duration-300
                                                  hover:shadow-blue-500/10">
                                        <CCTVViewer cctv={cctv} />
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    ) : (
                        /* Single View */
                        <div className="space-y-6">
                            <div className="bg-white rounded-2xl overflow-hidden shadow-xl">
                                {selectedCCTV ? (
                                    <CCTVViewer cctv={selectedCCTV} />
                                ) : (
                                    <div className="text-center text-gray-400 py-32">
                                        <div className="text-6xl mb-4">📹</div>
                                        <div className="text-xl font-medium">Select a camera to view</div>
                                    </div>
                                )}
                            </div>
                            
                            {/* Thumbnails */}
                            <div className="flex gap-4 overflow-x-auto pb-4">
                                {cctvs.map(cctv => (
                                    <button
                                        key={cctv.id}
                                        onClick={() => setSelectedCCTV(cctv)}
                                        className={`flex-shrink-0 w-48 rounded-xl overflow-hidden 
                                                  bg-white shadow-lg transition-all duration-300 
                                                  hover:scale-105 ${
                                            selectedCCTV?.id === cctv.id
                                                ? 'ring-2 ring-blue-500 shadow-lg shadow-blue-500/20'
                                                : 'hover:shadow-xl'
                                        }`}
                                    >
                                        <div className="aspect-video bg-gray-100">
                                            <img
                                                src={cctv.stream_url}
                                                alt={cctv.name}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                        <div className="p-3">
                                            <div className="font-medium text-gray-800 truncate">
                                                {cctv.name}
                                            </div>
                                            <div className="text-sm text-gray-500 truncate">
                                                {cctv.location}
                                            </div>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </>
            )}

            {/* Modal */}
            <AnimatePresence>
                {showForm && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/20 backdrop-blur-sm 
                                 flex items-center justify-center z-50 p-4"
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-white rounded-2xl w-full max-w-md shadow-2xl"
                        >
                            <div className="p-6">
                                <h2 className="text-2xl font-bold mb-6">
                                    {editingId ? 'Edit Camera' : 'Add Camera'}
                                </h2>
                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Camera Name
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.name}
                                            onChange={e => setFormData({...formData, name: e.target.value})}
                                            className="w-full px-4 py-2 rounded-lg border focus:ring-2 
                                                     focus:ring-blue-500 focus:border-transparent"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Stream URL
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.stream_url}
                                            onChange={e => setFormData({...formData, stream_url: e.target.value})}
                                            className="w-full px-4 py-2 rounded-lg border focus:ring-2 
                                                     focus:ring-blue-500 focus:border-transparent"
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
                                            onChange={e => setFormData({...formData, location: e.target.value})}
                                            className="w-full px-4 py-2 rounded-lg border focus:ring-2 
                                                     focus:ring-blue-500 focus:border-transparent"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Features
                                        </label>
                                        <div className="space-y-2">
                                            <label className="flex items-center gap-2">
                                                <input
                                                    type="checkbox"
                                                    checked={formData.features.motion_detection}
                                                    onChange={e => setFormData({
                                                        ...formData,
                                                        features: {
                                                            ...formData.features,
                                                            motion_detection: e.target.checked
                                                        }
                                                    })}
                                                    className="rounded text-blue-500 focus:ring-blue-500"
                                                />
                                                Motion Detection
                                            </label>
                                            <label className="flex items-center gap-2">
                                                <input
                                                    type="checkbox"
                                                    checked={formData.features.recording}
                                                    onChange={e => setFormData({
                                                        ...formData,
                                                        features: {
                                                            ...formData.features,
                                                            recording: e.target.checked
                                                        }
                                                    })}
                                                    className="rounded text-blue-500 focus:ring-blue-500"
                                                />
                                                Recording
                                            </label>
                                            <label className="flex items-center gap-2">
                                                <input
                                                    type="checkbox"
                                                    checked={formData.features.audio}
                                                    onChange={e => setFormData({
                                                        ...formData,
                                                        features: {
                                                            ...formData.features,
                                                            audio: e.target.checked
                                                        }
                                                    })}
                                                    className="rounded text-blue-500 focus:ring-blue-500"
                                                />
                                                Two-way Audio
                                            </label>
                                        </div>
                                    </div>
                                    <div className="flex gap-3 justify-end mt-6">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setShowForm(false)
                                                setEditingId(null)
                                                setFormData({
                                                    name: '',
                                                    stream_url: '',
                                                    location: '',
                                                    features: {
                                                        motion_detection: true,
                                                        recording: true,
                                                        audio: false
                                                    }
                                                })
                                            }}
                                            className="px-6 py-2 rounded-lg font-medium text-gray-700 
                                                     hover:bg-gray-100 transition-colors"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            className="px-6 py-2 rounded-lg font-medium bg-blue-500 
                                                     text-white hover:bg-blue-600 transition-colors"
                                        >
                                            {editingId ? 'Update' : 'Add'}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
} 