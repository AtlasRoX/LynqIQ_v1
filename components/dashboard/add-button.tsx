"use client"

import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"

interface AddButtonProps {
  onClick: () => void
  label?: string
}

export function AddButton({ onClick, label = "Add" }: AddButtonProps) {
  return (
    <Button onClick={onClick} className="gap-2">
      <Plus className="h-4 w-4" />
      {label}
    </Button>
  )
}
