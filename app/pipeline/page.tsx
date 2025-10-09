"use client"

import { useState } from "react"
import { PageDescription, PageTitle } from "@/ui/page-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/ui/card"
import { Badge } from "@/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/ui/table"
import { Button } from "@/ui/button"
import { Input } from "@/ui/input"
import { emitEvent } from "@/core/events/emit"
import { cn } from "@/lib/utils"
import { TRS_CARD, TRS_SECTION_TITLE, TRS_SUBTITLE } from "@/lib/style"

type Deal = {
  id: string
  name: string
  company: string
  stage: string
  amount: number
  probability: number
  closeDate: string
  owner: string
  notes: Array<{ id: string; text: string; timestamp: string; author: string }>
}

const initialDeals: Deal[] = [
  {
    id: "1",
    name: "Enterprise SaaS Platform",
    company: "Acme Corp",
    stage: "Negotiation",
    amount: 450000,
    probability: 75,
    closeDate: "2025-11-15",
    owner: "Sarah Chen",
    notes: [
      { id: "n1", text: "Strong interest from CFO, awaiting legal review", timestamp: "2025-10-05T14:30:00Z", author: "Sarah Chen" },
    ],
  },
  {
    id: "2",
    name: "Revenue Analytics Suite",
    company: "GlobalTech Inc",
    stage: "Proposal",
    amount: 280000,
    probability: 60,
    closeDate: "2025-11-30",
    owner: "Mike Johnson",
    notes: [
      { id: "n2", text: "Demo went well, need to address pricing concerns", timestamp: "2025-10-03T10:15:00Z", author: "Mike Johnson" },
    ],
  },
  {
    id: "3",
    name: "Customer Success Platform",
    company: "DataFlow Systems",
    stage: "Discovery",
    amount: 125000,
    probability: 35,
    closeDate: "2025-12-20",
    owner: "Sarah Chen",
    notes: [],
  },
  {
    id: "4",
    name: "API Integration Package",
    company: "CloudBridge",
    stage: "Negotiation",
    amount: 95000,
    probability: 80,
    closeDate: "2025-10-25",
    owner: "Alex Rivera",
    notes: [
      { id: "n3", text: "Ready to close, just waiting on SOW signature", timestamp: "2025-10-07T16:45:00Z", author: "Alex Rivera" },
    ],
  },
  {
    id: "5",
    name: "Starter Package",
    company: "Innovation Labs",
    stage: "Qualification",
    amount: 45000,
    probability: 25,
    closeDate: "2025-12-15",
    owner: "Alex Rivera",
    notes: [],
  },
]

const stages = ["Discovery", "Qualification", "Proposal", "Negotiation", "Closed Won", "Closed Lost"]

export default function PipelinePage() {
  const [deals, setDeals] = useState<Deal[]>(initialDeals)
  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null)
  const [newNote, setNewNote] = useState("")
  const [filterStage, setFilterStage] = useState<string>("all")
  const [filterOwner, setFilterOwner] = useState<string>("all")
  const [sortBy, setSortBy] = useState<string>("amount-desc")
  const [showNewProspectModal, setShowNewProspectModal] = useState(false)
  const [newProspect, setNewProspect] = useState({
    name: "",
    company: "",
    amount: "",
    owner: "",
    closeDate: "",
  })

  const pipelineGoal = 2500000
  const activeDeals = deals.filter((d) => d.stage !== "Closed Won" && d.stage !== "Closed Lost")
  const totalWeighted = activeDeals.reduce((sum, deal) => sum + (deal.amount * deal.probability) / 100, 0)
  const coverage = (totalWeighted / pipelineGoal) * 100

  const owners = Array.from(new Set(deals.map((d) => d.owner)))

  const handleStageChange = async (dealId: string, newStage: string) => {
    const deal = deals.find((d) => d.id === dealId)
    if (!deal) return

    const updatedDeals = deals.map((d) => (d.id === dealId ? { ...d, stage: newStage } : d))
    setDeals(updatedDeals)

    if (selectedDeal?.id === dealId) {
      setSelectedDeal({ ...selectedDeal, stage: newStage })
    }

    await emitEvent("me", "opportunity", "stage_changed", {
      dealId,
      company: deal.company,
      oldStage: deal.stage,
      newStage,
      amount: deal.amount,
    })

    if (newStage === "Closed Won") {
      await emitEvent("me", "proposal", "sent", { dealId, company: deal.company, amount: deal.amount })
      alert(`${deal.name} moved to Closed Won! Deal will move to Projects.`)
    }
  }

  const handleAddNote = () => {
    if (!selectedDeal || !newNote.trim()) return

    const note = {
      id: `n${Date.now()}`,
      text: newNote.trim(),
      timestamp: new Date().toISOString(),
      author: "Current User",
    }

    const updatedDeals = deals.map((d) => (d.id === selectedDeal.id ? { ...d, notes: [...d.notes, note] } : d))
    setDeals(updatedDeals)
    setSelectedDeal({ ...selectedDeal, notes: [...selectedDeal.notes, note] })
    setNewNote("")
  }

  const handleAddProspect = () => {
    if (!newProspect.name || !newProspect.company || !newProspect.amount) {
      alert("Please fill in required fields: Name, Company, and Amount")
      return
    }

    const prospect: Deal = {
      id: `p${Date.now()}`,
      name: newProspect.name,
      company: newProspect.company,
      stage: "Discovery",
      amount: parseInt(newProspect.amount),
      probability: 20,
      closeDate: newProspect.closeDate || new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      owner: newProspect.owner || "Current User",
      notes: [],
    }

    setDeals([...deals, prospect])
    setShowNewProspectModal(false)
    setNewProspect({ name: "", company: "", amount: "", owner: "", closeDate: "" })
    emitEvent("me", "opportunity", "created", { company: prospect.company, amount: prospect.amount })
  }

  // Apply filters and sorting
  let filteredDeals = activeDeals
  if (filterStage !== "all") {
    filteredDeals = filteredDeals.filter((d) => d.stage === filterStage)
  }
  if (filterOwner !== "all") {
    filteredDeals = filteredDeals.filter((d) => d.owner === filterOwner)
  }

  filteredDeals = [...filteredDeals].sort((a, b) => {
    switch (sortBy) {
      case "amount-desc":
        return b.amount - a.amount
      case "amount-asc":
        return a.amount - b.amount
      case "probability-desc":
        return b.probability - a.probability
      case "probability-asc":
        return a.probability - b.probability
      case "name-asc":
        return a.name.localeCompare(b.name)
      case "name-desc":
        return b.name.localeCompare(a.name)
      default:
        return 0
    }
  })

  // Calculate metrics
  const avgDealSize = activeDeals.reduce((sum, d) => sum + d.amount, 0) / activeDeals.length
  const winRate = 72 // Mock
  const avgSalesCycle = 45 // Mock days
  const dealsClosingThisMonth = activeDeals.filter((d) => {
    const close = new Date(d.closeDate)
    const now = new Date()
    return close.getMonth() === now.getMonth() && close.getFullYear() === now.getFullYear()
  }).length

  return (
    <div className="mx-auto max-w-7xl space-y-4 px-4 py-4">
      <div className={cn(TRS_CARD, "p-4 space-y-3")}>
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="space-y-1">
            <PageTitle className="text-lg font-semibold text-black">Pipeline &amp; Sales Intelligence</PageTitle>
            <PageDescription className="text-sm text-gray-500">
              AI-powered forecasting, coverage analysis, and proactive deal insights
            </PageDescription>
          </div>
          <Button onClick={() => setShowNewProspectModal(true)} variant="primary" size="sm">
            + New Prospect
          </Button>
        </div>
        <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600">
          <Badge variant={coverage >= 100 ? "success" : "outline"}>Coverage: {coverage.toFixed(0)}%</Badge>
          <span>${(totalWeighted / 1000).toFixed(0)}K weighted pipeline</span>
        </div>
      </div>

      {/* AI Sales Agent Placeholder */}
      <Card className={cn(TRS_CARD)}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-2xl">🤖</span>
                <div className={TRS_SECTION_TITLE}>AI Sales Agent</div>
                <Badge>Coming Soon</Badge>
              </div>
              <p className={cn(TRS_SUBTITLE, "mt-1")}>
                Automated prospecting, scheduling, follow-ups, and deal intelligence powered by AI
              </p>
            </div>
            <Button variant="outline" size="sm" disabled className="border-gray-200 text-gray-500">
              Configure Agent
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-4">
        <Card className={cn(TRS_CARD)}>
          <CardContent className="p-4 space-y-2">
            <div className={TRS_SUBTITLE}>Weighted Pipeline</div>
            <div className="text-2xl font-semibold text-black">${(totalWeighted / 1000).toFixed(0)}K</div>
            <div className="flex items-center gap-2 text-xs text-gray-600">
              <span className="font-medium text-gray-700">↑ 18%</span>
              <span>vs last month</span>
            </div>
          </CardContent>
        </Card>

        <Card className={cn(TRS_CARD)}>
          <CardContent className="p-4 space-y-2">
            <div className={TRS_SUBTITLE}>Win Rate</div>
            <div className="text-2xl font-semibold text-black">{winRate}%</div>
            <div className="flex items-center gap-2 text-xs text-gray-600">
              <span className="font-medium text-gray-700">↑ 5%</span>
              <span>vs last quarter</span>
            </div>
          </CardContent>
        </Card>

        <Card className={cn(TRS_CARD)}>
          <CardContent className="p-4 space-y-2">
            <div className={TRS_SUBTITLE}>Avg Deal Size</div>
            <div className="text-2xl font-semibold text-black">${(avgDealSize / 1000).toFixed(0)}K</div>
            <div className="flex items-center gap-2 text-xs text-gray-600">
              <span className="font-medium text-gray-700">↑ 12%</span>
              <span>vs target</span>
            </div>
          </CardContent>
        </Card>

        <Card className={cn(TRS_CARD)}>
          <CardContent className="p-4 space-y-2">
            <div className={TRS_SUBTITLE}>Avg Sales Cycle</div>
            <div className="text-2xl font-semibold text-black">{avgSalesCycle} days</div>
            <div className="flex items-center gap-2 text-xs text-gray-600">
              <span className="font-medium text-gray-700">↓ 8 days</span>
              <span>faster</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* OKR Cards */}
      <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
        <Card className={cn(TRS_CARD)}>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Q4 Objectives & Key Results</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-black">Close $2M in new ARR</span>
                <span className="text-sm text-gray-500">68%</span>
              </div>
              <div className="h-2 rounded-full bg-gray-200 overflow-hidden">
                <div className="h-full w-[68%] bg-gray-900" />
              </div>
              <div className="mt-1 text-xs text-gray-500">$1.36M / $2M</div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-black">Achieve 75% win rate</span>
                <span className="text-sm text-gray-500">96%</span>
              </div>
              <div className="h-2 rounded-full bg-gray-200 overflow-hidden">
                <div className="h-full w-[96%] bg-gray-800" />
              </div>
              <div className="mt-1 text-xs text-gray-500">72% / 75%</div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-black">Reduce sales cycle to 40 days</span>
                <span className="text-sm text-gray-500">88%</span>
              </div>
              <div className="h-2 rounded-full bg-gray-200 overflow-hidden">
                <div className="h-full w-[88%] bg-gray-900" />
              </div>
              <div className="mt-1 text-xs text-gray-500">45 days / 40 target</div>
            </div>
          </CardContent>
        </Card>

        <Card className={cn(TRS_CARD)}>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Sales Enablement Pipeline</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between rounded-lg border border-gray-200 p-3">
              <div>
                <div className="text-sm font-medium text-black">Product Demo Deck v2</div>
                <div className="text-xs text-gray-500">ROI calculator integration</div>
              </div>
              <Badge>In Review</Badge>
            </div>
            <div className="flex items-center justify-between rounded-lg border border-gray-200 p-3">
              <div>
                <div className="text-sm font-medium text-black">Competitive Battle Cards</div>
                <div className="text-xs text-gray-500">Updated positioning</div>
              </div>
              <Badge variant="success">Ready</Badge>
            </div>
            <div className="flex items-center justify-between rounded-lg border border-gray-200 p-3">
              <div>
                <div className="text-sm font-medium text-black">Objection Handling Guide</div>
                <div className="text-xs text-gray-500">Common pricing concerns</div>
              </div>
              <Badge variant="outline">Draft</Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Proactive Sales Graphs */}
      <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
        <Card className={cn(TRS_CARD)}>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Deal Velocity Trend</CardTitle>
            <CardDescription>Average days to close by month</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { month: "Jul", days: 52, color: "bg-gray-800" },
                { month: "Aug", days: 48, color: "bg-gray-700" },
                { month: "Sep", days: 45, color: "bg-gray-900" },
                { month: "Oct", days: 45, color: "bg-gray-900" },
              ].map((item) => (
                <div key={item.month} className="flex items-center gap-3">
                  <div className="w-12 text-xs text-gray-500">{item.month}</div>
                  <div className="flex-1">
                    <div className="h-6 rounded-md bg-gray-100 overflow-hidden">
                      <div className={`h-full ${item.color}`} style={{ width: `${(60 - item.days) * 2}%` }} />
                    </div>
                  </div>
                  <div className="w-16 text-sm font-medium text-right text-black">{item.days}d</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className={cn(TRS_CARD)}>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Pipeline Health Score</CardTitle>
            <CardDescription>AI-powered risk assessment</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-black">Healthy Deals</span>
                  <span className="text-sm font-medium text-gray-700">62%</span>
                </div>
                <div className="h-2 rounded-full bg-gray-200 overflow-hidden">
                  <div className="h-full w-[62%] bg-gray-800" />
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-black">At Risk</span>
                  <span className="text-sm font-medium text-gray-700">28%</span>
                </div>
                <div className="h-2 rounded-full bg-gray-200 overflow-hidden">
                  <div className="h-full w-[28%] bg-gray-600" />
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-black">Stalled</span>
                  <span className="text-sm font-medium text-gray-700">10%</span>
                </div>
                <div className="h-2 rounded-full bg-gray-200 overflow-hidden">
                  <div className="h-full w-[10%] bg-gray-500" />
                </div>
              </div>
              <div className="pt-2 border-t border-gray-200">
                <div className="text-xs text-gray-500">
                  <strong>3 deals</strong> need attention: Enterprise SaaS Platform, Revenue Analytics Suite, Customer Success Platform
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Deal Pipeline Table */}
      <Card className={cn(TRS_CARD)}>
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <CardTitle>Deal Pipeline</CardTitle>
              <CardDescription>All opportunities with stage, amount, and probability weighting</CardDescription>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <select
                value={filterStage}
                onChange={(e) => setFilterStage(e.target.value)}
                className="rounded-md border border-gray-200 bg-white px-3 py-1 text-sm"
              >
                <option value="all">All Stages</option>
                {stages.map((stage) => (
                  <option key={stage} value={stage}>
                    {stage}
                  </option>
                ))}
              </select>
              <select
                value={filterOwner}
                onChange={(e) => setFilterOwner(e.target.value)}
                className="rounded-md border border-gray-200 bg-white px-3 py-1 text-sm"
              >
                <option value="all">All Owners</option>
                {owners.map((owner) => (
                  <option key={owner} value={owner}>
                    {owner}
                  </option>
                ))}
              </select>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="rounded-md border border-gray-200 bg-white px-3 py-1 text-sm"
              >
                <option value="amount-desc">Amount (High to Low)</option>
                <option value="amount-asc">Amount (Low to High)</option>
                <option value="probability-desc">Probability (High to Low)</option>
                <option value="probability-asc">Probability (Low to High)</option>
                <option value="name-asc">Name (A-Z)</option>
                <option value="name-desc">Name (Z-A)</option>
              </select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Opportunity</TableHead>
                <TableHead>Company</TableHead>
                <TableHead>Stage</TableHead>
                <TableHead>Owner</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead className="text-right">Probability</TableHead>
                <TableHead className="text-right">Weighted</TableHead>
                <TableHead>Close Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredDeals.map((deal) => (
                <TableRow
                  key={deal.id}
                  onClick={() => setSelectedDeal(deal)}
                  className="cursor-pointer hover:bg-gray-50"
                >
                  <TableCell className="font-medium">{deal.name}</TableCell>
                  <TableCell>{deal.company}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        deal.stage === "Closed Won" ? "success" : deal.stage === "Negotiation" ? "default" : "outline"
                      }
                    >
                      {deal.stage}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-gray-500">{deal.owner}</TableCell>
                  <TableCell className="text-right font-medium">${(deal.amount / 1000).toFixed(0)}K</TableCell>
                  <TableCell className="text-right">{deal.probability}%</TableCell>
                  <TableCell className="text-right font-medium text-black">
                    ${((deal.amount * deal.probability) / 100 / 1000).toFixed(0)}K
                  </TableCell>
                  <TableCell className="text-sm text-gray-500">
                    {new Date(deal.closeDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* New Prospect Modal */}
      {showNewProspectModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
          onClick={() => setShowNewProspectModal(false)}
        >
          <div
            className="w-full max-w-2xl rounded-lg border border-gray-200 bg-white p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-start justify-between">
              <div>
                <h2 className="text-2xl font-semibold text-black">Add New Prospect</h2>
                <p className="text-sm text-gray-500">Create a new opportunity in the pipeline</p>
              </div>
              <button onClick={() => setShowNewProspectModal(false)} className="text-gray-400 hover:text-gray-600">
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-black">Opportunity Name *</label>
                  <Input
                    value={newProspect.name}
                    onChange={(e) => setNewProspect({ ...newProspect, name: e.target.value })}
                    placeholder="e.g. Enterprise Platform Deal"
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-black">Company *</label>
                  <Input
                    value={newProspect.company}
                    onChange={(e) => setNewProspect({ ...newProspect, company: e.target.value })}
                    placeholder="e.g. Acme Corp"
                    className="mt-1"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-black">Amount *</label>
                  <Input
                    type="number"
                    value={newProspect.amount}
                    onChange={(e) => setNewProspect({ ...newProspect, amount: e.target.value })}
                    placeholder="e.g. 250000"
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-black">Owner</label>
                  <Input
                    value={newProspect.owner}
                    onChange={(e) => setNewProspect({ ...newProspect, owner: e.target.value })}
                    placeholder="Current User"
                    className="mt-1"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-black">Expected Close Date</label>
                <Input
                  type="date"
                  value={newProspect.closeDate}
                  onChange={(e) => setNewProspect({ ...newProspect, closeDate: e.target.value })}
                  className="mt-1"
                />
              </div>

              <div className="flex justify-end gap-2 border-t border-gray-200 pt-4">
                <Button onClick={() => setShowNewProspectModal(false)} variant="outline" size="sm">
                  Cancel
                </Button>
                <Button onClick={handleAddProspect} variant="primary" size="sm">
                  Add Prospect
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Opportunity Detail Modal */}
      {selectedDeal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setSelectedDeal(null)}>
          <div
            className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-lg border border-gray-200 bg-white p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-start justify-between">
              <div>
                <h2 className="text-2xl font-semibold text-black">{selectedDeal.name}</h2>
                <p className="text-sm text-gray-500">{selectedDeal.company}</p>
              </div>
              <button onClick={() => setSelectedDeal(null)} className="text-gray-400 hover:text-gray-600">
                ✕
              </button>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Amount</p>
                  <p className="text-lg font-semibold text-black">${selectedDeal.amount.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Probability</p>
                  <p className="text-lg font-semibold text-black">{selectedDeal.probability}%</p>
                </div>
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Owner</p>
                  <p className="text-lg font-semibold text-black">{selectedDeal.owner}</p>
                </div>
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Close Date</p>
                  <p className="text-lg font-semibold text-black">
                    {new Date(selectedDeal.closeDate).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </p>
                </div>
              </div>

              <div>
                <p className="mb-2 text-xs font-medium uppercase tracking-wide text-gray-500">Stage</p>
                <select
                  value={selectedDeal.stage}
                  onChange={(e) => handleStageChange(selectedDeal.id, e.target.value)}
                  className="w-full rounded-md border border-gray-200 bg-white px-3 py-2"
                >
                  {stages.map((stage) => (
                    <option key={stage} value={stage}>
                      {stage}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <p className="mb-3 text-xs font-medium uppercase tracking-wide text-gray-500">
                  Notes ({selectedDeal.notes.length})
                </p>

                <div className="mb-4 space-y-3">
                  {selectedDeal.notes.map((note) => (
                    <div key={note.id} className="rounded-lg border border-gray-200 bg-gray-50 p-3">
                      <p className="text-sm text-black">{note.text}</p>
                      <p className="mt-1 text-xs text-gray-500">
                        {note.author} •{" "}
                        {new Date(note.timestamp).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  ))}
                  {selectedDeal.notes.length === 0 && (
                    <p className="text-sm text-gray-500">No notes yet. Add one below.</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Input
                    placeholder="Add a new note..."
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleAddNote()
                    }}
                  />
                  <Button onClick={handleAddNote} variant="primary" size="sm" disabled={!newNote.trim()}>
                    Add Note
                  </Button>
                </div>
              </div>

              <div className="flex justify-end gap-2 border-t border-gray-200 pt-4">
                <Button onClick={() => setSelectedDeal(null)} variant="outline" size="sm">
                  Close
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
