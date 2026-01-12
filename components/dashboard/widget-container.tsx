'use client'

import { ReactNode } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { GripVertical, X } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface WidgetContainerProps {
  id: string
  title: string
  children: ReactNode
  onRemove?: (id: string) => void
  isDraggable?: boolean
  className?: string
}

export function WidgetContainer({
  id,
  title,
  children,
  onRemove,
  isDraggable = true,
  className = ''
}: WidgetContainerProps) {
  return (
    <Card className={`h-full ${className}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {isDraggable && (
              <div className="cursor-move">
                <GripVertical className="w-4 h-4 text-gray-400" />
              </div>
            )}
            <CardTitle className="text-base">{title}</CardTitle>
          </div>
          {onRemove && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onRemove(id)}
              className="h-6 w-6 p-0 hover:bg-red-50 hover:text-red-600"
            >
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {children}
      </CardContent>
    </Card>
  )
}
