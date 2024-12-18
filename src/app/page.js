'use client'
import { useEffect, useState } from 'react'
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar'
import 'react-circular-progressbar/dist/styles.css'
import mqttService, { useMqttStore } from '@/lib/mqtt'
import MessageItem from '@/components/MessageItem'
import { getWeather, getWeatherDescription, getWeatherIcon, searchLocation } from '@/lib/weather'
import { calculateUVIndex, getActivityRecommendations, getHealthImpact } from '@/lib/weatherUtils'
import Automation from '@/components/Automation'

export default function Home() {
  const { messages, sensorData } = useMqttStore()
  const [aiInsights, setAiInsights] = useState({
    temperature: {
      trend: 'stable',
      prediction: null,
      recommendation: '',
    },
    humidity: {
      trend: 'stable',
      prediction: null,
      recommendation: '',
    }
  })
  const [weather, setWeather] = useState(null)
  const [location, setLocation] = useState({ name: 'Jakarta', lat: -6.2088, lon: 106.8456 })
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [isSearching, setIsSearching] = useState(false)

  useEffect(() => {
    mqttService.connect()
    analyzeData()
    fetchWeatherData()
    return () => mqttService.disconnect()
  }, [])

  useEffect(() => {
    fetchWeatherData()
    // Cek apakah browser support geolocation
    if ("geolocation" in navigator) {
      // Tanyakan izin lokasi saat komponen dimuat
      navigator.permissions.query({ name: 'geolocation' }).then(result => {
        if (result.state === 'granted') {
          getCurrentLocation()
        }
      })
    }
  }, [])

  useEffect(() => {
    fetchWeatherData()
  }, [location])

  // Analisis data setiap kali sensor data berubah
  useEffect(() => {
    analyzeData()
  }, [sensorData])

  const analyzeData = () => {
    // Analisis Temperatur
    const tempInsight = analyzeTempData(sensorData.temperature)
    const humidityInsight = analyzeHumidityData(sensorData.humidity)

    setAiInsights({
      temperature: tempInsight,
      humidity: humidityInsight
    })
  }

  const analyzeTempData = (temp) => {
    let insight = {
      trend: 'stable',
      prediction: temp,
      recommendation: ''
    }

    if (temp > 30) {
      insight.trend = 'rising'
      insight.prediction = temp + 2
      insight.recommendation = 'Temperature is high. Consider turning on AC or improving ventilation.'
    } else if (temp < 20) {
      insight.trend = 'falling'
      insight.prediction = temp - 1
      insight.recommendation = 'Temperature is low. Consider adjusting heating system.'
    } else {
      insight.recommendation = 'Temperature is at comfortable levels.'
    }

    return insight
  }

  const analyzeHumidityData = (humidity) => {
    let insight = {
      trend: 'stable',
      prediction: humidity,
      recommendation: ''
    }

    if (humidity > 60) {
      insight.trend = 'rising'
      insight.prediction = humidity + 5
      insight.recommendation = 'Humidity is high. Consider using a dehumidifier.'
    } else if (humidity < 30) {
      insight.trend = 'falling'
      insight.prediction = humidity - 2
      insight.recommendation = 'Humidity is low. Consider using a humidifier.'
    } else {
      insight.recommendation = 'Humidity is at comfortable levels.'
    }

    return insight
  }

  const getTemperatureColor = (temp) => {
    if (temp < 25) return '#22c55e' // green-500
    if (temp < 35) return '#f97316' // orange-500
    return '#ef4444' // red-500
  }

  const getHumidityColor = (humidity) => {
    if (humidity < 30) return '#ef4444' // red-500
    if (humidity < 60) return '#f97316' // orange-500
    return '#22c55e' // green-500
  }

  const getCurrentLocation = () => {
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords
        // Dapatkan nama lokasi dari koordinat
        const locations = await searchLocation(`${latitude},${longitude}`)
        if (locations.length > 0) {
          setLocation({
            name: locations[0].name,
            lat: latitude,
            lon: longitude
          })
        }
      },
      (error) => {
        console.error('Error getting location:', error)
      }
    )
  }

  const handleSearch = async (e) => {
    const query = e.target.value
    setSearchQuery(query)

    if (query.length > 2) {
      setIsSearching(true)
      const results = await searchLocation(query)
      setSearchResults(results)
      setIsSearching(false)
    } else {
      setSearchResults([])
    }
  }

  const selectLocation = (result) => {
    setLocation({
      name: result.name,
      lat: result.latitude,
      lon: result.longitude
    })
    setSearchQuery('')
    setSearchResults([])
  }

  const fetchWeatherData = async () => {
    if (location) {
      const weatherData = await getWeather(location.lat, location.lon)
      setWeather(weatherData)
    }
  }

  return (
    <main className="min-h-screen bg-gray-50 p-6">
      {/* Header dengan gradient */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl shadow-lg p-6 mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Smart Home Dashboard</h1>
        <p className="text-blue-100">Monitor your home environment in real-time</p>
      </div>

      {/* AI Insights Panel */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-gray-800">AI Insights</h2>
            <p className="text-gray-500">Smart analysis and recommendations</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center">
            <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Temperature Insights */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center gap-3 mb-4">
              <svg className={`w-6 h-6 ${
                aiInsights.temperature.trend === 'rising' ? 'text-red-500' :
                aiInsights.temperature.trend === 'falling' ? 'text-blue-500' :
                'text-green-500'
              }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {aiInsights.temperature.trend === 'rising' ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                ) : aiInsights.temperature.trend === 'falling' ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                )}
              </svg>
              <h3 className="text-lg font-semibold">Temperature Analysis</h3>
            </div>
            <p className="text-gray-600 mb-2">
              Current trend: <span className="font-medium">{aiInsights.temperature.trend}</span>
            </p>
            <p className="text-gray-600 mb-2">
              Predicted: <span className="font-medium">{aiInsights.temperature.prediction?.toFixed(1)}°C</span>
            </p>
            <p className="text-gray-600">{aiInsights.temperature.recommendation}</p>
          </div>

          {/* Humidity Insights */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center gap-3 mb-4">
              <svg className={`w-6 h-6 ${
                aiInsights.humidity.trend === 'rising' ? 'text-red-500' :
                aiInsights.humidity.trend === 'falling' ? 'text-blue-500' :
                'text-green-500'
              }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {aiInsights.humidity.trend === 'rising' ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                ) : aiInsights.humidity.trend === 'falling' ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                )}
              </svg>
              <h3 className="text-lg font-semibold">Humidity Analysis</h3>
            </div>
            <p className="text-gray-600 mb-2">
              Current trend: <span className="font-medium">{aiInsights.humidity.trend}</span>
            </p>
            <p className="text-gray-600 mb-2">
              Predicted: <span className="font-medium">{aiInsights.humidity.prediction?.toFixed(1)}%</span>
            </p>
            <p className="text-gray-600">{aiInsights.humidity.recommendation}</p>
          </div>
        </div>
      </div>

      {/* Sensor Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Temperature Card */}
        <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-gray-800">Temperature</h2>
              <p className="text-gray-500">Current room temperature</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
          </div>
          <div className="w-48 h-48 mx-auto">
            <CircularProgressbar
              value={sensorData.temperature}
              maxValue={50}
              text={`${sensorData.temperature.toFixed(1)}°C`}
              styles={buildStyles({
                textSize: '16px',
                pathColor: getTemperatureColor(sensorData.temperature),
                textColor: '#1f2937',
                trailColor: '#f3f4f6',
                pathTransitionDuration: 0.5,
              })}
            />
          </div>
          <div className="mt-6 flex justify-center gap-4">
            <div className="text-center">
              <p className="text-sm text-gray-500">Min</p>
              <p className="font-bold text-gray-800">20°C</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-500">Max</p>
              <p className="font-bold text-gray-800">50°C</p>
            </div>
          </div>
        </div>

        {/* Humidity Card */}
        <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-gray-800">Humidity</h2>
              <p className="text-gray-500">Current air humidity</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
          </div>
          <div className="w-48 h-48 mx-auto">
            <CircularProgressbar
              value={sensorData.humidity}
              maxValue={100}
              text={`${sensorData.humidity.toFixed(1)}%`}
              styles={buildStyles({
                textSize: '16px',
                pathColor: getHumidityColor(sensorData.humidity),
                textColor: '#1f2937',
                trailColor: '#f3f4f6',
                pathTransitionDuration: 0.5,
              })}
            />
          </div>
          <div className="mt-6 flex justify-center gap-4">
            <div className="text-center">
              <p className="text-sm text-gray-500">Min</p>
              <p className="font-bold text-gray-800">0%</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-500">Max</p>
              <p className="font-bold text-gray-800">100%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Messages Panel */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-gray-800">Recent Messages</h2>
            <p className="text-gray-500">Latest system notifications</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
            <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
          </div>
        </div>
        <div className="space-y-4 max-h-[400px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
          {messages.length === 0 ? (
            <div className="text-center py-8">
              <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
              <p className="text-gray-500">No messages received yet...</p>
            </div>
          ) : (
            messages.map((msg, index) => (
              <div 
                key={index}
                className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors duration-200"
              >
                <MessageItem {...msg} />
              </div>
            ))
          )}
        </div>
      </div>

      {/* Weather Panel dengan Location Selector */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-gray-800">Weather Forecast</h2>
            <p className="text-gray-500">Local weather conditions</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={getCurrentLocation}
              className="p-2 rounded-lg bg-blue-100 text-blue-600 hover:bg-blue-200 transition-colors"
              title="Use current location"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={handleSearch}
                placeholder="Search location..."
                className="px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 
                         focus:ring-blue-500 focus:border-transparent w-64"
              />
              {isSearching && (
                <div className="absolute right-3 top-3">
                  <svg className="animate-spin h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                </div>
              )}
              {searchResults.length > 0 && (
                <div className="absolute top-full mt-1 w-full bg-white rounded-lg shadow-lg 
                              border border-gray-200 max-h-80 overflow-y-auto z-50">
                  {searchResults.map((result, index) => (
                    <button
                      key={index}
                      onClick={() => selectLocation(result)}
                      className="w-full text-left px-4 py-3 hover:bg-gray-100 border-b border-gray-100 
                                 last:border-0 transition-colors"
                    >
                      <div className="flex items-start gap-2">
                        <svg className="w-5 h-5 text-gray-400 mt-1 flex-shrink-0" 
                             fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        </svg>
                        <div>
                          <div className="font-medium text-gray-900">
                            {result.name}
                            {result.district && 
                              <span className="text-gray-600"> • {result.district}</span>
                            }
                          </div>
                          <p className="text-sm text-gray-500 line-clamp-2">
                            {[
                              result.city,
                              result.state,
                              result.country
                            ].filter(Boolean).join(', ')}
                          </p>
                          {result.type && (
                            <span className="inline-block mt-1 text-xs px-2 py-0.5 bg-gray-100 
                                           text-gray-600 rounded-full">
                              {result.type}
                            </span>
                          )}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {weather && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Current Weather */}
            <div className="bg-gradient-to-br from-sky-500 to-blue-600 rounded-xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-bold">
                    {location.name}
                    {location.district && 
                      <span className="text-lg font-normal"> • {location.district}</span>
                    }
                  </h3>
                  <p className="text-sky-100">
                    {[location.city, location.state].filter(Boolean).join(', ')}
                  </p>
                  <p className="text-sm text-sky-200 mt-1">
                    {getWeatherDescription(weather.current.weather_code)}
                  </p>
                </div>
                <div className="text-4xl">
                  {getWeatherIcon(weather.current.weather_code)}
                </div>
              </div>
              <div className="mt-4">
                <div className="text-4xl font-bold mb-2">
                  {Math.round(weather.current.temperature_2m)}°C
                </div>
                <div className="flex gap-4 text-sky-100">
                  <span>Humidity: {weather.current.relative_humidity_2m}%</span>
                  <span>Wind: {weather.current.wind_speed_10m} km/h</span>
                </div>
              </div>
            </div>

            {/* Daily Forecast */}
            <div className="bg-gray-50 rounded-xl p-6">
              <h3 className="text-lg font-semibold mb-4">7-Day Forecast</h3>
              <div className="space-y-4">
                {weather.daily.time.map((time, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="text-2xl">
                        {getWeatherIcon(weather.daily.weather_code[index])}
                      </div>
                      <div>
                        <p className="font-medium">
                          {new Date(time).toLocaleDateString('en-US', { weekday: 'short' })}
                        </p>
                        <p className="text-sm text-gray-500">
                          {getWeatherDescription(weather.daily.weather_code[index])}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">
                        {Math.round(weather.daily.temperature_2m_max[index])}°C
                      </p>
                      <p className="text-sm text-gray-500">
                        {Math.round(weather.daily.temperature_2m_min[index])}°C
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {!weather && (
          <div className="text-center py-8">
            <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
            </svg>
            <p className="text-gray-500">Loading weather data...</p>
          </div>
        )}
      </div>

      {/* Advanced Weather Insights */}
      {weather && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* UV and Health Panel */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Health & UV Index</h3>
            <div className="space-y-6">
              {/* UV Index */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-600">UV Index</span>
                  <span className={`font-semibold ${calculateUVIndex(weather).color}`}>
                    {calculateUVIndex(weather).level}
                  </span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className={`h-full ${calculateUVIndex(weather).color.replace('text', 'bg')}`}
                    style={{ width: `${(weather.daily.uv_index_max[0] / 11) * 100}%` }}
                  />
                </div>
              </div>

              {/* Health Impacts */}
              <div className="space-y-3">
                {getHealthImpact(weather).map((impact, index) => (
                  <div key={index} className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-full ${
                        impact.severity === 'high' ? 'bg-red-100 text-red-600' :
                        impact.severity === 'moderate' ? 'bg-yellow-100 text-yellow-600' :
                        'bg-blue-100 text-blue-600'
                      }`}>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-800">{impact.condition}</h4>
                        <p className="text-sm text-gray-600">{impact.advice}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Activity Recommendations */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Activity Recommendations</h3>
            <div className="space-y-4">
              {getActivityRecommendations(weather).map((rec, index) => (
                <div key={index} className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-2xl">{rec.icon}</span>
                    <h4 className="font-medium text-gray-800">{rec.type}</h4>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {rec.activities.map((activity, idx) => (
                      <span 
                        key={idx}
                        className="px-3 py-1 bg-white rounded-full text-sm text-gray-600 border border-gray-200"
                      >
                        {activity}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Share Weather */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-gray-800">Share Weather</h3>
          <div className="flex gap-2">
            <button
              onClick={() => {
                const text = `Weather in ${location.name}: ${Math.round(weather.current.temperature_2m)}°C, ${getWeatherDescription(weather.current.weather_code)}`
                window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank')
              }}
              className="p-2 rounded-lg bg-green-500 text-white hover:bg-green-600 transition-colors"
              title="Share via WhatsApp"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
              </svg>
            </button>
            <button
              onClick={() => {
                const text = `Weather in ${location.name}: ${Math.round(weather.current.temperature_2m)}°C, ${getWeatherDescription(weather.current.weather_code)}`
                navigator.clipboard.writeText(text)
                  .then(() => alert('Weather info copied to clipboard!'))
              }}
              className="p-2 rounded-lg bg-gray-500 text-white hover:bg-gray-600 transition-colors"
              title="Copy to clipboard"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
              </svg>
            </button>
          </div>
        </div>
      </div>
      <Automation />
    </main>
  )
}
