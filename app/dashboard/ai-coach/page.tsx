"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { useSearchParams } from "next/navigation"
import { DateFilter } from "@/components/dashboard/date-filter"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, Zap, Lightbulb, TrendingUp, AlertTriangle, CheckCircle, BarChart3, Award } from "lucide-react"
import { calculateMetrics, getHealthScoreInsight } from "@/lib/analytics-utils"
import { generateLocalAIInsights } from "@/lib/ai-insights-local"
import { detectAnomalies, analyzeTrends } from "@/lib/heuristic-analytics"
import type { Sale, Cost, Product, Customer } from "@/lib/types"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

export default function AICoachPage() {
  const searchParams = useSearchParams()
  const timeFrame = searchParams.get("timeFrame") || "lifetime"

  const [email, setEmail] = useState<string>("")
  const [sales, setSales] = useState<Sale[]>([])
  const [costs, setCosts] = useState<Cost[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      const supabase = createClient()

      try {
        const {
          data: { user },
        } = await supabase.auth.getUser()
        if (user) {
          setEmail(user.email || "")

          const endDate = new Date()
          const startDate = new Date()

          const isLifetime = timeFrame === "lifetime"

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

          const salesQuery = supabase.from("sales").select("*")
          if (!isLifetime) {
            salesQuery.gte("date", formattedStartDate).lte("date", formattedEndDate)
          }

          const costsQuery = supabase.from("costs").select("*")
          if (!isLifetime) {
            costsQuery.gte("date", formattedStartDate).lte("date", formattedEndDate)
          }

          const [{ data: salesData }, { data: costsData }, { data: productsData }, { data: customersData }] =
            await Promise.all([
              salesQuery,
              costsQuery,
              supabase.from("products").select("*"),
              supabase.from("customers").select("*"),
            ])

          setSales(salesData || [])
          setCosts(costsData || [])
          setProducts(productsData || [])
          setCustomers(customersData || [])
        }
      } catch (error) {
        console.error("Error fetching data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [timeFrame])

  const metrics = calculateMetrics(sales, costs, products, customers)
  const insights = generateLocalAIInsights(sales, costs, products, customers)
  const anomalies = detectAnomalies(sales, costs, products, customers, metrics)
  const trends = analyzeTrends(sales, costs, products, customers)

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-accent/10 rounded-lg">
            <Zap className="h-6 w-6 text-accent" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground">AI Coach Hub</h1>
            <p className="text-muted-foreground">Intelligent business insights powered by heuristic analytics</p>
          </div>
        </div>
        <DateFilter />
      </div>

      {loading ? (
        <div className="text-center py-12">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2 text-muted-foreground" />
          <p className="text-muted-foreground">Loading your business data...</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Summary Stats */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <Lightbulb className="h-8 w-8 text-amber-600 mx-auto mb-2" />
                  <p className="text-3xl font-bold">{insights.length}</p>
                  <p className="text-sm text-muted-foreground">Insights</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <AlertTriangle className="h-8 w-8 text-red-600 mx-auto mb-2" />
                  <p className="text-3xl font-bold">{anomalies.length}</p>
                  <p className="text-sm text-muted-foreground">Active Alerts</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <TrendingUp className="h-8 w-8 text-green-600 mx-auto mb-2" />
                  <p className="text-3xl font-bold">{trends.length}</p>
                  <p className="text-sm text-muted-foreground">Metrics</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="text-center cursor-help">
                        <BarChart3 className="h-8 w-8 text-primary mx-auto mb-2" />
                        <p className="text-3xl font-bold">{metrics.healthScore}</p>
                        <p className="text-sm text-muted-foreground">Health Score</p>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      <p className="font-semibold">Business Health Score</p>
                      <p className="text-xs mt-1">
                        Weighted index based on: Profit Margin (40%), Growth Trend (30%), Customer Retention (20%), Cost
                        Efficiency (10%)
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </CardContent>
            </Card>
          </div>

          {(() => {
            const healthInsight = getHealthScoreInsight(metrics.healthScore)
            return (
              <Card
                className="border-l-4"
                style={{
                  borderLeftColor: healthInsight.color.includes("green")
                    ? "#16a34a"
                    : healthInsight.color.includes("blue")
                      ? "#2563eb"
                      : healthInsight.color.includes("amber")
                        ? "#d97706"
                        : "#dc2626",
                }}
              >
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="h-5 w-5" />
                    Health Score Analysis: <span className={healthInsight.color}>{healthInsight.status}</span>
                  </CardTitle>
                  <CardDescription>{healthInsight.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold mb-2 text-sm">Score Breakdown:</h4>
                      <div className="grid gap-2 text-sm">
                        <div className="flex justify-between items-center p-2 bg-muted/50 rounded">
                          <span className="text-muted-foreground">Profit Margin (40%)</span>
                          <span className="font-medium">{metrics.profitMargin.toFixed(1)}%</span>
                        </div>
                        <div className="flex justify-between items-center p-2 bg-muted/50 rounded">
                          <span className="text-muted-foreground">Growth Trend (30%)</span>
                          <span className="font-medium">Calculated</span>
                        </div>
                        <div className="flex justify-between items-center p-2 bg-muted/50 rounded">
                          <span className="text-muted-foreground">Customer Retention (20%)</span>
                          <span className="font-medium">{metrics.retentionRate.toFixed(1)}%</span>
                        </div>
                        <div className="flex justify-between items-center p-2 bg-muted/50 rounded">
                          <span className="text-muted-foreground">Cost Efficiency (10%)</span>
                          <span className="font-medium">Calculated</span>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2 text-sm">Recommendations:</h4>
                      <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                        {healthInsight.recommendations.map((rec, idx) => (
                          <li key={idx}>{rec}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })()}

          {/* Insights */}
          {insights.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb className="h-5 w-5 text-amber-600" />
                  Key Insights
                </CardTitle>
                <CardDescription>AI-powered business recommendations</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {insights.map((insight, idx) => (
                    <div key={idx} className="p-4 bg-muted/50 rounded-lg border border-border">
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0">
                          {insight.category === "opportunity" && <TrendingUp className="h-5 w-5 text-green-600" />}
                          {insight.category === "risk" && <AlertTriangle className="h-5 w-5 text-red-600" />}
                          {insight.category === "optimization" && <Lightbulb className="h-5 w-5 text-amber-600" />}
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold">{insight.title}</p>
                          <p className="text-sm text-foreground/70 mt-1">{insight.description}</p>
                          <div className="mt-2 flex gap-2">
                            <span className="text-xs px-2 py-1 bg-background rounded capitalize font-semibold">
                              {insight.category}
                            </span>
                            <span
                              className={`text-xs px-2 py-1 rounded font-semibold ${
                                insight.impact === "high"
                                  ? "bg-red-500/10 text-red-700"
                                  : insight.impact === "medium"
                                    ? "bg-amber-500/10 text-amber-700"
                                    : "bg-blue-500/10 text-blue-700"
                              }`}
                            >
                              {insight.impact} impact
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Anomalies */}
          {anomalies.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                  Active Alerts
                </CardTitle>
                <CardDescription>Issues requiring your attention</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {anomalies.map((alert) => (
                    <div key={alert.id} className="p-4 bg-red-500/10 rounded-lg border border-red-500/20">
                      <div className="flex items-start gap-3">
                        <AlertTriangle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                        <div className="flex-1">
                          <p className="font-semibold">{alert.title}</p>
                          <p className="text-sm text-foreground/70 mt-1">{alert.description}</p>
                        </div>
                        <span className="text-xs font-bold text-red-600 whitespace-nowrap">{alert.impact}% impact</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {anomalies.length === 0 && insights.length > 0 && (
            <Card className="border-green-500/20 bg-green-500/5">
              <CardContent className="pt-6">
                <div className="text-center py-8">
                  <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-3" />
                  <p className="font-semibold">Excellent Business Health</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    No critical alerts detected. Your business is operating well!
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Feature Cards */}
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Opportunity Detection</CardTitle>
                <CardDescription>Growth and revenue chances</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-foreground/70">
                  AI Coach identifies high-potential products, customer segments, and market gaps to help you grow
                  revenue and market share.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Anomaly Detection</CardTitle>
                <CardDescription>Automatic problem identification</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-foreground/70">
                  Real-time monitoring for unusual patterns, profit anomalies, expense spikes, customer churn, and
                  product underperformance.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  )
}
