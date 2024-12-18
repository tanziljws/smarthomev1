import { WebSocketServer } from 'ws'
import Speaker from 'speaker'
import { NextResponse } from 'next/server'

// Inisialisasi WebSocket Server jika belum ada
if (!global.wss) {
    global.wss = new WebSocketServer({
        port: 8081,
        perMessageDeflate: false,
        clientTracking: false
    })

    global.speaker = new Speaker({
        channels: 1,
        bitDepth: 16,
        sampleRate: 48000,
        highWaterMark: 64,
        latencyHint: 'interactive',
        closeOnError: false
    })

    global.wss.on('connection', (ws) => {
        console.log('Client connected')

        ws._socket.setNoDelay(true)
        ws._socket.setKeepAlive(true, 1000)

        if (ws._socket.bufferSize !== undefined) {
            ws._socket.bufferSize = 64
        }

        ws.binaryType = 'arraybuffer'

        ws.on('message', (data) => {
            try {
                global.speaker.write(Buffer.from(data))
            } catch (err) {
                console.error('Speaker error:', err)
            }
        })

        ws.on('error', (error) => {
            console.error('WebSocket error:', error)
        })

        ws.on('close', () => {
            console.log('Client disconnected')
        })
    })

    global.speaker.on('error', (err) => {
        console.error('Speaker error:', err)
        global.speaker = new Speaker({
            channels: 1,
            bitDepth: 16,
            sampleRate: 48000,
            highWaterMark: 64,
            latencyHint: 'interactive'
        })
    })
}

export function GET() {
    return NextResponse.json({ status: 'WebSocket server running on port 8081' })
} 