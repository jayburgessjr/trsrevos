"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  useTransition,
} from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import { TRS_CARD } from "@/lib/style";
import { resolveTabs } from "@/lib/tabs";
import { PageTabs } from "@/components/layout/PageTabs";
import CommandCard from "@/components/morning/CommandCard";
import KpiTile from "@/components/morning/KpiTile";
import PriorityRow from "@/components/morning/PriorityRow";
import SummaryFeed from "@/components/morning/SummaryFeed";
import CoPilotDrawer from "@/components/morning/CoPilotDrawer";
import NewsTicker from "@/components/morning/NewsTicker";
import NewsFeed from "@/components/morning/NewsFeed";
import {
  computePlan,
  lockPlan,
  startFocusBlock,
  completeFocusBlock,
  downloadIcal,
  generateRecap,
  getMorningState,
} from "@/core/morning/actions";

type S = Awaited<ReturnType<typeof getMorningState>>;
type BriefTab = "Inbox" | "Calendar";

export default function MorningPage() {
  const [s, setS] = useState<S | null>(null);
  const [pending, start] = useTransition();
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
  const [briefTab, setBriefTab] = useState<BriefTab>("Inbox");

  useEffect(() => {
    (async () => setS(await getMorningState()))();
  }, []);

  useEffect(() => {
    if (activeTab !== "Morning Brief") {
      setBriefTab("Inbox");
    }
  }, [activeTab]);

  const refresh = async () => setS(await getMorningState());

  if (!s) return <div className="p-3 text-sm text-gray-600">Loading…</div>;

  const greeting = new Date().toLocaleDateString(undefined, {
    weekday: "long",
    month: "short",
    day: "numeric",
  });

  const inboxItems = [
    {
      id: "1",
      sender: "Allison (CEO)",
      subject: "Board prep: confirm revenue narrative",
      preview: "Can you tighten the ARR slide track? Need a draft by noon.",
      receivedAt: "7:45 AM",
      priority: "High",
    },
    {
      id: "2",
      sender: "Revenue Ops",
      subject: "Pipeline scrubbing results",
      preview: "Flagged 4 deals slipping to next month. Need approvals.",
      receivedAt: "7:22 AM",
      priority: "Medium",
    },
    {
      id: "3",
      sender: "Enablement",
      subject: "Q4 playbook refresh",
      preview: "Draft outline ready for review in the shared drive.",
      receivedAt: "6:58 AM",
      priority: "Low",
    },
    {
      id: "4",
      sender: "Collections",
      subject: "Invoice follow-up: Northwind",
      preview: "Client requested revised payment terms—need a response today.",
      receivedAt: "6:31 AM",
      priority: "High",
    },
    {
      id: "5",
      sender: "Partnerships",
      subject: "New co-marketing opportunity",
      preview: "Figma shared a draft for the fall webinar campaign.",
      receivedAt: "6:05 AM",
      priority: "Medium",
    },
    {
      id: "6",
      sender: "Finance",
      subject: "DSO improvement ideas",
      preview: "Proposing a collections sprint to pull forward $380K.",
      receivedAt: "Yesterday",
      priority: "Medium",
    },
  ];

  const appointments = [
    {
      id: "cal-1",
      time: "8:30 AM",
      title: "Revenue stand-up",
      location: "Zoom",
      attendees: "Sales + RevOps",
    },
    {
      id: "cal-2",
      time: "10:00 AM",
      title: "Enterprise forecast review",
      location: "War room",
      attendees: "Leadership team",
    },
    {
      id: "cal-3",
      time: "12:30 PM",
      title: "Customer lunch: Acme Renewals",
      location: "Downtown Cafe",
      attendees: "CS + AE",
    },
    {
      id: "cal-4",
      time: "3:00 PM",
      title: "Pricing committee",
      location: "Room 4B",
      attendees: "Finance + Deal desk",
    },
    {
      id: "cal-5",
      time: "4:30 PM",
      title: "Investor check-in",
      location: "Zoom",
      attendees: "CEO + CFO",
    },
  ];

  const tasks = [
    {
      id: "task-1",
      title: "Lock Q4 pipeline plan",
      due: "Due 11:00 AM",
      status: "In progress",
    },
    {
      id: "task-2",
      title: "Approve new focus block rotation",
      due: "Due 1:00 PM",
      status: "Blocked",
    },
    {
      id: "task-3",
      title: "Send recap to executive team",
      due: "Due 5:00 PM",
      status: "Not started",
    },
    {
      id: "task-4",
      title: "Confirm collections outreach list",
      due: "Due 2:30 PM",
      status: "In review",
    },
  ];

  const topEmails = inboxItems.slice(0, 5);
  const briefTabs: BriefTab[] = ["Inbox", "Calendar"];

  return (
    <div className="mx-auto max-w-7xl space-y-4 px-4 py-4">
      <PageTabs tabs={tabs} activeTab={activeTab} hrefForTab={buildTabHref} />

      <section className={cn(TRS_CARD, "p-3")}>
        <div className="flex items-center justify-between">
          <div>
            <div className="text-lg font-semibold text-black">Good morning</div>
            <div className="text-[12px] text-gray-500">
              {greeting} • Momentum: {s.momentum} • {s.note}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() =>
                start(async () => {
                  await computePlan();
                  await refresh();
                })
              }
              disabled={pending}
              className="rounded-md border px-2 py-1 text-xs"
            >
              Compute Plan
            </button>
            <button
              onClick={() =>
                start(async () => {
                  await lockPlan();
                  await refresh();
                })
              }
              disabled={pending}
              className="rounded-md border px-2 py-1 text-xs"
            >
              {s.planLocked ? "Locked" : "Lock Plan"}
            </button>
            <button
              onClick={() =>
                start(async () => {
                  await downloadIcal();
                })
              }
              className="rounded-md border px-2 py-1 text-xs"
            >
              Download iCal
            </button>
            <CoPilotDrawer />
          </div>
        </div>
      </section>

      {activeTab === "Today" && (
        <>
          <section className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-4">
            <KpiTile
              label="Pipeline Dollars"
              value={`${s.kpis.pipelineDollars.toLocaleString()}`}
              hint="vs yesterday"
            />
            <KpiTile label="Win Rate" value={`${s.kpis.winRatePct}%`} />
            <KpiTile
              label="Price Realization"
              value={`${s.kpis.priceRealizationPct}%`}
            />
            <KpiTile
              label="Focus Sessions"
              value={`${s.kpis.focusSessionsToday}`}
              hint="Completed today"
            />
          </section>

          <section className="grid grid-cols-1 gap-3 lg:grid-cols-3">
            <div className="lg:col-span-1">
              <CommandCard
                title="Start Focus Block (90m)"
                desc="Run a deep work sprint on your top priority."
                state="ready"
                action={
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() =>
                        start(async () => {
                          await startFocusBlock();
                        })
                      }
                      className="rounded-md border px-2 py-1 text-xs"
                    >
                      Start
                    </button>
                    <button
                      onClick={() =>
                        start(async () => {
                          await completeFocusBlock();
                          await refresh();
                        })
                      }
                      className="rounded-md border px-2 py-1 text-xs"
                    >
                      Complete
                    </button>
                  </div>
                }
              />
            </div>
            <div className="lg:col-span-2">
              <div className={cn(TRS_CARD, "p-3")}>
                <div className="mb-2 text-sm font-semibold text-black">
                  Today&apos;s Priorities
                </div>
                <div className="space-y-2">
                  {s.priorities.length === 0 ? (
                    <div className="text-[13px] text-gray-600">
                      No priorities yet. Compute your plan to get curated
                      actions.
                    </div>
                  ) : (
                    s.priorities.map((p) => (
                      <PriorityRow
                        key={p.id}
                        title={p.title}
                        why={p.why}
                        roi={p.roi$}
                        effort={p.effort}
                        status={p.status}
                        onCheck={() => {
                          /* stub */
                        }}
                        onDefer={() => {
                          /* stub */
                        }}
                      />
                    ))
                  )}
                </div>
              </div>
            </div>
          </section>

          <section className="grid grid-cols-1 gap-3 md:grid-cols-3">
            <div className={cn(TRS_CARD, "flex h-full flex-col p-3")}>
              <div className="mb-2 text-sm font-semibold text-black">
                Top 5 Emails
              </div>
              <div className="space-y-2">
                {topEmails.map((email) => (
                  <div
                    key={email.id}
                    className="rounded-lg border border-gray-100 bg-white p-3"
                  >
                    <div className="flex items-center justify-between text-[11px] text-gray-500">
                      <span className="font-medium text-gray-700">
                        {email.sender}
                      </span>
                      <span>{email.receivedAt}</span>
                    </div>
                    <div className="mt-1 text-[13px] font-semibold text-black">
                      {email.subject}
                    </div>
                    <div className="mt-1 text-[12px] text-gray-600">
                      {email.preview}
                    </div>
                    <div className="mt-2 text-[11px] font-medium text-gray-500">
                      Priority: {email.priority}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className={cn(TRS_CARD, "flex h-full flex-col p-3")}>
              <div className="mb-2 text-sm font-semibold text-black">
                Today&apos;s Schedule
              </div>
              <div className="space-y-2">
                {appointments.map((event) => (
                  <div
                    key={event.id}
                    className="rounded-lg border border-gray-100 bg-white p-3"
                  >
                    <div className="text-[11px] font-medium text-gray-500">
                      {event.time}
                    </div>
                    <div className="text-[13px] font-semibold text-black">
                      {event.title}
                    </div>
                    <div className="text-[12px] text-gray-600">
                      {event.location}
                    </div>
                    <div className="text-[11px] text-gray-500">
                      Attendees: {event.attendees}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className={cn(TRS_CARD, "flex h-full flex-col p-3")}>
              <div className="mb-2 text-sm font-semibold text-black">
                Today&apos;s Tasks
              </div>
              <div className="space-y-2">
                {tasks.map((task) => (
                  <div
                    key={task.id}
                    className="rounded-lg border border-gray-100 bg-white p-3"
                  >
                    <div className="text-[13px] font-semibold text-black">
                      {task.title}
                    </div>
                    <div className="text-[12px] text-gray-600">{task.due}</div>
                    <div className="text-[11px] font-medium text-gray-500">
                      Status: {task.status}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <CommandCard
              title="Generate EOD Recap"
              desc="Summarize dollars advanced, shipped items, risks, first action tomorrow."
              state="ready"
              action={
                <button
                  onClick={() =>
                    start(async () => {
                      await generateRecap();
                    })
                  }
                  className="rounded-md border px-2 py-1 text-xs"
                >
                  Generate
                </button>
              }
            />
            <div className={cn(TRS_CARD, "p-3")}>
              <div className="mb-2 text-sm font-semibold text-black">
                Revenue Digest
              </div>
              <SummaryFeed
                items={[
                  "Pipeline confidence improved +4.2% overnight; education vertical slow approvals.",
                  "Pricing changes lifted margin forecast by +3.2% M/M.",
                  "Two invoices delayed; collections outreach recommended.",
                ]}
              />
            </div>
          </section>

          <section className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <NewsTicker />
            <NewsFeed />
          </section>

          <section className="pb-6 text-right">
            <a
              href="/dashboard"
              className="rounded-md border px-2 py-1 text-xs"
            >
              Open Executive Dashboard
            </a>
          </section>
        </>
      )}

      {activeTab === "This Week" && (
        <section className="grid grid-cols-1 gap-3 lg:grid-cols-2">
          <div className={cn(TRS_CARD, "p-4")}>
            <div className="mb-3 text-sm font-semibold text-black">
              Weekly Momentum Plan
            </div>
            <ul className="space-y-3 text-[13px] text-gray-700">
              <li className="rounded-lg border border-gray-100 bg-white p-3">
                <div className="text-sm font-semibold text-black">
                  Close $1.8M in expansion
                </div>
                <div className="text-[12px] text-gray-600">
                  Target accounts: Northwind, Globex, Wayfinder
                </div>
                <div className="mt-2 text-[11px] text-gray-500">
                  Owner: Enterprise pod • Status: Tracking
                </div>
              </li>
              <li className="rounded-lg border border-gray-100 bg-white p-3">
                <div className="text-sm font-semibold text-black">
                  Accelerate collections cycle
                </div>
                <div className="text-[12px] text-gray-600">
                  Launch outreach to all invoices &gt; 30 days
                </div>
                <div className="mt-2 text-[11px] text-gray-500">
                  Owner: Finance • Status: In motion
                </div>
              </li>
              <li className="rounded-lg border border-gray-100 bg-white p-3">
                <div className="text-sm font-semibold text-black">
                  Ship updated pricing guardrails
                </div>
                <div className="text-[12px] text-gray-600">
                  Align deal desk + enablement by Thursday
                </div>
                <div className="mt-2 text-[11px] text-gray-500">
                  Owner: Pricing committee • Status: On track
                </div>
              </li>
            </ul>
          </div>
          <div className={cn(TRS_CARD, "p-4")}>
            <div className="mb-3 text-sm font-semibold text-black">
              Key Metrics Watchlist
            </div>
            <div className="space-y-3 text-[13px] text-gray-700">
              <div className="flex items-center justify-between rounded-lg border border-gray-100 bg-white p-3">
                <div>
                  <div className="font-semibold text-black">
                    Pipeline Coverage
                  </div>
                  <div className="text-[12px] text-gray-600">
                    Goal: 4.5x • Current: 4.1x
                  </div>
                </div>
                <span className="text-[12px] text-emerald-600">
                  Trending up
                </span>
              </div>
              <div className="flex items-center justify-between rounded-lg border border-gray-100 bg-white p-3">
                <div>
                  <div className="font-semibold text-black">Bookings Pace</div>
                  <div className="text-[12px] text-gray-600">
                    Goal: $420K/week • Current: $395K
                  </div>
                </div>
                <span className="text-[12px] text-amber-600">
                  Needs attention
                </span>
              </div>
              <div className="flex items-center justify-between rounded-lg border border-gray-100 bg-white p-3">
                <div>
                  <div className="font-semibold text-black">Focus Sessions</div>
                  <div className="text-[12px] text-gray-600">
                    Goal: 15 • Completed: {s.kpis.focusSessionsToday}
                  </div>
                </div>
                <span className="text-[12px] text-gray-500">
                  Mid-week review tomorrow
                </span>
              </div>
            </div>
          </div>
        </section>
      )}

      {activeTab === "Focus Blocks" && (
        <section className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <div className={cn(TRS_CARD, "p-4")}>
            <div className="mb-3 text-sm font-semibold text-black">
              Planned Deep Work
            </div>
            <div className="space-y-3 text-[13px] text-gray-700">
              <div className="rounded-lg border border-gray-100 bg-white p-3">
                <div className="text-sm font-semibold text-black">
                  Strategic accounts review
                </div>
                <div className="text-[12px] text-gray-600">
                  90m • Owner: You
                </div>
                <div className="mt-1 text-[11px] text-gray-500">
                  Outcome: Confirm expansion roadmap
                </div>
              </div>
              <div className="rounded-lg border border-gray-100 bg-white p-3">
                <div className="text-sm font-semibold text-black">
                  Pricing guardrails draft
                </div>
                <div className="text-[12px] text-gray-600">
                  60m • Owner: Deal desk
                </div>
                <div className="mt-1 text-[11px] text-gray-500">
                  Outcome: Package scenarios for review
                </div>
              </div>
              <div className="rounded-lg border border-gray-100 bg-white p-3">
                <div className="text-sm font-semibold text-black">
                  Collections acceleration
                </div>
                <div className="text-[12px] text-gray-600">
                  45m • Owner: Finance
                </div>
                <div className="mt-1 text-[11px] text-gray-500">
                  Outcome: Prioritize $380K backlog
                </div>
              </div>
            </div>
          </div>
          <div className={cn(TRS_CARD, "p-4")}>
            <div className="mb-3 text-sm font-semibold text-black">
              Recent Sessions
            </div>
            <ul className="space-y-3 text-[13px] text-gray-700">
              <li className="flex items-center justify-between rounded-lg border border-gray-100 bg-white p-3">
                <div>
                  <div className="font-semibold text-black">
                    Partner activation audit
                  </div>
                  <div className="text-[12px] text-gray-600">
                    Completed yesterday • 75m
                  </div>
                </div>
                <span className="text-[12px] text-emerald-600">Complete</span>
              </li>
              <li className="flex items-center justify-between rounded-lg border border-gray-100 bg-white p-3">
                <div>
                  <div className="font-semibold text-black">
                    Forecast calibration
                  </div>
                  <div className="text-[12px] text-gray-600">
                    Completed Monday • 60m
                  </div>
                </div>
                <span className="text-[12px] text-emerald-600">Complete</span>
              </li>
              <li className="flex items-center justify-between rounded-lg border border-gray-100 bg-white p-3">
                <div>
                  <div className="font-semibold text-black">
                    Team enablement sync
                  </div>
                  <div className="text-[12px] text-gray-600">
                    Scheduled Thursday • 45m
                  </div>
                </div>
                <span className="text-[12px] text-amber-600">Upcoming</span>
              </li>
            </ul>
          </div>
        </section>
      )}

      {activeTab === "Risks" && (
        <section className="grid grid-cols-1 gap-3 lg:grid-cols-2">
          <div className={cn(TRS_CARD, "p-4")}>
            <div className="mb-3 text-sm font-semibold text-black">
              Top Risks
            </div>
            <div className="space-y-3 text-[13px] text-gray-700">
              <div className="rounded-lg border border-gray-100 bg-white p-3">
                <div className="text-sm font-semibold text-black">
                  Collections slip in enterprise
                </div>
                <div className="text-[12px] text-gray-600">
                  $540K outstanding &gt; 45 days
                </div>
                <div className="mt-1 text-[11px] text-gray-500">
                  Mitigation: Finance sprint + AE escalation
                </div>
              </div>
              <div className="rounded-lg border border-gray-100 bg-white p-3">
                <div className="text-sm font-semibold text-black">
                  Pricing pressure in EMEA
                </div>
                <div className="text-[12px] text-gray-600">
                  Win rate down 6 pts week-over-week
                </div>
                <div className="mt-1 text-[11px] text-gray-500">
                  Mitigation: Launch value-based play
                </div>
              </div>
              <div className="rounded-lg border border-gray-100 bg-white p-3">
                <div className="text-sm font-semibold text-black">
                  Enablement backlog
                </div>
                <div className="text-[12px] text-gray-600">
                  New reps lacking updated collateral
                </div>
                <div className="mt-1 text-[11px] text-gray-500">
                  Mitigation: Publish draft by Friday
                </div>
              </div>
            </div>
          </div>
          <div className={cn(TRS_CARD, "p-4")}>
            <div className="mb-3 text-sm font-semibold text-black">
              Alerts & Signals
            </div>
            <SummaryFeed
              items={[
                "3 high-value renewals without active champions.",
                "Partner-sourced pipeline pacing below commit line.",
                "Marketing qualified pipeline flat week-over-week.",
              ]}
            />
          </div>
        </section>
      )}

      {activeTab === "Morning Brief" && (
        <section className="space-y-3">
          <div className={cn(TRS_CARD, "overflow-hidden")}>
            <div className="flex border-b border-gray-200 bg-gray-50 text-sm font-medium">
              {briefTabs.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setBriefTab(tab)}
                  className={cn(
                    "flex-1 px-4 py-2 transition",
                    briefTab === tab
                      ? "bg-white text-black"
                      : "text-gray-600 hover:text-black",
                  )}
                >
                  {tab}
                </button>
              ))}
            </div>
            <div className="p-4">
              {briefTab === "Inbox" && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-semibold text-black">
                        Today&apos;s Inbox
                      </div>
                      <div className="text-[12px] text-gray-500">
                        Highest leverage threads curated from overnight
                        activity.
                      </div>
                    </div>
                    <button className="rounded-md border px-3 py-1 text-[12px]">
                      Compose
                    </button>
                  </div>
                  {inboxItems.map((email) => (
                    <div
                      key={email.id}
                      className="rounded-lg border border-gray-100 bg-white p-4"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="text-[12px] font-semibold text-gray-700">
                            {email.sender}
                          </div>
                          <div className="text-sm font-semibold text-black">
                            {email.subject}
                          </div>
                          <div className="mt-1 text-[12px] text-gray-600">
                            {email.preview}
                          </div>
                        </div>
                        <div className="text-right text-[11px] text-gray-500">
                          <div>{email.receivedAt}</div>
                          <div className="mt-1 rounded-full border border-emerald-500 px-2 py-0.5 text-[11px] text-emerald-600">
                            {email.priority} priority
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {briefTab === "Calendar" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-semibold text-black">
                        Today&apos;s Calendar
                      </div>
                      <div className="text-[12px] text-gray-500">
                        Deep work blocks and customer moments lined up.
                      </div>
                    </div>
                    <button className="rounded-md border px-3 py-1 text-[12px]">
                      Add Event
                    </button>
                  </div>
                  <div className="relative">
                    <div
                      className="absolute left-[7px] top-0 h-full w-[2px] bg-gray-200"
                      aria-hidden
                    />
                    <div className="space-y-4">
                      {appointments.map((event, idx) => (
                        <div key={event.id} className="relative flex gap-4">
                          <div className="mt-1 flex flex-col items-center">
                            <div className="flex h-4 w-4 items-center justify-center rounded-full border border-gray-300 bg-white text-[10px] font-semibold text-gray-500">
                              {idx + 1}
                            </div>
                          </div>
                          <div className={cn(TRS_CARD, "flex-1 p-3")}>
                            <div className="text-[11px] font-medium text-gray-500">
                              {event.time}
                            </div>
                            <div className="text-sm font-semibold text-black">
                              {event.title}
                            </div>
                            <div className="text-[12px] text-gray-600">
                              {event.location}
                            </div>
                            <div className="text-[11px] text-gray-500">
                              Attendees: {event.attendees}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
