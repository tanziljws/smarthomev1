export default class VoiceStreamer {
    constructor(serverUrl) {
        this.serverUrl = serverUrl
        this.isStreaming = false
        this.mediaStream = null
        this.websocket = null
        this.audioContext = null
        this.bufferSize = 512
        this.sendTimestamp = 0
        this.receiveTimestamp = 0
    }

    async startStreaming() {
        try {
            this.audioContext = new AudioContext({ 
                latencyHint: 'interactive', 
                sampleRate: 44100 
            })

            this.mediaStream = await navigator.mediaDevices.getUserMedia({
                audio: { 
                    sampleRate: 44100, 
                    latency: 0.01 
                }, 
                video: false 
            })

            const source = this.audioContext.createMediaStreamSource(this.mediaStream)
            const processor = this.audioContext.createScriptProcessor(this.bufferSize, 1, 1)

            source.connect(processor)
            processor.connect(this.audioContext.destination)

            this.websocket = new WebSocket(`ws:192.168.2.90:8081`)
            this.websocket.binaryType = 'arraybuffer'

            this.websocket.onopen = () => {
                console.log("WebSocket connected")
                this.isStreaming = true
            }

            this.websocket.onerror = (error) => {
                console.error('WebSocket error:', error)
                this.stopStreaming()
            }

            this.websocket.onclose = () => {
                console.log('WebSocket closed')
                this.stopStreaming()
            }

            processor.onaudioprocess = (e) => {
                if (this.websocket.readyState === WebSocket.OPEN) {
                    const inputData = e.inputBuffer.getChannelData(0)
                    const pcmData = Int16Array.from(inputData, val => val * 32767)
                    
                    this.sendTimestamp = performance.now()
                    this.websocket.send(pcmData.buffer)
                }
            }

            return true
        } catch (error) {
            console.error('Error starting voice stream:', error)
            this.stopStreaming()
            return false
        }
    }

    stopStreaming() {
        if (this.mediaStream) {
            this.mediaStream.getTracks().forEach(track => track.stop())
            this.mediaStream = null
        }

        if (this.websocket) {
            this.websocket.close()
            this.websocket = null
        }

        if (this.audioContext) {
            this.audioContext.close()
            this.audioContext = null
        }

        this.isStreaming = false
    }
} 