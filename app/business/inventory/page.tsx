"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, Search, AlertTriangle, Package, TrendingDown, RefreshCw, ClipboardEdit, Loader2, Trash2, Edit, ExternalLink, BarChart3, Clock } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useFetch } from "@/hooks/use-fetch"

interface InventoryItem {
  id: number
  userId: number
  name: string
  inStock: number
  unit: string
  reorderLevel: number
  supplier: string | null
  lastOrderDate: string | null
  imageUrl: string | null
  lastUpdated: string
  createdAt: string
}

export default function BusinessInventoryPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedAdjustmentItem, setSelectedAdjustmentItem] = useState<InventoryItem | null>(null)
  const [adjustmentType, setAdjustmentType] = useState<"increase" | "decrease">("increase")
  const [adjustmentQuantity, setAdjustmentQuantity] = useState("")
  const [adjustmentNote, setAdjustmentNote] = useState("")
  const [isAddStockOpen, setIsAddStockOpen] = useState(false)
  const [newItemName, setNewItemName] = useState("")
  const [newItemQuantity, setNewItemQuantity] = useState("")
  const [newItemUnit, setNewItemUnit] = useState("kg")
  const [newItemReorderLevel, setNewItemReorderLevel] = useState("")
  const [newItemSupplier, setNewItemSupplier] = useState("Juan Dela Cruz")
  const [newItemImage, setNewItemImage] = useState("")

  // Delete confirmation state
  const [itemToDelete, setItemToDelete] = useState<InventoryItem | null>(null)

  // Edit item state
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null)
  const [editName, setEditName] = useState("")
  const [editReorderLevel, setEditReorderLevel] = useState("")
  const [editUnit, setEditUnit] = useState("")

  // Fetch inventory from API
  const { data: inventory = [], loading: inventoryLoading, refetch: refetchInventory } = useFetch<InventoryItem[]>(
    '/api/inventory'
  )

  // Low stock notifications
  useEffect(() => {
    if (!inventoryLoading && inventory && inventory.length > 0) {
      const lowStock = inventory.filter(item => item.inStock <= item.reorderLevel)
      if (lowStock.length > 0) {
        toast.warning(`${lowStock.length} item(s) need reordering`, {
          description: lowStock.map(i => `${i.name}: ${i.inStock}${i.unit} left`).join(', '),
          duration: 5000,
        })
      }
    }
  }, [inventory, inventoryLoading])

  const filteredInventory = (inventory || []).filter((item) => item.name.toLowerCase().includes(searchTerm.toLowerCase()))

  const lowStockItems = (inventory || []).filter((item) => item.inStock <= item.reorderLevel)
  const totalItems = (inventory || []).length
  const totalStock = (inventory || []).reduce((sum, item) => sum + item.inStock, 0)

  const getStockStatus = (item: InventoryItem) => {
    const ratio = item.inStock / item.reorderLevel
    const percentage = Math.min(100, Math.round((item.inStock / (item.reorderLevel * 2)) * 100))
    if (ratio <= 1) return { label: "Low Stock", color: "text-red-600 bg-red-50 border-red-200", progressColor: "bg-red-600", percentage }
    if (ratio <= 1.5) return { label: "Running Low", color: "text-yellow-600 bg-yellow-50 border-yellow-200", progressColor: "bg-yellow-600", percentage }
    return { label: "In Stock", color: "text-green-600 bg-green-50 border-green-200", progressColor: "bg-green-600", percentage }
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Never"
    const date = new Date(dateString)
    const now = new Date()
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))
    if (diffDays === 0) return "Today"
    if (diffDays === 1) return "Yesterday"
    if (diffDays < 7) return `${diffDays} days ago`
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  const handleReorderClick = (item: InventoryItem) => {
    // Navigate to browse wholesale page with pre-filled search
    window.location.href = `/business/browse?search=${encodeURIComponent(item.name)}`
  }

  const handleDeleteItem = async () => {
    if (!itemToDelete) return

    try {
      const response = await fetch(`/api/inventory/${itemToDelete.id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete item')
      }

      toast.success("Item deleted", {
        description: `${itemToDelete.name} has been removed from inventory.`,
      })

      setItemToDelete(null)
      refetchInventory()
    } catch (error: any) {
      toast.error("Failed to delete", {
        description: error.message || "Please try again",
      })
    }
  }

  const handleEditItem = async () => {
    if (!editingItem) return

    try {
      const response = await fetch(`/api/inventory/${editingItem.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editName,
          reorderLevel: Number(editReorderLevel),
          unit: editUnit,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        console.error('API error:', errorData)
        throw new Error(errorData.error || errorData.details || 'Failed to update item')
      }

      toast.success("Item updated", {
        description: `${editName} has been updated.`,
      })

      setEditingItem(null)
      refetchInventory()
    } catch (error: any) {
      toast.error("Failed to update", {
        description: error.message || "Please try again",
      })
    }
  }

  const openEditDialog = (item: InventoryItem) => {
    setEditingItem(item)
    setEditName(item.name)
    setEditReorderLevel(item.reorderLevel.toString())
    setEditUnit(item.unit)
  }

  const handleOpenAdjustment = (item: InventoryItem) => {
    setSelectedAdjustmentItem(item)
    setAdjustmentType("increase")
    setAdjustmentQuantity("")
    setAdjustmentNote("")
  }

  const handleApplyAdjustment = async () => {
    if (!selectedAdjustmentItem || !adjustmentQuantity) return
    const qty = Number(adjustmentQuantity)
    if (Number.isNaN(qty) || qty <= 0) return

    try {
      const response = await fetch(`/api/inventory/${selectedAdjustmentItem.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          quantity: qty,
          adjustmentType,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        console.error('API error:', errorData)
        throw new Error(errorData.error || errorData.details || 'Failed to update inventory')
      }

      toast.success("Inventory updated", {
        description: `${selectedAdjustmentItem.name} adjusted by ${adjustmentType === "increase" ? "+" : "-"}${qty}${
          selectedAdjustmentItem.unit
        }${adjustmentNote ? ` • ${adjustmentNote}` : ""}`,
      })

      setSelectedAdjustmentItem(null)
      setAdjustmentQuantity("")
      setAdjustmentNote("")
      refetchInventory()
    } catch (error: any) {
      toast.error("Failed to update inventory", {
        description: error.message || "Please try again",
      })
    }
  }

  const handleAddStock = async () => {
    if (!newItemName || !newItemQuantity || !newItemReorderLevel) return

    const qty = Number(newItemQuantity)
    const reorder = Number(newItemReorderLevel)
    if (Number.isNaN(qty) || qty <= 0 || Number.isNaN(reorder) || reorder <= 0) return

    try {
      const response = await fetch('/api/inventory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newItemName,
          quantity: qty,
          unit: newItemUnit,
          reorderLevel: reorder,
          supplier: newItemSupplier,
          imageUrl: newItemImage,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to add inventory')
      }

      const data = await response.json()
      toast.success("Stock added", {
        description: `${qty}${newItemUnit} added to ${newItemName}.`,
      })

      setIsAddStockOpen(false)
      setNewItemName("")
      setNewItemQuantity("")
      setNewItemUnit("kg")
      setNewItemReorderLevel("")
      setNewItemSupplier("Juan Dela Cruz")
      setNewItemImage("")
      refetchInventory()
    } catch (error: any) {
      toast.error("Failed to add inventory", {
        description: error.message || "Please try again",
      })
    }
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Inventory</h1>
          <p className="text-muted-foreground mt-1">Track your stock levels and reorder supplies</p>
        </div>
        <Button
          className="bg-business hover:bg-business-light text-white gap-2"
          onClick={() => {
            setIsAddStockOpen(true)
            setNewItemName("")
            setNewItemQuantity("")
            setNewItemUnit("kg")
            setNewItemReorderLevel("")
            setNewItemSupplier("Juan Dela Cruz")
            setNewItemImage("")
          }}
        >
          <Plus className="w-5 h-5" />
          Add Stock
        </Button>
      </div>

      {/* Stats Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-2xl p-6 border border-border shadow-sm">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-business-bg rounded-xl">
              <Package className="w-6 h-6 text-business" />
            </div>
            <div>
              <p className="text-2xl font-bold">{totalItems}</p>
              <p className="text-sm text-muted-foreground">Total Products</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-6 border border-border shadow-sm">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-100 rounded-xl">
              <BarChart3 className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{totalStock}kg</p>
              <p className="text-sm text-muted-foreground">Total Stock</p>
            </div>
          </div>
        </div>
        <div className={`rounded-2xl p-6 border shadow-sm ${lowStockItems.length > 0 ? 'bg-red-50 border-red-200' : 'bg-white border-border'}`}>
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-xl ${lowStockItems.length > 0 ? 'bg-red-100' : 'bg-green-100'}`}>
              <AlertTriangle className={`w-6 h-6 ${lowStockItems.length > 0 ? 'text-red-600' : 'text-green-600'}`} />
            </div>
            <div>
              <p className={`text-2xl font-bold ${lowStockItems.length > 0 ? 'text-red-600' : ''}`}>{lowStockItems.length}</p>
              <p className="text-sm text-muted-foreground">{lowStockItems.length > 0 ? 'Need Reorder' : 'All Stock OK'}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-6 border border-border shadow-sm">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-100 rounded-xl">
              <TrendingDown className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">
                {totalItems > 0 ? Math.round(totalStock / totalItems) : 0}kg
              </p>
              <p className="text-sm text-muted-foreground">Avg per Item</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions for Low Stock */}
      {lowStockItems.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              <div>
                <h3 className="font-semibold text-red-800">Low Stock Alert</h3>
                <p className="text-sm text-red-600">
                  {lowStockItems.length} item(s) below reorder level: {lowStockItems.map(i => i.name).join(', ')}
                </p>
              </div>
            </div>
            <Button 
              className="bg-red-600 hover:bg-red-700 text-white"
              onClick={() => {
                // Navigate to browse with search for first low stock item
                if (lowStockItems[0]) {
                  window.location.href = `/business/browse?search=${encodeURIComponent(lowStockItems[0].name)}`
                }
              }}
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Reorder Now
            </Button>
          </div>
        </div>
      )}

      {/* Loading State */}
      {inventoryLoading && (
        <div className="text-center py-12">
          <Loader2 className="w-8 h-8 text-muted-foreground mx-auto mb-4 animate-spin" />
          <p className="text-muted-foreground">Loading inventory...</p>
        </div>
      )}

      {/* Search */}
      {!inventoryLoading && (
        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="Search inventory..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
      )}

      {/* Inventory Items List */}
      {!inventoryLoading && filteredInventory.length === 0 && (
        <div className="bg-white rounded-2xl border border-border p-12 text-center">
          <Package className="w-16 h-16 mx-auto mb-4 text-muted-foreground/30" />
          <p className="text-muted-foreground">No inventory items found</p>
          <p className="text-sm text-muted-foreground mt-2">Add stock from orders or use the "Add Stock" button above</p>
        </div>
      )}

      {!inventoryLoading && filteredInventory.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredInventory.map((item) => {
            const status = getStockStatus(item)
            return (
              <div key={item.id} className="bg-white rounded-2xl border border-border p-6 shadow-sm">
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 rounded-xl bg-muted overflow-hidden flex items-center justify-center">
                    <img
                      src={item.imageUrl || "/placeholder.svg"}
                      alt={item.name}
                      className="w-full h-full object-cover"
                      onError={(e) => { (e.target as HTMLImageElement).src = "/placeholder.svg" }}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-foreground truncate">{item.name}</h3>
                    <p className="text-sm text-muted-foreground">{item.supplier || "No supplier"}</p>
                  </div>
                </div>

                {/* Stock Progress Bar */}
                <div className="mt-4 space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Stock Level</span>
                    <span className={`font-semibold ${status.color.split(' ')[0]}`}>
                      {item.inStock} / {item.reorderLevel * 2} {item.unit}
                    </span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${status.progressColor} transition-all duration-500`}
                      style={{ width: `${status.percentage}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Reorder at: {item.reorderLevel} {item.unit}</span>
                    <span className={`font-medium ${status.color.split(' ')[0]}`}>{status.label}</span>
                  </div>
                </div>

                {/* Last Updated */}
                <div className="mt-3 flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="w-3 h-3" />
                  <span>Updated {formatDate(item.lastUpdated)}</span>
                </div>

                <div className="mt-4 flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 gap-1"
                    onClick={() => handleOpenAdjustment(item)}
                  >
                    <ClipboardEdit className="w-4 h-4" />
                    Adjust
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 gap-1"
                    onClick={() => handleReorderClick(item)}
                  >
                    <ExternalLink className="w-4 h-4" />
                    Reorder
                  </Button>
                </div>
                <div className="mt-2 flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="flex-1 gap-1 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                    onClick={() => openEditDialog(item)}
                  >
                    <Edit className="w-4 h-4" />
                    Edit
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="flex-1 gap-1 text-red-600 hover:text-red-700 hover:bg-red-50"
                    onClick={() => setItemToDelete(item)}
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </Button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      <Dialog
        open={!!selectedAdjustmentItem}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedAdjustmentItem(null)
            setAdjustmentQuantity("")
            setAdjustmentNote("")
          }
        }}
      >
        <DialogContent className="sm:max-w-[450px]">
          {selectedAdjustmentItem && (
            <>
              <DialogHeader>
                <DialogTitle>Manual Stock Adjustment</DialogTitle>
              </DialogHeader>

              <div className="space-y-4 py-2 text-sm">
                <div>
                  <p className="text-foreground font-semibold">{selectedAdjustmentItem.name}</p>
                  <p className="text-muted-foreground">
                    Current in stock: {selectedAdjustmentItem.inStock} {selectedAdjustmentItem.unit}
                  </p>
                  <p className="text-muted-foreground">
                    Reorder level: {selectedAdjustmentItem.reorderLevel} {selectedAdjustmentItem.unit}
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>Adjustment type</Label>
                  <Select value={adjustmentType} onValueChange={(value: "increase" | "decrease") => setAdjustmentType(value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select action" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="increase">Add stock (received / correction)</SelectItem>
                      <SelectItem value="decrease">Reduce stock (damaged / used)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="adjustment-quantity">Quantity ({selectedAdjustmentItem.unit})</Label>
                  <Input
                    id="adjustment-quantity"
                    type="number"
                    min={1}
                    value={adjustmentQuantity}
                    onChange={(e) => setAdjustmentQuantity(e.target.value)}
                    placeholder="Enter quantity"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="adjustment-note">Notes (optional)</Label>
                  <Textarea
                    id="adjustment-note"
                    value={adjustmentNote}
                    onChange={(e) => setAdjustmentNote(e.target.value)}
                    placeholder="Reference delivery receipt, spoilage note, etc."
                  />
                </div>
              </div>

              <DialogFooter>
                <Button
                  variant="outline"
                  className="flex-1 bg-transparent"
                  onClick={() => {
                    setSelectedAdjustmentItem(null)
                    setAdjustmentQuantity("")
                    setAdjustmentNote("")
                  }}
                >
                  Cancel
                </Button>
                <Button
                  className="flex-1 bg-business hover:bg-business-light"
                  onClick={handleApplyAdjustment}
                  disabled={!adjustmentQuantity || Number(adjustmentQuantity) <= 0}
                >
                  Save Adjustment
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      <Dialog
        open={isAddStockOpen}
        onOpenChange={(open) => {
          setIsAddStockOpen(open)
          if (!open) {
            setNewItemName("")
            setNewItemQuantity("")
            setNewItemUnit("kg")
            setNewItemReorderLevel("")
            setNewItemSupplier("Juan Dela Cruz")
            setNewItemImage("")
          }
        }}
      >
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add Stock Manually</DialogTitle>
          </DialogHeader>

          <div className="space-y-3 py-2">
            <div className="space-y-1">
              <Label htmlFor="add-name">Product name</Label>
              <Input
                id="add-name"
                value={newItemName}
                onChange={(e) => setNewItemName(e.target.value)}
                placeholder="e.g., Potatoes"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="add-quantity">Quantity</Label>
                <Input
                  id="add-quantity"
                  type="number"
                  min={1}
                  value={newItemQuantity}
                  onChange={(e) => setNewItemQuantity(e.target.value)}
                  placeholder="Enter amount"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="add-unit">Unit</Label>
                <Input id="add-unit" value={newItemUnit} onChange={(e) => setNewItemUnit(e.target.value)} placeholder="kg, bags, etc." />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="add-reorder">Reorder level</Label>
                <Input
                  id="add-reorder"
                  type="number"
                  min={1}
                  value={newItemReorderLevel}
                  onChange={(e) => setNewItemReorderLevel(e.target.value)}
                  placeholder="Minimum threshold"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="add-supplier">Supplier</Label>
                <Input
                  id="add-supplier"
                  value={newItemSupplier}
                  onChange={(e) => setNewItemSupplier(e.target.value)}
                  placeholder="Supplier name"
                />
              </div>
            </div>
            <div className="space-y-1">
              <Label htmlFor="add-image">Image URL (optional)</Label>
              <Input
                id="add-image"
                value={newItemImage}
                onChange={(e) => setNewItemImage(e.target.value)}
                placeholder="/potatoes.png"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" className="flex-1 bg-transparent" onClick={() => setIsAddStockOpen(false)}>
              Cancel
            </Button>
            <Button
              className="flex-1 bg-business hover:bg-business-light"
              onClick={handleAddStock}
              disabled={!newItemName || !newItemQuantity || !newItemReorderLevel}
            >
              Save Stock
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={!!itemToDelete}
        onOpenChange={(open) => {
          if (!open) setItemToDelete(null)
        }}
      >
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle className="text-red-600">Delete Inventory Item</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-foreground">
              Are you sure you want to delete <strong>{itemToDelete?.name}</strong>?
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              This will remove {itemToDelete?.inStock} {itemToDelete?.unit} from your inventory. This action cannot be undone.
            </p>
            <p className="text-sm text-yellow-600 mt-2">
              Use this for perished/unsellable vegetables or items you no longer stock.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" className="flex-1 bg-transparent" onClick={() => setItemToDelete(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              className="flex-1"
              onClick={handleDeleteItem}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Item Dialog */}
      <Dialog
        open={!!editingItem}
        onOpenChange={(open) => {
          if (!open) setEditingItem(null)
        }}
      >
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader>
            <DialogTitle>Edit Inventory Item</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Product Name</Label>
              <Input
                id="edit-name"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                placeholder="e.g., Potatoes"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-reorder">Reorder Level</Label>
                <Input
                  id="edit-reorder"
                  type="number"
                  min={1}
                  value={editReorderLevel}
                  onChange={(e) => setEditReorderLevel(e.target.value)}
                  placeholder="Minimum threshold"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-unit">Unit</Label>
                <Input
                  id="edit-unit"
                  value={editUnit}
                  onChange={(e) => setEditUnit(e.target.value)}
                  placeholder="kg, bags, etc."
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" className="flex-1 bg-transparent" onClick={() => setEditingItem(null)}>
              Cancel
            </Button>
            <Button
              className="flex-1 bg-business hover:bg-business-light"
              onClick={handleEditItem}
              disabled={!editName || !editReorderLevel || !editUnit}
            >
              <Edit className="w-4 h-4 mr-2" />
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
