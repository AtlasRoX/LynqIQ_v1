import type { Sale, Product } from '@/lib/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { TrendingDown } from 'lucide-react'
import { formatCurrency } from "@/lib/utils"

interface WorstSellingProductsProps {
  sales: Sale[]
  products: Product[]
}

export function WorstSellingProducts({ sales, products }: WorstSellingProductsProps) {
  const productSales: Record<string, number> = {}
  sales.forEach((s) => {
    if (s.status === 'completed') {
      productSales[s.product_id] = (productSales[s.product_id] || 0) + s.total_amount
    }
  })

  const worstSellingProducts = products
    .map((p) => ({
      ...p,
      revenue: productSales[p.id] || 0,
    }))
    .sort((a, b) => a.revenue - b.revenue)
    .slice(0, 5)

  return (
    <Card>
      <CardHeader>
        <CardTitle className='flex items-center gap-2'>
          <TrendingDown className='h-5 w-5 text-destructive' />
          Worst-Selling Products
        </CardTitle>
      </CardHeader>
      <CardContent>
        {worstSellingProducts.length > 0 ? (
          <div className='space-y-4'>
            {worstSellingProducts.map((product) => (
              <div key={product.id} className='flex items-center justify-between p-3 bg-muted/30 rounded-lg border border-border hover:bg-muted/50 transition-colors'>
                <p className='font-medium'>{product.name}</p>
                <p className='text-sm text-muted-foreground'>
                  Revenue: {formatCurrency(product.revenue, "BDT")}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <div className='text-center py-8 text-muted-foreground'>
            <TrendingDown className='h-12 w-12 mx-auto mb-4 opacity-50' />
            <p>No product sales data available.</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
