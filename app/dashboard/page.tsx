import { Vote, MapPin, AlertTriangle, TrendingUp } from "lucide-react"
import { KpiCard } from "@/components/dashboard/kpi-card"
import { VoteTrendChart } from "@/components/dashboard/vote-trend-chart"
import { CandidateChart } from "@/components/dashboard/candidate-chart"
import { AlertCard } from "@/components/dashboard/alert-card"
import { RegionTable } from "@/components/dashboard/region-table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  kpiStats,
  hourlyVoteTrend,
  candidates,
  alerts,
  regionStats,
} from "@/lib/mock-data"
import Link from "next/link"

export default function DashboardPage() {
  const recentAlerts = alerts
    .filter((a) => !a.resolved)
    .sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    )
    .slice(0, 4)

  return (
    <div className="space-y-6">
      {/* Page title */}
      <div>
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          Command Center
        </h1>
        <p className="text-sm text-muted-foreground">
          Real-time election monitoring and data integrity overview
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          title="Total Votes"
          value={kpiStats.totalVotes}
          subtitle={`${kpiStats.turnoutPercentage}% turnout`}
          icon={Vote}
          trend={{ value: 12.3, label: "vs last hour" }}
        />
        <KpiCard
          title="Active Booths"
          value={`${kpiStats.activeBooths}/${kpiStats.totalBooths}`}
          subtitle={`${Math.round((kpiStats.activeBooths / kpiStats.totalBooths) * 100)}% online`}
          icon={MapPin}
          variant="success"
        />
        <KpiCard
          title="Active Alerts"
          value={kpiStats.alertsCount}
          subtitle={`${kpiStats.criticalAlerts} critical`}
          icon={AlertTriangle}
          variant={kpiStats.criticalAlerts > 0 ? "destructive" : "warning"}
        />
        <KpiCard
          title="Turnout"
          value={`${kpiStats.turnoutPercentage}%`}
          subtitle="of registered voters"
          icon={TrendingUp}
          trend={{ value: 4.7, label: "vs avg" }}
          variant="success"
        />
      </div>

      {/* Charts Row */}
      <div className="grid gap-4 lg:grid-cols-2">
        <VoteTrendChart data={hourlyVoteTrend} />
        <CandidateChart data={candidates} />
      </div>

      {/* Alerts + Region Table */}
      <div className="grid gap-4 lg:grid-cols-5">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Recent Alerts
              </CardTitle>
              <Link
                href="/dashboard/alerts"
                className="text-xs font-medium text-primary hover:underline"
              >
                View all
              </Link>
            </CardHeader>
            <CardContent className="space-y-2 px-3 pb-3">
              {recentAlerts.map((alert) => (
                <AlertCard key={alert.id} alert={alert} compact />
              ))}
            </CardContent>
          </Card>
        </div>
        <div className="lg:col-span-3">
          <RegionTable data={regionStats} limit={8} />
        </div>
      </div>
    </div>
  )
}
