import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ActivityTypeFilter } from '@/lib/types/analytics'

interface ActivityTypeFilterProps {
  selected: ActivityTypeFilter
  onChange: (activityType: ActivityTypeFilter) => void
}

const activityTypes: { value: ActivityTypeFilter; label: string; emoji: string }[] = [
  { value: 'all', label: 'All Activities', emoji: '🏃' },
  { value: 'running', label: 'Running', emoji: '🏃' },
  { value: 'climbing', label: 'Climbing', emoji: '🧗' },
  { value: 'hiking', label: 'Hiking', emoji: '🥾' },
  { value: 'snowboarding', label: 'Snowboarding', emoji: '🏂' },
  { value: 'cycling', label: 'Cycling', emoji: '🚴' },
  { value: 'swimming', label: 'Swimming', emoji: '🏊' },
  { value: 'yoga', label: 'Yoga', emoji: '🧘' },
  { value: 'strength', label: 'Strength', emoji: '💪' }
]

export function ActivityTypeFilter({ selected, onChange }: ActivityTypeFilterProps) {
  return (
    <Select value={selected} onValueChange={(value) => onChange(value as ActivityTypeFilter)}>
      <SelectTrigger className="w-[200px]">
        <SelectValue placeholder="Select activity" />
      </SelectTrigger>
      <SelectContent>
        {activityTypes.map((type) => (
          <SelectItem key={type.value} value={type.value}>
            <span className="flex items-center gap-2">
              <span>{type.emoji}</span>
              <span>{type.label}</span>
            </span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
