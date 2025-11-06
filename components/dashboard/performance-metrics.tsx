"use client"

import type { Sale, Cost, Product, Customer } from "@/lib/types"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { calculateMetrics } from "@/lib/analytics-utils"

interface PerformanceMetricsProps {
  sales: Sale[]
  costs: Cost[]
  products: Product[]
  customers: Customer[]
}

export function PerformanceMetrics({ sales, costs, products, customers }: PerformanceMetricsProps) {
  const metrics = calculateMetrics(sales, costs, products, customers)

  const performanceItems = [
    {
      label: "Revenue Growth Potential",
      value: customers.length > 0 ? Math.min((metrics.aov / 1000) * 100, 100) : 0,
      description: "Based on average order value",
    },
    {
      label: "Cost Efficiency",
      value: metrics.totalRevenue > 0 ? Math.max(0, 100 - (metrics.totalExpenses / metrics.totalRevenue) * 100) : 0,
      description: "Lower costs relative to revenue",
    },
    {
      label: "Customer Retention Rate",
      value: customers.length > 0 ? (customers.filter((c) => c.total_orders > 1).length / customers.length) * 100 : 0,
      description: "Repeat customers percentage",
    },
    {
      label: "Product Diversification",
      value: products.length > 0 ? Math.min((products.length / 20) * 100, 100) : 0,
      description: "Product variety score",
    },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Performance Metrics</CardTitle>
        <CardDescription>Key performance indicators</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {performanceItems.map((item, idx) => (
            <div key={idx} className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold">{item.label}</p>
                <span className="text-sm font-bold text-accent">{item.value.toFixed(1)}%</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div
                  className="h-full bg-gradient-to-r from-primary to-accent rounded-full transition-all"
                  style={{ width: `${Math.min(item.value, 100)}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground">{item.description}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
