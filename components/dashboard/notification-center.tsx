"use client"

import { useState, useEffect } from "react"
import { AlertTriangle, TrendingUp, Zap, Bell } from "lucide-react"
import type { Sale, Cost, Product, Customer } from "@/lib/types"
import { createClient } from "@/lib/supabase/client"

interface Notification {
  id: string
  type: "warning" | "success" | "info"
  title: string
  message: string
  timestamp: Date
}

export function NotificationCenter() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      const supabase = createClient()
      const { data: sales } = await supabase.from("sales").select("*")
      const { data: costs } = await supabase.from("costs").select("*")
      const { data: products } = await supabase.from("products").select("*")
      const { data: customers } = await supabase.from("customers").select("*")

      const detectAnomalies = () => {
        const newNotifications: Notification[] = []

        // Check for unusual sales patterns
        if (sales && sales.length > 0) {
          const avgSale = sales.reduce((sum: number, s: Sale) => sum + s.total_amount, 0) / sales.length
          const unusualSales = sales.filter((s: Sale) => s.total_amount > avgSale * 2)

          if (unusualSales.length > 0) {
            newNotifications.push({
              id: "high-sales",
              type: "success",
              title: "Unusual High Sales",
              message: `${unusualSales.length} sales exceed average by 2x - Great performance!`,
              timestamp: new Date(),
            })
          }
        }

        // Check for high expenses
        if (sales && costs) {
          const totalExpenses = costs.reduce((sum: number, c: Cost) => sum + c.amount, 0)
          const totalRevenue = sales.reduce((sum: number, s: Sale) => sum + s.total_amount, 0)

          if (totalRevenue > 0) {
            const expenseRatio = totalExpenses / totalRevenue
            if (expenseRatio > 0.6) {
              newNotifications.push({
                id: "high-expenses",
                type: "warning",
                title: "High Expense Ratio",
                message: `Expenses are ${(expenseRatio * 100).toFixed(1)}% of revenue - Consider cost optimization`,
                timestamp: new Date(),
              })
            }
          }
        }

        // Check for inactive customers
        if (customers) {
          const inactiveCustomers = customers.filter((c: Customer) => {
            const lastOrder = c.last_order_date ? new Date(c.last_order_date) : null
            return lastOrder && new Date().getTime() - lastOrder.getTime() > 30 * 24 * 60 * 60 * 1000
          })

          if (inactiveCustomers.length > 0) {
            newNotifications.push({
              id: "inactive-customers",
              type: "info",
              title: "Inactive Customers",
              message: `${inactiveCustomers.length} customers haven't ordered in 30+ days`,
              timestamp: new Date(),
            })
          }
        }

        // Check for underperforming products
        if (products) {
          const lowMarginProducts = products.filter((p: Product) => {
            const margin = ((p.sell_price - p.cost_price) / p.sell_price) * 100
            return margin < 10
          })

          if (lowMarginProducts.length > 0) {
            newNotifications.push({
              id: "low-margin-products",
              type: "warning",
              title: "Low Margin Products",
              message: `${lowMarginProducts.length} products have margins below 10%`,
              timestamp: new Date(),
            })
          }
        }

        setNotifications(newNotifications)
      }

      detectAnomalies()
    }

    fetchData()
  }, [])

  const getIcon = (type: string) => {
    switch (type) {
      case "warning":
        return <AlertTriangle className="h-5 w-5 text-destructive" />
      case "success":
        return <TrendingUp className="h-5 w-5 text-green-600" />
      case "info":
      default:
        return <Zap className="h-5 w-5 text-primary" />
    }
  }

  return (
    <div className="relative">
      <button onClick={() => setOpen(!open)} className="relative p-2 hover:bg-muted rounded-lg transition-colors">
        <Bell className="h-5 w-5" />
        {notifications.length > 0 && (
          <span className="absolute top-0 right-0 w-2 h-2 bg-destructive rounded-full"></span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-96 max-h-96 overflow-y-auto bg-card border border-border rounded-lg shadow-lg z-50">
          <div className="p-4 border-b border-border">
            <h3 className="font-semibold">Notifications ({notifications.length})</h3>
          </div>

          {notifications.length === 0 ? (
            <div className="p-6 text-center text-muted-foreground">
              <p>No alerts at this time. Your business is looking good!</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {notifications.map((notif) => (
                <div key={notif.id} className="p-4 hover:bg-muted/50 transition-colors">
                  <div className="flex items-start gap-3">
                    {getIcon(notif.type)}
                    <div className="flex-1">
                      <p className="font-medium text-sm">{notif.title}</p>
                      <p className="text-sm text-muted-foreground mt-1">{notif.message}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
