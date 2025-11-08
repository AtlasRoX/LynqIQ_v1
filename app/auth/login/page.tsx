"use client"

import type React from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useRouter } from "next/navigation"
import { useState } from "react"
import Image from "next/image"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = createClient()
    setIsLoading(true)
    setError(null)

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      if (error) throw error
      router.push("/dashboard")
      router.refresh()
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  const handleAutoFill = () => {
    setEmail("admin@lynqiq.com")
    setPassword("admin123#")
  }

  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card>
          <CardHeader className="space-y-2 text-center">
            <div className="text-3xl font-bold text-primary">LynqIQ</div>
            <CardTitle>Welcome Back</CardTitle>
            <CardDescription>Sign in to your business management account</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              {error && <p className="text-sm text-destructive">{error}</p>}
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Signing in..." : "Sign In"}
              </Button>
            </form>

            <div className="mt-6 space-y-3 rounded-lg border border-dashed border-muted-foreground/30 bg-muted/30 p-4">
              <div className="text-sm font-medium text-muted-foreground">Demo Credentials</div>
              <div className="space-y-1.5 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Email:</span>
                  <code className="rounded bg-background px-2 py-1 font-mono text-foreground">admin@lynqiq.com</code>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Password:</span>
                  <code className="rounded bg-background px-2 py-1 font-mono">•••••••••</code>
                </div>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="w-full text-xs bg-transparent"
                onClick={handleAutoFill}
              >
                Auto Fill Demo Credentials
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <footer className="mt-8 flex items-center gap-2 opacity-60 transition-opacity hover:opacity-100">
        <span className="text-xs text-muted-foreground">Developed by</span>
        <Image src="/algoverse-logo.png" alt="Algoverse" width={100} height={24} className="h-6 w-auto" />
      </footer>
    </div>
  )
}
