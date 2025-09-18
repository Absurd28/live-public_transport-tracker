"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Navigation, MapPin, AlertCircle, CheckCircle } from "lucide-react"

interface LocationState {
  status: "idle" | "requesting" | "granted" | "denied" | "error"
  coordinates: { lat: number; lng: number } | null
  error?: string
}

interface LocationHandlerProps {
  onLocationUpdate: (location: { lat: number; lng: number } | null) => void
  onLocationPermissionChange: (granted: boolean) => void
}

export function LocationHandler({ onLocationUpdate, onLocationPermissionChange }: LocationHandlerProps) {
  const [locationState, setLocationState] = useState<LocationState>({
    status: "idle",
    coordinates: null,
  })

  const requestLocation = async () => {
    if (!navigator.geolocation) {
      setLocationState({
        status: "error",
        coordinates: null,
        error: "Geolocation is not supported by this browser",
      })
      return
    }

    setLocationState((prev) => ({ ...prev, status: "requesting" }))

    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000, // 5 minutes
        })
      })

      const coordinates = {
        lat: position.coords.latitude,
        lng: position.coords.longitude,
      }

      setLocationState({
        status: "granted",
        coordinates,
      })

      onLocationUpdate(coordinates)
      onLocationPermissionChange(true)
    } catch (error) {
      const errorMessage =
        error instanceof GeolocationPositionError ? getGeolocationErrorMessage(error.code) : "Failed to get location"

      setLocationState({
        status: "denied",
        coordinates: null,
        error: errorMessage,
      })

      onLocationPermissionChange(false)
    }
  }

  const getGeolocationErrorMessage = (code: number): string => {
    switch (code) {
      case 1:
        return "Location access denied by user"
      case 2:
        return "Location information unavailable"
      case 3:
        return "Location request timed out"
      default:
        return "Unknown location error"
    }
  }

  useEffect(() => {
    // Check if location permission was previously granted
    if (navigator.permissions) {
      navigator.permissions.query({ name: "geolocation" }).then((result) => {
        if (result.state === "granted") {
          requestLocation()
        }
      })
    }
  }, [])

  if (locationState.status === "granted") {
    return (
      <div className="flex items-center gap-2 text-green-600">
        <CheckCircle className="w-4 h-4" />
        <span className="text-sm">Location enabled</span>
      </div>
    )
  }

  if (locationState.status === "requesting") {
    return (
      <div className="flex items-center gap-2 text-primary">
        <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        <span className="text-sm">Getting location...</span>
      </div>
    )
  }

  return (
    <Card className="p-4 m-4 border-amber-200 bg-amber-50">
      <div className="flex items-start gap-3">
        <Navigation className="w-5 h-5 text-amber-600 mt-0.5" />
        <div className="flex-1">
          <h3 className="font-medium text-amber-900 mb-1">Enable Location</h3>
          <p className="text-sm text-amber-800 mb-3">
            Get personalized transit info for nearby stops and accurate walking directions.
          </p>
          {locationState.error && (
            <div className="flex items-center gap-2 text-red-600 mb-3">
              <AlertCircle className="w-4 h-4" />
              <span className="text-sm">{locationState.error}</span>
            </div>
          )}
          <div className="flex gap-2">
            <Button size="sm" onClick={requestLocation} className="bg-amber-600 hover:bg-amber-700">
              <MapPin className="w-4 h-4 mr-1" />
              Enable Location
            </Button>
            <Button variant="outline" size="sm" onClick={() => onLocationPermissionChange(false)}>
              Skip
            </Button>
          </div>
        </div>
      </div>
    </Card>
  )
}
