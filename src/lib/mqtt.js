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
      'smarthome/control',
      'smarthome/dht',
      'smarthome/air_quality',
      'smarthome/status/#',
      'smarthome/clap_response'
    ]
  }

  connect() {
    if (this.client) return

    const wsUrl = `ws://192.168.2.84:9001`
    this.client = mqtt.connect(wsUrl, {
      username: 'root',
      password: 'adminse10',
      clientId: `mqttjs_${Math.random().toString(16).substr(2, 8)}`,
      clean: true,
      reconnectPeriod: 5000,
      connectTimeout: 30 * 1000
    })

    this.client.on('connect', () => {
      console.log('Terhubung ke MQTT broker')
      this.client.subscribe(this.MQTT_TOPICS)
    })

    this.client.on('message', this.handleMessage)

    this.client.on('error', (err) => {
      console.error('Kesalahan koneksi MQTT:', err)
    })

    this.client.on('reconnect', () => {
      console.log('Mencoba menghubungkan kembali...')
    })
  }

  handleMessage = (topic, message) => {
    const payload = message.toString()
    
    if (topic === 'smarthome/dht') {
      try {
        const data = JSON.parse(payload)
        useMqttStore.getState().setSensorData({
          temperature: data.temperature,
          humidity: data.humidity
        })
      } catch (error) {
        console.error('Error parsing DHT data:', error)
      }
    }

    useMqttStore.getState().addMessage({ 
      topic, 
      message: payload,
      timestamp: new Date().toLocaleTimeString()
    })
  }

  disconnect() {
    if (this.client) {
      this.client.end(true)
      this.client = null
    }
  }
}

// Export singleton instance
const mqttService = new MqttService()
export default mqttService 