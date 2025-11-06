"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { LogOut, Settings, Bell, Lock, Database, Download, Copy, CheckCircle } from "lucide-react"
import { useRouter } from "next/navigation"

export default function SettingsPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [copied, setCopied] = useState(false)
  const [settings, setSettings] = useState({
    notificationsEnabled: true,
    emailAlerts: true,
    darkMode: true,
    autoBackup: true,
  })

  useEffect(() => {
    const getUser = async () => {
      const supabase = await createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()
      setEmail(user?.email || "")
      setLoading(false)
    }
    getUser()
  }, [])

  const handleLogout = async () => {
    const supabase = await createClient()
    await supabase.auth.signOut()
    router.push("/auth/login")
  }

  const handleSettingChange = (key: string) => {
    setSettings((prev) => ({
      ...prev,
      [key]: !prev[key as keyof typeof prev],
    }))
  }

  const handleSaveSettings = async () => {
    setSaving(true)
    // Simulate saving
    await new Promise((resolve) => setTimeout(resolve, 500))
    setSaving(false)
  }

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(email)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (loading) {
    return (
        <div className="p-6">
          <p className="text-muted-foreground">Loading settings...</p>
        </div>
    )
  }

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="p-2 bg-accent/10 rounded-lg">
            <Settings className="h-6 w-6 text-accent" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Settings</h1>
            <p className="text-muted-foreground">Manage your account and preferences</p>
          </div>
        </div>

        {/* Account Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5" />
              Account
            </CardTitle>
            <CardDescription>Your account information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Email Address</Label>
              <div className="flex gap-2">
                <Input value={email} readOnly className="flex-1" />
                <Button
                  size="icon"
                  variant="outline"
                  onClick={copyToClipboard}
                  className="flex-shrink-0 bg-transparent"
                >
                  {copied ? <CheckCircle className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">Your primary account email</p>
            </div>
            <Button onClick={handleLogout} variant="outline" className="gap-2 bg-transparent">
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </CardContent>
        </Card>

        {/* Notifications Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notifications
            </CardTitle>
            <CardDescription>Control how you receive alerts and updates</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>In-App Notifications</Label>
                <p className="text-sm text-muted-foreground">Show alerts in the dashboard</p>
              </div>
              <Switch
                checked={settings.notificationsEnabled}
                onCheckedChange={() => handleSettingChange("notificationsEnabled")}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label>Email Alerts</Label>
                <p className="text-sm text-muted-foreground">Receive critical alerts via email</p>
              </div>
              <Switch checked={settings.emailAlerts} onCheckedChange={() => handleSettingChange("emailAlerts")} />
            </div>
          </CardContent>
        </Card>

        {/* Data Management Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Data Management
            </CardTitle>
            <CardDescription>Manage your business data</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-muted/50 rounded-lg border border-border">
              <p className="text-sm font-semibold mb-2">Database Backup</p>
              <p className="text-sm text-muted-foreground mb-4">
                Download a complete backup of your business data including sales, customers, and costs.
              </p>
              <Button variant="outline" className="gap-2 bg-transparent">
                <Download className="h-4 w-4" />
                Export Data
              </Button>
            </div>
            <div className="p-4 bg-muted/50 rounded-lg border border-border">
              <p className="text-sm font-semibold mb-2">Auto-Backup</p>
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">Automatically backup your data daily</p>
                <Switch checked={settings.autoBackup} onCheckedChange={() => handleSettingChange("autoBackup")} />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Appearance Section */}
        <Card>
          <CardHeader>
            <CardTitle>Appearance</CardTitle>
            <CardDescription>Customize how LynqIQ looks</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Dark Mode</Label>
                <p className="text-sm text-muted-foreground">Use dark theme by default</p>
              </div>
              <Switch checked={settings.darkMode} onCheckedChange={() => handleSettingChange("darkMode")} />
            </div>
          </CardContent>
        </Card>

        {/* Danger Zone */}
        <Card className="border-red-500/20 bg-red-500/5">
          <CardHeader>
            <CardTitle className="text-red-600">Danger Zone</CardTitle>
            <CardDescription>Irreversible actions</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button variant="destructive" className="w-full">
              Delete Account
            </Button>
            <p className="text-xs text-muted-foreground">
              This will permanently delete your account and all associated data. This action cannot be undone.
            </p>
          </CardContent>
        </Card>

        {/* Save Button */}
        <Button onClick={handleSaveSettings} disabled={saving} className="w-full">
          {saving ? "Saving..." : "Save Settings"}
        </Button>
      </div>
  )
}
