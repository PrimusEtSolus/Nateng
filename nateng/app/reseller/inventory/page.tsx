"use client"

import { useState } from "react"
import { mockRetailProducts } from "@/lib/mock-data"
import { Search, Plus, Edit2, Trash2, Package } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

export default function ResellerInventoryPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const products = mockRetailProducts.filter((p) => p.resellerId === "reseller-1")

  const filteredProducts = products.filter((product) => product.name.toLowerCase().includes(searchQuery.toLowerCase()))

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

      {/* Products Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-border overflow-hidden">
        <table className="w-full">
          <thead className="bg-muted/50">
            <tr>
              <th className="text-left px-6 py-4 text-sm font-semibold text-foreground">Product</th>
              <th className="text-left px-6 py-4 text-sm font-semibold text-foreground">Category</th>
              <th className="text-right px-6 py-4 text-sm font-semibold text-foreground">Stock</th>
              <th className="text-right px-6 py-4 text-sm font-semibold text-foreground">Retail Price</th>
              <th className="text-right px-6 py-4 text-sm font-semibold text-foreground">Sold</th>
              <th className="text-center px-6 py-4 text-sm font-semibold text-foreground">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filteredProducts.map((product) => (
              <tr key={product.id} className="hover:bg-muted/30 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg overflow-hidden bg-muted">
                      <img
                        src={product.image || "/placeholder.svg"}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{product.name}</p>
                      <p className="text-sm text-muted-foreground">from {product.farmerName}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="px-2 py-1 bg-teal-50 text-teal-700 text-xs font-medium rounded-full">
                    {product.category}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Package className="w-4 h-4 text-muted-foreground" />
                    <span className="font-medium">{product.availableKg}kg</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-right">
                  <span className="font-semibold text-teal-600">₱{product.pricePerKg}/kg</span>
                </td>
                <td className="px-6 py-4 text-right">
                  <span className="text-muted-foreground">{product.soldCount} units</span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center justify-center gap-2">
                    <button className="p-2 hover:bg-muted rounded-lg transition-colors">
                      <Edit2 className="w-4 h-4 text-muted-foreground" />
                    </button>
                    <button className="p-2 hover:bg-red-50 rounded-lg transition-colors">
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
