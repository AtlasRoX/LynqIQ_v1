"use client"

import type React from "react"

import { useState } from "react"
import { Upload, AlertCircle, CheckCircle } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

export function CSVUploader() {
  const [uploading, setUploading] = useState(false)
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")

  const handleCSVUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    setError("")
    setMessage("")

    try {
      const text = await file.text()
      const lines = text.split("\n").filter((line) => line.trim())

      if (lines.length < 2) {
        setError("CSV file must have header and at least one data row")
        setUploading(false)
        return
      }

      const headers = lines[0].split(",").map((h) => h.trim().toLowerCase())
      const supabase = await createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        setError("User not authenticated")
        setUploading(false)
        return
      }

      let importedCount = 0
      const dataType = file.name.toLowerCase().includes("product")
        ? "products"
        : file.name.toLowerCase().includes("sale")
          ? "sales"
          : file.name.toLowerCase().includes("customer")
            ? "customers"
            : file.name.toLowerCase().includes("cost")
              ? "costs"
              : null

      if (!dataType) {
        setError("File name must contain: product, sale, customer, or cost")
        setUploading(false)
        return
      }

      // Parse and insert data
      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(",").map((v) => v.trim())
        const row: any = {}

        headers.forEach((header, idx) => {
          row[header] = values[idx]
        })

        row.user_id = user.id

        // Validate and insert based on data type
        if (dataType === "products" && row.name && row.category && row.cost_price && row.sell_price) {
          await supabase.from("products").insert([row])
          importedCount++
        } else if (dataType === "customers" && row.name) {
          await supabase.from("customers").insert([row])
          importedCount++
        } else if (dataType === "costs" && row.date && row.category && row.amount) {
          await supabase.from("costs").insert([row])
          importedCount++
        }
      }

      setMessage(`Successfully imported ${importedCount} ${dataType}`)
    } catch (err) {
      setError(`Upload failed: ${err instanceof Error ? err.message : "Unknown error"}`)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="p-6 bg-card border border-border rounded-lg">
      <h3 className="text-lg font-semibold mb-4">Bulk Import Data</h3>

      <div className="relative">
        <input
          type="file"
          accept=".csv"
          onChange={handleCSVUpload}
          disabled={uploading}
          className="hidden"
          id="csv-upload"
        />

        <label
          htmlFor="csv-upload"
          className="flex items-center justify-center gap-3 p-6 border-2 border-dashed border-primary/30 rounded-lg cursor-pointer hover:border-primary/50 transition-colors"
        >
          <Upload className="h-5 w-5 text-primary" />
          <div className="text-center">
            <p className="font-medium">{uploading ? "Uploading..." : "Click to upload CSV"}</p>
            <p className="text-sm text-muted-foreground">Max 10MB • Supports Products, Customers, Sales, Costs</p>
          </div>
        </label>
      </div>

      {error && (
        <div className="mt-4 flex items-center gap-2 text-destructive">
          <AlertCircle className="h-5 w-5" />
          <span className="text-sm">{error}</span>
        </div>
      )}

      {message && (
        <div className="mt-4 flex items-center gap-2 text-green-600">
          <CheckCircle className="h-5 w-5" />
          <span className="text-sm">{message}</span>
        </div>
      )}
    </div>
  )
}
