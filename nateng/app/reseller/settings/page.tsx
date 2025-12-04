"use client"

import { useState, useEffect } from "react"
import { getCurrentUser } from "@/lib/auth"
import { type User } from "@/lib/types"
import { usersAPI } from "@/lib/api-client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { UserIcon, Store, Bell, Shield, Save, Loader2, Check } from "lucide-react"
import { toast } from "sonner"

export default function ResellerSettingsPage() {
  const [user, setUser] = useState<User | null>(null)
  const [activeTab, setActiveTab] = useState("profile")
  const [saved, setSaved] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    businessName: "",
  })

  useEffect(() => {
    const currentUser = getCurrentUser()
    if (currentUser) {
      setUser(currentUser)
      setFormData({
        name: currentUser.name,
        email: currentUser.email,
        phone: "", // Not stored in User model yet
        address: "", // Not stored in User model yet
        businessName: currentUser.businessName || "",
      })
    }
  }, [])

  const handleSave = async () => {
    if (!user) {
      toast.error("Please log in to save settings")
      return
    }

    // Validate required fields
    if (!formData.name || !formData.email) {
      toast.error("Name and email are required")
      return
    }

    setIsSaving(true)
    try {
      // Only save fields that exist in the User model (name, email)
      const updatedUser = await usersAPI.update(user.id, {
        name: formData.name,
        email: formData.email,
      })

      // Update localStorage with new user data
      if (typeof window !== "undefined") {
        localStorage.setItem("natenghub_user", JSON.stringify(updatedUser))
      }

      setUser(updatedUser)
      setSaved(true)
      toast.success("Profile updated successfully!")
      setTimeout(() => setSaved(false), 3000)

      // Show info about fields that couldn't be saved
      if (formData.phone || formData.address || formData.businessName) {
        toast.info("Note: Phone, address, and business name are not saved yet. These fields will be available in a future update.", {
          duration: 5000,
        })
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to save settings")
    } finally {
      setIsSaving(false)
    }
  }

  const tabs = [
    { id: "profile", label: "Profile", icon: UserIcon },
    { id: "store", label: "Store Info", icon: Store },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "security", label: "Security", icon: Shield },
  ]

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground mt-1">Manage your reseller account settings</p>
      </div>

      <div className="flex gap-8">
        {/* Sidebar Tabs */}
        <div className="w-64 space-y-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                activeTab === tab.id ? "bg-teal-600 text-white" : "text-muted-foreground hover:bg-muted"
              }`}
            >
              <tab.icon className="w-5 h-5" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 bg-white rounded-2xl p-8 shadow-sm border border-border">
          {activeTab === "profile" && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold">Profile Information</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Full Name</Label>
                  <Input 
                    value={formData.name} 
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })} 
                    className="h-12" 
                  />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input 
                    type="email"
                    value={formData.email} 
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })} 
                    className="h-12" 
                  />
                </div>
                <div className="space-y-2">
                  <Label>Phone Number</Label>
                  <Input 
                    value={formData.phone} 
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })} 
                    className="h-12" 
                    placeholder="+63 XXX XXX XXXX"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Address</Label>
                  <Input 
                    value={formData.address} 
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })} 
                    className="h-12" 
                  />
                </div>
              </div>
              <Button 
                onClick={handleSave}
                className="bg-teal-600 hover:bg-teal-700"
                disabled={isSaving}
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : saved ? (
                  <>
                    <Check className="w-4 h-4 mr-2" />
                    Saved!
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          )}

          {activeTab === "store" && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold">Store Information</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Store Name</Label>
                  <Input 
                    value={formData.businessName} 
                    onChange={(e) => setFormData({ ...formData, businessName: e.target.value })} 
                    className="h-12" 
                  />
                </div>
                <div className="space-y-2">
                  <Label>Market/Stall Location</Label>
                  <Input 
                    value={formData.address} 
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })} 
                    className="h-12" 
                  />
                </div>
              </div>
              <Button 
                onClick={handleSave}
                className="bg-teal-600 hover:bg-teal-700"
                disabled={isSaving}
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : saved ? (
                  <>
                    <Check className="w-4 h-4 mr-2" />
                    Saved!
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          )}

          {activeTab === "notifications" && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold">Notification Preferences</h2>
              <p className="text-muted-foreground">Configure how you receive notifications.</p>
              <div className="space-y-4">
                {["Order updates", "New products from farmers", "Price alerts", "Promotional offers"].map((item) => (
                  <label key={item} className="flex items-center justify-between p-4 bg-muted/50 rounded-xl">
                    <span className="font-medium">{item}</span>
                    <input type="checkbox" defaultChecked className="w-5 h-5 accent-teal-600" />
                  </label>
                ))}
              </div>
            </div>
          )}

          {activeTab === "security" && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold">Security Settings</h2>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Current Password</Label>
                  <Input type="password" className="h-12" />
                </div>
                <div className="space-y-2">
                  <Label>New Password</Label>
                  <Input type="password" className="h-12" />
                </div>
                <div className="space-y-2">
                  <Label>Confirm New Password</Label>
                  <Input type="password" className="h-12" />
                </div>
              </div>
              <Button className="bg-teal-600 hover:bg-teal-700">
                <Save className="w-4 h-4 mr-2" />
                Update Password
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
