"use client"

import { useColorTheme, COLOR_THEMES, type ColorTheme } from "./color-theme-provider"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Check } from "lucide-react"
import { cn } from "@/lib/utils"

export function ColorThemeSelector() {
  const { theme, setTheme } = useColorTheme()

  const themes: ColorTheme[] = ["emerald", "sapphire", "amethyst", "rose-gold", "ocean", "sunset"]

  const getThemePreviewColor = (t: ColorTheme): string => {
    const themeConfig = COLOR_THEMES[t]
    return themeConfig.light["--primary"]
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <div className="p-2 bg-primary/10 rounded-lg">
            <div className="h-5 w-5 rounded-full bg-primary" />
          </div>
          Color Theme
        </CardTitle>
        <CardDescription>Choose your preferred color theme for the entire application</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {themes.map((t) => (
            <Button
              key={t}
              onClick={() => setTheme(t)}
              variant={theme === t ? "default" : "outline"}
              className={cn(
                "h-auto flex-col gap-2 py-3 relative overflow-hidden transition-all",
                theme === t && "ring-2 ring-primary",
              )}
            >
              <div className="flex items-center justify-center gap-2 w-full">
                <div
                  className="h-6 w-6 rounded-full border-2 border-border"
                  style={{ backgroundColor: getThemePreviewColor(t) }}
                />
                <span className="text-sm font-medium">{COLOR_THEMES[t].label}</span>
              </div>
              {theme === t && <Check className="h-4 w-4 absolute top-1 right-1 text-primary" />}
            </Button>
          ))}
        </div>
        <p className="text-xs text-muted-foreground">
          Your selected theme will be applied instantly across the entire application and saved to your profile.
        </p>
      </CardContent>
    </Card>
  )
}
