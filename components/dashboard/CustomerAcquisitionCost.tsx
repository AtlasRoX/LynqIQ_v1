'use client'

import type { Cost, Customer } from '@/lib/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DollarSign } from 'lucide-react'
import { calculateCAC } from '@/lib/analytics-utils'
import { formatCurrency } from '@/lib/utils'

interface CustomerAcquisitionCostProps {
  costs: Cost[]
  customers: Customer[]
}

export function CustomerAcquisitionCost({ costs, customers }: CustomerAcquisitionCostProps) {
  const cac = calculateCAC(costs, customers)

  return (
    <Card>
      <CardHeader>
        <CardTitle className='flex items-center gap-2'>
          <DollarSign className='h-5 w-5 text-accent' />
          Customer Acquisition Cost (CAC)
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className='text-3xl font-bold'>{formatCurrency(cac, "BDT")}</p>
        <p className='text-sm text-muted-foreground'>Cost to acquire a new customer</p>
      </CardContent>
    </Card>
  )
}
