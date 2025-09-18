"use client"

import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { X, Search, MapPin, Navigation, Clock, History, Star, TrendingUp, Building } from "lucide-react"
import { RealTimeIndicator } from "./real-time-indicator"
import type { BusStop } from "@/hooks/use-transit-data"

interface SearchResult {
  id: string
  type: "stop" | "route" | "landmark" | "address"
  title: string
  subtitle: string
  distance?: string
  nextArrival?: string
  isRealtime?: boolean
  routes?: string[]
  data?: any
}

interface SearchModalProps {
  isOpen: boolean
  onClose: () => void
  stops: BusStop[]
  routes: any[]
  buses: any[]
  userLocation: { lat: number; lng: number } | null
  onSelectStop: (stop: BusStop) => void
  onSelectRoute: (route: any) => void
  onNavigate: (result: SearchResult) => void
}

// Mock landmarks and addresses
const mockLandmarks = [
  { id: "union-square", name: "Union Square", address: "333 Post St, San Francisco, CA", type: "landmark" },
  { id: "ferry-building", name: "Ferry Building", address: "1 Ferry Building, San Francisco, CA", type: "landmark" },
  {
    id: "golden-gate-park",
    name: "Golden Gate Park",
    address: "Golden Gate Park, San Francisco, CA",
    type: "landmark",
  },
  { id: "chinatown", name: "Chinatown", address: "Grant Ave & Bush St, San Francisco, CA", type: "landmark" },
  { id: "fishermans-wharf", name: "Fisherman's Wharf", address: "Pier 39, San Francisco, CA", type: "landmark" },
]

const recentSearches = ["Union Square", "Route 14", "Market & 3rd St", "Ferry Building"]

const popularSearches = ["Downtown", "Route 30", "Mission District", "Golden Gate Park", "Chinatown"]

export function SearchModal({
  isOpen,
  onClose,
  stops,
  routes,
  buses,
  userLocation,
  onSelectStop,
  onSelectRoute,
  onNavigate,
}: SearchModalProps) {
  const [query, setQuery] = useState("")
  const [activeTab, setActiveTab] = useState<"all" | "stops" | "routes" | "places">("all")

  const calculateDistance = (lat: number, lng: number) => {
    if (!userLocation) return undefined
    const latDiff = Math.abs(lat - userLocation.lat)
    const lngDiff = Math.abs(lng - userLocation.lng)
    const distance = Math.sqrt(latDiff * latDiff + lngDiff * lngDiff) * 69
    return `${distance.toFixed(1)} mi`
  }

  const searchResults = useMemo(() => {
    if (!query.trim()) return []

    const results: SearchResult[] = []
    const searchTerm = query.toLowerCase()

    // Search stops
    if (activeTab === "all" || activeTab === "stops") {
      stops
        .filter((stop) => stop.name.toLowerCase().includes(searchTerm))
        .forEach((stop) => {
          const nextArrival = stop.nextArrivals[0]
          results.push({
            id: stop.id,
            type: "stop",
            title: stop.name,
            subtitle: `${stop.routes.length} routes • Stop #${stop.id.toUpperCase()}`,
            distance: calculateDistance(stop.position.lat, stop.position.lng),
            nextArrival: nextArrival?.eta,
            isRealtime: nextArrival?.realtime,
            routes: stop.routes,
            data: stop,
          })
        })
    }

    // Search routes
    if (activeTab === "all" || activeTab === "routes") {
      routes
        .filter((route) => route.name.toLowerCase().includes(searchTerm) || route.id.toLowerCase().includes(searchTerm))
        .forEach((route) => {
          const activeBuses = buses.filter((bus) => bus.route === route.id)
          results.push({
            id: route.id,
            type: "route",
            title: route.name,
            subtitle: `${activeBuses.length} active buses • ${route.path.length} stops`,
            data: route,
          })
        })
    }

    // Search landmarks
    if (activeTab === "all" || activeTab === "places") {
      mockLandmarks
        .filter((landmark) => landmark.name.toLowerCase().includes(searchTerm))
        .forEach((landmark) => {
          results.push({
            id: landmark.id,
            type: "landmark",
            title: landmark.name,
            subtitle: landmark.address,
            data: landmark,
          })
        })
    }

    // Sort by distance if user location is available
    if (userLocation) {
      results.sort((a, b) => {
        const aDistance = a.distance ? Number.parseFloat(a.distance) : Number.POSITIVE_INFINITY
        const bDistance = b.distance ? Number.parseFloat(b.distance) : Number.POSITIVE_INFINITY
        return aDistance - bDistance
      })
    }

    return results.slice(0, 20) // Limit results
  }, [query, activeTab, stops, routes, buses, userLocation])

  const handleResultSelect = (result: SearchResult) => {
    switch (result.type) {
      case "stop":
        onSelectStop(result.data)
        break
      case "route":
        onSelectRoute(result.data)
        break
      default:
        onNavigate(result)
        break
    }
    onClose()
  }

  const getResultIcon = (type: string) => {
    switch (type) {
      case "stop":
        return MapPin
      case "route":
        return Building
      case "landmark":
        return Building
      default:
        return Navigation
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-start justify-center p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-hidden mt-8">
        {/* Header */}
        <div className="p-4 border-b border-border">
          <div className="flex items-center gap-3 mb-4">
            <Search className="w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="Search stops, routes, or places..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="flex-1 border-none shadow-none text-lg"
              autoFocus
            />
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Filter tabs */}
          <div className="flex gap-2">
            {[
              { id: "all", label: "All" },
              { id: "stops", label: "Stops" },
              { id: "routes", label: "Routes" },
              { id: "places", label: "Places" },
            ].map((tab) => (
              <Button
                key={tab.id}
                variant={activeTab === tab.id ? "default" : "ghost"}
                size="sm"
                onClick={() => setActiveTab(tab.id as any)}
              >
                {tab.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-96">
          {!query.trim() ? (
            <div className="p-4 space-y-6">
              {/* Recent searches */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <History className="w-4 h-4 text-muted-foreground" />
                  <h3 className="font-medium text-sm">Recent Searches</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {recentSearches.map((search) => (
                    <Button key={search} variant="outline" size="sm" onClick={() => setQuery(search)}>
                      {search}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Popular searches */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <TrendingUp className="w-4 h-4 text-muted-foreground" />
                  <h3 className="font-medium text-sm">Popular Searches</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {popularSearches.map((search) => (
                    <Button key={search} variant="outline" size="sm" onClick={() => setQuery(search)}>
                      {search}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Quick access */}
              <div>
                <h3 className="font-medium text-sm mb-3">Quick Access</h3>
                <div className="space-y-2">
                  <Card className="p-3 cursor-pointer hover:bg-accent/5">
                    <div className="flex items-center gap-3">
                      <Star className="w-5 h-5 text-yellow-500" />
                      <div>
                        <p className="font-medium">Favorite Stops</p>
                        <p className="text-sm text-muted-foreground">View your saved stops</p>
                      </div>
                    </div>
                  </Card>
                  <Card className="p-3 cursor-pointer hover:bg-accent/5">
                    <div className="flex items-center gap-3">
                      <Navigation className="w-5 h-5 text-primary" />
                      <div>
                        <p className="font-medium">Nearby Stops</p>
                        <p className="text-sm text-muted-foreground">Find stops around you</p>
                      </div>
                    </div>
                  </Card>
                </div>
              </div>
            </div>
          ) : searchResults.length > 0 ? (
            <div className="p-4 space-y-2">
              {searchResults.map((result) => {
                const Icon = getResultIcon(result.type)
                return (
                  <Card
                    key={result.id}
                    className="p-3 cursor-pointer hover:bg-accent/5 transition-colors"
                    onClick={() => handleResultSelect(result)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 flex-1">
                        <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center">
                          <Icon className="w-5 h-5 text-muted-foreground" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-medium">{result.title}</h3>
                            <Badge variant="outline" className="text-xs">
                              {result.type}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{result.subtitle}</p>
                          {result.routes && (
                            <div className="flex gap-1 mt-1">
                              {result.routes.slice(0, 3).map((route) => (
                                <Badge key={route} variant="secondary" className="text-xs">
                                  {route}
                                </Badge>
                              ))}
                              {result.routes.length > 3 && (
                                <Badge variant="secondary" className="text-xs">
                                  +{result.routes.length - 3}
                                </Badge>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        {result.distance && <p className="text-sm text-muted-foreground">{result.distance}</p>}
                        {result.nextArrival && (
                          <div className="flex items-center gap-1 text-primary">
                            <Clock className="w-3 h-3" />
                            <span className="text-sm font-medium">{result.nextArrival}</span>
                            {result.isRealtime && <RealTimeIndicator isRealtime={true} size="sm" />}
                          </div>
                        )}
                      </div>
                    </div>
                  </Card>
                )
              })}
            </div>
          ) : (
            <div className="p-8 text-center">
              <Search className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-medium mb-2">No results found</h3>
              <p className="text-sm text-muted-foreground">Try searching for stops, routes, or landmarks</p>
            </div>
          )}
        </div>
      </Card>
    </div>
  )
}
