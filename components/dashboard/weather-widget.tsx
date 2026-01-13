'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Cloud, MapPin, Wind, Loader2 } from 'lucide-react'
import { fetchWeather, getWeatherDescription, getActivityRecommendation, getWeatherGradient } from '@/lib/services/weather'
import { cn } from '@/lib/utils'

interface WeatherWidgetProps {
  workouts: Array<{
    location?: string
  }>
}

export function WeatherWidget({ workouts }: WeatherWidgetProps) {
  const [weather, setWeather] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [location, setLocation] = useState<{ lat: number; lon: number } | null>(null)

  useEffect(() => {
    async function loadWeather() {
      try {
        setLoading(true)
        setError(null)

        // Try to get location from browser geolocation
        if ('geolocation' in navigator) {
          navigator.geolocation.getCurrentPosition(
            async (position) => {
              const { latitude, longitude } = position.coords
              setLocation({ lat: latitude, lon: longitude })

              try {
                const data = await fetchWeather(latitude, longitude)
                setWeather(data)
              } catch (err) {
                setError('Failed to load weather data')
              } finally {
                setLoading(false)
              }
            },
            () => {
              // Fallback to default location (e.g., San Francisco)
              loadDefaultWeather()
            }
          )
        } else {
          loadDefaultWeather()
        }
      } catch (err) {
        setError('Failed to load weather')
        setLoading(false)
      }
    }

    async function loadDefaultWeather() {
      // Default to San Francisco coordinates
      const lat = 37.7749
      const lon = -122.4194
      setLocation({ lat, lon })

      try {
        const data = await fetchWeather(lat, lon)
        setWeather(data)
      } catch (err) {
        setError('Failed to load weather data')
      } finally {
        setLoading(false)
      }
    }

    loadWeather()
  }, [])

  if (loading) {
    return (
      <Card className="bg-white dark:bg-gray-800">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Cloud className="w-5 h-5 text-blue-600" />
            <CardTitle className="text-lg">Weather</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error || !weather) {
    return (
      <Card className="bg-white dark:bg-gray-800">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Cloud className="w-5 h-5 text-blue-600" />
            <CardTitle className="text-lg">Weather</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600 dark:text-gray-400">Weather data unavailable</p>
        </CardContent>
      </Card>
    )
  }

  const currentWeather = getWeatherDescription(weather.current.weatherCode)
  const recommendation = getActivityRecommendation(weather.current.weatherCode, weather.current.temperature)
  const gradientClass = getWeatherGradient(weather.current.weatherCode)

  return (
    <Card className={cn('overflow-hidden relative group hover:-translate-y-1 hover:shadow-xl transition-all duration-200', gradientClass)}>
      {/* Light overlay for better text contrast */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-white/20 pointer-events-none" />

      <CardHeader className="relative z-10 pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <Cloud className="w-4 h-4 text-gray-800" />
            <CardTitle className="text-gray-900 text-sm">Weather</CardTitle>
          </div>
          <MapPin className="w-3 h-3 text-gray-700" />
        </div>
      </CardHeader>

      <CardContent className="relative z-10 pt-0">
        {/* Current conditions */}
        <div className="flex items-center justify-between mb-2">
          <div>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-bold text-gray-900">
                {weather.current.temperature}°
              </span>
              <span className="text-sm text-gray-800">C</span>
            </div>
            <div className="flex items-center gap-1 mt-1">
              <span className="text-xl">{currentWeather.emoji}</span>
              <span className="text-gray-800 text-xs font-medium">{currentWeather.description}</span>
            </div>
          </div>

          <div className="text-right">
            <div className="flex items-center gap-1 text-gray-700 text-xs">
              <Wind className="w-3 h-3" />
              <span>{weather.current.windSpeed}km/h</span>
            </div>
          </div>
        </div>

        {/* Activity recommendation */}
        <div className="bg-white/60 backdrop-blur-sm rounded-lg p-2 mb-2">
          <p className="text-gray-900 text-xs font-medium">{recommendation}</p>
        </div>

        {/* 5-day forecast */}
        <div className="bg-white/60 backdrop-blur-sm rounded-lg p-2">
          <p className="text-xs text-gray-700 mb-1 uppercase tracking-wide font-semibold">Forecast</p>
          <div className="grid grid-cols-5 gap-1">
            {weather.daily.slice(0, 5).map((day: any, index: number) => {
              const date = new Date(day.date)
              const dayName = index === 0 ? 'Today' : date.toLocaleDateString('en-US', { weekday: 'short' })
              const dayWeather = getWeatherDescription(day.weatherCode)

              return (
                <div key={day.date} className="text-center">
                  <p className="text-xs text-gray-600 mb-0.5 font-medium">{dayName}</p>
                  <span className="text-base">{dayWeather.emoji}</span>
                  <div className="flex flex-col text-xs text-gray-800 mt-0.5">
                    <span className="font-semibold">{day.tempMax}°</span>
                    <span className="text-gray-600">{day.tempMin}°</span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
