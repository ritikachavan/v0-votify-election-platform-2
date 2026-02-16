"use client"

import { useState, useMemo } from "react"
import {
  Search,
  UserSearch,
  Users,
  CheckCircle2,
  XCircle,
  MapPin,
  Clock,
  Eye,
  X,
  CreditCard,
  User,
  Home,
  Vote,
  Calendar,
  Hash,
  ChevronRight,
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
import { BoothStatusBadge } from "@/components/dashboard/booth-status-badge"
import {
  voterRegistry,
  booths,
  type RegisteredVoter,
} from "@/lib/mock-data"
import { formatNumber } from "@/lib/format"
import { format } from "date-fns"

const PAGE_SIZE = 15
const allStates = [...new Set(voterRegistry.map((v) => v.state))]
const allDistricts = [...new Set(voterRegistry.map((v) => v.district))]

export default function VoterLookupPage() {
  const [search, setSearch] = useState("")
  const [stateFilter, setStateFilter] = useState<string>("all")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [boothFilter, setBoothFilter] = useState<string>("all")
  const [page, setPage] = useState(0)
  const [selectedVoter, setSelectedVoter] = useState<RegisteredVoter | null>(null)

  const filtered = useMemo(() => {
    return voterRegistry.filter((v) => {
      const matchSearch =
        search === "" ||
        v.name.toLowerCase().includes(search.toLowerCase()) ||
        v.voterId.toLowerCase().includes(search.toLowerCase()) ||
        v.epicNumber.toLowerCase().includes(search.toLowerCase()) ||
        v.boothId.toLowerCase().includes(search.toLowerCase()) ||
        v.boothName.toLowerCase().includes(search.toLowerCase()) ||
        v.id.toLowerCase().includes(search.toLowerCase())
      const matchState = stateFilter === "all" || v.state === stateFilter
      const matchStatus =
        statusFilter === "all" ||
        (statusFilter === "voted" && v.hasVoted) ||
        (statusFilter === "not_voted" && !v.hasVoted)
      const matchBooth = boothFilter === "all" || v.boothId === boothFilter
      return matchSearch && matchState && matchStatus && matchBooth
    })
  }, [search, stateFilter, statusFilter, boothFilter])

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE)
  const paged = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE)

  const totalRegistered = voterRegistry.length
  const totalVoted = voterRegistry.filter((v) => v.hasVoted).length
  const totalPending = totalRegistered - totalVoted
  const turnoutPct = Math.round((totalVoted / totalRegistered) * 100)

  const selectedBooth = selectedVoter
    ? booths.find((b) => b.id === selectedVoter.boothId)
    : null

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          Voter Lookup
        </h1>
        <p className="text-sm text-muted-foreground">
          Search and view complete voter registration details, assigned booth information, and voting status
        </p>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <KpiCard
          title="Registered Voters"
          value={formatNumber(totalRegistered)}
          subtitle="In system"
          icon={Users}
        />
        <KpiCard
          title="Votes Cast"
          value={formatNumber(totalVoted)}
          subtitle={`${turnoutPct}% turnout`}
          icon={CheckCircle2}
          variant="success"
        />
        <KpiCard
          title="Pending Voters"
          value={formatNumber(totalPending)}
          subtitle="Yet to vote"
          icon={Clock}
          variant="warning"
        />
        <KpiCard
          title="Booths Covered"
          value={String(booths.length)}
          subtitle="Across all states"
          icon={MapPin}
        />
      </div>

      {/* Search & Filters */}
      <Card>
        <CardContent className="flex flex-wrap items-center gap-3 p-4">
          <div className="relative flex-1 min-w-[240px]">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by name, voter ID, EPIC number, booth..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                setPage(0)
              }}
              className="pl-9"
            />
          </div>
          <Select
            value={stateFilter}
            onValueChange={(v) => {
              setStateFilter(v)
              setPage(0)
            }}
          >
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
          <Select
            value={statusFilter}
            onValueChange={(v) => {
              setStatusFilter(v)
              setPage(0)
            }}
          >
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Voters</SelectItem>
              <SelectItem value="voted">Voted</SelectItem>
              <SelectItem value="not_voted">Not Voted</SelectItem>
            </SelectContent>
          </Select>
          <Select
            value={boothFilter}
            onValueChange={(v) => {
              setBoothFilter(v)
              setPage(0)
            }}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Booth" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Booths</SelectItem>
              {booths.map((b) => (
                <SelectItem key={b.id} value={b.id}>
                  {b.id} - {b.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Voter Table */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center justify-between text-sm font-medium text-muted-foreground">
            <span>
              {formatNumber(filtered.length)} voter{filtered.length !== 1 ? "s" : ""} found
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
                  <TableHead className="text-xs">Sr. No</TableHead>
                  <TableHead className="text-xs">Name</TableHead>
                  <TableHead className="text-xs">Voter ID</TableHead>
                  <TableHead className="text-xs">State</TableHead>
                  <TableHead className="text-xs">Assigned Booth</TableHead>
                  <TableHead className="text-xs">Status</TableHead>
                  <TableHead className="text-xs">Vote Time</TableHead>
                  <TableHead className="w-8"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paged.map((voter) => (
                  <TableRow
                    key={voter.id}
                    className="group cursor-pointer"
                    onClick={() => setSelectedVoter(voter)}
                  >
                    <TableCell className="font-mono text-xs text-muted-foreground">
                      {voter.serialNumber}
                    </TableCell>
                    <TableCell>
                      <div>
                        <span className="text-sm font-medium text-foreground">{voter.name}</span>
                        <span className="block text-[10px] text-muted-foreground">
                          {voter.gender}, {voter.age} yrs
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-xs text-foreground">
                      {voter.epicNumber}
                    </TableCell>
                    <TableCell>
                      <div>
                        <span className="text-xs text-foreground">{voter.state}</span>
                        <span className="block text-[10px] text-muted-foreground">
                          {voter.district}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <span className="font-mono text-xs text-foreground">{voter.boothId}</span>
                        <span className="block text-[10px] text-muted-foreground truncate max-w-[150px]">
                          {voter.boothName}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {voter.hasVoted ? (
                        <Badge variant="outline" className="border-success/30 bg-success/10 text-success text-[10px] gap-1">
                          <CheckCircle2 className="h-3 w-3" />
                          Voted
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="border-muted-foreground/30 bg-muted text-muted-foreground text-[10px] gap-1">
                          <Clock className="h-3 w-3" />
                          Pending
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {voter.voteTimestamp
                        ? format(new Date(voter.voteTimestamp), "HH:mm")
                        : "--"}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={(e) => {
                          e.stopPropagation()
                          setSelectedVoter(voter)
                        }}
                      >
                        <Eye className="h-4 w-4" />
                        <span className="sr-only">View voter {voter.name}</span>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {paged.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={8} className="py-12 text-center">
                      <UserSearch className="mx-auto h-8 w-8 text-muted-foreground/40 mb-2" />
                      <p className="text-sm text-muted-foreground">No voters found matching your search criteria</p>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
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
                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
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
                })}
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
          )}
        </CardContent>
      </Card>

      {/* Voter Detail Modal */}
      <Dialog open={!!selectedVoter} onOpenChange={(open) => !open && setSelectedVoter(null)}>
        <DialogContent className="max-w-xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-foreground">
              <User className="h-5 w-5 text-primary" />
              Voter Details
            </DialogTitle>
          </DialogHeader>

          {selectedVoter && (
            <div className="space-y-5">
              {/* Name & Status Banner */}
              <div className="flex items-start justify-between rounded-lg border border-border bg-muted/30 p-4">
                <div className="space-y-1">
                  <h3 className="text-lg font-semibold text-foreground">{selectedVoter.name}</h3>
                  <p className="text-xs text-muted-foreground">
                    {selectedVoter.gender}, {selectedVoter.age} years
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {"S/D/W of "}{selectedVoter.fatherOrHusbandName}
                  </p>
                </div>
                {selectedVoter.hasVoted ? (
                  <Badge className="bg-success/15 text-success border-success/30 gap-1.5 px-3 py-1">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Vote Recorded
                  </Badge>
                ) : (
                  <Badge variant="outline" className="border-warning/30 bg-warning/10 text-warning gap-1.5 px-3 py-1">
                    <Clock className="h-3.5 w-3.5" />
                    Yet to Vote
                  </Badge>
                )}
              </div>

              {/* ID Details */}
              <div className="space-y-3">
                <h4 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Identification
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  <DetailRow icon={Hash} label="Serial Number" value={String(selectedVoter.serialNumber)} />
                  <DetailRow icon={CreditCard} label="EPIC Number" value={selectedVoter.epicNumber} mono />
                  <DetailRow icon={CreditCard} label="Voter ID" value={selectedVoter.voterId} mono />
                  <DetailRow icon={Hash} label="Registration ID" value={selectedVoter.id} mono />
                </div>
              </div>

              <Separator />

              {/* Address */}
              <div className="space-y-3">
                <h4 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Address & Constituency
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  <div className="col-span-2">
                    <DetailRow icon={Home} label="Address" value={selectedVoter.address} />
                  </div>
                  <DetailRow icon={MapPin} label="Constituency" value={selectedVoter.constituency} />
                  <DetailRow icon={MapPin} label="District" value={selectedVoter.district} />
                  <DetailRow icon={MapPin} label="State" value={selectedVoter.state} />
                </div>
              </div>

              <Separator />

              {/* Assigned Booth Info */}
              <div className="space-y-3">
                <h4 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Assigned Polling Booth
                </h4>
                <div className="rounded-lg border border-border bg-card p-3 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-foreground">{selectedVoter.boothName}</p>
                      <p className="font-mono text-xs text-muted-foreground">{selectedVoter.boothId}</p>
                    </div>
                    {selectedBooth && <BoothStatusBadge status={selectedBooth.status} />}
                  </div>
                  {selectedBooth && (
                    <>
                      <div className="grid grid-cols-3 gap-2">
                        <div className="rounded bg-muted/50 p-2 text-center">
                          <p className="font-mono text-sm font-semibold text-foreground">
                            {formatNumber(selectedBooth.totalVotes)}
                          </p>
                          <p className="text-[10px] text-muted-foreground">Votes Cast</p>
                        </div>
                        <div className="rounded bg-muted/50 p-2 text-center">
                          <p className="font-mono text-sm font-semibold text-foreground">
                            {formatNumber(selectedBooth.expectedVotes)}
                          </p>
                          <p className="text-[10px] text-muted-foreground">Expected</p>
                        </div>
                        <div className="rounded bg-muted/50 p-2 text-center">
                          <p className="font-mono text-sm font-semibold text-foreground">
                            {Math.round((selectedBooth.totalVotes / selectedBooth.expectedVotes) * 100)}%
                          </p>
                          <p className="text-[10px] text-muted-foreground">Turnout</p>
                        </div>
                      </div>
                      <Progress
                        value={(selectedBooth.totalVotes / selectedBooth.expectedVotes) * 100}
                        className="h-1.5"
                      />
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {selectedBooth.latitude.toFixed(4)}, {selectedBooth.longitude.toFixed(4)}
                        </span>
                        <span className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {selectedBooth.officerName}
                        </span>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Voting Record */}
              {selectedVoter.hasVoted && selectedVoter.voteTimestamp && (
                <>
                  <Separator />
                  <div className="space-y-3">
                    <h4 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      Voting Record
                    </h4>
                    <div className="rounded-lg border border-success/20 bg-success/5 p-3">
                      <div className="grid grid-cols-2 gap-3">
                        <DetailRow
                          icon={Calendar}
                          label="Date"
                          value={format(new Date(selectedVoter.voteTimestamp), "dd MMM yyyy")}
                        />
                        <DetailRow
                          icon={Clock}
                          label="Time"
                          value={format(new Date(selectedVoter.voteTimestamp), "HH:mm:ss")}
                        />
                        <DetailRow icon={MapPin} label="Booth" value={selectedVoter.boothId} mono />
                        <DetailRow icon={Vote} label="Verified" value="VVPAT Confirmed" />
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

function DetailRow({
  icon: Icon,
  label,
  value,
  mono = false,
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  value: string
  mono?: boolean
}) {
  return (
    <div className="flex items-start gap-2">
      <Icon className="h-3.5 w-3.5 mt-0.5 text-muted-foreground/70 shrink-0" />
      <div className="min-w-0">
        <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</p>
        <p className={`text-sm text-foreground truncate ${mono ? "font-mono" : ""}`}>{value}</p>
      </div>
    </div>
  )
}
