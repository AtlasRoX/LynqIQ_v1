import type { Sale, Product } from '@/lib/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { calculateProfitPerProduct } from '@/lib/analytics-utils'
import { formatCurrency } from '@/lib/utils'

interface ProfitPerProductProps {
  sales: Sale[]
  products: Product[]
}

export function ProfitPerProduct({ sales, products }: ProfitPerProductProps) {
  const profitPerProduct = calculateProfitPerProduct(sales, products)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Profit per Product</CardTitle>
      </CardHeader>
      <CardContent>
        {profitPerProduct.length > 0 ? (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead className="text-right">Profit</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {profitPerProduct.slice(0, 10).map((product) => (
                  <TableRow key={product.name} className="hover:bg-muted/50">
                    <TableCell className="font-medium">{product.name}</TableCell>
                    <TableCell className="text-right font-semibold">{formatCurrency(product.profit, "BDT")}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className='text-center py-8 text-muted-foreground'>
            <p>No profit data available yet.</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
