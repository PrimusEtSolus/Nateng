"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { getCurrentUser, logout } from "@/lib/auth"
import { type User } from "@/lib/types"
import { usersAPI } from "@/lib/api-client"
import { UserIcon, MapPin, Lock, Check, Loader2 } from "lucide-react"
import { toast } from "sonner"

export default function FarmerSettingsPage() {
  const [user, setUser] = useState<User | null>(null)
  const [activeTab, setActiveTab] = useState("profile")
  const [saved, setSaved] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
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
    minimumOrderKg: 0,
    deliveryAreas: "",
    paymentMethods: "",
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
        minimumOrderKg: currentUser.minimumOrderKg || 50,
        deliveryAreas: currentUser.deliveryAreas || "",
        paymentMethods: currentUser.paymentMethods || "",
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

  const handleLogout = async () => {
    await logout()
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

      // Update state (user data persists via session API)
      setUser(updatedUser)

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
      // Save name and phone number for farmers, plus new settings fields
      const updatedUser = await usersAPI.update(user.id, {
        name: formData.name,
        phone: formData.phone,
        minimumOrderKg: formData.minimumOrderKg,
        deliveryAreas: formData.deliveryAreas,
        paymentMethods: formData.paymentMethods,
        // Keep email field for backward compatibility
        email: user.email,
      })

      // Update state
      setUser(updatedUser)

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
    { id: "security", label: "Security", icon: Lock },
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
                  <Input
                    id="municipality"
                    value={formData.municipality}
                    onChange={(e) => setFormData({ ...formData, municipality: e.target.value })}
                    className="h-12"
                    placeholder="e.g., La Trinidad"
                  />
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

          {activeTab === "security" && (
            <div className="bg-card rounded-2xl border border-border p-6">
              <h2 className="text-xl font-semibold mb-4">Security</h2>
              <p className="text-muted-foreground">Security settings coming soon.</p>
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
