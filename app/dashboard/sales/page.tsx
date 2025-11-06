import { getSales, getProducts, getCustomers, getCosts } from "@/lib/supabase/queries"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendIndicator } from "@/components/dashboard/trend-indicator"
import { SalesByChannel } from "@/components/dashboard/SalesByChannel"
import { SalesByRegion } from "@/components/dashboard/SalesByRegion"
import { AddSaleDialog } from "@/components/dashboard/add-sale-dialog"
import { analyzeTrends } from "@/lib/heuristic-analytics";
import { calculateMetrics } from "@/lib/analytics-utils";
import { TrendingUp, ShoppingCart } from "lucide-react"
import type { Sale, Product, Customer, Cost } from "@/lib/types"
import { SalesTable } from "./sales-table" // Import the client component
import { formatCurrency, formatNumber } from "@/lib/utils"

export default async function Sales() {
  const [
    { sales, error: salesError },
    { products, error: productsError },
    { customers, error: customersError },
    { costs, error: costsError },
  ] = await Promise.all([
    getSales(),
    getProducts(),
    getCustomers(),
    getCosts(),
  ])

  const error = salesError || productsError || customersError || costsError

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

  if (!sales || !products || !customers || !costs) return null

  const metrics = calculateMetrics(sales, costs, products, customers)
  const trends = analyzeTrends(sales, costs, products, customers)

  return (
    <div className="p-8 md:p-10 space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Sales</h1>
          <p className="text-muted-foreground mt-1">Track and manage your sales transactions</p>
        </div>
        <AddSaleDialog products={products} customers={customers} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-accent" />
            Performance Trends
          </CardTitle>
        </CardHeader>
        <CardContent>
          {trends.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {trends.map((trend, idx) => (
                <div key={idx} className="p-4 bg-muted/50 rounded-lg border border-border">
                  <p className="text-sm font-medium text-muted-foreground mb-2">{trend.metric}</p>
                  <div className="flex items-end justify-between">
                    <div>
                      <p className="text-2xl font-bold text-foreground">
                        {formatCurrency(trend.current, "BDT", trend.metric === "Revenue" || trend.metric === "Expenses")}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">vs {formatCurrency(trend.previous, "BDT", trend.metric === "Revenue" || trend.metric === "Expenses")} prior</p>
                    </div>
                    <TrendIndicator trend={trend} />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Not enough data to calculate trends yet.</p>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <SalesByChannel sales={sales} />
        <SalesByRegion sales={sales} customers={customers} />
      </div>

      <div>
        {/* Pass the raw data to the new client component */}
        <SalesTable sales={sales} products={products} customers={customers} />
      </div>
    </div>
  )
}
