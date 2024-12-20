'use client'
import { useState, useEffect, useRef } from 'react'
import VoiceStreamer from '@/lib/VoiceStreamer'

export default function CCTVViewer({ cctv }) {
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [motionDetected, setMotionDetected] = useState(false)
  const videoRef = useRef(null)
  const [isStreaming, setIsStreaming] = useState(false)
  const voiceStreamerRef = useRef(null)

  // Simulasi motion detection
  useEffect(() => {
    const interval = setInterval(() => {
      const hasMotion = Math.random() > 0.8
      if (hasMotion && !motionDetected) {
        setMotionDetected(true)
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
  }

  return (
    <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-xl overflow-hidden border border-gray-100">
      {/* Video Feed dengan Border Gradient */}
      <div className="relative aspect-video bg-gradient-to-br from-gray-900 to-gray-800 p-0.5">
        <img
          ref={videoRef}
          src={cctv.stream_url}
          alt={cctv.name}
          className="w-full h-full object-cover rounded-lg"
        />

        {/* Overlay Controls dengan Glass Effect */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/60
                      opacity-0 hover:opacity-100 transition-all duration-300 backdrop-blur-sm">
          {/* Status Badge dengan Glow Effect */}
          <div className="absolute top-4 left-4">
            <div className="flex items-center gap-2 bg-black/40 backdrop-blur-md px-4 py-2 rounded-full
                          border border-white/10 shadow-lg">
              <span className={`w-3 h-3 rounded-full ${
                motionDetected
                  ? 'bg-red-500 animate-pulse shadow-lg shadow-red-500/50'
                  : 'bg-green-500 shadow-lg shadow-green-500/50'
              }`} />
              <span className="text-white text-sm font-medium tracking-wide">
                {motionDetected ? 'Motion Detected' : 'Monitoring'}
              </span>
            </div>
          </div>

          {/* Bottom Controls dengan Modern Design */}
          <div className="absolute bottom-4 left-4 right-4">
            <div className="flex items-center justify-between bg-black/40 backdrop-blur-md
                          rounded-2xl p-3 border border-white/10">
              <div className="flex gap-3">
                <button
                  onClick={toggleRecording}
                  className={`px-5 py-2.5 rounded-xl flex items-center gap-2.5 transition-all
                           font-medium ${
                    isRecording
                      ? 'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg shadow-red-500/30'
                      : 'bg-white/10 text-white hover:bg-white/20 hover:shadow-lg hover:scale-105'
                  }`}
                >
                  {isRecording ? (
                    <>
                      <span className="w-2 h-2 rounded-full bg-white animate-pulse shadow-lg" />
                      Recording
                    </>
                  ) : (
                    <>
                      <span className="text-lg">⏺</span>
                      Record
                    </>
                  )}
                </button>

                <button
                  onClick={() => {/* Implement snapshot */}}
                  className="px-5 py-2.5 rounded-xl bg-white/10 text-white
                           hover:bg-white/20 hover:shadow-lg hover:scale-105
                           flex items-center gap-2.5 transition-all font-medium"
                >
                  <span className="text-lg">📸</span>
                  Snapshot
                </button>
              </div>

              <button
                onClick={toggleFullscreen}
                className="p-3 rounded-xl bg-white/10 text-white
                         hover:bg-white/20 hover:shadow-lg hover:scale-105
                         w-11 h-11 flex items-center justify-center transition-all"
              >
                {isFullscreen ? '⊖' : '⊕'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Camera Info dengan Modern Design */}
      <div className="p-6">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-xl font-bold text-gray-800 mb-1">{cctv.name}</h3>
            <div className="flex items-center gap-2 text-gray-500">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <p className="text-sm">{cctv.location}</p>
            </div>
          </div>

          {/* Status Indicator */}
          <div className="flex items-center gap-2 bg-green-50 text-green-600 px-3 py-1 rounded-full">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
            <span className="text-sm font-medium">Live</span>
          </div>
        </div>
      </div>
    </div>
  )
}
