'use client'

import { WidgetConfig } from '@/lib/types/analytics'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Check, Plus, BarChart3, Calendar, Target, Clock, Zap, Award, TrendingUp, Activity, Heart, Sparkles } from 'lucide-react'

interface WidgetPickerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  widgets: WidgetConfig[]
  onToggleWidget: (id: string) => void
}

const WIDGET_DEFINITIONS = [
  {
    id: 'stats-overview',
    name: 'Stats Overview',
    description: 'Key metrics at a glance',
    icon: BarChart3,
    defaultConfig: { x: 0, y: 0, w: 12, h: 2, minW: 6, minH: 2 }
  },
  {
    id: 'heatmap',
    name: 'Activity Heatmap',
    description: 'GitHub-style contribution calendar',
    icon: Calendar,
    defaultConfig: { x: 0, y: 2, w: 12, h: 3, minW: 8, minH: 3 }
  },
  {
    id: 'goal-progress',
    name: 'Goal Progress',
    description: 'Track your active goals',
    icon: Target,
    defaultConfig: { x: 0, y: 5, w: 6, h: 3, minW: 4, minH: 3 }
  },
  {
    id: 'timeline',
    name: 'Activity Timeline',
    description: 'Recent workouts feed',
    icon: Clock,
    defaultConfig: { x: 6, y: 5, w: 6, h: 4, minW: 4, minH: 4 }
  },
  {
    id: 'quick-actions',
    name: 'Quick Actions',
    description: 'Fast-access buttons',
    icon: Zap,
    defaultConfig: { x: 0, y: 9, w: 4, h: 2, minW: 3, minH: 2 }
  },
  {
    id: 'personal-records',
    name: 'Personal Records',
    description: 'Your achievements',
    icon: Award,
    defaultConfig: { x: 4, y: 9, w: 4, h: 2, minW: 3, minH: 2 }
  },
  {
    id: 'streak',
    name: 'Workout Streak',
    description: 'Current and longest streaks',
    icon: TrendingUp,
    defaultConfig: { x: 8, y: 9, w: 4, h: 2, minW: 3, minH: 2 }
  },
  {
    id: 'weekly-summary',
    name: 'Weekly Summary',
    description: '7-day activity snapshot',
    icon: Activity,
    defaultConfig: { x: 0, y: 11, w: 6, h: 2, minW: 4, minH: 2 }
  },
  {
    id: 'training-insights',
    name: 'Training Insights',
    description: 'Smart suggestions',
    icon: Sparkles,
    defaultConfig: { x: 6, y: 11, w: 6, h: 2, minW: 4, minH: 2 }
  },
  {
    id: 'wellbeing',
    name: 'Wellbeing Check-in',
    description: "Today's mood tracker",
    icon: Heart,
    defaultConfig: { x: 0, y: 13, w: 4, h: 2, minW: 3, minH: 2 }
  }
]

export function WidgetPicker({ open, onOpenChange, widgets, onToggleWidget }: WidgetPickerProps) {
  const isWidgetVisible = (id: string) => {
    const widget = widgets.find(w => w.id === id)
    return widget?.visible ?? false
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Customize Dashboard</DialogTitle>
          <DialogDescription>
            Add or remove widgets to personalize your dashboard
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          {WIDGET_DEFINITIONS.map(widget => {
            const Icon = widget.icon
            const isVisible = isWidgetVisible(widget.id)

            return (
              <button
                key={widget.id}
                onClick={() => onToggleWidget(widget.id)}
                className={`p-4 border rounded-lg text-left transition-all hover:shadow-md ${
                  isVisible
                    ? 'border-green-500 bg-green-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-lg ${
                    isVisible ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-600'
                  }`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="font-medium text-gray-900">{widget.name}</h3>
                      {isVisible && (
                        <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{widget.description}</p>
                  </div>
                </div>
              </button>
            )
          })}
        </div>

        <div className="flex justify-end gap-2 mt-6">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Done
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// Export widget definitions for use in dashboard
export { WIDGET_DEFINITIONS }
