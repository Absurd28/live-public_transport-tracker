"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  X,
  MapPin,
  Clock,
  Users,
  Navigation,
  AlertTriangle,
  Thermometer,
  Wifi,
  Volume2,
  Accessibility,
} from "lucide-react"
import { RealTimeIndicator } from "./real-time-indicator"
import type { Bus } from "@/hooks/use-transit-data"

interface BusDetailModalProps {
  bus: Bus | null
  onClose: () => void
  onNavigate?: (bus: Bus) => void
}

// Mock additional bus details
const getBusDetails = (bus: Bus) => ({
  vehicleNumber: `#${bus.id.toUpperCase()}`,
  capacity: 40,
  currentPassengers: bus.occupancy === "low" ? 12 : bus.occupancy === "medium" ? 25 : 35,
  accessibility: true,
  airConditioning: true,
  wifi: Math.random() > 0.3,
  nextStops: [
    { name: bus.nextStop, eta: "Arriving", distance: "0.1 mi" },
    { name: "Union Square", eta: "3 min", distance: "0.4 mi" },
    { name: "Civic Center", eta: "7 min", distance: "0.8 mi" },
    { name: "Mission District", eta: "12 min", distance: "1.2 mi" },
  ],
  route: {
    name: `Route ${bus.route}`,
    description: bus.route === "14" ? "Mission - Downtown" : "Stockton - Chinatown",
    operatingHours: "5:00 AM - 12:30 AM",
    frequency: "Every 8-12 minutes",
    totalStops: 24,
  },
})

export function BusDetailModal({ bus, onClose, onNavigate }: BusDetailModalProps) {
  const [activeTab, setActiveTab] = useState<"overview" | "route" | "schedule">("overview")

  if (!bus) return null

  const details = getBusDetails(bus)
  const occupancyPercentage = (details.currentPassengers / details.capacity) * 100

  const getOccupancyColor = () => {
    if (occupancyPercentage < 40) return "text-green-600"
    if (occupancyPercentage < 70) return "text-yellow-600"
    return "text-red-600"
  }

  const getOccupancyBgColor = () => {
    if (occupancyPercentage < 40) return "bg-green-100"
    if (occupancyPercentage < 70) return "bg-yellow-100"
    return "bg-red-100"
  }

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4">
      <Card className="w-full max-w-lg max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-primary text-primary-foreground p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary-foreground/20 rounded-lg flex items-center justify-center">
                <span className="text-lg font-bold">{bus.route}</span>
              </div>
              <div>
                <h2 className="text-lg font-semibold">{details.route.name}</h2>
                <p className="text-sm opacity-90">{details.vehicleNumber}</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="text-primary-foreground hover:bg-primary-foreground/20"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              <span>{bus.speed} mph</span>
            </div>
            <RealTimeIndicator isRealtime={bus.isRealtime} lastUpdated={bus.lastUpdated} delay={bus.delay} size="md" />
            {bus.delay && (
              <div className="flex items-center gap-1 text-amber-200">
                <AlertTriangle className="w-4 h-4" />
                <span>Delayed</span>
              </div>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-border">
          {[
            { id: "overview", label: "Overview" },
            { id: "route", label: "Route" },
            { id: "schedule", label: "Schedule" },
          ].map((tab) => (
            <Button
              key={tab.id}
              variant="ghost"
              className={`flex-1 rounded-none border-b-2 ${
                activeTab === tab.id ? "border-primary text-primary" : "border-transparent"
              }`}
              onClick={() => setActiveTab(tab.id as any)}
            >
              {tab.label}
            </Button>
          ))}
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto max-h-96">
          {activeTab === "overview" && (
            <div className="space-y-4">
              {/* Occupancy */}
              <Card className={`p-4 ${getOccupancyBgColor()}`}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    <span className="font-medium">Occupancy</span>
                  </div>
                  <Badge variant="secondary" className={getOccupancyColor()}>
                    {bus.occupancy.toUpperCase()}
                  </Badge>
                </div>
                <div className="space-y-2">
                  <Progress value={occupancyPercentage} className="h-2" />
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>{details.currentPassengers} passengers</span>
                    <span>{details.capacity} capacity</span>
                  </div>
                </div>
              </Card>

              {/* Amenities */}
              <Card className="p-4">
                <h3 className="font-medium mb-3 flex items-center gap-2">
                  <Thermometer className="w-4 h-4" />
                  Amenities
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  <div
                    className={`flex items-center gap-2 text-sm ${details.accessibility ? "text-green-600" : "text-gray-400"}`}
                  >
                    <Accessibility className="w-4 h-4" />
                    <span>Wheelchair Access</span>
                  </div>
                  <div
                    className={`flex items-center gap-2 text-sm ${details.airConditioning ? "text-blue-600" : "text-gray-400"}`}
                  >
                    <Thermometer className="w-4 h-4" />
                    <span>Air Conditioning</span>
                  </div>
                  <div
                    className={`flex items-center gap-2 text-sm ${details.wifi ? "text-green-600" : "text-gray-400"}`}
                  >
                    <Wifi className="w-4 h-4" />
                    <span>WiFi Available</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-blue-600">
                    <Volume2 className="w-4 h-4" />
                    <span>Audio Announcements</span>
                  </div>
                </div>
              </Card>

              {/* Next Stops */}
              <Card className="p-4">
                <h3 className="font-medium mb-3 flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  Next Stops
                </h3>
                <div className="space-y-3">
                  {details.nextStops.map((stop, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-2 h-2 rounded-full ${index === 0 ? "bg-primary animate-pulse" : "bg-muted"}`}
                        />
                        <div>
                          <p className="font-medium text-sm">{stop.name}</p>
                          <p className="text-xs text-muted-foreground">{stop.distance}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`text-sm font-medium ${index === 0 ? "text-primary" : "text-muted-foreground"}`}>
                          {stop.eta}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          )}

          {activeTab === "route" && (
            <div className="space-y-4">
              <Card className="p-4">
                <h3 className="font-medium mb-2">{details.route.name}</h3>
                <p className="text-sm text-muted-foreground mb-3">{details.route.description}</p>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Total Stops:</span>
                    <p className="font-medium">{details.route.totalStops}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Frequency:</span>
                    <p className="font-medium">{details.route.frequency}</p>
                  </div>
                </div>
              </Card>

              <Card className="p-4">
                <h3 className="font-medium mb-3">Route Map</h3>
                <div className="bg-muted rounded-lg h-32 flex items-center justify-center">
                  <p className="text-muted-foreground text-sm">Interactive route map would appear here</p>
                </div>
              </Card>
            </div>
          )}

          {activeTab === "schedule" && (
            <div className="space-y-4">
              <Card className="p-4">
                <h3 className="font-medium mb-2">Operating Hours</h3>
                <p className="text-sm text-muted-foreground mb-3">{details.route.operatingHours}</p>
                <div className="text-sm">
                  <span className="text-muted-foreground">Service Frequency:</span>
                  <p className="font-medium">{details.route.frequency}</p>
                </div>
              </Card>

              <Card className="p-4">
                <h3 className="font-medium mb-3">Today's Schedule</h3>
                <div className="space-y-2 text-sm">
                  {[
                    { time: "5:15 AM", status: "departed" },
                    { time: "5:27 AM", status: "departed" },
                    { time: "5:39 AM", status: "current" },
                    { time: "5:51 AM", status: "upcoming" },
                    { time: "6:03 AM", status: "upcoming" },
                  ].map((schedule, index) => (
                    <div
                      key={index}
                      className={`flex justify-between items-center p-2 rounded ${
                        schedule.status === "current"
                          ? "bg-primary/10 text-primary"
                          : schedule.status === "departed"
                            ? "text-muted-foreground"
                            : ""
                      }`}
                    >
                      <span>{schedule.time}</span>
                      <Badge
                        variant={
                          schedule.status === "current"
                            ? "default"
                            : schedule.status === "departed"
                              ? "secondary"
                              : "outline"
                        }
                      >
                        {schedule.status === "current"
                          ? "Current"
                          : schedule.status === "departed"
                            ? "Departed"
                            : "Upcoming"}
                      </Badge>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="p-4 border-t border-border">
          <div className="flex gap-2">
            <Button className="flex-1" onClick={() => onNavigate?.(bus)}>
              <Navigation className="w-4 h-4 mr-2" />
              Get Directions
            </Button>
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )
}
