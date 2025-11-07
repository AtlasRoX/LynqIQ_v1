"use client"

import { formatCurrency, formatDate } from "@/lib/utils"
import { Product, Customer, Sale } from "@/lib/types"
import { ColumnDef } from "@tanstack/react-table"

interface SalesColumnsProps {
  products: Product[];
  customers: Customer[];
}

export const getSalesColumns = ({ products, customers }: SalesColumnsProps): ColumnDef<Sale>[] => [
  {
    accessorKey: "date",
    header: "Date",
    cell: ({ row }) => formatDate(row.getValue("date")),
  },
  {
    accessorKey: "customer_id",
    header: "Customer",
    cell: ({ row }) => {
      const customer = customers.find(c => c.id === row.getValue("customer_id"))
      return customer?.name || "Unknown"
    },
  },
  {
    accessorKey: "product_id",
    header: "Product",
    cell: ({ row }) => {
      const product = products.find(p => p.id === row.getValue("product_id"))
      return product?.name || "Unknown"
    },
  },
  {
    accessorKey: "quantity",
    header: "Quantity",
  },
  {
    accessorKey: "total_amount",
    header: "Amount",
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("total_amount"))
      return <div className="font-medium">{formatCurrency(amount, "BDT")}</div>
    },
  },
  {
    accessorKey: "status",
    header: "Status",
  },
  {
    accessorKey: "sales_channel",
    header: "Channel",
  },
]
