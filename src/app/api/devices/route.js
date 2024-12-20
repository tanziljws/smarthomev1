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
    console.log('Received request body:', body)

    // Validasi input
    if (!body.device_id) {
      return NextResponse.json(
        { error: 'Device ID is required' },
        { status: 400 }
      )
    }

    // Cek apakah device sudah ada
    const [existing] = await pool.query(
      'SELECT * FROM devices WHERE device_id = ?',
      [body.device_id]
    )

    if (existing.length > 0) {
      return NextResponse.json(
        { error: 'Device already exists' },
        { status: 409 }
      )
    }

    // Insert device baru
    const [result] = await pool.query(
      `INSERT INTO devices (
        name,
        device_id,
        type,
        relay_number,
        topic,
        status,
        is_online
      ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        body.name || 'New Device',
        body.device_id,
        body.type || 'relay',
        body.relay_number || '4',
        `smarthome/${body.device_id}`,
        JSON.stringify({
          relays: Array(parseInt(body.relay_number || 4)).fill(false)
        }),
        false
      ]
    )

    // Ambil device yang baru dibuat
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
        error: 'Failed to create device',
        details: error.message
      },
      { status: 500 }
    )
  }
}
