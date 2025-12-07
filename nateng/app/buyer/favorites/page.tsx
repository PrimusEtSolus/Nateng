"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Heart, ShoppingCart, Star, Loader2 } from "lucide-react"
import { useCart } from "@/lib/cart-context"
import { useFetch } from "@/hooks/use-fetch"
import { toast } from "sonner"
import { ProductImage } from "@/components/product-image"

interface FavoriteListing {
  id: number
  listingId: number
  listing: {
    id: number
    priceCents: number
    quantity: number
    product: {
      id: number
      name: string
      description: string | null
      imageUrl: string | null
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
      email: string
    }
  }
  createdAt: string
}

export default function BuyerFavoritesPage() {
  const { addToCart } = useCart()
  const { data: favorites, loading, error } = useFetch<FavoriteListing[]>('/api/favorites')

  const handleAddToCart = (favorite: FavoriteListing) => {
    const listing = favorite.listing
    const pricePerKg = listing.priceCents / 100
    
    addToCart({
      listingId: listing.id,
      sellerId: listing.seller.id,
      productName: listing.product.name,
      sellerName: listing.seller.name,
      quantity: 0.2, // Minimum order
      priceCents: listing.priceCents,
    })

    toast.success("Added to cart", {
      description: `0.2kg of ${listing.product.name} added`,
    })
  }

  const handleRemoveFavorite = async (favoriteId: number) => {
    try {
      const response = await fetch(`/api/favorites/${favoriteId}`, {
        method: 'DELETE'
      })
      
      if (response.ok) {
        toast.success("Removed from favorites")
        // The useFetch hook should automatically refetch
        window.location.reload()
      } else {
        const error = await response.json()
        toast.error(error.error || "Failed to remove from favorites")
      }
    } catch (error) {
      console.error('Remove favorite error:', error)
      toast.error("Failed to remove from favorites")
    }
  }

  if (loading) {
    return (
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-semibold text-foreground tracking-tight">My Favorites</h1>
          <p className="text-muted-foreground mt-1">Products you've saved for later</p>
        </div>
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-semibold text-foreground tracking-tight">My Favorites</h1>
          <p className="text-muted-foreground mt-1">Products you've saved for later</p>
        </div>
        <div className="text-center py-16 text-muted-foreground">
          <p>Failed to load favorites. Please try again.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold text-foreground tracking-tight">My Favorites</h1>
        <p className="text-muted-foreground mt-1">Products you've saved for later</p>
      </div>

      {!favorites || favorites.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <Heart className="w-16 h-16 mx-auto mb-4 opacity-30" />
          <p>No favorites yet. Start browsing to add products!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {favorites.map((favorite) => {
            const listing = favorite.listing
            const pricePerKg = listing.priceCents / 100
            
            return (
              <div
                key={favorite.id}
                className="bg-card rounded-2xl border border-border overflow-hidden shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="aspect-square bg-muted relative">
                  <ProductImage
                    src={listing.product.imageUrl}
                    alt={listing.product.name}
                    className="w-full h-full"
                  />
                  <button 
                    onClick={() => handleRemoveFavorite(favorite.id)}
                    className="absolute top-3 right-3 p-2 bg-white rounded-full shadow-md hover:scale-110 transition-transform"
                  >
                    <Heart className="w-5 h-5 text-red-500 fill-red-500" />
                  </button>
                </div>
                <div className="p-4">
                  <h3 className="text-lg font-semibold text-foreground">{listing.product.name}</h3>
                  <p className="text-sm text-muted-foreground">by {listing.seller.name}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    From farmer {listing.product.farmer.name}
                  </p>
                  <div className="flex items-center gap-1 mt-2">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm font-medium">4.8</span>
                    <span className="text-sm text-muted-foreground">(156 sold)</span>
                  </div>
                  <div className="flex items-center justify-between mt-4">
                    <div>
                      <p className="text-xl font-bold text-buyer">₱{pricePerKg.toFixed(2)}/kg</p>
                      <p className="text-xs text-muted-foreground">{listing.quantity}kg available</p>
                    </div>
                    <Button
                      className="bg-buyer hover:bg-buyer/90"
                      onClick={() => handleAddToCart(favorite)}
                    >
                      <ShoppingCart className="w-4 h-4 mr-2" />
                      Add
                    </Button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
