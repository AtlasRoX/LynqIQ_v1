"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"

export type ColorTheme = "emerald" | "sapphire" | "amethyst" | "rose-gold" | "ocean" | "sunset"

interface ColorThemeContextType {
  theme: ColorTheme
  setTheme: (theme: ColorTheme) => void
  isLoading: boolean
}

const ColorThemeContext = createContext<ColorThemeContextType | undefined>(undefined)

export const COLOR_THEMES: Record<
  ColorTheme,
  {
    light: Record<string, string>
    dark: Record<string, string>
    label: string
  }
> = {
  emerald: {
    label: "Emerald",
    light: {
      "--primary": "#10B981",
      "--primary-foreground": "#FFFFFF",
      "--accent": "#10B981",
      "--accent-foreground": "#FFFFFF",
      "--chart-1": "#10B981",
      "--chart-2": "#0891B2",
      "--chart-3": "#F59E0B",
      "--chart-4": "#EC4899",
      "--chart-5": "#8B5CF6",
    },
    dark: {
      "--primary": "#34D399",
      "--primary-foreground": "#0A0A0A",
      "--accent": "#34D399",
      "--accent-foreground": "#0A0A0A",
      "--chart-1": "#34D399",
      "--chart-2": "#06B6D4",
      "--chart-3": "#FBBF24",
      "--chart-4": "#F472B6",
      "--chart-5": "#A78BFA",
    },
  },
  sapphire: {
    label: "Sapphire",
    light: {
      "--primary": "#0D6EFD",
      "--primary-foreground": "#FFFFFF",
      "--accent": "#0D6EFD",
      "--accent-foreground": "#FFFFFF",
      "--chart-1": "#0D6EFD",
      "--chart-2": "#0891B2",
      "--chart-3": "#F59E0B",
      "--chart-4": "#DC3545",
      "--chart-5": "#6F42C1",
    },
    dark: {
      "--primary": "#3B82F6",
      "--primary-foreground": "#0A0A0A",
      "--accent": "#3B82F6",
      "--accent-foreground": "#0A0A0A",
      "--chart-1": "#3B82F6",
      "--chart-2": "#06B6D4",
      "--chart-3": "#FBBF24",
      "--chart-4": "#F87171",
      "--chart-5": "#A78BFA",
    },
  },
  amethyst: {
    label: "Amethyst",
    light: {
      "--primary": "#8B5CF6",
      "--primary-foreground": "#FFFFFF",
      "--accent": "#8B5CF6",
      "--accent-foreground": "#FFFFFF",
      "--chart-1": "#8B5CF6",
      "--chart-2": "#0891B2",
      "--chart-3": "#10B981",
      "--chart-4": "#EC4899",
      "--chart-5": "#F59E0B",
    },
    dark: {
      "--primary": "#A78BFA",
      "--primary-foreground": "#0A0A0A",
      "--accent": "#A78BFA",
      "--accent-foreground": "#0A0A0A",
      "--chart-1": "#A78BFA",
      "--chart-2": "#06B6D4",
      "--chart-3": "#34D399",
      "--chart-4": "#F472B6",
      "--chart-5": "#FBBF24",
    },
  },
  "rose-gold": {
    label: "Rose Gold",
    light: {
      "--primary": "#E94560",
      "--primary-foreground": "#FFFFFF",
      "--accent": "#E94560",
      "--accent-foreground": "#FFFFFF",
      "--chart-1": "#E94560",
      "--chart-2": "#D4AF37",
      "--chart-3": "#F59E0B",
      "--chart-4": "#10B981",
      "--chart-5": "#0D6EFD",
    },
    dark: {
      "--primary": "#F472B6",
      "--primary-foreground": "#0A0A0A",
      "--accent": "#F472B6",
      "--accent-foreground": "#0A0A0A",
      "--chart-1": "#F472B6",
      "--chart-2": "#FCD34D",
      "--chart-3": "#FBBF24",
      "--chart-4": "#34D399",
      "--chart-5": "#60A5FA",
    },
  },
  ocean: {
    label: "Ocean",
    light: {
      "--primary": "#0891B2",
      "--primary-foreground": "#FFFFFF",
      "--accent": "#0891B2",
      "--accent-foreground": "#FFFFFF",
      "--chart-1": "#0891B2",
      "--chart-2": "#0D6EFD",
      "--chart-3": "#10B981",
      "--chart-4": "#F59E0B",
      "--chart-5": "#8B5CF6",
    },
    dark: {
      "--primary": "#06B6D4",
      "--primary-foreground": "#0A0A0A",
      "--accent": "#06B6D4",
      "--accent-foreground": "#0A0A0A",
      "--chart-1": "#06B6D4",
      "--chart-2": "#3B82F6",
      "--chart-3": "#34D399",
      "--chart-4": "#FBBF24",
      "--chart-5": "#A78BFA",
    },
  },
  sunset: {
    label: "Sunset",
    light: {
      "--primary": "#F97316",
      "--primary-foreground": "#FFFFFF",
      "--accent": "#F97316",
      "--accent-foreground": "#FFFFFF",
      "--chart-1": "#F97316",
      "--chart-2": "#EC4899",
      "--chart-3": "#8B5CF6",
      "--chart-4": "#0D6EFD",
      "--chart-5": "#10B981",
    },
    dark: {
      "--primary": "#FB923C",
      "--primary-foreground": "#0A0A0A",
      "--accent": "#FB923C",
      "--accent-foreground": "#0A0A0A",
      "--chart-1": "#FB923C",
      "--chart-2": "#F472B6",
      "--chart-3": "#A78BFA",
      "--chart-4": "#60A5FA",
      "--chart-5": "#34D399",
    },
  },
}

export function ColorThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<ColorTheme>("emerald")
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const savedTheme = localStorage.getItem("color-theme") as ColorTheme | null
    const themeToUse = savedTheme && savedTheme in COLOR_THEMES ? savedTheme : "emerald"

    setThemeState(themeToUse)
    applyTheme(themeToUse)
    setIsLoading(false)
  }, [])

  const applyTheme = (selectedTheme: ColorTheme) => {
    const isDark = document.documentElement.classList.contains("dark")
    const colors = COLOR_THEMES[selectedTheme]
    const themeColors = isDark ? colors.dark : colors.light

    Object.entries(themeColors).forEach(([key, value]) => {
      document.documentElement.style.setProperty(key, value)
    })
  }

  const handleSetTheme = (newTheme: ColorTheme) => {
    setThemeState(newTheme)
    applyTheme(newTheme)
    localStorage.setItem("color-theme", newTheme)
  }

  return (
    <ColorThemeContext.Provider value={{ theme, setTheme: handleSetTheme, isLoading }}>
      {children}
    </ColorThemeContext.Provider>
  )
}

export function useColorTheme() {
  const context = useContext(ColorThemeContext)
  if (!context) {
    throw new Error("useColorTheme must be used within ColorThemeProvider")
  }
  return context
}
