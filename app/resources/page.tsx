"use client";

import { useCallback, useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { PageTemplate } from "@/components/layout/PageTemplate";
import { PageTabs } from "@/components/layout/PageTabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/ui/card";
import { TRS_CARD } from "@/lib/style";
import { resolveTabs } from "@/lib/tabs";
import { calculatorCategories } from "./calculator-data";

const infoSectionClass =
  "rounded-lg border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700";

const infoTitleClass = "text-xs font-semibold uppercase tracking-wide text-black";


export default function ResourcesPage() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();

  const tabs = useMemo(() => resolveTabs(pathname), [pathname]);
  const activeTab = useMemo(() => {
    const current = searchParams.get("tab");
    return current && tabs.includes(current) ? current : tabs[0];
  }, [searchParams, tabs]);

  const activeCategory = useMemo(
    () =>
      calculatorCategories.find((category) => category.name === activeTab) ??
      calculatorCategories[0],
    [activeTab],
  );

  const calcParam = searchParams.get("calc");
  const activeCalculator = useMemo(() => {
    if (!activeCategory) {
      return undefined;
    }

    return (
      activeCategory.calculators.find((calculator) => calculator.title === calcParam) ??
      activeCategory.calculators[0]
    );
  }, [activeCategory, calcParam]);

  const calculatorTabs = activeCategory?.calculators.map((calculator) => calculator.title) ?? [];

  const buildTabHref = useCallback(
    (tab: string) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set("tab", tab);

      const category = calculatorCategories.find((item) => item.name === tab);
      const defaultCalculator = category?.calculators[0]?.title;

      if (defaultCalculator) {
        params.set("calc", defaultCalculator);
      } else {
        params.delete("calc");
      }

      const query = params.toString();

      return query ? `${pathname}?${query}` : pathname;
    },
    [pathname, searchParams],
  );

  const handleCalculatorChange = useCallback(
    (calculatorTitle: string) => {
      if (!activeCategory) {
        return;
      }

      const params = new URLSearchParams(searchParams.toString());
      params.set("tab", activeCategory.name);
      params.set("calc", calculatorTitle);

      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [activeCategory, pathname, router, searchParams],
  );

  const infoSections = useMemo(() => {
    if (!activeCalculator) {
      return [];
    }

    const sections: { title: string; items: string[] }[] = [];

    if (activeCalculator.playbook.length > 0) {
      sections.push({ title: "Use this when", items: activeCalculator.playbook });
    }

    if (activeCalculator.inputs.length > 0) {
      sections.push({ title: "Inputs", items: activeCalculator.inputs });
    }

    if (activeCalculator.outputs.length > 0) {
      sections.push({ title: "Outputs", items: activeCalculator.outputs });
    }

    if (activeCalculator.notes && activeCalculator.notes.length > 0) {
      sections.push({ title: "Notes", items: activeCalculator.notes });
    }

    return sections;
  }, [activeCalculator]);

  return (
    <PageTemplate
      title="Resources & Calculators"
      description="Finance-ready calculators to pressure test pricing, revenue, profit, and board-ready scenarios in minutes."
      badges={[
        { label: "Prebuilt GTM formulas" },
        { label: "Live benchmarks", variant: "success" as const },
        { label: "Downloadable templates", variant: "default" as const },
      ]}
    >
      <PageTabs tabs={tabs} activeTab={activeTab} hrefForTab={buildTabHref} />

      {activeCategory && activeCalculator && (
        <div className="mt-6 space-y-6">
          <Card className={TRS_CARD}>
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-black">
                {activeCategory.name} calculators
              </CardTitle>
              <CardDescription className="text-sm text-gray-500">
                {activeCategory.description}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <PageTabs
                tabs={calculatorTabs}
                activeTab={activeCalculator.title}
                onTabChange={handleCalculatorChange}
                className="border-0 px-0 pb-0"
              />
            </CardContent>
          </Card>

          <Card className={TRS_CARD}>
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-black">
                {activeCalculator.title}
              </CardTitle>
              <CardDescription className="text-sm text-gray-500">
                {activeCalculator.summary}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                {infoSections.map((section) => (
                  <div key={section.title} className={infoSectionClass}>
                    <p className={infoTitleClass}>{section.title}</p>
                    <ul className="mt-2 space-y-2">
                      {section.items.map((item) => (
                        <li key={item} className="text-sm leading-snug text-gray-700">
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </PageTemplate>
  );
}
