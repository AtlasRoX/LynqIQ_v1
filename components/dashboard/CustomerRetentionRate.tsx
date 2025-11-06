'use client'

import type { Sale, Customer } from '@/lib/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Users } from 'lucide-react'
import { calculateRetentionRate } from '@/lib/analytics-utils'

interface CustomerRetentionRateProps {
  sales: Sale[]
  customers: Customer[]
}

export function CustomerRetentionRate({ sales, customers }: CustomerRetentionRateProps) {
  const retentionRate = calculateRetentionRate(sales, customers)

  return (
    <Card>
      <CardHeader>
        <CardTitle className='flex items-center gap-2'>
          <Users className='h-5 w-5 text-accent' />
          Customer Retention Rate
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className='text-3xl font-bold'>{retentionRate.toFixed(1)}%</p>
        <p className='text-sm text-muted-foreground'>Percentage of returning customers</p>
      </CardContent>
    </Card>
  )
}
