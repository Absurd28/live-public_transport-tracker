"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { X, MapPin, Clock, Navigation, Star, Bell, Share2, Calendar } from "lucide-react"
import { RealTimeIndicator } from "./real-time-indicator"
import type { BusStop } from "@/hooks/use-transit-data"

interface StopDetailModalProps {
  stop: BusStop | null
  onClose: () => void
  onNavigate?: (stop: BusStop) => void
}

// Mock additional stop details
const getStopDetails = (stop: BusStop) => ({
  stopId: `#${stop.id.toUpperCase()}`,
  address: "123 Market Street, San Francisco, CA 94102",
  amenities: {
    shelter: true,
    bench: true,
    lighting: true,
    accessibility: true,
    realTimeDisplay: Math.random() > 0.3,
  },
  nearbyLandmarks: ["Union Square - 0.2 mi", "Westfield Shopping Center - 0.1 mi", "Powell Street Station - 0.3 mi"],
  allArrivals: [
    ...stop.nextArrivals,
    { route: "8", eta: "18 min", realtime: false },
    { route: "45", eta: "22 min", realtime: true },
    { route: "12", eta: "28 min", realtime: false },
  ],
})

export function StopDetailModal({ stop, onClose, onNavigate }: StopDetailModalProps) {
  const [activeTab, setActiveTab] = useState<"arrivals" | "info" | "alerts">("arrivals")
  const [isFavorite, setIsFavorite] = useState(false)

  if (!stop) return null

  const details = getStopDetails(stop)

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4">
      <Card className="w-full max-w-lg max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-card border-b border-border p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                <MapPin className="w-5 h-5 text-primary-foreground" />
              </div>
              <div className="flex-1">
                <h2 className="text-lg font-semibold">{stop.name}</h2>
                <p className="text-sm text-muted-foreground">{details.stopId}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsFavorite(!isFavorite)}
                className={isFavorite ? "text-yellow-500" : ""}
              >
                <Star className={`w-5 h-5 ${isFavorite ? "fill-current" : ""}`} />
              </Button>
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="w-5 h-5" />
              </Button>
            </div>
          </div>

          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="w-4 h-4" />
            <span>{details.address}</span>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-border">
          {[
            { id: "arrivals", label: "Arrivals" },
            { id: "info", label: "Stop Info" },
            { id: "alerts", label: "Alerts" },
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
          {activeTab === "arrivals" && (
            <div className="space-y-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-medium">Next Arrivals</h3>
                <Button variant="ghost" size="sm">
                  <Bell className="w-4 h-4 mr-1" />
                  Notify
                </Button>
              </div>

              {details.allArrivals.map((arrival, index) => (
                <Card key={index} className="p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Badge variant="outline" className="font-mono">
                        {arrival.route}
                      </Badge>
                      <RealTimeIndicator isRealtime={arrival.realtime} />
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-1 text-primary">
                        <Clock className="w-4 h-4" />
                        <span className="font-medium">{arrival.eta}</span>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}

          {activeTab === "info" && (
            <div className="space-y-4">
              {/* Amenities */}
              <Card className="p-4">
                <h3 className="font-medium mb-3">Stop Amenities</h3>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div
                    className={`flex items-center gap-2 ${details.amenities.shelter ? "text-green-600" : "text-gray-400"}`}
                  >
                    <div className="w-2 h-2 rounded-full bg-current" />
                    <span>Weather Shelter</span>
                  </div>
                  <div
                    className={`flex items-center gap-2 ${details.amenities.bench ? "text-green-600" : "text-gray-400"}`}
                  >
                    <div className="w-2 h-2 rounded-full bg-current" />
                    <span>Seating</span>
                  </div>
                  <div
                    className={`flex items-center gap-2 ${details.amenities.lighting ? "text-green-600" : "text-gray-400"}`}
                  >
                    <div className="w-2 h-2 rounded-full bg-current" />
                    <span>Lighting</span>
                  </div>
                  <div
                    className={`flex items-center gap-2 ${details.amenities.accessibility ? "text-green-600" : "text-gray-400"}`}
                  >
                    <div className="w-2 h-2 rounded-full bg-current" />
                    <span>Accessible</span>
                  </div>
                  <div
                    className={`flex items-center gap-2 ${details.amenities.realTimeDisplay ? "text-green-600" : "text-gray-400"}`}
                  >
                    <div className="w-2 h-2 rounded-full bg-current" />
                    <span>Real-time Display</span>
                  </div>
                </div>
              </Card>

              {/* Routes */}
              <Card className="p-4">
                <h3 className="font-medium mb-3">Routes Served</h3>
                <div className="flex flex-wrap gap-2">
                  {stop.routes.map((route) => (
                    <Badge key={route} variant="secondary">
                      Route {route}
                    </Badge>
                  ))}
                </div>
              </Card>

              {/* Nearby Landmarks */}
              <Card className="p-4">
                <h3 className="font-medium mb-3">Nearby Landmarks</h3>
                <div className="space-y-2 text-sm">
                  {details.nearbyLandmarks.map((landmark, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <MapPin className="w-3 h-3 text-muted-foreground" />
                      <span>{landmark}</span>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          )}

          {activeTab === "alerts" && (
            <div className="space-y-3">
              <Card className="p-4 border-amber-200 bg-amber-50">
                <div className="flex items-start gap-3">
                  <Bell className="w-5 h-5 text-amber-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-amber-900 mb-1">Service Advisory</h4>
                    <p className="text-sm text-amber-800">
                      Route 14 experiencing minor delays due to traffic congestion on Market Street.
                    </p>
                    <p className="text-xs text-amber-700 mt-2">Posted 15 minutes ago</p>
                  </div>
                </div>
              </Card>

              <Card className="p-4 border-blue-200 bg-blue-50">
                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-blue-900 mb-1">Weekend Schedule</h4>
                    <p className="text-sm text-blue-800">
                      Modified weekend service in effect. Routes may have reduced frequency.
                    </p>
                    <p className="text-xs text-blue-700 mt-2">Effective this weekend</p>
                  </div>
                </div>
              </Card>

              <div className="text-center py-4">
                <p className="text-sm text-muted-foreground">No additional alerts at this time</p>
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="p-4 border-t border-border">
          <div className="flex gap-2">
            <Button className="flex-1" onClick={() => onNavigate?.(stop)}>
              <Navigation className="w-4 h-4 mr-2" />
              Get Directions
            </Button>
            <Button variant="outline">
              <Share2 className="w-4 h-4 mr-2" />
              Share
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )
}
