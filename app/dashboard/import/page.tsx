"use client"

import { EnhancedCSVUploader } from "@/components/dashboard/enhanced-csv-uploader"
import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"

export default function ImportPage() {
  const [email, setEmail] = useState("")

  useEffect(() => {
    const getUser = async () => {
      const supabase = await createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()
      setEmail(user?.email || "")
    }
    getUser()
  }, [])

  return (
    <div className="p-6 max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Bulk Data Import</h1>
          <p className="text-muted-foreground mt-2">
            Import your business data efficiently with validation and preview
          </p>
        </div>

        <EnhancedCSVUploader />
      </div>
  )
}
