'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Flame } from 'lucide-react'
import { AnimatedCounter } from '@/components/ui/animated-counter'
import { cn } from '@/lib/utils'

interface StreakWidgetProps {
  currentStreak: number
  workouts: Array<{ created_at: string }>
}

export function StreakWidget({ currentStreak, workouts }: StreakWidgetProps) {
  // Calculate next milestone
  const milestones = [7, 14, 30, 60, 90]
  const nextMilestone = milestones.find(m => m > currentStreak) || 100
  const progressToNext = (currentStreak / nextMilestone) * 100

  return (
    <Card className="bg-gradient-amber overflow-hidden relative group hover:-translate-y-1 hover:shadow-xl transition-all duration-200">
      {/* Decorative gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none" />

      <CardHeader className="relative z-10 pb-2">
        <div className="flex items-center gap-1">
          <Flame className="w-4 h-4 text-white drop-shadow-lg" />
          <CardTitle className="text-white text-sm">Streak</CardTitle>
        </div>
      </CardHeader>

      <CardContent className="relative z-10 pt-0">
        <div className="flex items-center justify-between mb-2">
          <div>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-bold text-white drop-shadow-lg">
                <AnimatedCounter value={currentStreak} />
              </span>
              <span className="text-sm text-white/80">days</span>
            </div>
          </div>

          {/* Large flame icon */}
          <div className="relative">
            <Flame className={cn(
              "w-10 h-10 text-white/20 transition-all duration-300",
              currentStreak > 0 && "animate-pulse"
            )} />
          </div>
        </div>

        {/* Progress to next milestone */}
        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-2">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-white/80">Next: {nextMilestone}d</span>
            <span className="text-xs font-semibold text-white">{Math.round(progressToNext)}%</span>
          </div>

          <div className="h-1.5 bg-white/20 rounded-full overflow-hidden">
            <div
              className="h-full bg-white rounded-full transition-all duration-500"
              style={{ width: `${progressToNext}%` }}
            />
          </div>

          {/* Milestone markers */}
          <div className="flex justify-between mt-2 text-xs text-white/60">
            {milestones.slice(0, 5).map((milestone) => (
              <div
                key={milestone}
                className={cn(
                  "flex flex-col items-center transition-all",
                  currentStreak >= milestone ? "text-white font-semibold" : "text-white/40"
                )}
              >
                <div className={cn(
                  "w-2 h-2 rounded-full mb-1",
                  currentStreak >= milestone ? "bg-white glow-amber" : "bg-white/30"
                )} />
                <span>{milestone}</span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
