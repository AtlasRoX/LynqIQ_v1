'use client'

import type { Sale, Customer } from '@/lib/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Users } from 'lucide-react'

interface TopCustomersProps {
  sales: Sale[]
  customers: Customer[]
}

export function TopCustomers({ sales, customers }: TopCustomersProps) {
  const customerRevenue: Record<string, number> = {}
  sales.forEach((s) => {
    if (s.status === 'completed') {
      customerRevenue[s.customer_id] = (customerRevenue[s.customer_id] || 0) + s.total_amount
    }
  })

  const topCustomers = customers
    .map((c) => ({
      ...c,
      revenue: customerRevenue[c.id] || 0,
    }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5)

  return (
    <Card>
      <CardHeader>
        <CardTitle className='flex items-center gap-2'>
          <Users className='h-5 w-5 text-accent' />
          Top Customers by Revenue
        </CardTitle>
      </CardHeader>
      <CardContent>
        {topCustomers.length > 0 ? (
          <div className='space-y-4'>
            {topCustomers.map((customer, index) => (
              <div key={customer.id} className='flex items-center justify-between p-3 bg-muted/30 rounded-lg border border-border hover:bg-muted/50 transition-colors'>
                <div className='flex items-center gap-3'>
                  <div className='w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center font-bold text-accent'>
                    {index + 1}
                  </div>
                  <p className='font-medium'>{customer.name}</p>
                </div>
                <p className='text-sm font-semibold text-accent'>
                  {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(customer.revenue)}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <div className='text-center py-8 text-muted-foreground'>
            <Users className='h-12 w-12 mx-auto mb-4 opacity-50' />
            <p>No customer data available yet.</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
