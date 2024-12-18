'use client'
import { useState, useEffect, useRef } from 'react'
import { CCTV_FEATURES, CCTV_PRESETS } from '@/lib/cctvUtils'

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

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      {/* Video Feed */}
      <div className="relative aspect-video bg-black">
        <img
          ref={videoRef}
          src={cctv.stream_url}
          alt={cctv.name}
          className="w-full h-full object-contain"
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Motion Detection */}
          <div className="p-4 rounded-lg bg-gray-50">
            <div className="flex items-center gap-2 mb-2">
              <span>{CCTV_FEATURES.motion_detection.icon}</span>
              <span className="font-medium">Motion Detection</span>
            </div>
            <input
              type="range"
              min="1"
              max="10"
              value={settings.motion_sensitivity}
              onChange={(e) => setSettings({
                ...settings,
                motion_sensitivity: parseInt(e.target.value)
              })}
              className="w-full"
            />
            <div className="text-sm text-gray-500 mt-1">
              Sensitivity: {settings.motion_sensitivity}
            </div>
          </div>

          {/* Recording Quality */}
          <div className="p-4 rounded-lg bg-gray-50">
            <div className="flex items-center gap-2 mb-2">
              <span>{CCTV_FEATURES.recording.icon}</span>
              <span className="font-medium">Recording</span>
            </div>
            <select
              value={settings.recording_quality}
              onChange={(e) => setSettings({
                ...settings,
                recording_quality: e.target.value
              })}
              className="w-full p-2 rounded-lg border"
            >
              {CCTV_FEATURES.recording.settings.quality.map(quality => (
                <option key={quality} value={quality}>
                  {quality.charAt(0).toUpperCase() + quality.slice(1)}
                </option>
              ))}
            </select>
          </div>

          {/* Audio Controls */}
          <div className="p-4 rounded-lg bg-gray-50">
            <div className="flex items-center gap-2 mb-2">
              <span>{CCTV_FEATURES.audio.icon}</span>
              <span className="font-medium">Audio</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={settings.audio_volume}
              onChange={(e) => setSettings({
                ...settings,
                audio_volume: parseInt(e.target.value)
              })}
              className="w-full"
            />
            <div className="text-sm text-gray-500 mt-1">
              Volume: {settings.audio_volume}%
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 