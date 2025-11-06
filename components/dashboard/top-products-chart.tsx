"use client"

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import type { Sale, Product } from "@/lib/types"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface TopProductsChartProps {
  sales: Sale[]
  products: Product[]
}

export function TopProductsChart({ sales, products }: TopProductsChartProps) {
  // Calculate revenue by product
  const productRevenue = sales
    .filter((s) => s.status === "completed")
    .reduce(
      (acc, sale) => {
        const product = products.find((p) => p.id === sale.product_id)
        if (product) {
          const existing = acc.find((d) => d.name === product.name)
          if (existing) {
            existing.revenue += sale.total_amount
          } else {
            acc.push({
              name: product.name,
              revenue: sale.total_amount,
            })
          }
        }
        return acc
      },
      [] as Array<{ name: string; revenue: number }>,
    )
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5) // Top 5 products

  return (
    <Card>
      <CardHeader>
        <CardTitle>Top Products by Revenue</CardTitle>
        <CardDescription>Top 5 best-performing products</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={productRevenue}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
            <XAxis dataKey="name" stroke="var(--color-muted-foreground)" style={{ fontSize: "12px" }} />
            <YAxis stroke="var(--color-muted-foreground)" style={{ fontSize: "12px" }} />
            <Tooltip
              contentStyle={{
                backgroundColor: "var(--color-card)",
                border: `1px solid var(--color-border)`,
                borderRadius: "6px",
              }}
              formatter={(value) => `৳${Number(value).toLocaleString("bn-BD")}`}
            />
            <Legend />
            <Bar dataKey="revenue" fill="var(--color-chart-2)" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
