"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Clock, AlertTriangle, CheckCircle2, Truck, MapPin } from "lucide-react"
import {
  getAvailableWindowTimes,
  formatTime,
  getPenaltyAmount,
  isInTruckBanWindow,
  type TruckBanZone,
} from "@/lib/truck-ban"

export default function LogisticsDashboard() {
  const [currentTime, setCurrentTime] = useState(new Date())
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Update current time every minute
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 60000)

    // Fetch orders with delivery schedules
    fetchOrders()

    return () => clearInterval(timer)
  }, [])

  const fetchOrders = async () => {
    try {
      const response = await fetch('/api/orders')
      if (response.ok) {
        const data = await response.json()
        // Filter orders with scheduled deliveries and validate dates
        const scheduledOrders = data.filter((o: any) => {
          if (!o.scheduledDate || !o.scheduledTime) return false
          try {
            const scheduled = new Date(`${o.scheduledDate}T${o.scheduledTime}`)
            return !isNaN(scheduled.getTime())
          } catch {
            return false
          }
        })
        setOrders(scheduledOrders)
      } else {
        console.error('Failed to fetch orders:', response.statusText)
      }
    } catch (error) {
      console.error('Error fetching orders:', error)
    } finally {
      setLoading(false)
    }
  }

  const getCurrentTimeString = () => {
    const hours = currentTime.getHours().toString().padStart(2, '0')
    const minutes = currentTime.getMinutes().toString().padStart(2, '0')
    return `${hours}:${minutes}`
  }

  const checkIfInBanWindow = (time: string, zone: TruckBanZone): boolean => {
    try {
      return isInTruckBanWindow(time, zone)
    } catch (error) {
      console.error('Error checking ban window:', error)
      return false
    }
  }

  const cbdWindows = getAvailableWindowTimes('CBD')
  const outsideCBDWindows = getAvailableWindowTimes('OUTSIDE_CBD')
  const currentTimeStr = getCurrentTimeString()
  const isCurrentlyBannedCBD = checkIfInBanWindow(currentTimeStr, 'CBD')
  const isCurrentlyBannedOutside = checkIfInBanWindow(currentTimeStr, 'OUTSIDE_CBD')

  const upcomingDeliveries = orders
    .filter((o) => {
      if (!o.scheduledDate || !o.scheduledTime) return false
      try {
        const scheduled = new Date(`${o.scheduledDate}T${o.scheduledTime}`)
        if (isNaN(scheduled.getTime())) return false
        return scheduled >= currentTime
      } catch {
        return false
      }
    })
    .sort((a, b) => {
      try {
        const dateA = new Date(`${a.scheduledDate}T${a.scheduledTime}`)
        const dateB = new Date(`${b.scheduledDate}T${b.scheduledTime}`)
        return dateA.getTime() - dateB.getTime()
      } catch {
        return 0
      }
    })
    .slice(0, 10)

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Logistics Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Baguio City Truck Ban Ordinance Compliance
        </p>
      </div>

      {/* Current Status */}
      <div className="grid md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Current Time: {currentTime.toLocaleTimeString()}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium mb-2">CBD Status</p>
                {isCurrentlyBannedCBD ? (
                  <Badge variant="destructive" className="w-full justify-center">
                    <AlertTriangle className="w-4 h-4 mr-2" />
                    TRUCK BAN ACTIVE
                  </Badge>
                ) : (
                  <Badge variant="default" className="w-full justify-center bg-green-600">
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    WINDOW TIME
                  </Badge>
                )}
              </div>
              <div>
                <p className="text-sm font-medium mb-2">Outside CBD Status</p>
                {isCurrentlyBannedOutside ? (
                  <Badge variant="destructive" className="w-full justify-center">
                    <AlertTriangle className="w-4 h-4 mr-2" />
                    TRUCK BAN ACTIVE
                  </Badge>
                ) : (
                  <Badge variant="default" className="w-full justify-center bg-green-600">
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    WINDOW TIME
                  </Badge>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Truck Ban Windows</CardTitle>
            <CardDescription>Permissible delivery hours</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <p className="text-sm font-semibold mb-2">Central Business District (CBD)</p>
                <div className="space-y-1">
                  {cbdWindows.map((window, idx) => (
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
              </div>
              <div>
                <p className="text-sm font-semibold mb-2">Outside CBD</p>
                <div className="space-y-1">
                  {outsideCBDWindows.map((window, idx) => (
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
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Penalties Information */}
      <Card>
        <CardHeader>
          <CardTitle>Violation Penalties</CardTitle>
          <CardDescription>Fines for truck ban violations</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-4 gap-4">
            <div className="border rounded-lg p-4">
              <p className="text-sm font-medium text-muted-foreground">First Offense</p>
              <p className="text-2xl font-bold">₱2,000</p>
            </div>
            <div className="border rounded-lg p-4">
              <p className="text-sm font-medium text-muted-foreground">Second Offense</p>
              <p className="text-2xl font-bold">₱3,000</p>
            </div>
            <div className="border rounded-lg p-4">
              <p className="text-sm font-medium text-muted-foreground">Third Offense</p>
              <p className="text-2xl font-bold">₱5,000</p>
            </div>
            <div className="border rounded-lg p-4 border-destructive">
              <p className="text-sm font-medium text-muted-foreground">Fourth Offense</p>
              <p className="text-2xl font-bold">₱5,000</p>
              <p className="text-xs text-muted-foreground mt-1">+ 1 month impound</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Upcoming Deliveries */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Truck className="w-5 h-5" />
            Upcoming Scheduled Deliveries
          </CardTitle>
          <CardDescription>Next 10 deliveries with compliance status</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-muted-foreground">Loading...</p>
          ) : upcomingDeliveries.length === 0 ? (
            <p className="text-muted-foreground">No scheduled deliveries</p>
          ) : (
            <div className="space-y-4">
              {upcomingDeliveries.map((order) => {
                let scheduled: Date
                try {
                  scheduled = new Date(`${order.scheduledDate}T${order.scheduledTime}`)
                  if (isNaN(scheduled.getTime())) {
                    return null
                  }
                } catch {
                  return null
                }

                const isBanned = order.truckWeightKg >= 4500 && 
                  !order.isExempt &&
                  checkIfInBanWindow(order.scheduledTime, order.isCBD ? 'CBD' : 'OUTSIDE_CBD')
                
                return (
                  <div
                    key={order.id}
                    className="border rounded-lg p-4 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-muted-foreground" />
                        <span className="font-medium">Order #{order.id}</span>
                        {isBanned ? (
                          <Badge variant="destructive">VIOLATION</Badge>
                        ) : order.isExempt ? (
                          <Badge variant="secondary">EXEMPT</Badge>
                        ) : (
                          <Badge variant="default" className="bg-green-600">COMPLIANT</Badge>
                        )}
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {scheduled.toLocaleString()}
                      </span>
                    </div>
                    <div className="grid md:grid-cols-3 gap-2 text-sm">
                      <div>
                        <span className="text-muted-foreground">Zone: </span>
                        {order.isCBD ? 'CBD' : 'Outside CBD'}
                      </div>
                      <div>
                        <span className="text-muted-foreground">Truck Weight: </span>
                        {order.truckWeightKg} kg
                      </div>
                      {order.route && (
                        <div>
                          <span className="text-muted-foreground">Route: </span>
                          {order.route}
                        </div>
                      )}
                    </div>
                    {isBanned && (
                      <Alert variant="destructive" className="mt-2">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertTitle>Schedule Violates Truck Ban</AlertTitle>
                        <AlertDescription>
                          This delivery is scheduled during banned hours. Please reschedule.
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                )
              }).filter((item): item is JSX.Element => item !== null)}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Exemptions Information */}
      <Card>
        <CardHeader>
          <CardTitle>Exemptions</CardTitle>
          <CardDescription>Vehicles exempt from truck ban</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="list-disc list-inside space-y-1 text-sm">
            <li>Water delivery trucks assisting fire-fighting</li>
            <li>Fire trucks</li>
            <li>Company vehicles of public utilities doing repairs/works</li>
            <li>Government registered trucks</li>
            <li>Heavy equipment already at worksite</li>
            <li>Trucks used during emergencies or calamities</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}

