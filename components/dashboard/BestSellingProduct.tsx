import Image from 'next/image'
import type { Product } from '@/lib/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Award, Package } from 'lucide-react'

interface BestSellingProductProps {
  product?: Product
}

export function BestSellingProduct({ product }: BestSellingProductProps) {
  if (!product) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <Award className='h-5 w-5 text-muted-foreground' />
            Best-Selling Product
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className='text-center py-8 text-muted-foreground'>
            <Package className='h-12 w-12 mx-auto mb-4 opacity-50' />
            <p>No sales data available yet.</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className='flex items-center gap-2'>
          <Award className='h-5 w-5 text-accent' />
          Best-Selling Product
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className='flex items-center gap-4'>
          <div className='w-16 h-16 bg-muted rounded-lg flex items-center justify-center overflow-hidden'>
            {product.image_url ? (
              <Image 
                src={product.image_url} 
                alt={product.name} 
                width={64} 
                height={64} 
                className='w-full h-full object-cover rounded-lg' 
              />
            ) : (
              <Package className='h-8 w-8 text-muted-foreground' />
            )}
          </div>
          <div>
            <p className='font-semibold text-lg'>{product.name}</p>
            <p className='text-sm text-muted-foreground'>Category: {product.category}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
