"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface SellerSettingsFieldsProps {
  minimumOrderKg: number
  deliveryAreas: string
  paymentMethods: string
  onInputChange: (field: string, value: string | number) => void
}

export function SellerSettingsFields({
  minimumOrderKg,
  deliveryAreas,
  paymentMethods,
  onInputChange,
}: SellerSettingsFieldsProps) {
  return (
    <>
      <div className="space-y-2">
        <Label htmlFor="minimumOrderKg">Minimum Order (kg)</Label>
        <Input
          id="minimumOrderKg"
          type="number"
          value={minimumOrderKg}
          onChange={(e) => onInputChange('minimumOrderKg', parseInt(e.target.value) || 0)}
          className="h-12"
          placeholder="e.g., 50"
        />
        <p className="text-xs text-muted-foreground">
          Minimum order quantity for bulk buyers
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="deliveryAreas">Delivery Areas</Label>
        <Input
          id="deliveryAreas"
          value={deliveryAreas}
          onChange={(e) => onInputChange('deliveryAreas', e.target.value)}
          className="h-12"
          placeholder="e.g., Baguio City, La Trinidad (comma separated)"
        />
        <p className="text-xs text-muted-foreground">
          Areas where you can deliver (comma separated)
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="paymentMethods">Payment Methods</Label>
        <Input
          id="paymentMethods"
          value={paymentMethods}
          onChange={(e) => onInputChange('paymentMethods', e.target.value)}
          className="h-12"
          placeholder="e.g., cash_on_delivery, bank_transfer, gcash"
        />
        <p className="text-xs text-muted-foreground">
          Accepted payment methods (comma separated)
        </p>
      </div>
    </>
  )
}