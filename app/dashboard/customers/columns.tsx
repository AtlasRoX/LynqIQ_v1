"use client"

import type { ColumnDef } from "@tanstack/react-table"
import type { Customer } from "@/lib/types"

export const getCustomerColumns = (): ColumnDef<Customer>[] => [
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => <div className="font-medium">{row.getValue("name")}</div>,
  },
  {
    accessorKey: "phone",
    header: "Phone",
    cell: ({ row }) => <div>{row.getValue("phone") || "N/A"}</div>,
  },
  {
    accessorKey: "location",
    header: "Location",
    cell: ({ row }) => <div>{row.getValue("location") || "N/A"}</div>,
  },
  {
    accessorKey: "total_orders",
    header: "Orders",
    cell: ({ row }) => <div>{row.getValue("total_orders")}</div>,
  },
  {
    accessorKey: "total_spent",
    header: "Total Spent",
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("total_spent"))
      const formatted = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
      }).format(amount)
      return <div className="font-medium">{formatted}</div>
    },
  },
  {
    accessorKey: "last_order_date",
    header: "Last Order",
    cell: ({ row }) => {
      const date = row.getValue("last_order_date") as string
      return <div>{date ? new Date(date).toLocaleDateString() : "Never"}</div>
    },
  },
]