"use client"

import { Button } from "@/components/ui/button"
import { useSearchParams, useRouter } from "next/navigation"

type TimeFrame = "24h" | "3d" | "7d" | "15d" | "30d" | "6m" | "1y" | "lifetime"

const timeFrameOptions: { label: string; value: TimeFrame }[] = [
  { label: "24h", value: "24h" },
  { label: "3d", value: "3d" },
  { label: "7d", value: "7d" },
  { label: "15d", value: "15d" },
  { label: "30d", value: "30d" },
  { label: "6m", value: "6m" },
  { label: "1y", value: "1y" },
  { label: "Lifetime", value: "lifetime" },
]

export function DateFilter() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const timeFrame = (searchParams.get("timeFrame") || "30d") as TimeFrame

  const handleTimeFrameChange = (frame: TimeFrame) => {
    const params = new URLSearchParams(searchParams)
    params.set("timeFrame", frame)
    router.push(`?${params.toString()}`)
  }

  return (
    <div className="flex gap-2 flex-wrap">
      {timeFrameOptions.map((option) => (
        <Button
          key={option.value}
          size="sm"
          variant={timeFrame === option.value ? "default" : "outline"}
          onClick={() => handleTimeFrameChange(option.value)}
        >
          {option.label}
        </Button>
      ))}
    </div>
  )
}
