"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { getCurrentUser } from "@/lib/auth"
import { Truck, MapPin, AlertTriangle, Clock, Shield, CheckCircle } from "lucide-react"
import Image from "next/image"

export default function FarmerLogisticsPage() {
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    const currentUser = getCurrentUser()
    if (!currentUser) {
      window.location.href = "/login"
      return
    }
    setUser(currentUser)
  }, [])

  if (!user) return null

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold text-foreground tracking-tight">Logistics & Delivery</h1>
        <p className="text-muted-foreground mt-1">Manage your delivery routes and compliance</p>
      </div>

      {/* Map Section */}
      <div className="bg-card rounded-2xl border border-border p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <MapPin className="w-5 h-5 text-farmer" />
          Delivery Coverage Area
        </h2>
        <div className="relative rounded-xl overflow-hidden bg-muted h-96 flex items-center justify-center">
          <div className="absolute inset-0 bg-gradient-to-br from-farmer/10 to-farmer/5" />
          <div className="relative text-center">
            <div className="w-32 h-32 mx-auto mb-4 bg-farmer/20 rounded-full flex items-center justify-center">
              <MapPin className="w-16 h-16 text-farmer" />
            </div>
            <p className="text-lg font-medium text-farmer mb-2">Benguet Province</p>
            <p className="text-sm text-muted-foreground">Your delivery coverage is based on your farm location</p>
            <p className="text-xs text-muted-foreground mt-1">Current: {user.city || 'La Trinidad'}, {user.province || 'Benguet'}</p>
          </div>
          {/* Placeholder for map image */}
          <div className="absolute bottom-4 right-4">
            <Button variant="outline" size="sm" disabled>
              View Interactive Map
            </Button>
          </div>
        </div>
      </div>

      {/* Ordinance Compliance */}
      <div className="bg-card rounded-2xl border border-border p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Shield className="w-5 h-5 text-farmer" />
          Ordinance Compliance
        </h2>
        <div className="space-y-4">
          <div className="flex items-start gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
            <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
            <div>
              <p className="font-medium text-green-900">Truck Ban Compliance</p>
              <p className="text-sm text-green-700 mt-1">
                Your delivery schedules automatically comply with Benguet truck ban ordinances
              </p>
            </div>
          </div>

          <div className="border-l-4 border-farmer pl-4">
            <h3 className="font-medium mb-2">Key Regulations</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <Clock className="w-4 h-4 mt-0.5 text-farmer" />
                <span>
                  <strong>Baguio City:</strong> No trucks 6:00 AM - 9:00 AM and 4:00 PM - 7:00 PM
                </span>
              </li>
              <li className="flex items-start gap-2">
                <Clock className="w-4 h-4 mt-0.5 text-farmer" />
                <span>
                  <strong>La Trinidad:</strong> No trucks 6:00 AM - 8:00 AM and 4:00 PM - 6:00 PM
                </span>
              </li>
              <li className="flex items-start gap-2">
                <Clock className="w-4 h-4 mt-0.5 text-farmer" />
                <span>
                  <strong>Itogon/Tuba:</strong> No trucks 6:00 AM - 8:00 AM and 4:00 PM - 6:00 PM
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Violation Penalties */}
      <div className="bg-card rounded-2xl border border-border p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-orange-500" />
          Violation Penalties
        </h2>
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <h3 className="font-medium text-orange-900 mb-2">Truck Ban Violations</h3>
          <ul className="space-y-1 text-sm text-orange-800">
            <li>• First offense: ₱2,000 fine</li>
            <li>• Second offense: ₱3,000 fine</li>
            <li>• Third offense: ₱5,000 fine + possible impoundment</li>
            <li>• Exceeding weight limits: Additional ₱1,000 per ton</li>
          </ul>
          <p className="text-xs text-orange-700 mt-3">
            All deliveries scheduled through NatengHub automatically comply with local ordinances
          </p>
        </div>
      </div>

      {/* Delivery Schedule Tips */}
      <div className="bg-card rounded-2xl border border-border p-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Truck className="w-5 h-5 text-farmer" />
          Best Practices
        </h2>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="p-4 bg-farmer/5 rounded-lg border border-farmer/20">
            <h3 className="font-medium text-farmer mb-2">Optimal Delivery Times</h3>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Early morning: 5:00 AM - 6:00 AM</li>
              <li>• Mid-morning: 9:00 AM - 3:00 PM</li>
              <li>• Evening: 7:00 PM - 9:00 PM</li>
            </ul>
          </div>
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h3 className="font-medium text-blue-900 mb-2">Route Planning</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Group nearby deliveries</li>
              <li>• Avoid peak traffic hours</li>
              <li>• Consider road conditions</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
