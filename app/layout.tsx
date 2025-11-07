import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" })

export const metadata: Metadata = {
  title: "LynqIQ - Business Management System",
  description: "Intelligent business management for SMEs",
  generator: "v0.app",
}

import { LoadingProvider } from "@/lib/LoadingContext"
import { GlobalLoadingIndicator } from "@/components/ui/GlobalLoadingIndicator"
import { ThemeProvider } from "@/components/theme-provider"
import { ColorThemeProvider } from "@/components/dashboard/color-theme-provider"

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <ColorThemeProvider>
            <LoadingProvider>
              <GlobalLoadingIndicator />
              {children}
            </LoadingProvider>
          </ColorThemeProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
