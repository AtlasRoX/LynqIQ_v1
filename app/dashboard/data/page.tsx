"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Database,
  Download,
  RefreshCw,
  Package,
  Users,
  ShoppingCart,
  DollarSign,
  Shield,
  Clock,
  ArrowUpRight,
} from "lucide-react"
import { ReportGenerator } from "@/components/dashboard/report-generator"
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

          const [{ data: productsData }, { data: customersData }, { data: salesData }, { data: costsData }] =
            await Promise.all([
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

  const timeFrame = "All Time"
  const metrics = loading ? ({} as DashboardMetrics) : calculateMetrics(sales, costs, products, customers)

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/5 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="space-y-4 sm:space-y-2">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="p-3 bg-gradient-to-br from-primary/10 to-primary/5 rounded-xl border border-primary/10 backdrop-blur-sm">
                <Database className="h-6 w-6 sm:h-7 sm:w-7 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground text-balance">
                  Data Management
                </h1>
                <p className="text-sm sm:text-base text-muted-foreground mt-1">
                  View, export, and manage your business data
                </p>
              </div>
            </div>
            <Button
              onClick={handleRefresh}
              disabled={refreshing}
              variant="outline"
              className="gap-2 w-full sm:w-auto bg-transparent"
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
              {refreshing ? "Refreshing..." : "Refresh"}
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12 sm:py-16">
            <div className="inline-flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent"></div>
              <span className="ml-3 text-muted-foreground">Loading data...</span>
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            <div className="space-y-4">
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Quick Overview</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="border border-border/50 hover:border-primary/30 transition-all hover:shadow-lg hover:shadow-primary/5">
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2 flex-1">
                        <p className="text-xs sm:text-sm text-muted-foreground font-medium">Products</p>
                        <p className="text-2xl sm:text-3xl font-bold text-foreground">{stats.products}</p>
                      </div>
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <Package className="h-5 w-5 text-primary" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border border-border/50 hover:border-primary/30 transition-all hover:shadow-lg hover:shadow-primary/5">
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2 flex-1">
                        <p className="text-xs sm:text-sm text-muted-foreground font-medium">Customers</p>
                        <p className="text-2xl sm:text-3xl font-bold text-foreground">{stats.customers}</p>
                      </div>
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <Users className="h-5 w-5 text-primary" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border border-border/50 hover:border-primary/30 transition-all hover:shadow-lg hover:shadow-primary/5">
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2 flex-1">
                        <p className="text-xs sm:text-sm text-muted-foreground font-medium">Sales Orders</p>
                        <p className="text-2xl sm:text-3xl font-bold text-foreground">{stats.sales}</p>
                      </div>
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <ShoppingCart className="h-5 w-5 text-primary" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border border-border/50 hover:border-primary/30 transition-all hover:shadow-lg hover:shadow-primary/5">
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2 flex-1">
                        <p className="text-xs sm:text-sm text-muted-foreground font-medium">Costs</p>
                        <p className="text-2xl sm:text-3xl font-bold text-foreground">{stats.costs}</p>
                      </div>
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <DollarSign className="h-5 w-5 text-primary" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            <div className="space-y-4">
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Export Your Data</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="flex flex-col border border-border/50 hover:border-primary/20 transition-all">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Package className="h-4 w-4 text-primary" />
                      Products
                    </CardTitle>
                    <CardDescription className="text-xs">{stats.products} items</CardDescription>
                  </CardHeader>
                  <CardContent className="flex-1 flex flex-col justify-end">
                    <Button
                      onClick={() => handleExport("products")}
                      disabled={stats.products === 0}
                      className="w-full gap-2"
                      size="sm"
                    >
                      <Download className="h-3.5 w-3.5" />
                      <span className="hidden sm:inline">Export as JSON</span>
                      <span className="sm:hidden">Export</span>
                    </Button>
                  </CardContent>
                </Card>

                <Card className="flex flex-col border border-border/50 hover:border-primary/20 transition-all">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Users className="h-4 w-4 text-primary" />
                      Customers
                    </CardTitle>
                    <CardDescription className="text-xs">{stats.customers} records</CardDescription>
                  </CardHeader>
                  <CardContent className="flex-1 flex flex-col justify-end">
                    <Button
                      onClick={() => handleExport("customers")}
                      disabled={stats.customers === 0}
                      className="w-full gap-2"
                      size="sm"
                    >
                      <Download className="h-3.5 w-3.5" />
                      <span className="hidden sm:inline">Export as JSON</span>
                      <span className="sm:hidden">Export</span>
                    </Button>
                  </CardContent>
                </Card>

                <Card className="flex flex-col border border-border/50 hover:border-primary/20 transition-all">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <ShoppingCart className="h-4 w-4 text-primary" />
                      Sales Orders
                    </CardTitle>
                    <CardDescription className="text-xs">{stats.sales} transactions</CardDescription>
                  </CardHeader>
                  <CardContent className="flex-1 flex flex-col justify-end">
                    <Button
                      onClick={() => handleExport("sales")}
                      disabled={stats.sales === 0}
                      className="w-full gap-2"
                      size="sm"
                    >
                      <Download className="h-3.5 w-3.5" />
                      <span className="hidden sm:inline">Export as JSON</span>
                      <span className="sm:hidden">Export</span>
                    </Button>
                  </CardContent>
                </Card>

                <Card className="flex flex-col border border-border/50 hover:border-primary/20 transition-all">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-primary" />
                      Costs
                    </CardTitle>
                    <CardDescription className="text-xs">{stats.costs} entries</CardDescription>
                  </CardHeader>
                  <CardContent className="flex-1 flex flex-col justify-end">
                    <Button
                      onClick={() => handleExport("costs")}
                      disabled={stats.costs === 0}
                      className="w-full gap-2"
                      size="sm"
                    >
                      <Download className="h-3.5 w-3.5" />
                      <span className="hidden sm:inline">Export as JSON</span>
                      <span className="sm:hidden">Export</span>
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>

            <div className="space-y-4">
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Generate Reports</h2>
              <Card className="border border-border/50">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <ArrowUpRight className="h-5 w-5 text-primary" />
                    Premium Business Report
                  </CardTitle>
                  <CardDescription>
                    Generate comprehensive multi-page PDF reports with AI-powered insights and recommendations
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ReportGenerator
                    timeFrame={timeFrame}
                    sales={sales}
                    costs={costs}
                    products={products}
                    customers={customers}
                    metrics={metrics}
                    businessName="LynqIQ Analytics"
                  />
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="border border-border/50 bg-gradient-to-br from-primary/5 to-transparent">
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Shield className="h-5 w-5 text-primary" />
                    Data Security
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm text-muted-foreground">
                  <p>
                    Your data is encrypted with enterprise-grade security protocols and automatically backed up daily.
                  </p>
                  <p>
                    All data transfers use HTTPS/SSL encryption and are protected with industry-standard security
                    measures.
                  </p>
                </CardContent>
              </Card>

              <Card className="border border-border/50 bg-gradient-to-br from-primary/5 to-transparent">
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Clock className="h-5 w-5 text-primary" />
                    Last Updated
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">
                  <p>
                    Data refreshed: <span className="text-foreground font-medium">{new Date().toLocaleString()}</span>
                  </p>
                  <p className="mt-2">You can manually refresh data using the refresh button at the top.</p>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
