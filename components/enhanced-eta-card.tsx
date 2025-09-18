"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Clock, MapPin, Navigation, Users, AlertTriangle, TrendingUp, TrendingDown } from "lucide-react"
import { RealTimeIndicator } from "./real-time-indicator"

interface ETACardProps {
  route: string
  destination: string
  eta: string
  isRealtime: boolean
  occupancy?: "low" | "medium" | "high"
  delay?: number
  trend?: "improving" | "worsening"
  confidence?: number
  onSelect?: () => void
  onNavigate?: () => void
}

export function EnhancedETACard({
  route,
  destination,
  eta,
  isRealtime,
  occupancy,
  delay,
  trend,
  confidence = 95,
  onSelect,
  onNavigate,
}: ETACardProps) {
  const getOccupancyColor = () => {
    switch (occupancy) {
      case "low":
        return "text-green-600"
      case "medium":
        return "text-yellow-600"
      case "high":
        return "text-red-600"
      default:
        return "text-gray-500"
    }
  }

  const getOccupancyPercentage = () => {
    switch (occupancy) {
      case "low":
        return 30
      case "medium":
        return 65
      case "high":
        return 90
      default:
        return 0
    }
  }

  return (
    <Card className="p-4 cursor-pointer hover:bg-accent/5 transition-colors" onClick={onSelect}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="font-mono text-base px-3 py-1">
            {route}
          </Badge>
          <div>
            <h3 className="font-medium text-foreground">{destination}</h3>
            <div className="flex items-center gap-2 mt-1">
              <RealTimeIndicator isRealtime={isRealtime} delay={delay} />
              {trend && (
                <div
                  className={`flex items-center gap-1 text-xs ${
                    trend === "improving" ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {trend === "improving" ? <TrendingDown className="w-3 h-3" /> : <TrendingUp className="w-3 h-3" />}
                  <span>{trend}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="text-right">
          <div className="flex items-center gap-1 text-primary">
            <Clock className="w-5 h-5" />
            <span className="text-xl font-bold">{eta}</span>
          </div>
          {isRealtime && confidence && <p className="text-xs text-muted-foreground">{confidence}% confident</p>}
        </div>
      </div>

      {/* Occupancy indicator */}
      {occupancy && (
        <div className="mb-3">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-1 text-sm">
              <Users className="w-4 h-4" />
              <span>Occupancy</span>
            </div>
            <span className={`text-sm font-medium capitalize ${getOccupancyColor()}`}>{occupancy}</span>
          </div>
          <Progress value={getOccupancyPercentage()} className="h-1.5" />
        </div>
      )}

      {/* Delay warning */}
      {delay && delay > 0 && (
        <div className="flex items-center gap-2 mb-3 p-2 bg-amber-50 rounded-lg">
          <AlertTriangle className="w-4 h-4 text-amber-600" />
          <span className="text-sm text-amber-800">
            Running {delay} minute{delay > 1 ? "s" : ""} behind schedule
          </span>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2 pt-2 border-t border-border">
        <Button
          variant="ghost"
          size="sm"
          className="flex-1"
          onClick={(e) => {
            e.stopPropagation()
            onNavigate?.()
          }}
        >
          <Navigation className="w-4 h-4 mr-1" />
          Directions
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.stopPropagation()
            onSelect?.()
          }}
        >
          <MapPin className="w-4 h-4 mr-1" />
          Details
        </Button>
      </div>
    </Card>
  )
}
