import { notFound } from "next/navigation"
import Link from "next/link"
import {
  ArrowLeft,
  MapPin,
  Phone,
  User,
  Vote,
  Clock,
  ShieldCheck,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { BoothStatusBadge } from "@/components/dashboard/booth-status-badge"
import { RiskBadge } from "@/components/dashboard/risk-badge"
import { VoteTrendChart } from "@/components/dashboard/vote-trend-chart"
import {
  booths,
  generateBoothHourlyVotes,
  generateBoothLogs,
  ledgerRecords,
} from "@/lib/mock-data"
import { formatNumber } from "@/lib/format"
import { format } from "date-fns"

interface BoothDetailPageProps {
  params: Promise<{ id: string }>
}

export default async function BoothDetailPage({ params }: BoothDetailPageProps) {
  const { id } = await params
  const booth = booths.find((b) => b.id === id)

  if (!booth) {
    notFound()
  }

  const hourlyVotes = generateBoothHourlyVotes(booth.id)
  const logs = generateBoothLogs(booth.id)
  const boothRecords = ledgerRecords.filter((r) => r.boothId === booth.id)
  const turnout = Math.round((booth.totalVotes / booth.expectedVotes) * 100)

  return (
    <div className="space-y-6">
      {/* Breadcrumb + Back */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
          <Link href="/dashboard/booths">
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Back to booths</span>
          </Link>
        </Button>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-semibold tracking-tight text-foreground">
              {booth.name}
            </h1>
            <BoothStatusBadge status={booth.status} />
            <RiskBadge level={booth.riskLevel} />
          </div>
          <p className="text-sm text-muted-foreground">
            <span className="font-mono">{booth.id}</span>
            {" / "}
            {booth.region}, {booth.state}
          </p>
        </div>
      </div>

      {/* Info Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
              <Vote className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Total Votes</p>
              <p className="font-mono text-lg font-bold tabular-nums text-card-foreground">
                {formatNumber(booth.totalVotes)}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">Turnout</p>
              <span className="font-mono text-xs text-muted-foreground">
                {turnout}%
              </span>
            </div>
            <Progress value={turnout} className="mt-2 h-2" />
            <p className="mt-1 text-xs text-muted-foreground">
              of {formatNumber(booth.expectedVotes)} expected
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-success/10">
              <Clock className="h-4 w-4 text-success" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Last Sync</p>
              <p className="text-sm font-medium text-card-foreground">
                {format(new Date(booth.lastSync), "HH:mm:ss")}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
              <ShieldCheck className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Integrity</p>
              <p className="text-sm font-medium text-card-foreground">
                {boothRecords.filter((r) => r.verified).length}/
                {boothRecords.length} verified
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Officer Info + Risk Score */}
      <div className="grid gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Booth Officer
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-card-foreground">{booth.officerName}</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <span className="font-mono text-sm text-card-foreground">
                {booth.officerContact}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-card-foreground">
                {booth.district}, {booth.state}
              </span>
            </div>
          </CardContent>
        </Card>

        <div className="lg:col-span-2">
          <VoteTrendChart
            data={hourlyVotes}
            title="Hourly Vote Trend"
            height={200}
          />
        </div>
      </div>

      {/* Data Logs */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Activity Log
          </CardTitle>
        </CardHeader>
        <CardContent className="px-0 pb-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="text-xs">Time</TableHead>
                  <TableHead className="text-xs">Type</TableHead>
                  <TableHead className="text-xs">Action</TableHead>
                  <TableHead className="text-xs">Details</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.slice(0, 15).map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="font-mono text-xs text-muted-foreground">
                      {format(new Date(log.timestamp), "HH:mm:ss")}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className="text-xs capitalize"
                      >
                        {log.type}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-card-foreground">
                      {log.action}
                    </TableCell>
                    <TableCell className="max-w-[300px] truncate text-xs text-muted-foreground">
                      {log.details}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
