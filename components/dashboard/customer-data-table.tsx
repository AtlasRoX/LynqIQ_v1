"use client"

import { DataTable } from "./data-table"
import { getCustomerColumns } from "@/app/dashboard/customers/columns"
import type { Customer } from "@/lib/types"

export function CustomerDataTable({ customers }: { customers: Customer[] }) {
  const columns = getCustomerColumns()
  return (
    <DataTable
      title="All Customers"
      columns={columns}
      data={customers}
      filterColumnId="name"
    />
  )
}
