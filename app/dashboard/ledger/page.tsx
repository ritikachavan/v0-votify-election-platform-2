"use client"

import { useState, useMemo } from "react"
import { Search, ShieldCheck, ShieldAlert, BookOpen } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { KpiCard } from "@/components/dashboard/kpi-card"
import { HashChainDisplay } from "@/components/dashboard/hash-chain-display"
import { ledgerRecords, kpiStats } from "@/lib/mock-data"

export default function LedgerPage() {
  const [search, setSearch] = useState("")

  const filtered = useMemo(() => {
    if (!search) return ledgerRecords.slice().reverse()
    const q = search.toLowerCase()
    return ledgerRecords
      .filter(
        (r) =>
          r.id.toLowerCase().includes(q) ||
          r.hash.toLowerCase().includes(q) ||
          r.boothId.toLowerCase().includes(q) ||
          r.boothName.toLowerCase().includes(q)
      )
      .reverse()
  }, [search])

  const unverifiedCount = ledgerRecords.filter((r) => !r.verified).length

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          Tamper-Proof Ledger
        </h1>
        <p className="text-sm text-muted-foreground">
          Blockchain-inspired immutable record chain for vote data integrity
        </p>
      </div>

      {/* KPI */}
      <div className="grid gap-4 sm:grid-cols-3">
        <KpiCard
          title="Total Records"
          value={kpiStats.totalRecords}
          subtitle="In the chain"
          icon={BookOpen}
        />
        <KpiCard
          title="Verified"
          value={kpiStats.verifiedRecords}
          subtitle={`${Math.round((kpiStats.verifiedRecords / kpiStats.totalRecords) * 100)}% integrity rate`}
          icon={ShieldCheck}
          variant="success"
        />
        <KpiCard
          title="Unverified"
          value={unverifiedCount}
          subtitle="Require review"
          icon={ShieldAlert}
          variant={unverifiedCount > 0 ? "destructive" : "success"}
        />
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by record ID, hash, or booth ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 font-mono text-sm"
            />
          </div>
        </CardContent>
      </Card>

      {/* Chain Display */}
      <div className="space-y-1">
        {filtered.slice(0, 20).map((record, index) => (
          <HashChainDisplay
            key={record.id}
            record={record}
            showChainLink={index > 0}
          />
        ))}
        {filtered.length === 0 && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <BookOpen className="h-8 w-8 text-muted-foreground" />
              <p className="mt-2 text-sm text-muted-foreground">
                No records match your search
              </p>
            </CardContent>
          </Card>
        )}
        {filtered.length > 20 && (
          <p className="text-center text-xs text-muted-foreground">
            Showing 20 of {filtered.length} records
          </p>
        )}
      </div>
    </div>
  )
}
