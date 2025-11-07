"use client"

import { useEffect, useState, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2, Zap, TrendingUp, AlertTriangle, Lightbulb, Target, CheckCircle, Sparkles } from "lucide-react"
// --- IMPORT THE LOCAL FUNCTION ---
import { generateLocalAIInsights } from "@/lib/ai-insights-local"
import { detectAnomalies, analyzeTrends } from "@/lib/heuristic-analytics"
import type { DashboardMetrics, Sale, Cost, Product, Customer, AIInsight } from "@/lib/types"
import type { AnomalyAlert } from "@/lib/heuristic-analytics"

interface AICoachProps {
  metrics: DashboardMetrics
  sales: Sale[]
  costs: Cost[]
  products: Product[]
  customers: Customer[]
}

export function AICoach({ metrics, sales, costs, products, customers }: AICoachProps) {
  const [insights, setInsights] = useState<AIInsight[]>([])
  const [anomalies, setAnomalies] = useState<AnomalyAlert[]>([])
  const [trends, setTrends] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<"insights" | "anomalies" | "trends">("insights")

  const generateAnalysis = useCallback(async () => {
    setLoading(true);
    try {
      // --- REPLACED FETCH WITH LOCAL FUNCTIONS ---
      const localInsights = generateLocalAIInsights(sales, costs, products, customers);
      setInsights(localInsights || []);
      
      const newAnomalies = detectAnomalies(sales, costs, products, customers, metrics)
      const newTrends = analyzeTrends(sales, costs, products, customers)
      setAnomalies(newAnomalies || []);
      setTrends(newTrends || []);
      // --- END OF REPLACEMENT ---

    } catch (error) {
      console.error("Error generating local insights:", error);
    } finally {
      setLoading(false);
    }
  }, [sales, costs, products, customers, metrics]); // metrics was missing from dependency array

  useEffect(() => {
    if (metrics) {
      generateAnalysis()
    }
  }, [generateAnalysis, metrics]) // metrics was already here, which is correct

  if (!metrics) {
    return (
        <Card className="lg:col-span-1">
            <CardHeader>
                <CardTitle>AI Coach</CardTitle>
                <CardDescription>Smart business insights & anomaly detection</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="text-center py-16 text-muted-foreground">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div>
                    <p className="mt-4">Loading AI Coach...</p>
                </div>
            </CardContent>
        </Card>
    )
  }

  const getInsightIcon = (category: string) => {
    switch (category) {
      case "opportunity":
        return <TrendingUp className="h-5 w-5 text-green-600" />
      case "risk":
        return <AlertTriangle className="h-5 w-5 text-destructive" />
      case "optimization":
        return <Lightbulb className="h-5 w-5 text-amber-600" />
      case "strategy":
        return <Target className="h-5 w-5 text-primary" />
      default:
        return <Zap className="h-5 w-5" />
    }
  }

  const impactColor = (impact: string) => {
    switch (impact) {
      case "high":
        return "bg-red-500/10 border-red-500/20"
      case "medium":
        return "bg-amber-500/10 border-amber-500/20"
      case "low":
        return "bg-blue-500/10 border-blue-500/20"
      default:
        return "bg-muted"
    }
  }

  const anomalyColor = (type: string) => {
    switch (type) {
      case "high":
        return "bg-red-500/10 border-red-500/20"
      case "medium":
        return "bg-amber-500/10 border-amber-500/20"
      case "low":
        return "bg-blue-500/10 border-blue-500/20"
      default:
        return "bg-muted"
    }
  }

  return (
    <Card className="lg:col-span-1">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-accent/10 rounded-lg">
              <Sparkles className="h-5 w-5 text-accent" />
            </div>
            <div>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                AI Coach
              </CardTitle>
              <CardDescription>Smart business insights & anomaly detection</CardDescription>
            </div>
          </div>
          <Button size="sm" onClick={generateAnalysis} disabled={loading} variant="outline">
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Refresh
              </>
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {/* Tab Navigation */}
        <div className="flex gap-2 mb-4 border-b border-border">
          <button
            onClick={() => setActiveTab("insights")}
            className={`px-3 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === "insights"
                ? "border-accent text-accent"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <div className="flex items-center gap-2">
              <Lightbulb className="h-4 w-4" />
              Insights ({insights.length})
            </div>
          </button>
          <button
            onClick={() => setActiveTab("anomalies")}
            className={`px-3 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === "anomalies"
                ? "border-accent text-accent"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Alerts ({anomalies.length})
            </div>
          </button>
          <button
            onClick={() => setActiveTab("trends")}
            className={`px-3 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === "trends"
                ? "border-accent text-accent"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Trends ({trends.length})
            </div>
          </button>
        </div>

        {/* Content Area */}
        {loading && insights.length === 0 && anomalies.length === 0 && (
          <div className="text-center py-8">
            <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Analyzing your business data...</p>
          </div>
        )}

        {/* Insights Tab */}
        {activeTab === "insights" && (
          <div className="space-y-3">
            {insights.length === 0 && !loading && (
              <div className="text-center py-8 text-muted-foreground">
                <p className="text-sm">Add products, customers, and sales data to get AI insights</p>
              </div>
            )}

            {insights.map((insight, idx) => (
              <div key={idx} className={`p-4 rounded-lg border ${impactColor(insight.impact)} flex gap-3`}>
                <div className="shrink-0 pt-0.5">{getInsightIcon(insight.category)}</div>
                <div className="flex-1">
                  <p className="font-semibold text-sm">{insight.title}</p>
                  <p className="text-sm text-foreground/70 mt-1">{insight.description}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-xs px-2 py-1 bg-background/50 rounded font-semibold capitalize">
                      {insight.category}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Anomalies Tab */}
        {activeTab === "anomalies" && (
          <div className="space-y-3">
            {anomalies.length === 0 && !loading && (
              <div className="text-center py-8 text-muted-foreground">
                <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-600" />
                <p className="text-sm">No anomalies detected. Your business is healthy!</p>
              </div>
            )}

            {anomalies.map((alert) => (
              <div key={alert.id} className={`p-4 rounded-lg border ${anomalyColor(alert.type)} flex gap-3`}>
                <div className="shrink-0 pt-0.5">
                  {alert.type === "high" ? (
                    <AlertTriangle className="h-5 w-5 text-red-600" />
                  ) : alert.type === "medium" ? (
                    <AlertTriangle className="h-5 w-5 text-amber-600" />
                  ) : (
                    <Zap className="h-5 w-5 text-blue-600" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-semibold text-sm">{alert.title}</p>
                      <p className="text-sm text-foreground/70 mt-1">{alert.description}</p>
                    </div>
                    <span
                      className={`text-xs font-bold whitespace-nowrap ${
                        alert.type === "high"
                          ? "text-red-600"
                          : alert.type === "medium"
                            ? "text-amber-600"
                            : "text-blue-600"
                      }`}
                    >
                      {alert.impact}% impact
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Trends Tab */}
        {activeTab === "trends" && (
          <div className="space-y-3">
            {trends.length === 0 && !loading && (
              <div className="text-center py-8 text-muted-foreground">
                <p className="text-sm">Insufficient data for trend analysis</p>
              </div>
            )}

            {trends.map((trend, idx) => (
              <div key={idx} className="p-4 rounded-lg bg-muted/50 border border-border">
                <div className="flex items-center justify-between mb-2">
                  <p className="font-semibold text-sm">{trend.metric}</p>
                  <div
                    className={`text-sm font-bold ${
                      trend.trend === "up"
                        ? "text-green-600"
                        : trend.trend === "down"
                          ? "text-red-600"
                          : "text-gray-600"
                    }`}
                  >
                    {trend.trend === "up" ? "↑" : trend.trend === "down" ? "↓" : "→"} {trend.changePercent.toFixed(1)}%
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mb-2">
                  Current: {typeof trend.current === "number" ? trend.current.toFixed(0) : trend.current} | Prior:{" "}
                  {trend.previous.toFixed(0)}
                </p>
                <div className="w-full bg-background rounded-full h-1.5">
                  <div
                    className={`h-full rounded-full ${
                      trend.trend === "up" ? "bg-green-600" : trend.trend === "down" ? "bg-red-600" : "bg-gray-400"
                    }`}
                    style={{ width: `${Math.min(Math.abs(trend.changePercent) * 2, 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
