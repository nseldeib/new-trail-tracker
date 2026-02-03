---
paths:
  - 'components/dashboard/**/*.tsx'
  - 'app/dashboard/page.tsx'
category: architecture
timestamp: 2026-02-03T23:15:00Z
---

## Dashboard Widget Pattern

Widgets are self-contained components that receive data via props from Dashboard parent.

### Widget Structure

Each widget:
- Receives data via typed props (workouts, goals, streak count, etc.)
- Handles its own rendering and state
- Optionally accepts `mockX` props for CodeYam simulation support

### Example

```typescript
interface StreakWidgetProps {
  currentStreak: number
  workouts: Array<{ created_at: string }>
}

export function StreakWidget({ currentStreak, workouts }: StreakWidgetProps) {
  // Widget implementation
}
```

### CodeYam Mock Support

Add optional mock props when widget fetches external data:

```typescript
interface WeatherWidgetProps {
  workouts: Array<{ location?: string }>
  mockWeather?: any  // For CodeYam scenarios
}

export function WeatherWidget({ workouts, mockWeather }: WeatherWidgetProps) {
  const [weather, setWeather] = useState<any>(mockWeather || null)

  useEffect(() => {
    if (mockWeather) {
      setWeather(mockWeather)
      return  // Skip real API call
    }
    // Fetch real data
  }, [mockWeather])
}
```

### Integration

Dashboard calculates data and passes to widgets:
```typescript
<StreakWidget currentStreak={currentStreak} workouts={workouts} />
<WeatherWidget workouts={workouts} mockWeather={mockWeather} />
```

**Learned:** 2026-02-03 from widget component analysis
