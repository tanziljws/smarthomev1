import { NextResponse } from 'next/server'
import pool from '@/lib/db'

export async function POST(request) {
  try {
    const { whatsapp } = await request.json()
    const otp = Math.floor(100000 + Math.random() * 900000).toString()
    
    // Save OTP to database with 5 minutes expiry
    await pool.query(
      `INSERT INTO users (whatsapp, otp, otp_expires) 
       VALUES (?, ?, DATE_ADD(NOW(), INTERVAL 5 MINUTE))
       ON DUPLICATE KEY UPDATE 
       otp = VALUES(otp), 
       otp_expires = VALUES(otp_expires)`,
      [whatsapp, otp]
    )

    // Kirim OTP via WhatsApp menggunakan API WhatsApp Business
    const message = `Your OTP for Smart Home login is: ${otp}`
    await fetch('https://graph.facebook.com/v17.0/YOUR_PHONE_NUMBER_ID/messages', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.WHATSAPP_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to: whatsapp,
        type: "text",
        text: { body: message }
      })
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Send OTP error:', error)
    return NextResponse.json(
      { error: 'Failed to send OTP' },
      { status: 500 }
    )
  }
} 