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

export const getActivityRecommendations = (weather) => {
  if (!weather?.current) return [];

  const temp = weather.current.temperature_2m;
  const weatherCode = weather.current.weather_code;
  const humidity = weather.current.relative_humidity_2m;

  const recommendations = [];

  // Temperature based
  if (temp > 30) {
    recommendations.push({
      type: 'Indoor',
      activities: ['Visit museums', 'Indoor sports', 'Shopping'],
      icon: '🏛️'
    });
  } else if (temp < 20) {
    recommendations.push({
      type: 'Warm activities',
      activities: ['Hiking', 'Jogging', 'Cycling'],
      icon: '🏃'
    });
  } else {
    recommendations.push({
      type: 'Outdoor',
      activities: ['Park visit', 'Picnic', 'Garden activities'],
      icon: '🌳'
    });
  }

  // Weather code based
  if ([0, 1].includes(weatherCode)) { // Clear sky or mainly clear
    recommendations.push({
      type: 'Perfect for',
      activities: ['Photography', 'Outdoor dining', 'Beach activities'],
      icon: '📸'
    });
  }

  // Add precipitation probability based activities
  if (weather.daily?.precipitation_probability_max?.[0] > 60) {
    recommendations.push({
      type: 'Rainy Day',
      activities: ['Indoor games', 'Movie watching', 'Reading'],
      icon: '🎮'
    });
  }

  return recommendations;
};

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