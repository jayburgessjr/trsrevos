"use client";

import { useCallback, useMemo } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ResourceList, Text } from "@shopify/polaris";

import { PageTemplate } from "@/components/layout/PageTemplate";
import { PageTabs } from "@/components/layout/PageTabs";
import { resolveTabs } from "@/lib/tabs";

import { FormCard, type FormSummary } from "./components/FormCard";

const forms: FormSummary[] = [
  {
    id: "client-intake",
    title: "Client Intake",
    category: "Clarity",
    description: "Capture GTM profile, executive sponsor, and current revenue metrics to prime every engagement.",
    completion: 0,
    status: "Not Started",
  },
  {
    id: "revenue-audit",
    title: "Revenue Audit",
    category: "Audit",
    description: "Snapshot pipeline health, forecast coverage, and governance to identify immediate revenue lifts.",
    completion: 0,
  },
  {
    id: "pricing-diagnostic",
    title: "Pricing Diagnostic",
    category: "Audit",
    description: "Break down win rates, discount guardrails, and packaging opportunities by segment.",
    completion: 0,
  },
  {
    id: "intervention-blueprint",
    title: "Intervention Blueprint",
    category: "Execution",
    description: "Map intervention backlog, resourcing, and board checkpoints to accelerate revenue change.",
    completion: 0,
  },
  {
    id: "outcome-report",
    title: "Outcome Report",
    category: "Outtake",
    description: "Summarize leading indicators, realized ARR impact, and next-quarter priorities for sponsors.",
    completion: 0,
  },
];

export default function FormsIndexPage() {
  const pathname = usePathname();
  const tabs = useMemo(() => resolveTabs(pathname), [pathname]);
  const activeTab = "Forms";

  const hrefForTab = useCallback((tab: string) => {
    if (tab === "Forms") {
      return "/resources/forms";
    }

    const params = new URLSearchParams();
    params.set("tab", tab);
    return `/resources?${params.toString()}`;
  }, []);

  return (
    <PageTemplate
      title="RevenueOS Smart Forms"
      description="Collect client intelligence across the engagement lifecycle and sync deliverables automatically."
      badges={[
        { label: "Schema-driven" },
        { label: "Auto-save", variant: "success" as const },
        { label: "Deliverables sync", variant: "default" as const },
      ]}
    >
      <PageTabs tabs={tabs} activeTab={activeTab} hrefForTab={hrefForTab} />

      <div className="mt-6 rounded-xl border border-[color:var(--color-outline)] bg-white">
        <ResourceList
          resourceName={{ singular: "form", plural: "forms" }}
          items={forms}
          renderItem={(form) => <FormCard key={form.id} form={form} />}
          emptyState={<Text as="p" tone="subdued">No forms available yet.</Text>}
        />
      </div>

      <div className="mt-6 text-sm text-[color:var(--color-text-muted)]">
        <Text as="p" variant="bodySm" tone="subdued">
          Need a custom form? {" "}
          <Link href="/projects?tab=Create" className="font-medium text-[color:var(--color-positive)]">
            Brief the Revenue Science team
          </Link>
          {" "}and we can publish it instantly once the schema is defined.
        </Text>
      </div>
    </PageTemplate>
  );
}
