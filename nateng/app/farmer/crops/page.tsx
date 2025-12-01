"use client"

import { useState } from "react"
import { mockCrops, type Crop } from "@/lib/mock-data"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Search, Edit2, Trash2, Package } from "lucide-react"

export default function FarmerCropsPage() {
  const [crops, setCrops] = useState<Crop[]>(mockCrops)
  const [searchTerm, setSearchTerm] = useState("")
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [newCrop, setNewCrop] = useState({
    name: "",
    category: "Vegetables",
    harvestQuantity: "",
    wholesalePrice: "",
    minOrderQty: "",
    description: "",
  })

  const filteredCrops = crops.filter((c) => c.name.toLowerCase().includes(searchTerm.toLowerCase()))

  const handleAddCrop = () => {
    const crop: Crop = {
      id: `crop-${Date.now()}`,
      farmerId: "farmer-1",
      name: newCrop.name,
      category: newCrop.category,
      harvestQuantity: Number(newCrop.harvestQuantity),
      unit: "kg",
      wholesalePrice: Number(newCrop.wholesalePrice),
      minOrderQty: Number(newCrop.minOrderQty),
      description: newCrop.description,
      image: "/assorted-vegetables.png",
      harvestDate: new Date().toISOString().split("T")[0],
      status: "available",
    }
    setCrops([...crops, crop])
    setIsAddModalOpen(false)
    setNewCrop({
      name: "",
      category: "Vegetables",
      harvestQuantity: "",
      wholesalePrice: "",
      minOrderQty: "",
      description: "",
    })
  }

  const handleDeleteCrop = (id: string) => {
    setCrops(crops.filter((c) => c.id !== id))
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">My Crops</h1>
          <p className="text-muted-foreground mt-1">Manage your crop inventory and wholesale pricing</p>
        </div>
        <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
          <DialogTrigger asChild>
            <Button className="bg-farmer hover:bg-farmer-light text-white gap-2">
              <Plus className="w-5 h-5" />
              Add Crop
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Add New Crop</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Crop Name</Label>
                <Input
                  id="name"
                  value={newCrop.name}
                  onChange={(e) => setNewCrop({ ...newCrop, name: e.target.value })}
                  placeholder="e.g. Tomatoes"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="category">Category</Label>
                <Select value={newCrop.category} onValueChange={(value) => setNewCrop({ ...newCrop, category: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Vegetables">Vegetables</SelectItem>
                    <SelectItem value="Leafy Greens">Leafy Greens</SelectItem>
                    <SelectItem value="Root Vegetables">Root Vegetables</SelectItem>
                    <SelectItem value="Fruits">Fruits</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="quantity">Harvest Quantity (kg)</Label>
                  <Input
                    id="quantity"
                    type="number"
                    value={newCrop.harvestQuantity}
                    onChange={(e) => setNewCrop({ ...newCrop, harvestQuantity: e.target.value })}
                    placeholder="500"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="price">Wholesale Price (₱/kg)</Label>
                  <Input
                    id="price"
                    type="number"
                    value={newCrop.wholesalePrice}
                    onChange={(e) => setNewCrop({ ...newCrop, wholesalePrice: e.target.value })}
                    placeholder="60"
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="minOrder">Minimum Order (kg)</Label>
                <Input
                  id="minOrder"
                  type="number"
                  value={newCrop.minOrderQty}
                  onChange={(e) => setNewCrop({ ...newCrop, minOrderQty: e.target.value })}
                  placeholder="50"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  value={newCrop.description}
                  onChange={(e) => setNewCrop({ ...newCrop, description: e.target.value })}
                  placeholder="Fresh from Benguet highlands..."
                />
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setIsAddModalOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddCrop} className="bg-farmer hover:bg-farmer-light">
                Add Crop
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            placeholder="Search crops..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Crops Grid */}
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
                {crop.status.replace("_", " ")}
              </span>
            </div>
            <div className="p-5">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-lg">{crop.name}</h3>
                  <p className="text-sm text-muted-foreground">{crop.category}</p>
                </div>
                <div className="flex gap-1">
                  <button className="p-2 hover:bg-muted rounded-lg transition-colors">
                    <Edit2 className="w-4 h-4 text-muted-foreground" />
                  </button>
                  <button
                    onClick={() => handleDeleteCrop(crop.id)}
                    className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </button>
                </div>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Available</span>
                  <span className="font-medium">
                    {crop.harvestQuantity} {crop.unit}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Wholesale Price</span>
                  <span className="font-medium text-farmer">
                    ₱{crop.wholesalePrice}/{crop.unit}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Min Order</span>
                  <span className="font-medium">
                    {crop.minOrderQty} {crop.unit}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredCrops.length === 0 && (
        <div className="text-center py-12">
          <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="font-medium text-lg mb-1">No crops found</h3>
          <p className="text-muted-foreground">
            {searchTerm ? "Try a different search term" : "Add your first crop to get started"}
          </p>
        </div>
      )}
    </div>
  )
}
