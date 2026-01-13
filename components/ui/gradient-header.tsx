import type { LucideIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { X } from "lucide-react"
import { GRADIENT, ICON_CONTAINER } from "@/lib/styles"

interface GradientHeaderProps {
  icon: LucideIcon
  title: string
  subtitle: string
  theme: "workout" | "goal"
  onClose?: () => void
  centered?: boolean
}

export function GradientHeader({
  icon: Icon,
  title,
  subtitle,
  theme,
  onClose,
  centered = false,
}: GradientHeaderProps) {
  const gradient = GRADIENT[theme].header
  const iconSize = centered ? "w-8 h-8" : "w-5 h-5"
  const titleSize = centered ? "text-3xl mb-2" : "text-xl"
  const containerClass = centered ? ICON_CONTAINER.large : ICON_CONTAINER.small
  const padding = centered ? "p-8" : "p-6"
  const rounded = centered ? "rounded-xl" : "rounded-t-xl"

  return (
    <div className={`relative ${gradient} ${rounded} ${padding} overflow-hidden`}>
      {/* Decorative overlay */}
      <div className={GRADIENT.overlay} />

      <div className="relative z-10 flex items-center justify-between">
        <div className={`flex items-center gap-3 ${centered ? "flex-col text-center" : ""}`}>
          <div className={containerClass}>
            <Icon className={`${iconSize} text-white`} strokeWidth={2.5} />
          </div>
          <div>
            <h2 className={`${titleSize} font-bold text-white drop-shadow-lg`}>{title}</h2>
            <p className="text-sm text-white/90">{subtitle}</p>
          </div>
        </div>
        {onClose && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-10 w-10 p-0 hover:bg-white/20 rounded-full text-white"
          >
            <X className="w-5 h-5" />
          </Button>
        )}
      </div>
    </div>
  )
}
