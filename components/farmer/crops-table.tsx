"use client"

import type { Product } from "@prisma/client"

interface CropsTableProps {
  crops: Product[]
  onEdit: (id: number) => void
}

export function CropsTable({ crops, onEdit }: CropsTableProps) {
  return (
    <div className="bg-white rounded-2xl border border-black/5 overflow-hidden">
      {/* Table Header */}
      <div className="grid grid-cols-5 gap-4 px-6 py-4 border-b border-black font-normal text-black">
        <div>Crop Name</div>
        <div className="text-center">Harvest Quantity</div>
        <div className="text-center">Wholesale Price</div>
        <div className="text-center">Min Order Qty</div>
        <div className="text-center">Actions</div>
      </div>

      {/* Table Body */}
      {crops.map((crop, index) => (
        <div
          key={crop.id}
          className={`grid grid-cols-5 gap-4 px-6 py-4 items-center ${
            index < crops.length - 1 ? "border-b border-black" : ""
          }`}
        >
          <div className="font-normal text-black">{crop.name}</div>
          <div className="text-center text-black/50">-</div>
          <div className="text-center text-black/50">-</div>
          <div className="text-center text-black/50">-</div>
          <div className="text-center">
            <button
              onClick={() => onEdit(crop.id)}
              className="text-black/50 underline hover:text-black transition-colors"
            >
              Edit
            </button>
          </div>
        </div>
      ))}

      {crops.length === 0 && (
        <div className="px-6 py-12 text-center text-muted-foreground">
          No crops added yet. Click "Add Crop" to get started.
        </div>
      )}
    </div>
  )
}
