'use client'

import { useLoading } from "@/lib/LoadingContext";
import { Loader2 } from "lucide-react";

export function GlobalLoadingIndicator() {
  const { isLoading } = useLoading();

  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
      <Loader2 className="h-16 w-16 animate-spin text-primary" />
    </div>
  );
}
