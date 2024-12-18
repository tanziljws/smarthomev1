import { NextResponse } from 'next/server'
import { exec } from 'child_process'
import path from 'path'
import { promises as fs } from 'fs'

// Fungsi untuk memutar audio
function playAudio(audioPath) {
    return new Promise((resolve, reject) => {
        exec(`play "${audioPath}"`, (error, stdout, stderr) => {
            if (error) {
                console.error(`Error playing audio: ${error}`)
                reject(error)
                return
            }
            resolve(stdout)
        })
    })
}

export async function POST(request) {
    try {
        const data = await request.json()
        const { songName } = data
        
        // Pastikan path ke folder audio benar
        const audioPath = path.join(process.cwd(), 'public', 'audio', songName)
        
        // Cek apakah file exists
        try {
            await fs.access(audioPath)
        } catch (error) {
            return NextResponse.json(
                { error: 'Audio file not found' },
                { status: 404 }
            )
        }

        await playAudio(audioPath)
        return NextResponse.json({ success: true, message: 'Playing audio' })
    } catch (error) {
        console.error('Error playing audio:', error)
        return NextResponse.json(
            { error: 'Failed to play audio' },
            { status: 500 }
        )
    }
} 