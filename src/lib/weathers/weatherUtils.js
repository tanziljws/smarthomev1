// Utility functions untuk weather analysis
export const calculateUVIndex = (weather) => {
    // Check if UV data exists
    if (!weather?.daily?.uv_index_max?.[0]) {
      return { level: 'Unknown', color: 'text-gray-500' };
    }

    const uvIndex = weather.daily.uv_index_max[0];
    if (uvIndex >= 8) return { level: 'Very High', color: 'text-red-500' };
    if (uvIndex >= 6) return { level: 'High', color: 'text-orange-500' };
    if (uvIndex >= 3) return { level: 'Moderate', color: 'text-yellow-500' };
    return { level: 'Low', color: 'text-green-500' };
  };

  export const getTimeOfDay = () => {
    const hour = new Date().getHours()
    if (hour >= 5 && hour < 10) return 'morning'
    if (hour >= 10 && hour < 15) return 'noon'
    if (hour >= 15 && hour < 18) return 'afternoon'
    if (hour >= 18 && hour < 22) return 'evening'
    return 'night'
  }

  export const getActivityRecommendations = (temperature, humidity, uvIndex) => {
    const timeOfDay = getTimeOfDay()
    const recommendations = []

    // Rekomendasi berdasarkan waktu
    switch (timeOfDay) {
      case 'morning':
        if (temperature < 28 && uvIndex < 5) {
          recommendations.push({
            type: 'exercise',
            priority: 'high',
            message: 'Waktu ideal untuk olahraga pagi atau jogging',
            icon: '🏃‍♂️',
            time: '05:00 - 07:00',
            intensity: temperature < 25 ? 'moderate' : 'light'
          })
        }
        recommendations.push({
          type: 'breakfast',
          priority: 'high',
          message: 'Sarapan di luar bisa menjadi pilihan yang baik',
          icon: '☕',
          time: '07:00 - 09:00',
          location: temperature < 30 ? 'outdoor' : 'indoor'
        })
        break

      case 'noon':
        if (uvIndex > 7) {
          recommendations.push({
            type: 'warning',
            priority: 'high',
            message: 'UV sangat tinggi, hindari aktivitas luar ruangan',
            icon: '⚠️',
            time: '10:00 - 15:00',
            alternativeActivity: 'Indoor activities recommended'
          })
        }
        recommendations.push({
          type: 'lunch',
          priority: 'medium',
          message: temperature > 30 ?
            'Makan siang di dalam ruangan ber-AC' :
            'Makan siang di luar bisa menjadi pilihan',
          icon: '🍱',
          time: '12:00 - 13:00',
          location: temperature > 30 ? 'indoor' : 'flexible'
        })
        break

      case 'afternoon':
        if (temperature > 30) {
          recommendations.push({
            type: 'hydration',
            priority: 'high',
            message: 'Jaga hidrasi, minum air putih secara teratur',
            icon: '💧',
            time: '13:00 - 16:00',
            amount: '250ml setiap jam'
          })
        }
        if (uvIndex < 5 && temperature < 30) {
          recommendations.push({
            type: 'outdoor',
            priority: 'medium',
            message: 'Cuaca baik untuk aktivitas ringan di luar',
            icon: '🌳',
            time: '15:00 - 17:00',
            suggestedActivities: ['walking', 'gardening', 'outdoor meetings']
          })
        }
        break

      case 'evening':
        const outdoorConditions = temperature >= 20 && temperature <= 28 && humidity < 70
        recommendations.push({
          type: 'exercise',
          priority: outdoorConditions ? 'high' : 'medium',
          message: outdoorConditions ?
            'Kondisi ideal untuk olahraga sore' :
            'Pertimbangkan olahraga di dalam ruangan',
          icon: '🏋️‍♂️',
          time: '17:00 - 19:00',
          location: outdoorConditions ? 'outdoor' : 'indoor',
          intensity: 'moderate to high'
        })
        recommendations.push({
          type: 'dinner',
          priority: 'medium',
          message: temperature > 28 ?
            'Makan malam di tempat ber-AC' :
            'Makan malam di luar bisa menjadi pilihan yang nyaman',
          icon: '🍽️',
          time: '19:00 - 21:00',
          location: temperature > 28 ? 'indoor' : 'flexible'
        })
        break

      case 'night':
        if (temperature > 25) {
          recommendations.push({
            type: 'sleep',
            priority: 'high',
            message: 'Gunakan AC atau kipas untuk kenyamanan tidur',
            icon: '😴',
            time: '22:00 - 05:00',
            settings: {
              ac_temp: 24,
              fan_speed: 'medium'
            }
          })
        }
        recommendations.push({
          type: 'indoor',
          priority: 'low',
          message: 'Waktu yang baik untuk aktivitas dalam ruangan',
          icon: '🏠',
          time: '20:00 - 22:00',
          suggestedActivities: ['reading', 'light stretching', 'meditation']
        })
        break
    }

    // Rekomendasi khusus cuaca
    if (humidity > 70) {
      recommendations.push({
        type: 'humidity',
        priority: 'high',
        message: 'Kelembaban tinggi, gunakan dehumidifier',
        icon: '💨',
        idealSettings: {
          humidity: '45-55%',
          air_circulation: 'good'
        }
      })
    }

    // Rekomendasi kesehatan
    if (temperature > 35) {
      recommendations.push({
        type: 'health',
        priority: 'critical',
        message: 'Suhu ekstrem, hindari aktivitas berat',
        icon: '🌡️',
        precautions: [
          'Stay hydrated',
          'Wear light clothing',
          'Use sun protection'
        ]
      })
    }

    // Sort berdasarkan priority
    const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 }
    recommendations.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority])

    return recommendations
  }

  export const getHealthImpact = (weather) => {
    if (!weather?.current) return [];

    const temp = weather.current.temperature_2m;
    const humidity = weather.current.relative_humidity_2m;

    const impacts = [];

    // Temperature impacts
    if (temp > 35) {
      impacts.push({
        condition: 'Heat stress',
        advice: 'Stay hydrated and avoid prolonged sun exposure',
        severity: 'high'
      });
    } else if (temp > 30) {
      impacts.push({
        condition: 'Warm conditions',
        advice: 'Stay hydrated and seek shade when needed',
        severity: 'moderate'
      });
    }

    // Humidity impacts
    if (humidity > 80) {
      impacts.push({
        condition: 'High humidity',
        advice: 'May affect respiratory conditions',
        severity: 'moderate'
      });
    } else if (humidity < 30) {
      impacts.push({
        condition: 'Low humidity',
        advice: 'Keep skin moisturized and stay hydrated',
        severity: 'moderate'
      });
    }

    // Add UV warning if available
    if (weather.daily?.uv_index_max?.[0] >= 8) {
      impacts.push({
        condition: 'High UV',
        advice: 'Use sunscreen and protective clothing',
        severity: 'high'
      });
    }

    return impacts;
  };

  export const getAirQualityRecommendations = (aqi) => {
    const recommendations = {
      activities: [],
      precautions: [],
      healthAdvice: ''
    }

    if (aqi <= 50) {
      recommendations.activities = ['Ideal untuk semua aktivitas luar ruangan']
      recommendations.healthAdvice = 'Kualitas udara baik'
    } else if (aqi <= 100) {
      recommendations.activities = ['Batasi aktivitas berat di luar ruangan']
      recommendations.precautions = ['Gunakan masker jika sensitif']
      recommendations.healthAdvice = 'Kualitas udara cukup baik'
    } else {
      recommendations.activities = ['Hindari aktivitas luar ruangan']
      recommendations.precautions = ['Gunakan masker', 'Tutup jendela']
      recommendations.healthAdvice = 'Kualitas udara buruk'
    }

    return recommendations
  }
