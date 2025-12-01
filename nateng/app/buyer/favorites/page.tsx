"use client"

import { mockRetailProducts } from "@/lib/mock-data"
import { Button } from "@/components/ui/button"
import { Heart, ShoppingCart, Star } from "lucide-react"
import { useCart } from "@/lib/cart-context"

export default function BuyerFavoritesPage() {
  const { addToCart } = useCart()
  // Mock: first 2 products as favorites
  const favorites = mockRetailProducts.slice(0, 2)

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold text-foreground tracking-tight">My Favorites</h1>
        <p className="text-muted-foreground mt-1">Products you've saved for later</p>
      </div>

      {favorites.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <Heart className="w-16 h-16 mx-auto mb-4 opacity-30" />
          <p>No favorites yet. Start browsing to add products!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {favorites.map((product) => (
            <div
              key={product.id}
              className="bg-card rounded-2xl border border-border overflow-hidden shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="aspect-square bg-muted relative">
                <img
                  src={product.image || "/placeholder.svg"}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
                <button className="absolute top-3 right-3 p-2 bg-white rounded-full shadow-md hover:scale-110 transition-transform">
                  <Heart className="w-5 h-5 text-red-500 fill-red-500" />
                </button>
              </div>
              <div className="p-4">
                <h3 className="text-lg font-semibold text-foreground">{product.name}</h3>
                <p className="text-sm text-muted-foreground">by {product.farmerName}</p>
                <div className="flex items-center gap-1 mt-1">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <span className="text-sm font-medium">{product.rating}</span>
                  <span className="text-sm text-muted-foreground">({product.soldCount} sold)</span>
                </div>
                <div className="flex items-center justify-between mt-4">
                  <p className="text-xl font-bold text-buyer">₱{product.pricePerKg}/kg</p>
                  <Button
                    className="bg-buyer hover:bg-buyer/90"
                    onClick={() => addToCart(product.id, 1, product.pricePerKg)}
                  >
                    <ShoppingCart className="w-4 h-4 mr-2" />
                    Add
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
