'use client'
import { getActivityRecommendations, getTimeOfDay } from '@/lib/weathers/weatherUtils'

export default function ActivityRecommendations({ temperature, humidity, uvIndex }) {
  const recommendations = getActivityRecommendations(temperature, humidity, uvIndex)
  const timeOfDay = getTimeOfDay()

  const timeLabels = {
    morning: 'Pagi',
    noon: 'Siang',
    afternoon: 'Sore',
    evening: 'Petang',
    night: 'Malam'
  }

  const priorityColors = {
    critical: 'bg-red-100 border-red-500 text-red-700',
    high: 'bg-orange-100 border-orange-500 text-orange-700',
    medium: 'bg-yellow-100 border-yellow-500 text-yellow-700',
    low: 'bg-blue-100 border-blue-500 text-blue-700'
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold">
          Rekomendasi Aktivitas - {timeLabels[timeOfDay]}
        </h3>
        <span className="text-sm text-gray-500">
          {new Date().toLocaleTimeString('id-ID', {
            hour: '2-digit',
            minute: '2-digit'
          })}
        </span>
      </div>

      <div className="grid gap-4">
        {recommendations.map((rec, index) => (
          <div
            key={index}
            className={`p-4 rounded-lg border-l-4 ${priorityColors[rec.priority]}`}
          >
            <div className="flex items-start gap-3">
              <span className="text-2xl">{rec.icon}</span>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold">{rec.type}</h4>
                  {rec.time && (
                    <span className="text-sm bg-gray-100 px-2 py-1 rounded">
                      {rec.time}
                    </span>
                  )}
                </div>
                <p className="text-gray-700 mt-1">{rec.message}</p>

                {/* Additional Details */}
                {rec.intensity && (
                  <div className="mt-2 text-sm">
                    <span className="font-medium">Intensitas:</span> {rec.intensity}
                  </div>
                )}

                {rec.location && (
                  <div className="mt-2 text-sm">
                    <span className="font-medium">Lokasi:</span> {rec.location}
                  </div>
                )}

                {rec.suggestedActivities && (
                  <div className="mt-2">
                    <span className="text-sm font-medium">Aktivitas yang disarankan:</span>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {rec.suggestedActivities.map((activity, i) => (
                        <span
                          key={i}
                          className="text-sm bg-white px-2 py-1 rounded-full border"
                        >
                          {activity}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {rec.settings && (
                  <div className="mt-2 space-y-1 text-sm">
                    <span className="font-medium">Pengaturan yang disarankan:</span>
                    {Object.entries(rec.settings).map(([key, value]) => (
                      <div key={key} className="flex items-center gap-2">
                        <span className="capitalize">{key.replace('_', ' ')}:</span>
                        <span>{value}</span>
                      </div>
                    ))}
                  </div>
                )}

                {rec.precautions && (
                  <div className="mt-2">
                    <span className="text-sm font-medium">Tindakan pencegahan:</span>
                    <ul className="list-disc list-inside text-sm mt-1">
                      {rec.precautions.map((precaution, i) => (
                        <li key={i}>{precaution}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
