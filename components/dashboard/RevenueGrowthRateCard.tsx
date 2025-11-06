'use client'

import type { Sale } from '@/lib/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { TrendingUp } from 'lucide-react'
import { calculateRevenueGrowthRate } from '@/lib/analytics-utils'

interface RevenueGrowthRateCardProps {
  sales: Sale[]
  timeFrame: string
}

export function RevenueGrowthRateCard({ sales, timeFrame }: RevenueGrowthRateCardProps) {
  const growthRate = calculateRevenueGrowthRate(sales, timeFrame)

  return (
    <Card>
      <CardHeader>
        <CardTitle className='flex items-center gap-2'>
          <TrendingUp className='h-5 w-5 text-accent' />
          Revenue Growth Rate
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className={`text-3xl font-bold ${growthRate >= 0 ? 'text-green-500' : 'text-red-500'}`}>
          {growthRate.toFixed(1)}%
        </p>
        <p className='text-sm text-muted-foreground'>Compared to the previous period</p>
      </CardContent>
    </Card>
  )
}
