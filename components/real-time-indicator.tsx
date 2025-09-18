"use client"

import { Zap, Clock, AlertTriangle } from "lucide-react"

interface RealTimeIndicatorProps {
  isRealtime: boolean
  lastUpdated?: Date
  delay?: number
  size?: "sm" | "md"
}

export function RealTimeIndicator({ isRealtime, lastUpdated, delay, size = "sm" }: RealTimeIndicatorProps) {
  const iconSize = size === "sm" ? "w-3 h-3" : "w-4 h-4"
  const textSize = size === "sm" ? "text-xs" : "text-sm"

  if (!isRealtime) {
    return (
      <div className="flex items-center gap-1 text-gray-500">
        <Clock className={iconSize} />
        <span className={textSize}>Schedule</span>
      </div>
    )
  }

  if (delay && delay > 0) {
    return (
      <div className="flex items-center gap-1 text-amber-600">
        <AlertTriangle className={iconSize} />
        <span className={textSize}>+{delay}min</span>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-1 text-green-600">
      <Zap className={iconSize} />
      <span className={textSize}>Live</span>
    </div>
  )
}
