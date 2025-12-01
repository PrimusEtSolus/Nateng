"use client"

import { useState } from "react"
import { getWholesaleCrops, type Crop, productCategories } from "@/lib/mock-data"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Search, ShoppingCart, MapPin, Package } from "lucide-react"

export default function BusinessBrowsePage() {
  const crops = getWholesaleCrops()
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [selectedCrop, setSelectedCrop] = useState<(Crop & { farmerName: string }) | null>(null)
  const [orderQuantity, setOrderQuantity] = useState("")
  const [cart, setCart] = useState<{ crop: Crop & { farmerName: string }; quantity: number }[]>([])

  const filteredCrops = crops.filter((c) => {
    const matchesSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === "All" || c.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const handleAddToOrder = () => {
    if (selectedCrop && orderQuantity) {
      const qty = Number(orderQuantity)
      if (qty >= selectedCrop.minOrderQty) {
        setCart([...cart, { crop: selectedCrop, quantity: qty }])
        setSelectedCrop(null)
        setOrderQuantity("")
      }
    }
  }

  const totalCartValue = cart.reduce((sum, item) => sum + item.crop.wholesalePrice * item.quantity, 0)

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Wholesale Market</h1>
          <p className="text-muted-foreground mt-1">Browse fresh produce directly from Benguet farmers</p>
        </div>
        {cart.length > 0 && (
          <Button className="bg-business hover:bg-business-light text-white gap-2">
            <ShoppingCart className="w-5 h-5" />
            Cart ({cart.length}) - ₱{totalCartValue.toLocaleString()}
          </Button>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            placeholder="Search crops..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          {productCategories.map((cat) => (
            <Button
              key={cat}
              variant={selectedCategory === cat ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(cat)}
              className={selectedCategory === cat ? "bg-business hover:bg-business-light" : ""}
            >
              {cat}
            </Button>
          ))}
        </div>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCrops.map((crop) => (
          <div
            key={crop.id}
            className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden hover:shadow-md transition-shadow"
          >
            <div className="aspect-video bg-muted relative">
              <img src={crop.image || "/placeholder.svg"} alt={crop.name} className="w-full h-full object-cover" />
              <span
                className={`absolute top-3 right-3 px-2 py-1 rounded-full text-xs font-medium ${
                  crop.status === "available"
                    ? "bg-green-500 text-white"
                    : crop.status === "low_stock"
                      ? "bg-yellow-500 text-white"
                      : "bg-red-500 text-white"
                }`}
              >
                {crop.harvestQuantity}
                {crop.unit} available
              </span>
            </div>
            <div className="p-5">
              <div className="mb-3">
                <h3 className="font-semibold text-lg">{crop.name}</h3>
                <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                  <MapPin className="w-4 h-4" />
                  {crop.farmerName}
                </p>
              </div>

              <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{crop.description}</p>

              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-2xl font-bold text-business">₱{crop.wholesalePrice}</p>
                  <p className="text-xs text-muted-foreground">per {crop.unit}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">Min Order</p>
                  <p className="text-sm text-muted-foreground">
                    {crop.minOrderQty}
                    {crop.unit}
                  </p>
                </div>
              </div>

              <Button
                className="w-full bg-business hover:bg-business-light text-white gap-2"
                onClick={() => {
                  setSelectedCrop(crop)
                  setOrderQuantity(String(crop.minOrderQty))
                }}
              >
                <Package className="w-5 h-5" />
                Place Wholesale Order
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Order Modal */}
      <Dialog open={!!selectedCrop} onOpenChange={() => setSelectedCrop(null)}>
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader>
            <DialogTitle>Place Wholesale Order</DialogTitle>
          </DialogHeader>
          {selectedCrop && (
            <div className="space-y-4 py-4">
              <div className="flex gap-4">
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
                  <p className="text-lg font-bold text-business mt-1">
                    ₱{selectedCrop.wholesalePrice}/{selectedCrop.unit}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="quantity">Order Quantity ({selectedCrop.unit})</Label>
                <Input
                  id="quantity"
                  type="number"
                  min={selectedCrop.minOrderQty}
                  max={selectedCrop.harvestQuantity}
                  value={orderQuantity}
                  onChange={(e) => setOrderQuantity(e.target.value)}
                  placeholder={`Min: ${selectedCrop.minOrderQty}`}
                />
                <p className="text-xs text-muted-foreground">
                  Minimum order: {selectedCrop.minOrderQty}
                  {selectedCrop.unit} | Available: {selectedCrop.harvestQuantity}
                  {selectedCrop.unit}
                </p>
              </div>

              {orderQuantity && Number(orderQuantity) >= selectedCrop.minOrderQty && (
                <div className="bg-muted p-4 rounded-lg">
                  <div className="flex justify-between text-sm mb-2">
                    <span>Subtotal</span>
                    <span>₱{(selectedCrop.wholesalePrice * Number(orderQuantity)).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between font-semibold text-lg">
                    <span>Total</span>
                    <span className="text-business">
                      ₱{(selectedCrop.wholesalePrice * Number(orderQuantity)).toLocaleString()}
                    </span>
                  </div>
                </div>
              )}

              <div className="flex gap-3">
                <Button variant="outline" className="flex-1 bg-transparent" onClick={() => setSelectedCrop(null)}>
                  Cancel
                </Button>
                <Button
                  className="flex-1 bg-business hover:bg-business-light"
                  onClick={handleAddToOrder}
                  disabled={!orderQuantity || Number(orderQuantity) < selectedCrop.minOrderQty}
                >
                  Place Order
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
