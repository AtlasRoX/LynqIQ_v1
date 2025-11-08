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
  description?: string
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
  description,
}: KPICardProps) {
  return (
    <Card
      className={`p-5 md:p-6 border-l-4 transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 ${
        highlight ? "border-primary bg-gradient-to-br from-primary/5 to-primary/2" : "border-muted bg-card"
      } ${className}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <p className="text-xs md:text-sm font-semibold text-muted-foreground uppercase tracking-wider truncate">
                  {title}
                </p>
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <p className="font-semibold">{title}</p>
                {description && <p className="text-xs mt-1 text-muted-foreground">{description}</p>}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <div className="mt-2 md:mt-3 flex items-baseline gap-2 flex-wrap">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <p className="text-2xl md:text-3xl lg:text-4xl font-bold text-foreground truncate">{value}</p>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{value}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            {unit && <span className="text-xs md:text-sm font-medium text-muted-foreground">{unit}</span>}
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
        {icon && (
          <div
            className={`flex-shrink-0 p-3 md:p-3.5 rounded-lg ${highlight ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}
          >
            {icon}
          </div>
        )}
      </div>
    </Card>
  )
}
