"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { MapPin, Search, CheckCircle, AlertCircle } from "lucide-react"

interface City {
  id: string
  name: string
  state: string
  country: string
  hasRealtime: boolean
  timezone: string
}

const supportedCities: City[] = [
  { id: "sf", name: "San Francisco", state: "CA", country: "US", hasRealtime: true, timezone: "America/Los_Angeles" },
  { id: "nyc", name: "New York City", state: "NY", country: "US", hasRealtime: true, timezone: "America/New_York" },
  { id: "seattle", name: "Seattle", state: "WA", country: "US", hasRealtime: true, timezone: "America/Los_Angeles" },
  { id: "portland", name: "Portland", state: "OR", country: "US", hasRealtime: false, timezone: "America/Los_Angeles" },
  { id: "boston", name: "Boston", state: "MA", country: "US", hasRealtime: true, timezone: "America/New_York" },
  { id: "chicago", name: "Chicago", state: "IL", country: "US", hasRealtime: true, timezone: "America/Chicago" },
]

interface CitySelectorProps {
  selectedCity: City | null
  onCitySelect: (city: City) => void
  onClose: () => void
}

export function CitySelector({ selectedCity, onCitySelect, onClose }: CitySelectorProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [filteredCities, setFilteredCities] = useState(supportedCities)

  useEffect(() => {
    const filtered = supportedCities.filter(
      (city) =>
        city.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        city.state.toLowerCase().includes(searchQuery.toLowerCase()),
    )
    setFilteredCities(filtered)
  }, [searchQuery])

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md max-h-[80vh] overflow-hidden">
        <div className="p-4 border-b border-border">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-foreground">Select City</h2>
            <Button variant="ghost" size="sm" onClick={onClose}>
              ✕
            </Button>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search cities..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div className="overflow-y-auto max-h-96">
          {filteredCities.map((city) => (
            <div
              key={city.id}
              className={`p-4 border-b border-border last:border-b-0 cursor-pointer hover:bg-accent/5 transition-colors ${
                selectedCity?.id === city.id ? "bg-accent/10" : ""
              }`}
              onClick={() => {
                onCitySelect(city)
                onClose()
              }}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-primary" />
                    <span className="font-medium text-foreground">{city.name}</span>
                    <span className="text-sm text-muted-foreground">{city.state}</span>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    {city.hasRealtime ? (
                      <div className="flex items-center gap-1 text-green-600">
                        <CheckCircle className="w-3 h-3" />
                        <span className="text-xs">Live data</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 text-amber-600">
                        <AlertCircle className="w-3 h-3" />
                        <span className="text-xs">Schedule only</span>
                      </div>
                    )}
                  </div>
                </div>
                {selectedCity?.id === city.id && <CheckCircle className="w-5 h-5 text-primary" />}
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
