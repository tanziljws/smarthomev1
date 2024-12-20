const GEMINI_API_KEY = 'AIzaSyA0aHNnCZ7ba41won9pOLpuTFTDCDL88fY'
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent'

export async function analyzeWeatherData(weather, location) {
  if (!weather || !weather.current) {
    return {
      healthImpacts: [],
      recommendedActivities: [],
      uvProtection: {
        level: 'Tidak tersedia',
        advice: 'Data cuaca tidak tersedia'
      },
      warnings: []
    }
  }

  const { temperature_2m, relative_humidity_2m, weather_code } = weather.current
  const uvIndex = weather.daily?.uv_index_max?.[0] || 0
  const hour = new Date().getHours()
  const isWeekend = [0, 6].includes(new Date().getDay()) // 0 = Minggu, 6 = Sabtu

  // Analisis dampak kesehatan berdasarkan suhu dan kelembaban
  const healthImpacts = []

  // Dampak Suhu
  if (temperature_2m < 10) {
    healthImpacts.push({
      condition: 'Cuaca Ekstrem - Dingin',
      advice: 'PERHATIAN: Suhu sangat rendah! Hindari aktivitas di luar ruangan. Gunakan pakaian berlapis dan tetap di dalam ruangan yang hangat.',
      severity: 'high',
      precautions: [
        'Gunakan minimal 3 lapis pakaian',
        'Tutup kepala, leher, dan tangan',
        'Hindari aktivitas luar ruangan',
        'Jaga suhu tubuh tetap hangat'
      ]
    })
  } else if (temperature_2m < 20) {
    healthImpacts.push({
      condition: 'Suhu Rendah',
      advice: 'Gunakan pakaian hangat dan jaga suhu tubuh.',
      severity: 'moderate'
    })
  } else if (temperature_2m > 35) {
    healthImpacts.push({
      condition: 'Suhu Tinggi',
      advice: 'Risiko dehidrasi dan heat stroke. Hindari aktivitas di luar ruangan, minum banyak air.',
      severity: 'high'
    })
  } else if (temperature_2m > 30) {
    healthImpacts.push({
      condition: 'Suhu Hangat',
      advice: 'Jaga hidrasi dan hindari aktivitas berat di luar ruangan.',
      severity: 'moderate'
    })
  } else {
    healthImpacts.push({
      condition: 'Suhu Nyaman',
      advice: 'Kondisi suhu ideal untuk beraktivitas.',
      severity: 'low'
    })
  }

  // Dampak Kelembaban
  if (relative_humidity_2m > 80) {
    healthImpacts.push({
      condition: 'Kelembaban Tinggi',
      advice: 'Risiko pertumbuhan jamur dan alergi. Gunakan dehumidifier jika di dalam ruangan.',
      severity: 'high'
    })
  } else if (relative_humidity_2m < 30) {
    healthImpacts.push({
      condition: 'Kelembaban Rendah',
      advice: 'Risiko iritasi kulit dan saluran pernapasan. Gunakan pelembab udara.',
      severity: 'moderate'
    })
  } else {
    healthImpacts.push({
      condition: 'Kelembaban Normal',
      advice: 'Kondisi kelembaban ideal untuk kesehatan.',
      severity: 'low'
    })
  }

  // Analisis UV
  const uvProtection = {
    level: uvIndex > 7 ? 'Tinggi' : uvIndex > 4 ? 'Sedang' : 'Rendah',
    advice: uvIndex > 7
      ? 'Sangat berbahaya bagi kulit. Hindari paparan sinar matahari langsung, gunakan sunscreen SPF 50+, pakaian pelindung, dan topi.'
      : uvIndex > 4
      ? 'Gunakan sunscreen SPF 30+, pakaian pelindung, dan hindari paparan matahari berlebihan.'
      : 'Tingkat UV relatif aman, tetap disarankan menggunakan sunscreen untuk aktivitas di luar ruangan.'
  }

  // Rekomendasi aktivitas berdasarkan kondisi cuaca, waktu, dan hari
  const recommendedActivities = []

  // Aktivitas Subuh/Dini Hari (03:00 - 05:00)
  if (hour >= 3 && hour < 5) {
    recommendedActivities.push({
      type: 'Aktivitas Subuh',
      time: '03:00 - 05:00',
      activities: ['Sholat Tahajud', 'Meditasi Pagi', 'Persiapan Sholat Subuh'],
      energyLevel: 'Sangat Rendah',
      note: 'Waktu spiritual dan refleksi diri',
      healthBenefits: ['Meningkatkan ketenangan pikiran', 'Memulai hari dengan positif']
    })
  }

  // Aktivitas Pagi Awal (05:00 - 07:00)
  if (hour >= 5 && hour < 7) {
    const morningActivity = {
      type: 'Aktivitas Pagi Awal',
      time: '05:00 - 07:00',
      energyLevel: 'Rendah ke Sedang',
      weatherCondition: weather_code <= 3 ? 'Cerah' : 'Kurang Mendukung',
      healthBenefits: [
        'Meningkatkan metabolisme',
        'Vitamin D dari sinar matahari pagi',
        'Memperbaiki ritme circadian'
      ]
    }

    if (weather_code <= 3 && temperature_2m >= 18 && temperature_2m <= 25) {
      morningActivity.activities = [
        { name: 'Jogging Ringan', intensity: 'Rendah', duration: '20-30 menit' },
        { name: 'Yoga Pagi', intensity: 'Rendah', duration: '15-20 menit' },
        { name: 'Jalan Kaki', intensity: 'Sangat Rendah', duration: '30-45 menit' }
      ]
      morningActivity.note = 'Kondisi ideal untuk aktivitas outdoor pagi'
      morningActivity.location = 'outdoor'
    } else {
      morningActivity.activities = [
        { name: 'Stretching', intensity: 'Rendah', duration: '10-15 menit' },
        { name: 'Yoga Indoor', intensity: 'Rendah', duration: '20-30 menit' },
        { name: 'Meditasi', intensity: 'Sangat Rendah', duration: '10-15 menit' }
      ]
      morningActivity.note = 'Lakukan aktivitas ringan di dalam ruangan'
      morningActivity.location = 'indoor'
    }
    recommendedActivities.push(morningActivity)
  }

  // Aktivitas Pagi (07:00 - 10:00)
  if (hour >= 7 && hour < 10) {
    const mainMorningActivity = {
      type: 'Aktivitas Pagi Utama',
      time: '07:00 - 10:00',
      energyLevel: 'Sedang ke Tinggi',
      weatherCondition: weather_code <= 3 ? 'Cerah' : 'Kurang Mendukung',
      healthBenefits: [
        'Produktivitas optimal',
        'Energi fisik dan mental tinggi',
        'Metabolisme aktif'
      ]
    }

    if (weather_code <= 3 && temperature_2m >= 20 && temperature_2m <= 28) {
      mainMorningActivity.activities = [
        {
          name: 'Olahraga Intensitas Sedang',
          options: ['Bersepeda', 'Jogging', 'Tenis'],
          duration: '45-60 menit',
          intensity: 'Sedang'
        },
        {
          name: 'Berkebun',
          duration: '30-45 menit',
          intensity: 'Rendah ke Sedang',
          benefits: ['Kontak dengan alam', 'Aktivitas produktif']
        },
        {
          name: 'Sarapan Outdoor',
          duration: '30 menit',
          intensity: 'Sangat Rendah',
          nutritionTips: ['Protein tinggi', 'Karbohidrat kompleks']
        }
      ]
      mainMorningActivity.location = 'outdoor'
      mainMorningActivity.equipment = ['Peralatan olahraga', 'Sunscreen SPF 30+', 'Air minum']
    } else {
      mainMorningActivity.activities = [
        {
          name: 'Gym Indoor',
          options: ['Kardio', 'Strength Training', 'Circuit Training'],
          duration: '45-60 menit',
          intensity: 'Sedang ke Tinggi'
        },
        {
          name: 'Sarapan Sehat',
          duration: '30 menit',
          intensity: 'Sangat Rendah',
          nutritionTips: ['Seimbangkan makronutrien', 'Hindari makanan berat']
        }
      ]
      mainMorningActivity.location = 'indoor'
      mainMorningActivity.equipment = ['Peralatan gym', 'Handuk', 'Air minum']
    }
    recommendedActivities.push(mainMorningActivity)
  }

  // Aktivitas Siang (10:00 - 15:00)
  if (hour >= 10 && hour < 15) {
    const noonActivity = {
      type: 'Aktivitas Siang',
      time: '10:00 - 15:00',
      energyLevel: temperature_2m > 30 ? 'Rendah ke Sedang' : 'Sedang',
      uvWarning: uvIndex > 7 ? 'Bahaya' : uvIndex > 5 ? 'Waspada' : 'Normal',
      healthConsiderations: [
        'Hindari dehidrasi',
        'Perhatikan paparan UV',
        'Jaga suhu tubuh'
      ]
    }

    if (temperature_2m > 30 || uvIndex > 7) {
      noonActivity.activities = [
        {
          name: 'Aktivitas Indoor',
          options: [
            {
              name: 'Bekerja/Belajar',
              setting: 'Ruangan ber-AC',
              ergonomicTips: ['Postur duduk tegak', 'Istirahat mata tiap 20 menit']
            },
            {
              name: 'Hobi Kreatif',
              options: ['Membaca', 'Menulis', 'Melukis', 'Memasak'],
              benefits: ['Pengembangan diri', 'Relaksasi mental']
            }
          ]
        }
      ]
      noonActivity.hydrationSchedule = {
        frequency: '30 menit sekali',
        amount: '200-250ml air',
        type: 'Air putih atau minuman elektrolit'
      }
    } else {
      noonActivity.activities = [
        {
          name: 'Aktivitas Terbatas Outdoor',
          options: [
            {
              name: 'Makan Siang di Luar',
              duration: '30-45 menit',
              precautions: ['Gunakan payung', 'Cari tempat teduh']
            },
            {
              name: 'Meeting Outdoor',
              duration: '30-60 menit',
              setting: 'Area teduh atau semi-outdoor'
            }
          ]
        }
      ]
    }
    recommendedActivities.push(noonActivity)
  }

  // Aktivitas Sore (15:00 - 18:00)
  if (hour >= 15 && hour < 18) {
    if (weather_code <= 3 && temperature_2m < 30 && relative_humidity_2m < 70) {
      recommendedActivities.push({
        type: 'Aktivitas Sore',
        time: '15:00 - 18:00',
        activities: ['Olahraga Tim', 'Berenang', 'Badminton', 'Tenis', 'Piknik Sore'],
        note: 'Cuaca ideal untuk aktivitas outdoor sore hari'
      })
    } else {
      recommendedActivities.push({
        type: 'Aktivitas Sore Indoor',
        time: '15:00 - 18:00',
        activities: ['Gym', 'Senam', 'Badminton Indoor', 'Berenang Indoor', 'Yoga'],
        note: 'Lakukan olahraga di dalam ruangan karena cuaca kurang mendukung'
      })
    }
  }

  // Aktivitas Malam (18:00 - 22:00)
  if (hour >= 18 && hour < 22) {
    if (temperature_2m >= 20 && temperature_2m <= 28 && weather_code <= 3) {
      recommendedActivities.push({
        type: 'Aktivitas Malam',
        time: '18:00 - 22:00',
        activities: ['Jalan Santai', 'Makan Malam Outdoor', 'Bersepeda Malam', 'Gathering'],
        note: 'Cuaca nyaman untuk aktivitas malam di luar ruangan'
      })
    } else {
      recommendedActivities.push({
        type: 'Aktivitas Malam Indoor',
        time: '18:00 - 22:00',
        activities: ['Dinner', 'Menonton Film', 'Board Game', 'Membaca', 'Relaksasi'],
        note: 'Nikmati aktivitas santai di dalam ruangan'
      })
    }
  }

  // Aktivitas Malam Larut (22:00 - 05:00)
  if (hour >= 22 || hour < 5) {
    recommendedActivities.push({
      type: 'Aktivitas Malam Larut',
      time: '22:00 - 05:00',
      activities: ['Tidur', 'Meditasi', 'Membaca Ringan', 'Relaksasi'],
      note: 'Waktu ideal untuk istirahat dan pemulihan tubuh'
    })
  }

  // Tambahan untuk rekomendasi khusus weekend
  if (isWeekend) {
    recommendedActivities.forEach(activity => {
      if (activity.type.includes('Pagi') || activity.type.includes('Sore')) {
        activity.weekendSpecial = {
          extraActivities: [
            'Piknik keluarga',
            'Olahraga bersama',
            'Aktivitas komunitas'
          ],
          socialAspect: 'Waktu berkualitas bersama keluarga/teman',
          locations: ['Taman kota', 'Area rekreasi', 'Fasilitas olahraga']
        }
      }
    })
  }

  // Peringatan cuaca
  const warnings = []

  if (weather_code >= 95) {
    warnings.push('PERINGATAN: Badai petir terdeteksi. Hindari aktivitas di luar ruangan dan area terbuka.')
  }

  if (temperature_2m > 35) {
    warnings.push('PERINGATAN: Suhu ekstrem tinggi. Risiko heat stroke, batasi aktivitas luar ruangan.')
  }

  if (relative_humidity_2m > 85) {
    warnings.push('PERINGATAN: Kelembaban sangat tinggi. Risiko tinggi pertumbuhan jamur dan masalah pernapasan.')
  }

  if (temperature_2m < 10) {
    warnings.push('PERINGATAN EKSTREM: Suhu sangat rendah! Risiko hipotermia tinggi. Tetap di dalam ruangan yang hangat dan hindari aktivitas luar ruangan.')
  }

  // Update rekomendasi aktivitas untuk cuaca dingin
  if (temperature_2m < 10) {
    const updatedActivities = recommendedActivities.map(timeSlot => ({
      ...timeSlot,
      activities: timeSlot.activities.map(activity => {
        if (typeof activity === 'string') {
          return 'Aktivitas Dalam Ruangan: ' + activity
        }
        return {
          ...activity,
          location: 'indoor',
          warning: 'Hanya lakukan aktivitas di dalam ruangan yang hangat',
          precautions: [
            'Pastikan ruangan memiliki penghangat yang memadai',
            'Gunakan pakaian hangat meski di dalam ruangan',
            'Minum minuman hangat secara teratur',
            'Pantau suhu tubuh'
          ]
        }
      }),
      note: 'PERHATIAN: Suhu ekstrem dingin - Utamakan aktivitas dalam ruangan',
      weatherWarning: {
        level: 'Ekstrem',
        type: 'Dingin',
        advice: 'Hindari aktivitas luar ruangan sama sekali'
      }
    }))

    return {
      healthImpacts,
      recommendedActivities: updatedActivities,
      uvProtection,
      warnings,
      extremeWeather: {
        type: 'cold',
        severity: 'extreme',
        temperature: temperature_2m,
        safetyMeasures: [
          'Gunakan pemanas ruangan',
          'Tutup semua celah udara',
          'Simpan selimut cadangan',
          'Siapkan makanan dan minuman hangat',
          'Pantau berita cuaca lokal'
        ]
      }
    }
  }

  // Return normal jika tidak ada kondisi ekstrem
  return {
    healthImpacts,
    recommendedActivities,
    uvProtection,
    warnings,
    extremeWeather: null
  }
}

function getDefaultAnalysis() {
  return {
    healthImpacts: [
      {
        condition: "Kondisi Umum",
        advice: "Jaga kesehatan seperti biasa",
        severity: "low"
      }
    ],
    uvProtection: {
      level: "Sedang",
      advice: "Gunakan tabir surya saat beraktivitas di luar"
    },
    recommendedActivities: [
      {
        type: "Dalam Ruangan",
        activities: ["Membaca", "Olahraga Ringan"]
      }
    ],
    warnings: []
  }
}
