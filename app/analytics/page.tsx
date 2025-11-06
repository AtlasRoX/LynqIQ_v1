"use client"

import { useEffect, useState } from "react"
import { getSales } from "@/lib/supabase/queries"
import { Sale } from "@/lib/types"
import { ResponsiveContainer, XAxis, YAxis, CartesianGrid, Legend, Area, AreaChart } from "recharts"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Loader2 } from "lucide-react"

// Example timeframe options
const timeframeOptions = [
  { value: "24h", label: "Last 24 Hours" },
  { value: "3d", label: "Last 3 Days" },
  { value: "7d", label: "Last 7 Days" },
  { value: "15d", label: "Last 15 Days" },
  { value: "30d", label: "Last 30 Days" },
  { value: "6m", label: "Last 6 Months" },
  { value: "1y", label: "Last Year" },
  { value: "lifetime", label: "Lifetime" },
]

const chartConfigs = {
  revenue: {
    label: "Revenue",
    color: "hsl(var(--chart-1))",
  },
  profit: {
    label: "Profit Margin",
    color: "hsl(var(--chart-2))",
  },
}

export default function AnalyticsPage() {
  const [timeframe, setTimeframe] = useState("7d")
  const [sales, setSales] = useState<Sale[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      const { sales, error } = await getSales()
      if (sales) {
        setSales(sales)
      }
      setLoading(false)
    }
    fetchData()
  }, [timeframe])

  // Function to handle timeframe change and fetch new data
  const handleTimeframeChange = (newTimeframe: string) => {
    setTimeframe(newTimeframe)
  }

  const revenueTrendData = sales.map((sale) => ({
    month: new Date(sale.date).toLocaleString("default", { month: "short" }),
    revenue: sale.total_amount,
  }))

  return (
    <div className="flex flex-col gap-8 p-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
        <Select onValueChange={handleTimeframeChange} defaultValue={timeframe}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select timeframe" />
          </SelectTrigger>
          <SelectContent>
            {timeframeOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Revenue Trend Chart */}
          <Card className="col-span-full">
            <CardHeader>
              <CardTitle>Revenue Trend</CardTitle>
              <CardDescription>Monthly revenue over time</CardDescription>
            </CardHeader>
            <CardContent className="h-[400px]">
              <ChartContainer config={chartConfigs} className="h-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={revenueTrendData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Legend />
                    <Area
                      type="monotone"
                      dataKey="revenue"
                      stroke="var(--color-revenue)"
                      fill="var(--color-revenue)"
                      fillOpacity={0.2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>

          {/* Placeholder for other charts (Revenue Growth, Profit Margin, etc) */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Revenue Growth Comparison</CardTitle>
              <CardDescription>Compare monthly growth rates</CardDescription>
            </CardHeader>
            <CardContent className="h-[300px]">
              {/* Implementation will be added in separate tasks */}
              <div className="flex items-center justify-center h-full text-muted-foreground">
                Chart content will be added here
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Top Products by Revenue</CardTitle>
              <CardDescription>Revenue contribution by product</CardDescription>
            </CardHeader>
            <CardContent className="h-[300px]">
              {/* Implementation will be added in separate tasks */}
              <div className="flex items-center justify-center h-full text-muted-foreground">
                Chart content will be added here
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
