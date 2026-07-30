"use client"

import { Package, Store, MapPin } from "lucide-react"
import { type Listing, type Product } from "@/lib/types"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import Link from "next/link"

interface ProductModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  item: (Listing | Product) | null
  mode: "product" | "listing"
  accentColor?: string
  accentHoverColor?: string
  managerHref?: string
  managerLabel?: string
}

function isListing(item: Listing | Product): item is Listing {
  return "priceCents" in item && "productId" in item
}

export function ProductModal({
  open,
  onOpenChange,
  item,
  mode,
  accentColor = "bg-farmer hover:bg-farmer/90",
  managerHref = "/farmer/crops",
  managerLabel = "Go to crop manager",
}: ProductModalProps) {
  if (!item) return null

  const name = isListing(item) ? item.product?.name || "Product" : item.name
  const description = isListing(item) ? item.product?.description || "No description" : item.description || "No description"

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>{name}</DialogTitle>
          <DialogDescription>
            {mode === "product" ? "Product details and listings" : "Listing details and seller information"}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 text-sm">
          <p className="text-muted-foreground">{description}</p>
          <div className="grid grid-cols-2 gap-4">
            {isListing(item) ? (
              <>
                <div className="rounded-xl bg-muted/60 p-4">
                  <p className="text-xs uppercase text-muted-foreground">Available Stock</p>
                  <p className="font-semibold">{item.quantity}kg</p>
                </div>
                <div className="rounded-xl bg-muted/60 p-4">
                  <p className="text-xs uppercase text-muted-foreground">Price</p>
                  <p className="font-semibold">₱{(item.priceCents / 100).toFixed(2)}/kg</p>
                </div>
                {item.seller && (
                  <div className="rounded-xl bg-muted/60 p-4 col-span-2">
                    <p className="text-xs uppercase text-muted-foreground mb-1">Seller</p>
                    <p className="font-semibold">{item.seller.name}</p>
                    <p className="text-xs text-muted-foreground">Role: {item.seller.role}</p>
                    {item.seller.role === 'bulkBuyer' && item.seller.address && (
                      <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                        <Store className="w-3 h-3" />
                        Stall: {item.seller.address}
                      </p>
                    )}
                    {item.seller.city && item.seller.province && (
                      <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                        <MapPin className="w-3 h-3" />
                        {item.seller.city}, {item.seller.province}
                      </p>
                    )}
                  </div>
                )}
              </>
            ) : (
              <>
                <div className="rounded-xl bg-muted/60 p-4">
                  <p className="text-xs uppercase text-muted-foreground">Listings</p>
                  <p className="font-semibold">{item.listings?.length || 0}</p>
                </div>
                <div className="rounded-xl bg-muted/60 p-4">
                  <p className="text-xs uppercase text-muted-foreground">Available Stock</p>
                  <p className="font-semibold">
                    {item.listings?.reduce((sum, l) => sum + (l.available ? l.quantity : 0), 0) || 0}kg
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
        <DialogFooter className="sm:justify-between sm:flex-row">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          <Button asChild className={`${accentColor} text-white`}>
            <Link href={managerHref}>{managerLabel}</Link>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}