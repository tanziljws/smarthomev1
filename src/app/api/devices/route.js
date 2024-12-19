import { NextResponse } from 'next/server'
import pool from '@/lib/db'

export async function GET() {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM devices ORDER BY created_at DESC'
    )
    return NextResponse.json(rows)
  } catch (error) {
    console.error('Error fetching devices:', error)
    return NextResponse.json(
      { error: 'Internal Server Error', details: error.message },
      { status: 500 }
    )
  }
}

export async function POST(request) {
  try {
    const body = await request.json()
    console.log('Received body:', body)

    // Validasi input
    if (!body.name) {
      return NextResponse.json(
        { error: 'Device name is required' },
        { status: 400 }
      )
    }

    // Generate device_id jika tidak ada
    const deviceId = body.device_id || `ESP_${Math.random().toString(36).substr(2, 6)}`

    const [result] = await pool.query(
      `INSERT INTO devices (
        name,
        device_id,
        type,
        relay_number,
        topic,
        location,
        settings,
        features,
        is_online,
        status,
        last_seen,
        firmware_version
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), ?)`,
      [
        body.name,
        deviceId,
        body.type || 'relay',
        body.relay_number || '4',
        `smarthome/${deviceId}`,
        body.location || null,
        JSON.stringify(body.settings || {}),
        JSON.stringify(body.features || []),
        false,
        JSON.stringify({
          relays: Array(parseInt(body.relay_number || 4)).fill(false),
          power: 0,
          voltage: 0,
          current: 0,
          temperature: 0
        }),
        body.firmware_version || '1.0.0'
      ]
    )

    // Ambil data device yang baru dibuat
    const [newDevice] = await pool.query(
      'SELECT * FROM devices WHERE id = ?',
      [result.insertId]
    )

    console.log('Created device:', newDevice[0])
    return NextResponse.json(newDevice[0])

  } catch (error) {
    console.error('Error creating device:', error)
    return NextResponse.json(
      { 
        error: 'Internal Server Error', 
        details: error.message,
        sql: error.sql
      },
      { status: 500 }
    )
  }
} 