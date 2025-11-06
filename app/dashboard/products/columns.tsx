"use client"

import type { ColumnDef } from "@tanstack/react-table"
import type { Product } from "@/lib/types"
import { formatCurrency } from "@/lib/utils"

export const getProductColumns = (): ColumnDef<Product>[] => [
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => <div className="font-medium">{row.getValue("name")}</div>,
  },
  {
    accessorKey: "category",
    header: "Category",
    cell: ({ row }) => <div>{row.getValue("category")}</div>,
  },
  {
    accessorKey: "cost_price",
    header: "Cost Price",
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("cost_price"))
      return <div className="font-medium">{formatCurrency(amount, "BDT")}</div>
    },
  },
  {
    accessorKey: "sell_price",
    header: "Sell Price",
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("sell_price"))
      return <div className="font-medium">{formatCurrency(amount, "BDT")}</div>
    },
  },
  {
    accessorKey: "margin",
    header: "Margin",
    cell: ({ row }) => {
      const costPrice = parseFloat(row.getValue("cost_price"))
      const sellPrice = parseFloat(row.getValue("sell_price"))
      const margin = sellPrice - costPrice
      return <div className="font-medium">{formatCurrency(margin, "BDT")}</div>
    },
  },
]