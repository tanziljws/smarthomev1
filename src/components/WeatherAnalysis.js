'use client'
import { useState, useEffect } from 'react'
import { getWeatherDescription, getWeatherIcon } from '@/lib/weathers/weather'
import { analyzeWeatherData } from '@/lib/weathers/weatherAI'
import { motion, AnimatePresence } from 'framer-motion'
import { FiClock, FiSun, FiDroplet, FiThermometer, FiAlertTriangle, FiCalendar, FiMapPin } from 'react-icons/fi'

const gradients = {
  sunny: 'from-orange-400 via-amber-400 to-yellow-400',
  cloudy: 'from-blue-400 via-slate-400 to-gray-400',
  rainy: 'from-blue-600 via-indigo-500 to-purple-500',
  night: 'from-indigo-900 via-blue-800 to-purple-900',
  dawn: 'from-pink-500 via-rose-400 to-orange-400',
  dusk: 'from-purple-600 via-violet-500 to-indigo-600'
}

const pageTransition = {
  type: "spring",
  stiffness: 100,
  damping: 20
}

const hoverEffect = {
  scale: 1.02,
  y: -5,
  transition: {
    duration: 0.2
  }
}

export default function WeatherAnalysis({ weather, location }) {
  const [analysis, setAnalysis] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('ringkasan')
  const [selectedTime, setSelectedTime] = useState('all')
  const [currentTime, setCurrentTime] = useState(new Date())
  const [timeFormat, setTimeFormat] = useState('24') // '24' atau '12'
  const [localTime, setLocalTime] = useState(null)
  const [timezone, setTimezone] = useState('UTC')

  useEffect(() => {
    if (weather && location) {
      updateAnalysis()
    }
  }, [weather, location])

  useEffect(() => {
    if (weather?.timezone) {
      updateLocalTime()
    }
  }, [weather, location])

  const updateLocalTime = () => {
    if (weather?.timezone) {
      try {
        const now = new Date()
        const options = {
          timeZone: weather.timezone,
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: timeFormat === '12'
        }
        setLocalTime(new Intl.DateTimeFormat('id-ID', options).format(now))
        setCurrentTime(new Date(now.toLocaleString('en-US', { timeZone: weather.timezone })))
      } catch (error) {
        console.error('Error updating time:', error)
      }
    }
  }

  useEffect(() => {
    if (weather?.timezone) {
      updateLocalTime()
      const timer = setInterval(updateLocalTime, 1000)
      return () => clearInterval(timer)
    }
  }, [weather?.timezone, timeFormat])

  // Hitung offset string
  const getTimezoneOffset = () => {
    if (!location?.longitude) return 'UTC'
    const offset = Math.round(location.longitude / 15)
    const sign = offset >= 0 ? '+' : '-'
    return `UTC${sign}${Math.abs(offset)}`
  }

  const updateAnalysis = async () => {
    setLoading(true)
    const result = await analyzeWeatherData(weather, location)
    setAnalysis(result)
    setLoading(false)
  }

  const getBackgroundGradient = () => {
    const timeOfDay = getTimeOfDay()
    const gradients = {
      morning: 'from-orange-400 via-amber-300 to-yellow-300',
      afternoon: 'from-blue-400 via-sky-300 to-cyan-300',
      evening: 'from-orange-500 via-pink-500 to-purple-500',
      night: 'from-indigo-900 via-purple-900 to-blue-900',
      'late-night': 'from-gray-900 via-slate-800 to-zinc-900'
    }
    return gradients[timeOfDay]
  }

  const getTimeIcon = (time) => {
    const hour = parseInt(time.split(':')[0])
    if (hour >= 3 && hour < 5) return '🌙'
    if (hour >= 5 && hour < 7) return '🌅'
    if (hour >= 7 && hour < 10) return '🌄'
    if (hour >= 10 && hour < 15) return '☀️'
    if (hour >= 15 && hour < 18) return '���️'
    if (hour >= 18 && hour < 22) return '🌆'
    return '🌃'
  }

  const filterActivitiesByTime = (activities) => {
    if (!Array.isArray(activities)) return []
    if (selectedTime === 'all') return activities
    return activities.filter(act => act.time?.includes(selectedTime))
  }

  const formatTime = (date) => {
    try {
      return date.toLocaleTimeString('id-ID', {
        timeZone: timezone,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: timeFormat === '12'
      })
    } catch (error) {
      console.error('Error formatting time:', error)
      return '--:--:--'
    }
  }

  const getTimeOfDay = () => {
    const hour = currentTime.getHours()
    if (hour >= 5 && hour < 12) return 'morning'
    if (hour >= 12 && hour < 15) return 'afternoon'
    if (hour >= 15 && hour < 18) return 'evening'
    if (hour >= 18 && hour < 22) return 'night'
    return 'late-night'
  }

  const getParticleColor = () => {
    const timeOfDay = getTimeOfDay()
    const colors = {
      morning: '#FFF',
      afternoon: '#FFF',
      evening: '#FFD700',
      night: '#E6E6FA',
      'late-night': '#708090'
    }
    return colors[timeOfDay]
  }

  if (loading) return <WeatherSkeleton />

  const tabs = [
    { id: 'ringkasan', label: 'Ringkasan', icon: '📊' },
    { id: 'aktivitas', label: 'Aktivitas', icon: '🏃' },
    { id: 'kesehatan', label: 'Kesehatan', icon: '❤' },
    {
      id: 'peringatan',
      label: 'Peringatan',
      icon: '⚠',
      alert: weather?.current?.temperature_2m < 10 || weather?.current?.temperature_2m > 35
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6">
      {/* Clock with Dynamic Particles */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className={`relative mb-8 overflow-hidden rounded-3xl bg-gradient-to-br
                   ${getBackgroundGradient()} shadow-2xl transition-colors duration-1000`}
      >
        {/* Location & Timezone Info */}
        <div className="absolute top-4 left-4 z-20 flex flex-col sm:flex-row gap-2">
          <div className="bg-black/20 backdrop-blur-sm px-4 py-2 rounded-full text-white flex items-center gap-2">
            <FiMapPin className="w-4 h-4" />
            <span>{location?.name || 'Loading...'}</span>
          </div>
          <div className="bg-black/20 backdrop-blur-sm px-3 py-1 rounded-full text-white text-sm flex items-center gap-1">
            <FiClock className="w-3 h-3" />
            <span>{weather?.timezone_abbreviation || 'UTC'}</span>
          </div>
        </div>

        {/* Dynamic Particles */}
        <div className="particles-container">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="particle"
              animate={{
                y: [-20, -120],
                x: Math.sin(i) * 20,
                opacity: [0.2, 0],
                scale: [1, 0.5]
              }}
              transition={{
                duration: 2 + Math.random() * 2,
                repeat: Infinity,
                delay: i * 0.2
              }}
              style={{
                left: `${Math.random() * 100}%`,
                width: `${4 + Math.random() * 4}px`,
                height: `${4 + Math.random() * 4}px`,
                background: getParticleColor()
              }}
            />
          ))}
        </div>

        {/* Clock Content */}
        <div className="relative z-10 p-8 text-center">
          <motion.div
            animate={{
              scale: [1, 1.02, 1],
              transition: { duration: 2, repeat: Infinity }
            }}
            className="mb-4"
          >
            <div className="text-6xl font-bold text-white font-mono tracking-wider
                          text-shadow-lg backdrop-blur-sm py-4 px-6 rounded-2xl
                          bg-white/10 inline-block"
            >
              {localTime || '--:--:--'}
            </div>
          </motion.div>

          <div className="flex flex-col md:flex-row items-center justify-center gap-4
                        text-white/90">
            <div className="flex items-center gap-2">
              <FiCalendar className="w-5 h-5" />
              <span className="font-medium">
                {currentTime.toLocaleDateString('id-ID', {
                  timeZone: weather?.timezone,
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm">{timezone}</span>
              <button
                onClick={() => setTimeFormat(prev => prev === '24' ? '12' : '24')}
                className="px-4 py-2 rounded-xl bg-white/20 hover:bg-white/30
                         transition-all flex items-center gap-2 text-sm font-medium"
              >
                <FiClock className="w-4 h-4" />
                Format {timeFormat}H
              </button>
            </div>
          </div>
        </div>

        {/* Animated Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
      </motion.div>

      {/* Header dengan Efek Glassmorphism */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`bg-gradient-to-r ${getBackgroundGradient()}
                   rounded-xl p-8 text-white mb-6 shadow-lg
                   backdrop-blur-lg relative overflow-hidden`}
      >
        {/* Particle Effect */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="particles-container">
            {[...Array(20)].map((_, i) => (
              <div
                key={i}
                className="particle"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 2}s`
                }}
              />
            ))}
          </div>
        </div>

        <div className="relative z-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-6">
              <motion.span
                className="text-7xl"
                animate={{ rotate: [0, 10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                {getWeatherIcon(weather?.current?.weather_code)}
              </motion.span>
              <div>
                <h2 className="text-4xl font-bold mb-2">{location.name}</h2>
                <p className="text-xl text-white/90">
                  {getWeatherDescription(weather?.current?.weather_code)}
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-6xl font-bold mb-2">
                {weather?.current?.temperature_2m}°C
              </div>
              <p className="text-lg text-white/90">
                Terasa seperti {weather?.current?.apparent_temperature}°C
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Tab Navigation */}
      <div className="flex overflow-x-auto gap-3 mb-6 p-2 bg-white/80
                    backdrop-blur-md rounded-xl shadow-lg">
        {tabs.map(tab => (
          <motion.button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`relative flex items-center gap-2 px-6 py-3 rounded-lg transition-all
                      ${activeTab === tab.id
                        ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg'
                        : 'hover:bg-white/50'
                      }`}
          >
            <span className="text-xl">{tab.icon}</span>
            <span className="font-medium">{tab.label}</span>

            {/* Alert Badge */}
            {tab.alert && tab.id === 'peringatan' && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{
                  scale: 1,
                  transition: {
                    type: "spring",
                    stiffness: 500,
                    damping: 15
                  }
                }}
                className="absolute -top-2 -right-2 w-5 h-5 bg-red-500
                         rounded-full flex items-center justify-center"
              >
                <span className="text-white text-xs">!</span>
              </motion.div>
            )}
          </motion.button>
        ))}
      </div>

      {/* Time Filter untuk Tab Aktivitas */}
      {activeTab === 'aktivitas' && (
        <div className="flex gap-2 overflow-x-auto pb-4">
          <button
            onClick={() => setSelectedTime('all')}
            className={`px-4 py-2 rounded-full ${
              selectedTime === 'all' ? 'bg-blue-500 text-white' : 'bg-gray-100'
            }`}
          >
            Semua Waktu
          </button>
          {['03:00', '05:00', '07:00', '10:00', '15:00', '18:00', '22:00'].map((time) => (
            <button
              key={time}
              onClick={() => setSelectedTime(time)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap ${
                selectedTime === time ? 'bg-blue-500 text-white' : 'bg-gray-100'
              }`}
            >
              {getTimeIcon(time)} {time}
            </button>
          ))}
        </div>
      )}

      {/* Konten Tab */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          {/* Ringkasan Tab */}
          {activeTab === 'ringkasan' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <WeatherCard
                title="Kelembaban"
                value={`${weather?.current?.relative_humidity_2m}%`}
                icon="💧"
                gradient="from-blue-400 to-blue-600"
              />
              <WeatherCard
                title="Tekanan Udara"
                value={`${weather?.current?.pressure_msl} hPa`}
                icon="🌡"
                gradient="from-purple-400 to-purple-600"
              />
              <WeatherCard
                title="Kecepatan Angin"
                value={`${weather?.current?.wind_speed_10m} km/h`}
                icon="🌪"
                gradient="from-green-400 to-green-600"
              />
            </div>
          )}

          {/* Aktivitas Tab */}
          {activeTab === 'aktivitas' && (
            <div className="grid gap-6">
              {filterActivitiesByTime(analysis?.recommendedActivities).map((activity, index) => (
                <ActivityDetailCard key={index} activity={activity} />
              ))}
            </div>
          )}

          {/* Kesehatan Tab */}
          {activeTab === 'kesehatan' && (
            <div className="space-y-4">
              {analysis?.healthImpacts?.map((impact, index) => (
                <HealthImpactCard key={index} impact={impact} />
              ))}
            </div>
          )}

          {/* Peringatan Tab */}
          {activeTab === 'peringatan' && (
            <div className="space-y-4">
              {analysis?.warnings?.length > 0 ? (
                analysis.warnings.map((warning, index) => (
                  <WarningCard key={index} warning={warning} />
                ))
              ) : (
                <div className="text-center p-8 bg-green-50 rounded-xl">
                  <span className="text-4xl mb-4 block">✅</span>
                  <p className="text-green-800">Tidak ada peringatan cuaca saat ini</p>
                </div>
              )}
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

const WeatherCard = ({ title, value, icon, gradient }) => (
  <motion.div
    whileHover={hoverEffect}
    className={`bg-gradient-to-br ${gradient} p-6 rounded-xl text-white shadow-lg
                relative overflow-hidden backdrop-blur-sm group`}
  >
    <div className="absolute inset-0 opacity-10">
      <svg className="w-full h-full" viewBox="0 0 100 100">
        <pattern id="weather-pattern" patternUnits="userSpaceOnUse" width="10" height="10">
          <circle cx="5" cy="5" r="2" fill="currentColor" />
        </pattern>
        <rect width="100" height="100" fill="url(#weather-pattern)" />
      </svg>
    </div>

    <div className="absolute inset-0 bg-white/10 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity" />

    <div className="relative z-10">
      <div className="flex items-center gap-3 mb-4">
        <motion.span
          className="text-4xl filter drop-shadow-lg"
          animate={{
            rotate: [0, 10, 0],
            scale: [1, 1.1, 1]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          {icon}
        </motion.span>
        <h3 className="text-xl font-medium">{title}</h3>
      </div>
      <p className="text-3xl font-bold tracking-tight">{value}</p>
    </div>

    <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-white/10 rounded-full blur-xl" />
  </motion.div>
)

const ActivityDetailCard = ({ activity }) => (
  <motion.div
    whileHover={hoverEffect}
    className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100
               relative group"
  >
    <div className="bg-gradient-to-r from-blue-500 to-purple-500 p-6 text-white relative overflow-hidden">
      <div className="absolute inset-0 opacity-20">
        <svg className="w-full h-full">
          <pattern id="activity-pattern" patternUnits="userSpaceOnUse" width="20" height="20">
            <path d="M0 10h20v1H0zM10 0v20h1V0z" fill="currentColor" />
          </pattern>
          <rect width="100%" height="100%" fill="url(#activity-pattern)" />
        </svg>
      </div>

      <div className="relative z-10">
        <div className="flex justify-between items-center">
          <h3 className="text-2xl font-bold tracking-tight">{activity.type}</h3>
          <span className="text-sm bg-white/20 px-4 py-1.5 rounded-full backdrop-blur-sm">
            {activity.time}
          </span>
        </div>
      </div>
    </div>

    <div className="p-6 space-y-6">
      {activity.energyLevel && (
        <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg
                      transform transition-transform group-hover:scale-105">
          <FiThermometer className="text-blue-500 text-xl" />
          <span className="text-sm font-medium text-blue-700">
            Level Energi: {activity.energyLevel}
          </span>
        </div>
      )}

      <div className="space-y-4">
        {activity.activities?.map((act, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors"
          >
            {typeof act === 'string' ? (
              <p className="text-gray-700">{act}</p>
            ) : (
              <div>
                <h4 className="font-medium text-gray-900">{act.name}</h4>
                {act.duration && (
                  <div className="flex items-center gap-2 text-sm text-gray-600 mt-2">
                    <FiClock className="text-blue-500" />
                    {act.duration}
                  </div>
                )}
                {act.intensity && (
                  <span className="inline-block mt-2 px-3 py-1 rounded-full text-xs
                                 bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800">
                    {act.intensity}
                  </span>
                )}
              </div>
            )}
          </motion.div>
        ))}
      </div>

      {activity.healthBenefits && (
        <div className="mt-6 p-4 bg-green-50 rounded-lg border border-green-100">
          <h4 className="font-medium text-green-800 mb-3 flex items-center gap-2">
            <span className="text-lg">🌱</span> Manfaat Kesehatan
          </h4>
          <ul className="space-y-2">
            {activity.healthBenefits.map((benefit, i) => (
              <li key={i} className="flex items-start gap-2 text-green-700">
                <span className="text-green-500 mt-1">•</span>
                <span>{benefit}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {activity.note && (
        <div className="mt-4 p-4 bg-amber-50 rounded-lg border border-amber-100">
          <p className="text-amber-800 flex items-center gap-2">
            <span className="text-lg">💡</span>
            <span className="text-sm">{activity.note}</span>
          </p>
        </div>
      )}
    </div>
  </motion.div>
)

const HealthImpactCard = ({ impact }) => (
  <motion.div
    whileHover={hoverEffect}
    className={`p-6 rounded-xl shadow-lg relative overflow-hidden
      ${impact.severity === 'high'
        ? 'bg-gradient-to-br from-red-50 via-red-100 to-rose-50 border-l-4 border-l-red-500'
        : impact.severity === 'moderate'
        ? 'bg-gradient-to-br from-amber-50 via-amber-100 to-yellow-50 border-l-4 border-l-yellow-500'
        : 'bg-gradient-to-br from-green-50 via-green-100 to-emerald-50 border-l-4 border-l-green-500'
      }`}
  >
    {/* Background Pattern */}
    <div className="absolute inset-0 opacity-5">
      <svg className="w-full h-full">
        <pattern id="health-pattern" patternUnits="userSpaceOnUse" width="40" height="40">
          <path d="M20 0L40 20L20 40L0 20z" fill="currentColor" />
        </pattern>
        <rect width="100%" height="100%" fill="url(#health-pattern)" />
      </svg>
    </div>

    <div className="relative z-10 flex items-start gap-4">
      <div className={`p-4 rounded-xl transform transition-transform group-hover:scale-110
        ${impact.severity === 'high'
          ? 'bg-red-100 text-red-600'
          : impact.severity === 'moderate'
          ? 'bg-yellow-100 text-yellow-600'
          : 'bg-green-100 text-green-600'
        }`}
      >
        <motion.span
          className="text-2xl block"
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 5, 0]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          {impact.severity === 'high' ? '⚠️' : impact.severity === 'moderate' ? '⚡' : '✅'}
        </motion.span>
      </div>

      <div className="flex-1">
        <h4 className={`font-semibold text-xl mb-3
          ${impact.severity === 'high'
            ? 'text-red-800'
            : impact.severity === 'moderate'
            ? 'text-yellow-800'
            : 'text-green-800'
          }`}
        >
          {impact.condition}
        </h4>
        <p className="text-gray-700 leading-relaxed">{impact.advice}</p>

        {/* Tambahan visual indicator */}
        <div className="mt-4 flex gap-2">
          {impact.severity === 'high' && (
            <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm">
              Perhatian Khusus
            </span>
          )}
          {impact.precautions && impact.precautions.map((precaution, idx) => (
            <span key={idx} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
              {precaution}
            </span>
          ))}
        </div>
      </div>
    </div>
  </motion.div>
)

const WarningCard = ({ warning }) => (
  <motion.div
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    whileHover={hoverEffect}
    className="relative overflow-hidden group"
  >
    <div className="bg-gradient-to-r from-red-50 to-rose-50 rounded-xl p-6 border-l-4 border-l-red-500 shadow-lg">
      {/* Warning Pattern */}
      <div className="absolute inset-0 opacity-5">
        <svg className="w-full h-full">
          <pattern id="warning-pattern" patternUnits="userSpaceOnUse" width="30" height="30">
            <path d="M15 0l15 30H0z" fill="currentColor" />
          </pattern>
          <rect width="100%" height="100%" fill="url(#warning-pattern)" />
        </svg>
      </div>

      <div className="relative z-10 flex items-start gap-4">
        <div className="p-3 bg-red-100 rounded-xl">
          <motion.span
            className="text-2xl block text-red-600"
            animate={{
              scale: [1, 1.2, 1],
              rotate: [0, 10, 0]
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            ⚠️
          </motion.span>
        </div>

        <div className="flex-1">
          <p className="text-red-800 font-medium leading-relaxed">{warning}</p>
          <div className="mt-3 flex gap-2">
            <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm">
              Peringatan Penting
            </span>
          </div>
        </div>
      </div>
    </div>
  </motion.div>
)

function WeatherSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header Skeleton */}
      <div className="bg-gradient-to-r from-gray-200 to-gray-300 rounded-xl h-48 animate-pulse relative overflow-hidden">
        <div className="absolute inset-0 bg-shimmer"></div>
      </div>

      {/* Tab Navigation Skeleton */}
      <div className="flex gap-3 overflow-x-auto">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-12 w-32 bg-gray-200 rounded-lg animate-pulse" />
        ))}
      </div>

      {/* Content Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-40 bg-gradient-to-r from-gray-200 to-gray-300 rounded-xl animate-pulse relative overflow-hidden">
            <div className="absolute inset-0 bg-shimmer"></div>
          </div>
        ))}
      </div>
    </div>
  )
}

// Add these styles to your global CSS or component
const styles = `
  .particles-container {
    position: absolute;
    inset: 0;
    overflow: hidden;
  }

  .particle {
    position: absolute;
    background: white;
    border-radius: 50%;
    opacity: 0.3;
    pointer-events: none;
  }

  .text-shadow-lg {
    text-shadow: 0 2px 10px rgba(0,0,0,0.2);
  }

  @keyframes float {
    0%, 100% {
      transform: translateY(0) scale(1);
      opacity: 0.3;
    }
    50% {
      transform: translateY(-20px) scale(1.1);
      opacity: 0.1;
    }
  }

  @keyframes pulse {
    0%, 100% {
      transform: scale(1);
      opacity: 0.8;
    }
    50% {
      transform: scale(1.05);
      opacity: 1;
    }
  }

  @keyframes pulse-ring {
    0% {
      transform: scale(0.8);
      opacity: 0.5;
    }
    100% {
      transform: scale(1.3);
      opacity: 0;
    }
  }

  .pulse-ring::before {
    content: '';
    position: absolute;
    inset: -4px;
    border-radius: 50%;
    background-color: currentColor;
    opacity: 0.4;
    animation: pulse-ring 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
  }
`

// Inject styles
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement("style")
  styleSheet.innerText = styles
  document.head.appendChild(styleSheet)
}
