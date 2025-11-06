'use client'

import type { Sale, Customer } from '@/lib/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { calculateSalesByRegion } from '@/lib/analytics-utils'

interface SalesByRegionProps {
  sales: Sale[]
  customers: Customer[]
}

export function SalesByRegion({ sales, customers }: SalesByRegionProps) {
  const salesByRegion = calculateSalesByRegion(sales, customers)
  const data = Object.entries(salesByRegion).map(([region, sales]) => ({ region, sales }))

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sales by Region</CardTitle>
      </CardHeader>
      <CardContent>
        {data.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" strokeOpacity={0.5} vertical={false} />
              <XAxis 
                dataKey="region" 
                stroke="var(--muted-foreground)" 
                style={{ fontSize: '12px' }} 
                axisLine={false} 
                tickLine={false} 
              />
              <YAxis 
                stroke="var(--muted-foreground)" 
                style={{ fontSize: '12px' }} 
                axisLine={false} 
                tickLine={false} 
              />
              <Tooltip 
                formatter={(value) => `$${Number(value).toLocaleString()}`}
                contentStyle={{
                  backgroundColor: 'var(--card)',
                  border: `1px solid var(--border)`,
                  borderRadius: 'var(--radius)',
                }}
              />
              <Legend />
              <Bar dataKey="sales" fill="var(--color-chart-1)" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className='text-center py-16 text-muted-foreground'>
            <p>No regional sales data available.</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
