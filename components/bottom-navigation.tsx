"use client"

import { Button } from "@/components/ui/button"
import { Home, MapPin, Search, Bell } from "lucide-react"

const navItems = [
  { id: "home", label: "Home", icon: Home },
  { id: "stops", label: "Stops", icon: MapPin },
  { id: "search", label: "Search", icon: Search },
  { id: "alerts", label: "Alerts", icon: Bell },
]

interface BottomNavigationProps {
  activeTab?: string
  onTabChange?: (tab: string) => void
  onSearchPress?: () => void
}

export function BottomNavigation({ activeTab = "home", onTabChange, onSearchPress }: BottomNavigationProps) {
  const handleTabClick = (tabId: string) => {
    if (tabId === "search" && onSearchPress) {
      onSearchPress()
    } else {
      onTabChange?.(tabId)
    }
  }

  return (
    <nav className="bg-card border-t border-border px-4 py-2">
      <div className="flex items-center justify-around">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = activeTab === item.id

          return (
            <Button
              key={item.id}
              variant="ghost"
              size="sm"
              className={`flex flex-col items-center gap-1 h-auto py-2 px-3 ${
                isActive ? "text-primary" : "text-muted-foreground"
              }`}
              onClick={() => handleTabClick(item.id)}
            >
              <Icon className="w-5 h-5" />
              <span className="text-xs">{item.label}</span>
            </Button>
          )
        })}
      </div>
    </nav>
  )
}
