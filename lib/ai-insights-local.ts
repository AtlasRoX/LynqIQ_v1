import type { Sale, Cost, Product, Customer } from "./types"

export interface AIInsight {
  title: string
  description: string
  category: "opportunity" | "risk" | "optimization" | "strategy"
  impact: "high" | "medium" | "low"
}

export function generateLocalAIInsights(
  sales: Sale[],
  costs: Cost[],
  products: Product[],
  customers: Customer[],
): AIInsight[] {
  const insights: AIInsight[] = []

  // Calculate key metrics
  const totalRevenue = sales.filter((s) => s.status === "completed").reduce((sum, s) => sum + s.total_amount, 0)
  const totalExpenses = costs.reduce((sum, c) => sum + c.amount, 0)
  const netProfit = totalRevenue - totalExpenses
  const completedSales = sales.filter((s) => s.status === "completed")
  const avgOrderValue = completedSales.length > 0 ? totalRevenue / completedSales.length : 0

  // OPPORTUNITIES
  if (customers.length > 0) {
    const inactiveCount = customers.filter((c) => {
      if (!c.last_order_date) return true
      const daysInactive = (new Date().getTime() - new Date(c.last_order_date).getTime()) / (1000 * 60 * 60 * 24)
      return daysInactive > 30
    }).length

    if (inactiveCount > 0) {
      insights.push({
        title: "Customer Re-engagement Opportunity",
        description: `You have ${inactiveCount} inactive customers. Running a targeted re-engagement campaign could recover dormant revenue.`,
        category: "opportunity",
        impact: "high",
      })
    }
  }

  // Check for upsell opportunities
  if (customers.length > 0 && products.length > 1) {
    const highValueCustomers = customers.filter((c) => c.total_spent && c.total_spent > avgOrderValue * 5)
    if (highValueCustomers.length > 0) {
      insights.push({
        title: "Premium Product Upsell",
        description: `${highValueCustomers.length} high-value customers are ideal for premium product recommendations.`,
        category: "opportunity",
        impact: "medium",
      })
    }
  }

  // RISKS
  if (totalRevenue > 0) {
    const expenseRatio = totalExpenses / totalRevenue
    if (expenseRatio > 0.6) {
      insights.push({
        title: "High Expense Ratio Alert",
        description: `Expenses are ${(expenseRatio * 100).toFixed(1)}% of revenue. Target is <50%. Review cost structure immediately.`,
        category: "risk",
        impact: "high",
      })
    }
  }

  // Check for negative profit
  if (netProfit < 0) {
    insights.push({
      title: "Profitability Crisis",
      description: "Your business is operating at a loss. Reduce expenses or increase prices urgently.",
      category: "risk",
      impact: "high",
    })
  }

  // Check for product concentration risk
  if (products.length > 0) {
    const productSales: Record<string, number> = {}
    completedSales.forEach((s) => {
      productSales[s.product_id] = (productSales[s.product_id] || 0) + s.total_amount
    })

    const totalProductRevenue = Object.values(productSales).reduce((a, b) => a + b, 0)
    if (totalProductRevenue > 0) {
      const topProductRevenue = Math.max(...Object.values(productSales))
      const concentration = (topProductRevenue / totalProductRevenue) * 100

      if (concentration > 70) {
        insights.push({
          title: "Revenue Concentration Risk",
          description: `${concentration.toFixed(0)}% of revenue comes from one product. Diversify to reduce risk.`,
          category: "risk",
          impact: "medium",
        })
      }
    }
  }

  // OPTIMIZATIONS
  const lowMarginProducts = products.filter((p) => {
    const margin = ((p.sell_price - p.cost_price) / p.sell_price) * 100
    return margin < 15
  })

  if (lowMarginProducts.length > 0) {
    insights.push({
      title: "Low Margin Product Review",
      description: `${lowMarginProducts.length} products have margins below 15%. Consider price increases or cost reduction.`,
      category: "optimization",
      impact: "medium",
    })
  }

  // Check for cost categories optimization
  if (costs.length > 10) {
    const costByCategory: Record<string, number> = {}
    costs.forEach((c) => {
      costByCategory[c.category] = (costByCategory[c.category] || 0) + c.amount
    })

    const topCost = Object.entries(costByCategory).sort(([, a], [, b]) => b - a)[0]
    if (topCost && topCost[1] > totalRevenue * 0.3) {
      insights.push({
        title: "Cost Category Optimization",
        description: `${topCost[0]} expenses are ${((topCost[1] / totalRevenue) * 100).toFixed(1)}% of revenue. Review for reduction opportunities.`,
        category: "optimization",
        impact: "medium",
      })
    }
  }

  // STRATEGIES
  if (completedSales.length > 0) {
    const avgSale = totalRevenue / completedSales.length
    const highValueSales = completedSales.filter((s) => s.total_amount > avgSale * 1.5)

    if (highValueSales.length > 0 && highValueSales.length / completedSales.length > 0.1) {
      insights.push({
        title: "Focus on High-Value Transactions",
        description: `${((highValueSales.length / completedSales.length) * 100).toFixed(0)}% of sales are high-value. Optimize for these customers.`,
        category: "strategy",
        impact: "high",
      })
    }
  }

  // Growth strategy
  if (completedSales.length > 50) {
    insights.push({
      title: "Scale Growth Strategy",
      description: "Your sales volume is healthy. Consider scaling marketing efforts to accelerate growth.",
      category: "strategy",
      impact: "high",
    })
  } else if (completedSales.length > 10) {
    insights.push({
      title: "Build Sales Foundation",
      description: "Establish customer base expansion while optimizing current operations for profitability.",
      category: "strategy",
      impact: "medium",
    })
  }

  return insights
}
