export interface Product {
  id: string
  user_id: string
  name: string
  category: string
  cost_price: number
  sell_price: number
  image_url?: string
  created_at: string
  updated_at: string
}

export interface Customer {
  id: string
  user_id: string
  name: string
  phone?: string
  address?: string
  age?: number
  location?: string
  total_orders: number
  total_spent: number
  last_order_date?: string
  canceled_orders: number
  created_at: string
  updated_at: string
}

export interface Sale {
  id: string
  user_id: string
  date: string
  customer_id: string
  product_id: string
  quantity: number
  unit_price: number
  total_amount: number
  status: "completed" | "pending" | "canceled"
  sales_channel?: string
  created_at: string
  updated_at: string
}

export interface Cost {
  id: string
  user_id: string
  date: string
  category: string
  amount: number
  description?: string
  created_at: string
  updated_at: string
}

export interface DashboardMetrics {
  totalRevenue: number
  totalExpenses: number
  grossProfit: number
  netProfit: number
  profitMargin: number
  roi: number
  totalSales: number
  totalCustomers: number
  aov: number
  topProduct?: Product
  healthScore: number
  clv: number
  cac: number
  churnRate: number
  retentionRate: number
  salesByCategory: Record<string, number>
  salesByChannel: Record<string, number>
  topCustomers: Customer[]
  worstSellingProducts: Product[]
}

export interface AIInsight {
  title: string
  description: string
  category: "opportunity" | "risk" | "optimization" | "strategy"
  impact: "high" | "medium" | "low"
}
