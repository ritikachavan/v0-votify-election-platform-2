// =============================================================================
// Votify - Comprehensive Election Mock Data
// =============================================================================

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
      const count = 2 + Math.floor(Math.random() * 2) // 2-3 booths per region
      for (let i = 0; i < count; i++) {
        const statusRoll = Math.random()
        const status: BoothStatus =
          statusRoll > 0.15 ? "online" : statusRoll > 0.05 ? "delayed" : "offline"
        const riskRoll = Math.random()
        const riskLevel: RiskLevel =
          riskRoll > 0.2 ? "low" : riskRoll > 0.07 ? "medium" : "high"
        const totalVotes = 800 + Math.floor(Math.random() * 1600)
        const expectedVotes = 2000 + Math.floor(Math.random() * 1000)

        const minutesAgo =
          status === "online"
            ? Math.floor(Math.random() * 5)
            : status === "delayed"
              ? 15 + Math.floor(Math.random() * 30)
              : 60 + Math.floor(Math.random() * 120)

        const syncDate = new Date(Date.now() - minutesAgo * 60 * 1000)

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
          latitude: 8 + Math.random() * 28,
          longitude: 68 + Math.random() * 29,
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
    const votes = baseVotes + Math.floor(Math.random() * 40000 - 20000)
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
    timestamp: new Date(Date.now() - 8 * 60 * 1000).toISOString(),
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
    timestamp: new Date(Date.now() - 22 * 60 * 1000).toISOString(),
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
    timestamp: new Date(Date.now() - 35 * 60 * 1000).toISOString(),
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
    timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
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
    timestamp: new Date(Date.now() - 62 * 60 * 1000).toISOString(),
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
    timestamp: new Date(Date.now() - 90 * 60 * 1000).toISOString(),
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
    timestamp: new Date(Date.now() - 120 * 60 * 1000).toISOString(),
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
    timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
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
    timestamp: new Date(Date.now() - 55 * 60 * 1000).toISOString(),
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
    timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
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
    const ts = new Date(Date.now() - (40 - i) * 3 * 60 * 1000)
    const voteCount = 10 + Math.floor(Math.random() * 30)

    const hash = generateHash(i)
    const dataHash = generateHash(i + 1000)
    const verified = Math.random() > 0.05 // 95% verified

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
export const regionStats: RegionStats[] = states.flatMap((state) =>
  regions[state].map((region) => {
    const regionBooths = booths.filter((b) => b.region === region)
    const totalVotes = regionBooths.reduce((s, b) => s + b.totalVotes, 0)
    const expectedVotes = regionBooths.reduce((s, b) => s + b.expectedVotes, 0)
    const activeBooths = regionBooths.filter((b) => b.status === "online").length

    return {
      name: region,
      state,
      totalBooths: regionBooths.length,
      activeBooths,
      totalVotes,
      expectedVotes,
      turnoutPercentage: Math.round((totalVotes / expectedVotes) * 100),
      leadingCandidate: candidates[Math.floor(Math.random() * 3)].name,
      leadingParty: candidates[Math.floor(Math.random() * 3)].party,
    }
  })
)

// -- Booth Logs (for detail page) -------------------------------------------
export function generateBoothLogs(boothId: string): BoothLog[] {
  const logs: BoothLog[] = []
  const types: BoothLog["type"][] = ["vote", "sync", "system", "vote", "vote", "sync"]

  for (let i = 0; i < 25; i++) {
    const ts = new Date(Date.now() - (25 - i) * 7 * 60 * 1000)
    const type = types[i % types.length]

    const actions: Record<string, string[]> = {
      vote: ["Batch recorded", "Vote verified", "VVPAT confirmed"],
      sync: ["Data synced to server", "Acknowledgment received", "Checkpoint created"],
      alert: ["Anomaly flagged", "Alert generated"],
      system: ["Health check passed", "Integrity verified", "Connection stable"],
    }

    const actionList = actions[type]
    const action = actionList[Math.floor(Math.random() * actionList.length)]

    logs.push({
      id: `LOG-${boothId}-${String(i + 1).padStart(3, "0")}`,
      timestamp: ts.toISOString(),
      action,
      details: `${action} for booth ${boothId} at ${ts.toLocaleTimeString()}`,
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
