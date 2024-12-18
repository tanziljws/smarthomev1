import pool from '@/lib/db'
import { NextResponse } from 'next/server'

export async function GET() {
    try {
        const [rows] = await pool.query(`
            CREATE TABLE IF NOT EXISTS custom_commands (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(255) UNIQUE NOT NULL,
                description TEXT,
                actions JSON,
                createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )
        `)

        const [commands] = await pool.query('SELECT * FROM custom_commands ORDER BY createdAt DESC')
        return NextResponse.json(commands || [])
    } catch (error) {
        console.error('Database error:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}

export async function POST(request) {
    try {
        const data = await request.json()
        const [result] = await pool.query(
            'INSERT INTO custom_commands (name, description, actions) VALUES (?, ?, ?)',
            [data.name, data.description, JSON.stringify(data.actions)]
        )
        return NextResponse.json({ id: result.insertId, ...data })
    } catch (error) {
        console.error('Create error:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}

export async function DELETE(request) {
    try {
        const { id } = await request.json()
        await pool.query('DELETE FROM custom_commands WHERE id = ?', [id])
        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Delete error:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
} 