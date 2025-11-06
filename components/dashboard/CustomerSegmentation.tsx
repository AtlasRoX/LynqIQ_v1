'use client'

import type { Customer } from '@/lib/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Users } from 'lucide-react'
import { calculateCustomerSegments } from '@/lib/analytics-utils'

interface CustomerSegmentationProps {
  customers: Customer[]
}

export function CustomerSegmentation({ customers }: CustomerSegmentationProps) {
  const segments = calculateCustomerSegments(customers)

  return (
    <Card>
      <CardHeader>
        <CardTitle className='flex items-center gap-2'>
          <Users className='h-5 w-5 text-accent' />
          Customer Segmentation
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className='grid grid-cols-2 gap-4'>
          <div>
            <h3 className='font-semibold'>High Spenders</h3>
            <p className='text-2xl font-bold'>{segments.highSpenders.length}</p>
          </div>
          <div>
            <h3 className='font-semibold'>Frequent Buyers</h3>
            <p className='text-2xl font-bold'>{segments.frequentBuyers.length}</p>
          </div>
          <div>
            <h3 className='font-semibold'>One-Time Buyers</h3>
            <p className='text-2xl font-bold'>{segments.oneTimeBuyers.length}</p>
          </div>
          <div>
            <h3 className='font-semibold'>New Customers (Last 30d)</h3>
            <p className='text-2xl font-bold'>{segments.newCustomers.length}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
