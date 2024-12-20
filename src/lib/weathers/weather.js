const BASE_URL = 'https://api.open-meteo.com/v1'

export const getWeather = async (latitude = -6.2088, longitude = 106.8456) => {
  try {
    const response = await fetch(
      `${BASE_URL}/forecast?` +
      `latitude=${latitude}&` +
      `longitude=${longitude}&` +
      `current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m,apparent_temperature,pressure_msl&` +
      `hourly=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m,pressure_msl&` +
      `daily=weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset,uv_index_max&` +
      `timezone=auto`
    )
    const data = await response.json()
    return data
  } catch (error) {
    console.error('Error fetching weather:', error)
    return null
  }
}

export const getWeatherDescription = (code) => {
  const weatherCodes = {
    0: 'Cerah',
    1: 'Sebagian Berawan',
    2: 'Berawan Sebagian',
    3: 'Mendung',
    45: 'Berkabut',
    48: 'Berkabut Tebal dengan Embun',
    51: 'Gerimis Ringan',
    53: 'Gerimis Sedang',
    55: 'Gerimis Lebat',
    56: 'Gerimis Dingin Ringan',
    57: 'Gerimis Dingin Lebat',
    61: 'Hujan Ringan',
    63: 'Hujan Sedang',
    65: 'Hujan Lebat',
    66: 'Hujan Dingin Ringan',
    67: 'Hujan Dingin Lebat',
    71: 'Salju Ringan',
    73: 'Salju Sedang',
    75: 'Salju Lebat',
    77: 'Butiran Salju',
    80: 'Hujan Lokal Ringan',
    81: 'Hujan Lokal Sedang',
    82: 'Hujan Lokal Lebat',
    85: 'Salju Lokal Ringan',
    86: 'Salju Lokal Lebat',
    95: 'Badai Petir',
    96: 'Badai Petir dengan Hujan Es Ringan',
    99: 'Badai Petir dengan Hujan Es Lebat'
  }

  return weatherCodes[code] || 'Tidak Diketahui'
}

export const getWeatherIcon = (code, isNight = false) => {
  const getTimeBasedIcon = (dayIcon, nightIcon) => isNight ? nightIcon : dayIcon

  const weatherIcons = {
    0: getTimeBasedIcon('☀️', '🌙'),
    1: getTimeBasedIcon('🌤️', '🌙'),
    2: getTimeBasedIcon('⛅', '☁️'),
    3: '☁️',
    45: '🌫️',
    48: '🌫️',
    51: '🌦️',
    53: '🌧️',
    55: '🌧️',
    56: '🌨️',
    57: '🌨️',
    61: '🌧️',
    63: '🌧️',
    65: '🌧️',
    66: '🌨️',
    67: '🌨️',
    71: '🌨️',
    73: '🌨️',
    75: '❄️',
    77: '❄️',
    80: '🌦️',
    81: '🌧️',
    82: '⛈️',
    85: '🌨️',
    86: '❄️',
    95: '⛈️',
    96: '⛈️',
    99: '⛈️'
  }

  return weatherIcons[code] || '❓'
}

export const getWindDirection = (degrees) => {
  const directions = ['⬆️ U', '↗️ TL', '➡️ T', '↘️ TG', '⬇️ S', '↙️ BD', '⬅️ B', '↖️ BL']
  return directions[Math.round(degrees / 45) % 8]
}

export const searchLocation = async (query) => {
  try {
    const response = await fetch(
      `https://geocoding-api.open-meteo.com/v1/search?` +
      `name=${encodeURIComponent(query)}&` +
      `count=10&` +
      `language=id&` +
      `format=json`
    )

    const data = await response.json()
    if (!data.results) return []

    // Dapatkan timezone untuk setiap lokasi
    const results = await Promise.all(data.results.map(async (city) => {
      const weatherResponse = await fetch(
        `${BASE_URL}/forecast?` +
        `latitude=${city.latitude}&` +
        `longitude=${city.longitude}&` +
        `current=temperature_2m&` +
        `timezone=auto`
      )
      const weatherData = await weatherResponse.json()

      return {
        ...city,
        timezone: weatherData.timezone,
        timezone_abbreviation: weatherData.timezone_abbreviation,
        utc_offset_seconds: weatherData.utc_offset_seconds
      }
    }))

    return results
  } catch (error) {
    console.error('Error searching location:', error)
    return []
  }
}

function getTimezoneOffset(timezone) {
  try {
    const date = new Date()
    const options = { timeZoneName: 'short', timeZone: timezone }
    return new Intl.DateTimeFormat('en-US', options)
      .formatToParts(date)
      .find(part => part.type === 'timeZoneName')?.value || timezone
  } catch (error) {
    console.error(`Error getting timezone offset for ${timezone}:`, error)
    return timezone
  }
}

export const getAirQuality = (aqi) => {
  const levels = {
    1: { label: 'Sangat Baik', color: 'green', icon: '😊' },
    2: { label: 'Baik', color: 'lightgreen', icon: '🙂' },
    3: { label: 'Sedang', color: 'yellow', icon: '😐' },
    4: { label: 'Buruk', color: 'orange', icon: '😷' },
    5: { label: 'Sangat Buruk', color: 'red', icon: '🤢' }
  }
  return levels[aqi] || { label: 'Tidak Diketahui', color: 'gray', icon: '❓' }
}

export const formatSunTime = (timeString) => {
  return new Date(timeString).toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  })
}

export const getMoonPhase = (phase) => {
  const phases = {
    0: '🌑 Bulan Baru',
    0.25: '🌓 Bulan Sabit Awal',
    0.5: '🌕 Bulan Purnama',
    0.75: '🌗 Bulan Sabit Akhir'
  }
  return phases[Math.round(phase * 4) / 4] || '🌔'
}
