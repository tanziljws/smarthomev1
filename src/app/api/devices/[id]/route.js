import { NextResponse } from 'next/server'
import pool from '@/lib/db'

export async function GET(request, { params }) {
  try {
    const { id } = params
    const [rows] = await pool.query(
      'SELECT * FROM devices WHERE id = ? OR device_id = ?',
      [id, id]
    )
    
    if (rows.length === 0) {
      return NextResponse.json(
        { error: 'Device not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(rows[0])
  } catch (error) {
    console.error('Error fetching device:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = params
    await pool.query(
      'DELETE FROM devices WHERE id = ? OR device_id = ?',
      [id, id]
    )
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting device:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}

export async function PUT(request, { params }) {
  try {
    const { id } = params
    const body = await request.json()
    
    const [result] = await pool.query(
      `UPDATE devices 
       SET device_id = ?,
           name = ?,
           type = ?,
           relay_number = ?,
           topic = ?,
           location = ?
       WHERE id = ?`,
      [
        body.device_id,
        body.name,
        body.type || 'relay',
        body.relay_number || '4',
        `smarthome/${body.device_id}`,
        body.location || null,
        id
      ]
    )

    const [updated] = await pool.query(
      'SELECT * FROM devices WHERE id = ?',
      [id]
    )

    return NextResponse.json(updated[0])
  } catch (error) {
    console.error('Error updating device:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
} 