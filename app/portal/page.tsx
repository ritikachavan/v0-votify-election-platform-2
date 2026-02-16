"use client"

import { useState } from "react"
import {
  ShieldCheck,
  Vote,
  MapPin,
  TrendingUp,
  Search,
  CheckCircle2,
  XCircle,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  kpiStats,
  candidates,
  regionStats,
  ledgerRecords,
  stateStats,
} from "@/lib/mock-data"
import { formatNumber } from "@/lib/format"

export default function PublicPortalPage() {
  const [verifyInput, setVerifyInput] = useState("")
  const [verifyResult, setVerifyResult] = useState<
    "idle" | "verified" | "not-found"
  >("idle")

  function handleVerify() {
    if (!verifyInput.trim()) return
    const q = verifyInput.toLowerCase().trim()
    const found = ledgerRecords.find(
      (r) =>
        r.id.toLowerCase() === q ||
        r.hash.toLowerCase() === q ||
        r.hash.toLowerCase().startsWith(q)
    )
    setVerifyResult(found?.verified ? "verified" : "not-found")
  }

  return (
    <div className="space-y-8">
      {/* Hero */}
      <div className="text-center">
        <Badge
          variant="outline"
          className="mb-4 gap-1.5 bg-success/10 text-success border-success/20 hover:bg-success/10"
        >
          <ShieldCheck className="h-3 w-3" />
          Data Verified
        </Badge>
        <h1 className="text-balance text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          Election Results 2026
        </h1>
        <p className="mx-auto mt-2 max-w-lg text-sm text-muted-foreground leading-relaxed">
          Transparent, tamper-proof election data accessible to every citizen.
          All records are cryptographically verified.
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="flex items-center gap-3 p-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Vote className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Total Votes
              </p>
              <p className="font-mono text-2xl font-bold tabular-nums text-card-foreground">
                {formatNumber(kpiStats.totalVotes)}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-3 p-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success/10">
              <MapPin className="h-5 w-5 text-success" />
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Active Booths
              </p>
              <p className="font-mono text-2xl font-bold tabular-nums text-card-foreground">
                {kpiStats.activeBooths}
                <span className="text-base font-normal text-muted-foreground">
                  /{kpiStats.totalBooths}
                </span>
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-3 p-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <TrendingUp className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Turnout
              </p>
              <p className="font-mono text-2xl font-bold tabular-nums text-card-foreground">
                {kpiStats.turnoutPercentage}%
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Candidate Results */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Candidate Results
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {candidates.map((candidate, index) => (
            <div key={candidate.id} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="h-3 w-3 rounded-full"
                    style={{ backgroundColor: candidate.partyColor }}
                  />
                  <div>
                    <span className="text-sm font-medium text-card-foreground">
                      {candidate.name}
                    </span>
                    <span className="ml-2 text-xs text-muted-foreground">
                      {candidate.party}
                    </span>
                  </div>
                  {index === 0 && (
                    <Badge className="bg-primary/10 text-primary border-primary/20 hover:bg-primary/10">
                      Leading
                    </Badge>
                  )}
                </div>
                <div className="text-right">
                  <span className="font-mono text-sm font-bold tabular-nums text-card-foreground">
                    {formatNumber(candidate.votes)}
                  </span>
                  <span className="ml-2 font-mono text-xs text-muted-foreground">
                    ({candidate.percentage}%)
                  </span>
                </div>
              </div>
              <Progress
                value={candidate.percentage}
                className="h-2"
              />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* State Results Grid */}
      <div>
        <h2 className="mb-4 text-sm font-medium text-muted-foreground">
          State-wise Turnout
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {stateStats.map((state) => (
            <Card key={state.name}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium text-card-foreground">
                    {state.name}
                  </h3>
                  <span className="font-mono text-xs text-muted-foreground">
                    {state.activeBooths}/{state.totalBooths} booths
                  </span>
                </div>
                <div className="mt-3 flex items-center gap-3">
                  <Progress value={state.turnoutPercentage} className="h-2 flex-1" />
                  <span className="font-mono text-sm font-bold tabular-nums text-card-foreground">
                    {state.turnoutPercentage}%
                  </span>
                </div>
                <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
                  <span>
                    {formatNumber(state.totalVotes)} votes
                  </span>
                  {state.highRiskBooths > 0 && (
                    <Badge
                      variant="outline"
                      className="bg-destructive/10 text-destructive border-destructive/20 text-[10px] hover:bg-destructive/10"
                    >
                      {state.highRiskBooths} high risk
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Data Integrity Checker */}
      <Card className="border-primary/20">
        <CardHeader>
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-primary" />
            <CardTitle className="text-base font-semibold text-card-foreground">
              Data Integrity Checker
            </CardTitle>
          </div>
          <p className="text-xs text-muted-foreground">
            Verify any record by entering its Record ID or Hash
          </p>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Enter Record ID (e.g. REC-00001) or Hash..."
                value={verifyInput}
                onChange={(e) => {
                  setVerifyInput(e.target.value)
                  setVerifyResult("idle")
                }}
                onKeyDown={(e) => e.key === "Enter" && handleVerify()}
                className="pl-9 font-mono text-sm"
              />
            </div>
            <Button onClick={handleVerify}>Verify</Button>
          </div>

          {verifyResult === "verified" && (
            <div className="flex items-center gap-2 rounded-lg border border-success/30 bg-success/5 p-3">
              <CheckCircle2 className="h-5 w-5 text-success" />
              <div>
                <p className="text-sm font-medium text-success">
                  Record Verified
                </p>
                <p className="text-xs text-muted-foreground">
                  This record exists in the tamper-proof ledger and has been
                  cryptographically verified.
                </p>
              </div>
            </div>
          )}

          {verifyResult === "not-found" && (
            <div className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/5 p-3">
              <XCircle className="h-5 w-5 text-destructive" />
              <div>
                <p className="text-sm font-medium text-destructive">
                  Record Not Found
                </p>
                <p className="text-xs text-muted-foreground">
                  No matching record found in the ledger. Please check the ID or
                  hash and try again.
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
