import { getCustomers, getSales, getCosts, getProducts } from "@/lib/supabase/queries"
import { TopCustomers } from "@/components/dashboard/TopCustomers"
import { CustomerAcquisitionCost } from "@/components/dashboard/CustomerAcquisitionCost"
import { CustomerChurnRate } from "@/components/dashboard/CustomerChurnRate"
import { CustomerLifetimeValue } from "@/components/dashboard/CustomerLifetimeValue"
import { CustomerRetentionRate } from "@/components/dashboard/CustomerRetentionRate"
import { CustomerFrequencyChart } from "@/components/dashboard/customer-frequency-chart"
import { CustomerHealthChart } from "@/components/dashboard/customer-health-chart"
import { CustomerDataTable } from "@/components/dashboard/customer-data-table"
import { AddCustomerDialog } from "@/components/dashboard/add-customer-dialog"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users } from "lucide-react"
import type { Customer, Sale, Cost, Product } from "@/lib/types"

export default async function Customers() {
  const [
    { customers, error: customersError },
    { sales, error: salesError },
    { costs, error: costsError },
    { products, error: productsError },
  ] = await Promise.all([
    getCustomers(),
    getSales(),
    getCosts(),
    getProducts(),
  ])

  const error = customersError || salesError || costsError || productsError

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

  if (!customers || !sales || !costs || !products) return null

  return (
    <div className="p-8 md:p-10 space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Customers</h1>
          <p className="text-muted-foreground mt-1">Manage your customer relationships</p>
        </div>
        <AddCustomerDialog />
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <CustomerAcquisitionCost costs={costs} customers={customers} />
        <CustomerChurnRate sales={sales} customers={customers} />
        <CustomerLifetimeValue sales={sales} customers={customers} />
        <CustomerRetentionRate sales={sales} customers={customers} />
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <CustomerFrequencyChart sales={sales} customers={customers} />
        <CustomerHealthChart customers={customers} />
      </div>
      <div>
        <TopCustomers sales={sales} customers={customers} />
      </div>
      <div>
        <CustomerDataTable customers={customers} />
      </div>
    </div>
  )
}