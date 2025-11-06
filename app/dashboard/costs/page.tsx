"use client"

import { useEffect, useState, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"
import { AddButton } from "@/components/dashboard/add-button"
import { DataTable } from "@/components/dashboard/data-table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { Cost } from "@/lib/types"
import { formatCurrency } from "@/lib/utils"
import { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown, MoreHorizontal } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export default function CostsPage() {
  const [email, setEmail] = useState<string>("")
  const [costs, setCosts] = useState<Cost[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split("T")[0],
    category: "",
    amount: "",
    description: "",
  })

  const fetchCosts = useCallback(async () => {
    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (user) {
      setEmail(user.email || "")
      const { data } = await supabase.from("costs").select("*").order("date", { ascending: false })
      setCosts(data || [])
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchCosts()
  }, [fetchCosts])

  const handleAddCost = async () => {
    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return

    try {
      if (editingId) {
        await supabase
          .from("costs")
          .update({
            date: formData.date,
            category: formData.category,
            amount: Number.parseFloat(formData.amount),
            description: formData.description,
            updated_at: new Date().toISOString(),
          })
          .eq("id", editingId)
      } else {
        await supabase.from("costs").insert({
          user_id: user.id,
          date: formData.date,
          category: formData.category,
          amount: Number.parseFloat(formData.amount),
          description: formData.description,
        })
      }

      setFormData({
        date: new Date().toISOString().split("T")[0],
        category: "",
        amount: "",
        description: "",
      })
      setEditingId(null)
      setShowForm(false)
      fetchCosts()
    } catch (error) {
      console.error("Error saving cost:", error)
    }
  }

  const handleEditCost = (cost: Cost) => {
    setFormData({
      date: cost.date,
      category: cost.category,
      amount: cost.amount.toString(),
      description: cost.description || "",
    })
    setEditingId(cost.id)
    setShowForm(true)
  }

  const handleDeleteCost = async (cost: Cost) => {
    const supabase = createClient()
    await supabase.from("costs").delete().eq("id", cost.id)
    fetchCosts()
  }

  const columns: ColumnDef<Cost>[] = [
    {
      accessorKey: "date",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Date
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
    },
    {
      accessorKey: "category",
      header: "Category",
    },
    {
      accessorKey: "amount",
      header: () => <div className="text-right">Amount</div>,
      cell: ({ row }) => {
        const amount = parseFloat(row.getValue("amount"))
        return <div className="text-right font-medium">{formatCurrency(amount, "BDT")}</div>
      },
    },
    {
      accessorKey: "description",
      header: "Description",
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const cost = row.original
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => handleEditCost(cost)}>
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleDeleteCost(cost)}>
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ]

  return (
    <div className="p-6 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Costs & Expenses</h1>
            <p className="text-muted-foreground">Track your business expenses</p>
          </div>
          <AddButton
            onClick={() => {
              setShowForm(!showForm)
              setEditingId(null)
            }}
            label="Add Cost"
          />
        </div>

        {showForm && (
          <Card>
            <CardHeader>
              <CardTitle>{editingId ? "Edit Cost" : "Add New Cost"}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="date">Date</Label>
                  <Input
                    id="date"
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Input
                    id="category"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    placeholder="e.g., Rent, Supplies"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="amount">Amount (৳)</Label>
                  <Input
                    id="amount"
                    type="number"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    placeholder="0"
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="description">Description</Label>
                  <Input
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Optional details"
                  />
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                <Button onClick={handleAddCost}>{editingId ? "Update" : "Add"}</Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowForm(false)
                    setEditingId(null)
                  }}
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {loading ? (
          <div className="text-center py-12 text-muted-foreground">Loading costs...</div>
        ) : (
          <DataTable
            title="All Costs"
            columns={columns}
            data={costs}
          />
        )}
    </div>
  )
}