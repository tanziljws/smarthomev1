const BASE_URL = 'https://api.open-meteo.com/v1'

export const getWeather = async (latitude = -6.2088, longitude = 106.8456) => { // Default Jakarta
  try {
    const response = await fetch(`${BASE_URL}/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset,uv_index_max,precipitation_probability_max&timezone=auto`)
    const data = await response.json()
    return data
  } catch (error) {
    console.error('Error fetching weather:', error)
    return null
  }
}

// Weather code mapping
export const getWeatherDescription = (code) => {
  const weatherCodes = {
    0: 'Clear sky',
    1: 'Mainly clear',
    2: 'Partly cloudy',
    3: 'Overcast',
    45: 'Foggy',
    48: 'Depositing rime fog',
    51: 'Light drizzle',
    53: 'Moderate drizzle',
    55: 'Dense drizzle',
    61: 'Slight rain',
    63: 'Moderate rain',
    65: 'Heavy rain',
    71: 'Slight snow fall',
    73: 'Moderate snow fall',
    75: 'Heavy snow fall',
    95: 'Thunderstorm',
  }
  return weatherCodes[code] || 'Unknown'
}

// Weather icon mapping
export const getWeatherIcon = (code) => {
  if (code === 0) return '☀️'
  if (code === 1) return '🌤️'
  if (code === 2) return '⛅'
  if (code === 3) return '☁️'
  if (code <= 48) return '🌫️'
  if (code <= 55) return '🌧️'
  if (code <= 65) return '🌧️'
  if (code <= 75) return '🌨️'
  if (code === 95) return '⛈️'
  return '❓'
}

// Tambahkan fungsi untuk geocoding (mencari koordinat dari nama kota)
export const searchLocation = async (query) => {
  try {
    const response = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${query}&count=5&language=en&format=json`)
    const data = await response.json()
    return data.results || []
  } catch (error) {
    console.error('Error searching location:', error)
    return []
  }
} 