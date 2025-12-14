"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Calendar, Clock, MapPin, Truck, User, CheckCircle, XCircle } from "lucide-react"

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!action) return

    setLoading(true)

    try {
      const response = await fetch(`/api/delivery-schedule/${schedule.id}/confirm`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          notes: notes || undefined
        })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to process schedule')
      }

      const updatedSchedule = await response.json()
      onActionComplete(updatedSchedule)
      onOpenChange(false)
      setNotes("")
      setAction(null)
    } catch (error: any) {
      console.error('Error processing schedule:', error)
    } finally {
      setLoading(false)
    }
  }

  const otherParty = schedule.proposer.id === user.id ? schedule.confirmer : schedule.proposer

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Review Delivery Schedule Proposal</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <User className="w-4 h-4" />
              <span className="font-medium">Proposed by: {schedule.proposer.name}</span>
            </div>
            <p className="text-sm text-gray-600">Order #{schedule.orderId}</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-gray-500" />
              <span className="text-sm">
                {new Date(schedule.scheduledDate).toLocaleDateString()}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-gray-500" />
              <span className="text-sm">{schedule.scheduledTime}</span>
            </div>
          </div>

          {schedule.deliveryAddress && (
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-gray-500" />
              <span className="text-sm">{schedule.deliveryAddress}</span>
            </div>
          )}

          {schedule.route && (
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-gray-500" />
              <span className="text-sm">Route: {schedule.route}</span>
            </div>
          )}

          {schedule.truckWeightKg && (
            <div className="flex items-center gap-2">
              <Truck className="w-4 h-4 text-gray-500" />
              <span className="text-sm">Truck Weight: {schedule.truckWeightKg}kg</span>
            </div>
          )}

          {schedule.notes && (
            <div className="bg-blue-50 p-3 rounded-lg">
              <p className="text-sm font-medium text-blue-800 mb-1">Notes from proposer:</p>
              <p className="text-sm text-blue-700">{schedule.notes}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="responseNotes">Your Response Notes (Optional)</Label>
              <Textarea
                id="responseNotes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add any notes or conditions for your response..."
                rows={3}
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={loading}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                onClick={() => setAction("reject")}
                disabled={loading}
                variant="destructive"
                className="flex-1"
              >
                <XCircle className="w-4 h-4 mr-2" />
                {loading ? "Processing..." : "Reject Schedule"}
              </Button>
              <Button
                type="submit"
                onClick={() => setAction("confirm")}
                disabled={loading}
                className="flex-1"
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
