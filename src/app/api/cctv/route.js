import { NextResponse } from 'next/server'
import pool from '@/lib/db'

export async function GET() {
    try {
        const [rows] = await pool.query('SELECT * FROM cctvs')
        return NextResponse.json(rows)
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}

export async function POST(request) {
    try {
        const data = await request.json()
        const [result] = await pool.query(
            'INSERT INTO cctvs (name, stream_url) VALUES (?, ?)',
            [data.name, data.stream_url]
        )
        return NextResponse.json({ id: result.insertId, ...data })
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
} 