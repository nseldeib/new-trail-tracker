import { TimeRange } from '@/lib/types/analytics'

interface TimeRangeSelectorProps {
  selected: TimeRange
  onChange: (range: TimeRange) => void
}

const timeRanges: { value: TimeRange; label: string }[] = [
  { value: 'week', label: 'Week' },
  { value: 'month', label: 'Month' },
  { value: 'year', label: 'Year' },
  { value: 'all', label: 'All Time' }
]

export function TimeRangeSelector({ selected, onChange }: TimeRangeSelectorProps) {
  return (
    <div className="inline-flex rounded-md shadow-sm" role="group">
      {timeRanges.map((range, index) => (
        <button
          key={range.value}
          type="button"
          onClick={() => onChange(range.value)}
          className={`
            px-4 py-2 text-sm font-medium transition-colors
            ${index === 0 ? 'rounded-l-lg' : ''}
            ${index === timeRanges.length - 1 ? 'rounded-r-lg' : ''}
            ${
              selected === range.value
                ? 'bg-green-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
            }
            ${index > 0 && selected !== range.value ? 'border-l-0' : ''}
          `}
        >
          {range.label}
        </button>
      ))}
    </div>
  )
}
