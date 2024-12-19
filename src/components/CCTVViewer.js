'use client'
import { useState, useEffect, useRef } from 'react'
import { CCTV_FEATURES, CCTV_PRESETS } from '@/lib/cctvUtils'
import VoiceStreamer from '@/lib/VoiceStreamer'

export default function CCTVViewer({ cctv }) {
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [currentPreset, setCurrentPreset] = useState(0)
  const [isRecording, setIsRecording] = useState(false)
  const [motionDetected, setMotionDetected] = useState(false)
  const [settings, setSettings] = useState({
    motion_sensitivity: 5,
    recording_quality: 'high',
    audio_volume: 70
  })
  const videoRef = useRef(null)
  const [isStreaming, setIsStreaming] = useState(false)
  const voiceStreamerRef = useRef(null)

  // Simulasi motion detection
  useEffect(() => {
    const interval = setInterval(() => {
      const hasMotion = Math.random() > 0.8
      if (hasMotion && !motionDetected) {
        setMotionDetected(true)
        // Trigger notification
        new Notification('Motion Detected', {
          body: `Movement detected on ${cctv.name}`,
          icon: '/motion-alert.png'
        })
      } else if (!hasMotion && motionDetected) {
        setMotionDetected(false)
      }
    }, 5000)

    return () => clearInterval(interval)
  }, [motionDetected, cctv.name])

  useEffect(() => {
    if (cctv.features?.audio) {
      voiceStreamerRef.current = new VoiceStreamer('192.168.2.90')
    }
    return () => {
      if (voiceStreamerRef.current?.isStreaming) {
        voiceStreamerRef.current.stopStreaming()
      }
    }
  }, [cctv.features?.audio])

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      videoRef.current.requestFullscreen()
      setIsFullscreen(true)
    } else {
      document.exitFullscreen()
      setIsFullscreen(false)
    }
  }

  const toggleRecording = () => {
    setIsRecording(!isRecording)
    // Implement recording logic here
  }

  const handleVoiceStream = async () => {
    if (!voiceStreamerRef.current.isStreaming) {
      const success = await voiceStreamerRef.current.startStreaming()
      if (success) {
        setIsStreaming(true)
      }
    } else {
      voiceStreamerRef.current.stopStreaming()
      setIsStreaming(false)
    }
  }

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      {/* Video Feed */}
      <div className="relative aspect-video bg-gray-900">
        <img
          ref={videoRef}
          src={cctv.stream_url}
          alt={cctv.name}
          className="w-full h-full object-cover"
        />
        
        {/* Overlay Controls */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/50 
                      opacity-0 hover:opacity-100 transition-opacity duration-300">
          <div className="absolute top-4 left-4">
            <div className="flex items-center gap-2">
              <span className={`w-3 h-3 rounded-full ${
                motionDetected ? 'bg-red-500 animate-pulse' : 'bg-green-500'
              }`} />
              <span className="text-white text-sm font-medium">
                {motionDetected ? 'Motion Detected' : 'Monitoring'}
              </span>
            </div>
          </div>

          {/* Bottom Controls */}
          <div className="absolute bottom-4 left-4 right-4">
            <div className="flex items-center justify-between">
              <div className="flex gap-2">
                <button
                  onClick={toggleRecording}
                  className={`p-2 rounded-lg ${
                    isRecording 
                      ? 'bg-red-500 text-white' 
                      : 'bg-white/20 text-white hover:bg-white/30'
                  }`}
                >
                  {isRecording ? (
                    <span className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                      Recording
                    </span>
                  ) : (
                    'Record'
                  )}
                </button>

                <button
                  onClick={() => {/* Implement snapshot */}}
                  className="p-2 rounded-lg bg-white/20 text-white hover:bg-white/30"
                >
                  📸 Snapshot
                </button>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={toggleFullscreen}
                  className="p-2 rounded-lg bg-white/20 text-white hover:bg-white/30"
                >
                  {isFullscreen ? '⊖' : '⊕'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Controls & Settings */}
      <div className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold">{cctv.name}</h3>
          <div className="flex gap-2">
            {CCTV_PRESETS.home.map((preset, index) => (
              <button
                key={preset.name}
                onClick={() => setCurrentPreset(index)}
                className={`px-3 py-1 rounded-lg text-sm ${
                  currentPreset === index
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 hover:bg-gray-200'
                }`}
              >
                {preset.name}
              </button>
            ))}
          </div>
        </div>

        {/* Feature Controls */}
        <div className="grid grid-cols-3 gap-4 p-4 bg-[#E6EEF8] rounded-xl">
          {/* Motion Detection */}
          <div className="aspect-[3/4] p-4 bg-white rounded-2xl flex flex-col">
            <div className="mb-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                  <span className="text-lg">👁️</span>
                </div>
                <span className="font-medium text-gray-800">Motion Detection</span>
              </div>
              <p className="text-xs text-gray-500 mt-1">Adjust sensitivity</p>
            </div>
            
            <div className="flex-grow flex flex-col justify-center">
              <input
                type="range"
                min="1"
                max="10"
                value={settings.motion_sensitivity}
                onChange={(e) => setSettings({
                  ...settings,
                  motion_sensitivity: parseInt(e.target.value)
                })}
                className="w-full accent-blue-500"
              />
              <div className="mt-2 flex items-center justify-between">
                <span className="text-sm text-gray-600">Sensitivity</span>
                <span className="text-sm font-medium">{settings.motion_sensitivity}</span>
              </div>
            </div>
          </div>

          {/* Recording */}
          <div className="aspect-[3/4] p-4 bg-white rounded-2xl flex flex-col">
            <div className="mb-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center">
                  <span className="text-lg">🎥</span>
                </div>
                <span className="font-medium text-gray-800">Recording</span>
              </div>
              <p className="text-xs text-gray-500 mt-1">Set quality level</p>
            </div>

            <div className="flex-grow flex flex-col justify-center">
              <select
                value={settings.recording_quality}
                onChange={(e) => setSettings({
                  ...settings,
                  recording_quality: e.target.value
                })}
                className="w-full p-2 rounded-lg border border-gray-200 bg-white text-sm"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
              <div className="mt-3 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                <span className="text-xs text-gray-500">Ready to record</span>
              </div>
            </div>
          </div>

          {/* Audio */}
          <div className="aspect-[3/4] p-4 bg-white rounded-2xl flex flex-col">
            <div className="mb-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
                  <span className="text-lg">🎙️</span>
                </div>
                <span className="font-medium text-gray-800">Audio</span>
              </div>
              <p className="text-xs text-gray-500 mt-1">Control volume</p>
            </div>

            <div className="flex-grow flex flex-col justify-center">
              <input
                type="range"
                min="0"
                max="100"
                value={settings.audio_volume}
                onChange={(e) => setSettings({
                  ...settings,
                  audio_volume: parseInt(e.target.value)
                })}
                className="w-full accent-purple-500"
              />
              <div className="mt-2 flex items-center justify-between">
                <div className="flex items-center gap-1">
                  <div className={`w-1 h-3 rounded-full bg-purple-500 ${settings.audio_volume > 30 ? 'opacity-100' : 'opacity-30'}`}></div>
                  <div className={`w-1 h-4 rounded-full bg-purple-500 ${settings.audio_volume > 60 ? 'opacity-100' : 'opacity-30'}`}></div>
                  <div className={`w-1 h-5 rounded-full bg-purple-500 ${settings.audio_volume > 90 ? 'opacity-100' : 'opacity-30'}`}></div>
                </div>
                <span className="text-sm font-medium">Volume: {settings.audio_volume}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 