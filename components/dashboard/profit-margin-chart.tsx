"use client"

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import type { Sale, Product } from "@/lib/types"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface ProfitMarginChartProps {
  sales: Sale[]
  products: Product[]
}

export function ProfitMarginChart({ sales, products }: ProfitMarginChartProps) {
  // Calculate daily profit margin
  const dailyData = sales
    .filter((s) => s.status === "completed")
    .reduce(
      (acc, sale) => {
        const product = products.find((p) => p.id === sale.product_id)
        if (!product) return acc

        const existing = acc.find((d) => d.date === sale.date)
        const revenue = sale.total_amount
        const cost = product.cost_price * sale.quantity
        const profit = revenue - cost

        if (existing) {
          existing.revenue += revenue
          existing.cost += cost
          existing.profit += profit
        } else {
          acc.push({
            date: sale.date,
            revenue,
            cost,
            profit,
          })
        }
        return acc
      },
      [] as Array<{ date: string; revenue: number; cost: number; profit: number }>,
    )
    .map((d) => ({
      ...d,
      margin: d.revenue > 0 ? ((d.profit / d.revenue) * 100).toFixed(1) : 0,
    }))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

  return (
    <Card>
      <CardHeader>
        <CardTitle>Profit Margin Trend</CardTitle>
        <CardDescription>Daily profit margins and costs</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={dailyData}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
            <XAxis dataKey="date" stroke="var(--color-muted-foreground)" style={{ fontSize: "12px" }} />
            <YAxis yAxisId="left" stroke="var(--color-muted-foreground)" style={{ fontSize: "12px" }} />
            <YAxis
              yAxisId="right"
              orientation="right"
              stroke="var(--color-muted-foreground)"
              style={{ fontSize: "12px" }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "var(--color-card)",
                border: `1px solid var(--color-border)`,
              }}
            />
            <Legend />
            <Bar yAxisId="left" dataKey="profit" fill="var(--color-chart-1)" name="Profit (৳)" />
            <Bar yAxisId="left" dataKey="cost" fill="var(--color-chart-2)" name="Cost (৳)" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
