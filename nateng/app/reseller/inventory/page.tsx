"use client"

import { useState, useEffect } from "react"
import { getCurrentUser } from "@/lib/auth"
import { type User } from "@/lib/types"
import { useFetch } from "@/hooks/use-fetch"
import { listingsAPI } from "@/lib/api-client"
import { Search, Plus, Edit2, Trash2, Package, Loader2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { toast } from "sonner"

interface Listing {
  id: number
  productId: number
  sellerId: number
  priceCents: number
  quantity: number
  available: boolean
  product: {
    id: number
    name: string
    description: string | null
    farmer: {
      id: number
      name: string
      email: string
    }
  }
  seller: {
    id: number
    name: string
    role: string
  }
}

export default function ResellerInventoryPage() {
  const [user, setUser] = useState<User | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [editingListing, setEditingListing] = useState<Listing | null>(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const [editForm, setEditForm] = useState({
    priceCents: "",
    quantity: "",
    available: true,
  })

  useEffect(() => {
    setUser(getCurrentUser())
  }, [])

  // Fetch reseller's listings (inventory)
  const { data: listings, loading: listingsLoading, refetch: refetchListings } = useFetch<Listing[]>(
    user ? `/api/listings?sellerId=${user.id}` : '',
    { skip: !user }
  )

  const filteredListings = listings?.filter((listing) => 
    listing.product.name.toLowerCase().includes(searchQuery.toLowerCase())
  ) || []

  const handleEditListing = (listing: Listing) => {
    setEditingListing(listing)
    setEditForm({
      priceCents: (listing.priceCents / 100).toString(),
      quantity: listing.quantity.toString(),
      available: listing.available,
    })
    setIsEditModalOpen(true)
  }

  const handleUpdateListing = async () => {
    if (!editingListing || !editForm.priceCents || !editForm.quantity) {
      toast.error("Please fill in all required fields")
      return
    }

    setIsUpdating(true)
    try {
      await listingsAPI.update(editingListing.id, {
        priceCents: Math.round(Number(editForm.priceCents) * 100),
        quantity: Number(editForm.quantity),
        available: editForm.available,
      })
      toast.success("Listing updated successfully!")
      setIsEditModalOpen(false)
      setEditingListing(null)
      setEditForm({ priceCents: "", quantity: "", available: true })
      refetchListings()
    } catch (error: any) {
      toast.error(error.message || "Failed to update listing")
    } finally {
      setIsUpdating(false)
    }
  }

  const handleDeleteListing = async (id: number) => {
    if (!confirm("Are you sure you want to delete this listing?")) return
    
    try {
      await listingsAPI.delete(id)
      toast.success("Listing deleted successfully")
      refetchListings()
    } catch (error: any) {
      toast.error(error.message || "Failed to delete listing")
    }
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">My Inventory</h1>
          <p className="text-muted-foreground mt-1">Manage your retail products and set prices for buyers</p>
        </div>
        <Button className="bg-teal-600 hover:bg-teal-700">
          <Plus className="w-5 h-5 mr-2" />
          Add Product
        </Button>
      </div>

      {/* Search */}
      <div className="relative max-w-md mb-8">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <Input
          placeholder="Search products..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-12 h-12 bg-white"
        />
      </div>

      {/* Loading State */}
      {listingsLoading && (
        <div className="bg-white rounded-2xl shadow-sm border border-border p-12 text-center">
          <Loader2 className="w-8 h-8 text-muted-foreground mx-auto mb-4 animate-spin" />
          <p className="text-muted-foreground">Loading inventory...</p>
        </div>
      )}

      {/* Products Table */}
      {!listingsLoading && (
        <div className="bg-white rounded-2xl shadow-sm border border-border overflow-hidden">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left px-6 py-4 text-sm font-semibold text-foreground">Product</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-foreground">Source</th>
                <th className="text-right px-6 py-4 text-sm font-semibold text-foreground">Stock</th>
                <th className="text-right px-6 py-4 text-sm font-semibold text-foreground">Retail Price</th>
                <th className="text-right px-6 py-4 text-sm font-semibold text-foreground">Status</th>
                <th className="text-center px-6 py-4 text-sm font-semibold text-foreground">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredListings.map((listing) => (
                <tr key={listing.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-lg overflow-hidden bg-muted flex items-center justify-center">
                        <Package className="w-6 h-6 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{listing.product.name}</p>
                        <p className="text-sm text-muted-foreground line-clamp-1">
                          {listing.product.description || "Fresh produce"}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <p className="text-sm font-medium">{listing.product.farmer.name}</p>
                      <p className="text-xs text-muted-foreground">Farmer</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Package className="w-4 h-4 text-muted-foreground" />
                      <span className="font-medium">{listing.quantity}kg</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className="font-semibold text-teal-600">₱{(listing.priceCents / 100).toFixed(2)}/kg</span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      listing.available ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"
                    }`}>
                      {listing.available ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center gap-2">
                      <button 
                        onClick={() => handleEditListing(listing)}
                        className="p-2 hover:bg-muted rounded-lg transition-colors"
                      >
                        <Edit2 className="w-4 h-4 text-muted-foreground" />
                      </button>
                      <button 
                        onClick={() => handleDeleteListing(listing.id)}
                        className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredListings.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">
                    {searchQuery ? "No products found matching your search" : "No inventory yet. Buy wholesale to get started!"}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Edit Listing Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Listing</DialogTitle>
          </DialogHeader>
          {editingListing && (
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-product-name">Product</Label>
                <Input
                  id="edit-product-name"
                  value={editingListing.product.name}
                  disabled
                  className="bg-muted"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit-quantity">Quantity (kg)</Label>
                  <Input
                    id="edit-quantity"
                    type="number"
                    value={editForm.quantity}
                    onChange={(e) => setEditForm({ ...editForm, quantity: e.target.value })}
                    placeholder="500"
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-price">Retail Price (₱/kg)</Label>
                  <Input
                    id="edit-price"
                    type="number"
                    step="0.01"
                    value={editForm.priceCents}
                    onChange={(e) => setEditForm({ ...editForm, priceCents: e.target.value })}
                    placeholder="60.00"
                    required
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-available" className="flex items-center gap-2">
                  <input
                    id="edit-available"
                    type="checkbox"
                    checked={editForm.available}
                    onChange={(e) => setEditForm({ ...editForm, available: e.target.checked })}
                    className="w-4 h-4"
                  />
                  Available for sale
                </Label>
              </div>
            </div>
          )}
          <div className="flex justify-end gap-3">
            <Button 
              variant="outline" 
              onClick={() => {
                setIsEditModalOpen(false)
                setEditingListing(null)
                setEditForm({ priceCents: "", quantity: "", available: true })
              }}
              disabled={isUpdating}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleUpdateListing} 
              className="bg-teal-600 hover:bg-teal-700" 
              disabled={isUpdating}
            >
              {isUpdating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                "Update Listing"
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
