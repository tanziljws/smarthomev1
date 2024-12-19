import mqtt from 'mqtt'
import { create } from 'zustand'

// Store untuk state MQTT
export const useMqttStore = create((set) => ({
  messages: [],
  sensorData: {
    temperature: 0,
    humidity: 0
  },
  addMessage: (message) => set((state) => ({
    messages: [...state.messages.slice(-49), message]
  })),
  setSensorData: (data) => set({ sensorData: data })
}))

class MqttService {
  constructor() {
    this.client = null
    this.MQTT_TOPICS = [
      'smarthome/discovery',
      'smarthome/+/status',  // + adalah wildcard untuk device ID
      'smarthome/+/control'
    ]
  }

  connect() {
    if (this.client) return

    const wsUrl = `ws://192.168.2.84:9001`  // Sesuaikan dengan MQTT broker Anda
    this.client = mqtt.connect(wsUrl, {
      username: 'root',
      password: 'adminse10',
      clientId: `web_${Math.random().toString(16).substr(2, 8)}`,
      clean: true,
      reconnectPeriod: 5000,
      connectTimeout: 30 * 1000
    })

    this.client.on('connect', () => {
      console.log('Connected to MQTT broker')
      this.client.subscribe(this.MQTT_TOPICS)
    })

    this.client.on('message', this.handleMessage)

    this.client.on('error', (err) => {
      console.error('MQTT connection error:', err)
    })
  }

  handleMessage = (topic, message) => {
    const payload = message.toString()
    
    if (topic === 'smarthome/discovery') {
      try {
        const device = JSON.parse(payload)
        this.handleDeviceDiscovery(device)
      } catch (error) {
        console.error('Error parsing discovery message:', error)
      }
    }

    // Update store dengan pesan baru
    useMqttStore.getState().addMessage({ 
      topic, 
      message: payload,
      timestamp: new Date().toLocaleTimeString()
    })
  }

  async handleDeviceDiscovery(device) {
    try {
      const res = await fetch('/api/devices', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...device,
          status: {
            online: true,
            lastSeen: new Date()
          }
        })
      })

      if (!res.ok) {
        throw new Error('Failed to save device')
      }

      console.log('New device saved:', device)
      
    } catch (error) {
      console.error('Error saving discovered device:', error)
    }
  }

  publishMessage(topic, message) {
    if (!this.client?.connected) {
      console.error('MQTT client not connected')
      return
    }

    this.client.publish(topic, JSON.stringify(message))
  }

  disconnect() {
    if (this.client) {
      this.client.end()
      this.client = null
    }
  }
}

// Export singleton instance
const mqttService = new MqttService()
export default mqttService 