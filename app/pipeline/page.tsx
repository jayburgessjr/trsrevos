"use client"

import { useState } from "react"
import { PageDescription, PageHeader, PageTitle } from "@/ui/page-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/ui/card"
import { Badge } from "@/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/ui/table"
import { Button } from "@/ui/button"
import { Input } from "@/ui/input"
import { emitEvent } from "@/core/events/emit"

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

    // Emit event
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

  // Apply filters and sorting
  let filteredDeals = activeDeals
  if (filterStage !== "all") {
    filteredDeals = filteredDeals.filter((d) => d.stage === filterStage)
  }
  if (filterOwner !== "all") {
    filteredDeals = filteredDeals.filter((d) => d.owner === filterOwner)
  }

  // Apply sorting
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

  return (
    <div className="space-y-6 p-6">
      <PageHeader className="rounded-xl border border-[color:var(--color-outline)]">
        <PageTitle>Pipeline</PageTitle>
        <PageDescription>Track forecast health, coverage, and conversion across all active opportunities.</PageDescription>
        <div className="flex flex-wrap items-center gap-3 text-sm">
          <Badge variant={coverage >= 100 ? "success" : "outline"}>Coverage: {coverage.toFixed(0)}%</Badge>
          <span className="text-[color:var(--color-text-muted)]">${(totalWeighted / 1000).toFixed(0)}K weighted pipeline</span>
        </div>
      </PageHeader>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Weighted Pipeline</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold text-[color:var(--color-text)]">${(totalWeighted / 1000).toFixed(0)}K</p>
            <p className="mt-1 text-xs text-[color:var(--color-text-muted)]">Target: ${(pipelineGoal / 1000).toFixed(0)}K</p>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-[color:var(--color-surface-muted)]">
              <div className="h-full bg-[color:var(--color-positive)]" style={{ width: `${Math.min(coverage, 100)}%` }} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Active Opportunities</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold text-[color:var(--color-text)]">{activeDeals.length}</p>
            <p className="mt-1 text-xs text-[color:var(--color-text-muted)]">
              {activeDeals.filter((d) => d.probability >= 60).length} high probability
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Closing This Month</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold text-[color:var(--color-text)]">
              {activeDeals.filter((d) => {
                const close = new Date(d.closeDate)
                return close.getMonth() === 9 && close.getFullYear() === 2025
              }).length}
            </p>
            <p className="mt-1 text-xs text-[color:var(--color-text-muted)]">
              $
              {activeDeals
                .filter((d) => {
                  const close = new Date(d.closeDate)
                  return close.getMonth() === 9 && close.getFullYear() === 2025
                })
                .reduce((sum, d) => sum + d.amount, 0) / 1000}
              K value
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <CardTitle>Deal pipeline</CardTitle>
              <CardDescription>All opportunities with stage, amount, and probability weighting.</CardDescription>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <select
                value={filterStage}
                onChange={(e) => setFilterStage(e.target.value)}
                className="rounded-md border border-[color:var(--color-outline)] bg-white px-3 py-1 text-sm"
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
                className="rounded-md border border-[color:var(--color-outline)] bg-white px-3 py-1 text-sm"
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
                className="rounded-md border border-[color:var(--color-outline)] bg-white px-3 py-1 text-sm"
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
                <TableRow key={deal.id} onClick={() => setSelectedDeal(deal)} className="cursor-pointer hover:bg-gray-50">
                  <TableCell className="font-medium">{deal.name}</TableCell>
                  <TableCell>{deal.company}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        deal.stage === "Closed Won"
                          ? "success"
                          : deal.stage === "Negotiation"
                            ? "default"
                            : "outline"
                      }
                    >
                      {deal.stage}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-[color:var(--color-text-muted)]">{deal.owner}</TableCell>
                  <TableCell className="text-right font-medium">${(deal.amount / 1000).toFixed(0)}K</TableCell>
                  <TableCell className="text-right">{deal.probability}%</TableCell>
                  <TableCell className="text-right font-medium text-[color:var(--color-text)]">
                    ${((deal.amount * deal.probability) / 100 / 1000).toFixed(0)}K
                  </TableCell>
                  <TableCell className="text-sm text-[color:var(--color-text-muted)]">
                    {new Date(deal.closeDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Opportunity Modal */}
      {selectedDeal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setSelectedDeal(null)}>
          <div
            className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-lg bg-white p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-start justify-between">
              <div>
                <h2 className="text-2xl font-semibold text-[color:var(--color-text)]">{selectedDeal.name}</h2>
                <p className="text-sm text-[color:var(--color-text-muted)]">{selectedDeal.company}</p>
              </div>
              <button onClick={() => setSelectedDeal(null)} className="text-gray-400 hover:text-gray-600">
                ✕
              </button>
            </div>

            <div className="space-y-6">
              {/* Deal Details Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-[color:var(--color-text-muted)]">Amount</p>
                  <p className="text-lg font-semibold text-[color:var(--color-text)]">
                    ${selectedDeal.amount.toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-[color:var(--color-text-muted)]">Probability</p>
                  <p className="text-lg font-semibold text-[color:var(--color-text)]">{selectedDeal.probability}%</p>
                </div>
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-[color:var(--color-text-muted)]">Owner</p>
                  <p className="text-lg font-semibold text-[color:var(--color-text)]">{selectedDeal.owner}</p>
                </div>
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-[color:var(--color-text-muted)]">Close Date</p>
                  <p className="text-lg font-semibold text-[color:var(--color-text)]">
                    {new Date(selectedDeal.closeDate).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </p>
                </div>
              </div>

              {/* Stage Selection */}
              <div>
                <p className="mb-2 text-xs font-medium uppercase tracking-wide text-[color:var(--color-text-muted)]">Stage</p>
                <select
                  value={selectedDeal.stage}
                  onChange={(e) => handleStageChange(selectedDeal.id, e.target.value)}
                  className="w-full rounded-md border border-[color:var(--color-outline)] bg-white px-3 py-2"
                >
                  {stages.map((stage) => (
                    <option key={stage} value={stage}>
                      {stage}
                    </option>
                  ))}
                </select>
              </div>

              {/* Notes Section */}
              <div>
                <p className="mb-3 text-xs font-medium uppercase tracking-wide text-[color:var(--color-text-muted)]">
                  Notes ({selectedDeal.notes.length})
                </p>

                <div className="mb-4 space-y-3">
                  {selectedDeal.notes.map((note) => (
                    <div key={note.id} className="rounded-lg border border-[color:var(--color-outline)] bg-gray-50 p-3">
                      <p className="text-sm text-[color:var(--color-text)]">{note.text}</p>
                      <p className="mt-1 text-xs text-[color:var(--color-text-muted)]">
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
                    <p className="text-sm text-[color:var(--color-text-muted)]">No notes yet. Add one below.</p>
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

              {/* Actions */}
              <div className="flex justify-end gap-2 border-t pt-4">
                <Button onClick={() => setSelectedDeal(null)} variant="outline" size="sm">
                  Close
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Stage velocity</CardTitle>
          <CardDescription>Average days in each pipeline stage (last 30 days).</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { stage: "Discovery", days: 12, deals: 8 },
              { stage: "Qualification", days: 18, deals: 5 },
              { stage: "Proposal", days: 22, deals: 6 },
              { stage: "Negotiation", days: 15, deals: 4 },
            ].map((item) => (
              <div key={item.stage}>
                <div className="mb-1 flex items-center justify-between text-sm">
                  <span className="font-medium text-[color:var(--color-text)]">{item.stage}</span>
                  <span className="text-[color:var(--color-text-muted)]">
                    {item.days} days avg • {item.deals} deals
                  </span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-[color:var(--color-surface-muted)]">
                  <div className="h-full bg-[color:var(--color-primary)]" style={{ width: `${(item.days / 30) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
