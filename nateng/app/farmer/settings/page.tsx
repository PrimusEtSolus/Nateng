"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { getCurrentUser, logout } from "@/lib/auth"
import { type User } from "@/lib/types"
import { usersAPI } from "@/lib/api-client"
import { benguetMunicipalities } from "@/lib/mock-data"
import { UserIcon, MapPin, Lock, Bell, Shield, Banknote, Truck, Check, Trash2, Loader2 } from "lucide-react"
import { toast } from "sonner"

export default function FarmerSettingsPage() {
  const [user, setUser] = useState<User | null>(null)
  const [activeTab, setActiveTab] = useState("profile")
  const [saved, setSaved] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [passwordData, setPasswordData] = useState({
    current: "",
    new: "",
    confirm: "",
  })
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  const [profilePhoto, setProfilePhoto] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false)
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
        email: currentUser.phone || currentUser.email, // Farmers use mobile number as primary contact
        phone: currentUser.phone || currentUser.email, // Show mobile number
        municipality: currentUser.city || currentUser.address || "",
        barangay: currentUser.barangay || "",
        farmSize: currentUser.farmSize || "",
      })
      // Set existing profile photo if available
      if (currentUser.profilePhotoUrl) {
        setPhotoPreview(currentUser.profilePhotoUrl)
      }
    } else {
      // Redirect to login if no user
      window.location.href = "/login"
    }
  }, [])

  const handlePasswordChange = async () => {
    if (!passwordData.current || !passwordData.new || !passwordData.confirm) {
      toast.error("All password fields are required")
      return
    }
    if (passwordData.new !== passwordData.confirm) {
      toast.error("New passwords do not match")
      return
    }
    if (passwordData.new.length < 6) {
      toast.error("Password must be at least 6 characters")
      return
    }

    setIsChangingPassword(true)
    try {
      // This would need a dedicated API endpoint for password changes
      toast.info("Password change endpoint not implemented yet. Coming soon!")
      setPasswordData({ current: "", new: "", confirm: "" })
    } catch (error: any) {
      toast.error(error.message || "Failed to change password")
    } finally {
      setIsChangingPassword(false)
    }
  }

  const handleLogout = () => {
    logout()
    window.location.href = "/login"
  }

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validate file size (2MB max)
      if (file.size > 2 * 1024 * 1024) {
        toast.error("Photo must be less than 2MB")
        return
      }
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error("Please select an image file")
        return
      }
      setProfilePhoto(file)
      // Create preview
      const reader = new FileReader()
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handlePhotoUpload = async () => {
    if (!profilePhoto || !user) return
    
    setIsUploadingPhoto(true)
    try {
      // Create FormData for upload
      const formData = new FormData()
      formData.append('image', profilePhoto)
      formData.append('type', 'profile')

      // Upload to server
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Upload failed')
      }

      const { imageUrl } = await response.json()

      // Update user with new photo URL
      const updatedUser = await usersAPI.update(user.id, {
        profilePhotoUrl: imageUrl,
      })

      // Update state and localStorage
      setUser(updatedUser)
      if (typeof window !== "undefined") {
        localStorage.setItem("natenghub_user", JSON.stringify(updatedUser))
      }

      // Update photo preview
      setPhotoPreview(imageUrl)
      setProfilePhoto(null)

      toast.success("Photo uploaded and saved successfully!")
    } catch (error: any) {
      toast.error(error.message || "Failed to upload photo")
    } finally {
      setIsUploadingPhoto(false)
    }
  }

  const handleSave = async () => {
    if (!user) {
      toast.error("Please log in to save settings")
      return
    }

    // Validate required fields
    if (!formData.name || !formData.phone) {
      toast.error("Name and mobile number are required")
      return
    }

    // Validate mobile number format
    const mobileRegex = /^09\d{9}$/
    if (!mobileRegex.test(formData.phone)) {
      toast.error("Please enter a valid mobile number (e.g., 09123456789)")
      return
    }

    setIsSaving(true)
    try {
      // Save name and phone number for farmers
      const updatedUser = await usersAPI.update(user.id, {
        name: formData.name,
        phone: formData.phone,
        // Keep email field for backward compatibility
        email: user.email,
      })

      // Update state
      setUser(updatedUser)

      // Persist to localStorage so getCurrentUser reflects the change
      if (typeof window !== "undefined") {
        localStorage.setItem("natenghub_user", JSON.stringify(updatedUser))
      }

      setSaved(true)
      toast.success("Profile updated successfully!")
      setTimeout(() => setSaved(false), 3000)

      // Show info about fields that couldn't be saved
      if (formData.phone || formData.municipality || formData.barangay || formData.farmSize) {
        toast.info("Note: Phone, municipality, and farm details are not saved yet. These fields will be available in a future update.", {
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
                <div className="w-20 h-20 rounded-full bg-farmer/10 flex items-center justify-center overflow-hidden">
                  {photoPreview ? (
                    <img src={photoPreview} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-2xl font-bold text-farmer">{formData.name.charAt(0)}</span>
                  )}
                </div>
                <div>
                  <input
                    type="file"
                    id="photo-upload"
                    accept="image/*"
                    onChange={handlePhotoChange}
                    className="hidden"
                  />
                  <Button asChild variant="outline" size="sm">
                    <label htmlFor="photo-upload" className="cursor-pointer">
                      Change Photo
                    </label>
                  </Button>
                  {photoPreview && (
                    <Button
                      onClick={handlePhotoUpload}
                      className="ml-2 bg-farmer hover:bg-farmer-light"
                      size="sm"
                      disabled={isUploadingPhoto}
                    >
                      {isUploadingPhoto ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Uploading...
                        </>
                      ) : (
                        "Upload"
                      )}
                    </Button>
                  )}
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
                  <Label htmlFor="mobile">Mobile Number</Label>
                  <Input
                    id="mobile"
                    type="tel"
                    placeholder="09123456789"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="h-12"
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
                    <Input
                      type="password"
                      placeholder="••••••••"
                      className="h-12"
                      value={passwordData.current}
                      onChange={(e) => setPasswordData({ ...passwordData, current: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>New Password</Label>
                    <Input
                      type="password"
                      placeholder="••••••••"
                      className="h-12"
                      value={passwordData.new}
                      onChange={(e) => setPasswordData({ ...passwordData, new: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Confirm New Password</Label>
                    <Input
                      type="password"
                      placeholder="••••••••"
                      className="h-12"
                      value={passwordData.confirm}
                      onChange={(e) => setPasswordData({ ...passwordData, confirm: e.target.value })}
                    />
                  </div>
                  <Button
                    className="bg-farmer hover:bg-farmer-light"
                    onClick={handlePasswordChange}
                    disabled={isChangingPassword}
                  >
                    {isChangingPassword ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Updating...
                      </>
                    ) : (
                      "Update Password"
                    )}
                  </Button>
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
            <Button 
              onClick={handleSave} 
              className="bg-farmer hover:bg-farmer-light px-8 h-12"
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
