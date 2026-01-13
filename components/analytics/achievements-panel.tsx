'use client'

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Achievement } from '@/lib/types/analytics'
import {
  Trophy,
  Lock,
  Footprints,
  Flame,
  Mountain,
  Medal,
  Zap,
  Sparkles,
  LucideIcon
} from 'lucide-react'
import { ProgressRing } from '@/components/charts/progress-ring'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { useSpring, animated } from 'react-spring'

interface AchievementsPanelProps {
  achievements: Achievement[]
  loading?: boolean
}

const iconMap: Record<string, LucideIcon> = {
  Footprints,
  Flame,
  Trophy,
  Mountain,
  Medal,
  Zap,
  Sparkles
}

const categoryColors: Record<string, string> = {
  frequency: 'bg-gradient-purple',
  streak: 'bg-gradient-amber',
  distance: 'bg-gradient-coral',
  elevation: 'bg-gradient-green',
  diversity: 'bg-gradient-teal'
}

const categoryBorderColors: Record<string, string> = {
  frequency: 'border-purple-500',
  streak: 'border-amber-500',
  distance: 'border-coral-500',
  elevation: 'border-green-500',
  diversity: 'border-teal-500'
}

export function AchievementsPanel({ achievements, loading }: AchievementsPanelProps) {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Achievements</CardTitle>
          <CardDescription>Your fitness milestones</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-32 bg-gray-100 dark:bg-gray-800 animate-pulse rounded-lg" />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  const unlocked = achievements.filter(a => !a.locked)
  const locked = achievements.filter(a => a.locked)

  return (
    <Card className="hover:shadow-lg transition-all duration-200">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-amber-500" />
              Achievements
            </CardTitle>
            <CardDescription>
              {unlocked.length} of {achievements.length} unlocked
            </CardDescription>
          </div>
          <Badge className="bg-amber-100 text-amber-700 border-amber-200">
            {Math.round((unlocked.length / achievements.length) * 100)}% Complete
          </Badge>
        </div>
      </CardHeader>

      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Unlocked achievements first */}
          {unlocked.map((achievement, index) => (
            <AchievementCard
              key={achievement.id}
              achievement={achievement}
              index={index}
            />
          ))}

          {/* Locked achievements */}
          {locked.map((achievement, index) => (
            <AchievementCard
              key={achievement.id}
              achievement={achievement}
              index={unlocked.length + index}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

interface AchievementCardProps {
  achievement: Achievement
  index: number
}

function AchievementCard({ achievement, index }: AchievementCardProps) {
  const Icon = iconMap[achievement.icon] || Trophy
  const gradientClass = categoryColors[achievement.category] || 'bg-gradient-teal'
  const borderColor = categoryBorderColors[achievement.category] || 'border-teal-500'

  // Stagger animation
  const animation = useSpring({
    from: { opacity: 0, transform: 'translateY(20px)' },
    to: { opacity: 1, transform: 'translateY(0px)' },
    delay: index * 50,
    config: { tension: 200, friction: 20 }
  })

  if (achievement.locked) {
    return (
      <animated.div style={animation}>
        <Card className={cn(
          "relative overflow-hidden border-2 border-dashed transition-all duration-200",
          "hover:shadow-md bg-gray-50 dark:bg-gray-800/50",
          "border-gray-300 dark:border-gray-600"
        )}>
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              {/* Locked icon */}
              <div className="p-3 rounded-lg bg-gray-200 dark:bg-gray-700">
                <Lock className="w-6 h-6 text-gray-400" />
              </div>

              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">
                  {achievement.title}
                </h4>
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                  {achievement.description}
                </p>

                {/* Progress */}
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className="h-2 rounded-full transition-all bg-gray-400"
                      style={{ width: `${achievement.progress}%` }}
                    />
                  </div>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {achievement.progress}%
                  </span>
                </div>

                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                  {achievement.currentValue} / {achievement.requirement} {achievement.unit}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </animated.div>
    )
  }

  return (
    <animated.div style={animation}>
      <Card className={cn(
        "relative overflow-hidden border-2 transition-all duration-200",
        "hover:-translate-y-1 hover:shadow-xl",
        borderColor,
        gradientClass
      )}>
        {/* Decorative overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none" />

        <CardContent className="p-4 relative z-10">
          <div className="flex items-start gap-3">
            {/* Achievement icon */}
            <div className="p-3 rounded-lg bg-white/20 backdrop-blur-sm">
              <Icon className="w-6 h-6 text-white" />
            </div>

            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-white mb-1">
                {achievement.title}
              </h4>
              <p className="text-xs text-white/90 mb-3">
                {achievement.description}
              </p>

              {/* Unlocked date */}
              {achievement.unlockedAt && (
                <Badge className="bg-white/20 text-white border-white/30 text-xs">
                  Unlocked {new Date(achievement.unlockedAt).toLocaleDateString()}
                </Badge>
              )}

              {/* Progress ring (100% for unlocked) */}
              <div className="absolute top-4 right-4">
                <ProgressRing
                  progress={100}
                  size={50}
                  color="white"
                  showPercentage={false}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </animated.div>
  )
}
