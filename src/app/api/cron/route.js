import { NextResponse } from 'next/server'
import pool from '@/lib/db'
import mqtt from 'mqtt'

async function executeDeviceAction(deviceId, action) {
  console.log('Executing action:', { deviceId, action });

  const client = mqtt.connect('mqtt://192.168.2.84:1883', {
    username: 'root',
    password: 'adminse10',
  })

  return new Promise((resolve, reject) => {
    client.on('connect', () => {
      const topic = `smarthome/${deviceId}/control`
      const payload = JSON.stringify({
        relay: action.relay - 1,
        state: action.state
      })

      console.log('Publishing MQTT:', { topic, payload });

      client.publish(topic, payload, { qos: 1 }, (err) => {
        client.end()
        if (err) {
          console.error('MQTT publish error:', err);
          reject(err)
        } else {
          console.log('MQTT published successfully');
          resolve()
        }
      })
    })

    client.on('error', (err) => {
      console.error('MQTT connection error:', err);
      client.end()
      reject(err)
    })
  })
}

export async function GET() {
  const now = new Date()
  const currentTime = now.toTimeString().slice(0, 5) // Format: HH:mm
  const currentDay = now.getDay() || 7 // Convert 0 (Sunday) to 7

  console.log('=== CRON JOB START ===');
  console.log('Current time:', currentTime);
  console.log('Current day:', currentDay);

  try {
    // Get schedules for current time
    const [schedules] = await pool.query(`
      SELECT s.*,
             sa.device_id,
             d.device_id as device_identifier,
             sa.action
      FROM schedules s
      JOIN schedule_actions sa ON s.id = sa.schedule_id
      JOIN devices d ON sa.device_id = d.id
      WHERE s.time = ?
    `, [currentTime])

    console.log('Found schedules:', JSON.stringify(schedules, null, 2));

    if (schedules.length === 0) {
      console.log('No schedules found for current time');
      return NextResponse.json({
        success: true,
        message: 'No schedules for current time'
      });
    }

    for (const schedule of schedules) {
      console.log('\nProcessing schedule:', schedule.name);

      const scheduleDays = schedule.days.split(',').map(Number)
      console.log('Schedule days:', scheduleDays);
      console.log('Should run today?', scheduleDays.includes(currentDay));

      if (scheduleDays.includes(currentDay)) {
        try {
          const action = JSON.parse(schedule.action)
          console.log('Parsed action:', action);

          await executeDeviceAction(schedule.device_identifier, action)
          console.log('Action executed successfully');
        } catch (error) {
          console.error('Error executing schedule:', schedule.name, error);
        }
      }
    }

    console.log('=== CRON JOB END ===\n');

    return NextResponse.json({
      success: true,
      message: `Processed ${schedules.length} schedules`,
      time: currentTime,
      day: currentDay
    })
  } catch (error) {
    console.error('Cron job error:', error);
    return NextResponse.json({
      error: error.message,
      time: currentTime,
      day: currentDay
    }, { status: 500 })
  }
}
