"use client"

import { useState, useEffect } from "react"
import { getCurrentUser } from "@/lib/auth"
import { type User } from "@/lib/types"
import { useFetch } from "@/hooks/use-fetch"
import { productsAPI, listingsAPI } from "@/lib/api-client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Search, Edit2, Trash2, Package, Loader2 } from "lucide-react"
import { toast } from "sonner"

interface Product {
  id: number
  name: string
  description: string | null
  imageUrl: string | null
  farmerId: number
  createdAt: string
  listings: Array<{
    id: number
    quantity: number
    priceCents: number
    available: boolean
  }>
}

export default function FarmerCropsPage() {
  const [user, setUser] = useState<User | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [isUpdating, setIsUpdating] = useState(false)
  const [newCrop, setNewCrop] = useState({
    name: "",
    description: "",
    priceCents: "",
    quantity: "",
  })
  const [editCrop, setEditCrop] = useState({
    name: "",
    description: "",
    priceCents: "",
    quantity: "",
    imageUrl: "",
  })
  const [productPhoto, setProductPhoto] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false)

  useEffect(() => {
    setUser(getCurrentUser())
  }, [])

  // Fetch farmer's products
  const { data: productsResponse, loading: productsLoading, refetch: refetchProducts } = useFetch<{ products: Product[] }>(
    user ? `/api/products` : '',
    { skip: !user }
  )

  // Extract products from response
  const allProducts = productsResponse?.products || null

  // Filter products by current farmer
  const products = Array.isArray(allProducts) ? allProducts.filter((p) => p.farmerId === user?.id) || [] : []
  const filteredCrops = Array.isArray(products) ? products.filter((p) => p.name.toLowerCase().includes(searchTerm.toLowerCase())) : []

  const handleAddCrop = async () => {
    if (!user || !newCrop.name || !newCrop.priceCents || !newCrop.quantity) {
      toast.error("Please fill in all required fields")
      return
    }

    setIsCreating(true)
    try {
      // Step 1: Create product (Farmer → Product)
      const product = await productsAPI.create({
        name: newCrop.name,
        description: newCrop.description || null,
        farmerId: user.id,
      })

      // Step 2: Create listing (Product → Listing) - following architecture flow
      await listingsAPI.create({
        productId: product.id,
        sellerId: user.id,
        priceCents: Math.round(Number(newCrop.priceCents) * 100), // Convert to cents
        quantity: Number(newCrop.quantity),
        available: true,
      })

      toast.success("Crop and listing created successfully!")
      handleCloseModal()
      refetchProducts()
    } catch (error: any) {
      toast.error(error.message || "Failed to create crop")
    } finally {
      setIsCreating(false)
    }
  }

  const handleEditCrop = (product: Product) => {
    // Get the first listing for this product (or use the first available one)
    const listing = product.listings[0]
    setEditingProduct(product)
    setEditCrop({
      name: product.name,
      description: product.description || "",
      priceCents: listing ? (listing.priceCents / 100).toString() : "",
      quantity: listing ? listing.quantity.toString() : "",
      imageUrl: product.imageUrl || "",
    })
    setPhotoPreview(product.imageUrl)
    setIsEditModalOpen(true)
  }

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Photo must be less than 5MB")
        return
      }
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error("Please select an image file")
        return
      }
      setProductPhoto(file)
      // Create preview
      const reader = new FileReader()
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handlePhotoUpload = async () => {
    if (!productPhoto) return
    
    setIsUploadingPhoto(true)
    try {
      // Create FormData for upload
      const formData = new FormData()
      formData.append('image', productPhoto)
      formData.append('type', 'products')

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
      setEditCrop({ ...editCrop, imageUrl })
      setProductPhoto(null)
      
      toast.success("Photo uploaded successfully!")
    } catch (error: any) {
      toast.error(error.message || "Failed to upload photo")
    } finally {
      setIsUploadingPhoto(false)
    }
  }

  const handleUpdateCrop = async () => {
    if (!user || !editingProduct || !editCrop.name || !editCrop.priceCents || !editCrop.quantity) {
      toast.error("Please fill in all required fields")
      return
    }

    setIsUpdating(true)
    try {
      // Step 1: Update product (name, description, imageUrl)
      await productsAPI.update(editingProduct.id, {
        name: editCrop.name,
        description: editCrop.description || null,
        imageUrl: editCrop.imageUrl || null,
      })

      // Step 2: Update or create listing (price, quantity)
      // If there are multiple listings, we update the first one
      // If no listings exist, create a new one
      if (editingProduct.listings.length > 0) {
        const listingId = editingProduct.listings[0].id
        await listingsAPI.update(listingId, {
          priceCents: Math.round(Number(editCrop.priceCents) * 100), // Convert to cents
          quantity: Number(editCrop.quantity),
        })
      } else {
        // Create a new listing if none exists
        await listingsAPI.create({
          productId: editingProduct.id,
          sellerId: user.id,
          priceCents: Math.round(Number(editCrop.priceCents) * 100), // Convert to cents
          quantity: Number(editCrop.quantity),
          available: true,
        })
      }

      toast.success("Crop updated successfully!")
      handleCloseEditModal()
      refetchProducts()
    } catch (error: any) {
      toast.error(error.message || "Failed to update crop")
    } finally {
      setIsUpdating(false)
    }
  }

  const handleDeleteCrop = async (id: number) => {
    if (!confirm("Are you sure you want to delete this product? This will also delete all associated listings.")) {
      return
    }

    try {
      await productsAPI.delete(id)
      toast.success("Product deleted successfully")
      refetchProducts()
    } catch (error: any) {
      toast.error(error.message || "Failed to delete product")
    }
  }

  const handleCloseModal = () => {
    setIsAddModalOpen(false)
    setNewCrop({ name: "", description: "", priceCents: "", quantity: "" })
  }

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false)
    setEditingProduct(null)
    setEditCrop({ name: "", description: "", priceCents: "", quantity: "", imageUrl: "" })
    setProductPhoto(null)
    setPhotoPreview(null)
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">My Crops</h1>
          <p className="text-muted-foreground mt-1">Manage your crop inventory and wholesale pricing</p>
        </div>
        <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
          <DialogTrigger asChild>
            <Button className="bg-farmer hover:bg-farmer-light text-white gap-2">
              <Plus className="w-5 h-5" />
              Add Crop
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Add New Crop</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Crop Name</Label>
                <Input
                  id="name"
                  value={newCrop.name}
                  onChange={(e) => setNewCrop({ ...newCrop, name: e.target.value })}
                  placeholder="e.g. Tomatoes"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="quantity">Quantity (kg)</Label>
                  <Input
                    id="quantity"
                    type="number"
                    value={newCrop.quantity}
                    onChange={(e) => setNewCrop({ ...newCrop, quantity: e.target.value })}
                    placeholder="500"
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="price">Price (₱/kg)</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    value={newCrop.priceCents}
                    onChange={(e) => setNewCrop({ ...newCrop, priceCents: e.target.value })}
                    placeholder="60.00"
                    required
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  value={newCrop.description}
                  onChange={(e) => setNewCrop({ ...newCrop, description: e.target.value })}
                  placeholder="Fresh from Benguet highlands..."
                />
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={handleCloseModal} disabled={isCreating}>
                Cancel
              </Button>
              <Button 
                onClick={handleAddCrop} 
                className="bg-farmer hover:bg-farmer-light" 
                disabled={isCreating}
              >
                {isCreating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Add Crop"
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Edit Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Crop</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-name">Crop Name</Label>
              <Input id="edit-name" value={editCrop.name} onChange={(e) => setEditCrop({ ...editCrop, name: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-quantity">Quantity (kg)</Label>
                <Input id="edit-quantity" type="number" value={editCrop.quantity} onChange={(e) => setEditCrop({ ...editCrop, quantity: e.target.value })} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-price">Price (₱/kg)</Label>
                <Input id="edit-price" type="number" step="0.01" value={editCrop.priceCents} onChange={(e) => setEditCrop({ ...editCrop, priceCents: e.target.value })} />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-description">Description</Label>
              <Input id="edit-description" value={editCrop.description} onChange={(e) => setEditCrop({ ...editCrop, description: e.target.value })} />
            </div>
            <div className="grid gap-2">
              <Label>Product Photo</Label>
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 bg-muted rounded-lg overflow-hidden">
                  {photoPreview ? <img src={photoPreview} alt="Product" className="w-full h-full object-cover" /> : <Package className="w-full h-full p-4 text-muted-foreground" />}
                </div>
                <div className="flex-1">
                  <input type="file" id="edit-photo" accept="image/*" onChange={handlePhotoChange} className="hidden" />
                  <Button asChild variant="outline" size="sm">
                    <label htmlFor="edit-photo" className="cursor-pointer">Choose Photo</label>
                  </Button>
                  {productPhoto && <Button onClick={handlePhotoUpload} className="ml-2 bg-farmer hover:bg-farmer-light" size="sm" disabled={isUploadingPhoto}>
                    {isUploadingPhoto ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Uploading...</> : "Upload"}
                  </Button>}
                  <p className="text-xs text-muted-foreground mt-1">JPG, PNG. Max 5MB</p>
                </div>
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={handleCloseEditModal} disabled={isUpdating}>Cancel</Button>
            <Button onClick={handleUpdateCrop} className="bg-farmer hover:bg-farmer-light" disabled={isUpdating}>
              {isUpdating ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Updating...</> : "Update Crop"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Search */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            placeholder="Search crops..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Loading State */}
      {productsLoading && (
        <div className="text-center py-12">
          <Loader2 className="w-8 h-8 text-muted-foreground mx-auto mb-4 animate-spin" />
          <p className="text-muted-foreground">Loading products...</p>
        </div>
      )}

      {/* Crops Grid */}
      {!productsLoading && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCrops.map((product) => {
              const totalQuantity = product.listings.reduce((sum, l) => sum + (l.available ? l.quantity : 0), 0)
              const hasAvailable = product.listings.some((l) => l.available && l.quantity > 0)
              const avgPrice = product.listings.length > 0
                ? product.listings.reduce((sum, l) => sum + l.priceCents, 0) / product.listings.length / 100
                : 0

              return (
                <div
                  key={product.id}
                  className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden hover:shadow-md transition-shadow"
                >
                  <div className="aspect-video bg-muted relative flex items-center justify-center">
                    {product.imageUrl ? <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" /> : <Package className="w-12 h-12 text-muted-foreground" />}
                    <span className={`absolute top-3 right-3 px-2 py-1 rounded-full text-xs font-medium ${hasAvailable ? "bg-green-500 text-white" : totalQuantity === 0 ? "bg-red-500 text-white" : "bg-yellow-500 text-white"}`}>
                      {hasAvailable ? "Available" : "Out of Stock"}
                    </span>
                  </div>
                  <div className="p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-semibold text-lg">{product.name}</h3>
                        <p className="text-sm text-muted-foreground line-clamp-2">{product.description || "No description"}</p>
                      </div>
                      <div className="flex gap-1">
                        <button 
                          onClick={() => handleEditCrop(product)}
                          className="p-2 hover:bg-muted rounded-lg transition-colors"
                        >
                          <Edit2 className="w-4 h-4 text-muted-foreground" />
                        </button>
                        <button
                          onClick={() => handleDeleteCrop(product.id)}
                          className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </button>
                      </div>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Available Stock</span>
                        <span className="font-medium">{totalQuantity} kg</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Price</span>
                        <span className="font-medium text-farmer">
                          ₱{avgPrice.toFixed(2)}/kg
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Listings</span>
                        <span className="font-medium">{product.listings.length}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {filteredCrops.length === 0 && (
            <div className="text-center py-12">
              <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-medium text-lg mb-1">No products found</h3>
              <p className="text-muted-foreground">
                {searchTerm ? "Try a different search term" : "Add your first product to get started"}
              </p>
            </div>
          )}
        </>
      )}
    </div>
  )
}
