"use client"

import { useMemo } from "react"
import { usePathname, useSearchParams } from "next/navigation"

import { Badge } from "@/ui/badge"
import { Button } from "@/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/ui/table"
import { resolveTabs } from "@/lib/tabs"
import { TRS_CARD, TRS_SECTION_TITLE, TRS_SUBTITLE } from "@/lib/style"
import { cn } from "@/lib/utils"
import type { Partner } from "@/core/partners/types"

const formatCurrency = (value: number) => `$${value.toLocaleString()}`

export default function PartnerDetailView({ partner }: { partner: Partner }) {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const tabs = useMemo(() => resolveTabs(pathname), [pathname])
  const activeTab = useMemo(() => {
    const current = searchParams.get("tab")
    return current && tabs.includes(current) ? current : tabs[0]
  }, [searchParams, tabs])

  const readinessTone =
    partner.readinessScore >= 80 ? "text-emerald-600" : partner.readinessScore >= 60 ? "text-amber-600" : "text-rose-600"

  return (
    <div className="mx-auto max-w-6xl space-y-5 px-4 py-6">
      <header className="space-y-2">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-semibold text-black">{partner.name}</h1>
          <Badge variant="outline">{partner.stage}</Badge>
          <Badge variant="default">{partner.model}</Badge>
        </div>
        <p className="text-sm text-gray-600">
          {partner.organizationType} • {partner.focus} • {partner.city}, {partner.state}
        </p>
        <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500">
          <span>Owner {partner.owner}</span>
          <span>Last interaction {new Date(partner.lastInteraction).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>
          {partner.website && (
            <a href={partner.website} target="_blank" rel="noreferrer" className="text-gray-700 underline">
              Visit website
            </a>
          )}
        </div>
      </header>

      {activeTab === "Overview" && (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <Card className={cn(TRS_CARD, "lg:col-span-2 p-4 space-y-4")}> 
            <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
              <div className="space-y-1">
                <div className="text-lg font-semibold text-black">Relationship Snapshot</div>
                <p className="text-sm text-gray-600">
                  Potential shared revenue {formatCurrency(partner.potentialValue)} • Warm introductions {partner.warmIntroductions}
                  • Mutual clients {partner.mutualClients}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm text-gray-700">
                <div>
                  <div className={TRS_SUBTITLE}>Readiness</div>
                  <div className={cn("mt-1 font-semibold", readinessTone)}>{partner.readinessScore}%</div>
                </div>
                <div>
                  <div className={TRS_SUBTITLE}>Ecosystem fit</div>
                  <div className="mt-1 font-semibold text-black">{partner.ecosystemFit}</div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <div className="rounded-lg border border-gray-200 p-3">
                <div className={TRS_SECTION_TITLE}>Strengths</div>
                <ul className="mt-2 space-y-2 text-sm text-gray-700">
                  {partner.strengths.map((strength) => (
                    <li key={strength}>• {strength}</li>
                  ))}
                </ul>
              </div>
              <div className="rounded-lg border border-gray-200 p-3">
                <div className={TRS_SECTION_TITLE}>Needs</div>
                <ul className="mt-2 space-y-2 text-sm text-gray-700">
                  {partner.needs.map((need) => (
                    <li key={need}>• {need}</li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="rounded-lg border border-gray-200 p-3">
              <div className={TRS_SECTION_TITLE}>Notes</div>
              <ul className="mt-2 space-y-2 text-sm text-gray-700">
                {partner.notes.map((note) => (
                  <li key={note}>{note}</li>
                ))}
              </ul>
            </div>
          </Card>

          <Card className={cn(TRS_CARD, "p-4 space-y-3")}> 
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold">Key Contacts</CardTitle>
              <Button size="sm" variant="outline" className="h-7 px-3 text-xs">
                Add contact
              </Button>
            </div>
            <div className="space-y-3 text-sm text-gray-700">
              {partner.contacts.map((contact) => (
                <div key={contact.id} className="rounded-lg border border-gray-200 p-3">
                  <div className="font-medium text-black">{contact.name}</div>
                  <div className="text-xs text-gray-500">{contact.role}</div>
                  {contact.email && (
                    <a href={`mailto:${contact.email}`} className="mt-1 block text-xs text-gray-500 underline">
                      {contact.email}
                    </a>
                  )}
                  {contact.phone && <div className="text-xs text-gray-500">{contact.phone}</div>}
                  {contact.notes && <div className="mt-2 text-xs text-gray-500">{contact.notes}</div>}
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {activeTab === "Introductions" && (
        <Card className={cn(TRS_CARD)}>
          <CardHeader>
            <CardTitle className="text-sm font-semibold">Warm introductions</CardTitle>
            <CardDescription>Mutual opportunities sourced through this relationship.</CardDescription>
          </CardHeader>
          <CardContent>
            {partner.opportunities.length === 0 ? (
              <div className="py-8 text-center text-sm text-gray-600">No introductions logged yet.</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Opportunity</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Target</TableHead>
                    <TableHead className="text-right">Value</TableHead>
                    <TableHead>Expected Close</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {partner.opportunities.map((opportunity) => (
                    <TableRow key={opportunity.id}>
                      <TableCell className="font-medium text-black">{opportunity.name}</TableCell>
                      <TableCell>{opportunity.type}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            opportunity.status === "In Motion"
                              ? "success"
                              : opportunity.status === "Introduced"
                              ? "default"
                              : "outline"
                          }
                        >
                          {opportunity.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-gray-600">{opportunity.targetClient}</TableCell>
                      <TableCell className="text-right font-medium text-black">
                        {formatCurrency(opportunity.value)}
                      </TableCell>
                      <TableCell className="text-sm text-gray-600">
                        {new Date(opportunity.expectedClose).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      )}

      {activeTab === "Initiatives" && (
        <Card className={cn(TRS_CARD)}>
          <CardHeader>
            <CardTitle className="text-sm font-semibold">Joint initiatives</CardTitle>
            <CardDescription>Co-marketing, events, and shared plays in motion.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {partner.initiatives.map((initiative) => (
              <div key={initiative.id} className="rounded-lg border border-gray-200 p-3">
                <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                  <div>
                    <div className="text-sm font-semibold text-black">{initiative.title}</div>
                    <div className="text-xs text-gray-500">Owner {initiative.owner}</div>
                  </div>
                  <div className="text-xs text-gray-500">
                    Due {new Date(initiative.dueDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                  </div>
                </div>
                <div className="mt-2 text-xs uppercase tracking-wide text-gray-400">{initiative.status}</div>
                <p className="mt-2 text-sm text-gray-600">{initiative.description}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {activeTab === "Notes" && (
        <Card className={cn(TRS_CARD)}>
          <CardHeader>
            <CardTitle className="text-sm font-semibold">Touchpoint timeline</CardTitle>
            <CardDescription>Every conversation, intro, and next step.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {partner.interactions.map((interaction) => (
              <div key={interaction.id} className="rounded-lg border border-gray-200 p-3">
                <div className="flex items-center justify-between text-sm">
                  <div className="font-medium text-black">{interaction.type}</div>
                  <span className="text-xs text-gray-500">
                    {new Date(interaction.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                  </span>
                </div>
                <div className="mt-1 text-xs uppercase tracking-wide text-gray-400">Sentiment: {interaction.sentiment}</div>
                <p className="mt-2 text-sm text-gray-600">{interaction.summary}</p>
                {interaction.nextStep && (
                  <div className="mt-2 rounded-md bg-gray-50 px-3 py-2 text-xs text-gray-600">
                    Next step: {interaction.nextStep}
                  </div>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {activeTab === "Resources" && (
        <Card className={cn(TRS_CARD)}>
          <CardHeader>
            <CardTitle className="text-sm font-semibold">Shared resources</CardTitle>
            <CardDescription>Assets curated for this partnership.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-gray-700">
            {partner.resources.map((resource) => (
              <div key={resource.id} className="flex items-center justify-between rounded-lg border border-gray-200 p-3">
                <div>
                  <div className="font-medium text-black">{resource.title}</div>
                  <div className="text-xs text-gray-500">{resource.type}</div>
                  {resource.notes && <div className="mt-1 text-xs text-gray-500">{resource.notes}</div>}
                </div>
                <a
                  href={resource.url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs font-semibold text-black underline"
                >
                  Open
                </a>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
