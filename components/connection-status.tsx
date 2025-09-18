"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { WifiOff, RefreshCw, AlertCircle, CheckCircle } from "lucide-react"

interface ConnectionStatusProps {
  status: "connected" | "connecting" | "disconnected" | "error"
  lastUpdate: Date | null
  updateCount: number
  onRefresh: () => void
}

export function ConnectionStatus({ status, lastUpdate, updateCount, onRefresh }: ConnectionStatusProps) {
  const [timeAgo, setTimeAgo] = useState<string>("")

  useEffect(() => {
    if (!lastUpdate) return

    const updateTimeAgo = () => {
      const now = new Date()
      const diff = Math.floor((now.getTime() - lastUpdate.getTime()) / 1000)

      if (diff < 60) {
        setTimeAgo(`${diff}s ago`)
      } else if (diff < 3600) {
        setTimeAgo(`${Math.floor(diff / 60)}m ago`)
      } else {
        setTimeAgo(`${Math.floor(diff / 3600)}h ago`)
      }
    }

    updateTimeAgo()
    const interval = setInterval(updateTimeAgo, 1000)
    return () => clearInterval(interval)
  }, [lastUpdate])

  const getStatusConfig = () => {
    switch (status) {
      case "connected":
        return {
          icon: CheckCircle,
          color: "text-green-600",
          bgColor: "bg-green-50",
          borderColor: "border-green-200",
          text: "Live data connected",
        }
      case "connecting":
        return {
          icon: RefreshCw,
          color: "text-blue-600",
          bgColor: "bg-blue-50",
          borderColor: "border-blue-200",
          text: "Connecting...",
        }
      case "error":
        return {
          icon: AlertCircle,
          color: "text-red-600",
          bgColor: "bg-red-50",
          borderColor: "border-red-200",
          text: "Connection error",
        }
      default:
        return {
          icon: WifiOff,
          color: "text-gray-600",
          bgColor: "bg-gray-50",
          borderColor: "border-gray-200",
          text: "Disconnected",
        }
    }
  }

  const config = getStatusConfig()
  const Icon = config.icon

  if (status === "connected" && lastUpdate) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Icon className={`w-4 h-4 ${config.color}`} />
        <span>Updated {timeAgo}</span>
        <span className="text-xs">({updateCount} updates)</span>
      </div>
    )
  }

  return (
    <Card className={`p-3 ${config.bgColor} ${config.borderColor} border`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon className={`w-4 h-4 ${config.color} ${status === "connecting" ? "animate-spin" : ""}`} />
          <span className={`text-sm font-medium ${config.color}`}>{config.text}</span>
          {lastUpdate && <span className="text-xs text-muted-foreground">Last: {timeAgo}</span>}
        </div>
        {status === "error" && (
          <Button size="sm" variant="outline" onClick={onRefresh}>
            <RefreshCw className="w-3 h-3 mr-1" />
            Retry
          </Button>
        )}
      </div>
    </Card>
  )
}
