'use client'

import { TrendingUp, TrendingDown, Minus } from "lucide-react"
import type { TrendAnalysis } from "@/lib/heuristic-analytics"

interface TrendIndicatorProps {
  trend: TrendAnalysis
}

export function TrendIndicator({ trend }: TrendIndicatorProps) {
  const { change } = trend // Changed from changePercent

  let colorClass = "text-gray-600"
  let Icon = Minus
  let text = "stable"

  if (change > 10) { // Changed from changePercent
    colorClass = "text-green-500"
    Icon = TrendingUp
    text = "rises"
  } else if (change > 0) { // Changed from changePercent
    colorClass = "text-green-400"
    Icon = TrendingUp
    text = "rises"
  } else if (change === 0) { // Changed from changePercent
    colorClass = "text-yellow-500"
    Icon = Minus
    text = "stable"
  } else if (change > -10) { // Changed from changePercent
    colorClass = "text-orange-500"
    Icon = TrendingDown
    text = "decreases"
  } else {
    colorClass = "text-red-500"
    Icon = TrendingDown
    text = "decreases"
  }

  return (
    <div className={`flex items-center gap-2 ${colorClass}`}>
      <Icon className="h-4 w-4" />
      <span className="text-sm font-semibold">
        {Math.abs(change).toFixed(1)}% {text} {/* Changed from changePercent */}
      </span>
    </div>
  )
}