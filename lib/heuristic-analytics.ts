import type { Sale, Cost, Product, Customer, DashboardMetrics } from "./types"

export interface TrendAnalysis {
  metric: string
  current: number
  previous: number
  change: number
  changePercent: number
  trend: "up" | "down" | "stable"
}

export interface AnomalyAlert {
  id: string
  type: "high" | "medium" | "low"
  title: string
  description: string
  impact: number
  timestamp: Date
}

// Calculate trend analysis by comparing time periods
export function analyzeTrends(
  sales: Sale[],
  costs: Cost[],
  products: Product[],
  customers: Customer[],
): TrendAnalysis[] {
  const trends: TrendAnalysis[] = []
  const now = new Date()
  const currentPeriodStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
  const previousPeriodStart = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000)
  const previousPeriodEnd = currentPeriodStart

  // Revenue trend
  const currentRevenue = sales
    .filter((s) => new Date(s.date) >= currentPeriodStart && s.status === "completed")
    .reduce((sum, s) => sum + s.total_amount, 0)

  const previousRevenue = sales
    .filter((s) => {
      const date = new Date(s.date)
      return date >= previousPeriodStart && date < previousPeriodEnd && s.status === "completed"
    })
    .reduce((sum, s) => sum + s.total_amount, 0)

  trends.push({
    metric: "Revenue",
    current: currentRevenue,
    previous: previousRevenue,
    change: currentRevenue - previousRevenue,
    changePercent: previousRevenue > 0 ? ((currentRevenue - previousRevenue) / previousRevenue) * 100 : 0,
    trend: currentRevenue > previousRevenue ? "up" : currentRevenue < previousRevenue ? "down" : "stable",
  })

  // Cost trend
  const currentCosts = costs.filter((c) => new Date(c.date) >= currentPeriodStart).reduce((sum, c) => sum + c.amount, 0)

  const previousCosts = costs
    .filter((c) => {
      const date = new Date(c.date)
      return date >= previousPeriodStart && date < previousPeriodEnd
    })
    .reduce((sum, c) => sum + c.amount, 0)

  trends.push({
    metric: "Expenses",
    current: currentCosts,
    previous: previousCosts,
    change: currentCosts - previousCosts,
    changePercent: previousCosts > 0 ? ((currentCosts - previousCosts) / previousCosts) * 100 : 0,
    trend: currentCosts < previousCosts ? "up" : currentCosts > previousCosts ? "down" : "stable",
  })

  // Customer trend
  const currentCustomers = new Set(
    sales.filter((s) => new Date(s.date) >= currentPeriodStart && s.status === "completed").map((s) => s.customer_id),
  ).size

  const previousCustomers = new Set(
    sales
      .filter((s) => {
        const date = new Date(s.date)
        return date >= previousPeriodStart && date < previousPeriodEnd && s.status === "completed"
      })
      .map((s) => s.customer_id),
  ).size

  trends.push({
    metric: "Active Customers",
    current: currentCustomers,
    previous: previousCustomers,
    change: currentCustomers - previousCustomers,
    changePercent: previousCustomers > 0 ? ((currentCustomers - previousCustomers) / previousCustomers) * 100 : 0,
    trend: currentCustomers > previousCustomers ? "up" : currentCustomers < previousCustomers ? "down" : "stable",
  })

  // Order count trend
  const currentOrders = sales.filter((s) => new Date(s.date) >= currentPeriodStart && s.status === "completed").length

  const previousOrders = sales.filter((s) => {
    const date = new Date(s.date)
    return date >= previousPeriodStart && date < previousPeriodEnd && s.status === "completed"
  }).length

  trends.push({
    metric: "Orders",
    current: currentOrders,
    previous: previousOrders,
    change: currentOrders - previousOrders,
    changePercent: previousOrders > 0 ? ((currentOrders - previousOrders) / previousOrders) * 100 : 0,
    trend: currentOrders > previousOrders ? "up" : currentOrders < previousOrders ? "down" : "stable",
  })

  return trends
}

// Detect anomalies in business data
export function detectAnomalies(
  sales: Sale[],
  costs: Cost[],
  products: Product[],
  customers: Customer[],
  metrics: DashboardMetrics,
): AnomalyAlert[] {
  const alerts: AnomalyAlert[] = []

  // Detect profit anomaly
  if (metrics.netProfit < 0 && metrics.totalRevenue > 0) {
    alerts.push({
      id: "profit-negative",
      type: "high",
      title: "Negative Profit Alert",
      description: `Your business is operating at a loss with ${metrics.netProfit.toFixed(0)} in negative profit.`,
      impact: 95,
      timestamp: new Date(),
    })
  }

  // Detect high expense ratio
  if (metrics.totalRevenue > 0) {
    const expenseRatio = metrics.totalExpenses / metrics.totalRevenue
    if (expenseRatio > 0.7) {
      alerts.push({
        id: "high-expenses",
        type: "high",
        title: "Expense Ratio Critical",
        description: `Expenses are ${(expenseRatio * 100).toFixed(0)}% of revenue. Healthy ratio is below 50%.`,
        impact: 85,
        timestamp: new Date(),
      })
    }
  }

  // Detect sudden revenue drop
  const lastWeekRevenue = sales
    .filter((s) => new Date(s.date) >= new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) && s.status === "completed")
    .reduce((sum, s) => sum + s.total_amount, 0)

  const previousWeekRevenue = sales
    .filter((s) => {
      const date = new Date(s.date)
      return (
        date >= new Date(Date.now() - 14 * 24 * 60 * 60 * 1000) &&
        date < new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) &&
        s.status === "completed"
      )
    })
    .reduce((sum, s) => sum + s.total_amount, 0)

  if (previousWeekRevenue > 0 && lastWeekRevenue < previousWeekRevenue * 0.5) {
    alerts.push({
      id: "revenue-drop",
      type: "high",
      title: "Sudden Revenue Drop",
      description: `Revenue dropped by ${(((previousWeekRevenue - lastWeekRevenue) / previousWeekRevenue) * 100).toFixed(0)}% compared to last week.`,
      impact: 80,
      timestamp: new Date(),
    })
  }

  // Detect high variability in sales
  if (sales.length > 5) {
    const amounts = sales.filter((s) => s.status === "completed").map((s) => s.total_amount)
    const avg = amounts.reduce((a, b) => a + b, 0) / amounts.length
    const variance = amounts.reduce((sum, x) => sum + Math.pow(x - avg, 2), 0) / amounts.length
    const stdDev = Math.sqrt(variance)
    const cv = stdDev / avg // Coefficient of variation

    if (cv > 1.5) {
      alerts.push({
        id: "high-volatility",
        type: "medium",
        title: "High Sales Volatility",
        description: `Your sales show high variability (${(cv * 100).toFixed(0)}% CV). This indicates inconsistent customer demand.`,
        impact: 60,
        timestamp: new Date(),
      })
    }
  }

  // Detect inactive customers
  const inactiveCustomers = customers.filter((c) => {
    if (!c.last_order_date) return true
    const daysInactive = (new Date().getTime() - new Date(c.last_order_date).getTime()) / (1000 * 60 * 60 * 24)
    return daysInactive > 60
  })

  if (inactiveCustomers.length > customers.length * 0.3) {
    alerts.push({
      id: "inactive-customers",
      type: "medium",
      title: "High Customer Churn",
      description: `${inactiveCustomers.length} customers are inactive for over 60 days. Consider retention campaigns.`,
      impact: 70,
      timestamp: new Date(),
    })
  }

  // Detect low inventory productivity
  const lowProductivityProducts = products.filter((p) => {
    const sales_count = sales.filter((s) => s.product_id === p.id && s.status === "completed").length
    return sales_count === 0 && products.length > 1
  })

  if (lowProductivityProducts.length > 0) {
    alerts.push({
      id: "low-productivity",
      type: "medium",
      title: "Underperforming Products",
      description: `${lowProductivityProducts.length} products have zero sales. Consider discontinuing or promoting them.`,
      impact: 50,
      timestamp: new Date(),
    })
  }

  return alerts.sort((a, b) => b.impact - a.impact).slice(0, 5)
}
