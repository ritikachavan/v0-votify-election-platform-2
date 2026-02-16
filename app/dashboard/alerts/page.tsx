"use client"

import { useState, useMemo } from "react"
import { Filter, AlertTriangle, Brain, ShieldAlert } from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { AlertCard } from "@/components/dashboard/alert-card"
import { KpiCard } from "@/components/dashboard/kpi-card"
import { alerts } from "@/lib/mock-data"
import type { AlertSeverity, AlertType } from "@/lib/mock-data"

export default function AlertsPage() {
  const [severityFilter, setSeverityFilter] = useState<string>("all")
  const [typeFilter, setTypeFilter] = useState<string>("all")

  const filtered = useMemo(() => {
    return alerts
      .filter((a) => {
        const matchesSeverity =
          severityFilter === "all" || a.severity === severityFilter
        const matchesType = typeFilter === "all" || a.type === typeFilter
        return matchesSeverity && matchesType
      })
      .sort(
        (a, b) =>
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      )
  }, [severityFilter, typeFilter])

  const unresolvedCount = alerts.filter((a) => !a.resolved).length
  const criticalCount = alerts.filter(
    (a) => a.severity === "critical" && !a.resolved
  ).length
  const aiAlertCount = alerts.filter(
    (a) => a.aiConfidence && a.aiConfidence > 80 && !a.resolved
  ).length

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          Alert Center
        </h1>
        <p className="text-sm text-muted-foreground">
          Monitor and manage all system alerts and AI-detected anomalies
        </p>
      </div>

      {/* KPI Summary */}
      <div className="grid gap-4 sm:grid-cols-3">
        <KpiCard
          title="Active Alerts"
          value={unresolvedCount}
          subtitle={`${alerts.length} total`}
          icon={AlertTriangle}
          variant="warning"
        />
        <KpiCard
          title="Critical"
          value={criticalCount}
          subtitle="Require immediate action"
          icon={ShieldAlert}
          variant="destructive"
        />
        <KpiCard
          title="AI Flagged"
          value={aiAlertCount}
          subtitle="High confidence detections"
          icon={Brain}
          variant="default"
        />
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="flex flex-wrap items-center gap-3 p-4">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <Select value={severityFilter} onValueChange={setSeverityFilter}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Severity" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Severity</SelectItem>
              <SelectItem value="critical">Critical</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="low">Low</SelectItem>
            </SelectContent>
          </Select>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="fraud">AI Fraud</SelectItem>
              <SelectItem value="anomaly">Anomaly</SelectItem>
              <SelectItem value="hardware">Hardware</SelectItem>
              <SelectItem value="sync">Sync</SelectItem>
              <SelectItem value="integrity">Integrity</SelectItem>
            </SelectContent>
          </Select>
          <span className="ml-auto text-xs text-muted-foreground">
            {filtered.length} alert{filtered.length !== 1 ? "s" : ""}
          </span>
        </CardContent>
      </Card>

      {/* Alert List */}
      <div className="space-y-3">
        {filtered.map((alert) => (
          <AlertCard key={alert.id} alert={alert} />
        ))}
        {filtered.length === 0 && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <AlertTriangle className="h-8 w-8 text-muted-foreground" />
              <p className="mt-2 text-sm text-muted-foreground">
                No alerts match the current filters
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
