"use client"

import { PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer } from "recharts"
import type { Customer } from "@/lib/types"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface CustomerHealthChartProps {
  customers: Customer[]
}

export function CustomerHealthChart({ customers }: CustomerHealthChartProps) {
  const now = new Date()
  const segments = {
    active: 0,
    atrisk: 0,
    dormant: 0,
  }

  customers.forEach((c) => {
    if (!c.last_order_date) {
      segments.dormant++
    } else {
      const daysInactive = (now.getTime() - new Date(c.last_order_date).getTime()) / (1000 * 60 * 60 * 24)
      if (daysInactive < 30) {
        segments.active++
      } else if (daysInactive < 60) {
        segments.atrisk++
      } else {
        segments.dormant++
      }
    }
  })

  const data = [
    { name: "Active", value: segments.active, color: "#10b981" },
    { name: "At Risk", value: segments.atrisk, color: "#f59e0b" },
    { name: "Dormant", value: segments.dormant, color: "#ef4444" },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Customer Health</CardTitle>
        <CardDescription>Customer status based on activity</CardDescription>
      </CardHeader>
      <CardContent>
        {data.every((d) => d.value === 0) ? (
          <div className="flex items-center justify-center h-64 text-muted-foreground">No customer data available</div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value}`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {data.map((entry, idx) => (
                  <Cell key={`cell-${idx}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => `${value} customers`} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  )
}
