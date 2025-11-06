"use client"

import { DataTable } from "./data-table"
import { getProductColumns } from "@/app/dashboard/products/columns"
import type { Product } from "@/lib/types"

export function ProductDataTable({ products }: { products: Product[] }) {
  const columns = getProductColumns()
  return (
    <DataTable
      title="All Products"
      columns={columns}
      data={products}
      filterColumnId="name"
    />
  )
}
