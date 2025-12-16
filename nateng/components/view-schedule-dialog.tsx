"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Calendar, Clock, MapPin, Truck, User, CheckCircle, Info } from "lucide-react"

interface ViewScheduleDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  schedule: any
  user: any
}

export function ViewScheduleDialog({ 
  open, 
  onOpenChange, 
  schedule, 
  user 
}: ViewScheduleDialogProps) {
  if (!schedule) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            Confirmed Delivery Schedule
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-green-600" />
              </div>
              <div>
                <span className="font-medium text-gray-900">Schedule Details</span>
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

          <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Info className="w-4 h-4 text-blue-600" />
              <p className="text-sm font-medium text-blue-800">Schedule Information</p>
            </div>
            <div className="space-y-1 text-sm text-blue-700">
              <p><strong>Proposed by:</strong> {schedule.proposer?.name || 'Unknown'}</p>
              {schedule.confirmer && (
                <p><strong>Confirmed by:</strong> {schedule.confirmer.name}</p>
              )}
              <p><strong>Status:</strong> <span className="font-medium text-green-700">Confirmed</span></p>
            </div>
          </div>

          {schedule.notes && (
            <div className="bg-gray-50 border border-gray-200 p-4 rounded-lg">
              <p className="text-sm font-medium text-gray-800 mb-2">Notes:</p>
              <p className="text-sm text-gray-700">{schedule.notes}</p>
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              onClick={() => onOpenChange(false)}
              className="flex-1 h-11"
            >
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
