import { getProducts, getSales, getCosts, getCustomers } from "@/lib/supabase/queries"
import { BestSellingProduct } from "@/components/dashboard/BestSellingProduct"
import { WorstSellingProducts } from "@/components/dashboard/WorstSellingProducts"
import { ProfitPerProduct } from "@/components/dashboard/ProfitPerProduct"
import { TotalUnitsSold } from "@/components/dashboard/TotalUnitsSold"
import { ProductDataTable } from "@/components/dashboard/product-data-table"
import { AddProductDialog } from "@/components/dashboard/add-product-dialog"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Package } from "lucide-react"
import type { Product, Sale, Customer, Cost } from "@/lib/types"
import { getBestSellingProduct } from "@/lib/analytics-utils"

export default async function Products() {
  const [
    { products, error: productsError },
    { sales, error: salesError },
    { costs, error: costsError },
    { customers, error: customersError },
  ] = await Promise.all([
    getProducts(),
    getSales(),
    getCosts(),
    getCustomers(),
  ])

  const error = productsError || salesError || costsError || customersError

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <p className="text-center text-destructive">{error}</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!products || !sales || !costs || !customers) return null

  const bestSellingProduct = getBestSellingProduct(sales, products)

  return (
    <div className="p-8 md:p-10 space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Products</h1>
          <p className="text-muted-foreground mt-1">Manage your product inventory</p>
        </div>
        <AddProductDialog />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {bestSellingProduct && <BestSellingProduct product={bestSellingProduct} />} 
        <TotalUnitsSold sales={sales} />
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        <WorstSellingProducts sales={sales} products={products} />
        <ProfitPerProduct sales={sales} products={products} />
      </div>
      <div>
        <ProductDataTable products={products} />
      </div>
    </div>
  )
}
