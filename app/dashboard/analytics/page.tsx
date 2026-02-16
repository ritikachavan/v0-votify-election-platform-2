"use client"

import { useMemo } from "react"
import {
  TrendingUp,
  TrendingDown,
  BarChart3,
  Gauge,
  Trophy,
  Zap,
  ArrowUp,
  ArrowDown,
  Minus,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
  ReferenceLine,
} from "recharts"
import {
  candidates,
  hourlyVoteTrend,
  voteVelocity,
  candidateRaceData,
  stateTurnoutComparison,
  stateStats,
  booths,
  kpiStats,
} from "@/lib/mock-data"
import { formatNumber } from "@/lib/format"

const COLORS = [
  "hsl(217, 91%, 60%)",
  "hsl(160, 84%, 39%)",
  "hsl(38, 92%, 50%)",
  "hsl(340, 75%, 55%)",
  "hsl(215, 16%, 47%)",
]

export default function AnalyticsPage() {
  const peakVelocity = useMemo(() => {
    return voteVelocity.reduce((max, v) => (v.velocity > max.velocity ? v : max), voteVelocity[0])
  }, [])

  const currentVelocity = voteVelocity[voteVelocity.length - 1]
  const avgVelocity = Math.round(voteVelocity.reduce((s, v) => s + v.velocity, 0) / voteVelocity.length)

  const winProbability = useMemo(() => {
    return candidates.slice(0, 4).map((c, i) => {
      const margin = c.percentage - (candidates[1]?.percentage ?? 0)
      const prob = i === 0 ? 72.4 : i === 1 ? 21.8 : i === 2 ? 4.6 : 1.2
      return { ...c, probability: prob, margin: i === 0 ? margin : -margin, color: COLORS[i] }
    })
  }, [])

  // radar data: each state's metrics
  const radarData = stateStats.map((s) => ({
    state: s.name.slice(0, 3),
    turnout: s.turnoutPercentage,
    active: Math.round((s.activeBooths / s.totalBooths) * 100),
    risk: 100 - (s.highRiskBooths / s.totalBooths) * 100 * 10,
  }))

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          Live Election Analytics
        </h1>
        <p className="text-sm text-muted-foreground">
          Deep statistical analysis, vote velocity tracking, and predictive race insights
        </p>
      </div>

      {/* Velocity KPIs */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Zap className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Current Velocity</p>
              <p className="text-lg font-bold font-mono text-foreground">
                {formatNumber(currentVelocity.velocity)}
              </p>
              <p className="text-[10px] text-muted-foreground">votes/min</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success/10">
              <Gauge className="h-5 w-5 text-success" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Peak Velocity</p>
              <p className="text-lg font-bold font-mono text-foreground">
                {formatNumber(peakVelocity.velocity)}
              </p>
              <p className="text-[10px] text-muted-foreground">at {peakVelocity.hour}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-warning/10">
              <BarChart3 className="h-5 w-5 text-warning" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Average Velocity</p>
              <p className="text-lg font-bold font-mono text-foreground">
                {formatNumber(avgVelocity)}
              </p>
              <p className="text-[10px] text-muted-foreground">votes/min</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Trophy className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Projected Winner</p>
              <p className="text-sm font-bold text-foreground">{candidates[0].name}</p>
              <p className="text-[10px] text-muted-foreground">72.4% probability</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Vote Velocity Chart + Candidate Race */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Vote Velocity */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-foreground">Vote Velocity Over Time</CardTitle>
            <CardDescription className="text-xs">Votes per minute throughout election day</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={voteVelocity}>
                  <defs>
                    <linearGradient id="velocityGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(217, 91%, 60%)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(217, 91%, 60%)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="hour" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                  <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                      fontSize: "12px",
                    }}
                    formatter={(value: number) => [`${formatNumber(value)} v/min`, "Velocity"]}
                  />
                  <ReferenceLine y={avgVelocity} stroke="hsl(var(--muted-foreground))" strokeDasharray="5 5" label={{ value: "Avg", fill: "hsl(var(--muted-foreground))", fontSize: 10 }} />
                  <Area
                    type="monotone"
                    dataKey="velocity"
                    stroke="hsl(217, 91%, 60%)"
                    strokeWidth={2}
                    fill="url(#velocityGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Candidate Race Tracker */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-foreground">Candidate Race Tracker</CardTitle>
            <CardDescription className="text-xs">Vote share percentage over time</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={candidateRaceData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="hour" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                  <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" domain={[0, 40]} unit="%" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                      fontSize: "12px",
                    }}
                    formatter={(value: number, name: string) => [`${value}%`, name]}
                  />
                  <Legend iconSize={8} wrapperStyle={{ fontSize: "11px" }} />
                  {candidates.slice(0, 4).map((c, i) => (
                    <Line
                      key={c.name}
                      type="monotone"
                      dataKey={c.name}
                      stroke={COLORS[i]}
                      strokeWidth={2}
                      dot={false}
                      activeDot={{ r: 4 }}
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Win Probability + State Comparison */}
      <div className="grid gap-4 lg:grid-cols-5">
        {/* Win Probability */}
        <div className="lg:col-span-2">
          <Card className="h-full">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-foreground">Victory Probability</CardTitle>
              <CardDescription className="text-xs">Based on current trends and historical data</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {winProbability.map((c, i) => (
                <div key={c.id} className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: c.color }} />
                      <span className="text-xs font-medium text-foreground">{c.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm font-bold text-foreground">
                        {c.probability}%
                      </span>
                      {i === 0 && (
                        <Badge className="bg-success/15 text-success border-success/30 text-[10px]">
                          Leading
                        </Badge>
                      )}
                    </div>
                  </div>
                  <Progress
                    value={c.probability}
                    className="h-2"
                  />
                  <p className="text-[10px] text-muted-foreground">
                    {c.party} &middot; {formatNumber(c.votes)} votes ({c.percentage}%)
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* State Turnout Comparison */}
        <div className="lg:col-span-3">
          <Card className="h-full">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-foreground">State Turnout vs Previous Election</CardTitle>
              <CardDescription className="text-xs">Comparative analysis across all states</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[280px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stateTurnoutComparison} barGap={4}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="state" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                    <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" domain={[0, 100]} unit="%" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                        fontSize: "12px",
                      }}
                      formatter={(value: number, name: string) => [`${value}%`, name]}
                    />
                    <Legend iconSize={8} wrapperStyle={{ fontSize: "11px" }} />
                    <Bar dataKey="current" name="Current" fill="hsl(217, 91%, 60%)" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="previous" name="Previous" fill="hsl(var(--muted-foreground))" radius={[4, 4, 0, 0]} opacity={0.4} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4 grid grid-cols-5 gap-2">
                {stateTurnoutComparison.map((s) => (
                  <div key={s.state} className="rounded-lg border border-border bg-muted/30 p-2 text-center">
                    <p className="text-[10px] text-muted-foreground truncate">{s.state}</p>
                    <div className="flex items-center justify-center gap-1 mt-0.5">
                      {s.delta > 0 ? (
                        <ArrowUp className="h-3 w-3 text-success" />
                      ) : s.delta < 0 ? (
                        <ArrowDown className="h-3 w-3 text-destructive" />
                      ) : (
                        <Minus className="h-3 w-3 text-muted-foreground" />
                      )}
                      <span className={`text-xs font-bold font-mono ${s.delta > 0 ? "text-success" : s.delta < 0 ? "text-destructive" : "text-muted-foreground"}`}>
                        {s.delta > 0 ? "+" : ""}{s.delta}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* State Health Radar + Hourly Acceleration */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-foreground">State Health Radar</CardTitle>
            <CardDescription className="text-xs">Turnout, booth uptime, and risk scores</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData}>
                  <PolarGrid stroke="hsl(var(--border))" />
                  <PolarAngleAxis dataKey="state" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                  <PolarRadiusAxis tick={{ fontSize: 9 }} domain={[0, 100]} />
                  <Radar name="Turnout" dataKey="turnout" stroke="hsl(217, 91%, 60%)" fill="hsl(217, 91%, 60%)" fillOpacity={0.15} strokeWidth={2} />
                  <Radar name="Active Booths" dataKey="active" stroke="hsl(160, 84%, 39%)" fill="hsl(160, 84%, 39%)" fillOpacity={0.1} strokeWidth={2} />
                  <Radar name="Safety Score" dataKey="risk" stroke="hsl(38, 92%, 50%)" fill="hsl(38, 92%, 50%)" fillOpacity={0.05} strokeWidth={2} />
                  <Legend iconSize={8} wrapperStyle={{ fontSize: "11px" }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                      fontSize: "12px",
                    }}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-foreground">Vote Acceleration</CardTitle>
            <CardDescription className="text-xs">Change in velocity between hours (momentum)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={voteVelocity.slice(1)}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="hour" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                  <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                      fontSize: "12px",
                    }}
                    formatter={(value: number) => [`${value > 0 ? "+" : ""}${formatNumber(value)}`, "Acceleration"]}
                  />
                  <ReferenceLine y={0} stroke="hsl(var(--muted-foreground))" />
                  <Bar dataKey="acceleration" radius={[4, 4, 0, 0]}>
                    {voteVelocity.slice(1).map((entry, i) => (
                      <Cell
                        key={i}
                        fill={entry.acceleration >= 0 ? "hsl(160, 84%, 39%)" : "hsl(0, 84%, 60%)"}
                        opacity={0.8}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
