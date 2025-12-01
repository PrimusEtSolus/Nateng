"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { getCurrentUser, type User } from "@/lib/auth"
import { benguetMunicipalities } from "@/lib/mock-data"
import { UserIcon, MapPin, Lock, Bell, Shield, Banknote, Truck, Check, Trash2 } from "lucide-react"

export default function FarmerSettingsPage() {
  const [user, setUser] = useState<User | null>(null)
  const [activeTab, setActiveTab] = useState("profile")
  const [saved, setSaved] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    municipality: "",
    barangay: "",
    farmSize: "",
  })

  useEffect(() => {
    const currentUser = getCurrentUser()
    if (currentUser) {
      setUser(currentUser)
      setFormData({
        name: currentUser.name,
        email: currentUser.email,
        phone: currentUser.phone || "",
        municipality: currentUser.municipality || "",
        barangay: "Shilan",
        farmSize: "2 hectares",
      })
    }
  }, [])

  const handleSave = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  const tabs = [
    { id: "profile", label: "Profile", icon: UserIcon },
    { id: "farm", label: "Farm Details", icon: MapPin },
    { id: "payments", label: "Payments", icon: Banknote },
    { id: "delivery", label: "Delivery", icon: Truck },
    { id: "security", label: "Security", icon: Lock },
    { id: "notifications", label: "Notifications", icon: Bell },
  ]

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold text-foreground tracking-tight">Settings</h1>
        <p className="text-muted-foreground mt-1">Manage your farmer account</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar Tabs */}
        <div className="lg:w-64 flex-shrink-0">
          <div className="bg-card rounded-2xl border border-border p-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-colors ${
                  activeTab === tab.id ? "bg-farmer text-white" : "hover:bg-muted text-foreground"
                }`}
              >
                <tab.icon className="w-5 h-5" />
                <span className="font-medium">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 max-w-2xl">
          {activeTab === "profile" && (
            <div className="bg-card rounded-2xl border border-border p-6">
              <h2 className="text-xl font-semibold mb-6">Profile Information</h2>
              <div className="flex items-center gap-4 mb-8">
                <div className="w-20 h-20 rounded-full bg-farmer/10 flex items-center justify-center">
                  <span className="text-2xl font-bold text-farmer">{formData.name.charAt(0)}</span>
                </div>
                <div>
                  <Button variant="outline" size="sm">
                    Change Photo
                  </Button>
                  <p className="text-sm text-muted-foreground mt-1">JPG, PNG. Max 2MB</p>
                </div>
              </div>
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="h-12"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="h-12"
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="h-12"
                    placeholder="+63 XXX XXX XXXX"
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === "farm" && (
            <div className="bg-card rounded-2xl border border-border p-6">
              <h2 className="text-xl font-semibold mb-6">Farm Details</h2>
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="municipality">Municipality</Label>
                  <select
                    id="municipality"
                    value={formData.municipality}
                    onChange={(e) => setFormData({ ...formData, municipality: e.target.value })}
                    className="w-full h-12 px-3 rounded-lg border border-input bg-background"
                  >
                    <option value="">Select Municipality</option>
                    {benguetMunicipalities.map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="barangay">Barangay</Label>
                  <Input
                    id="barangay"
                    value={formData.barangay}
                    onChange={(e) => setFormData({ ...formData, barangay: e.target.value })}
                    className="h-12"
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="farmSize">Farm Size</Label>
                  <Input
                    id="farmSize"
                    value={formData.farmSize}
                    onChange={(e) => setFormData({ ...formData, farmSize: e.target.value })}
                    className="h-12"
                    placeholder="e.g., 2 hectares"
                  />
                </div>
              </div>
              <div className="mt-6 p-4 bg-farmer/5 rounded-xl border border-farmer/20">
                <h4 className="font-medium text-farmer mb-2">Verification Status</h4>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <span className="text-sm">Verified Farmer - La Trinidad, Benguet</span>
                </div>
              </div>
            </div>
          )}

          {activeTab === "payments" && (
            <div className="bg-card rounded-2xl border border-border p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold">Payment Methods</h2>
                <Button className="bg-farmer hover:bg-farmer-light">Add Method</Button>
              </div>
              <p className="text-muted-foreground mb-4">Where you'll receive payments from sales</p>
              <div className="space-y-4">
                <div className="border border-farmer rounded-xl p-4 relative">
                  <span className="absolute top-3 right-3 bg-farmer text-white text-xs px-2 py-1 rounded-full">
                    Primary
                  </span>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center text-white text-sm font-bold">
                      GC
                    </div>
                    <div>
                      <p className="font-medium">GCash</p>
                      <p className="text-sm text-muted-foreground">+63 917 •••• 567</p>
                    </div>
                  </div>
                </div>
                <div className="border border-border rounded-xl p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-600 rounded-lg flex items-center justify-center text-white text-sm font-bold">
                      BK
                    </div>
                    <div>
                      <p className="font-medium">Bank Transfer</p>
                      <p className="text-sm text-muted-foreground">BPI - ••••4521</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "delivery" && (
            <div className="bg-card rounded-2xl border border-border p-6">
              <h2 className="text-xl font-semibold mb-6">Delivery Settings</h2>
              <div className="space-y-6">
                <div>
                  <h3 className="font-medium mb-4">Delivery Areas</h3>
                  <div className="space-y-3">
                    {["Baguio City", "La Trinidad", "Tuba", "Itogon"].map((area) => (
                      <label key={area} className="flex items-center justify-between cursor-pointer">
                        <span>{area}</span>
                        <input type="checkbox" defaultChecked className="w-5 h-5 rounded accent-farmer" />
                      </label>
                    ))}
                  </div>
                  <Button variant="outline" className="mt-4 bg-transparent">
                    Add Delivery Area
                  </Button>
                </div>
                <div className="border-t border-border pt-6">
                  <h3 className="font-medium mb-4">Minimum Order for Delivery</h3>
                  <div className="flex items-center gap-4">
                    <span>₱</span>
                    <Input type="number" defaultValue="1000" className="w-32 h-12" />
                    <span className="text-muted-foreground">minimum order value</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "security" && (
            <div className="space-y-6">
              <div className="bg-card rounded-2xl border border-border p-6">
                <h2 className="text-xl font-semibold mb-6">Change Password</h2>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Current Password</Label>
                    <Input type="password" placeholder="••••••••" className="h-12" />
                  </div>
                  <div className="space-y-2">
                    <Label>New Password</Label>
                    <Input type="password" placeholder="••••••••" className="h-12" />
                  </div>
                  <div className="space-y-2">
                    <Label>Confirm New Password</Label>
                    <Input type="password" placeholder="••••••••" className="h-12" />
                  </div>
                  <Button className="bg-farmer hover:bg-farmer-light">Update Password</Button>
                </div>
              </div>
              <div className="bg-card rounded-2xl border border-border p-6">
                <div className="flex items-start gap-4">
                  <Shield className="w-6 h-6 text-farmer mt-1" />
                  <div className="flex-1">
                    <h3 className="font-semibold">Two-Factor Authentication</h3>
                    <p className="text-sm text-muted-foreground mt-1">Secure your account with 2FA</p>
                  </div>
                  <Button variant="outline">Enable</Button>
                </div>
              </div>
              <div className="bg-card rounded-2xl border border-red-200 p-6">
                <div className="flex items-start gap-4">
                  <Trash2 className="w-6 h-6 text-red-500 mt-1" />
                  <div className="flex-1">
                    <h3 className="font-semibold text-red-600">Delete Account</h3>
                    <p className="text-sm text-muted-foreground mt-1">Permanently delete your account</p>
                  </div>
                  <Button variant="outline" className="text-red-500 border-red-300 hover:bg-red-50 bg-transparent">
                    Delete
                  </Button>
                </div>
              </div>
            </div>
          )}

          {activeTab === "notifications" && (
            <div className="bg-card rounded-2xl border border-border p-6">
              <h2 className="text-xl font-semibold mb-6">Notification Preferences</h2>
              <div className="space-y-6">
                <div>
                  <h3 className="font-medium mb-4">Order Notifications</h3>
                  <div className="space-y-3">
                    {[
                      { label: "New order received", checked: true },
                      { label: "Order confirmed by buyer", checked: true },
                      { label: "Order completed", checked: true },
                    ].map((item, idx) => (
                      <label key={idx} className="flex items-center justify-between cursor-pointer">
                        <span>{item.label}</span>
                        <input
                          type="checkbox"
                          defaultChecked={item.checked}
                          className="w-5 h-5 rounded accent-farmer"
                        />
                      </label>
                    ))}
                  </div>
                </div>
                <div className="border-t border-border pt-6">
                  <h3 className="font-medium mb-4">Marketing</h3>
                  <div className="space-y-3">
                    {[
                      { label: "Tips for farmers", checked: true },
                      { label: "Market price updates", checked: true },
                      { label: "Platform announcements", checked: false },
                    ].map((item, idx) => (
                      <label key={idx} className="flex items-center justify-between cursor-pointer">
                        <span>{item.label}</span>
                        <input
                          type="checkbox"
                          defaultChecked={item.checked}
                          className="w-5 h-5 rounded accent-farmer"
                        />
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Save Button */}
          <div className="flex justify-end mt-6">
            <Button onClick={handleSave} className="bg-farmer hover:bg-farmer-light px-8 h-12">
              {saved ? (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  Saved!
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
