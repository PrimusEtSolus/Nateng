"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertTriangle, CheckCircle2, Info, Clock } from "lucide-react"
import { toast } from "sonner"
import {
  validateDeliverySchedule,
  getAvailableWindowTimes,
  getExemptionTypes,
  formatTime,
  isInTruckBanWindow,
  type DeliverySchedule,
  type TruckBanZone,
} from "@/lib/truck-ban"

interface DeliverySchedulerProps {
  orderId?: number
  onSchedule?: (schedule: any) => void | Promise<void>
  initialSchedule?: {
    scheduledDate?: string
    scheduledTime?: string
    route?: string
    isCBD?: boolean
    truckWeightKg?: number
    deliveryAddress?: string
    isExempt?: boolean
    exemptionType?: string | null
  }
}

export function DeliveryScheduler({ orderId, onSchedule, initialSchedule }: DeliverySchedulerProps) {
  const [scheduledDate, setScheduledDate] = useState(
    initialSchedule?.scheduledDate || new Date().toISOString().split('T')[0]
  )
  const [scheduledTime, setScheduledTime] = useState(initialSchedule?.scheduledTime || "09:00")
  const [route, setRoute] = useState(initialSchedule?.route || "")
  const [isCBD, setIsCBD] = useState(initialSchedule?.isCBD || false)
  const [truckWeightKg, setTruckWeightKg] = useState(
    initialSchedule?.truckWeightKg?.toString() || "4500"
  )
  const [deliveryAddress, setDeliveryAddress] = useState(initialSchedule?.deliveryAddress || "")
  const [isExempt, setIsExempt] = useState(initialSchedule?.isExempt || false)
  const [exemptionType, setExemptionType] = useState<string>(initialSchedule?.exemptionType || "")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [validationResult, setValidationResult] = useState<{
    isValid: boolean
    violations: string[]
    warnings: string[]
    suggestions: string[]
  } | null>(null)

  // Validate schedule when inputs change
  useEffect(() => {
    if (truckWeightKg && scheduledTime) {
      const weight = parseInt(truckWeightKg)
      if (!isNaN(weight) && weight >= 4500) {
        try {
          const validation = validateDeliverySchedule({
            date: new Date(scheduledDate),
            time: scheduledTime,
            route: route || "",
            isCBD,
            truckWeightKg: weight,
            isExempt,
            exemptionType: (exemptionType || null) as any,
          })
          setValidationResult(validation)
        } catch (error: any) {
          console.error('Validation error:', error)
          setValidationResult({
            isValid: false,
            violations: [error.message || 'Invalid schedule'],
            warnings: [],
            suggestions: [],
          })
        }
      } else {
        setValidationResult(null)
      }
    } else {
      setValidationResult(null)
    }
  }, [scheduledDate, scheduledTime, route, isCBD, truckWeightKg, isExempt, exemptionType])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!orderId && !onSchedule) {
      return
    }

    setIsSubmitting(true)

    try {
      const scheduleData = {
        scheduledDate,
        scheduledTime,
        route: route || null,
        isCBD,
        truckWeightKg: parseInt(truckWeightKg),
        deliveryAddress: deliveryAddress || null,
        isExempt,
        exemptionType: exemptionType || null,
      }

      if (onSchedule) {
        onSchedule(scheduleData)
        return
      }

      if (orderId) {
        const response = await fetch(`/api/orders/${orderId}/schedule`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(scheduleData),
        })

        if (!response.ok) {
          const error = await response.json()
          const errorMessage = error.error || 'Failed to schedule delivery'
          
          // Show detailed error if violations exist
          if (error.violations && error.violations.length > 0) {
            toast.error(errorMessage, {
              description: error.violations.join(', '),
              duration: 5000,
            })
          } else {
            toast.error(errorMessage)
          }
          
          throw new Error(errorMessage)
        }

        const result = await response.json()
        toast.success("Delivery scheduled successfully!")
      }
    } catch (error: any) {
      // Error already handled with toast above
      if (!error.message?.includes('Failed to schedule')) {
        toast.error(error.message || 'Failed to schedule delivery')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const zone: TruckBanZone = isCBD ? 'CBD' : 'OUTSIDE_CBD'
  const windowTimes = getAvailableWindowTimes(zone)
  const exemptionTypes = getExemptionTypes()
  const weight = parseInt(truckWeightKg) || 0
  const requiresCompliance = weight >= 4500

  return (
    <Card>
      <CardHeader>
        <CardTitle>Delivery Scheduling</CardTitle>
        <CardDescription>
          Schedule delivery with Baguio City Truck Ban Ordinance compliance
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Truck Weight */}
          <div className="space-y-2">
            <Label htmlFor="truckWeight">Truck Weight (kg)</Label>
            <Input
              id="truckWeight"
              type="number"
              min="0"
              value={truckWeightKg}
              onChange={(e) => setTruckWeightKg(e.target.value)}
              required
            />
            {requiresCompliance && (
              <p className="text-sm text-muted-foreground">
                Trucks with 4,500 kg or more must comply with truck ban hours
              </p>
            )}
          </div>

          {/* Exemption */}
          {requiresCompliance && (
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="isExempt"
                  checked={isExempt}
                  onCheckedChange={(checked) => {
                    setIsExempt(checked as boolean)
                    if (!checked) {
                      setExemptionType("") // Reset exemption type when unchecked
                    }
                  }}
                />
                <Label htmlFor="isExempt" className="cursor-pointer">
                  Vehicle is exempt from truck ban
                </Label>
              </div>

              {isExempt && (
                <div className="space-y-2 ml-6">
                  <Label htmlFor="exemptionType">Exemption Type</Label>
                  <Select value={exemptionType} onValueChange={setExemptionType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select exemption type" />
                    </SelectTrigger>
                    <SelectContent>
                      {exemptionTypes.map((type) => (
                        <SelectItem key={type.value || 'none'} value={type.value || ''}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          )}

          {/* Delivery Zone */}
          <div className="space-y-2">
            <Label htmlFor="isCBD">Delivery Zone</Label>
            <Select
              value={isCBD ? "CBD" : "OUTSIDE_CBD"}
              onValueChange={(value) => setIsCBD(value === "CBD")}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="OUTSIDE_CBD">Outside Central Business District</SelectItem>
                <SelectItem value="CBD">Central Business District (CBD)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Scheduled Date */}
          <div className="space-y-2">
            <Label htmlFor="scheduledDate">Scheduled Date</Label>
            <Input
              id="scheduledDate"
              type="date"
              value={scheduledDate}
              onChange={(e) => setScheduledDate(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              required
            />
          </div>

          {/* Scheduled Time */}
          <div className="space-y-2">
            <Label htmlFor="scheduledTime">Scheduled Time</Label>
            <Input
              id="scheduledTime"
              type="time"
              value={scheduledTime}
              onChange={(e) => setScheduledTime(e.target.value)}
              required
            />
            {requiresCompliance && !isExempt && (
              <div className="mt-2 space-y-1">
                <p className="text-sm font-medium">Available Window Times ({zone === 'CBD' ? 'CBD' : 'Outside CBD'}):</p>
                {windowTimes.map((window, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-sm">
                    {window.isBanned ? (
                      <AlertTriangle className="w-4 h-4 text-destructive" />
                    ) : (
                      <CheckCircle2 className="w-4 h-4 text-green-600" />
                    )}
                    <span className={window.isBanned ? 'text-destructive' : 'text-green-600'}>
                      {formatTime(window.start)} - {formatTime(window.end)}
                      {window.isBanned ? ' (BANNED)' : ' (ALLOWED)'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Route */}
          <div className="space-y-2">
            <Label htmlFor="route">Route (Optional)</Label>
            <Select value={route} onValueChange={setRoute}>
              <SelectTrigger>
                <SelectValue placeholder="Select route" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">No specific route</SelectItem>
                <SelectItem value="KENNON">Kennon Road</SelectItem>
                <SelectItem value="QUIRINO">Quirino Highway (Naguilian Road)</SelectItem>
                <SelectItem value="OTHER">Other Route</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Delivery Address */}
          <div className="space-y-2">
            <Label htmlFor="deliveryAddress">Delivery Address</Label>
            <Input
              id="deliveryAddress"
              value={deliveryAddress}
              onChange={(e) => setDeliveryAddress(e.target.value)}
              placeholder="Enter delivery address"
            />
          </div>

          {/* Validation Results */}
          {validationResult && requiresCompliance && !isExempt && (
            <div className="space-y-2">
              {validationResult.violations.length > 0 && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Truck Ban Violation</AlertTitle>
                  <AlertDescription>
                    <ul className="list-disc list-inside mt-2">
                      {validationResult.violations.map((v: string, idx: number) => (
                        <li key={idx}>{v}</li>
                      ))}
                    </ul>
                  </AlertDescription>
                </Alert>
              )}

              {validationResult.warnings.length > 0 && (
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertTitle>Warning</AlertTitle>
                  <AlertDescription>
                    <ul className="list-disc list-inside mt-2">
                      {validationResult.warnings.map((w: string, idx: number) => (
                        <li key={idx}>{w}</li>
                      ))}
                    </ul>
                  </AlertDescription>
                </Alert>
              )}

              {validationResult.suggestions.length > 0 && (
                <Alert>
                  <Clock className="h-4 w-4" />
                  <AlertTitle>Suggestions</AlertTitle>
                  <AlertDescription>
                    <ul className="list-disc list-inside mt-2">
                      {validationResult.suggestions.map((s: string, idx: number) => (
                        <li key={idx}>{s}</li>
                      ))}
                    </ul>
                  </AlertDescription>
                </Alert>
              )}

              {validationResult.isValid && validationResult.violations.length === 0 && (
                <Alert>
                  <CheckCircle2 className="h-4 w-4" />
                  <AlertTitle>Schedule Compliant</AlertTitle>
                  <AlertDescription>
                    This delivery schedule complies with the Truck Ban Ordinance.
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={isSubmitting || (validationResult?.isValid === false && requiresCompliance && isExempt === false)}
            className="w-full"
          >
            {isSubmitting ? "Scheduling..." : "Schedule Delivery"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

