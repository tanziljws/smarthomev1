import { NextResponse } from 'next/server'
import pool from '@/lib/db'

export async function GET() {
    try {
        const [rows] = await pool.query('SELECT * FROM devices ORDER BY created_at DESC')
        return NextResponse.json(rows)
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}

export async function POST(request) {
    try {
        const data = await request.json()
        const [result] = await pool.query(
            'INSERT INTO devices (name, type, relay_number, topic, status) VALUES (?, ?, ?, ?, ?)',
            [data.name, data.type, data.relay_number, data.topic, false]
        )
        return NextResponse.json({ id: result.insertId, ...data })
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
} 