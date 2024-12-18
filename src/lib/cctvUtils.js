export const CCTV_FEATURES = {
  motion_detection: {
    icon: '🏃',
    name: 'Motion Detection',
    settings: {
      sensitivity: { min: 1, max: 10, default: 5 },
      zones: ['full', 'custom'],
      notification: ['none', 'push', 'email', 'all']
    }
  },
  recording: {
    icon: '📹',
    name: 'Recording',
    settings: {
      quality: ['low', 'medium', 'high', '4k'],
      mode: ['continuous', 'motion', 'scheduled'],
      retention: [1, 7, 14, 30] // days
    }
  },
  audio: {
    icon: '🔊',
    name: 'Two-way Audio',
    settings: {
      volume: { min: 0, max: 100, default: 70 },
      noise_reduction: ['off', 'low', 'medium', 'high']
    }
  }
}

export const CCTV_PRESETS = {
  home: [
    { x: 0, y: 0, zoom: 1, name: 'Overview' },
    { x: 30, y: 0, zoom: 2, name: 'Door' },
    { x: -30, y: 0, zoom: 2, name: 'Window' }
  ],
  garage: [
    { x: 0, y: 0, zoom: 1, name: 'Full View' },
    { x: 45, y: 0, zoom: 3, name: 'Car' }
  ]
} 