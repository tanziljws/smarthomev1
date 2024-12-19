export async function GET(request, { params }) {
  const { id } = params
  const { period = '24h' } = request.query

  const [rows] = await pool.query(
    `SELECT 
       DATE_FORMAT(created_at, '%Y-%m-%d %H:00:00') as hour,
       COUNT(*) as events,
       SUM(JSON_EXTRACT(event_data, '$.power')) as total_power
     FROM device_history
     WHERE device_id = ?
       AND created_at >= DATE_SUB(NOW(), INTERVAL ? HOUR)
     GROUP BY hour
     ORDER BY hour DESC`,
    [id, period === '24h' ? 24 : 168]
  )

  return NextResponse.json(rows)
} 