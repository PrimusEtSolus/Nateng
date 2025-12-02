"use client"

import { useState } from "react"
import { mockRetailProducts, productCategories, type RetailProduct } from "@/lib/mock-data"
import { useCart } from "@/lib/cart-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Heart, Star, MapPin, ShoppingCart, Plus, Minus } from "lucide-react"
import Link from "next/link"

export default function BuyerDashboardPage() {
  const [products] = useState<RetailProduct[]>(mockRetailProducts)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [favorites, setFavorites] = useState<string[]>([])
  const { addToCart, items } = useCart()

  const filteredProducts = products.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === "All" || p.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const toggleFavorite = (id: string) => {
    setFavorites((prev) => (prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]))
  }

  const getCartQuantity = (productId: string) => {
    const item = items.find((i) => i.product.id === productId)
    return item?.quantity || 0
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Fresh from Benguet</h1>
          <p className="text-muted-foreground mt-1">Shop farm-fresh vegetables delivered to your doorstep</p>
        </div>
        <Link href="/buyer/cart">
          <Button className="bg-buyer hover:bg-buyer-light text-white gap-2">
            <ShoppingCart className="w-5 h-5" />
            View Cart ({items.length})
          </Button>
        </Link>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-wrap gap-4 mb-8">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            placeholder="Search fresh produce..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {productCategories.map((cat) => (
            <Button
              key={cat}
              variant={selectedCategory === cat ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(cat)}
              className={selectedCategory === cat ? "bg-buyer hover:bg-buyer-light" : ""}
            >
              {cat}
            </Button>
          ))}
        </div>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredProducts.map((product) => {
          const cartQty = getCartQuantity(product.id)
          const isFavorite = favorites.includes(product.id)

          return (
            <div
              key={product.id}
              className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden hover:shadow-lg transition-all group"
            >
              <div className="aspect-square bg-muted relative overflow-hidden">
                <img
                  src={product.image || "/placeholder.svg"}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <button
                  onClick={() => toggleFavorite(product.id)}
                  className="absolute top-3 right-3 p-2 bg-white rounded-full shadow-md hover:bg-gray-50 transition-colors"
                >
                  <Heart
                    className={`w-5 h-5 transition-colors ${
                      isFavorite ? "fill-red-500 text-red-500" : "text-gray-400"
                    }`}
                  />
                </button>
                {product.soldCount > 100 && (
                  <span className="absolute top-3 left-3 px-2 py-1 bg-buyer text-white text-xs font-medium rounded-full">
                    Popular
                  </span>
                )}
              </div>

              <div className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="font-semibold text-foreground">{product.name}</h3>
                    {/* Reseller info so buyers can see who they are ordering from */}
                    <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3" />
                      Sold by {product.resellerName} • {product.resellerLocation}
                    </p>
                    {/* Farmer source information */}
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      From farmer {product.farmerName} ({product.farmerLocation})
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm font-medium">{product.rating}</span>
                  </div>
                </div>

                <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{product.description}</p>

                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-2xl font-bold text-buyer">₱{product.pricePerKg}</p>
                    <p className="text-xs text-muted-foreground">per kg</p>
                  </div>

                  {cartQty > 0 ? (
                    <div className="flex items-center gap-2">
                      <Button
                        size="icon"
                        variant="outline"
                        className="h-8 w-8 bg-transparent"
                        onClick={() => addToCart(product, -1)}
                      >
                        <Minus className="w-4 h-4" />
                      </Button>
                      <span className="w-8 text-center font-medium">{cartQty}</span>
                      <Button
                        size="icon"
                        className="h-8 w-8 bg-buyer hover:bg-buyer-light"
                        onClick={() => addToCart(product, 1)}
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                  ) : (
                    <Button
                      size="sm"
                      className="bg-buyer hover:bg-buyer-light text-white gap-1"
                      onClick={() => addToCart(product, 1)}
                    >
                      <Plus className="w-4 h-4" />
                      Add
                    </Button>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {filteredProducts.length === 0 && (
        <div className="text-center py-12">
          <ShoppingCart className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="font-medium text-lg mb-1">No products found</h3>
          <p className="text-muted-foreground">Try a different search or category</p>
        </div>
      )}
    </div>
  )
}
