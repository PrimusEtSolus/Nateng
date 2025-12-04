"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, Search, AlertTriangle, Package, TrendingDown, RefreshCw, ClipboardEdit } from "lucide-react"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { getWholesaleCrops, type Crop } from "@/lib/mock-data"
import { toast } from "@/hooks/use-toast"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

// Use a counter instead of Date.now() and Math.random() to avoid hydration issues
let inventoryIdCounter = 0
const generateInventoryId = () => {
  inventoryIdCounter++
  return `inventory-${inventoryIdCounter}`
}

interface InventoryItem {
  id: string
  name: string
  inStock: number
  unit: string
  reorderLevel: number
  supplier: string
  lastOrderDate: string
  image: string
  lastUpdated?: string
}

export default function BusinessInventoryPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCrop, setSelectedCrop] = useState<(Crop & { farmerName: string }) | null>(null)
  const [orderQuantity, setOrderQuantity] = useState("")
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

  const wholesaleCrops = getWholesaleCrops()

  const [inventory, setInventory] = useState<InventoryItem[]>([
    {
      id: "1",
      name: "Tomatoes",
      inStock: 200,
      unit: "kg",
      reorderLevel: 50,
      supplier: "Juan Dela Cruz",
      lastOrderDate: "2024-11-28",
      image: "/fresh-red-tomatoes.jpg",
      lastUpdated: "2024-11-28",
    },
    {
      id: "2",
      name: "Cabbage",
      inStock: 100,
      unit: "kg",
      reorderLevel: 30,
      supplier: "Juan Dela Cruz",
      lastOrderDate: "2024-11-25",
      image: "/green-cabbage.jpg",
      lastUpdated: "2024-11-25",
    },
    {
      id: "3",
      name: "Carrots",
      inStock: 15,
      unit: "kg",
      reorderLevel: 20,
      supplier: "Juan Dela Cruz",
      lastOrderDate: "2024-11-20",
      image: "/orange-carrots.jpg",
      lastUpdated: "2024-11-20",
    },
    {
      id: "4",
      name: "Lettuce",
      inStock: 45,
      unit: "kg",
      reorderLevel: 25,
      supplier: "Juan Dela Cruz",
      lastOrderDate: "2024-11-27",
      image: "/fresh-green-lettuce.png",
      lastUpdated: "2024-11-27",
    },
    {
      id: "5",
      name: "Bell Peppers",
      inStock: 8,
      unit: "kg",
      reorderLevel: 15,
      supplier: "Juan Dela Cruz",
      lastOrderDate: "2024-11-22",
      image: "/colorful-bell-peppers.png",
      lastUpdated: "2024-11-22",
    },
  ])

  const filteredInventory = inventory.filter((item) => item.name.toLowerCase().includes(searchTerm.toLowerCase()))

  const lowStockItems = inventory.filter((item) => item.inStock <= item.reorderLevel)
  const totalItems = inventory.length
  const totalStock = inventory.reduce((sum, item) => sum + item.inStock, 0)

  const getStockStatus = (item: InventoryItem) => {
    const ratio = item.inStock / item.reorderLevel
    if (ratio <= 1) return { label: "Low Stock", color: "text-red-600 bg-red-50 border-red-200" }
    if (ratio <= 1.5) return { label: "Running Low", color: "text-yellow-600 bg-yellow-50 border-yellow-200" }
    return { label: "In Stock", color: "text-green-600 bg-green-50 border-green-200" }
  }

  const handleReorderClick = (item: InventoryItem) => {
    const matchingCrop = wholesaleCrops.find((crop) => crop.name === item.name)

    if (!matchingCrop) {
      toast({
        title: "Reorder not available",
        description: "This item is not currently available for wholesale reorder from farmers.",
        variant: "destructive",
      })
      return
    }

    setSelectedCrop(matchingCrop)
    setOrderQuantity(String(matchingCrop.minOrderQty))
  }

  const handlePlaceReorder = () => {
    if (!selectedCrop || !orderQuantity) return

    const qty = Number(orderQuantity)
    if (Number.isNaN(qty) || qty < selectedCrop.minOrderQty) return

    toast({
      title: "Reorder request sent",
      description: `You requested ${qty}${selectedCrop.unit} of ${selectedCrop.name} from ${selectedCrop.farmerName}.`,
    })

    setSelectedCrop(null)
    setOrderQuantity("")
  }

  const handleOpenAdjustment = (item: InventoryItem) => {
    setSelectedAdjustmentItem(item)
    setAdjustmentType("increase")
    setAdjustmentQuantity("")
    setAdjustmentNote("")
  }

  const handleApplyAdjustment = () => {
    if (!selectedAdjustmentItem || !adjustmentQuantity) return
    const qty = Number(adjustmentQuantity)
    if (Number.isNaN(qty) || qty <= 0) return

    setInventory((prev) =>
      prev.map((item) => {
        if (item.id !== selectedAdjustmentItem.id) return item
        const now = new Date().toISOString().split("T")[0]
        const delta = adjustmentType === "increase" ? qty : -qty
        const updatedStock = Math.max(0, item.inStock + delta)

        return {
          ...item,
          inStock: updatedStock,
          lastUpdated: now,
          lastOrderDate: adjustmentType === "increase" ? now : item.lastOrderDate,
        }
      }),
    )

    toast({
      title: "Inventory updated",
      description: `${selectedAdjustmentItem.name} adjusted by ${adjustmentType === "increase" ? "+" : "-"}${qty}${
        selectedAdjustmentItem.unit
      }${adjustmentNote ? ` • ${adjustmentNote}` : ""}`,
    })

    setSelectedAdjustmentItem(null)
    setAdjustmentQuantity("")
    setAdjustmentNote("")
  }

  const handleAddStock = () => {
    if (!newItemName || !newItemQuantity || !newItemReorderLevel) return

    const qty = Number(newItemQuantity)
    const reorder = Number(newItemReorderLevel)
    if (Number.isNaN(qty) || qty <= 0 || Number.isNaN(reorder) || reorder <= 0) return

    const existingItem = inventory.find((item) => item.name.toLowerCase() === newItemName.toLowerCase())
    const today = new Date().toISOString().split("T")[0]

    if (existingItem) {
      setInventory((prev) =>
        prev.map((item) =>
          item.id === existingItem.id
            ? {
                ...item,
                inStock: item.inStock + qty,
                lastUpdated: today,
                lastOrderDate: today,
                reorderLevel: reorder || item.reorderLevel,
                unit: newItemUnit || item.unit,
              }
            : item,
        ),
      )
      toast({
        title: "Stock added",
        description: `${qty}${newItemUnit} added to ${existingItem.name}.`,
      })
    } else {
      const newItem: InventoryItem = {
        id: generateInventoryId(),
        name: newItemName,
        inStock: qty,
        unit: newItemUnit,
        reorderLevel: reorder,
        supplier: newItemSupplier,
        lastOrderDate: today,
        image: newItemImage || "/placeholder.svg",
        lastUpdated: today,
      }
      setInventory((prev) => [...prev, newItem])
      toast({
        title: "New item added",
        description: `${newItemName} created with ${qty}${newItemUnit} in stock.`,
      })
    }

    setIsAddStockOpen(false)
    setNewItemName("")
    setNewItemQuantity("")
    setNewItemUnit("kg")
    setNewItemReorderLevel("")
    setNewItemSupplier("Juan Dela Cruz")
    setNewItemImage("")
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

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
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
              <TrendingDown className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{totalStock}kg</p>
              <p className="text-sm text-muted-foreground">Total Stock</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-6 border border-border shadow-sm">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-red-100 rounded-xl">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{lowStockItems.length}</p>
              <p className="text-sm text-muted-foreground">Low Stock Items</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search */}
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

      {/* Inventory Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredInventory.map((item) => {
          const status = getStockStatus(item)
          return (
            <div
              key={item.id}
              className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden hover:shadow-md transition-shadow"
            >
              <div className="aspect-video bg-muted relative">
                <img src={item.image || "/placeholder.svg"} alt={item.name} className="w-full h-full object-cover" />
                <span
                  className={`absolute top-3 right-3 px-2 py-1 rounded-full text-xs font-medium border ${status.color}`}
                >
                  {status.label}
                </span>
              </div>
              <div className="p-5">
                <h3 className="font-semibold text-lg mb-3">{item.name}</h3>

                <div className="space-y-2 text-sm mb-4">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">In Stock</span>
                    <span className="font-medium">
                      {item.inStock} {item.unit}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Reorder Level</span>
                    <span className="font-medium">
                      {item.reorderLevel} {item.unit}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Supplier</span>
                    <span className="font-medium text-business">{item.supplier}</span>
                  </div>
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Last updated</span>
                <span>{item.lastUpdated || item.lastOrderDate}</span>
              </div>
                </div>

                {/* Stock Bar */}
                <div className="mb-4">
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        item.inStock <= item.reorderLevel ? "bg-red-500" : "bg-green-500"
                      }`}
                      style={{ width: `${Math.min((item.inStock / (item.reorderLevel * 3)) * 100, 100)}%` }}
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-2 sm:flex-row">
                  <Button
                    className="flex-1 bg-business hover:bg-business-light text-white gap-2"
                    size="sm"
                    onClick={() => handleReorderClick(item)}
                  >
                    <RefreshCw className="w-4 h-4" />
                    Reorder from Farmer
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1 gap-2"
                    size="sm"
                    onClick={() => handleOpenAdjustment(item)}
                  >
                    <ClipboardEdit className="w-4 h-4" />
                    Adjust Stock
                  </Button>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <Dialog
        open={!!selectedCrop}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedCrop(null)
            setOrderQuantity("")
          }
        }}
      >
        <DialogContent className="sm:max-w-[450px]">
          {selectedCrop && (
            <>
              <DialogHeader>
                <DialogTitle>Reorder from Farmer</DialogTitle>
              </DialogHeader>

              <div className="space-y-4 py-2">
                <div className="flex items-start gap-4">
                  <div className="w-20 h-20 rounded-lg overflow-hidden bg-muted">
                    <img
                      src={selectedCrop.image || "/placeholder.svg"}
                      alt={selectedCrop.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">{selectedCrop.name}</h3>
                    <p className="text-sm text-muted-foreground">from {selectedCrop.farmerName}</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Minimum order {selectedCrop.minOrderQty}
                      {selectedCrop.unit}
                    </p>
                    <p className="text-lg font-bold text-business mt-1">
                      ₱{selectedCrop.wholesalePrice}/{selectedCrop.unit}
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="reorder-quantity">Order quantity ({selectedCrop.unit})</Label>
                  <Input
                    id="reorder-quantity"
                    type="number"
                    min={selectedCrop.minOrderQty}
                    max={selectedCrop.harvestQuantity}
                    value={orderQuantity}
                    onChange={(e) => setOrderQuantity(e.target.value)}
                    placeholder={`Min: ${selectedCrop.minOrderQty}`}
                  />
                  <p className="text-xs text-muted-foreground">
                    Minimum order: {selectedCrop.minOrderQty}
                    {selectedCrop.unit} • Available: {selectedCrop.harvestQuantity}
                    {selectedCrop.unit}
                  </p>
                </div>

                {orderQuantity && Number(orderQuantity) >= selectedCrop.minOrderQty && (
                  <div className="bg-muted p-4 rounded-lg text-sm">
                    <div className="flex justify-between mb-1">
                      <span>Estimated total</span>
                      <span className="font-semibold text-business">
                        ₱{(selectedCrop.wholesalePrice * Number(orderQuantity)).toLocaleString()}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              <DialogFooter>
                <Button
                  variant="outline"
                  className="flex-1 bg-transparent"
                  onClick={() => {
                    setSelectedCrop(null)
                    setOrderQuantity("")
                  }}
                >
                  Cancel
                </Button>
                <Button
                  className="flex-1 bg-business hover:bg-business-light"
                  onClick={handlePlaceReorder}
                  disabled={!orderQuantity || Number(orderQuantity) < selectedCrop.minOrderQty}
                >
                  Confirm Reorder
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

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
                      <SelectItem value="decrease">Reduce stock (damaged / sold)</SelectItem>
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
    </div>
  )
}
