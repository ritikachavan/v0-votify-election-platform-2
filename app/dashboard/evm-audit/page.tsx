"use client"

import { useState, useMemo } from "react"
import {
  Cpu,
  Search,
  Battery,
  Thermometer,
  ShieldCheck,
  ShieldAlert,
  ShieldX,
  Clock,
  Eye,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Info,
  Activity,
  Printer,
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Progress } from "@/components/ui/progress"
import { KpiCard } from "@/components/dashboard/kpi-card"
import {
  evmDevices,
  evmAuditEvents,
  type EvmDevice,
  type EvmAuditEvent,
} from "@/lib/mock-data"
import { formatNumber } from "@/lib/format"
import { format } from "date-fns"

const PAGE_SIZE = 12

function EvmStatusBadge({ status }: { status: EvmDevice["status"] }) {
  const config = {
    operational: { label: "Operational", className: "border-success/30 bg-success/10 text-success", icon: ShieldCheck },
    warning: { label: "Warning", className: "border-warning/30 bg-warning/10 text-warning", icon: AlertTriangle },
    faulty: { label: "Faulty", className: "border-destructive/30 bg-destructive/10 text-destructive", icon: ShieldX },
    replaced: { label: "Replaced", className: "border-muted-foreground/30 bg-muted text-muted-foreground", icon: ShieldAlert },
  }
  const c = config[status]
  const Icon = c.icon
  return (
    <Badge variant="outline" className={`${c.className} text-[10px] gap-1`}>
      <Icon className="h-3 w-3" />
      {c.label}
    </Badge>
  )
}

function AuditSeverityDot({ severity }: { severity: EvmAuditEvent["severity"] }) {
  const color = severity === "error" ? "bg-destructive" : severity === "warning" ? "bg-warning" : "bg-success"
  return <span className={`inline-block h-2 w-2 rounded-full ${color}`} />
}

export default function EvmAuditPage() {
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [stateFilter, setStateFilter] = useState<string>("all")
  const [page, setPage] = useState(0)
  const [selectedEvm, setSelectedEvm] = useState<EvmDevice | null>(null)

  const allStates = useMemo(() => [...new Set(evmDevices.map((d) => d.state))], [])

  const filtered = useMemo(() => {
    return evmDevices.filter((d) => {
      const matchSearch =
        search === "" ||
        d.id.toLowerCase().includes(search.toLowerCase()) ||
        d.serialNumber.toLowerCase().includes(search.toLowerCase()) ||
        d.boothName.toLowerCase().includes(search.toLowerCase()) ||
        d.boothId.toLowerCase().includes(search.toLowerCase())
      const matchStatus = statusFilter === "all" || d.status === statusFilter
      const matchState = stateFilter === "all" || d.state === stateFilter
      return matchSearch && matchStatus && matchState
    })
  }, [search, statusFilter, stateFilter])

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE)
  const paged = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE)

  const totalOperational = evmDevices.filter((d) => d.status === "operational").length
  const totalWarning = evmDevices.filter((d) => d.status === "warning").length
  const totalFaulty = evmDevices.filter((d) => d.status === "faulty").length
  const avgBattery = Math.round(evmDevices.reduce((s, d) => s + d.batteryLevel, 0) / evmDevices.length)

  const evmAuditLog = useMemo(() => {
    if (!selectedEvm) return []
    return evmAuditEvents.filter((e) => e.evmId === selectedEvm.id)
  }, [selectedEvm])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          EVM Audit Trail
        </h1>
        <p className="text-sm text-muted-foreground">
          Hardware diagnostics, seal integrity verification, and real-time EVM health monitoring
        </p>
      </div>

      {/* KPIs */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          title="Operational"
          value={`${totalOperational}/${evmDevices.length}`}
          subtitle={`${Math.round((totalOperational / evmDevices.length) * 100)}% healthy`}
          icon={ShieldCheck}
          variant="success"
        />
        <KpiCard
          title="Warnings"
          value={String(totalWarning)}
          subtitle="Need attention"
          icon={AlertTriangle}
          variant="warning"
        />
        <KpiCard
          title="Faulty/Replaced"
          value={String(totalFaulty)}
          subtitle="Critical devices"
          icon={ShieldX}
          variant={totalFaulty > 0 ? "destructive" : "default"}
        />
        <KpiCard
          title="Avg Battery"
          value={`${avgBattery}%`}
          subtitle="Across all EVMs"
          icon={Battery}
        />
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="flex flex-wrap items-center gap-3 p-4">
          <div className="relative flex-1 min-w-[220px]">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by EVM ID, serial number, booth..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(0) }}
              className="pl-9"
            />
          </div>
          <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(0) }}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="operational">Operational</SelectItem>
              <SelectItem value="warning">Warning</SelectItem>
              <SelectItem value="faulty">Faulty</SelectItem>
              <SelectItem value="replaced">Replaced</SelectItem>
            </SelectContent>
          </Select>
          <Select value={stateFilter} onValueChange={(v) => { setStateFilter(v); setPage(0) }}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="State" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All States</SelectItem>
              {allStates.map((s) => (
                <SelectItem key={s} value={s}>{s}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center justify-between text-sm font-medium text-muted-foreground">
            <span>{filtered.length} EVM device{filtered.length !== 1 ? "s" : ""}</span>
            <span className="font-mono text-xs">Page {page + 1} of {totalPages || 1}</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="px-0 pb-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="text-xs">EVM ID</TableHead>
                  <TableHead className="text-xs">Serial No.</TableHead>
                  <TableHead className="text-xs">Booth</TableHead>
                  <TableHead className="text-xs">Model</TableHead>
                  <TableHead className="text-xs">Status</TableHead>
                  <TableHead className="text-xs">Battery</TableHead>
                  <TableHead className="text-xs">Temp</TableHead>
                  <TableHead className="text-xs">Seal</TableHead>
                  <TableHead className="text-xs">VVPAT</TableHead>
                  <TableHead className="w-8"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paged.map((evm) => (
                  <TableRow
                    key={evm.id}
                    className={`group cursor-pointer ${evm.status === "faulty" ? "bg-destructive/5" : evm.status === "warning" ? "bg-warning/5" : ""}`}
                    onClick={() => setSelectedEvm(evm)}
                  >
                    <TableCell className="font-mono text-xs font-medium text-foreground">{evm.id}</TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground">{evm.serialNumber}</TableCell>
                    <TableCell>
                      <div>
                        <span className="text-xs text-foreground">{evm.boothName}</span>
                        <span className="block text-[10px] text-muted-foreground">{evm.boothId}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">{evm.model}</TableCell>
                    <TableCell><EvmStatusBadge status={evm.status} /></TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5">
                        <Progress value={evm.batteryLevel} className="h-1.5 w-12" />
                        <span className={`font-mono text-[10px] ${evm.batteryLevel < 20 ? "text-destructive" : "text-muted-foreground"}`}>
                          {evm.batteryLevel}%
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className={`font-mono text-xs ${evm.temperature > 40 ? "text-destructive" : "text-muted-foreground"}`}>
                        {evm.temperature}°C
                      </span>
                    </TableCell>
                    <TableCell>
                      {evm.sealIntact ? (
                        <CheckCircle2 className="h-4 w-4 text-success" />
                      ) : (
                        <XCircle className="h-4 w-4 text-destructive" />
                      )}
                    </TableCell>
                    <TableCell>
                      {evm.vvpatSynced ? (
                        <CheckCircle2 className="h-4 w-4 text-success" />
                      ) : (
                        <XCircle className="h-4 w-4 text-warning" />
                      )}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost" size="icon"
                        className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={(e) => { e.stopPropagation(); setSelectedEvm(evm) }}
                      >
                        <Eye className="h-4 w-4" />
                        <span className="sr-only">View {evm.id}</span>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-border px-4 py-3">
              <Button variant="outline" size="sm" disabled={page === 0} onClick={() => setPage((p) => p - 1)}>Previous</Button>
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                  const pageNum = totalPages <= 5 ? i : page < 3 ? i : page > totalPages - 4 ? totalPages - 5 + i : page - 2 + i
                  return (
                    <Button key={pageNum} variant={page === pageNum ? "default" : "ghost"} size="sm" className="h-8 w-8 p-0" onClick={() => setPage(pageNum)}>
                      {pageNum + 1}
                    </Button>
                  )
                })}
              </div>
              <Button variant="outline" size="sm" disabled={page >= totalPages - 1} onClick={() => setPage((p) => p + 1)}>Next</Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* EVM Detail Modal */}
      <Dialog open={!!selectedEvm} onOpenChange={(open) => !open && setSelectedEvm(null)}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-foreground">
              <Cpu className="h-5 w-5 text-primary" />
              EVM Device Details
            </DialogTitle>
          </DialogHeader>

          {selectedEvm && (
            <div className="space-y-5">
              {/* Device Header */}
              <div className="flex items-start justify-between rounded-lg border border-border bg-muted/30 p-4">
                <div className="space-y-1">
                  <h3 className="text-lg font-semibold font-mono text-foreground">{selectedEvm.id}</h3>
                  <p className="text-xs text-muted-foreground">S/N: {selectedEvm.serialNumber}</p>
                  <p className="text-xs text-muted-foreground">{selectedEvm.model} &middot; {selectedEvm.firmwareVersion}</p>
                </div>
                <EvmStatusBadge status={selectedEvm.status} />
              </div>

              {/* Hardware Metrics */}
              <div className="space-y-3">
                <h4 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Hardware Metrics</h4>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  <div className="rounded-lg border border-border p-3 text-center">
                    <Battery className={`mx-auto h-5 w-5 ${selectedEvm.batteryLevel < 20 ? "text-destructive" : "text-success"}`} />
                    <p className="mt-1 font-mono text-lg font-bold text-foreground">{selectedEvm.batteryLevel}%</p>
                    <p className="text-[10px] text-muted-foreground">Battery</p>
                  </div>
                  <div className="rounded-lg border border-border p-3 text-center">
                    <Thermometer className={`mx-auto h-5 w-5 ${selectedEvm.temperature > 40 ? "text-destructive" : "text-primary"}`} />
                    <p className="mt-1 font-mono text-lg font-bold text-foreground">{selectedEvm.temperature}°C</p>
                    <p className="text-[10px] text-muted-foreground">Temperature</p>
                  </div>
                  <div className="rounded-lg border border-border p-3 text-center">
                    <Activity className="mx-auto h-5 w-5 text-primary" />
                    <p className="mt-1 font-mono text-lg font-bold text-foreground">{Math.floor(selectedEvm.uptimeMinutes / 60)}h {selectedEvm.uptimeMinutes % 60}m</p>
                    <p className="text-[10px] text-muted-foreground">Uptime</p>
                  </div>
                  <div className="rounded-lg border border-border p-3 text-center">
                    <Printer className="mx-auto h-5 w-5 text-primary" />
                    <p className="mt-1 font-mono text-lg font-bold text-foreground">{formatNumber(selectedEvm.totalVotesRecorded)}</p>
                    <p className="text-[10px] text-muted-foreground">Votes Recorded</p>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Integrity Checks */}
              <div className="space-y-3">
                <h4 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Integrity Verification</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div className={`flex items-center gap-3 rounded-lg border p-3 ${selectedEvm.sealIntact ? "border-success/30 bg-success/5" : "border-destructive/30 bg-destructive/5"}`}>
                    {selectedEvm.sealIntact ? (
                      <CheckCircle2 className="h-5 w-5 text-success" />
                    ) : (
                      <XCircle className="h-5 w-5 text-destructive" />
                    )}
                    <div>
                      <p className="text-sm font-medium text-foreground">Seal Integrity</p>
                      <p className="text-[10px] text-muted-foreground">{selectedEvm.sealIntact ? "All seals intact and verified" : "SEAL BROKEN - Investigate immediately"}</p>
                    </div>
                  </div>
                  <div className={`flex items-center gap-3 rounded-lg border p-3 ${selectedEvm.vvpatSynced ? "border-success/30 bg-success/5" : "border-warning/30 bg-warning/5"}`}>
                    {selectedEvm.vvpatSynced ? (
                      <CheckCircle2 className="h-5 w-5 text-success" />
                    ) : (
                      <AlertTriangle className="h-5 w-5 text-warning" />
                    )}
                    <div>
                      <p className="text-sm font-medium text-foreground">VVPAT Sync</p>
                      <p className="text-[10px] text-muted-foreground">{selectedEvm.vvpatSynced ? "VVPAT records match EVM count" : "VVPAT desynchronized - manual check needed"}</p>
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Deployment Info */}
              <div className="space-y-3">
                <h4 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Deployment</h4>
                <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Booth</span>
                    <span className="font-mono text-foreground">{selectedEvm.boothId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Location</span>
                    <span className="text-foreground">{selectedEvm.boothName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">State</span>
                    <span className="text-foreground">{selectedEvm.state}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Last Calibration</span>
                    <span className="font-mono text-foreground">{format(new Date(selectedEvm.lastCalibration), "dd MMM, HH:mm")}</span>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Audit Log */}
              <div className="space-y-3">
                <h4 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Audit Log ({evmAuditLog.length} events)
                </h4>
                <div className="max-h-[200px] overflow-y-auto space-y-1.5 rounded-lg border border-border p-2">
                  {evmAuditLog.length === 0 && (
                    <p className="py-4 text-center text-xs text-muted-foreground">No audit events recorded</p>
                  )}
                  {evmAuditLog.map((event) => (
                    <div key={event.id} className="flex items-start gap-2 rounded px-2 py-1.5 hover:bg-muted/50">
                      <AuditSeverityDot severity={event.severity} />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-foreground">{event.event}</p>
                        <p className="text-[10px] text-muted-foreground truncate">{event.details}</p>
                      </div>
                      <span className="shrink-0 font-mono text-[10px] text-muted-foreground">
                        {format(new Date(event.timestamp), "HH:mm")}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
