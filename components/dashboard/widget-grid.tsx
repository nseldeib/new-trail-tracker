'use client'

import { ReactNode, useEffect, useState } from 'react'
import GridLayout, { Layout } from 'react-grid-layout'
import 'react-grid-layout/css/styles.css'
import { WidgetConfig } from '@/lib/types/analytics'

interface WidgetGridProps {
  widgets: WidgetConfig[]
  onLayoutChange: (layout: Layout[]) => void
  children: ReactNode
}

export function WidgetGrid({ widgets, onLayoutChange, children }: WidgetGridProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {children}
      </div>
    )
  }

  // Convert widgets to layout format
  const layout: Layout[] = widgets
    .filter(w => w.visible)
    .map(widget => ({
      i: widget.id,
      x: widget.x,
      y: widget.y,
      w: widget.w,
      h: widget.h,
      minW: widget.minW || 1,
      minH: widget.minH || 1
    }))

  return (
    <GridLayout
      className="layout"
      layout={layout}
      cols={12}
      rowHeight={100}
      width={1200}
      onLayoutChange={onLayoutChange}
      isDraggable={true}
      isResizable={true}
      compactType="vertical"
      preventCollision={false}
      margin={[24, 24]}
      containerPadding={[0, 0]}
      draggableHandle=".cursor-move"
    >
      {children}
    </GridLayout>
  )
}
