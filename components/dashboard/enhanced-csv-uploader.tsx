"use client"

import type React from "react"
import { useState } from "react"
import { Upload, AlertCircle, CheckCircle, Eye, EyeOff } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface ParsedRow {
  valid: boolean
  data?: Record<string, any>
  errors?: string[]
}

export function EnhancedCSVUploader() {
  const [uploading, setUploading] = useState(false)
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")
  const [preview, setPreview] = useState<ParsedRow[]>([])
  const [showPreview, setShowPreview] = useState(false)
  const [fileName, setFileName] = useState("")

  const validateRow = (row: Record<string, any>, dataType: string): ParsedRow => {
    const errors: string[] = []

    switch (dataType) {
      case "products":
        if (!row.name || row.name.toString().trim() === "") errors.push("Product name required")
        if (!row.category || row.category.toString().trim() === "") errors.push("Category required")
        if (!row.cost_price || isNaN(Number(row.cost_price))) errors.push("Valid cost price required")
        if (!row.sell_price || isNaN(Number(row.sell_price))) errors.push("Valid sell price required")
        if (Number(row.cost_price) > Number(row.sell_price)) errors.push("Cost price exceeds sell price")
        break

      case "customers":
        if (!row.name || row.name.toString().trim() === "") errors.push("Customer name required")
        if (row.total_spent && isNaN(Number(row.total_spent))) errors.push("Valid spent amount required")
        break

      case "costs":
        if (!row.date || row.date.toString().trim() === "") errors.push("Date required")
        if (!row.category || row.category.toString().trim() === "") errors.push("Category required")
        if (!row.amount || isNaN(Number(row.amount))) errors.push("Valid amount required")
        break
    }

    return {
      valid: errors.length === 0,
      data: errors.length === 0 ? row : undefined,
      errors: errors.length > 0 ? errors : undefined,
    }
  }

  const handleCSVUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    setError("")
    setMessage("")
    setShowPreview(false)
    setPreview([])

    try {
      const text = await file.text()
      const lines = text.split("\n").filter((line) => line.trim())

      if (lines.length < 2) {
        setError("CSV file must have header and at least one data row")
        setUploading(false)
        return
      }

      const headers = lines[0]
        .split(",")
        .map((h) => h.trim().toLowerCase())
        .filter((h) => h)

      const supabase = await createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        setError("User not authenticated")
        setUploading(false)
        return
      }

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

      setFileName(file.name)

      // Parse and validate data
      const parsedRows: ParsedRow[] = []
      let importedCount = 0

      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(",").map((v) => v.trim())
        const row: Record<string, any> = { user_id: user.id }

        headers.forEach((header, idx) => {
          if (values[idx]) {
            // Convert numeric strings to numbers
            const value = values[idx]
            if (!isNaN(Number(value)) && value !== "") {
              row[header] = Number(value)
            } else {
              row[header] = value
            }
          }
        })

        const validation = validateRow(row, dataType)
        parsedRows.push(validation)

        if (validation.valid && validation.data) {
          const insertData = { ...validation.data }
          delete insertData.user_id
          insertData.user_id = user.id

          try {
            await supabase.from(dataType).insert([insertData])
            importedCount++
          } catch (err) {
            validation.valid = false
            validation.errors = [(err as any)?.message || "Database insert failed"]
          }
        }
      }

      setPreview(parsedRows.slice(0, 10))
      setShowPreview(true)
      setMessage(
        `Successfully imported ${importedCount} out of ${parsedRows.filter((r) => r.valid).length} ${dataType}`,
      )
    } catch (err) {
      setError(`Upload failed: ${err instanceof Error ? err.message : "Unknown error"}`)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Bulk CSV Import</CardTitle>
          <CardDescription>Import products, customers, sales, and costs from CSV files with validation</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative">
            <input
              type="file"
              accept=".csv"
              onChange={handleCSVUpload}
              disabled={uploading}
              className="hidden"
              id="csv-upload-enhanced"
            />

            <label
              htmlFor="csv-upload-enhanced"
              className="flex items-center justify-center gap-3 p-8 border-2 border-dashed border-primary/30 rounded-lg cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-all"
            >
              <Upload className="h-6 w-6 text-primary" />
              <div className="text-center">
                <p className="font-semibold">{uploading ? "Uploading..." : "Click to upload CSV"}</p>
                <p className="text-sm text-muted-foreground">
                  Max 10MB • Name must contain: product, customer, cost, or sale
                </p>
              </div>
            </label>
          </div>

          {error && (
            <div className="flex items-start gap-3 p-4 rounded-lg bg-destructive/10 border border-destructive/30">
              <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-semibold text-sm">Import Error</p>
                <p className="text-sm text-foreground/70 mt-1">{error}</p>
              </div>
            </div>
          )}

          {message && (
            <div className="flex items-start gap-3 p-4 rounded-lg bg-green-500/10 border border-green-500/30">
              <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-semibold text-sm">Import Successful</p>
                <p className="text-sm text-foreground/70 mt-1">{message}</p>
              </div>
            </div>
          )}

          {preview.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold">Preview ({fileName})</p>
                <Button size="sm" variant="outline" onClick={() => setShowPreview(!showPreview)} className="gap-2">
                  {showPreview ? (
                    <>
                      <EyeOff className="h-4 w-4" />
                      Hide
                    </>
                  ) : (
                    <>
                      <Eye className="h-4 w-4" />
                      Show
                    </>
                  )}
                </Button>
              </div>

              {showPreview && (
                <div className="bg-muted/50 rounded-lg p-4 space-y-2 max-h-64 overflow-y-auto">
                  {preview.map((row, idx) => (
                    <div
                      key={idx}
                      className={`text-xs p-2 rounded ${row.valid ? "bg-green-500/10 border border-green-500/20" : "bg-red-500/10 border border-red-500/20"}`}
                    >
                      {row.valid ? (
                        <p className="text-green-700 font-semibold">✓ Row {idx + 2}: Valid</p>
                      ) : (
                        <div>
                          <p className="text-red-700 font-semibold">✗ Row {idx + 2}: Invalid</p>
                          {row.errors && (
                            <ul className="list-disc list-inside text-red-600 mt-1">
                              {row.errors.map((e, i) => (
                                <li key={i}>{e}</li>
                              ))}
                            </ul>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">CSV Format Guidelines</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 text-sm">
            <div>
              <p className="font-semibold">Products (products.csv)</p>
              <p className="text-muted-foreground font-mono">name, category, cost_price, sell_price</p>
            </div>
            <div>
              <p className="font-semibold">Customers (customers.csv)</p>
              <p className="text-muted-foreground font-mono">name, phone, address, total_orders, total_spent</p>
            </div>
            <div>
              <p className="font-semibold">Costs (costs.csv)</p>
              <p className="text-muted-foreground font-mono">date, category, amount, description</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
