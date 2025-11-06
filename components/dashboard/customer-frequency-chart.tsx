'use client'

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import type { Sale, Customer } from '@/lib/types'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

interface CustomerFrequencyChartProps {
  sales: Sale[]
  customers: Customer[]
}

const getPath = (x: number, y: number, width: number, height: number) => {
  const radius = 8
  return `M${x},${y + radius} a${radius},${radius} 0 0 1 ${radius},-${radius} h${width - 2 * radius} a${radius},${radius} 0 0 1 ${radius},${radius} v${height - radius} h-${width} z`
}

const RoundedBar = (props: any) => {
  const { fill, x, y, width, height } = props
  return <path d={getPath(x, y, width, height)} stroke='none' fill={fill} />
}

export function CustomerFrequencyChart({ sales, customers }: CustomerFrequencyChartProps) {
  // Count purchases per customer
  const customerPurchases = sales
    .filter((s) => s.status === 'completed')
    .reduce(
      (acc, sale) => {
        const customer = customers.find((c) => c.id === sale.customer_id)
        if (customer) {
          const existing = acc.find((d) => d.name === customer.name)
          if (existing) {
            existing.purchases += 1
          } else {
            acc.push({
              name: customer.name,
              purchases: 1,
            })
          }
        }
        return acc
      },
      [] as Array<{ name: string; purchases: number }>,
    )
    .sort((a, b) => b.purchases - a.purchases)
    .slice(0, 8) // Top 8 customers

  return (
    <Card>
      <CardHeader>
        <CardTitle>Top Customers by Purchase Frequency</CardTitle>
        <CardDescription>Customers with most orders</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width='100%' height={300}>
          <BarChart data={customerPurchases}>
            <defs>
              <linearGradient id='colorPurchases' x1='0' y1='0' x2='0' y2='1'>
                <stop offset='5%' stopColor='var(--color-chart-4)' stopOpacity={0.8} />
                <stop offset='95%' stopColor='var(--color-chart-3)' stopOpacity={0.8} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray='3 3' stroke='var(--border)' strokeOpacity={0.5} vertical={false} />
            <XAxis dataKey='name' stroke='var(--muted-foreground)' style={{ fontSize: '12px' }} axisLine={false} tickLine={false} />
            <YAxis stroke='var(--muted-foreground)' style={{ fontSize: '12px' }} axisLine={false} tickLine={false} />
            <Tooltip
              contentStyle={{
                backgroundColor: 'var(--card)',
                border: `1px solid var(--border)`,
                borderRadius: 'var(--radius)',
                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
              }}
              cursor={{ fill: 'var(--accent)', radius: 'var(--radius)' }}
            />
            <Legend wrapperStyle={{ paddingTop: '20px' }} />
            <Bar dataKey='purchases' fill='url(#colorPurchases)' barSize={40} shape={<RoundedBar />} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
