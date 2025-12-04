"use client"

import { useState, useEffect } from "react"
import { getCurrentUser, type User } from "@/lib/auth"
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
  const [isCreating, setIsCreating] = useState(false)
  const [newCrop, setNewCrop] = useState({
    name: "",
    description: "",
    priceCents: "",
    quantity: "",
  })

  useEffect(() => {
    setUser(getCurrentUser())
  }, [])

  // Fetch farmer's products
  const { data: allProducts, loading: productsLoading, refetch: refetchProducts } = useFetch<Product[]>(
    user ? `/api/products` : '',
    { skip: !user }
  )

  // Filter products by current farmer
  const products = allProducts?.filter((p) => p.farmerId === user?.id) || []
  const filteredCrops = products.filter((p) => p.name.toLowerCase().includes(searchTerm.toLowerCase()))

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
      setIsAddModalOpen(false)
      setNewCrop({ name: "", description: "", priceCents: "", quantity: "" })
      refetchProducts()
    } catch (error: any) {
      toast.error(error.message || "Failed to create crop")
    } finally {
      setIsCreating(false)
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
              <Button variant="outline" onClick={() => setIsAddModalOpen(false)} disabled={isCreating}>
                Cancel
              </Button>
              <Button onClick={handleAddCrop} className="bg-farmer hover:bg-farmer-light" disabled={isCreating}>
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
                    <Package className="w-12 h-12 text-muted-foreground" />
                    <span
                      className={`absolute top-3 right-3 px-2 py-1 rounded-full text-xs font-medium ${
                        hasAvailable
                          ? "bg-green-500 text-white"
                          : totalQuantity === 0
                            ? "bg-red-500 text-white"
                            : "bg-yellow-500 text-white"
                      }`}
                    >
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
                        <button className="p-2 hover:bg-muted rounded-lg transition-colors">
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
