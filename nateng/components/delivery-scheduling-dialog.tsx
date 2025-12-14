"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Calendar, Clock, MapPin, Truck } from "lucide-react"

interface DeliverySchedulingDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  order: any
  user: any
  onScheduleProposed: (schedule: any) => void
}

export function DeliverySchedulingDialog({ 
  open, 
  onOpenChange, 
  order, 
  user, 
  onScheduleProposed 
}: DeliverySchedulingDialogProps) {
  const [formData, setFormData] = useState({
    scheduledDate: "",
    scheduledTime: "",
    route: "",
    isCBD: false,
    truckWeightKg: "",
    deliveryAddress: "",
    notes: ""
  })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch('/api/delivery-schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: order.id,
          ...formData
        })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to propose schedule')
      }

      const schedule = await response.json()
      onScheduleProposed(schedule)
      onOpenChange(false)
      setFormData({
        scheduledDate: "",
        scheduledTime: "",
        route: "",
        isCBD: false,
        truckWeightKg: "",
        deliveryAddress: "",
        notes: ""
      })
    } catch (error: any) {
      console.error('Error proposing schedule:', error)
    } finally {
      setLoading(false)
    }
  }

  const otherParty = user.id === order.buyerId ? order.seller : order.buyer

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Propose Delivery Schedule</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="bg-gray-50 p-3 rounded-lg">
            <p className="text-sm text-gray-600">
              Proposing delivery schedule for order #{order.id}
            </p>
            <p className="text-sm font-medium">
              Other party: {otherParty.name} ({otherParty.role})
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="scheduledDate" className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Delivery Date
              </Label>
              <Input
                id="scheduledDate"
                type="date"
                value={formData.scheduledDate}
                onChange={(e) => setFormData({ ...formData, scheduledDate: e.target.value })}
                min={new Date().toISOString().split('T')[0]}
                required
              />
            </div>

            <div>
              <Label htmlFor="scheduledTime" className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Delivery Time
              </Label>
              <Input
                id="scheduledTime"
                type="time"
                value={formData.scheduledTime}
                onChange={(e) => setFormData({ ...formData, scheduledTime: e.target.value })}
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="deliveryAddress" className="flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              Delivery Address
            </Label>
            <Input
              id="deliveryAddress"
              value={formData.deliveryAddress}
              onChange={(e) => setFormData({ ...formData, deliveryAddress: e.target.value })}
              placeholder="Enter delivery address"
            />
          </div>

          <div>
            <Label htmlFor="route" className="flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              Preferred Route
            </Label>
            <Input
              id="route"
              value={formData.route}
              onChange={(e) => setFormData({ ...formData, route: e.target.value })}
              placeholder="e.g., Kennon Road, Quirino Highway"
            />
          </div>

          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="isCBD"
                checked={formData.isCBD}
                onCheckedChange={(checked) => 
                  setFormData({ ...formData, isCBD: checked as boolean })
                }
              />
              <Label htmlFor="isCBD">Delivery within Central Business District</Label>
            </div>

            <div>
              <Label htmlFor="truckWeightKg" className="flex items-center gap-2">
                <Truck className="w-4 h-4" />
                Truck Weight (kg)
              </Label>
              <Input
                id="truckWeightKg"
                type="number"
                value={formData.truckWeightKg}
                onChange={(e) => setFormData({ ...formData, truckWeightKg: e.target.value })}
                placeholder="Optional - for truck ban compliance"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="notes">Additional Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Any special instructions or notes for the other party..."
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Proposing..." : "Propose Schedule"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
