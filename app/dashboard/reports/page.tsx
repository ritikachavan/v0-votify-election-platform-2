"use client"

import { useState } from "react"
import {
  FileBarChart,
  Download,
  ClipboardList,
  Users,
  Vote,
  MapPin,
  AlertTriangle,
  ShieldCheck,
  Cpu,
  BarChart3,
  CheckCircle2,
  XCircle,
  Clock,
  TrendingUp,
  Printer,
  FileText,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Progress } from "@/components/ui/progress"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  kpiStats,
  candidates,
  booths,
  alerts,
  ledgerRecords,
  evmDevices,
  stateStats,
  regionStats,
  voterRegistry,
  hourlyVoteTrend,
} from "@/lib/mock-data"
import { formatNumber } from "@/lib/format"

type ReportType = "summary" | "state" | "integrity" | "incident"

interface ReportSection {
  title: string
  icon: React.ElementType
  items: { label: string; value: string; status?: "good" | "warning" | "bad" }[]
}

export default function ReportsPage() {
  const [reportType, setReportType] = useState<ReportType>("summary")
  const [stateFilter, setStateFilter] = useState<string>("all")
  const [isExporting, setIsExporting] = useState(false)

  const handleExport = () => {
    setIsExporting(true)
    setTimeout(() => setIsExporting(false), 2000)
  }

  const totalVoters = voterRegistry.length
  const totalVoted = voterRegistry.filter((v) => v.hasVoted).length
  const onlineBooths = booths.filter((b) => b.status === "online").length
  const offlineBooths = booths.filter((b) => b.status === "offline").length
  const unresolvedAlerts = alerts.filter((a) => !a.resolved).length
  const criticalAlerts = alerts.filter((a) => a.severity === "critical" && !a.resolved).length
  const verifiedRecords = ledgerRecords.filter((r) => r.verified).length
  const operationalEvms = evmDevices.filter((d) => d.status === "operational").length
  const faultyEvms = evmDevices.filter((d) => d.status === "faulty").length
  const peakHour = hourlyVoteTrend.reduce((max, h) => (h.votes > max.votes ? h : max), hourlyVoteTrend[0])

  const filteredStates = stateFilter === "all" ? stateStats : stateStats.filter((s) => s.name === stateFilter)

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-foreground">
            Election Reports
          </h1>
          <p className="text-sm text-muted-foreground">
            Generate comprehensive election summaries with exportable data
          </p>
        </div>
        <Button onClick={handleExport} disabled={isExporting} className="gap-2">
          {isExporting ? <Clock className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
          {isExporting ? "Generating..." : "Export Report"}
        </Button>
      </div>

      {/* Report Selectors */}
      <div className="flex flex-wrap gap-3">
        <Select value={reportType} onValueChange={(v) => setReportType(v as ReportType)}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Report Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="summary">Full Summary Report</SelectItem>
            <SelectItem value="state">State-wise Breakdown</SelectItem>
            <SelectItem value="integrity">Data Integrity Report</SelectItem>
            <SelectItem value="incident">Incident Report</SelectItem>
          </SelectContent>
        </Select>
        {reportType === "state" && (
          <Select value={stateFilter} onValueChange={setStateFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select State" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All States</SelectItem>
              {stateStats.map((s) => (
                <SelectItem key={s.name} value={s.name}>{s.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      {/* Report Header Banner */}
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="flex items-center gap-4 p-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
            <FileBarChart className="h-6 w-6 text-primary" />
          </div>
          <div className="flex-1">
            <h2 className="text-sm font-semibold text-foreground">
              {reportType === "summary" && "Election Day Summary Report"}
              {reportType === "state" && "State-wise Election Breakdown"}
              {reportType === "integrity" && "Data Integrity & Verification Report"}
              {reportType === "incident" && "Incident & Alert Report"}
            </h2>
            <p className="text-xs text-muted-foreground">
              Generated for Election Day 2026 &middot; Report timestamp: Feb 16, 2026, 10:00 UTC
            </p>
          </div>
          <Badge variant="outline" className="border-primary/30 bg-primary/10 text-primary text-xs">
            <FileText className="mr-1 h-3 w-3" />
            Official
          </Badge>
        </CardContent>
      </Card>

      {/* Summary Report */}
      {reportType === "summary" && (
        <div className="space-y-4">
          {/* Overview Grid */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <SummaryCard
              icon={Vote}
              title="Total Votes Cast"
              value={formatNumber(kpiStats.totalVotes)}
              sub={`${kpiStats.turnoutPercentage}% turnout`}
              status="good"
            />
            <SummaryCard
              icon={MapPin}
              title="Booth Status"
              value={`${onlineBooths} online`}
              sub={`${offlineBooths} offline of ${booths.length}`}
              status={offlineBooths > 0 ? "warning" : "good"}
            />
            <SummaryCard
              icon={AlertTriangle}
              title="Active Alerts"
              value={String(unresolvedAlerts)}
              sub={`${criticalAlerts} critical`}
              status={criticalAlerts > 0 ? "bad" : unresolvedAlerts > 3 ? "warning" : "good"}
            />
            <SummaryCard
              icon={Users}
              title="Voter Participation"
              value={formatNumber(totalVoted)}
              sub={`of ${formatNumber(totalVoters)} registered`}
              status="good"
            />
          </div>

          {/* Candidate Results */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-foreground">Candidate-wise Results</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {candidates.map((c, i) => (
                <div key={c.id} className="flex items-center gap-4">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold text-primary-foreground" style={{ backgroundColor: c.partyColor }}>
                    {i + 1}
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-sm font-medium text-foreground">{c.name}</span>
                        <span className="ml-2 text-[10px] text-muted-foreground">{c.party}</span>
                      </div>
                      <div className="text-right">
                        <span className="font-mono text-sm font-bold text-foreground">{formatNumber(c.votes)}</span>
                        <span className="ml-1 text-xs text-muted-foreground">({c.percentage}%)</span>
                      </div>
                    </div>
                    <Progress value={c.percentage} className="h-2" />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Peak Hours */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-foreground">Hourly Voting Pattern</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-6 gap-2 lg:grid-cols-12">
                {hourlyVoteTrend.map((h) => {
                  const intensity = h.votes / peakHour.votes
                  const isPeak = h.hour === peakHour.hour
                  return (
                    <div key={h.hour} className={`rounded-lg border p-2 text-center ${isPeak ? "border-primary bg-primary/10" : "border-border"}`}>
                      <p className="text-[10px] text-muted-foreground">{h.hour}</p>
                      <div className="mx-auto my-1 h-12 w-3 rounded-full bg-muted overflow-hidden flex flex-col justify-end">
                        <div
                          className="rounded-full bg-primary transition-all"
                          style={{ height: `${intensity * 100}%` }}
                        />
                      </div>
                      <p className="font-mono text-[10px] font-medium text-foreground">{Math.round(h.votes / 1000)}K</p>
                    </div>
                  )
                })}
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                Peak voting hour: <span className="font-semibold text-primary">{peakHour.hour}</span> with {formatNumber(peakHour.votes)} votes
              </p>
            </CardContent>
          </Card>

          {/* Infrastructure Summary */}
          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-foreground">EVM Fleet Health</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <StatusRow label="Operational EVMs" value={`${operationalEvms}/${evmDevices.length}`} status="good" />
                <StatusRow label="Warning State" value={String(evmDevices.filter((d) => d.status === "warning").length)} status="warning" />
                <StatusRow label="Faulty/Replaced" value={String(faultyEvms)} status={faultyEvms > 0 ? "bad" : "good"} />
                <StatusRow label="VVPAT Synced" value={`${evmDevices.filter((d) => d.vvpatSynced).length}/${evmDevices.length}`} status="good" />
                <StatusRow label="Seals Intact" value={`${evmDevices.filter((d) => d.sealIntact).length}/${evmDevices.length}`} status={evmDevices.some((d) => !d.sealIntact) ? "bad" : "good"} />
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-foreground">Data Integrity Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <StatusRow label="Ledger Records" value={String(ledgerRecords.length)} status="good" />
                <StatusRow label="Verified" value={`${verifiedRecords}/${ledgerRecords.length}`} status={verifiedRecords === ledgerRecords.length ? "good" : "warning"} />
                <StatusRow label="Hash Chain Integrity" value={verifiedRecords === ledgerRecords.length ? "Intact" : "Breaks Found"} status={verifiedRecords === ledgerRecords.length ? "good" : "bad"} />
                <StatusRow label="VVPAT Match Rate" value={`${Math.round((evmDevices.filter((d) => d.vvpatSynced).length / evmDevices.length) * 100)}%`} status="good" />
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* State-wise Report */}
      {reportType === "state" && (
        <div className="space-y-4">
          {filteredStates.map((state) => {
            const stateBooths = booths.filter((b) => b.state === state.name)
            const stateRegions = regionStats.filter((r) => r.state === state.name)
            const stateVoters = voterRegistry.filter((v) => v.state === state.name)
            const voted = stateVoters.filter((v) => v.hasVoted).length

            return (
              <Card key={state.name}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base font-semibold text-foreground">{state.name}</CardTitle>
                    <Badge variant="outline" className="font-mono text-xs">
                      {state.turnoutPercentage}% turnout
                    </Badge>
                  </div>
                  <CardDescription className="text-xs">
                    {state.totalBooths} booths &middot; {state.activeBooths} active &middot; {state.highRiskBooths} high risk
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* State KPIs */}
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                    <MiniStat label="Total Votes" value={formatNumber(state.totalVotes)} />
                    <MiniStat label="Voters" value={`${formatNumber(voted)}/${formatNumber(stateVoters.length)}`} />
                    <MiniStat label="Online Booths" value={`${state.activeBooths}/${state.totalBooths}`} />
                    <MiniStat label="High Risk" value={String(state.highRiskBooths)} warn={state.highRiskBooths > 0} />
                  </div>

                  {/* Region Breakdown */}
                  <div className="rounded-lg border border-border">
                    <div className="grid grid-cols-5 gap-2 border-b border-border bg-muted/30 p-2 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                      <span>Region</span>
                      <span>Booths</span>
                      <span>Votes</span>
                      <span>Turnout</span>
                      <span>Leading</span>
                    </div>
                    {stateRegions.map((r) => (
                      <div key={r.name} className="grid grid-cols-5 gap-2 border-b border-border/50 p-2 last:border-0">
                        <span className="text-xs font-medium text-foreground">{r.name}</span>
                        <span className="text-xs text-muted-foreground">{r.activeBooths}/{r.totalBooths}</span>
                        <span className="font-mono text-xs text-foreground">{formatNumber(r.totalVotes)}</span>
                        <div className="flex items-center gap-1">
                          <Progress value={r.turnoutPercentage} className="h-1.5 w-12" />
                          <span className="font-mono text-[10px] text-muted-foreground">{r.turnoutPercentage}%</span>
                        </div>
                        <span className="text-[10px] text-muted-foreground truncate">{r.leadingCandidate.split(" ")[0]}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* Integrity Report */}
      {reportType === "integrity" && (
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <SummaryCard icon={ShieldCheck} title="Ledger Records" value={`${verifiedRecords}/${ledgerRecords.length}`} sub="Verified" status={verifiedRecords === ledgerRecords.length ? "good" : "warning"} />
            <SummaryCard icon={Cpu} title="EVM Integrity" value={`${operationalEvms}/${evmDevices.length}`} sub="Operational" status={faultyEvms > 0 ? "warning" : "good"} />
            <SummaryCard icon={Printer} title="VVPAT Match" value={`${evmDevices.filter((d) => d.vvpatSynced).length}/${evmDevices.length}`} sub="Synced" status="good" />
          </div>

          {/* Unverified Records */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-foreground">Unverified Ledger Records</CardTitle>
              <CardDescription className="text-xs">Records that failed hash chain verification</CardDescription>
            </CardHeader>
            <CardContent>
              {ledgerRecords.filter((r) => !r.verified).length === 0 ? (
                <div className="flex items-center gap-2 rounded-lg bg-success/10 p-4">
                  <CheckCircle2 className="h-5 w-5 text-success" />
                  <p className="text-sm text-success">All ledger records verified successfully</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {ledgerRecords.filter((r) => !r.verified).map((r) => (
                    <div key={r.id} className="flex items-center justify-between rounded-lg border border-destructive/20 bg-destructive/5 p-3">
                      <div className="flex items-center gap-3">
                        <XCircle className="h-4 w-4 text-destructive" />
                        <div>
                          <p className="text-xs font-medium text-foreground">{r.id} &middot; Block #{r.blockNumber}</p>
                          <p className="font-mono text-[10px] text-muted-foreground">{r.hash.slice(0, 32)}...</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground">{r.boothName}</p>
                        <p className="font-mono text-[10px] text-muted-foreground">{r.voteCount} votes</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Compromised Seals */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-foreground">EVM Seal Integrity</CardTitle>
            </CardHeader>
            <CardContent>
              {evmDevices.filter((d) => !d.sealIntact).length === 0 ? (
                <div className="flex items-center gap-2 rounded-lg bg-success/10 p-4">
                  <CheckCircle2 className="h-5 w-5 text-success" />
                  <p className="text-sm text-success">All EVM seals are intact</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {evmDevices.filter((d) => !d.sealIntact).map((d) => (
                    <div key={d.id} className="flex items-center justify-between rounded-lg border border-destructive/20 bg-destructive/5 p-3">
                      <div className="flex items-center gap-3">
                        <XCircle className="h-4 w-4 text-destructive" />
                        <div>
                          <p className="text-xs font-medium text-foreground">{d.id} &middot; {d.serialNumber}</p>
                          <p className="text-[10px] text-muted-foreground">{d.model} &middot; {d.firmwareVersion}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground">{d.boothName}</p>
                        <Badge variant="outline" className="border-destructive/30 bg-destructive/10 text-destructive text-[10px]">Seal Broken</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Incident Report */}
      {reportType === "incident" && (
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <SummaryCard icon={AlertTriangle} title="Total Alerts" value={String(alerts.length)} sub={`${unresolvedAlerts} unresolved`} status={criticalAlerts > 0 ? "bad" : "warning"} />
            <SummaryCard icon={AlertTriangle} title="Critical" value={String(alerts.filter((a) => a.severity === "critical").length)} sub="Highest priority" status="bad" />
            <SummaryCard icon={AlertTriangle} title="Fraud Flags" value={String(alerts.filter((a) => a.type === "fraud").length)} sub="Investigated" status="warning" />
            <SummaryCard icon={CheckCircle2} title="Resolved" value={String(alerts.filter((a) => a.resolved).length)} sub={`of ${alerts.length} total`} status="good" />
          </div>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-foreground">All Incidents</CardTitle>
              <CardDescription className="text-xs">Chronological list of all election-day incidents</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {alerts
                .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
                .map((alert) => {
                  const severityColor =
                    alert.severity === "critical" ? "border-destructive/30 bg-destructive/5" :
                    alert.severity === "high" ? "border-warning/30 bg-warning/5" :
                    "border-border"
                  return (
                    <div key={alert.id} className={`rounded-lg border p-3 ${severityColor}`}>
                      <div className="flex items-start justify-between">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className={`text-[10px] ${
                              alert.severity === "critical" ? "border-destructive/30 text-destructive" :
                              alert.severity === "high" ? "border-warning/30 text-warning" :
                              alert.severity === "medium" ? "border-primary/30 text-primary" :
                              "border-muted-foreground/30 text-muted-foreground"
                            }`}>
                              {alert.severity}
                            </Badge>
                            <Badge variant="outline" className="text-[10px]">{alert.type}</Badge>
                            <span className="text-xs font-medium text-foreground">{alert.title}</span>
                          </div>
                          <p className="text-xs text-muted-foreground">{alert.description}</p>
                          <p className="text-[10px] text-muted-foreground">
                            {alert.boothName} ({alert.boothId}) &middot; {alert.region}
                            {alert.aiConfidence ? ` &middot; AI Confidence: ${alert.aiConfidence}%` : ""}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          {alert.resolved ? (
                            <Badge className="bg-success/15 text-success border-success/30 text-[10px]">Resolved</Badge>
                          ) : (
                            <Badge variant="outline" className="border-destructive/30 text-destructive text-[10px]">Open</Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}

// -- Helper Components -------------------------------------------------------

function SummaryCard({
  icon: Icon,
  title,
  value,
  sub,
  status,
}: {
  icon: React.ElementType
  title: string
  value: string
  sub: string
  status: "good" | "warning" | "bad"
}) {
  const borderColor = status === "good" ? "border-success/20" : status === "warning" ? "border-warning/20" : "border-destructive/20"
  const bgColor = status === "good" ? "bg-success/5" : status === "warning" ? "bg-warning/5" : "bg-destructive/5"
  const iconColor = status === "good" ? "text-success" : status === "warning" ? "text-warning" : "text-destructive"

  return (
    <Card className={`${borderColor} ${bgColor}`}>
      <CardContent className="flex items-center gap-4 p-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-background/80">
          <Icon className={`h-5 w-5 ${iconColor}`} />
        </div>
        <div>
          <p className="text-xs text-muted-foreground">{title}</p>
          <p className="text-lg font-bold font-mono text-foreground">{value}</p>
          <p className="text-[10px] text-muted-foreground">{sub}</p>
        </div>
      </CardContent>
    </Card>
  )
}

function StatusRow({ label, value, status }: { label: string; value: string; status: "good" | "warning" | "bad" }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-xs text-muted-foreground">{label}</span>
      <div className="flex items-center gap-2">
        <span className="font-mono text-sm font-medium text-foreground">{value}</span>
        {status === "good" && <CheckCircle2 className="h-3.5 w-3.5 text-success" />}
        {status === "warning" && <AlertTriangle className="h-3.5 w-3.5 text-warning" />}
        {status === "bad" && <XCircle className="h-3.5 w-3.5 text-destructive" />}
      </div>
    </div>
  )
}

function MiniStat({ label, value, warn }: { label: string; value: string; warn?: boolean }) {
  return (
    <div className={`rounded-lg border p-2 text-center ${warn ? "border-destructive/20 bg-destructive/5" : "border-border"}`}>
      <p className="text-[10px] text-muted-foreground">{label}</p>
      <p className={`font-mono text-sm font-bold ${warn ? "text-destructive" : "text-foreground"}`}>{value}</p>
    </div>
  )
}
