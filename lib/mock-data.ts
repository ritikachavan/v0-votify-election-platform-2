// =============================================================================
// Votify - Comprehensive Election Mock Data (Deterministic / SSR-safe)
// =============================================================================

// -- Seeded PRNG (Mulberry32) – same output on server & client ---------------
function createRng(seed: number) {
  let s = seed | 0
  return () => {
    s = (s + 0x6d2b79f5) | 0
    let t = Math.imul(s ^ (s >>> 15), 1 | s)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const rng = createRng(42) // fixed seed

// Fixed base timestamp (2026-02-16 10:00 UTC) so Date.now() is never called
const BASE_TS = Date.UTC(2026, 1, 16, 10, 0, 0)

// ---------------------------------------------------------------------------
export type BoothStatus = "online" | "offline" | "delayed"
export type RiskLevel = "low" | "medium" | "high"
export type AlertSeverity = "low" | "medium" | "high" | "critical"
export type AlertType = "anomaly" | "hardware" | "fraud" | "sync" | "integrity"

export interface Booth {
  id: string
  name: string
  region: string
  state: string
  district: string
  status: BoothStatus
  lastSync: string
  totalVotes: number
  expectedVotes: number
  riskLevel: RiskLevel
  latitude: number
  longitude: number
  officerName: string
  officerContact: string
}

export interface Candidate {
  id: string
  name: string
  party: string
  partyColor: string
  votes: number
  percentage: number
}

export interface HourlyVote {
  hour: string
  votes: number
  cumulative: number
}

export interface Alert {
  id: string
  type: AlertType
  severity: AlertSeverity
  boothId: string
  boothName: string
  region: string
  timestamp: string
  title: string
  description: string
  resolved: boolean
  aiConfidence?: number
}

export interface LedgerRecord {
  id: string
  hash: string
  prevHash: string
  boothId: string
  boothName: string
  timestamp: string
  voteCount: number
  dataHash: string
  verified: boolean
  blockNumber: number
}

export interface RegionStats {
  name: string
  state: string
  totalBooths: number
  activeBooths: number
  totalVotes: number
  expectedVotes: number
  turnoutPercentage: number
  leadingCandidate: string
  leadingParty: string
}

export interface BoothLog {
  id: string
  timestamp: string
  action: string
  details: string
  type: "vote" | "sync" | "alert" | "system"
}

// -- States & Regions --------------------------------------------------------
const states = [
  "Maharashtra",
  "Karnataka",
  "Tamil Nadu",
  "Uttar Pradesh",
  "Gujarat",
]

const regions: Record<string, string[]> = {
  Maharashtra: ["Mumbai North", "Mumbai South", "Pune", "Nagpur", "Nashik"],
  Karnataka: ["Bengaluru Urban", "Bengaluru Rural", "Mysuru", "Mangalore", "Hubli"],
  "Tamil Nadu": ["Chennai North", "Chennai South", "Coimbatore", "Madurai", "Salem"],
  "Uttar Pradesh": ["Lucknow", "Varanasi", "Noida", "Agra", "Kanpur"],
  Gujarat: ["Ahmedabad", "Surat", "Vadodara", "Rajkot", "Gandhinagar"],
}

// -- Candidates --------------------------------------------------------------
export const candidates: Candidate[] = [
  { id: "c1", name: "Arvind Sharma", party: "National Democratic Alliance", partyColor: "hsl(217, 91%, 60%)", votes: 1248760, percentage: 34.2 },
  { id: "c2", name: "Priya Mehta", party: "United Progressive Front", partyColor: "hsl(160, 84%, 39%)", votes: 1102340, percentage: 30.2 },
  { id: "c3", name: "Rajesh Kumar", party: "People's Reform Party", partyColor: "hsl(38, 92%, 50%)", votes: 724560, percentage: 19.8 },
  { id: "c4", name: "Sunita Desai", party: "Independent Alliance", partyColor: "hsl(340, 75%, 55%)", votes: 389120, percentage: 10.7 },
  { id: "c5", name: "Others", party: "Various", partyColor: "hsl(215, 16%, 47%)", votes: 186430, percentage: 5.1 },
]

// -- Booths ------------------------------------------------------------------
function generateBooths(): Booth[] {
  const booths: Booth[] = []
  let boothNum = 1

  for (const state of states) {
    for (const region of regions[state]) {
      const count = 2 + Math.floor(rng() * 2) // 2-3 booths per region
      for (let i = 0; i < count; i++) {
        const statusRoll = rng()
        const status: BoothStatus =
          statusRoll > 0.15 ? "online" : statusRoll > 0.05 ? "delayed" : "offline"
        const riskRoll = rng()
        const riskLevel: RiskLevel =
          riskRoll > 0.2 ? "low" : riskRoll > 0.07 ? "medium" : "high"
        const totalVotes = 800 + Math.floor(rng() * 1600)
        const expectedVotes = 2000 + Math.floor(rng() * 1000)

        const minutesAgo =
          status === "online"
            ? Math.floor(rng() * 5)
            : status === "delayed"
              ? 15 + Math.floor(rng() * 30)
              : 60 + Math.floor(rng() * 120)

        const syncDate = new Date(BASE_TS - minutesAgo * 60 * 1000)

        booths.push({
          id: `BTH-${String(boothNum).padStart(4, "0")}`,
          name: `${region} Booth ${i + 1}`,
          region,
          state,
          district: region,
          status,
          lastSync: syncDate.toISOString(),
          totalVotes,
          expectedVotes,
          riskLevel,
          latitude: 8 + rng() * 28,
          longitude: 68 + rng() * 29,
          officerName: `Officer ${boothNum}`,
          officerContact: `+91 98765 ${String(10000 + boothNum).slice(1)}`,
        })
        boothNum++
      }
    }
  }
  return booths
}

export const booths: Booth[] = generateBooths()

// -- Hourly Vote Trend -------------------------------------------------------
export const hourlyVoteTrend: HourlyVote[] = (() => {
  const hours = [
    "07:00", "08:00", "09:00", "10:00", "11:00", "12:00",
    "13:00", "14:00", "15:00", "16:00", "17:00", "18:00",
  ]
  let cumulative = 0
  return hours.map((hour) => {
    const baseVotes =
      hour === "07:00" ? 45000 :
      hour === "08:00" ? 120000 :
      hour === "09:00" ? 280000 :
      hour === "10:00" ? 380000 :
      hour === "11:00" ? 420000 :
      hour === "12:00" ? 310000 :
      hour === "13:00" ? 250000 :
      hour === "14:00" ? 340000 :
      hour === "15:00" ? 380000 :
      hour === "16:00" ? 350000 :
      hour === "17:00" ? 290000 :
      180000
    const votes = baseVotes + Math.floor(rng() * 40000 - 20000)
    cumulative += votes
    return { hour, votes, cumulative }
  })
})()

// -- Alerts ------------------------------------------------------------------
export const alerts: Alert[] = [
  {
    id: "ALT-001",
    type: "fraud",
    severity: "critical",
    boothId: "BTH-0003",
    boothName: "Pune Booth 1",
    region: "Pune",
    timestamp: new Date(BASE_TS - 8 * 60 * 1000).toISOString(),
    title: "Unusual Vote Spike Detected",
    description: "AI detected 340% vote increase in 15-min window. Pattern consistent with ballot stuffing. Immediate review recommended.",
    resolved: false,
    aiConfidence: 94.2,
  },
  {
    id: "ALT-002",
    type: "hardware",
    severity: "high",
    boothId: "BTH-0012",
    boothName: "Varanasi Booth 2",
    region: "Varanasi",
    timestamp: new Date(BASE_TS - 22 * 60 * 1000).toISOString(),
    title: "EVM Communication Lost",
    description: "Electronic Voting Machine has not responded for 18 minutes. Hardware failure or tampering suspected.",
    resolved: false,
  },
  {
    id: "ALT-003",
    type: "anomaly",
    severity: "high",
    boothId: "BTH-0007",
    boothName: "Chennai North Booth 1",
    region: "Chennai North",
    timestamp: new Date(BASE_TS - 35 * 60 * 1000).toISOString(),
    title: "Statistical Deviation in Vote Pattern",
    description: "Vote distribution deviates 3.2 std deviations from regional average. Benford's Law analysis flagged anomaly.",
    resolved: false,
    aiConfidence: 87.1,
  },
  {
    id: "ALT-004",
    type: "sync",
    severity: "medium",
    boothId: "BTH-0019",
    boothName: "Ahmedabad Booth 1",
    region: "Ahmedabad",
    timestamp: new Date(BASE_TS - 45 * 60 * 1000).toISOString(),
    title: "Data Sync Delay",
    description: "Booth data synchronization delayed by 42 minutes. Network connectivity intermittent.",
    resolved: false,
  },
  {
    id: "ALT-005",
    type: "integrity",
    severity: "medium",
    boothId: "BTH-0025",
    boothName: "Mysuru Booth 2",
    region: "Mysuru",
    timestamp: new Date(BASE_TS - 62 * 60 * 1000).toISOString(),
    title: "Hash Chain Inconsistency",
    description: "Ledger record hash does not match expected chain. Data re-verification in progress.",
    resolved: false,
  },
  {
    id: "ALT-006",
    type: "anomaly",
    severity: "low",
    boothId: "BTH-0031",
    boothName: "Coimbatore Booth 1",
    region: "Coimbatore",
    timestamp: new Date(BASE_TS - 90 * 60 * 1000).toISOString(),
    title: "Minor Turnout Fluctuation",
    description: "Slight above-average turnout detected in early morning hours. Within acceptable threshold.",
    resolved: true,
    aiConfidence: 42.5,
  },
  {
    id: "ALT-007",
    type: "hardware",
    severity: "low",
    boothId: "BTH-0038",
    boothName: "Surat Booth 2",
    region: "Surat",
    timestamp: new Date(BASE_TS - 120 * 60 * 1000).toISOString(),
    title: "Printer Malfunction",
    description: "VVPAT printer reported paper jam. Resolved by on-site engineer.",
    resolved: true,
  },
  {
    id: "ALT-008",
    type: "fraud",
    severity: "high",
    boothId: "BTH-0042",
    boothName: "Noida Booth 1",
    region: "Noida",
    timestamp: new Date(BASE_TS - 15 * 60 * 1000).toISOString(),
    title: "Duplicate Voter ID Attempt",
    description: "Multiple voting attempts detected using the same voter ID within 10-minute window. Biometric mismatch flagged.",
    resolved: false,
    aiConfidence: 91.8,
  },
  {
    id: "ALT-009",
    type: "sync",
    severity: "medium",
    boothId: "BTH-0015",
    boothName: "Lucknow Booth 1",
    region: "Lucknow",
    timestamp: new Date(BASE_TS - 55 * 60 * 1000).toISOString(),
    title: "Intermittent Connectivity",
    description: "Booth experiencing periodic network drops. Data batching enabled for resilience.",
    resolved: false,
  },
  {
    id: "ALT-010",
    type: "integrity",
    severity: "critical",
    boothId: "BTH-0008",
    boothName: "Chennai South Booth 1",
    region: "Chennai South",
    timestamp: new Date(BASE_TS - 5 * 60 * 1000).toISOString(),
    title: "Ledger Tampering Suspected",
    description: "Multiple consecutive hash chain breaks detected. Possible data manipulation. Forensic audit initiated.",
    resolved: false,
    aiConfidence: 96.7,
  },
]

// -- Ledger Records ----------------------------------------------------------
function generateLedgerRecords(): LedgerRecord[] {
  const records: LedgerRecord[] = []
  let prevHash = "0000000000000000000000000000000000000000000000000000000000000000"

  for (let i = 0; i < 40; i++) {
    const boothIndex = i % booths.length
    const booth = booths[boothIndex]
    const ts = new Date(BASE_TS - (40 - i) * 3 * 60 * 1000)
    const voteCount = 10 + Math.floor(rng() * 30)

    const hash = generateHash(i)
    const dataHash = generateHash(i + 1000)
    const verified = rng() > 0.05 // 95% verified

    records.push({
      id: `REC-${String(i + 1).padStart(5, "0")}`,
      hash,
      prevHash,
      boothId: booth.id,
      boothName: booth.name,
      timestamp: ts.toISOString(),
      voteCount,
      dataHash,
      verified,
      blockNumber: i + 1,
    })

    prevHash = hash
  }
  return records
}

function generateHash(seed: number): string {
  const chars = "0123456789abcdef"
  let hash = ""
  let s = seed * 2654435761
  for (let i = 0; i < 64; i++) {
    s = ((s * 16807) + 12345) & 0x7fffffff
    hash += chars[s % 16]
  }
  return hash
}

export const ledgerRecords: LedgerRecord[] = generateLedgerRecords()

// -- Region Stats ------------------------------------------------------------
export const regionStats: RegionStats[] = (() => {
  // Use deterministic assignment – cycle through top 3 candidates per region
  let idx = 0
  return states.flatMap((state) =>
    regions[state].map((region) => {
      const regionBooths = booths.filter((b) => b.region === region)
      const totalVotes = regionBooths.reduce((s, b) => s + b.totalVotes, 0)
      const expectedVotes = regionBooths.reduce((s, b) => s + b.expectedVotes, 0)
      const activeBooths = regionBooths.filter((b) => b.status === "online").length
      const cIdx = idx % 3
      idx++

      return {
        name: region,
        state,
        totalBooths: regionBooths.length,
        activeBooths,
        totalVotes,
        expectedVotes,
        turnoutPercentage: Math.round((totalVotes / expectedVotes) * 100),
        leadingCandidate: candidates[cIdx].name,
        leadingParty: candidates[cIdx].party,
      }
    })
  )
})()

// -- Booth Logs (for detail page) – deterministic ----------------------------
export function generateBoothLogs(boothId: string): BoothLog[] {
  const logs: BoothLog[] = []
  const types: BoothLog["type"][] = ["vote", "sync", "system", "vote", "vote", "sync"]

  const actions: Record<string, string[]> = {
    vote: ["Batch recorded", "Vote verified", "VVPAT confirmed"],
    sync: ["Data synced to server", "Acknowledgment received", "Checkpoint created"],
    alert: ["Anomaly flagged", "Alert generated"],
    system: ["Health check passed", "Integrity verified", "Connection stable"],
  }

  const seed = parseInt(boothId.replace(/\D/g, ""), 10) || 1

  for (let i = 0; i < 25; i++) {
    const ts = new Date(BASE_TS - (25 - i) * 7 * 60 * 1000)
    const type = types[i % types.length]
    const actionList = actions[type]
    // Deterministic action pick based on seed + index
    const action = actionList[(seed + i) % actionList.length]

    logs.push({
      id: `LOG-${boothId}-${String(i + 1).padStart(3, "0")}`,
      timestamp: ts.toISOString(),
      action,
      details: `${action} for booth ${boothId} at ${ts.toISOString().slice(11, 19)}`,
      type,
    })
  }
  return logs
}

// -- Hourly votes for a specific booth (for detail chart) -------------------
export function generateBoothHourlyVotes(boothId: string): HourlyVote[] {
  const hours = [
    "07:00", "08:00", "09:00", "10:00", "11:00", "12:00",
    "13:00", "14:00", "15:00", "16:00", "17:00", "18:00",
  ]
  let cumulative = 0
  const seed = parseInt(boothId.replace(/\D/g, ""), 10) || 1

  return hours.map((hour, i) => {
    const base = [20, 65, 140, 190, 210, 155, 125, 170, 190, 175, 145, 90]
    const votes = base[i] + Math.floor((seed * (i + 1) * 7) % 60) - 30
    cumulative += Math.max(votes, 10)
    return { hour, votes: Math.max(votes, 10), cumulative }
  })
}

// -- Summary KPI stats -------------------------------------------------------
export const kpiStats = {
  totalVotes: candidates.reduce((s, c) => s + c.votes, 0),
  activeBooths: booths.filter((b) => b.status === "online").length,
  totalBooths: booths.length,
  alertsCount: alerts.filter((a) => !a.resolved).length,
  criticalAlerts: alerts.filter((a) => a.severity === "critical" && !a.resolved).length,
  turnoutPercentage: Math.round(
    (candidates.reduce((s, c) => s + c.votes, 0) /
      booths.reduce((s, b) => s + b.expectedVotes, 0)) *
      100
  ),
  verifiedRecords: ledgerRecords.filter((r) => r.verified).length,
  totalRecords: ledgerRecords.length,
}

// -- Voter Activity (for Booth Activity module) ----------------------------
export type GeofenceStatus = "inside" | "outside"
export type VoterFlag = "duplicate" | "outside_geofence" | "rapid_entry" | null

export interface VoterActivity {
  id: string
  voterId: string       // masked: ****1234
  boothId: string
  boothName: string
  timestamp: string
  imageUrl: string
  latitude: number
  longitude: number
  geofenceStatus: GeofenceStatus
  flag: VoterFlag
  verified: boolean
}

function generateVoterActivities(): VoterActivity[] {
  const activityRng = createRng(999) // separate seed for this dataset
  const entries: VoterActivity[] = []
  const usedVoterIds = new Set<string>()
  let entryNum = 1

  // Generate 8 booths worth of activity (first 8 booths)
  const targetBooths = booths.slice(0, 8)

  for (const booth of targetBooths) {
    const count = 12 + Math.floor(activityRng() * 8) // 12-19 entries per booth

    for (let i = 0; i < count; i++) {
      const ts = new Date(BASE_TS - Math.floor(activityRng() * 360) * 60 * 1000)

      // Generate a 4-digit suffix
      const suffix = String(1000 + Math.floor(activityRng() * 9000))
      let voterId = `****${suffix}`

      // 5% chance of duplicate voter (suspicious)
      let flag: VoterFlag = null
      if (activityRng() < 0.05 && usedVoterIds.size > 0) {
        const arr = Array.from(usedVoterIds)
        voterId = arr[Math.floor(activityRng() * arr.length)]
        flag = "duplicate"
      }
      usedVoterIds.add(voterId)

      // Location based on booth + small offset
      const lat = booth.latitude + (activityRng() - 0.5) * 0.01
      const lng = booth.longitude + (activityRng() - 0.5) * 0.01

      // 8% chance outside geofence
      let geofenceStatus: GeofenceStatus = "inside"
      if (flag !== "duplicate" && activityRng() < 0.08) {
        geofenceStatus = "outside"
        flag = "outside_geofence"
      }

      // 4% chance of rapid entry
      if (flag === null && activityRng() < 0.04) {
        flag = "rapid_entry"
      }

      entries.push({
        id: `VA-${String(entryNum).padStart(5, "0")}`,
        voterId,
        boothId: booth.id,
        boothName: booth.name,
        timestamp: ts.toISOString(),
        imageUrl: `/api/placeholder/${60 + Math.floor(activityRng() * 4)}`,
        latitude: lat,
        longitude: lng,
        geofenceStatus,
        flag,
        verified: flag === null,
      })
      entryNum++
    }
  }

  // sort by timestamp desc
  entries.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
  return entries
}

export const voterActivities: VoterActivity[] = generateVoterActivities()

// Booths that have voter activity data
export const activityBooths = [...new Set(voterActivities.map((v) => v.boothId))].map(
  (id) => booths.find((b) => b.id === id)!
)

// -- State-level stats (for heatmap) ----------------------------------------
export const stateStats = states.map((state) => {
  const stateBooths = booths.filter((b) => b.state === state)
  const totalVotes = stateBooths.reduce((s, b) => s + b.totalVotes, 0)
  const expectedVotes = stateBooths.reduce((s, b) => s + b.expectedVotes, 0)
  const activeBooths = stateBooths.filter((b) => b.status === "online").length

  return {
    name: state,
    totalBooths: stateBooths.length,
    activeBooths,
    totalVotes,
    expectedVotes,
    turnoutPercentage: Math.round((totalVotes / expectedVotes) * 100),
    highRiskBooths: stateBooths.filter((b) => b.riskLevel === "high").length,
    districts: regions[state],
  }
})
