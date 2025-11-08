"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { useSearchParams } from "next/navigation"
import { DateFilter } from "@/components/dashboard/date-filter"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2, Bell, Trash2, CheckCircle, AlertTriangle, AlertCircle, Info, Filter, RotateCcw } from "lucide-react"
import { calculateMetrics } from "@/lib/analytics-utils"
import { detectAnomalies } from "@/lib/heuristic-analytics"
import type { Sale, Cost, Product, Customer, DashboardMetrics } from "@/lib/types"
import type { AnomalyAlert } from "@/lib/heuristic-analytics"

export default function NotificationsPage() {
  const searchParams = useSearchParams()
  const timeFrame = searchParams.get("timeFrame") || "lifetime"

  const [userId, setUserId] = useState<string>("")
  const [sales, setSales] = useState<Sale[]>([])
  const [costs, setCosts] = useState<Cost[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null)
  const [anomalies, setAnomalies] = useState<AnomalyAlert[]>([])
  const [dismissedAlerts, setDismissedAlerts] = useState<Set<string>>(new Set())
  const [filterType, setFilterType] = useState<"all" | "high" | "medium" | "low">("all")
  const [showDismissed, setShowDismissed] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadDismissedAlerts = async (supabase: ReturnType<typeof createClient>, uid: string) => {
    try {
      const { data, error } = await supabase.from("dismissed_alerts").select("alert_id").eq("user_id", uid)

      if (error) {
        console.error("[v0] Error loading dismissed alerts:", error)
        return
      }

      if (data) {
        setDismissedAlerts(new Set(data.map((d) => d.alert_id)))
      }
    } catch (err) {
      console.error("[v0] Exception loading dismissed alerts:", err)
    }
  }

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      setError(null)
      const supabase = createClient()

      try {
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (!user) {
          setError("Please log in to view notifications")
          setLoading(false)
          return
        }

        setUserId(user.id)

        await loadDismissedAlerts(supabase, user.id)

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

        const [
          { data: salesData, error: salesError },
          { data: costsData, error: costsError },
          { data: productsData, error: productsError },
          { data: customersData, error: customersError },
        ] = await Promise.all([
          salesQuery,
          costsQuery,
          supabase.from("products").select("*"),
          supabase.from("customers").select("*"),
        ])

        if (salesError || costsError || productsError || customersError) {
          const errorMsg =
            salesError?.message || costsError?.message || productsError?.message || customersError?.message
          setError(`Error loading data: ${errorMsg}`)
          setLoading(false)
          return
        }

        setSales(salesData || [])
        setCosts(costsData || [])
        setProducts(productsData || [])
        setCustomers(customersData || [])

        const calculatedMetrics = calculateMetrics(
          salesData || [],
          costsData || [],
          productsData || [],
          customersData || [],
        )
        setMetrics(calculatedMetrics)

        const alerts = detectAnomalies(
          salesData || [],
          costsData || [],
          productsData || [],
          customersData || [],
          calculatedMetrics,
        )
        setAnomalies(alerts)
      } catch (error) {
        console.error("[v0] Error fetching data:", error)
        setError("Failed to load notifications. Please try again.")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [timeFrame])

  const dismissAlert = async (alertId: string) => {
    if (!userId) return

    const supabase = createClient()

    try {
      const { error } = await supabase.from("dismissed_alerts").insert({
        user_id: userId,
        alert_id: alertId,
      })

      if (error) {
        console.error("[v0] Error dismissing alert:", error)
        return
      }

      const newDismissed = new Set(dismissedAlerts)
      newDismissed.add(alertId)
      setDismissedAlerts(newDismissed)
    } catch (err) {
      console.error("[v0] Exception dismissing alert:", err)
    }
  }

  const clearAllDismissed = async () => {
    if (!userId) return

    const supabase = createClient()

    try {
      const { error } = await supabase.from("dismissed_alerts").delete().eq("user_id", userId)

      if (error) {
        console.error("[v0] Error clearing dismissed alerts:", error)
        return
      }

      setDismissedAlerts(new Set())
    } catch (err) {
      console.error("[v0] Exception clearing dismissed alerts:", err)
    }
  }

  const filteredAnomalies = anomalies.filter((alert) => {
    const isDismissed = dismissedAlerts.has(alert.id)

    if (showDismissed) {
      if (!isDismissed) return false
    } else {
      if (isDismissed) return false
    }

    if (filterType === "all") return true
    return alert.type === filterType
  })

  const getIcon = (type: string) => {
    switch (type) {
      case "high":
        return <AlertCircle className="h-6 w-6 text-red-600" />
      case "medium":
        return <AlertTriangle className="h-6 w-6 text-amber-600" />
      case "low":
      default:
        return <Info className="h-6 w-6 text-blue-600" />
    }
  }

  const getBackgroundColor = (type: string) => {
    switch (type) {
      case "high":
        return "bg-red-500/5 border-red-500/20 hover:bg-red-500/10"
      case "medium":
        return "bg-amber-500/5 border-amber-500/20 hover:bg-amber-500/10"
      case "low":
      default:
        return "bg-blue-500/5 border-blue-500/20 hover:bg-blue-500/10"
    }
  }

  const unreadCount = anomalies.filter((a) => !dismissedAlerts.has(a.id)).length
  const dismissedCount = dismissedAlerts.size

  if (error && !loading) {
    return (
      <div className="p-6">
        <Card className="border-red-500/20 bg-red-500/5">
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <AlertCircle className="h-12 w-12 text-red-600 mx-auto mb-4" />
              <p className="text-lg font-semibold text-red-600">Error Loading Notifications</p>
              <p className="text-muted-foreground mt-2">{error}</p>
              <Button onClick={() => window.location.reload()} className="mt-4">
                Retry
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-accent/10 rounded-lg">
              <Bell className="h-6 w-6 text-accent" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Notifications Center</h1>
              <p className="text-muted-foreground">AI-powered alerts and anomaly detection</p>
            </div>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-accent/10 rounded-lg">
            <Bell className="h-5 w-5 text-accent" />
            <span className="font-semibold">{unreadCount} Active Alerts</span>
          </div>
        </div>
        <DateFilter />
      </div>

      {loading ? (
        <div className="text-center py-12">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2 text-muted-foreground" />
          <p className="text-muted-foreground">Loading notifications...</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Statistics Cards */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground mb-2">High Priority</p>
                  <p className="text-3xl font-bold">
                    {anomalies.filter((a) => a.type === "high" && !dismissedAlerts.has(a.id)).length}
                  </p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground mb-2">Medium Priority</p>
                  <p className="text-3xl font-bold">
                    {anomalies.filter((a) => a.type === "medium" && !dismissedAlerts.has(a.id)).length}
                  </p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground mb-2">Low Priority</p>
                  <p className="text-3xl font-bold">
                    {anomalies.filter((a) => a.type === "low" && !dismissedAlerts.has(a.id)).length}
                  </p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground mb-2">Dismissed</p>
                  <p className="text-3xl font-bold">{dismissedCount}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filter and Actions */}
          <div className="flex gap-2 flex-wrap items-center">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Filter:</span>
            </div>
            {(["all", "high", "medium", "low"] as const).map((type) => (
              <Button
                key={type}
                size="sm"
                variant={filterType === type ? "default" : "outline"}
                onClick={() => setFilterType(type)}
                className="capitalize"
              >
                {type}
              </Button>
            ))}
            <div className="ml-auto flex gap-2">
              {dismissedCount > 0 && (
                <>
                  <Button
                    size="sm"
                    variant={showDismissed ? "default" : "outline"}
                    onClick={() => setShowDismissed(!showDismissed)}
                  >
                    {showDismissed ? "Show Active" : `Show Dismissed (${dismissedCount})`}
                  </Button>
                  <Button size="sm" variant="ghost" onClick={clearAllDismissed}>
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Clear All
                  </Button>
                </>
              )}
            </div>
          </div>

          {/* Alerts List */}
          {filteredAnomalies.length === 0 && !loading ? (
            <Card className="border-green-500/20 bg-green-500/5">
              <CardContent className="pt-6">
                <div className="text-center py-12">
                  <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
                  <p className="text-lg font-semibold">{showDismissed ? "No Dismissed Alerts" : "No Active Alerts"}</p>
                  <p className="text-muted-foreground mt-2">
                    {showDismissed
                      ? "You haven't dismissed any alerts yet."
                      : dismissedCount > 0
                        ? "All alerts have been dismissed. Your business is operating smoothly!"
                        : "No anomalies detected. Everything looks good!"}
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {filteredAnomalies.map((alert) => {
                const isDismissed = dismissedAlerts.has(alert.id)
                return (
                  <Card
                    key={alert.id}
                    className={`border transition-all hover:shadow-md ${getBackgroundColor(alert.type)} ${
                      isDismissed ? "opacity-60" : ""
                    }`}
                  >
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-4 flex-1">
                          <div className="flex-shrink-0 mt-0.5">{getIcon(alert.type)}</div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-lg">{alert.title}</h3>
                            <p className="text-foreground/70 mt-2">{alert.description}</p>
                            <div className="flex items-center gap-4 mt-4">
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-muted-foreground">Impact:</span>
                                <div className="flex-1 w-24 h-1.5 bg-background rounded-full">
                                  <div
                                    className={`h-full rounded-full ${
                                      alert.type === "high"
                                        ? "bg-red-600"
                                        : alert.type === "medium"
                                          ? "bg-amber-600"
                                          : "bg-blue-600"
                                    }`}
                                    style={{ width: `${alert.impact}%` }}
                                  />
                                </div>
                                <span className="text-xs font-semibold ml-2">{alert.impact}%</span>
                              </div>
                              <span className="text-xs text-muted-foreground ml-auto">
                                {new Date(alert.timestamp).toLocaleTimeString()}
                              </span>
                            </div>
                          </div>
                        </div>
                        {!isDismissed && (
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => dismissAlert(alert.id)}
                            className="text-muted-foreground hover:text-foreground flex-shrink-0"
                          >
                            <Trash2 className="h-5 w-5" />
                          </Button>
                        )}
                        {isDismissed && (
                          <span className="text-xs text-muted-foreground px-2 py-1 bg-background rounded">
                            Dismissed
                          </span>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}

          {/* Alert Guidelines */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Alert Severity Guide</CardTitle>
              <CardDescription>Understanding alert levels</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-sm">High Priority</p>
                    <p className="text-sm text-foreground/70">
                      Requires immediate action. Critical to business operations.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-sm">Medium Priority</p>
                    <p className="text-sm text-foreground/70">
                      Should be addressed soon. May impact business performance.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Info className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-sm">Low Priority</p>
                    <p className="text-sm text-foreground/70">Informational. Monitor for trends but not urgent.</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
