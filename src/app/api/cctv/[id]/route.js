import { NextResponse } from 'next/server'
import pool from '@/lib/db'

export async function PUT(request, { params }) {
    try {
        const data = await request.json()
        await pool.query(
            'UPDATE cctvs SET name=?, stream_url=? WHERE id=?',
            [data.name, data.stream_url, params.id]
        )
        return NextResponse.json(data)
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}

export async function DELETE(request, { params }) {
    try {
        await pool.query('DELETE FROM cctvs WHERE id = ?', [params.id])
        return NextResponse.json({ message: 'CCTV deleted successfully' })
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
} 