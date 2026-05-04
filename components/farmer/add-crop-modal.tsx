"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Plus } from "lucide-react"

interface AddCropModalProps {
  onAddCrop: (crop: {
    name: string
    harvestQuantity: string
    wholesalePrice: string
    minOrderQty: string
  }) => void
}

export function AddCropModal({ onAddCrop }: AddCropModalProps) {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState("")
  const [quantity, setQuantity] = useState("")
  const [price, setPrice] = useState("")
  const [minOrder, setMinOrder] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onAddCrop({
      name,
      harvestQuantity: `${quantity}kg`,
      wholesalePrice: `₱${price}/kg`,
      minOrderQty: `${minOrder}kg`,
    })
    setName("")
    setQuantity("")
    setPrice("")
    setMinOrder("")
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-farmer-light text-white hover:bg-farmer gap-2">
          <Plus className="w-4 h-4" />
          Add Crop
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add New Crop</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="crop-name">Crop Name</Label>
            <Input
              id="crop-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Tomatoes"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="harvest-qty">Harvest Quantity (kg)</Label>
            <Input
              id="harvest-qty"
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder="e.g. 500"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="price">Wholesale Price (₱/kg)</Label>
            <Input
              id="price"
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="e.g. 60"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="min-order">Minimum Order Quantity (kg)</Label>
            <Input
              id="min-order"
              type="number"
              value={minOrder}
              onChange={(e) => setMinOrder(e.target.value)}
              placeholder="e.g. 100"
              required
            />
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" className="bg-farmer-light text-white hover:bg-farmer">
              Add Crop
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
