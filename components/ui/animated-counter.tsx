"use client"

import { useSpring, animated } from "react-spring"
import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"

interface AnimatedCounterProps {
  value: number
  duration?: number
  formatter?: (n: number) => string
  className?: string
  decimals?: number
}

export function AnimatedCounter({
  value,
  duration = 800,
  formatter,
  className,
  decimals = 0,
}: AnimatedCounterProps) {
  const [hasAnimated, setHasAnimated] = useState(false)

  const { number } = useSpring({
    from: { number: hasAnimated ? value : 0 },
    number: value,
    config: { duration },
    onRest: () => setHasAnimated(true),
  })

  useEffect(() => {
    setHasAnimated(false)
  }, [value])

  const defaultFormatter = (n: number) => {
    if (decimals > 0) {
      return n.toFixed(decimals)
    }
    return Math.floor(n).toString()
  }

  const format = formatter || defaultFormatter

  return (
    <animated.span className={cn("tabular-nums", className)}>
      {number.to((n) => format(n))}
    </animated.span>
  )
}
