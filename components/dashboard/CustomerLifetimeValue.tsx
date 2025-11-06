'use client'

import type { Sale, Customer } from '@/lib/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DollarSign } from 'lucide-react'
import { calculateCLV } from '@/lib/analytics-utils'
import { formatCurrency } from '@/lib/utils'

interface CustomerLifetimeValueProps {
  sales: Sale[]
  customers: Customer[]
}

export function CustomerLifetimeValue({ sales, customers }: CustomerLifetimeValueProps) {
  const clv = calculateCLV(sales, customers)

  return (
    <Card>
      <CardHeader>
        <CardTitle className='flex items-center gap-2'>
          <DollarSign className='h-5 w-5 text-accent' />
          Customer Lifetime Value (CLV)
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className='text-3xl font-bold'>{formatCurrency(clv, "BDT")}</p>
        <p className='text-sm text-muted-foreground'>Predicted value of a customer</p>
      </CardContent>
    </Card>
  )
}
