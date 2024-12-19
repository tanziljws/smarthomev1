import { NextResponse } from 'next/server'
import pool from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const [rows] = await pool.query(
      'SELECT display_name, phone, address, notifications, theme FROM users WHERE email = ?',
      [session.user.email]
    )

    return NextResponse.json(rows[0] || {})
  } catch (error) {
    console.error('Profile fetch error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const data = await request.json()
    
    await pool.query(
      `UPDATE users SET 
       display_name = ?,
       phone = ?,
       address = ?,
       notifications = ?,
       theme = ?
       WHERE email = ?`,
      [
        data.displayName,
        data.phone,
        data.address,
        JSON.stringify(data.notifications),
        data.theme,
        session.user.email
      ]
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Profile update error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
} 