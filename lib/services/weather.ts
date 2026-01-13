/**
 * Weather service using Open-Meteo API (free, no API key required)
 */

interface WeatherData {
  current: {
    temperature: number
    weatherCode: number
    windSpeed: number
  }
  daily: {
    date: string
    weatherCode: number
    tempMax: number
    tempMin: number
  }[]
}

interface CachedWeather {
  data: WeatherData
  timestamp: number
  location: { lat: number; lon: number }
}

const CACHE_KEY = 'trail-tracker-weather-cache'
const CACHE_DURATION = 60 * 60 * 1000 // 1 hour in milliseconds

/**
 * Weather code to description mapping (WMO Weather interpretation codes)
 */
const weatherCodeDescriptions: Record<number, { description: string; emoji: string }> = {
  0: { description: 'Clear sky', emoji: '☀️' },
  1: { description: 'Mainly clear', emoji: '🌤️' },
  2: { description: 'Partly cloudy', emoji: '⛅' },
  3: { description: 'Overcast', emoji: '☁️' },
  45: { description: 'Foggy', emoji: '🌫️' },
  48: { description: 'Foggy', emoji: '🌫️' },
  51: { description: 'Light drizzle', emoji: '🌦️' },
  53: { description: 'Drizzle', emoji: '🌦️' },
  55: { description: 'Heavy drizzle', emoji: '🌧️' },
  61: { description: 'Light rain', emoji: '🌧️' },
  63: { description: 'Rain', emoji: '🌧️' },
  65: { description: 'Heavy rain', emoji: '⛈️' },
  71: { description: 'Light snow', emoji: '🌨️' },
  73: { description: 'Snow', emoji: '❄️' },
  75: { description: 'Heavy snow', emoji: '❄️' },
  77: { description: 'Snow grains', emoji: '❄️' },
  80: { description: 'Light showers', emoji: '🌦️' },
  81: { description: 'Showers', emoji: '🌧️' },
  82: { description: 'Heavy showers', emoji: '⛈️' },
  85: { description: 'Light snow showers', emoji: '🌨️' },
  86: { description: 'Snow showers', emoji: '❄️' },
  95: { description: 'Thunderstorm', emoji: '⛈️' },
  96: { description: 'Thunderstorm with hail', emoji: '⛈️' },
  99: { description: 'Thunderstorm with hail', emoji: '⛈️' },
}

export function getWeatherDescription(code: number) {
  return weatherCodeDescriptions[code] || { description: 'Unknown', emoji: '🌡️' }
}

/**
 * Get cached weather data if available and not expired
 */
function getCachedWeather(lat: number, lon: number): WeatherData | null {
  if (typeof window === 'undefined') return null

  try {
    const cached = localStorage.getItem(CACHE_KEY)
    if (!cached) return null

    const parsedCache: CachedWeather = JSON.parse(cached)
    const now = Date.now()

    // Check if cache is still valid and location matches
    if (
      now - parsedCache.timestamp < CACHE_DURATION &&
      Math.abs(parsedCache.location.lat - lat) < 0.1 &&
      Math.abs(parsedCache.location.lon - lon) < 0.1
    ) {
      return parsedCache.data
    }

    return null
  } catch {
    return null
  }
}

/**
 * Cache weather data
 */
function cacheWeather(data: WeatherData, lat: number, lon: number) {
  if (typeof window === 'undefined') return

  try {
    const cache: CachedWeather = {
      data,
      timestamp: Date.now(),
      location: { lat, lon },
    }
    localStorage.setItem(CACHE_KEY, JSON.stringify(cache))
  } catch {
    // Ignore cache errors
  }
}

/**
 * Fetch weather data from Open-Meteo API
 */
export async function fetchWeather(lat: number, lon: number): Promise<WeatherData> {
  // Check cache first
  const cached = getCachedWeather(lat, lon)
  if (cached) {
    return cached
  }

  // Fetch from API
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=auto&forecast_days=5`

  const response = await fetch(url)
  if (!response.ok) {
    throw new Error('Failed to fetch weather data')
  }

  const apiData = await response.json()

  const weatherData: WeatherData = {
    current: {
      temperature: Math.round(apiData.current.temperature_2m),
      weatherCode: apiData.current.weather_code,
      windSpeed: Math.round(apiData.current.wind_speed_10m),
    },
    daily: apiData.daily.time.map((date: string, index: number) => ({
      date,
      weatherCode: apiData.daily.weather_code[index],
      tempMax: Math.round(apiData.daily.temperature_2m_max[index]),
      tempMin: Math.round(apiData.daily.temperature_2m_min[index]),
    })),
  }

  // Cache the result
  cacheWeather(weatherData, lat, lon)

  return weatherData
}

/**
 * Get activity recommendation based on weather conditions
 */
export function getActivityRecommendation(weatherCode: number, temp: number): string {
  // Bad weather conditions
  if (weatherCode >= 61 && weatherCode <= 99) {
    return 'Indoor workout recommended'
  }

  // Good conditions
  if (weatherCode <= 3) {
    if (temp < 0) {
      return 'Perfect for winter sports!'
    } else if (temp < 15) {
      return 'Great for running or hiking!'
    } else if (temp < 30) {
      return 'Ideal conditions for outdoor activities!'
    } else {
      return 'Stay hydrated! Hot conditions.'
    }
  }

  // Moderate conditions
  if (weatherCode <= 55) {
    return 'Light conditions, good for light exercise'
  }

  return 'Check conditions before heading out'
}

/**
 * Get gradient class based on weather
 */
export function getWeatherGradient(weatherCode: number): string {
  if (weatherCode <= 1) return 'bg-gradient-amber' // Sunny
  if (weatherCode <= 3) return 'bg-gradient-to-br from-blue-400 to-cyan-400' // Partly cloudy
  if (weatherCode >= 61 && weatherCode <= 65) return 'bg-gradient-to-br from-blue-500 to-blue-600' // Rainy
  if (weatherCode >= 71 && weatherCode <= 86) return 'bg-gradient-to-br from-blue-200 to-cyan-200' // Snowy
  if (weatherCode >= 95) return 'bg-gradient-to-br from-gray-700 to-gray-800' // Thunderstorm
  return 'bg-gradient-to-br from-gray-400 to-gray-500' // Cloudy/Foggy
}
