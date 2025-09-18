"use client"

import { useState } from "react"
import { MapView } from "@/components/map-view"
import { SearchPage } from "@/components/search-page"
import { Header } from "@/components/header"
import { BottomNavigation } from "@/components/bottom-navigation"
import { LocationHandler } from "@/components/location-handler"
import { ConnectionStatus } from "@/components/connection-status"
import { SearchModal } from "@/components/search-modal"
import { useTransitData } from "@/hooks/use-transit-data"

export default function HomePage() {
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [locationPermissionGranted, setLocationPermissionGranted] = useState(false)
  const [selectedCity] = useState("sf")
  const [activeTab, setActiveTab] = useState("home")
  const [showSearchModal, setShowSearchModal] = useState(false)

  const transitData = useTransitData(selectedCity)

  const handleStopSelect = (stop: any) => {
    console.log("Selected stop:", stop)
    // Handle stop selection
  }

  const handleRouteSelect = (route: any) => {
    console.log("Selected route:", route)
    // Handle route selection
  }

  const handleNavigate = (result: any) => {
    console.log("Navigate to:", result)
    // Handle navigation
  }

  return (
    <div className="flex flex-col h-screen bg-background">
      <Header />

      {(transitData.connectionStatus !== "connected" || transitData.hasError) && (
        <div className="px-4 py-2">
          <ConnectionStatus
            status={transitData.connectionStatus}
            lastUpdate={transitData.lastUpdate}
            updateCount={transitData.updateCount}
            onRefresh={transitData.refreshData}
          />
        </div>
      )}

      <main className="flex-1 relative overflow-hidden">
        {!locationPermissionGranted && activeTab === "home" && (
          <LocationHandler
            onLocationUpdate={setUserLocation}
            onLocationPermissionChange={setLocationPermissionGranted}
          />
        )}

        {activeTab === "home" && <MapView userLocation={userLocation} transitData={transitData} />}

        {activeTab === "search" && (
          <SearchPage
            stops={transitData.stops}
            routes={transitData.routes}
            buses={transitData.buses}
            userLocation={userLocation}
            onSelectStop={handleStopSelect}
            onSelectRoute={handleRouteSelect}
          />
        )}

        {activeTab === "stops" && (
          <div className="flex items-center justify-center h-full">
            <p className="text-muted-foreground">Stops page coming soon</p>
          </div>
        )}

        {activeTab === "alerts" && (
          <div className="flex items-center justify-center h-full">
            <p className="text-muted-foreground">Alerts page coming soon</p>
          </div>
        )}
      </main>

      <BottomNavigation
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onSearchPress={() => setShowSearchModal(true)}
      />

      <SearchModal
        isOpen={showSearchModal}
        onClose={() => setShowSearchModal(false)}
        stops={transitData.stops}
        routes={transitData.routes}
        buses={transitData.buses}
        userLocation={userLocation}
        onSelectStop={handleStopSelect}
        onSelectRoute={handleRouteSelect}
        onNavigate={handleNavigate}
      />
    </div>
  )
}
