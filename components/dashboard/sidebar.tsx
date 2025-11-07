"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import {
  BarChart3,
  Package,
  ShoppingCart,
  Users,
  DollarSign,
  LogOut,
  Zap,
  Upload,
  Bell,
  Settings,
  Database,
} from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"
import { Separator } from "@/components/ui/separator"

export function Sidebar({ isCollapsed }: { isCollapsed: boolean }) {
  const pathname = usePathname()
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const supabase = createClient()
        const {
          data: { user },
        } = await supabase.auth.getUser()
        setUser(user)
      } catch (error) {
        console.error("[v0] Failed to fetch user:", error)
      }
    }
    fetchUser()
  }, [])

  const isActive = (path: string) => pathname === path

  const navGroups = [
    {
      title: "Overview",
      links: [
        { href: "/dashboard/overview", label: "Dashboard", icon: BarChart3 },
        { href: "/dashboard/analytics", label: "Analytics", icon: BarChart3 },
      ],
    },
    {
      title: "Tools",
      links: [
        { href: "/dashboard/ai-coach", label: "AI Coach", icon: Zap },
        { href: "/dashboard/notifications", label: "Notifications", icon: Bell },
      ],
    },
    {
      title: "Store",
      links: [
        { href: "/dashboard/products", label: "Products", icon: Package },
        { href: "/dashboard/sales", label: "Sales", icon: ShoppingCart },
        { href: "/dashboard/customers", label: "Customers", icon: Users },
        { href: "/dashboard/costs", label: "Costs", icon: DollarSign },
      ],
    },
    {
      title: "Data Management",
      links: [
        { href: "/dashboard/import", label: "Bulk Import", icon: Upload },
        { href: "/dashboard/data", label: "Data", icon: Database },
      ],
    },
    {
      title: "Configuration",
      links: [{ href: "/dashboard/settings", label: "Settings", icon: Settings }],
    },
  ]

  const handleLogout = async () => {
    setLoading(true)
    try {
      const supabase = createClient()
      await supabase.auth.signOut()
      router.push("/auth/login")
    } catch (error) {
      console.error("Logout error:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <aside
      className={cn(
        "border-r bg-card flex flex-col h-screen sticky top-0 overflow-hidden transition-all duration-300 ease-in-out",
        isCollapsed ? "w-20" : "w-64",
      )}
    >
      {/* Brand Section */}
      <div className={cn("p-6 border-b transition-all", isCollapsed ? "p-4" : "p-6")}>
        <div className={cn("flex items-center gap-3", isCollapsed && "justify-center")}>
          <div className="w-10 h-10 bg-linear-to-br from-primary to-blue-400 rounded-lg flex items-center justify-center shadow-lg shrink-0">
            <span className="text-white font-bold text-lg">L</span>
          </div>
          <div className={cn("flex-1", isCollapsed && "hidden")}>
            <h1 className="text-lg font-bold text-foreground">LynqIQ</h1>
            <p className="text-xs text-muted-foreground">Business System</p>
          </div>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className={cn("flex-1 overflow-y-auto px-3 py-4 space-y-4", isCollapsed && "px-2")}>
        {navGroups.map((group) => (
          <div key={group.title}>
            {isCollapsed ? (
              <Separator className="my-3" />
            ) : (
              <h3 className="px-4 mb-2 text-xs uppercase text-muted-foreground tracking-wider font-semibold">
                {group.title}
              </h3>
            )}
            <div className="space-y-1">
              {group.links.map(({ href, label, icon: Icon }) => (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    "flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all duration-150",
                    isActive(href)
                      ? "bg-primary text-primary-foreground shadow-sm font-semibold"
                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground font-medium",
                    isCollapsed && "justify-center",
                  )}
                >
                  <Icon className="h-5 w-5 shrink-0" />
                  <span className={cn("font-medium text-sm", isCollapsed && "hidden")}>{label}</span>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* User Profile & Logout Section */}
      <div className={cn("border-t p-4 space-y-3", isCollapsed && "p-2")}>
        {user && (
          <div className={cn("px-2 py-2 bg-accent rounded-lg", isCollapsed && "hidden")}>
            <p className="text-xs text-muted-foreground uppercase tracking-wide font-semibold mb-1">Logged in as</p>
            <p className="text-sm font-semibold text-foreground truncate">{user.email}</p>
          </div>
        )}

        <button
          onClick={handleLogout}
          disabled={loading}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg bg-destructive/10 hover:bg-destructive/20 text-destructive transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed font-medium text-sm active:scale-95"
        >
          <LogOut className="h-5 w-5 shrink-0" />
          <span className={cn(isCollapsed && "hidden")}>{loading ? "Logging out..." : "Logout"}</span>
        </button>
      </div>
    </aside>
  )
}
