import type React from "react"
import { Card } from "@/components/ui/card"
import { TrendingUp, TrendingDown } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface KPICardProps {
  title: string
  value: string | number
  unit?: string
  trend?: number
  trendLabel?: string
  icon?: React.ReactNode
  isPositive?: boolean
  className?: string
  highlight?: boolean
}

export function KPICard({
  title,
  value,
  unit,
  trend,
  trendLabel,
  icon,
  isPositive = true,
  className,
  highlight = false,
}: KPICardProps) {
  return (
    <Card
      className={`p-6 border-l-4 transition-all hover:shadow-xl hover:-translate-y-1 ${
        highlight ? "border-primary bg-primary/5" : "border-muted bg-card"
      } ${className}`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider truncate">{title}</p>
              </TooltipTrigger>
              <TooltipContent>
                <p>{title}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <div className="mt-3 flex items-baseline gap-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <p className="text-3xl lg:text-4xl font-bold text-foreground truncate">{value}</p>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{value}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            {unit && <span className="text-sm lg:text-base font-medium text-muted-foreground">{unit}</span>}
          </div>
          {trend !== undefined && (
            <div className="mt-3 flex items-center gap-1">
              {isPositive ? (
                <TrendingUp className="h-4 w-4 text-green-600" />
              ) : (
                <TrendingDown className="h-4 w-4 text-destructive" />
              )}
              <span className={`text-sm font-semibold ${isPositive ? "text-green-600" : "text-destructive"}`}>
                {trend > 0 ? "+" : ""}
                {trend.toFixed(1)}%
              </span>
              {trendLabel && <span className="text-sm text-muted-foreground">{trendLabel}</span>}
            </div>
          )}
        </div>
        {icon && <div className={`ml-4 p-3 rounded-full ${highlight ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>{icon}</div>}
      </div>
    </Card>
  )
}
