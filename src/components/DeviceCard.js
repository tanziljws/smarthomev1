import { useState } from 'react'
import { DEVICE_TYPES } from '@/lib/deviceUtils'

export default function DeviceCard({ device, onUpdate, onDelete }) {
  const [showSettings, setShowSettings] = useState(false)
  
  // Pastikan device type valid, default ke 'light' jika tidak valid
  const deviceType = DEVICE_TYPES[device.type] || DEVICE_TYPES['light']

  const handlePowerToggle = () => {
    onUpdate({ ...device, status: !device.status })
  }

  const handleSettingChange = (setting, value) => {
    onUpdate({ 
      ...device, 
      settings: { ...(device.settings || {}), [setting]: value }
    })
  }

  return (
    <div className={`bg-white rounded-xl shadow-lg overflow-hidden
                    border-2 transition-all duration-300
                    ${device.status ? 'border-green-500' : 'border-gray-200'}`}>
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">{deviceType.icon}</span>
              <div>
                <h3 className="text-xl font-bold text-gray-800">{device.name}</h3>
                <p className="text-sm text-gray-500">{device.room}</p>
              </div>
            </div>
          </div>
          <div className={`w-12 h-12 rounded-full flex items-center justify-center
                        ${device.status ? 'bg-green-100' : 'bg-gray-100'}`}>
            <span className={`text-2xl ${device.status ? 'text-green-600' : 'text-gray-400'}`}>
              {deviceType.icon}
            </span>
          </div>
        </div>

        {/* Quick Controls */}
        <div className="flex flex-col gap-3">
          <button
            onClick={handlePowerToggle}
            className={`w-full py-3 rounded-lg font-medium transition-all duration-300
                      flex items-center justify-center gap-2 
                      ${device.status 
                        ? 'bg-green-500 hover:bg-green-600 text-white' 
                        : 'bg-gray-200 hover:bg-gray-300 text-gray-700'}`}
          >
            {device.status ? 'Turn OFF' : 'Turn ON'}
          </button>

          {/* Device-specific quick controls */}
          {device.type === 'ac' && device.status && (
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => handleSettingChange('temperature', (device.settings?.temperature || 24) - 1)}
                className="p-2 rounded-lg bg-blue-100 text-blue-600 hover:bg-blue-200"
              >
                Temp -
              </button>
              <button
                onClick={() => handleSettingChange('temperature', (device.settings?.temperature || 24) + 1)}
                className="p-2 rounded-lg bg-red-100 text-red-600 hover:bg-red-200"
              >
                Temp +
              </button>
            </div>
          )}

          {device.type === 'light' && device.status && (
            <input
              type="range"
              min="0"
              max="100"
              value={device.settings?.brightness || 100}
              onChange={(e) => handleSettingChange('brightness', parseInt(e.target.value))}
              className="w-full"
            />
          )}
        </div>

        {/* Advanced Settings Button */}
        <button
          onClick={() => setShowSettings(!showSettings)}
          className="mt-4 w-full py-2 text-sm text-gray-600 hover:text-gray-800
                    flex items-center justify-center gap-2"
        >
          <svg className={`w-4 h-4 transition-transform ${showSettings ? 'rotate-180' : ''}`} 
               fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                  d="M19 9l-7 7-7-7" />
          </svg>
          {showSettings ? 'Hide Settings' : 'Show Settings'}
        </button>

        {/* Advanced Settings Panel */}
        {showSettings && (
          <div className="mt-4 pt-4 border-t">
            <div className="space-y-4">
              {deviceType.features?.includes('temperature') && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Temperature
                  </label>
                  <input
                    type="number"
                    min={deviceType.settings?.temperature?.min || 16}
                    max={deviceType.settings?.temperature?.max || 30}
                    value={device.settings?.temperature || 24}
                    onChange={(e) => handleSettingChange('temperature', parseInt(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg border focus:ring-2 
                             focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              )}

              {deviceType.features?.includes('mode') && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Mode
                  </label>
                  <select
                    value={device.settings?.mode || 'auto'}
                    onChange={(e) => handleSettingChange('mode', e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border focus:ring-2 
                             focus:ring-blue-500 focus:border-transparent"
                  >
                    {deviceType.settings?.mode?.map(mode => (
                      <option key={mode} value={mode}>
                        {mode.charAt(0).toUpperCase() + mode.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Delete Device */}
              <button
                onClick={() => onDelete(device.id)}
                className="w-full py-2 mt-4 text-red-600 hover:bg-red-50 rounded-lg
                         transition-colors flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Delete Device
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
} 