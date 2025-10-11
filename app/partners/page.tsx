"use client";

import { useCallback, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { Badge } from "@/ui/badge";
import { Button } from "@/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/ui/card";
import { Input } from "@/ui/input";
import { PageDescription, PageTitle } from "@/ui/page-header";
import { PageTabs } from "@/components/layout/PageTabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/ui/table";
import { cn } from "@/lib/utils";
import { TRS_CARD, TRS_SECTION_TITLE, TRS_SUBTITLE } from "@/lib/style";
import { resolveTabs } from "@/lib/tabs";
import { getPartners } from "@/core/partners/store";
import type { Partner } from "@/core/partners/types";

const relationshipStages: Partner["stage"][] = [
  "Initial Outreach",
  "Discovery",
  "Pilot Collaboration",
  "Contracting",
  "Launch",
  "Dormant",
];

const partnerModels: Partner["model"][] = [
  "Referral Exchange",
  "Co-Marketing",
  "Co-Sell",
  "Community",
];

const formatCurrency = (value: number) => `$${(value / 1000).toFixed(0)}K`;

export default function PartnersPage() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const tabs = useMemo(() => resolveTabs(pathname), [pathname]);
  const activeTab = useMemo(() => {
    const current = searchParams.get("tab");
    return current && tabs.includes(current) ? current : tabs[0];
  }, [searchParams, tabs]);

  const buildTabHref = useCallback(
    (tab: string) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set("tab", tab);
      return `${pathname}?${params.toString()}`;
    },
    [pathname, searchParams],
  );

  const router = useRouter();
  const partnerDataset = useMemo(() => getPartners(), []);
  const [relationships, setRelationships] = useState<Partner[]>(partnerDataset);
  const [search, setSearch] = useState("");
  const [stageFilter, setStageFilter] = useState<string>("all");
  const [modelFilter, setModelFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("readiness-desc");
  const [showLogModal, setShowLogModal] = useState(false);
  const [newRelationship, setNewRelationship] = useState({
    name: "",
    organizationType: "",
    city: "",
    stage: "Discovery" as Partner["stage"],
    owner: "",
  });

  const totalPotentialValue = relationships.reduce(
    (sum, partner) => sum + partner.potentialValue,
    0,
  );
  const warmIntros = relationships.reduce(
    (sum, partner) => sum + partner.warmIntroductions,
    0,
  );
  const avgReadiness = relationships.length
    ? Math.round(
        relationships.reduce(
          (sum, partner) => sum + partner.readinessScore,
          0,
        ) / relationships.length,
      )
    : 0;
  const activePipeline = relationships.reduce(
    (sum, partner) =>
      sum +
      partner.opportunities
        .filter((opportunity) => opportunity.status !== "Won")
        .reduce((value, opportunity) => value + opportunity.value, 0),
    0,
  );

  const communityGoal = 450000;
  const coverage = Math.min(
    100,
    Math.round((activePipeline / communityGoal) * 100),
  );

  const filteredPartners = useMemo(() => {
    let list = relationships;

    if (search.trim()) {
      const term = search.trim().toLowerCase();
      list = list.filter(
        (partner) =>
          partner.name.toLowerCase().includes(term) ||
          partner.focus.toLowerCase().includes(term) ||
          partner.city.toLowerCase().includes(term),
      );
    }

    if (stageFilter !== "all") {
      list = list.filter((partner) => partner.stage === stageFilter);
    }

    if (modelFilter !== "all") {
      list = list.filter((partner) => partner.model === modelFilter);
    }

    return [...list].sort((a, b) => {
      switch (sortBy) {
        case "potential-desc":
          return b.potentialValue - a.potentialValue;
        case "potential-asc":
          return a.potentialValue - b.potentialValue;
        case "readiness-asc":
          return a.readinessScore - b.readinessScore;
        case "name-asc":
          return a.name.localeCompare(b.name);
        case "name-desc":
          return b.name.localeCompare(a.name);
        case "warm-desc":
          return b.warmIntroductions - a.warmIntroductions;
        default:
          return b.readinessScore - a.readinessScore;
      }
    });
  }, [relationships, search, stageFilter, modelFilter, sortBy]);

  const upcomingInteractions = useMemo(
    () =>
      relationships
        .flatMap((partner) =>
          partner.interactions.map((interaction) => ({
            ...interaction,
            partnerName: partner.name,
            partnerId: partner.id,
            stage: partner.stage,
          })),
        )
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 5),
    [relationships],
  );

  const activeOpportunities = useMemo(
    () =>
      relationships
        .flatMap((partner) =>
          partner.opportunities
            .filter((opportunity) => opportunity.status !== "Won")
            .map((opportunity) => ({
              partnerName: partner.name,
              partnerId: partner.id,
              stage: partner.stage,
              ...opportunity,
            })),
        )
        .sort((a, b) => b.value - a.value),
    [relationships],
  );

  const readinessByBand = useMemo(() => {
    const buckets = { ready: 0, ramping: 0, emerging: 0 };

    relationships.forEach((partner) => {
      if (partner.readinessScore >= 80) {
        buckets.ready += 1;
      } else if (partner.readinessScore >= 60) {
        buckets.ramping += 1;
      } else {
        buckets.emerging += 1;
      }
    });

    return buckets;
  }, [relationships]);

  const handleCreateRelationship = () => {
    if (!newRelationship.name || !newRelationship.organizationType) {
      alert("Name and organization type are required");
      return;
    }

    const potential: Partner = {
      id: `${newRelationship.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${Date.now()}`,
      name: newRelationship.name,
      organizationType: newRelationship.organizationType,
      focus: "To be defined",
      city: newRelationship.city || "Local",
      state: "TX",
      stage: newRelationship.stage,
      owner: newRelationship.owner || "You",
      model: "Referral Exchange",
      potentialValue: 25000,
      warmIntroductions: 0,
      mutualClients: 0,
      readinessScore: 40,
      notes: ["New relationship logged"],
      lastInteraction: new Date().toISOString().split("T")[0],
      ecosystemFit: "Emerging",
      strengths: [],
      needs: [],
      contacts: [],
      opportunities: [],
      initiatives: [],
      interactions: [],
      resources: [],
    };

    setRelationships([potential, ...relationships]);
    setNewRelationship({
      name: "",
      organizationType: "",
      city: "",
      stage: "Discovery",
      owner: "",
    });
    setShowLogModal(false);
  };

  return (
    <div className="mx-auto max-w-7xl space-y-4 px-4 py-4">
      <div className="flex flex-col gap-2">
        <PageTitle className="text-xl font-semibold text-black">
          Potential Partner Network
        </PageTitle>
        <PageDescription className="text-sm text-gray-500">
          Curate warm local relationships, track reciprocal referrals, and
          spotlight the businesses that trust TRS RevenueOS.
        </PageDescription>
      </div>

      <PageTabs tabs={tabs} activeTab={activeTab} hrefForTab={buildTabHref} />

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-4">
        <Card className={cn(TRS_CARD)}>
          <CardContent className="p-4 space-y-2">
            <div className={TRS_SUBTITLE}>Warm Intro Pipeline</div>
            <div className="text-2xl font-semibold text-black">
              {warmIntros}
            </div>
            <div className="text-xs text-gray-600">
              Across all active community partners
            </div>
          </CardContent>
        </Card>
        <Card className={cn(TRS_CARD)}>
          <CardContent className="p-4 space-y-2">
            <div className={TRS_SUBTITLE}>Potential Shared Revenue</div>
            <div className="text-2xl font-semibold text-black">
              {formatCurrency(totalPotentialValue)}
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-600">
              <span className="font-medium text-gray-700">↑ 14%</span>
              <span>vs last quarter</span>
            </div>
          </CardContent>
        </Card>
        <Card className={cn(TRS_CARD)}>
          <CardContent className="p-4 space-y-2">
            <div className={TRS_SUBTITLE}>Community Coverage</div>
            <div className="text-2xl font-semibold text-black">{coverage}%</div>
            <div className="text-xs text-gray-600">
              of ${Math.round(communityGoal / 1000)}K warm intro goal
            </div>
          </CardContent>
        </Card>
        <Card className={cn(TRS_CARD)}>
          <CardContent className="p-4 space-y-2">
            <div className={TRS_SUBTITLE}>Avg Partner Readiness</div>
            <div className="text-2xl font-semibold text-black">
              {avgReadiness}%
            </div>
            <div className="text-xs text-gray-600">
              Enablement score across portfolio
            </div>
          </CardContent>
        </Card>
      </div>

      {activeTab === "Overview" && (
        <div className="space-y-4">
          <Card className={cn(TRS_CARD, "p-4 space-y-4")}>
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div className="space-y-1">
                <PageTitle className="text-lg font-semibold text-black">
                  Local Relationship Intelligence
                </PageTitle>
                <PageDescription className="text-sm text-gray-500">
                  Snapshot of warm introductions, co-marketing momentum, and
                  where to invest the next coffee chat.
                </PageDescription>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => setShowLogModal(true)}
                >
                  + Log Relationship
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => router.push("/pipeline")}
                >
                  View Sales Pipeline
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
              <div className="rounded-lg border border-gray-200 p-3">
                <div className={TRS_SECTION_TITLE}>Relationship Momentum</div>
                <ul className="mt-3 space-y-2 text-sm text-gray-700">
                  {relationships.slice(0, 3).map((partner) => (
                    <li
                      key={partner.id}
                      className="flex items-center justify-between"
                    >
                      <div>
                        <div className="font-medium text-black">
                          {partner.name}
                        </div>
                        <div className="text-xs text-gray-500">
                          {partner.stage} • {partner.city}, {partner.state}
                        </div>
                      </div>
                      <Badge variant="outline">{partner.model}</Badge>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="rounded-lg border border-gray-200 p-3">
                <div className={TRS_SECTION_TITLE}>Next Warm Introductions</div>
                <ul className="mt-3 space-y-2 text-sm text-gray-700">
                  {activeOpportunities.slice(0, 4).map((opportunity) => (
                    <li
                      key={opportunity.id}
                      className="flex items-center justify-between"
                    >
                      <div>
                        <div className="font-medium text-black">
                          {opportunity.name}
                        </div>
                        <div className="text-xs text-gray-500">
                          {opportunity.partnerName} • {opportunity.type}
                        </div>
                      </div>
                      <span className="text-xs text-gray-600">
                        {formatCurrency(opportunity.value)}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="rounded-lg border border-gray-200 p-3">
                <div className={TRS_SECTION_TITLE}>Enablement Focus</div>
                <div className="mt-3 space-y-3 text-sm text-gray-700">
                  <div className="flex items-center justify-between">
                    <span>Ready advocates</span>
                    <Badge variant="success">{readinessByBand.ready}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Ramping partners</span>
                    <Badge variant="default">{readinessByBand.ramping}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Emerging allies</span>
                    <Badge variant="outline">{readinessByBand.emerging}</Badge>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
            <Card className={cn(TRS_CARD)}>
              <CardHeader>
                <CardTitle className="text-sm font-medium">
                  Recent Touchpoints
                </CardTitle>
                <CardDescription>
                  Recap of the last five relationship moves.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {upcomingInteractions.map((interaction) => (
                  <div
                    key={interaction.id}
                    className="rounded-lg border border-gray-200 p-3"
                  >
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-semibold text-black">
                        {interaction.partnerName}
                      </span>
                      <span className="text-xs text-gray-500">
                        {new Date(interaction.date).toLocaleDateString(
                          "en-US",
                          { month: "short", day: "numeric" },
                        )}
                      </span>
                    </div>
                    <div className="mt-1 text-xs uppercase tracking-wide text-gray-400">
                      {interaction.type} • {interaction.stage}
                    </div>
                    <p className="mt-2 text-sm text-gray-600">
                      {interaction.summary}
                    </p>
                    {interaction.nextStep && (
                      <div className="mt-2 rounded-md bg-gray-50 px-3 py-2 text-xs text-gray-600">
                        Next step: {interaction.nextStep}
                      </div>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className={cn(TRS_CARD)}>
              <CardHeader>
                <CardTitle className="text-sm font-medium">
                  Partner Coverage Map
                </CardTitle>
                <CardDescription>
                  Visualize strategic anchors across the metro ecosystem.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-gray-600">
                <div className="flex items-center justify-between rounded-lg border border-dashed border-gray-300 p-4">
                  <div>
                    <div className="text-sm font-semibold text-black">
                      Central Texas Growth Loop
                    </div>
                    <div className="text-xs text-gray-500">
                      Austin • Dallas • San Antonio • Houston
                    </div>
                  </div>
                  <div className="text-right text-xs text-gray-500">
                    {relationships.length} partners
                    <br />
                    {warmIntros} warm intros in play
                  </div>
                </div>
                <p>
                  Anchor partners like{" "}
                  <span className="font-medium text-black">
                    Stride Business Coalition
                  </span>{" "}
                  and
                  <span className="font-medium text-black">
                    {" "}
                    Artisan Retail Alliance
                  </span>{" "}
                  are fueling reciprocal deals and storytelling. Double down on
                  enablement to convert emerging partners into active champions.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {activeTab === "Directory" && (
        <Card className={cn(TRS_CARD)}>
          <CardHeader>
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <CardTitle>Partner Directory</CardTitle>
                <CardDescription>
                  Every local organization cultivating a mutual growth lane.
                </CardDescription>
              </div>
              <div className="flex flex-col gap-2 md:flex-row md:items-center">
                <Input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search by name, focus, or city"
                  className="h-9 md:w-64"
                />
                <div className="flex flex-wrap items-center gap-2">
                  <select
                    value={stageFilter}
                    onChange={(event) => setStageFilter(event.target.value)}
                    className="h-9 rounded-md border border-gray-200 bg-white px-3 text-sm"
                  >
                    <option value="all">All Stages</option>
                    {relationshipStages.map((stage) => (
                      <option key={stage} value={stage}>
                        {stage}
                      </option>
                    ))}
                  </select>
                  <select
                    value={modelFilter}
                    onChange={(event) => setModelFilter(event.target.value)}
                    className="h-9 rounded-md border border-gray-200 bg-white px-3 text-sm"
                  >
                    <option value="all">All Models</option>
                    {partnerModels.map((model) => (
                      <option key={model} value={model}>
                        {model}
                      </option>
                    ))}
                  </select>
                  <select
                    value={sortBy}
                    onChange={(event) => setSortBy(event.target.value)}
                    className="h-9 rounded-md border border-gray-200 bg-white px-3 text-sm"
                  >
                    <option value="readiness-desc">
                      Readiness (High to Low)
                    </option>
                    <option value="potential-desc">
                      Potential Value (High to Low)
                    </option>
                    <option value="potential-asc">
                      Potential Value (Low to High)
                    </option>
                    <option value="warm-desc">Warm Intros (High to Low)</option>
                    <option value="readiness-asc">
                      Readiness (Low to High)
                    </option>
                    <option value="name-asc">Name (A-Z)</option>
                    <option value="name-desc">Name (Z-A)</option>
                  </select>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Partner</TableHead>
                  <TableHead>Stage</TableHead>
                  <TableHead>Model</TableHead>
                  <TableHead>City</TableHead>
                  <TableHead className="text-right">Potential</TableHead>
                  <TableHead className="text-right">Warm Intros</TableHead>
                  <TableHead className="text-right">Readiness</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPartners.map((partner) => (
                  <TableRow
                    key={partner.id}
                    className="cursor-pointer transition hover:bg-gray-50"
                    onClick={() => router.push(`/partners/${partner.id}`)}
                  >
                    <TableCell>
                      <div className="font-medium text-black">
                        {partner.name}
                      </div>
                      <div className="text-xs text-gray-500">
                        {partner.focus}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{partner.stage}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="default">{partner.model}</Badge>
                    </TableCell>
                    <TableCell className="text-sm text-gray-600">
                      {partner.city}, {partner.state}
                    </TableCell>
                    <TableCell className="text-right font-medium text-black">
                      {formatCurrency(partner.potentialValue)}
                    </TableCell>
                    <TableCell className="text-right text-sm text-gray-700">
                      {partner.warmIntroductions}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2 text-xs text-gray-600">
                        <div className="h-2 w-16 overflow-hidden rounded-full bg-gray-100">
                          <div
                            className="h-full bg-gray-900"
                            style={{ width: `${partner.readinessScore}%` }}
                          />
                        </div>
                        <span className="font-medium text-black">
                          {partner.readinessScore}%
                        </span>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {activeTab === "Introductions" && (
        <Card className={cn(TRS_CARD)}>
          <CardHeader>
            <CardTitle className="text-sm font-medium">
              Warm Introductions & Co-Sell Plays
            </CardTitle>
            <CardDescription>
              Track every mutual opportunity in motion.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {activeOpportunities.map((opportunity) => (
              <div
                key={opportunity.id}
                className="rounded-lg border border-gray-200 p-3"
              >
                <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                  <div>
                    <div className="text-sm font-semibold text-black">
                      {opportunity.name}
                    </div>
                    <div className="text-xs text-gray-500">
                      {opportunity.partnerName} • {opportunity.type} •{" "}
                      {opportunity.status}
                    </div>
                  </div>
                  <div className="text-right text-sm font-medium text-black">
                    {formatCurrency(opportunity.value)}
                    <div className="text-xs font-normal text-gray-500">
                      Target: {opportunity.targetClient}
                    </div>
                  </div>
                </div>
                <div className="mt-2 flex flex-wrap items-center justify-between text-xs text-gray-500">
                  <span>
                    Expected wrap:{" "}
                    {new Date(opportunity.expectedClose).toLocaleDateString(
                      "en-US",
                      { month: "short", day: "numeric" },
                    )}
                  </span>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-7 px-3 text-xs"
                    onClick={() =>
                      router.push(
                        `/partners/${opportunity.partnerId}?tab=Introductions`,
                      )
                    }
                  >
                    View partner record
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {activeTab === "Enablement" && (
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
          <Card className={cn(TRS_CARD)}>
            <CardHeader>
              <CardTitle className="text-sm font-medium">
                Partner Enablement Roadmap
              </CardTitle>
              <CardDescription>
                Prioritize the assets that accelerate reciprocity.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                "Referral toolkit",
                "Co-branded event kit",
                "Revenue readiness dashboard",
              ].map((item, index) => (
                <div
                  key={item}
                  className="rounded-lg border border-gray-200 p-3"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-semibold text-black">
                        {item}
                      </div>
                      <div className="text-xs text-gray-500">
                        Owner:{" "}
                        {index === 0
                          ? "Jordan Blake"
                          : index === 1
                            ? "Morgan Lee"
                            : "Enablement"}
                      </div>
                    </div>
                    <Badge
                      variant={
                        index === 0
                          ? "success"
                          : index === 1
                            ? "default"
                            : "outline"
                      }
                    >
                      {index === 0
                        ? "Ready"
                        : index === 1
                          ? "In Flight"
                          : "Planned"}
                    </Badge>
                  </div>
                  <div className="mt-2 text-xs text-gray-500">
                    Align deliverables with partner strengths to keep intros
                    flowing.
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className={cn(TRS_CARD)}>
            <CardHeader>
              <CardTitle className="text-sm font-medium">
                Readiness Breakdown
              </CardTitle>
              <CardDescription>
                Where to invest coaching and storytelling next.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-gray-600">
              <div className="space-y-2">
                {["ready", "ramping", "emerging"].map((band) => (
                  <div key={band} className="flex items-center gap-3">
                    <div className="w-20 text-xs font-semibold uppercase text-gray-400">
                      {band}
                    </div>
                    <div className="flex-1">
                      <div className="h-2 rounded-full bg-gray-100">
                        <div
                          className={`h-full ${band === "ready" ? "bg-gray-900" : band === "ramping" ? "bg-gray-700" : "bg-gray-500"}`}
                          style={{
                            width: `${
                              relationships.length
                                ? (readinessByBand[
                                    band as keyof typeof readinessByBand
                                  ] /
                                    relationships.length) *
                                  100
                                : 0
                            }%`,
                          }}
                        />
                      </div>
                    </div>
                    <div className="w-12 text-right text-xs text-gray-500">
                      {readinessByBand[band as keyof typeof readinessByBand]}{" "}
                      partners
                    </div>
                  </div>
                ))}
              </div>
              <p>
                Share success stories and enablement kits with{" "}
                <span className="font-medium text-black">ramping</span> allies
                to graduate them into ready advocates this quarter.
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {showLogModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
          onClick={() => setShowLogModal(false)}
        >
          <div
            className="w-full max-w-xl rounded-lg border border-gray-200 bg-white p-6 shadow-xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mb-4 flex items-start justify-between">
              <div>
                <h2 className="text-lg font-semibold text-black">
                  Log new relationship
                </h2>
                <p className="text-sm text-gray-500">
                  Capture the essentials so you can nurture the next warm intro.
                </p>
              </div>
              <button
                onClick={() => setShowLogModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="text-sm font-medium text-black">
                    Organization name *
                  </label>
                  <Input
                    value={newRelationship.name}
                    onChange={(event) =>
                      setNewRelationship({
                        ...newRelationship,
                        name: event.target.value,
                      })
                    }
                    placeholder="e.g. Eastside Founders Guild"
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-black">
                    Organization type *
                  </label>
                  <Input
                    value={newRelationship.organizationType}
                    onChange={(event) =>
                      setNewRelationship({
                        ...newRelationship,
                        organizationType: event.target.value,
                      })
                    }
                    placeholder="Chamber, co-op, accelerator..."
                    className="mt-1"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="text-sm font-medium text-black">City</label>
                  <Input
                    value={newRelationship.city}
                    onChange={(event) =>
                      setNewRelationship({
                        ...newRelationship,
                        city: event.target.value,
                      })
                    }
                    placeholder="Austin"
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-black">
                    Stage
                  </label>
                  <select
                    value={newRelationship.stage}
                    onChange={(event) =>
                      setNewRelationship({
                        ...newRelationship,
                        stage: event.target.value as Partner["stage"],
                      })
                    }
                    className="mt-1 h-10 w-full rounded-md border border-gray-200 bg-white px-3 text-sm"
                  >
                    {relationshipStages.map((stage) => (
                      <option key={stage} value={stage}>
                        {stage}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-black">Owner</label>
                <Input
                  value={newRelationship.owner}
                  onChange={(event) =>
                    setNewRelationship({
                      ...newRelationship,
                      owner: event.target.value,
                    })
                  }
                  placeholder="Who is nurturing this?"
                  className="mt-1"
                />
              </div>

              <div className="flex justify-end gap-2 border-t border-gray-200 pt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowLogModal(false)}
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleCreateRelationship}
                >
                  Save relationship
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
