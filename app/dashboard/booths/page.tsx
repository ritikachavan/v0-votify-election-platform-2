"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import { Search, Filter, ChevronRight } from "lucide-react"
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
import { BoothStatusBadge } from "@/components/dashboard/booth-status-badge"
import { RiskBadge } from "@/components/dashboard/risk-badge"
import { booths } from "@/lib/mock-data"
import { formatNumber } from "@/lib/format"
import { format } from "date-fns"

const PAGE_SIZE = 12

export default function BoothsPage() {
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [riskFilter, setRiskFilter] = useState<string>("all")
  const [page, setPage] = useState(0)

  const filtered = useMemo(() => {
    return booths.filter((booth) => {
      const matchesSearch =
        search === "" ||
        booth.id.toLowerCase().includes(search.toLowerCase()) ||
        booth.name.toLowerCase().includes(search.toLowerCase()) ||
        booth.region.toLowerCase().includes(search.toLowerCase()) ||
        booth.state.toLowerCase().includes(search.toLowerCase())
      const matchesStatus =
        statusFilter === "all" || booth.status === statusFilter
      const matchesRisk = riskFilter === "all" || booth.riskLevel === riskFilter
      return matchesSearch && matchesStatus && matchesRisk
    })
  }, [search, statusFilter, riskFilter])

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE)
  const paged = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          Booth Monitoring
        </h1>
        <p className="text-sm text-muted-foreground">
          Monitor all polling booths across regions in real-time
        </p>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="flex flex-wrap items-center gap-3 p-4">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search booth ID, name, region..."
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
            <Select
              value={statusFilter}
              onValueChange={(v) => {
                setStatusFilter(v)
                setPage(0)
              }}
            >
              <SelectTrigger className="w-[130px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="online">Online</SelectItem>
                <SelectItem value="delayed">Delayed</SelectItem>
                <SelectItem value="offline">Offline</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={riskFilter}
              onValueChange={(v) => {
                setRiskFilter(v)
                setPage(0)
              }}
            >
              <SelectTrigger className="w-[130px]">
                <SelectValue placeholder="Risk" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Risk</SelectItem>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center justify-between text-sm font-medium text-muted-foreground">
            <span>
              {filtered.length} booth{filtered.length !== 1 ? "s" : ""} found
            </span>
            <span className="font-mono text-xs">
              Page {page + 1} of {totalPages}
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="px-0 pb-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="text-xs">Booth ID</TableHead>
                  <TableHead className="text-xs">Name</TableHead>
                  <TableHead className="text-xs">Region</TableHead>
                  <TableHead className="text-xs">Status</TableHead>
                  <TableHead className="text-xs">Last Sync</TableHead>
                  <TableHead className="text-right text-xs">Votes</TableHead>
                  <TableHead className="text-xs">Risk</TableHead>
                  <TableHead className="w-8"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paged.map((booth) => (
                  <TableRow key={booth.id} className="group">
                    <TableCell className="font-mono text-xs font-medium text-foreground">
                      {booth.id}
                    </TableCell>
                    <TableCell className="text-sm text-foreground">
                      {booth.name}
                    </TableCell>
                    <TableCell>
                      <div>
                        <span className="text-xs text-foreground">{booth.region}</span>
                        <span className="block text-[10px] text-muted-foreground">
                          {booth.state}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <BoothStatusBadge status={booth.status} />
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {format(new Date(booth.lastSync), "HH:mm:ss")}
                    </TableCell>
                    <TableCell className="text-right font-mono text-xs text-foreground">
                      {formatNumber(booth.totalVotes)}
                    </TableCell>
                    <TableCell>
                      <RiskBadge level={booth.riskLevel} />
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                        asChild
                      >
                        <Link href={`/dashboard/booths/${booth.id}`}>
                          <ChevronRight className="h-4 w-4" />
                          <span className="sr-only">View booth {booth.id}</span>
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
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
        </CardContent>
      </Card>
    </div>
  )
}
