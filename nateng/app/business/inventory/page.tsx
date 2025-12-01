"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, Search, AlertTriangle, Package, TrendingDown, RefreshCw } from "lucide-react"

interface InventoryItem {
  id: string
  name: string
  inStock: number
  unit: string
  reorderLevel: number
  supplier: string
  lastOrderDate: string
  image: string
}

export default function BusinessInventoryPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [inventory] = useState<InventoryItem[]>([
    {
      id: "1",
      name: "Tomatoes",
      inStock: 200,
      unit: "kg",
      reorderLevel: 50,
      supplier: "Juan Dela Cruz",
      lastOrderDate: "2024-11-28",
      image: "/fresh-red-tomatoes.jpg",
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

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Inventory</h1>
          <p className="text-muted-foreground mt-1">Track your stock levels and reorder supplies</p>
        </div>
        <Button className="bg-business hover:bg-business-light text-white gap-2">
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

                <Button className="w-full bg-business hover:bg-business-light text-white gap-2" size="sm">
                  <RefreshCw className="w-4 h-4" />
                  Reorder from Farmer
                </Button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
