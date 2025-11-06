"use client"

import { AlertCircle, AlertTriangle, Info } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import type { AnomalyAlert } from "@/lib/heuristic-analytics"

interface AnomalyAlertProps {
  alert: AnomalyAlert
}

export function AnomalyAlertCard({ alert }: AnomalyAlertProps) {
  const icons = {
    high: <AlertCircle className="h-5 w-5 text-red-600" />,
    medium: <AlertTriangle className="h-5 w-5 text-amber-600" />,
    low: <Info className="h-5 w-5 text-blue-600" />,
  }

  const bgColors = {
    high: "bg-red-500/10 border-red-500/20",
    medium: "bg-amber-500/10 border-amber-500/20",
    low: "bg-blue-500/10 border-blue-500/20",
  }

  return (
    <Card className={`border ${bgColors[alert.type]}`}>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 mt-0.5">{icons[alert.type]}</div>
          <div className="flex-1">
            <p className="font-semibold text-sm">{alert.title}</p>
            <p className="text-sm text-foreground/70 mt-1">{alert.description}</p>
            <div className="mt-2 flex items-center gap-2">
              <div className="flex-1 bg-background/50 rounded-full h-2">
                <div
                  className={`h-full rounded-full transition-all ${
                    alert.type === "high" ? "bg-red-600" : alert.type === "medium" ? "bg-amber-600" : "bg-blue-600"
                  }`}
                  style={{ width: `${alert.impact}%` }}
                />
              </div>
              <span className="text-xs font-semibold text-foreground/60">{alert.impact}% impact</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
