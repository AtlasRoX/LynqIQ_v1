import { cookies } from "next/headers"
import { createClient } from "@/lib/supabase/server"
import { calculateMetrics } from "@/lib/analytics-utils"
import { KPICard } from "@/components/dashboard/kpi-card"
import { formatCurrency } from "@/lib/utils"
import { DollarSign, TrendingUp, Activity, Users, Package, Award, PieChart, Zap } from "lucide-react"
import { SalesByCategoryChart } from "@/components/dashboard/sales-by-category-chart"
import { SalesByChannelChart } from "@/components/dashboard/sales-by-channel-chart"
import { TopCustomersList } from "@/components/dashboard/top-customers-list"
import { WorstSellingProductsList } from "@/components/dashboard/worst-selling-products-list"

export default async function Overview() {
  const timeFrame: string = "30d"

  const cookieStore = cookies()
  const supabase = createClient(cookieStore)

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return <div>Not authenticated</div>
  }

  const endDate = new Date()
  const startDate = new Date()

  switch (timeFrame) {
    case "24h":
      startDate.setHours(startDate.getHours() - 24)
      break
    case "3d":
      startDate.setDate(startDate.getDate() - 3)
      break
    case "7d":
      startDate.setDate(startDate.getDate() - 7)
      break
    case "15d":
      startDate.setDate(startDate.getDate() - 15)
      break
    case "30d":
      startDate.setDate(startDate.getDate() - 30)
      break
    case "6m":
      startDate.setMonth(startDate.getMonth() - 6)
      break
    case "1y":
      startDate.setFullYear(startDate.getFullYear() - 1)
      break
    case "lifetime":
      startDate.setFullYear(1900)
      break
    default:
      startDate.setFullYear(1900)
  }

  const formattedStartDate = startDate.toISOString().split("T")[0]
  const formattedEndDate = endDate.toISOString().split("T")[0]

  const isLifetime = timeFrame === "lifetime"

  const salesQuery = supabase.from("sales").select("*")
  if (!isLifetime) {
    salesQuery.gte("date", formattedStartDate).lte("date", formattedEndDate)
  }

  const costsQuery = supabase.from("costs").select("*")
  if (!isLifetime) {
    costsQuery.gte("date", formattedStartDate).lte("date", formattedEndDate)
  }

  const productsQuery = supabase.from("products").select("*")
  const customersQuery = supabase.from("customers").select("*")

  const [{ data: sales }, { data: costs }, { data: products }, { data: customers }] = await Promise.all([
    salesQuery,
    costsQuery,
    productsQuery,
    customersQuery,
  ])

  const metrics = calculateMetrics(sales || [], costs || [], products || [], customers || [])

  if (!metrics) {
    return (
      <div className="text-center py-16 text-muted-foreground">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div>
        <p className="mt-4">Loading overview metrics...</p>
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="px-4 py-6 md:px-6 lg:px-8 space-y-8">
        {/* Header Section */}
        <div className="space-y-2">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground text-pretty">Business Overview</h1>
          <p className="text-muted-foreground text-base md:text-lg">Last 30 days performance metrics</p>
        </div>

        {/* Key Metrics Grid - Financial Overview */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="h-1 w-1 rounded-full bg-primary"></div>
            <h2 className="text-xl md:text-2xl font-bold text-foreground">Financial Overview</h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 auto-rows-max">
            <KPICard
              title="Total Revenue"
              value={formatCurrency(metrics.totalRevenue, "BDT")}
              icon={<DollarSign className="h-6 w-6" />}
              highlight
            />
            <KPICard
              title="Net Profit"
              value={formatCurrency(metrics.netProfit, "BDT")}
              isPositive={metrics.netProfit >= 0}
              icon={<TrendingUp className="h-6 w-6" />}
              highlight
            />
            <KPICard
              title="Total Expenses"
              value={formatCurrency(metrics.totalExpenses, "BDT")}
              icon={<Activity className="h-6 w-6" />}
            />
            <KPICard
              title="Gross Profit"
              value={formatCurrency(metrics.grossProfit, "BDT")}
              isPositive={metrics.grossProfit >= 0}
              icon={<DollarSign className="h-6 w-6" />}
            />
          </div>
        </div>

        {/* Performance Metrics Grid */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="h-1 w-1 rounded-full bg-primary"></div>
            <h2 className="text-xl md:text-2xl font-bold text-foreground">Performance Indicators</h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 auto-rows-max">
            <KPICard
              title="Profit Margin"
              value={metrics.profitMargin.toFixed(1)}
              unit="%"
              isPositive={metrics.profitMargin >= 20}
              icon={<PieChart className="h-6 w-6" />}
              highlight={metrics.profitMargin >= 20}
            />
            <KPICard
              title="ROI"
              value={metrics.roi.toFixed(1)}
              unit="%"
              isPositive={metrics.roi >= 0}
              icon={<Zap className="h-6 w-6" />}
            />
            <KPICard
              title="Average Order Value"
              value={formatCurrency(metrics.aov, "BDT")}
              icon={<DollarSign className="h-6 w-6" />}
            />
            <KPICard
              title="Health Score"
              value={metrics.healthScore}
              unit="/100"
              isPositive={metrics.healthScore >= 50}
              icon={<Award className="h-6 w-6" />}
              highlight={metrics.healthScore >= 75}
            />
          </div>
        </div>

        {/* Charts Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="h-1 w-1 rounded-full bg-primary"></div>
            <h2 className="text-xl md:text-2xl font-bold text-foreground">Sales Analysis</h2>
          </div>
          <div className="grid gap-4 lg:grid-cols-2">
            <SalesByCategoryChart data={metrics.salesByCategory} />
            <SalesByChannelChart data={metrics.salesByChannel} />
          </div>
        </div>

        {/* Business Metrics Grid */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Left Column - Business Overview */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="h-1 w-1 rounded-full bg-primary"></div>
              <h2 className="text-xl md:text-2xl font-bold text-foreground">Business Metrics</h2>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
              <KPICard
                title="Total Sales"
                value={metrics.totalSales}
                trendLabel="orders"
                icon={<Package className="h-6 w-6" />}
                highlight
              />
              <KPICard
                title="Total Customers"
                value={metrics.totalCustomers}
                icon={<Users className="h-6 w-6" />}
                highlight
              />
            </div>
          </div>

          {/* Middle Column - Customer Metrics */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="h-1 w-1 rounded-full bg-primary"></div>
              <h2 className="text-xl md:text-2xl font-bold text-foreground">Customer Health</h2>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
              <KPICard
                title="Retention Rate"
                value={metrics.retentionRate.toFixed(1)}
                unit="%"
                isPositive={metrics.retentionRate > 80}
                icon={<Users className="h-6 w-6" />}
              />
              <KPICard
                title="Churn Rate"
                value={metrics.churnRate.toFixed(1)}
                unit="%"
                isPositive={metrics.churnRate < 10}
                icon={<TrendingUp className="h-6 w-6" />}
              />
            </div>
          </div>

          {/* Right Column - Customer Value */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="h-1 w-1 rounded-full bg-primary"></div>
              <h2 className="text-xl md:text-2xl font-bold text-foreground">Customer Value</h2>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
              <KPICard
                title="Customer Lifetime Value"
                value={formatCurrency(metrics.clv, "BDT")}
                icon={<DollarSign className="h-6 w-6" />}
              />
              <KPICard
                title="Acquisition Cost"
                value={formatCurrency(metrics.cac, "BDT")}
                icon={<DollarSign className="h-6 w-6" />}
              />
            </div>
          </div>
        </div>

        {/* Bottom Lists Section */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Top Customers */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="h-1 w-1 rounded-full bg-primary"></div>
              <h2 className="text-xl md:text-2xl font-bold text-foreground">Top Customers</h2>
            </div>
            <TopCustomersList customers={metrics.topCustomers} />
          </div>

          {/* Worst Selling Products */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="h-1 w-1 rounded-full bg-primary"></div>
              <h2 className="text-xl md:text-2xl font-bold text-foreground">Products to Review</h2>
            </div>
            <WorstSellingProductsList products={metrics.worstSellingProducts} />
          </div>
        </div>
      </div>
    </main>
  )
}
