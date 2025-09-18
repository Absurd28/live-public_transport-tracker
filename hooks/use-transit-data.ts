"use client"

import { useState, useEffect, useCallback } from "react"

export interface BusStop {
  id: string
  name: string
  position: { lat: number; lng: number }
  routes: string[]
  nextArrivals: { route: string; eta: string; realtime: boolean; vehicleId?: string }[]
  lastUpdated: Date
}

export interface Bus {
  id: string
  route: string
  position: { lat: number; lng: number }
  heading: number
  occupancy: "low" | "medium" | "high"
  speed: number
  nextStop: string
  isRealtime: boolean
  lastUpdated: Date
  delay?: number
}

export interface Route {
  id: string
  name: string
  color: string
  path: { lat: number; lng: number }[]
  isActive: boolean
}

interface TransitDataState {
  buses: Bus[]
  stops: BusStop[]
  routes: Route[]
  lastUpdate: Date | null
  connectionStatus: "connected" | "connecting" | "disconnected" | "error"
  updateCount: number
}

// Mock initial data
const initialRoutes: Route[] = [
  {
    id: "14",
    name: "14 Mission",
    color: "#3b82f6",
    path: [
      { lat: 37.7749, lng: -122.4194 },
      { lat: 37.7849, lng: -122.4094 },
      { lat: 37.7949, lng: -122.3994 },
    ],
    isActive: true,
  },
  {
    id: "30",
    name: "30 Stockton",
    color: "#10b981",
    path: [
      { lat: 37.7649, lng: -122.4294 },
      { lat: 37.7749, lng: -122.4194 },
      { lat: 37.7849, lng: -122.4094 },
    ],
    isActive: true,
  },
]

const initialStops: BusStop[] = [
  {
    id: "stop1",
    name: "Market & 3rd St",
    position: { lat: 37.7749, lng: -122.4194 },
    routes: ["14", "30", "45"],
    nextArrivals: [
      { route: "14", eta: "2 min", realtime: true, vehicleId: "bus1" },
      { route: "30", eta: "5 min", realtime: true, vehicleId: "bus2" },
      { route: "45", eta: "12 min", realtime: false },
    ],
    lastUpdated: new Date(),
  },
  {
    id: "stop2",
    name: "Mission & 1st St",
    position: { lat: 37.7849, lng: -122.4094 },
    routes: ["8", "12"],
    nextArrivals: [
      { route: "8", eta: "3 min", realtime: true },
      { route: "12", eta: "8 min", realtime: false },
    ],
    lastUpdated: new Date(),
  },
  {
    id: "stop3",
    name: "Folsom & 2nd St",
    position: { lat: 37.7649, lng: -122.4294 },
    routes: ["27", "30"],
    nextArrivals: [
      { route: "27", eta: "6 min", realtime: true },
      { route: "30", eta: "15 min", realtime: false },
    ],
    lastUpdated: new Date(),
  },
]

const initialBuses: Bus[] = [
  {
    id: "bus1",
    route: "14",
    position: { lat: 37.7749, lng: -122.4194 },
    heading: 45,
    occupancy: "medium",
    speed: 15,
    nextStop: "Market & 3rd St",
    isRealtime: true,
    lastUpdated: new Date(),
  },
  {
    id: "bus2",
    route: "30",
    position: { lat: 37.7849, lng: -122.4094 },
    heading: 180,
    occupancy: "low",
    speed: 22,
    nextStop: "Mission & 1st St",
    isRealtime: true,
    lastUpdated: new Date(),
  },
]

export function useTransitData(cityId: string) {
  const [data, setData] = useState<TransitDataState>({
    buses: initialBuses,
    stops: initialStops,
    routes: initialRoutes,
    lastUpdate: null,
    connectionStatus: "connecting",
    updateCount: 0,
  })

  // Simulate real-time updates
  const simulateUpdate = useCallback(() => {
    setData((prev) => {
      const now = new Date()

      // Update bus positions and data
      const updatedBuses = prev.buses.map((bus) => {
        // Simulate movement along route
        const movement = 0.0005 * (Math.random() - 0.5)
        const newPosition = {
          lat: bus.position.lat + movement,
          lng: bus.position.lng + movement,
        }

        // Simulate occupancy changes
        const occupancyLevels: ("low" | "medium" | "high")[] = ["low", "medium", "high"]
        const newOccupancy =
          Math.random() < 0.1 ? occupancyLevels[Math.floor(Math.random() * occupancyLevels.length)] : bus.occupancy

        // Simulate speed changes
        const speedVariation = (Math.random() - 0.5) * 5
        const newSpeed = Math.max(0, Math.min(35, bus.speed + speedVariation))

        return {
          ...bus,
          position: newPosition,
          occupancy: newOccupancy,
          speed: Math.round(newSpeed),
          heading: bus.heading + (Math.random() - 0.5) * 10,
          lastUpdated: now,
          delay: Math.random() < 0.3 ? Math.floor(Math.random() * 5) : undefined,
        }
      })

      // Update stop ETAs
      const updatedStops = prev.stops.map((stop) => ({
        ...stop,
        nextArrivals: stop.nextArrivals.map((arrival) => {
          if (arrival.realtime) {
            // Simulate ETA changes for real-time arrivals
            const currentEta = Number.parseInt(arrival.eta)
            const newEta = Math.max(0, currentEta + (Math.random() < 0.5 ? -1 : 0))
            return {
              ...arrival,
              eta: newEta === 0 ? "Arriving" : `${newEta} min`,
            }
          }
          return arrival
        }),
        lastUpdated: now,
      }))

      return {
        ...prev,
        buses: updatedBuses,
        stops: updatedStops,
        lastUpdate: now,
        connectionStatus: "connected" as const,
        updateCount: prev.updateCount + 1,
      }
    })
  }, [])

  // Simulate connection status changes
  useEffect(() => {
    const connectionInterval = setInterval(() => {
      setData((prev) => {
        // Occasionally simulate connection issues
        if (Math.random() < 0.05) {
          return { ...prev, connectionStatus: "error" }
        }
        if (prev.connectionStatus === "error" && Math.random() < 0.7) {
          return { ...prev, connectionStatus: "connecting" }
        }
        if (prev.connectionStatus === "connecting") {
          return { ...prev, connectionStatus: "connected" }
        }
        return prev
      })
    }, 2000)

    return () => clearInterval(connectionInterval)
  }, [])

  // Set up real-time updates
  useEffect(() => {
    // Initial connection
    setTimeout(() => {
      setData((prev) => ({ ...prev, connectionStatus: "connected", lastUpdate: new Date() }))
    }, 1000)

    // Regular updates every 5 seconds
    const updateInterval = setInterval(simulateUpdate, 5000)

    return () => clearInterval(updateInterval)
  }, [simulateUpdate])

  const refreshData = useCallback(() => {
    setData((prev) => ({ ...prev, connectionStatus: "connecting" }))
    setTimeout(() => {
      simulateUpdate()
    }, 500)
  }, [simulateUpdate])

  return {
    ...data,
    refreshData,
    isLoading: data.connectionStatus === "connecting",
    hasError: data.connectionStatus === "error",
  }
}
