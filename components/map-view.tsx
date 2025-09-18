"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { MapPin, User, ChevronUp, ChevronDown, RefreshCw } from "lucide-react"
import { InteractiveMap } from "./interactive-map"
import { ConnectionStatus } from "./connection-status"
import { BusDetailModal } from "./bus-detail-modal"
import { StopDetailModal } from "./stop-detail-modal"
import { EnhancedETACard } from "./enhanced-eta-card"
import type { Bus, BusStop } from "@/hooks/use-transit-data"

interface MapViewProps {
  userLocation: { lat: number; lng: number } | null
  transitData: {
    buses: Bus[]
    stops: BusStop[]
    routes: any[]
    lastUpdate: Date | null
    connectionStatus: "connected" | "connecting" | "disconnected" | "error"
    updateCount: number
    refreshData: () => void
    isLoading: boolean
    hasError: boolean
  }
}

export function MapView({ userLocation, transitData }: MapViewProps) {
  const [selectedStop, setSelectedStop] = useState<BusStop | null>(null)
  const [selectedBus, setSelectedBus] = useState<Bus | null>(null)
  const [showStopsList, setShowStopsList] = useState(true)
  const [showBusModal, setShowBusModal] = useState(false)
  const [showStopModal, setShowStopModal] = useState(false)

  const calculateDistance = (stop: BusStop) => {
    if (!userLocation) return "-- mi"
    const latDiff = Math.abs(stop.position.lat - userLocation.lat)
    const lngDiff = Math.abs(stop.position.lng - userLocation.lng)
    const distance = Math.sqrt(latDiff * latDiff + lngDiff * lngDiff) * 69
    return `${distance.toFixed(1)} mi`
  }

  const handleBusSelect = (bus: Bus) => {
    setSelectedBus(bus)
    setShowBusModal(true)
  }

  const handleStopSelect = (stop: BusStop) => {
    setSelectedStop(stop)
    setShowStopModal(true)
  }

  return (
    <div className="relative w-full h-full">
      <InteractiveMap
        userLocation={userLocation}
        buses={transitData.buses}
        stops={transitData.stops}
        routes={transitData.routes}
        onStopSelect={handleStopSelect}
        onBusSelect={handleBusSelect}
      />

      {transitData.connectionStatus === "connected" && transitData.lastUpdate && (
        <div className="absolute top-4 left-4 z-10">
          <ConnectionStatus
            status={transitData.connectionStatus}
            lastUpdate={transitData.lastUpdate}
            updateCount={transitData.updateCount}
            onRefresh={transitData.refreshData}
          />
        </div>
      )}

      <div
        className={`absolute bottom-0 left-0 right-0 transition-transform duration-300 ${
          showStopsList ? "translate-y-0" : "translate-y-[calc(100%-3rem)]"
        }`}
      >
        <div className="bg-gradient-to-t from-background via-background/95 to-transparent p-4">
          <div
            className="flex items-center justify-between mb-3 cursor-pointer"
            onClick={() => setShowStopsList(!showStopsList)}
          >
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-semibold text-foreground">Nearby Stops</h2>
              {userLocation && (
                <div className="flex items-center gap-1 text-green-600">
                  <User className="w-4 h-4" />
                  <span className="text-sm">Located</span>
                </div>
              )}
              <Button
                size="sm"
                variant="ghost"
                onClick={(e) => {
                  e.stopPropagation()
                  transitData.refreshData()
                }}
                disabled={transitData.isLoading}
              >
                <RefreshCw className={`w-4 h-4 ${transitData.isLoading ? "animate-spin" : ""}`} />
              </Button>
            </div>
            {showStopsList ? (
              <ChevronDown className="w-5 h-5 text-muted-foreground" />
            ) : (
              <ChevronUp className="w-5 h-5 text-muted-foreground" />
            )}
          </div>

          {showStopsList && (
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {transitData.stops.map((stop) => (
                <div key={stop.id} className="space-y-2">
                  <div className="flex items-center gap-2 mb-2">
                    <MapPin className="w-4 h-4 text-primary" />
                    <h3 className="font-medium text-foreground">{stop.name}</h3>
                    <span className="text-sm text-muted-foreground">• {calculateDistance(stop)}</span>
                    <Button variant="ghost" size="sm" onClick={() => handleStopSelect(stop)}>
                      View Details
                    </Button>
                  </div>
                  {stop.nextArrivals.slice(0, 2).map((arrival, index) => (
                    <EnhancedETACard
                      key={index}
                      route={arrival.route}
                      destination={stop.name}
                      eta={arrival.eta}
                      isRealtime={arrival.realtime}
                      occupancy={
                        arrival.vehicleId
                          ? transitData.buses.find((b) => b.id === arrival.vehicleId)?.occupancy
                          : undefined
                      }
                      delay={
                        arrival.vehicleId ? transitData.buses.find((b) => b.id === arrival.vehicleId)?.delay : undefined
                      }
                      confidence={arrival.realtime ? 95 : 75}
                      onSelect={() => {
                        const bus = transitData.buses.find((b) => b.id === arrival.vehicleId)
                        if (bus) handleBusSelect(bus)
                      }}
                      onNavigate={() => {
                        // Handle navigation to stop
                        console.log("Navigate to stop:", stop.name)
                      }}
                    />
                  ))}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <BusDetailModal
        bus={selectedBus}
        onClose={() => {
          setShowBusModal(false)
          setSelectedBus(null)
        }}
        onNavigate={(bus) => {
          console.log("Navigate to bus:", bus.id)
        }}
      />

      <StopDetailModal
        stop={selectedStop}
        onClose={() => {
          setShowStopModal(false)
          setSelectedStop(null)
        }}
        onNavigate={(stop) => {
          console.log("Navigate to stop:", stop.name)
        }}
      />
    </div>
  )
}
