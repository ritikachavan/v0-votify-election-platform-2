"use client"

import { useState, useMemo } from "react"
import {
  Search,
  Filter,
  ScanEye,
  ShieldAlert,
  MapPinOff,
  Users,
  Clock,
  Eye,
  X,
  MapPin,
  CheckCircle2,
  XCircle,
  Zap,
  Copy,
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { KpiCard } from "@/components/dashboard/kpi-card"
import { GeofenceBadge } from "@/components/dashboard/geofence-badge"
import { VoterFlagBadge } from "@/components/dashboard/voter-flag-badge"
import {
  voterActivities,
  activityBooths,
  type VoterActivity,
} from "@/lib/mock-data"
import { format } from "date-fns"

const PAGE_SIZE = 15

export default function BoothActivityPage() {
  const [boothFilter, setBoothFilter] = useState<string>("all")
  const [flagFilter, setFlagFilter] = useState<string>("all")
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(0)
  const [selectedVoter, setSelectedVoter] = useState<VoterActivity | null>(null)

  const filtered = useMemo(() => {
    return voterActivities.filter((v) => {
      const matchesBooth = boothFilter === "all" || v.boothId === boothFilter
      const matchesFlag =
        flagFilter === "all"
          ? true
          : flagFilter === "flagged"
            ? v.flag !== null
            : flagFilter === "clean"
              ? v.flag === null
              : v.flag === flagFilter
      const matchesSearch =
        search === "" ||
        v.voterId.toLowerCase().includes(search.toLowerCase()) ||
        v.id.toLowerCase().includes(search.toLowerCase()) ||
        v.boothId.toLowerCase().includes(search.toLowerCase())
      return matchesBooth && matchesFlag && matchesSearch
    })
  }, [boothFilter, flagFilter, search])

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE)
  const paged = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE)

  // KPI stats
  const totalEntries = voterActivities.length
  const flaggedEntries = voterActivities.filter((v) => v.flag !== null).length
  const outsideGeofence = voterActivities.filter(
    (v) => v.geofenceStatus === "outside"
  ).length
  const duplicateEntries = voterActivities.filter(
    (v) => v.flag === "duplicate"
  ).length

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          Booth Voter Activity
        </h1>
        <p className="text-sm text-muted-foreground">
          Secure voter activity log with geolocation verification and suspicious
          entry detection
        </p>
        <Badge
          variant="outline"
          className="mt-2 gap-1.5 border-warning/30 bg-warning/5 text-warning"
        >
          <ShieldAlert className="h-3 w-3" />
          Restricted Access -- Authorized Officials Only
        </Badge>
      </div>

      {/* KPIs */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          title="Total Entries"
          value={totalEntries}
          subtitle={`Across ${activityBooths.length} booths`}
          icon={Users}
          variant="default"
        />
        <KpiCard
          title="Flagged Entries"
          value={flaggedEntries}
          subtitle={`${((flaggedEntries / totalEntries) * 100).toFixed(1)}% of total`}
          icon={ShieldAlert}
          variant="destructive"
        />
        <KpiCard
          title="Outside Geofence"
          value={outsideGeofence}
          subtitle="Location violations detected"
          icon={MapPinOff}
          variant="warning"
        />
        <KpiCard
          title="Duplicate Attempts"
          value={duplicateEntries}
          subtitle="Same voter ID re-entries"
          icon={Copy}
          variant="destructive"
        />
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="flex flex-wrap items-center gap-3 p-4">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search voter ID, entry ID, booth..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                setPage(0)
              }}
              className="pl-9"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />

            {/* Booth selector */}
            <Select
              value={boothFilter}
              onValueChange={(v) => {
                setBoothFilter(v)
                setPage(0)
              }}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select Booth" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Booths</SelectItem>
                {activityBooths.map((b) => (
                  <SelectItem key={b.id} value={b.id}>
                    {b.id} - {b.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Flag filter */}
            <Select
              value={flagFilter}
              onValueChange={(v) => {
                setFlagFilter(v)
                setPage(0)
              }}
            >
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Flag Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Entries</SelectItem>
                <SelectItem value="flagged">Flagged Only</SelectItem>
                <SelectItem value="clean">Clean Only</SelectItem>
                <SelectItem value="duplicate">Duplicate</SelectItem>
                <SelectItem value="outside_geofence">Outside Geofence</SelectItem>
                <SelectItem value="rapid_entry">Rapid Entry</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Voter Log Table */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center justify-between text-sm font-medium text-muted-foreground">
            <span className="flex items-center gap-2">
              <ScanEye className="h-4 w-4" />
              {filtered.length} entr{filtered.length !== 1 ? "ies" : "y"} found
            </span>
            <span className="font-mono text-xs">
              Page {page + 1} of {totalPages || 1}
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="px-0 pb-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="text-xs">Time</TableHead>
                  <TableHead className="text-xs">Voter ID</TableHead>
                  <TableHead className="text-xs">Booth</TableHead>
                  <TableHead className="text-xs">Image</TableHead>
                  <TableHead className="text-xs">Location</TableHead>
                  <TableHead className="text-xs">Flags</TableHead>
                  <TableHead className="w-10 text-xs">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paged.map((entry) => (
                  <TableRow
                    key={entry.id}
                    className={
                      entry.flag !== null
                        ? "bg-destructive/[0.03] hover:bg-destructive/[0.06]"
                        : "group"
                    }
                  >
                    <TableCell className="text-xs text-muted-foreground">
                      <div className="flex items-center gap-1.5">
                        <Clock className="h-3 w-3" />
                        {format(new Date(entry.timestamp), "HH:mm:ss")}
                      </div>
                      <span className="block text-[10px] text-muted-foreground/70">
                        {format(new Date(entry.timestamp), "dd MMM yyyy")}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="font-mono text-sm font-medium text-foreground">
                        {entry.voterId}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div>
                        <span className="font-mono text-xs text-foreground">
                          {entry.boothId}
                        </span>
                        <span className="block text-[10px] text-muted-foreground">
                          {entry.boothName}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex h-9 w-9 items-center justify-center rounded-md border border-border bg-muted/50">
                        <Users className="h-4 w-4 text-muted-foreground" />
                      </div>
                    </TableCell>
                    <TableCell>
                      <GeofenceBadge status={entry.geofenceStatus} />
                    </TableCell>
                    <TableCell>
                      {entry.flag ? (
                        <VoterFlagBadge flag={entry.flag} />
                      ) : (
                        <Badge
                          variant="outline"
                          className="gap-1 bg-success/10 font-medium text-success border-success/20 hover:bg-success/10"
                        >
                          <CheckCircle2 className="h-3 w-3" />
                          Clean
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => setSelectedVoter(entry)}
                        aria-label={`View details for voter ${entry.voterId}`}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {paged.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="py-12 text-center text-sm text-muted-foreground"
                    >
                      No entries match the current filters
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between border-t border-border px-4 py-3">
            <Button
              variant="outline"
              size="sm"
              disabled={page === 0}
              onClick={() => setPage((p) => p - 1)}
            >
              Previous
            </Button>
            <div className="flex items-center gap-1">
              {Array.from(
                { length: Math.min(totalPages, 5) },
                (_, i) => {
                  const pageNum =
                    totalPages <= 5
                      ? i
                      : page < 3
                        ? i
                        : page > totalPages - 4
                          ? totalPages - 5 + i
                          : page - 2 + i
                  return (
                    <Button
                      key={pageNum}
                      variant={page === pageNum ? "default" : "ghost"}
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={() => setPage(pageNum)}
                    >
                      {pageNum + 1}
                    </Button>
                  )
                }
              )}
            </div>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages - 1}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Detail Dialog */}
      <Dialog
        open={selectedVoter !== null}
        onOpenChange={(open) => !open && setSelectedVoter(null)}
      >
        <DialogContent className="max-w-lg">
          {selectedVoter && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <ScanEye className="h-5 w-5 text-primary" />
                  Voter Entry Detail
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-5">
                {/* Entry ID & Timestamp */}
                <div className="flex items-center justify-between rounded-lg border border-border bg-muted/30 p-3">
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                      Entry ID
                    </p>
                    <p className="font-mono text-sm font-medium text-foreground">
                      {selectedVoter.id}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                      Timestamp
                    </p>
                    <p className="font-mono text-sm text-foreground">
                      {format(
                        new Date(selectedVoter.timestamp),
                        "dd MMM yyyy, HH:mm:ss"
                      )}
                    </p>
                  </div>
                </div>

                {/* Voter & Booth */}
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1">
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                      Voter ID (Masked)
                    </p>
                    <p className="font-mono text-lg font-bold text-foreground">
                      {selectedVoter.voterId}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                      Booth
                    </p>
                    <p className="text-sm font-medium text-foreground">
                      {selectedVoter.boothId}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {selectedVoter.boothName}
                    </p>
                  </div>
                </div>

                <Separator />

                {/* Image placeholder */}
                <div className="space-y-2">
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                    Captured Image
                  </p>
                  <div className="flex h-40 items-center justify-center rounded-lg border border-dashed border-border bg-muted/30">
                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                      <Users className="h-10 w-10" />
                      <span className="text-xs">
                        Encrypted image -- access restricted
                      </span>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Map / Location */}
                <div className="space-y-2">
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                    Location Pin
                  </p>
                  <div className="relative flex h-32 items-center justify-center overflow-hidden rounded-lg border border-border bg-muted/30">
                    <div className="flex flex-col items-center gap-1.5 text-muted-foreground">
                      <MapPin className="h-8 w-8 text-primary" />
                      <p className="font-mono text-xs text-foreground">
                        {selectedVoter.latitude.toFixed(6)},{" "}
                        {selectedVoter.longitude.toFixed(6)}
                      </p>
                    </div>
                    {/* Grid decoration */}
                    <div className="pointer-events-none absolute inset-0 opacity-[0.03]">
                      <div
                        className="h-full w-full"
                        style={{
                          backgroundImage:
                            "linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)",
                          backgroundSize: "24px 24px",
                        }}
                      />
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Verification Status */}
                <div className="flex flex-wrap items-center gap-3">
                  <div className="space-y-1">
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                      Geofence
                    </p>
                    <GeofenceBadge status={selectedVoter.geofenceStatus} />
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                      Flag Status
                    </p>
                    {selectedVoter.flag ? (
                      <VoterFlagBadge flag={selectedVoter.flag} />
                    ) : (
                      <Badge
                        variant="outline"
                        className="gap-1 bg-success/10 font-medium text-success border-success/20 hover:bg-success/10"
                      >
                        <CheckCircle2 className="h-3 w-3" />
                        Clean
                      </Badge>
                    )}
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                      Verification
                    </p>
                    {selectedVoter.verified ? (
                      <Badge
                        variant="outline"
                        className="gap-1 bg-success/10 font-medium text-success border-success/20 hover:bg-success/10"
                      >
                        <CheckCircle2 className="h-3 w-3" />
                        Verified
                      </Badge>
                    ) : (
                      <Badge
                        variant="outline"
                        className="gap-1 bg-destructive/10 font-medium text-destructive border-destructive/20 hover:bg-destructive/10"
                      >
                        <XCircle className="h-3 w-3" />
                        Unverified
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Suspicious activity callout */}
                {selectedVoter.flag && (
                  <div className="flex items-start gap-3 rounded-lg border border-destructive/20 bg-destructive/5 p-3">
                    <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
                    <div className="space-y-0.5">
                      <p className="text-sm font-medium text-destructive">
                        Suspicious Activity Detected
                      </p>
                      <p className="text-xs text-destructive/80">
                        {selectedVoter.flag === "duplicate" &&
                          "This voter ID has been recorded multiple times. Possible duplicate voting attempt."}
                        {selectedVoter.flag === "outside_geofence" &&
                          "This entry was recorded outside the designated booth radius. Location violation flagged."}
                        {selectedVoter.flag === "rapid_entry" &&
                          "This entry was recorded unusually quickly after a previous entry. Potential automated submission."}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
