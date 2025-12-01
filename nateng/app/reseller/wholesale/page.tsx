"use client"

import { useState } from "react"
import { getWholesaleCrops, productCategories } from "@/lib/mock-data"
import { Search, ShoppingCart, MapPin, Package } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

export default function ResellerWholesalePage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [cart, setCart] = useState<{ cropId: string; quantity: number }[]>([])

  const crops = getWholesaleCrops()

  const filteredCrops = crops.filter((crop) => {
    const matchesSearch = crop.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === "All" || crop.category === selectedCategory
    return matchesSearch && matchesCategory && crop.status !== "out_of_stock"
  })

  const addToCart = (cropId: string, minQty: number) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.cropId === cropId)
      if (existing) {
        return prev.map((item) => (item.cropId === cropId ? { ...item, quantity: item.quantity + minQty } : item))
      }
      return [...prev, { cropId, quantity: minQty }]
    })
  }

  const cartTotal = cart.reduce((sum, item) => {
    const crop = crops.find((c) => c.id === item.cropId)
    return sum + (crop?.wholesalePrice || 0) * item.quantity
  }, 0)

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Buy Wholesale</h1>
          <p className="text-muted-foreground mt-1">Source fresh produce directly from Benguet farmers</p>
        </div>
        {cart.length > 0 && (
          <Button className="bg-teal-600 hover:bg-teal-700">
            <ShoppingCart className="w-5 h-5 mr-2" />
            Cart ({cart.length}) - ₱{cartTotal.toLocaleString()}
          </Button>
        )}
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            placeholder="Search crops..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-12 h-12 bg-white"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2">
          {productCategories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                selectedCategory === category
                  ? "bg-teal-600 text-white"
                  : "bg-white text-muted-foreground hover:bg-teal-50 hover:text-teal-600"
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Products Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCrops.map((crop) => (
          <div
            key={crop.id}
            className="bg-white rounded-2xl overflow-hidden shadow-sm border border-border hover:shadow-lg transition-all group"
          >
            <div className="aspect-video relative overflow-hidden bg-muted">
              <img
                src={crop.image || "/placeholder.svg"}
                alt={crop.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              {crop.status === "low_stock" && (
                <span className="absolute top-3 right-3 px-2 py-1 bg-yellow-500 text-white text-xs font-medium rounded-full">
                  Low Stock
                </span>
              )}
            </div>
            <div className="p-5">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="font-semibold text-lg text-foreground">{crop.name}</h3>
                  <p className="text-sm text-muted-foreground">{crop.category}</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-teal-600">₱{crop.wholesalePrice}</p>
                  <p className="text-xs text-muted-foreground">per {crop.unit}</p>
                </div>
              </div>

              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                <MapPin className="w-4 h-4" />
                <span>{crop.farmerName}</span>
              </div>

              <div className="flex items-center justify-between text-sm mb-4">
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Package className="w-4 h-4" />
                  <span>
                    {crop.harvestQuantity}
                    {crop.unit} available
                  </span>
                </div>
                <span className="text-teal-600 font-medium">
                  Min: {crop.minOrderQty}
                  {crop.unit}
                </span>
              </div>

              <Button
                onClick={() => addToCart(crop.id, crop.minOrderQty)}
                className="w-full bg-teal-600 hover:bg-teal-700"
              >
                <ShoppingCart className="w-4 h-4 mr-2" />
                Add to Order
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
