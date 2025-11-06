'use client'

import type { Sale, Customer } from '@/lib/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Users } from 'lucide-react'
import { calculateChurnRate } from '@/lib/analytics-utils'

interface CustomerChurnRateProps {
  sales: Sale[]
  customers: Customer[]
}

export function CustomerChurnRate({ sales, customers }: CustomerChurnRateProps) {
  const churnRate = calculateChurnRate(sales, customers)

  return (
    <Card>
      <CardHeader>
        <CardTitle className='flex items-center gap-2'>
          <Users className='h-5 w-5 text-destructive' />
          Customer Churn Rate
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className='text-3xl font-bold'>{churnRate.toFixed(1)}%</p>
        <p className='text-sm text-muted-foreground'>Percentage of customers lost</p>
      </CardContent>
    </Card>
  )
}
