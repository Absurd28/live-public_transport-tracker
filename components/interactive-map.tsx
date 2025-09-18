"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { MapPin, Navigation, Users, Zap } from "lucide-react"
import { RealTimeIndicator } from "./real-time-indicator"
import type { Bus, BusStop, Route } from "@/hooks/use-transit-data"

interface InteractiveMapProps {
  userLocation: { lat: number; lng: number } | null
  buses: Bus[]
  stops: BusStop[]
  routes: Route[]
  onStopSelect: (stop: BusStop) => void
  onBusSelect: (bus: Bus) => void
}

export function InteractiveMap({ userLocation, buses, stops, routes, onStopSelect, onBusSelect }: InteractiveMapProps) {
  const [selectedStop, setSelectedStop] = useState<string | null>(null)
  const [selectedBus, setSelectedBus] = useState<string | null>(null)

  const getOccupancyColor = (occupancy: string) => {
    switch (occupancy) {
      case "low":
        return "bg-green-500"
      case "medium":
        return "bg-yellow-500"
      case "high":
        return "bg-red-500"
      default:
        return "bg-gray-500"
    }
  }

  const convertToMapPosition = (lat: number, lng: number) => {
    const mapBounds = {
      north: 37.8049,
      south: 37.7549,
      east: -122.3894,
      west: -122.4394,
    }

    const x = ((lng - mapBounds.west) / (mapBounds.east - mapBounds.west)) * 100
    const y = ((mapBounds.north - lat) / (mapBounds.north - mapBounds.south)) * 100

    return { x: Math.max(5, Math.min(95, x)), y: Math.max(5, Math.min(95, y)) }
  }

  return (
    <div className="relative w-full h-full bg-gradient-to-br from-blue-50 to-cyan-50 overflow-hidden">
      {/* Route paths */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none">
        {routes
          .filter((route) => route.isActive)
          .map((route) => {
            const pathPoints = route.path.map((point) => convertToMapPosition(point.lat, point.lng))
            const pathString = pathPoints
              .map((point, index) => `${index === 0 ? "M" : "L"} ${point.x}% ${point.y}%`)
              .join(" ")

            return (
              <path
                key={route.id}
                d={pathString}
                stroke={route.color}
                strokeWidth="3"
                fill="none"
                strokeDasharray="5,5"
                opacity="0.6"
              />
            )
          })}
      </svg>

      {/* Bus stops */}
      {stops.map((stop) => {
        const position = convertToMapPosition(stop.position.lat, stop.position.lng)
        return (
          <div
            key={stop.id}
            className={`absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-all duration-200 ${
              selectedStop === stop.id ? "scale-125 z-20" : "hover:scale-110 z-10"
            }`}
            style={{ left: `${position.x}%`, top: `${position.y}%` }}
            onClick={() => {
              setSelectedStop(selectedStop === stop.id ? null : stop.id)
              onStopSelect(stop)
            }}
          >
            <div
              className={`w-6 h-6 rounded-full border-2 border-white shadow-lg flex items-center justify-center ${
                selectedStop === stop.id ? "bg-primary" : "bg-white"
              }`}
            >
              <MapPin className={`w-4 h-4 ${selectedStop === stop.id ? "text-primary-foreground" : "text-primary"}`} />
            </div>
            {selectedStop === stop.id && (
              <Card className="absolute top-8 left-1/2 transform -translate-x-1/2 p-3 min-w-48 shadow-lg">
                <h3 className="font-medium text-sm mb-2">{stop.name}</h3>
                <div className="space-y-1">
                  {stop.nextArrivals.slice(0, 2).map((arrival, index) => (
                    <div key={index} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1">
                        <span className="px-1.5 py-0.5 bg-primary text-primary-foreground rounded text-xs">
                          {arrival.route}
                        </span>
                        <RealTimeIndicator isRealtime={arrival.realtime} />
                      </div>
                      <span className="font-medium">{arrival.eta}</span>
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </div>
        )
      })}

      {/* Buses with real-time data */}
      {buses.map((bus) => {
        const position = convertToMapPosition(bus.position.lat, bus.position.lng)
        const route = routes.find((r) => r.id === bus.route)

        return (
          <div
            key={bus.id}
            className={`absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-all duration-300 ${
              selectedBus === bus.id ? "scale-125 z-20" : "hover:scale-110 z-10"
            }`}
            style={{
              left: `${position.x}%`,
              top: `${position.y}%`,
              transform: `translate(-50%, -50%) rotate(${bus.heading}deg)`,
            }}
            onClick={() => {
              setSelectedBus(selectedBus === bus.id ? null : bus.id)
              onBusSelect(bus)
            }}
          >
            <div
              className={`w-8 h-8 rounded-lg border-2 border-white shadow-lg flex items-center justify-center transition-colors ${
                selectedBus === bus.id ? "bg-secondary" : route?.color ? `bg-[${route.color}]` : "bg-secondary"
              }`}
            >
              <span className="text-xs text-white font-bold">{bus.route}</span>
            </div>

            {/* Occupancy indicator */}
            <div
              className={`absolute -top-1 -right-1 w-3 h-3 rounded-full border border-white ${getOccupancyColor(bus.occupancy)}`}
            />

            {selectedBus === bus.id && (
              <Card className="absolute top-10 left-1/2 transform -translate-x-1/2 p-3 min-w-48 shadow-lg">
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-2 py-1 bg-primary text-primary-foreground text-xs rounded">
                    Route {bus.route}
                  </span>
                  <RealTimeIndicator isRealtime={bus.isRealtime} lastUpdated={bus.lastUpdated} delay={bus.delay} />
                </div>
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span>Next Stop:</span>
                    <span className="font-medium">{bus.nextStop}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Speed:</span>
                    <span className="font-medium">{bus.speed} mph</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Occupancy:</span>
                    <div className="flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      <span
                        className={`font-medium capitalize ${
                          bus.occupancy === "low"
                            ? "text-green-600"
                            : bus.occupancy === "medium"
                              ? "text-yellow-600"
                              : "text-red-600"
                        }`}
                      >
                        {bus.occupancy}
                      </span>
                    </div>
                  </div>
                  {bus.delay && (
                    <div className="flex justify-between text-amber-600">
                      <span>Delay:</span>
                      <span className="font-medium">+{bus.delay} min</span>
                    </div>
                  )}
                </div>
              </Card>
            )}
          </div>
        )
      })}

      {/* User location */}
      {userLocation && (
        <div
          className="absolute transform -translate-x-1/2 -translate-y-1/2 z-30"
          style={{
            left: `${convertToMapPosition(userLocation.lat, userLocation.lng).x}%`,
            top: `${convertToMapPosition(userLocation.lat, userLocation.lng).y}%`,
          }}
        >
          <div className="w-4 h-4 bg-blue-500 rounded-full border-2 border-white shadow-lg">
            <div className="w-8 h-8 bg-blue-500/20 rounded-full absolute -top-2 -left-2 animate-ping" />
          </div>
        </div>
      )}

      {/* Map controls */}
      <div className="absolute top-4 right-4 flex flex-col gap-2">
        <Button size="sm" variant="secondary" className="shadow-lg">
          <Navigation className="w-4 h-4" />
        </Button>
        <Button size="sm" variant="secondary" className="shadow-lg">
          <MapPin className="w-4 h-4" />
        </Button>
      </div>

      {/* Legend */}
      <Card className="absolute bottom-4 left-4 p-3">
        <h4 className="text-xs font-medium mb-2">Legend</h4>
        <div className="space-y-1 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded-full" />
            <span>Low occupancy</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-yellow-500 rounded-full" />
            <span>Medium occupancy</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-500 rounded-full" />
            <span>High occupancy</span>
          </div>
          <div className="flex items-center gap-2">
            <Zap className="w-3 h-3 text-green-500" />
            <span>Real-time data</span>
          </div>
        </div>
      </Card>
    </div>
  )
}
