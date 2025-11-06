"use client"

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts"
import type { Cost } from "@/lib/types"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

const COLORS = [
  "var(--color-chart-1)",
  "var(--color-chart-2)",
  "var(--color-chart-3)",
  "var(--color-chart-4)",
  "var(--color-chart-5)",
]

interface ExpenseBreakdownChartProps {
  costs: Cost[]
}

export function ExpenseBreakdownChart({ costs }: ExpenseBreakdownChartProps) {
  // Calculate costs by category
  const categoryData = costs.reduce(
    (acc, cost) => {
      const existing = acc.find((d) => d.name === cost.category)
      if (existing) {
        existing.value += cost.amount
      } else {
        acc.push({
          name: cost.category,
          value: cost.amount,
        })
      }
      return acc
    },
    [] as Array<{ name: string; value: number }>,
  )

  return (
    <Card>
      <CardHeader>
        <CardTitle>Expense Breakdown</CardTitle>
        <CardDescription>Expenses by category</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={categoryData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, value }: any) => `${name}: ৳${value.toLocaleString("bn-BD")}`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {categoryData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value) => `৳${Number(value).toLocaleString("bn-BD")}`}
              contentStyle={{
                backgroundColor: "var(--color-card)",
                border: `1px solid var(--color-border)`,
                borderRadius: "6px",
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
