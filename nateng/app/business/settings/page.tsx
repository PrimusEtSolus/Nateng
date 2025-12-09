"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { getCurrentUser } from "@/lib/auth"
import { type User } from "@/lib/types"
import { usersAPI } from "@/lib/api-client"
import { useBanEnforcement } from "@/hooks/useBanEnforcement"
import { Building2, MapPin, Lock, Bell, Shield, Banknote, FileText, Check, Trash2, Users, Loader2 } from "lucide-react"
import { toast } from "sonner"

export default function BusinessSettingsPage() {
  const [user, setUser] = useState<User | null>(null)
  const [activeTab, setActiveTab] = useState("business")
  const [saved, setSaved] = useState(false)
  
  // Check if user is banned and enforce restrictions
  const { banStatus, isLoading: banLoading } = useBanEnforcement()
  const [formData, setFormData] = useState({
    businessName: "",
    ownerName: "",
    email: "",
    phone: "",
    address: "",
    businessType: "reseller",
    taxId: "",
  })

  useEffect(() => {
    const currentUser = getCurrentUser()
    if (currentUser) {
      setUser(currentUser)
      setFormData({
        businessName: currentUser.businessName || "",
        ownerName: currentUser.name,
        email: currentUser.email,
        phone: "", // Not stored in User model yet
        address: "", // Not stored in User model yet
        businessType: "", // Not stored in User model yet
        taxId: "",
      })
    }
  }, [])

  const [isSaving, setIsSaving] = useState(false)

  const handleSave = async () => {
    if (!user) {
      toast.error("Please log in to save settings")
      return
    }

    // Validate required fields
    if (!formData.ownerName || !formData.email) {
      toast.error("Owner name and email are required")
      return
    }

    setIsSaving(true)
    try {
      // Only save fields that exist in the User model (name, email)
      // Note: businessName, phone, address, businessType are not in the User model yet
      const updatedUser = await usersAPI.update(user.id, {
        name: formData.ownerName,
        email: formData.email,
      })

      setUser(updatedUser)
      setSaved(true)
      toast.success("Profile updated successfully!")
      setTimeout(() => setSaved(false), 3000)

      // Show info about fields that couldn't be saved
      if (formData.businessName || formData.phone || formData.address || formData.businessType) {
        toast.info("Note: Business name, phone, address, and business type are not saved yet. These fields will be available in a future update.", {
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
    { id: "business", label: "Business Info", icon: Building2 },
    { id: "address", label: "Location", icon: MapPin },
    { id: "billing", label: "Billing", icon: Banknote },
    { id: "documents", label: "Documents", icon: FileText },
    { id: "team", label: "Team", icon: Users },
    { id: "security", label: "Security", icon: Lock },
    { id: "notifications", label: "Notifications", icon: Bell },
  ]

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold text-foreground tracking-tight">Settings</h1>
        <p className="text-muted-foreground mt-1">Manage your business account</p>
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
                  activeTab === tab.id ? "bg-business text-white" : "hover:bg-muted text-foreground"
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
          {activeTab === "business" && (
            <div className="bg-card rounded-2xl border border-border p-6">
              <h2 className="text-xl font-semibold mb-6">Business Information</h2>
              <div className="flex items-center gap-4 mb-8">
                <div className="w-20 h-20 rounded-2xl bg-business/10 flex items-center justify-center">
                  <Building2 className="w-10 h-10 text-business" />
                </div>
                <div>
                  <Button variant="outline" size="sm">
                    Upload Logo
                  </Button>
                  <p className="text-sm text-muted-foreground mt-1">PNG, JPG. Max 2MB</p>
                </div>
              </div>
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="businessName">Business Name</Label>
                  <Input
                    id="businessName"
                    value={formData.businessName}
                    onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                    className="h-12"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ownerName">Owner Name</Label>
                  <Input
                    id="ownerName"
                    value={formData.ownerName}
                    onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })}
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
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="h-12"
                    placeholder="+63 XXX XXX XXXX"
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="businessType">Business Type</Label>
                  <select
                    id="businessType"
                    value={formData.businessType}
                    onChange={(e) => setFormData({ ...formData, businessType: e.target.value })}
                    className="w-full h-12 px-3 rounded-lg border border-input bg-background"
                  >
                    <option value="reseller">Reseller (Market Stall / Retailer)</option>
                    <option value="consumption">Consumption (Restaurant / Hotel)</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {activeTab === "address" && (
            <div className="bg-card rounded-2xl border border-border p-6">
              <h2 className="text-xl font-semibold mb-6">Business Location</h2>
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="address">Full Address</Label>
                  <Input
                    id="address"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="h-12"
                    placeholder="Street, Building, Barangay"
                  />
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>City</Label>
                    <Input defaultValue="Baguio City" className="h-12" />
                  </div>
                  <div className="space-y-2">
                    <Label>Postal Code</Label>
                    <Input defaultValue="2600" className="h-12" />
                  </div>
                </div>
                <div className="p-4 bg-business/5 rounded-xl border border-business/20">
                  <h4 className="font-medium text-business mb-2">Delivery Address</h4>
                  <p className="text-sm text-muted-foreground">
                    This address will be used for wholesale deliveries from farmers.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === "billing" && (
            <div className="bg-card rounded-2xl border border-border p-6">
              <h2 className="text-xl font-semibold mb-6">Billing & Payments</h2>
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="taxId">Tax ID / TIN</Label>
                  <Input
                    id="taxId"
                    value={formData.taxId}
                    onChange={(e) => setFormData({ ...formData, taxId: e.target.value })}
                    className="h-12"
                    placeholder="XXX-XXX-XXX-XXX"
                  />
                </div>
                <div className="border-t border-border pt-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-medium">Payment Methods</h3>
                    <Button className="bg-business hover:bg-business/90">Add Method</Button>
                  </div>
                  <div className="space-y-3">
                    <div className="border border-border rounded-xl p-4 flex items-center gap-4">
                      <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center text-white text-sm font-bold">
                        GC
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">GCash Business</p>
                        <p className="text-sm text-muted-foreground">+63 919 •••• 789</p>
                      </div>
                      <span className="text-xs bg-business text-white px-2 py-1 rounded-full">Default</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "documents" && (
            <div className="bg-card rounded-2xl border border-border p-6">
              <h2 className="text-xl font-semibold mb-6">Business Documents</h2>
              <div className="space-y-4">
                {[
                  { name: "Business Permit", status: "verified", date: "Valid until Dec 2025" },
                  { name: "DTI/SEC Registration", status: "verified", date: "Uploaded Nov 2024" },
                  { name: "BIR Registration", status: "pending", date: "Under review" },
                ].map((doc, idx) => (
                  <div key={idx} className="border border-border rounded-xl p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <FileText className="w-8 h-8 text-muted-foreground" />
                      <div>
                        <p className="font-medium">{doc.name}</p>
                        <p className="text-sm text-muted-foreground">{doc.date}</p>
                      </div>
                    </div>
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${
                        doc.status === "verified" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {doc.status}
                    </span>
                  </div>
                ))}
                <Button variant="outline" className="w-full mt-4 bg-transparent">
                  Upload New Document
                </Button>
              </div>
            </div>
          )}

          {activeTab === "team" && (
            <div className="bg-card rounded-2xl border border-border p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold">Team Members</h2>
                <Button className="bg-business hover:bg-business/90">Invite Member</Button>
              </div>
              <div className="space-y-4">
                <div className="border border-border rounded-xl p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-business/10 flex items-center justify-center">
                      <span className="font-medium text-business">P</span>
                    </div>
                    <div>
                      <p className="font-medium">Pedro Reyes</p>
                      <p className="text-sm text-muted-foreground">Owner</p>
                    </div>
                  </div>
                  <span className="text-xs bg-business text-white px-2 py-1 rounded-full">Admin</span>
                </div>
                <div className="border border-border rounded-xl p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                      <span className="font-medium">M</span>
                    </div>
                    <div>
                      <p className="font-medium">Maria Staff</p>
                      <p className="text-sm text-muted-foreground">Staff</p>
                    </div>
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
                  <Button className="bg-business hover:bg-business/90">Update Password</Button>
                </div>
              </div>
              <div className="bg-card rounded-2xl border border-border p-6">
                <div className="flex items-start gap-4">
                  <Shield className="w-6 h-6 text-business mt-1" />
                  <div className="flex-1">
                    <h3 className="font-semibold">Two-Factor Authentication</h3>
                    <p className="text-sm text-muted-foreground mt-1">Add extra security</p>
                  </div>
                  <Button variant="outline">Enable</Button>
                </div>
              </div>
              <div className="bg-card rounded-2xl border border-red-200 p-6">
                <div className="flex items-start gap-4">
                  <Trash2 className="w-6 h-6 text-red-500 mt-1" />
                  <div className="flex-1">
                    <h3 className="font-semibold text-red-600">Delete Business Account</h3>
                    <p className="text-sm text-muted-foreground mt-1">This action cannot be undone</p>
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
                      { label: "Order confirmations", checked: true },
                      { label: "Delivery updates", checked: true },
                      { label: "Payment receipts", checked: true },
                    ].map((item, idx) => (
                      <label key={idx} className="flex items-center justify-between cursor-pointer">
                        <span>{item.label}</span>
                        <input
                          type="checkbox"
                          defaultChecked={item.checked}
                          className="w-5 h-5 rounded accent-business"
                        />
                      </label>
                    ))}
                  </div>
                </div>
                <div className="border-t border-border pt-6">
                  <h3 className="font-medium mb-4">Inventory & Stock</h3>
                  <div className="space-y-3">
                    {[
                      { label: "Low stock alerts", checked: true },
                      { label: "New products from farmers", checked: true },
                      { label: "Price change notifications", checked: false },
                    ].map((item, idx) => (
                      <label key={idx} className="flex items-center justify-between cursor-pointer">
                        <span>{item.label}</span>
                        <input
                          type="checkbox"
                          defaultChecked={item.checked}
                          className="w-5 h-5 rounded accent-business"
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
            <Button 
              onClick={handleSave} 
              className="bg-business hover:bg-business/90 px-8 h-12"
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
                "Save Changes"
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
