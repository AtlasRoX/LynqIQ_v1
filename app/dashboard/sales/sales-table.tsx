"use client"

import { getSalesColumns } from "./columns"
import { DataTable } from "@/components/dashboard/data-table"
import type { Sale, Product, Customer } from "@/lib/types"

interface SalesTableProps {
  sales: Sale[]
  products: Product[]
  customers: Customer[]
}

export function SalesTable({ sales, products, customers }: SalesTableProps) {
  // Columns are now generated here, on the client
  const columns = getSalesColumns({ products, customers })

  return (
    <DataTable
      title="Recent Sales"
      columns={columns}
      data={sales}
      filterColumnId="customer_id"
    />
  )
}
