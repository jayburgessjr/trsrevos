"use client";

import { useMemo } from "react";
import { usePathname, useSearchParams } from "next/navigation";

import { Card } from "@/components/kit/Card";
import { resolveTabs } from "@/lib/tabs";

const pipelineContent = [
  {
    id: "pricing-report",
    title: "Pricing Strategy Deep Dive",
    stage: "Production",
    owner: "Morgan Lee",
    nextStep: "Design review",
    impact: "High",
  },
  {
    id: "revenue-architecture",
    title: "Revenue Architecture Playbook",
    stage: "Draft",
    owner: "Jay Burgess",
    nextStep: "Messaging alignment",
    impact: "Medium",
  },
  {
    id: "partner-kit",
    title: "Partner Enablement Kit",
    stage: "Outline",
    owner: "Riya Kapoor",
    nextStep: "Collect proof points",
    impact: "High",
  },
];

const ideaBacklog = [
  { id: "roi-series", title: "ROI Narrative Series", focus: "Conversion", notes: "Use ACME pilot data" },
  { id: "ops-automation", title: "Operations Automation Field Guide", focus: "Adoption", notes: "Pair with compounding" },
  { id: "growth-podcast", title: "Growth Architect Podcast", focus: "Awareness", notes: "Feature partner stories" },
];

const scheduledReleases = [
  { id: "nov-webinar", channel: "Webinar", date: "Nov 12", asset: "RevenueOS Q4 Roadmap", owner: "Amelia" },
  { id: "blog-launch", channel: "Blog", date: "Nov 18", asset: "Retention Diagnostics", owner: "Noah" },
  { id: "newsletter", channel: "Newsletter", date: "Oct 28", asset: "Compounding Insights", owner: "Dana" },
];

const performanceHighlights = [
  { id: "pricing", asset: "Pricing Deep Dive", reach: "3.2k views", lift: "+24% demo volume", status: "Top performer" },
  { id: "playbook", asset: "Revenue Architecture Playbook", reach: "1.8k downloads", lift: "+12% win rate", status: "Steady" },
  { id: "webinar", asset: "Collections Webinar", reach: "950 attendees", lift: "+18% expansion", status: "Emerging" },
];

export default function ContentStudioPage() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const tabs = useMemo(() => resolveTabs(pathname), [pathname]);
  const activeTab = useMemo(() => {
    const current = searchParams.get("tab");
    return current && tabs.includes(current) ? current : tabs[0];
  }, [searchParams, tabs]);

  return (
    <div className="w-full px-6 py-6 space-y-6">
      <header className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold text-black">Content Studio</h1>
        <p className="text-sm text-gray-600">
          Build and distribute the revenue narrative across channels with clear stage visibility.
        </p>
      </header>

      {activeTab === "Pipeline" && (
        <Card className="p-4">
          <div className="text-sm font-semibold text-black">Active Content Flow</div>
          <div className="mt-3 overflow-hidden rounded-lg border border-gray-200">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-left text-[12px] uppercase tracking-wide text-gray-500">
                <tr>
                  <th className="px-3 py-2 font-medium">Title</th>
                  <th className="px-3 py-2 font-medium">Stage</th>
                  <th className="px-3 py-2 font-medium">Owner</th>
                  <th className="px-3 py-2 font-medium">Next Step</th>
                  <th className="px-3 py-2 font-medium">Impact</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {pipelineContent.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-3 py-2 font-medium text-black">{item.title}</td>
                    <td className="px-3 py-2 text-gray-700">{item.stage}</td>
                    <td className="px-3 py-2 text-gray-700">{item.owner}</td>
                    <td className="px-3 py-2 text-gray-700">{item.nextStep}</td>
                    <td
                      className={`px-3 py-2 text-sm ${
                        item.impact === "High"
                          ? "text-emerald-600"
                          : item.impact === "Medium"
                          ? "text-amber-600"
                          : "text-gray-600"
                      }`}
                    >
                      {item.impact}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {activeTab === "Ideas" && (
        <Card className="p-4">
          <div className="text-sm font-semibold text-black">Idea Backlog</div>
          <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-3">
            {ideaBacklog.map((idea) => (
              <div key={idea.id} className="rounded-lg border border-gray-200 p-3">
                <div className="text-sm font-medium text-black">{idea.title}</div>
                <div className="mt-1 text-[12px] text-gray-600">Focus: {idea.focus}</div>
                <div className="mt-2 text-[12px] text-gray-500">{idea.notes}</div>
                <button
                  type="button"
                  className="mt-3 inline-flex items-center justify-center rounded-lg border border-gray-300 px-3 py-1 text-[12px] font-medium text-gray-700 transition hover:border-black hover:text-black"
                >
                  Prioritize
                </button>
              </div>
            ))}
          </div>
        </Card>
      )}

      {activeTab === "Scheduled" && (
        <Card className="p-4">
          <div className="text-sm font-semibold text-black">Scheduled Distribution</div>
          <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-3">
            {scheduledReleases.map((release) => (
              <div key={release.id} className="rounded-lg border border-gray-200 p-3">
                <div className="text-[11px] uppercase tracking-wide text-gray-500">{release.channel}</div>
                <div className="mt-1 text-lg font-semibold text-black">{release.asset}</div>
                <div className="text-[12px] text-gray-600">Launch: {release.date}</div>
                <div className="text-[12px] text-gray-600">Owner: {release.owner}</div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {activeTab === "Performance" && (
        <Card className="p-4">
          <div className="text-sm font-semibold text-black">Performance Signals</div>
          <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-3">
            {performanceHighlights.map((highlight) => (
              <div key={highlight.id} className="rounded-lg border border-gray-200 p-3">
                <div className="text-sm font-medium text-black">{highlight.asset}</div>
                <div className="mt-1 text-[12px] text-gray-600">Reach: {highlight.reach}</div>
                <div className="text-[12px] text-gray-600">Impact: {highlight.lift}</div>
                <div
                  className={`mt-2 text-[12px] font-semibold ${
                    highlight.status === "Top performer"
                      ? "text-emerald-600"
                      : highlight.status === "Emerging"
                      ? "text-amber-600"
                      : "text-gray-600"
                  }`}
                >
                  {highlight.status}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
