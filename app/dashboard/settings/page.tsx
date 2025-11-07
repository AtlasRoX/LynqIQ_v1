"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { LogOut, Settings, Bell, Lock, Database, Download, Copy, CheckCircle, Briefcase, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
// You might want to add a toast component for notifications
// import { useToast } from "@/components/ui/use-toast" 

export default function SettingsPage() {
  const router = useRouter()
  // const { toast } = useToast() // Uncomment if you have a toast component
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [copied, setCopied] = useState(false)
  const [settings, setSettings] = useState({
    businessName: "Your Business",
    notificationsEnabled: true,
    emailAlerts: true,
    darkMode: true,
    autoBackup: true,
  })

  useEffect(() => {
    const getUserAndSettings = async () => {
      const supabase = await createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()
      
      if (user) {
        setEmail(user.email || "")

        // --- FETCH SETTINGS FROM PROFILES TABLE ---
        try {
          const { data: profile, error } = await supabase
            .from('profiles')
            .select('*') // Select all settings
            .eq('user_id', user.id)
            .single()

          if (error && error.code !== 'PGRST116') { // PGRST116 = 'no rows found'
            throw error
          }
          
          if (profile) {
            setSettings(prev => ({
              ...prev,
              businessName: profile.business_name || "Your Business",
              notificationsEnabled: profile.notifications_enabled ?? true,
              emailAlerts: profile.email_alerts ?? true,
              darkMode: profile.dark_mode ?? true,
              autoBackup: profile.auto_backup ?? true,
            }))
          }
        } catch (error: any) {
          // This is where your console error was triggered
          console.error("Error fetching settings:", error.message) 
          // toast({ title: "Error", description: "Could not load your settings." })
        }
      }
      setLoading(false)
    }
    getUserAndSettings()
  }, [])

  const handleLogout = async () => {
    const supabase = await createClient()
    await supabase.auth.signOut()
    router.push("/auth/login")
  }

  // Handle switch toggles
  const handleSwitchChange = (key: keyof typeof settings) => {
    setSettings((prev) => ({
      ...prev,
      [key]: !prev[key as keyof typeof prev],
    }))
  }

  // Handle text input changes
  const handleInputChange = (key: keyof typeof settings, value: string) => {
    setSettings(prev => ({
      ...prev,
      [key]: value,
    }))
  }

  const handleSaveSettings = async () => {
    setSaving(true)
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (user) {
      try {
        // --- SAVE SETTINGS TO PROFILES TABLE ---
        const { error } = await supabase
          .from("profiles")
          .update({
            business_name: settings.businessName,
            notifications_enabled: settings.notificationsEnabled,
            email_alerts: settings.emailAlerts,
            dark_mode: settings.darkMode,
            auto_backup: settings.autoBackup,
            updated_at: new Date().toISOString(),
          })
          .eq("user_id", user.id)

        if (error) throw error
        
        // toast({ title: "Success", description: "Settings saved successfully!" })
        
      } catch (error: any) {
        console.error("Error saving settings:", error)
        // toast({ title: "Error", description: "Failed to save settings." })
      }
    }
    setSaving(false)
  }

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(email)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (loading) {
    return (
        <div className="p-6 max-w-2xl mx-auto flex justify-center items-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
    )
  }

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Settings className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Settings</h1>
            <p className="text-muted-foreground">Manage your account and preferences</p>
          </div>
        </div>

        {/* --- Business Profile Section --- */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Briefcase className="h-5 w-5" />
              Business Profile
            </CardTitle>
            <CardDescription>Your business information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="businessName">Business Name</Label>
              <Input 
                id="businessName"
                value={settings.businessName} 
                onChange={(e) => handleInputChange("businessName", e.target.value)}
                placeholder="e.g., Acme Widgets"
              />
              <p className="text-xs text-muted-foreground">
                This name will appear on your PDF reports.
              </p>
            </div>
          </CardContent>
        </Card>

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
                  className="shrink-0"
                >
                  {copied ? <CheckCircle className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">Your primary account email</p>
            </div>
            <Button onClick={handleLogout} variant="outline" className="gap-2">
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
                onCheckedChange={() => handleSwitchChange("notificationsEnabled")}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label>Email Alerts</Label>
                <p className="text-sm text-muted-foreground">Receive critical alerts via email</p>
              </div>
              <Switch 
                checked={settings.emailAlerts} 
                onCheckedChange={() => handleSwitchChange("emailAlerts")} 
              />
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
            <div className="p-4 bg-muted/50 rounded-lg border">
              <p className="text-sm font-semibold mb-2">Database Backup</p>
              <p className="text-sm text-muted-foreground mb-4">
                Download a complete backup of your business data including sales, customers, and costs.
              </p>
              <Button variant="outline" className="gap-2">
                <Download className="h-4 w-4" />
                Export Data
              </Button>
            </div>
            <div className="p-4 bg-muted/50 rounded-lg border">
              <p className="text-sm font-semibold mb-2">Auto-Backup</p>
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">Automatically backup your data daily</p>
                <Switch 
                  checked={settings.autoBackup} 
                  onCheckedChange={() => handleSwitchChange("autoBackup")} 
                />
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
              <Switch 
                checked={settings.darkMode} 
                onCheckedChange={() => handleSwitchChange("darkMode")} 
              />
            </div>
          </CardContent>
        </Card>

        {/* Danger Zone */}
        <Card className="border-destructive/50 bg-destructive/5">
          <CardHeader>
            <CardTitle className="text-destructive">Danger Zone</CardTitle>
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
        <Button onClick={handleSaveSettings} disabled={saving || loading} className="w-full">
          {saving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            "Save Settings"
          )}
        </Button>
      </div>
  )
}