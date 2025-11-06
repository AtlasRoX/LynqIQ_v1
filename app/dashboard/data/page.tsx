"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Database, Download, RefreshCw, Package, Users, ShoppingCart, DollarSign } from "lucide-react"
import { ReportGenerator } from "@/components/dashboard/report-generator"
// IMPORT THE METRICS FUNCTION AND TYPES
import { calculateMetrics } from "@/lib/analytics-utils"
import type { Product, Customer, Sale, Cost, DashboardMetrics } from "@/lib/types"

interface DataStats {
  products: number
  customers: number
  sales: number
  costs: number
}

export default function DataPage() {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<DataStats>({ products: 0, customers: 0, sales: 0, costs: 0 })
  const [refreshing, setRefreshing] = useState(false)
  const [products, setProducts] = useState<Product[]>([])
  const [customers, setCustomers] = useState<Customer[]>([])
  const [sales, setSales] = useState<Sale[]>([])
  const [costs, setCosts] = useState<Cost[]>([])

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      const supabase = await createClient()

      try {
        const {
          data: { user },
        } = await supabase.auth.getUser()
        if (user) {
          setEmail(user.email || "")

          const [{ data: productsData }, { data: customersData }, { data: salesData }, { data: costsData }] = await Promise.all([
            supabase.from("products").select("*"),
            supabase.from("customers").select("*"),
            supabase.from("sales").select("*"),
            supabase.from("costs").select("*"),
          ])

          setProducts(productsData || [])
          setCustomers(customersData || [])
          setSales(salesData || [])
          setCosts(costsData || [])

          setStats({
            products: productsData?.length || 0,
            customers: customersData?.length || 0,
            sales: salesData?.length || 0,
            costs: costsData?.length || 0,
          })
        }
      } catch (error) {
        console.error("Error fetching data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const handleRefresh = async () => {
    setRefreshing(true)
    // Simulate refresh
    await new Promise((resolve) => setTimeout(resolve, 1000))
    setRefreshing(false)
  }

  const handleExport = async (type: string) => {
    try {
      let data: any[] = []
      let filename = ""

      switch (type) {
        case "products":
          data = products
          filename = "products.json"
          break
        case "customers":
          data = customers
          filename = "customers.json"
          break
        case "sales":
          data = sales
          filename = "sales.json"
          break
        case "costs":
          data = costs
          filename = "costs.json"
          break
      }

      if (data.length > 0) {
        const json = JSON.stringify(data, null, 2)
        const blob = new Blob([json], { type: "application/json" })
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = filename
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      }
    } catch (error) {
      console.error("Error exporting data:", error)
    }
  }

  // --- ADDED THIS SECTION ---
  // Define the variables needed by ReportGenerator
  const timeFrame = "All Time"
  // Calculate metrics only when not loading
  const metrics = loading ? {} as DashboardMetrics : calculateMetrics(sales, costs, products, customers)
  // --- END OF ADDED SECTION ---

  return (
    <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-accent/10 rounded-lg">
              <Database className="h-6 w-6 text-accent" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Data Management</h1>
              <p className="text-muted-foreground">View and export your business data</p>
            </div>
          </div>
          <Button onClick={handleRefresh} disabled={refreshing} variant="outline" className="gap-2 bg-transparent">
            <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
            {refreshing ? "Refreshing..." : "Refresh"}
          </Button>
        </div>

        {loading ? (
          <div className="text-center py-12 text-muted-foreground">Loading data...</div>
        ) : (
          <div className="space-y-6">
            {/* Statistics */}
            <div className="grid gap-4 md:grid-cols-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Products</p>
                      <p className="text-2xl font-bold">{stats.products}</p>
                    </div>
                    <Package className="h-8 w-8 text-accent opacity-50" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Customers</p>
                      <p className="text-2xl font-bold">{stats.customers}</p>
                    </div>
                    <Users className="h-8 w-8 text-accent opacity-50" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Sales</p>
                      <p className="text-2xl font-bold">{stats.sales}</p>
                    </div>
                    <ShoppingCart className="h-8 w-8 text-accent opacity-50" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Costs</p>
                      <p className="text-2xl font-bold">{stats.costs}</p>
                    </div>
                    <DollarSign className="h-8 w-8 text-accent opacity-50" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Export Options */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold">Export Data</h2>
              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <Package className="h-5 w-5" />
                      Products
                    </CardTitle>
                    <CardDescription>{stats.products} items</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button
                      onClick={() => handleExport("products")}
                      variant="outline"
                      className="gap-2 w-full"
                      disabled={stats.products === 0}
                    >
                      <Download className="h-4 w-4" />
                      Export as JSON
                    </Button>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <Users className="h-5 w-5" />
                      Customers
                    </CardTitle>
                    <CardDescription>{stats.customers} records</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button
                      onClick={() => handleExport("customers")}
                      variant="outline"
                      className="gap-2 w-full"
                      disabled={stats.customers === 0}
                    >
                      <Download className="h-4 w-4" />
                      Export as JSON
                    </Button>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <ShoppingCart className="h-5 w-5" />
                      Sales Orders
                    </CardTitle>
                    <CardDescription>{stats.sales} transactions</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button
                      onClick={() => handleExport("sales")}
                      variant="outline"
                      className="gap-2 w-full"
                      disabled={stats.sales === 0}
                    >
                      <Download className="h-4 w-4" />
                      Export as JSON
                    </Button>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <DollarSign className="h-5 w-5" />
                      Costs & Expenses
                    </CardTitle>
                    <CardDescription>{stats.costs} entries</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button
                      onClick={() => handleExport("costs")}
                      variant="outline"
                      className="gap-2 w-full"
                      disabled={stats.costs === 0}
                    >
                      <Download className="h-4 w-4" />
                      Export as JSON
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Business Report */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold">Business Report</h2>
              {/* UPDATED THIS COMPONENT */}
              <ReportGenerator
                timeFrame={timeFrame}
                sales={sales}
                costs={costs}
                products={products}
                customers={customers}
                metrics={metrics}
              />
            </div>

            {/* Data Info */}
            <Card className="bg-muted/50">
              <CardHeader>
                <CardTitle className="text-base">Data Storage Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-muted-foreground">
                <p>Your data is securely stored in our cloud database and automatically backed up.</p>
                <p>You can export your data at any time in JSON format for backup or migration purposes.</p>
                <p>All data is encrypted and protected with industry-standard security measures.</p>
              </CardContent>
            </Card>
          </div>
        )}
    </div>
  )
}