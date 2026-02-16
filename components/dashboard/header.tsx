"use client"

import { Bell, Shield } from "lucide-react"
import { Button } from "@/components/ui/button"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { ThemeToggle } from "@/components/theme-toggle"
import { Badge } from "@/components/ui/badge"
import { kpiStats } from "@/lib/mock-data"

export function DashboardHeader() {
  return (
    <header className="flex h-14 items-center gap-3 border-b border-border bg-background/80 px-4 backdrop-blur-sm">
      <SidebarTrigger />
      <Separator orientation="vertical" className="h-5" />

      <div className="flex items-center gap-2">
        <Shield className="h-4 w-4 text-primary" />
        <span className="text-sm font-medium text-foreground">
          Election Day 2026
        </span>
        <Badge variant="outline" className="bg-success/10 text-success border-success/20 gap-1 text-xs hover:bg-success/10">
          <span className="h-1.5 w-1.5 rounded-full bg-success" aria-hidden />
          Live
        </Badge>
      </div>

      <div className="ml-auto flex items-center gap-1">
        <Button variant="ghost" size="icon" className="relative" aria-label="Notifications">
          <Bell className="h-4 w-4" />
          {kpiStats.criticalAlerts > 0 && (
            <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground">
              {kpiStats.criticalAlerts}
            </span>
          )}
        </Button>
        <ThemeToggle />
      </div>
    </header>
  )
}
