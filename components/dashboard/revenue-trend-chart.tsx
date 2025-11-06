'use client'

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import type { Sale } from '@/lib/types'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { formatCurrency } from '@/lib/utils'

interface RevenueTrendChartProps {
  sales: Sale[]
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="p-4 bg-card border border-border rounded-lg shadow-lg">
        <p className="text-sm font-medium text-foreground">{label}</p>
        <p className="text-lg font-bold text-primary">{formatCurrency(payload[0].value, "BDT")}</p>
      </div>
    )
  }

  return null
}

export function RevenueTrendChart({ sales }: RevenueTrendChartProps) {
  // Group sales by date and calculate daily revenue
  const dailyData = sales
    .filter((s) => s.status === 'completed')
    .reduce(
      (acc, sale) => {
        const existing = acc.find((d) => d.date === sale.date)
        if (existing) {
          existing.revenue += sale.total_amount
        } else {
          acc.push({ date: sale.date, revenue: sale.total_amount })
        }
        return acc
      },
      [] as Array<{ date: string; revenue: number }>,
    )
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

  return (
    <Card>
      <CardHeader>
        <CardTitle>Revenue Trend</CardTitle>
        <CardDescription>Daily revenue over time</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width='100%' height={300}>
          <AreaChart data={dailyData}>
            <defs>
              <linearGradient id='colorRevenue' x1='0' y1='0' x2='0' y2='1'>
                <stop offset='5%' stopColor='var(--color-primary)' stopOpacity={0.8} />
                <stop offset='95%' stopColor='var(--color-primary)' stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray='3 3' stroke='var(--border)' strokeOpacity={0.5} />
            <XAxis dataKey='date' stroke='var(--muted-foreground)' style={{ fontSize: '12px' }} axisLine={false} tickLine={false} />
            <YAxis stroke='var(--muted-foreground)' style={{ fontSize: '12px' }} axisLine={false} tickLine={false} tickFormatter={(value) => formatCurrency(value as number, "BDT")} />
            <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'var(--color-primary)', strokeWidth: 2, strokeDasharray: '3 3' }} />
            <Area
              type='monotone'
              dataKey='revenue'
              stroke='var(--color-primary)'
              strokeWidth={2}
              fillOpacity={1}
              fill='url(#colorRevenue)'
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
