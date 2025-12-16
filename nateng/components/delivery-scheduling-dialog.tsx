"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar, Clock, MapPin, Truck, AlertTriangle } from "lucide-react"
import { toast } from "sonner"

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
    truckWeightType: "",
    deliveryAddress: "",
    notes: ""
  })
  const [loading, setLoading] = useState(false)
  const [truckBanWarning, setTruckBanWarning] = useState<string | null>(null)

  const routes = [
    "Marcos Highway",
    "Kennon Road", 
    "Naguilian Road",
    "Halsema Highway",
    "Asin–Nangalisan Road",
    "La Trinidad",
    "others"
  ]

  const truckWeightTypes = [
    { value: "pickup", label: "Pickup Trucks", weight: 2000 },
    { value: "light-van", label: "Light Vans & Small Cargo Vans", weight: 3000 },
    { value: "light-truck", label: "Light Trucks (4-Wheel Light Commercial Trucks)", weight: 4000 },
    { value: "small-vehicle", label: "Smaller Vehicles (SUV, MPV)", weight: 2500 }
  ]

  // Check for Baguio City truck ban restrictions
  useEffect(() => {
    if (formData.scheduledTime && formData.truckWeightType) {
      const selectedTruck = truckWeightTypes.find(t => t.value === formData.truckWeightType)
      if (selectedTruck && selectedTruck.weight >= 4500) {
        const hour = parseInt(formData.scheduledTime.split(':')[0])
        const minute = parseInt(formData.scheduledTime.split(':')[1])
        const timeInMinutes = hour * 60 + minute
        
        // Peak rush hours: 6-9 AM (360-540 minutes) and 4-9 PM (960-1140 minutes)
        const isRushHour = (timeInMinutes >= 360 && timeInMinutes <= 540) || (timeInMinutes >= 960 && timeInMinutes <= 1140)
        
        if (isRushHour) {
          setTruckBanWarning(`Baguio City Truck Ban: Heavy vehicles (${selectedTruck.weight}kg+) are restricted from main roads during peak hours (6-9 AM and 4-9 PM). Consider scheduling outside these hours or choosing a lighter vehicle.`)
        } else {
          setTruckBanWarning(null)
        }
      } else {
        setTruckBanWarning(null)
      }
    } else {
      setTruckBanWarning(null)
    }
  }, [formData.scheduledTime, formData.truckWeightType])

  const handleTruckTypeChange = (value: string) => {
    const selectedTruck = truckWeightTypes.find(t => t.value === value)
    setFormData({ 
      ...formData, 
      truckWeightType: value,
      truckWeightKg: selectedTruck?.weight.toString() || ""
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Get current user for authentication
      const currentUser = localStorage.getItem('natenghub_user')
      const user = currentUser ? JSON.parse(currentUser) : null
      
      if (!user) {
        toast.error("Authentication required", {
          description: "Please log in again to continue"
        })
        setLoading(false)
        return
      }

      const response = await fetch('/api/delivery-schedule', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer token_${user.id}_${Date.now()}`
        },
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
        truckWeightType: "",
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
            <Select value={formData.route} onValueChange={(value) => setFormData({ ...formData, route: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Select a route" />
              </SelectTrigger>
              <SelectContent>
                {routes.map((route) => (
                  <SelectItem key={route} value={route}>
                    {route}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
              <Label htmlFor="truckWeightType" className="flex items-center gap-2">
                <Truck className="w-4 h-4" />
                Vehicle Type
              </Label>
              <Select value={formData.truckWeightType} onValueChange={handleTruckTypeChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select vehicle type" />
                </SelectTrigger>
                <SelectContent>
                  {truckWeightTypes.map((truck) => (
                    <SelectItem key={truck.value} value={truck.value}>
                      {truck.label} ({truck.weight}kg)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {truckBanWarning && (
              <div className="rounded-lg border border-amber-200 bg-amber-50 p-3">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-amber-800">{truckBanWarning}</p>
                </div>
              </div>
            )}
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
