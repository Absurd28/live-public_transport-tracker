"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { MapPin, Settings, ChevronDown } from "lucide-react"
import { CitySelector } from "./city-selector"

interface City {
  id: string
  name: string
  state: string
  country: string
  hasRealtime: boolean
  timezone: string
}

const defaultCity: City = {
  id: "sf",
  name: "San Francisco",
  state: "CA",
  country: "US",
  hasRealtime: true,
  timezone: "America/Los_Angeles",
}

export function Header() {
  const [selectedCity, setSelectedCity] = useState<City>(defaultCity)
  const [showCitySelector, setShowCitySelector] = useState(false)

  return (
    <>
      <header className="bg-card border-b border-border px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <MapPin className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="font-semibold text-lg text-foreground">Transit Tracker</h1>
            <Button
              variant="ghost"
              size="sm"
              className="h-auto p-0 text-sm text-muted-foreground hover:text-foreground"
              onClick={() => setShowCitySelector(true)}
            >
              <span>
                {selectedCity.name}, {selectedCity.state}
              </span>
              <ChevronDown className="w-3 h-3 ml-1" />
            </Button>
          </div>
        </div>
        <Button variant="ghost" size="icon">
          <Settings className="w-5 h-5" />
        </Button>
      </header>

      {showCitySelector && (
        <CitySelector
          selectedCity={selectedCity}
          onCitySelect={setSelectedCity}
          onClose={() => setShowCitySelector(false)}
        />
      )}
    </>
  )
}
