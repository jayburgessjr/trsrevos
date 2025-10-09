"use client"

import { PageDescription, PageHeader, PageTitle } from "@/ui/page-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/ui/card"
import { Badge } from "@/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/ui/table"
import { Button } from "@/ui/button"
import { useState } from "react"

type PricingRule = {
  id: string
  name: string
  scope: string
  floorPrice?: number
  maxDiscount?: number
  status: "on" | "off"
  lastChangedBy: string
}

const mockRules: PricingRule[] = [
  { id: "r1", name: "Enterprise Floor", scope: "Enterprise tier", floorPrice: 50000, status: "on", lastChangedBy: "Sarah" },
  { id: "r2", name: "Max Discount Plus", scope: "Plus tier", maxDiscount: 15, status: "on", lastChangedBy: "Mike" },
  { id: "r3", name: "Starter Cap", scope: "Starter tier", maxDiscount: 5, status: "off", lastChangedBy: "Alex" },
]

export default function PricingPage() {
  const [rules, setRules] = useState(mockRules)

  const applyRule = async (id: string) => {
    // Stub: emit pricing_rule:applied
    alert(`Applied rule ${id}. Event emitted: pricing_rule:applied`)
  }

  return (
    <div className="space-y-6 p-6">
      <PageHeader className="rounded-xl border border-[color:var(--color-outline)]">
        <PageTitle>Pricing Guardrails</PageTitle>
        <PageDescription>
          Set floor prices and discount caps to protect margin and improve price realization.
        </PageDescription>
      </PageHeader>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Price Realization</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold text-[color:var(--color-text)]">94%</p>
            <p className="mt-1 text-xs text-[color:var(--color-text-muted)]">List vs realized (last 30 days)</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Active Guardrails</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold text-[color:var(--color-text)]">
              {rules.filter((r) => r.status === "on").length}
            </p>
            <p className="mt-1 text-xs text-[color:var(--color-text-muted)]">Rules enforced</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Guardrails</CardTitle>
          <CardDescription>Floor prices and discount caps by tier or segment.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Rule Name</TableHead>
                <TableHead>Scope</TableHead>
                <TableHead>Floor Price</TableHead>
                <TableHead>Max Discount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last Changed By</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rules.map((rule) => (
                <TableRow key={rule.id}>
                  <TableCell className="font-medium">{rule.name}</TableCell>
                  <TableCell>{rule.scope}</TableCell>
                  <TableCell>{rule.floorPrice ? `$${rule.floorPrice.toLocaleString()}` : "—"}</TableCell>
                  <TableCell>{rule.maxDiscount ? `${rule.maxDiscount}%` : "—"}</TableCell>
                  <TableCell>
                    <Badge variant={rule.status === "on" ? "success" : "outline"}>{rule.status}</Badge>
                  </TableCell>
                  <TableCell className="text-sm text-[color:var(--color-text-muted)]">{rule.lastChangedBy}</TableCell>
                  <TableCell>
                    <Button variant="outline" size="sm" onClick={() => applyRule(rule.id)}>
                      Apply
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
