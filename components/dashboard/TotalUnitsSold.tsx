'use client'

import type { Sale } from '@/lib/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Package } from 'lucide-react'
import { calculateTotalUnitsSold } from '@/lib/analytics-utils'

interface TotalUnitsSoldProps {
  sales: Sale[]
}

export function TotalUnitsSold({ sales }: TotalUnitsSoldProps) {
  const totalUnitsSold = calculateTotalUnitsSold(sales)

  return (
    <Card>
      <CardHeader>
        <CardTitle className='flex items-center gap-2'>
          <Package className='h-5 w-5 text-accent' />
          Total Units Sold
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className='text-3xl font-bold'>{totalUnitsSold}</p>
      </CardContent>
    </Card>
  )
}
