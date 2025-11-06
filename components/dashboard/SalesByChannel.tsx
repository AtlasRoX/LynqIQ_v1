'use client'

import type { Sale } from '@/lib/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { calculateSalesByChannel } from '@/lib/analytics-utils'

interface SalesByChannelProps {
  sales: Sale[]
}

const COLORS = ['var(--color-chart-1)', 'var(--color-chart-2)', 'var(--color-chart-3)', 'var(--color-chart-4)', 'var(--color-chart-5)']

export function SalesByChannel({ sales }: SalesByChannelProps) {
  const salesByChannel = calculateSalesByChannel(sales)
  const data = Object.entries(salesByChannel).map(([channel, sales]) => ({ name: channel, value: sales }))

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sales by Channel</CardTitle>
      </CardHeader>
      <CardContent>
        {data.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }: any) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => `$${Number(value).toLocaleString()}`} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <div className='text-center py-16 text-muted-foreground'>
            <p>No sales channel data available.</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
