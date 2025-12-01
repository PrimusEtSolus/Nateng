"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { getCurrentUser, type User } from "@/lib/auth"
import { UserIcon, MapPin, Bell, CreditCard, Lock, Shield, Trash2, Check } from "lucide-react"

export default function BuyerSettingsPage() {
  const [user, setUser] = useState<User | null>(null)
  const [activeTab, setActiveTab] = useState("profile")
  const [saved, setSaved] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    postalCode: "",
  })

  useEffect(() => {
    const currentUser = getCurrentUser()
    if (currentUser) {
      setUser(currentUser)
      setFormData({
        name: currentUser.name,
        email: currentUser.email,
        phone: currentUser.phone || "",
        address: currentUser.address || "",
        city: "Baguio City",
        postalCode: "2600",
      })
    }
  }, [])

  const handleSave = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  const tabs = [
    { id: "profile", label: "Profile", icon: UserIcon },
    { id: "address", label: "Addresses", icon: MapPin },
    { id: "payment", label: "Payment", icon: CreditCard },
    { id: "security", label: "Security", icon: Lock },
    { id: "notifications", label: "Notifications", icon: Bell },
  ]

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold text-foreground tracking-tight">Settings</h1>
        <p className="text-muted-foreground mt-1">Manage your account preferences</p>
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
                  activeTab === tab.id ? "bg-buyer text-white" : "hover:bg-muted text-foreground"
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
                <div className="w-20 h-20 rounded-full bg-buyer/10 flex items-center justify-center">
                  <span className="text-2xl font-bold text-buyer">{formData.name.charAt(0)}</span>
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

          {activeTab === "address" && (
            <div className="bg-card rounded-2xl border border-border p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold">Delivery Addresses</h2>
                <Button className="bg-buyer hover:bg-buyer/90">Add Address</Button>
              </div>
              <div className="space-y-4">
                <div className="border border-buyer rounded-xl p-4 relative">
                  <span className="absolute top-3 right-3 bg-buyer text-white text-xs px-2 py-1 rounded-full">
                    Default
                  </span>
                  <p className="font-medium">Home</p>
                  <p className="text-muted-foreground mt-1">{formData.address || "123 Main Street"}</p>
                  <p className="text-muted-foreground">
                    {formData.city}, {formData.postalCode}
                  </p>
                  <div className="flex gap-2 mt-3">
                    <Button variant="outline" size="sm">
                      Edit
                    </Button>
                    <Button variant="outline" size="sm" className="text-red-500 hover:text-red-600 bg-transparent">
                      Delete
                    </Button>
                  </div>
                </div>
                <div className="border border-border rounded-xl p-4">
                  <p className="font-medium">Office</p>
                  <p className="text-muted-foreground mt-1">456 Business Ave</p>
                  <p className="text-muted-foreground">Baguio City, 2600</p>
                  <div className="flex gap-2 mt-3">
                    <Button variant="outline" size="sm">
                      Edit
                    </Button>
                    <Button variant="outline" size="sm">
                      Set Default
                    </Button>
                    <Button variant="outline" size="sm" className="text-red-500 hover:text-red-600 bg-transparent">
                      Delete
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "payment" && (
            <div className="bg-card rounded-2xl border border-border p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold">Payment Methods</h2>
                <Button className="bg-buyer hover:bg-buyer/90">Add Method</Button>
              </div>
              <div className="space-y-4">
                <div className="border border-border rounded-xl p-4 flex items-center gap-4">
                  <div className="w-12 h-8 bg-gradient-to-r from-blue-600 to-blue-400 rounded flex items-center justify-center text-white text-xs font-bold">
                    VISA
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">•••• •••• •••• 4242</p>
                    <p className="text-sm text-muted-foreground">Expires 12/26</p>
                  </div>
                  <Button variant="outline" size="sm">
                    Remove
                  </Button>
                </div>
                <div className="border border-border rounded-xl p-4 flex items-center gap-4">
                  <div className="w-12 h-8 bg-blue-500 rounded flex items-center justify-center text-white text-xs font-bold">
                    GCash
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">+63 917 •••• 567</p>
                    <p className="text-sm text-muted-foreground">Mobile Wallet</p>
                  </div>
                  <Button variant="outline" size="sm">
                    Remove
                  </Button>
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
                    <Label htmlFor="current-password">Current Password</Label>
                    <Input id="current-password" type="password" placeholder="••••••••" className="h-12" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="new-password">New Password</Label>
                    <Input id="new-password" type="password" placeholder="••••••••" className="h-12" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirm-password">Confirm New Password</Label>
                    <Input id="confirm-password" type="password" placeholder="••••••••" className="h-12" />
                  </div>
                  <Button className="bg-buyer hover:bg-buyer/90">Update Password</Button>
                </div>
              </div>
              <div className="bg-card rounded-2xl border border-border p-6">
                <div className="flex items-start gap-4">
                  <Shield className="w-6 h-6 text-buyer mt-1" />
                  <div className="flex-1">
                    <h3 className="font-semibold">Two-Factor Authentication</h3>
                    <p className="text-sm text-muted-foreground mt-1">Add an extra layer of security to your account</p>
                  </div>
                  <Button variant="outline">Enable</Button>
                </div>
              </div>
              <div className="bg-card rounded-2xl border border-red-200 p-6">
                <div className="flex items-start gap-4">
                  <Trash2 className="w-6 h-6 text-red-500 mt-1" />
                  <div className="flex-1">
                    <h3 className="font-semibold text-red-600">Delete Account</h3>
                    <p className="text-sm text-muted-foreground mt-1">Permanently delete your account and all data</p>
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
                  <h3 className="font-medium mb-4">Order Updates</h3>
                  <div className="space-y-3">
                    {[
                      { label: "Order confirmation", checked: true },
                      { label: "Shipping updates", checked: true },
                      { label: "Delivery notifications", checked: true },
                    ].map((item, idx) => (
                      <label key={idx} className="flex items-center justify-between cursor-pointer">
                        <span>{item.label}</span>
                        <input type="checkbox" defaultChecked={item.checked} className="w-5 h-5 rounded accent-buyer" />
                      </label>
                    ))}
                  </div>
                </div>
                <div className="border-t border-border pt-6">
                  <h3 className="font-medium mb-4">Promotions</h3>
                  <div className="space-y-3">
                    {[
                      { label: "New products from favorite farmers", checked: true },
                      { label: "Special offers and discounts", checked: false },
                      { label: "Weekly newsletter", checked: false },
                    ].map((item, idx) => (
                      <label key={idx} className="flex items-center justify-between cursor-pointer">
                        <span>{item.label}</span>
                        <input type="checkbox" defaultChecked={item.checked} className="w-5 h-5 rounded accent-buyer" />
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Save Button */}
          <div className="flex justify-end mt-6">
            <Button onClick={handleSave} className="bg-buyer hover:bg-buyer/90 px-8 h-12">
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
