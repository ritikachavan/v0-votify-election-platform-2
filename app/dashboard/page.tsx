'use client';

import { useEffect, useState } from "react"
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
import { createClient } from "@supabase/supabase-js"

// Initialize Supabase Client using Vercel environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
const supabase = createClient(supabaseUrl, supabaseAnonKey)

interface BoothActivity {
  id: number
  voter_status: string
  candidate_choice: string
  timestamp: string
}

export default function DashboardPage() {
  const [totalVotes, setTotalVotes] = useState<number>(kpiStats.totalVotes)
  const [liveLogs, setLiveLogs] = useState<BoothActivity[]>([])

  useEffect(() => {
    // 1. Fetch initial live vote count from Supabase
    const fetchLiveVotes = async () => {
      const { count, error } = await supabase
        .from("booth_activity")
        .select("*", { count: "exact", head: true })
        .eq("voter_status", "VOTE_RECORDED")

      if (!error && count !== null) {
        setTotalVotes(count)
      }

      // Fetch latest 5 activity events
      const { data } = await supabase
        .from("booth_activity")
        .select("*")
        .order("id", { ascending: false })
        .limit(5)

      if (data) setLiveLogs(data)
    }

    fetchLiveVotes()

    // 2. Realtime listener for incoming votes from face.py & NodeMCU
    const channel = supabase
      .channel("booth_activity_realtime")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "booth_activity" },
        (payload) => {
          const newLog = payload.new as BoothActivity

          // Prepend new activity log
          setLiveLogs((prev) => [newLog, ...prev.slice(0, 4)])

          // Increment total votes counter if a vote was recorded
          if (newLog.voter_status === "VOTE_RECORDED") {
            setTotalVotes((prev) => prev + 1)
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

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
          value={totalVotes}
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

      {/* Live Hardware Activity Feed */}
      {liveLogs.length > 0 && (
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader className="py-3">
            <CardTitle className="text-xs font-semibold tracking-wider text-primary uppercase">
              Live Station Feed (Hardware)
            </CardTitle>
          </CardHeader>
          <CardContent className="py-2 text-sm">
            <div className="space-y-2">
              {liveLogs.map((log) => (
                <div key={log.id} className="flex items-center justify-between border-b border-border/50 pb-1 text-xs">
                  <span className="font-mono text-muted-foreground">
                    {new Date(log.timestamp).toLocaleTimeString("en-IN", { timeZone: "Asia/Kolkata" })}
                  </span>
                  <span className={log.voter_status === "VOTE_RECORDED" ? "font-bold text-green-600" : "text-amber-600"}>
                    {log.voter_status}
                  </span>
                  <span className="font-medium text-foreground">
                    {log.candidate_choice}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

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
