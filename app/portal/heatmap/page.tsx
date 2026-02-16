"use client"

import { useState } from "react"
import { ArrowLeft, MapPin, TrendingUp, AlertTriangle } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { stateStats, regionStats, booths } from "@/lib/mock-data"
import { BoothStatusBadge } from "@/components/dashboard/booth-status-badge"
import { RiskBadge } from "@/components/dashboard/risk-badge"
import { formatNumber } from "@/lib/format"

type DrillLevel = "state" | "district" | "booth"

export default function HeatmapPage() {
  const [drillLevel, setDrillLevel] = useState<DrillLevel>("state")
  const [selectedState, setSelectedState] = useState<string | null>(null)
  const [selectedDistrict, setSelectedDistrict] = useState<string | null>(null)

  function getIntensityColor(turnout: number): string {
    if (turnout >= 70) return "bg-primary text-primary-foreground"
    if (turnout >= 55) return "bg-primary/70 text-primary-foreground"
    if (turnout >= 40) return "bg-primary/40 text-primary-foreground"
    if (turnout >= 25) return "bg-primary/20 text-foreground"
    return "bg-muted text-muted-foreground"
  }

  function handleStateClick(state: string) {
    setSelectedState(state)
    setSelectedDistrict(null)
    setDrillLevel("district")
  }

  function handleDistrictClick(district: string) {
    setSelectedDistrict(district)
    setDrillLevel("booth")
  }

  function handleBack() {
    if (drillLevel === "booth") {
      setSelectedDistrict(null)
      setDrillLevel("district")
    } else if (drillLevel === "district") {
      setSelectedState(null)
      setDrillLevel("state")
    }
  }

  const stateDistricts = selectedState
    ? regionStats.filter((r) => r.state === selectedState)
    : []

  const districtBooths = selectedDistrict
    ? booths.filter((b) => b.region === selectedDistrict)
    : []

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        {drillLevel !== "state" && (
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={handleBack}
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Go back</span>
          </Button>
        )}
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-foreground">
            Election Heatmap
          </h1>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <button
              onClick={() => {
                setDrillLevel("state")
                setSelectedState(null)
                setSelectedDistrict(null)
              }}
              className="hover:text-foreground transition-colors"
            >
              All India
            </button>
            {selectedState && (
              <>
                <span>/</span>
                <button
                  onClick={() => {
                    setDrillLevel("district")
                    setSelectedDistrict(null)
                  }}
                  className="hover:text-foreground transition-colors"
                >
                  {selectedState}
                </button>
              </>
            )}
            {selectedDistrict && (
              <>
                <span>/</span>
                <span className="text-foreground">{selectedDistrict}</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Intensity Legend */}
      <Card>
        <CardContent className="flex flex-wrap items-center gap-4 p-4">
          <span className="text-xs font-medium text-muted-foreground">
            Vote Intensity:
          </span>
          <div className="flex items-center gap-2">
            {[
              { label: "Low", className: "bg-muted" },
              { label: "25%+", className: "bg-primary/20" },
              { label: "40%+", className: "bg-primary/40" },
              { label: "55%+", className: "bg-primary/70" },
              { label: "70%+", className: "bg-primary" },
            ].map((level) => (
              <div key={level.label} className="flex items-center gap-1">
                <div className={cn("h-3 w-6 rounded", level.className)} />
                <span className="text-[10px] text-muted-foreground">
                  {level.label}
                </span>
              </div>
            ))}
          </div>
          <div className="ml-auto flex items-center gap-1.5">
            <MapPin className="h-3 w-3 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">
              Click to drill down
            </span>
          </div>
        </CardContent>
      </Card>

      {/* STATE LEVEL */}
      {drillLevel === "state" && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {stateStats.map((state) => (
            <button
              key={state.name}
              onClick={() => handleStateClick(state.name)}
              className="text-left"
            >
              <Card className="cursor-pointer transition-all hover:border-primary/40 hover:shadow-md">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-base font-semibold text-card-foreground">
                        {state.name}
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        {state.districts.length} districts
                      </p>
                    </div>
                    <div
                      className={cn(
                        "flex h-12 w-12 items-center justify-center rounded-lg font-mono text-sm font-bold",
                        getIntensityColor(state.turnoutPercentage)
                      )}
                    >
                      {state.turnoutPercentage}%
                    </div>
                  </div>

                  <div className="mt-4 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Turnout</span>
                      <span className="font-mono text-card-foreground">
                        {formatNumber(state.totalVotes)} votes
                      </span>
                    </div>
                    <Progress value={state.turnoutPercentage} className="h-2" />
                  </div>

                  <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                    <span>
                      {state.activeBooths}/{state.totalBooths} booths online
                    </span>
                    {state.highRiskBooths > 0 && (
                      <Badge
                        variant="outline"
                        className="gap-1 bg-destructive/10 text-destructive border-destructive/20 text-[10px] hover:bg-destructive/10"
                      >
                        <AlertTriangle className="h-2.5 w-2.5" />
                        {state.highRiskBooths} risk
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            </button>
          ))}
        </div>
      )}

      {/* DISTRICT LEVEL */}
      {drillLevel === "district" && selectedState && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {stateDistricts.map((district) => (
            <button
              key={district.name}
              onClick={() => handleDistrictClick(district.name)}
              className="text-left"
            >
              <Card className="cursor-pointer transition-all hover:border-primary/40 hover:shadow-md">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-sm font-semibold text-card-foreground">
                        {district.name}
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        {district.totalBooths} booths
                      </p>
                    </div>
                    <div
                      className={cn(
                        "flex h-10 w-10 items-center justify-center rounded-lg font-mono text-xs font-bold",
                        getIntensityColor(district.turnoutPercentage)
                      )}
                    >
                      {district.turnoutPercentage}%
                    </div>
                  </div>

                  <div className="mt-3 space-y-2">
                    <Progress
                      value={district.turnoutPercentage}
                      className="h-1.5"
                    />
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>{formatNumber(district.totalVotes)} votes</span>
                      <span>
                        {district.activeBooths}/{district.totalBooths} online
                      </span>
                    </div>
                  </div>

                  <div className="mt-2 text-xs text-muted-foreground">
                    Leading:{" "}
                    <span className="text-card-foreground">
                      {district.leadingCandidate}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </button>
          ))}
        </div>
      )}

      {/* BOOTH LEVEL */}
      {drillLevel === "booth" && selectedDistrict && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-medium text-muted-foreground">
              Booths in {selectedDistrict}
            </h2>
            <span className="text-xs text-muted-foreground">
              {districtBooths.length} booth
              {districtBooths.length !== 1 ? "s" : ""}
            </span>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {districtBooths.map((booth) => {
              const turnout = Math.round(
                (booth.totalVotes / booth.expectedVotes) * 100
              )
              return (
                <Card key={booth.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-medium text-card-foreground">
                            {booth.id}
                          </span>
                          <BoothStatusBadge status={booth.status} />
                        </div>
                        <p className="mt-1 text-sm text-card-foreground">
                          {booth.name}
                        </p>
                      </div>
                      <RiskBadge level={booth.riskLevel} />
                    </div>
                    <div className="mt-3 space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">Turnout</span>
                        <span className="font-mono text-card-foreground">
                          {turnout}%
                        </span>
                      </div>
                      <Progress value={turnout} className="h-1.5" />
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>
                          {formatNumber(booth.totalVotes)}/
                          {formatNumber(booth.expectedVotes)}
                        </span>
                        <span>
                          <TrendingUp className="mr-1 inline h-3 w-3" />
                          {formatNumber(booth.totalVotes)} votes
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
