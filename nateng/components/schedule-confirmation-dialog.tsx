"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Calendar, Clock, MapPin, Truck, User, CheckCircle, XCircle } from "lucide-react"
import { toast } from "sonner"

interface ScheduleConfirmationDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  schedule: any
  user: any
  onActionComplete: (updatedSchedule: any) => void
}

export function ScheduleConfirmationDialog({ 
  open, 
  onOpenChange, 
  schedule, 
  user, 
  onActionComplete 
}: ScheduleConfirmationDialogProps) {
  const [notes, setNotes] = useState("")
  const [loading, setLoading] = useState(false)
  const [action, setAction] = useState<"confirm" | "reject" | null>(null)

  // Debug logging when schedule changes
  useEffect(() => {
    if (schedule) {
      console.log('ScheduleConfirmationDialog received schedule:', schedule)
      console.log('Schedule ID:', schedule.id)
      console.log('Schedule keys:', Object.keys(schedule))
      console.log('Schedule orderId:', schedule.orderId)
      console.log('Schedule status:', schedule.status)
      console.log('Full schedule data:', JSON.stringify(schedule, null, 2))
      
      // Check if schedule has nested order data
      if (schedule.order) {
        console.log('Schedule has order data:', schedule.order)
        console.log('Order ID from schedule.order:', schedule.order.id)
      }
    } else {
      console.log('ScheduleConfirmationDialog received null/undefined schedule')
    }
  }, [schedule])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!action) return

    setLoading(true)

    try {
      // Debug logging
      console.log('Schedule ID:', schedule.id)
      console.log('Schedule object:', schedule)
      console.log('Schedule type:', typeof schedule)
      console.log('Full schedule JSON:', JSON.stringify(schedule, null, 2))
      
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

      // Use orderId to find the schedule if ID is missing
      let scheduleId = schedule.id
      console.log('=== SCHEDULE ID RESOLUTION DEBUG ===')
      console.log('1. Initial schedule.id:', schedule.id)
      console.log('2. schedule.orderId:', schedule.orderId)
      console.log('3. typeof schedule.id:', typeof schedule.id)
      console.log('4. typeof schedule.orderId:', typeof schedule.orderId)
      
      if (!scheduleId && schedule.orderId) {
        console.log('5. Missing schedule ID, attempting to find by orderId')
        
        // Find schedule by orderId
        const findResponse = await fetch(`/api/delivery-schedule?orderId=${schedule.orderId}`, {
          headers: { 
            'Authorization': `Bearer token_${user.id}_${Date.now()}`
          }
        })
        
        console.log('6. Find response status:', findResponse.status)
        
        if (findResponse.ok) {
          const schedules = await findResponse.json()
          console.log('7. Found schedules:', schedules)
          const foundSchedule = Array.isArray(schedules) ? schedules.find(s => s.status === 'proposed') : null
          
          if (foundSchedule && foundSchedule.id) {
            scheduleId = foundSchedule.id
            console.log('8. Found schedule ID:', scheduleId)
          } else {
            console.error('9. No proposed schedule found for this order')
            toast.error("No proposed schedule found", {
              description: "This order doesn't have any proposed schedules to review"
            })
            setLoading(false)
            return
          }
        } else {
          console.error('10. Failed to find schedule by order ID, status:', findResponse.status)
          toast.error("Failed to find schedule", {
            description: "Unable to locate the delivery schedule"
          })
          setLoading(false)
          return
        }
      }
      
      // Additional fallback: try to find any schedule for this order
      if (!scheduleId && schedule.orderId) {
        console.log('11. Still no schedule ID, trying to find any schedule for order')
        try {
          const allSchedulesResponse = await fetch(`/api/delivery-schedule?orderId=${schedule.orderId}`, {
            headers: { 
              'Authorization': `Bearer token_${user.id}_${Date.now()}`
            }
          })
          
          console.log('12. All schedules response status:', allSchedulesResponse.status)
          
          if (allSchedulesResponse.ok) {
            const allSchedules = await allSchedulesResponse.json()
            console.log('13. All schedules for order:', allSchedules)
            
            if (Array.isArray(allSchedules) && allSchedules.length > 0) {
              const anySchedule = allSchedules[0]
              if (anySchedule.id) {
                scheduleId = anySchedule.id
                console.log('14. Using any available schedule ID:', scheduleId)
              }
            }
          }
        } catch (error) {
          console.error('15. Error finding any schedule:', error)
        }
      }
      
      console.log('16. Final resolved scheduleId:', scheduleId)
      console.log('17. typeof final scheduleId:', typeof scheduleId)
      console.log('=== END SCHEDULE ID RESOLUTION DEBUG ===')

      const resolvedOrderId = schedule?.orderId ?? schedule?.order?.id
      const parsedResolvedOrderId = Number(resolvedOrderId)
      const hasValidOrderId = !isNaN(parsedResolvedOrderId) && parsedResolvedOrderId > 0

      const parsedScheduleId = Number(scheduleId)
      const hasValidScheduleId = !isNaN(parsedScheduleId) && parsedScheduleId > 0

      if (!hasValidScheduleId && !hasValidOrderId) {
        console.error('18. No valid scheduleId and no valid orderId fallback', { scheduleId, resolvedOrderId })
        toast.error("Schedule information incomplete", {
          description: "Missing schedule and order reference"
        })
        setLoading(false)
        return
      }

      const pathId = hasValidScheduleId ? String(parsedScheduleId) : '0'
      console.log('Making API call to:', `/api/delivery-schedule/${pathId}/confirm`)
      console.log('Using scheduleId:', scheduleId, 'orderId:', resolvedOrderId)

      const response = await fetch(`/api/delivery-schedule/${pathId}/confirm`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer token_${user.id}_${Date.now()}`
        },
        body: JSON.stringify({
          action,
          orderId: hasValidOrderId ? parsedResolvedOrderId : undefined,
          notes: notes || undefined
        })
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error('API Response Error:', response.status, errorText)
        
        let errorData
        try {
          errorData = JSON.parse(errorText)
        } catch {
          errorData = { error: errorText }
        }
        
        console.error('Parsed Error Data:', errorData)
        throw new Error(errorData.error || 'Failed to process schedule')
      }

      const updatedSchedule = await response.json()
      console.log('API Response Success:', updatedSchedule)
      onActionComplete(updatedSchedule)
      onOpenChange(false)
      setNotes("")
      setAction(null)
    } catch (error: any) {
      console.error('Error processing schedule:', error)
      toast.error(error.message || "Failed to process schedule", {
        description: "Please try again or contact support if the issue persists"
      })
    } finally {
      setLoading(false)
    }
  }

  const otherParty = schedule.proposer.id === user.id ? schedule.confirmer : schedule.proposer

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">Review Delivery Schedule Proposal</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          <div className="bg-gray-50 p-4 rounded-lg border">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <span className="font-medium text-gray-900">Proposed by: {schedule.proposer.name}</span>
                <p className="text-sm text-gray-600">Order #{schedule.orderId}</p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <Calendar className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide">Date</p>
                  <p className="text-sm font-medium text-gray-900">
                    {new Date(schedule.scheduledDate).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <Clock className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide">Time</p>
                  <p className="text-sm font-medium text-gray-900">{schedule.scheduledTime}</p>
                </div>
              </div>
            </div>

            {schedule.deliveryAddress && (
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <MapPin className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide">Delivery Address</p>
                  <p className="text-sm font-medium text-gray-900">{schedule.deliveryAddress}</p>
                </div>
              </div>
            )}

            {schedule.route && (
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <MapPin className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide">Route</p>
                  <p className="text-sm font-medium text-gray-900">{schedule.route}</p>
                </div>
              </div>
            )}

            {schedule.truckWeightKg && (
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <Truck className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide">Vehicle Weight</p>
                  <p className="text-sm font-medium text-gray-900">{schedule.truckWeightKg}kg</p>
                </div>
              </div>
            )}
          </div>

          {schedule.notes && (
            <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
              <p className="text-sm font-medium text-blue-800 mb-2">Notes from proposer:</p>
              <p className="text-sm text-blue-700">{schedule.notes}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="responseNotes" className="text-sm font-medium text-gray-900">
                Your Response Notes (Optional)
              </Label>
              <Textarea
                id="responseNotes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add any notes or conditions for your response..."
                rows={3}
                className="mt-2"
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={loading}
                className="flex-1 h-11"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                onClick={() => setAction("reject")}
                disabled={loading}
                variant="destructive"
                className="flex-1 h-11"
              >
                <XCircle className="w-4 h-4 mr-2" />
                {loading ? "Processing..." : "Reject Schedule"}
              </Button>
              <Button
                type="submit"
                onClick={() => setAction("confirm")}
                disabled={loading}
                className="flex-1 h-11"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                {loading ? "Processing..." : "Confirm Schedule"}
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  )
}
