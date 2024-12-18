export const DEVICE_TYPES = {
  light: {
    icon: '💡',
    name: 'Light',
    features: ['power', 'brightness', 'color'],
    settings: {
      brightness: { min: 0, max: 100, step: 1, unit: '%' },
      color: ['warm', 'cool', 'daylight', 'rgb']
    }
  },
  ac: {
    icon: '❄️',
    name: 'AC',
    features: ['power', 'temperature', 'mode', 'fan'],
    settings: {
      temperature: { min: 16, max: 30, step: 1, unit: '°C' },
      mode: ['auto', 'cool', 'dry', 'fan'],
      fan: ['auto', 'low', 'medium', 'high']
    }
  },
  fan: {
    icon: '🌪️',
    name: 'Fan',
    features: ['power', 'speed', 'oscillate'],
    settings: {
      speed: { min: 1, max: 5, step: 1 },
      oscillate: ['on', 'off']
    }
  },
  curtain: {
    icon: '🪟',
    name: 'Curtain',
    features: ['position', 'schedule'],
    settings: {
      position: { min: 0, max: 100, step: 1, unit: '%' }
    }
  },
  tv: {
    icon: '📺',
    name: 'TV',
    features: ['power', 'source', 'volume'],
    settings: {
      volume: { min: 0, max: 100, step: 1, unit: '%' },
      source: ['hdmi1', 'hdmi2', 'usb', 'tv']
    }
  }
}

export const ROOM_TYPES = [
  { id: 'living', name: 'Living Room', icon: '🛋️' },
  { id: 'bedroom', name: 'Bedroom', icon: '🛏️' },
  { id: 'kitchen', name: 'Kitchen', icon: '🍳' },
  { id: 'bathroom', name: 'Bathroom', icon: '🚿' },
  { id: 'office', name: 'Office', icon: '💼' },
  { id: 'garage', name: 'Garage', icon: '🚗' }
] 