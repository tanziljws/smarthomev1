export async function POST(request, { params }) {
  try {
    const { id } = params
    const body = await request.json()

    // Update firmware version di database
    await pool.query(
      `UPDATE devices 
       SET firmware_version = ?,
           last_update = NOW()
       WHERE device_id = ?`,
      [body.version, id]
    )

    // Kirim perintah update ke device via MQTT
    // Implementasi MQTT client di sini

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error updating firmware:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
} 