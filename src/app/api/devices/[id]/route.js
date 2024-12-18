import { NextResponse } from 'next/server'
import pool from '@/lib/db'

export async function PUT(request, { params }) {
    try {
        const data = await request.json()
        await pool.query(
            'UPDATE devices SET name=?, type=?, relay_number=?, topic=?, status=? WHERE id=?',
            [data.name, data.type, data.relay_number, data.topic, data.status, params.id]
        )
        return NextResponse.json(data)
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}

export async function DELETE(request, { params }) {
    try {
        await pool.query('DELETE FROM devices WHERE id = ?', [params.id])
        return NextResponse.json({ message: 'Device deleted successfully' })
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
} 