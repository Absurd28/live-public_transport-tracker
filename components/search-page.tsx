"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Search, MapPin, Navigation, History, Star, TrendingUp, Route, Filter, SortAsc } from "lucide-react"
import { EnhancedETACard } from "./enhanced-eta-card"
import type { Bus, BusStop, Route } from "@/hooks/use-transit-data"

interface SearchPageProps {
  stops: BusStop[]
  routes: Route[]
  buses: Bus[]
  userLocation: { lat: number; lng: number } | null
  onSelectStop: (stop: BusStop) => void
  onSelectRoute: (route: Route) => void
}

export function SearchPage({ stops, routes, buses, userLocation, onSelectStop, onSelectRoute }: SearchPageProps) {
  const [query, setQuery] = useState("")
  const [activeFilter, setActiveFilter] = useState<"all" | "stops" | "routes" | "places">("all")
  const [sortBy, setSortBy] = useState<"relevance" | "distance" | "time">("relevance")

  const recentSearches = ["Union Square", "Route 14", "Market & 3rd St", "Ferry Building"]
  const popularSearches = ["Downtown", "Route 30", "Mission District", "Golden Gate Park", "Chinatown"]

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Search Header */}
      <div className="p-4 border-b border-border bg-card">
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            placeholder="Search stops, routes, or places..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-10 pr-4 h-12 text-base"
          />
        </div>

        {/* Filters and Sort */}
        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            {[
              { id: "all", label: "All" },
              { id: "stops", label: "Stops" },
              { id: "routes", label: "Routes" },
              { id: "places", label: "Places" },
            ].map((filter) => (
              <Button
                key={filter.id}
                variant={activeFilter === filter.id ? "default" : "ghost"}
                size="sm"
                onClick={() => setActiveFilter(filter.id as any)}
              >
                {filter.label}
              </Button>
            ))}
          </div>

          <div className="flex gap-2">
            <Button variant="ghost" size="sm">
              <Filter className="w-4 h-4 mr-1" />
              Filter
            </Button>
            <Button variant="ghost" size="sm">
              <SortAsc className="w-4 h-4 mr-1" />
              Sort
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {!query.trim() ? (
          <div className="p-4 space-y-6">
            {/* Recent searches */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <History className="w-4 h-4 text-muted-foreground" />
                <h3 className="font-medium">Recent Searches</h3>
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
                <h3 className="font-medium">Popular Searches</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {popularSearches.map((search) => (
                  <Button key={search} variant="outline" size="sm" onClick={() => setQuery(search)}>
                    {search}
                  </Button>
                ))}
              </div>
            </div>

            {/* Quick categories */}
            <div>
              <h3 className="font-medium mb-3">Browse by Category</h3>
              <div className="grid grid-cols-2 gap-3">
                <Card className="p-4 cursor-pointer hover:bg-accent/5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                      <MapPin className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">All Stops</p>
                      <p className="text-sm text-muted-foreground">{stops.length} stops</p>
                    </div>
                  </div>
                </Card>

                <Card className="p-4 cursor-pointer hover:bg-accent/5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-secondary/10 rounded-lg flex items-center justify-center">
                      <Route className="w-5 h-5 text-secondary" />
                    </div>
                    <div>
                      <p className="font-medium">All Routes</p>
                      <p className="text-sm text-muted-foreground">{routes.length} routes</p>
                    </div>
                  </div>
                </Card>

                <Card className="p-4 cursor-pointer hover:bg-accent/5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center">
                      <Star className="w-5 h-5 text-accent" />
                    </div>
                    <div>
                      <p className="font-medium">Favorites</p>
                      <p className="text-sm text-muted-foreground">Your saved items</p>
                    </div>
                  </div>
                </Card>

                <Card className="p-4 cursor-pointer hover:bg-accent/5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <Navigation className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium">Nearby</p>
                      <p className="text-sm text-muted-foreground">Around you</p>
                    </div>
                  </div>
                </Card>
              </div>
            </div>

            {/* Live updates */}
            <div>
              <h3 className="font-medium mb-3">Live Updates</h3>
              <div className="space-y-2">
                {stops.slice(0, 3).map((stop) => (
                  <div key={stop.id}>
                    {stop.nextArrivals.slice(0, 1).map((arrival, index) => (
                      <EnhancedETACard
                        key={index}
                        route={arrival.route}
                        destination={stop.name}
                        eta={arrival.eta}
                        isRealtime={arrival.realtime}
                        occupancy={
                          arrival.vehicleId ? buses.find((b) => b.id === arrival.vehicleId)?.occupancy : undefined
                        }
                        confidence={arrival.realtime ? 95 : 75}
                        onSelect={() => onSelectStop(stop)}
                      />
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="p-4">
            <p className="text-sm text-muted-foreground mb-4">Showing results for "{query}"</p>
            {/* Search results would be rendered here */}
            <div className="text-center py-8">
              <Search className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Search results would appear here</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
