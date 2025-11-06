import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { SalesByRegion } from "@/components/dashboard/SalesByRegion"
import { SalesByChannel } from "@/components/dashboard/SalesByChannel"
import { TotalUnitsSold } from "@/components/dashboard/TotalUnitsSold"
import { ProfitPerProduct } from "@/components/dashboard/ProfitPerProduct"
import { RevenueGrowthRateCard } from "@/components/dashboard/RevenueGrowthRateCard"
import { DateFilter } from "@/components/dashboard/date-filter"
import { RevenueTrendChart } from "@/components/dashboard/revenue-trend-chart"
import { TopProductsChart } from "@/components/dashboard/top-products-chart"
import { ExpenseBreakdownChart } from "@/components/dashboard/expense-breakdown-chart"
import { CustomerFrequencyChart } from "@/components/dashboard/customer-frequency-chart"
import { ProfitMarginChart } from "@/components/dashboard/profit-margin-chart"
import { CustomerHealthChart } from "@/components/dashboard/customer-health-chart"
import { SalesByCategoryChart } from "@/components/dashboard/sales-by-category-chart"
import { PerformanceMetrics } from "@/components/dashboard/performance-metrics"
import { calculateSalesByCategory } from "@/lib/analytics-utils";
import { BarChart3, Users, Package } from "lucide-react"

export default async function AnalyticsPage({ searchParams }: { searchParams: { timeFrame: string } }) {
  const resolvedSearchParams = await searchParams;
  const timeFrame = resolvedSearchParams.timeFrame || "30d";
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return <div>Not authenticated</div>;
  }

  const endDate = new Date();
  const startDate = new Date();

  switch (timeFrame) {
    case "24h":
      startDate.setHours(startDate.getHours() - 24);
      break;
    case "3d":
      startDate.setDate(startDate.getDate() - 3);
      break;
    case "7d":
      startDate.setDate(startDate.getDate() - 7);
      break;
    case "15d":
      startDate.setDate(startDate.getDate() - 15);
      break;
    case "30d":
      startDate.setDate(startDate.getDate() - 30);
      break;
    case "6m":
      startDate.setMonth(startDate.getMonth() - 6);
      break;
    case "1y":
      startDate.setFullYear(startDate.getFullYear() - 1);
      break;
    case "lifetime":
      startDate.setFullYear(1900);
      break;
    default:
      startDate.setFullYear(1900);
  }

  const formattedStartDate = startDate.toISOString().split("T")[0];
  const formattedEndDate = endDate.toISOString().split("T")[0];

  const isLifetime = timeFrame === "lifetime";

  const salesQuery = supabase.from("sales").select("*");
  if (!isLifetime) {
    salesQuery.gte("date", formattedStartDate).lte("date", formattedEndDate);
  }

  const costsQuery = supabase.from("costs").select("*");
  if (!isLifetime) {
    costsQuery.gte("date", formattedStartDate).lte("date", formattedEndDate);
  }

  const productsQuery = supabase.from("products").select("*");
  const customersQuery = supabase.from("customers").select("*");

  const [
    { data: sales },
    { data: costs },
    { data: products },
    { data: customers },
  ] = await Promise.all([
    salesQuery,
    costsQuery,
    productsQuery,
    customersQuery,
  ]);

  const salesByCategory = calculateSalesByCategory(sales || [], products || []);

  return (
    <div className="p-6 space-y-6">
        {/* Header */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-accent/10 rounded-lg">
              <BarChart3 className="h-6 w-6 text-accent" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Advanced Analytics</h1>
              <p className="text-muted-foreground">Detailed business insights and performance analysis</p>
            </div>
          </div>
          <DateFilter />
        </div>

            {/* Row 1: Revenue & Profit */}
            <div className="grid gap-6 lg:grid-cols-2">
              <RevenueTrendChart sales={sales || []} />
              <ProfitMarginChart sales={sales || []} products={products || []} />
            </div>

            {/* Row 2: Products & Categories */}
            <div className="grid gap-6 lg:grid-cols-2">
              <TopProductsChart sales={sales || []} products={products || []} />
              <SalesByCategoryChart data={salesByCategory} />
            </div>

            {/* Row 3: Expenses & Customer Health */}
            <div className="grid gap-6 lg:grid-cols-2">
              <ExpenseBreakdownChart costs={costs || []} />
              <CustomerHealthChart customers={customers || []} />
            </div>

            {/* Row 4: Customer Frequency & Performance */}
            <div className="grid gap-6 lg:grid-cols-2">
              <CustomerFrequencyChart sales={sales || []} customers={customers || []} />
              <PerformanceMetrics sales={sales || []} costs={costs || []} products={products || []} customers={customers || []} />
            </div>

            {/* Sales Analysis Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-accent/10 rounded-lg">
                  <BarChart3 className="h-6 w-6 text-accent" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-foreground">Sales Analysis</h2>
                  <p className="text-muted-foreground">In-depth sales performance metrics</p>
                </div>
              </div>
              <div className="grid gap-6 lg:grid-cols-3">
                <RevenueGrowthRateCard sales={sales || []} timeFrame={timeFrame} />
                <TotalUnitsSold sales={sales || []} />
              </div>
              <div className="grid gap-6 lg:grid-cols-2">
                <SalesByRegion sales={sales || []} customers={customers || []} />
                <SalesByChannel sales={sales || []} />
              </div>
            </div>

            {/* Product Analysis Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-accent/10 rounded-lg">
                  <Package className="h-6 w-6 text-accent" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-foreground">Product Analysis</h2>
                  <p className="text-muted-foreground">In-depth product performance metrics</p>
                </div>
              </div>
              <ProfitPerProduct sales={sales || []} products={products || []} />
            </div>
      </div>
  )
}
