// Utility functions untuk automation
export const DAYS = [
  { id: 'sun', label: 'Sun' },
  { id: 'mon', label: 'Mon' },
  { id: 'tue', label: 'Tue' },
  { id: 'wed', label: 'Wed' },
  { id: 'thu', label: 'Thu' },
  { id: 'fri', label: 'Fri' },
  { id: 'sat', label: 'Sat' }
]

export const SCENES = {
  morning: {
    name: 'Good Morning',
    icon: '🌅',
    actions: [
      { device: 'curtain', action: 'open' },
      { device: 'light', action: 'on', brightness: 70 },
      { device: 'ac', action: 'on', temp: 25 }
    ]
  },
  night: {
    name: 'Good Night',
    icon: '🌙',
    actions: [
      { device: 'curtain', action: 'close' },
      { device: 'light', action: 'off' },
      { device: 'ac', action: 'on', temp: 23 }
    ]
  },
  movie: {
    name: 'Movie Time',
    icon: '🎬',
    actions: [
      { device: 'curtain', action: 'close' },
      { device: 'light', action: 'dim', brightness: 20 },
      { device: 'ac', action: 'on', temp: 24 }
    ]
  },
  party: {
    name: 'Party Mode',
    icon: '🎉',
    actions: [
      { device: 'light', action: 'color', color: 'rainbow' },
      { device: 'ac', action: 'on', temp: 22 }
    ]
  }
} 