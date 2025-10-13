"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, usePathname, useRouter } from "next/navigation";
import { Banner, BlockStack, Card, InlineStack, Select, Spinner, Text } from "@shopify/polaris";

import { PageTemplate } from "@/components/layout/PageTemplate";
import { PageTabs } from "@/components/layout/PageTabs";
import { resolveTabs } from "@/lib/tabs";

import { SmartForm } from "../components/SmartForm";
import {
  type ClientOption,
  type FormSchema,
  fetchClients,
  fetchFormSchema,
} from "../services/form.service";

export default function SmartFormDetailPage() {
  const params = useParams<{ formId: string }>();
  const formId = Array.isArray(params.formId) ? params.formId[0] : params.formId;
  const pathname = usePathname();
  const router = useRouter();

  const [schema, setSchema] = useState<FormSchema | null>(null);
  const [clients, setClients] = useState<ClientOption[]>([]);
  const [selectedClientId, setSelectedClientId] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function load() {
      setLoading(true);
      setError(null);

      try {
        const [schemaResponse, clientResponse] = await Promise.all([
          fetchFormSchema(formId),
          fetchClients(),
        ]);

        if (!isMounted) {
          return;
        }

        setSchema(schemaResponse);
        setClients(clientResponse);
        if (clientResponse.length > 0) {
          setSelectedClientId((current) => current || clientResponse[0].id);
        }
      } catch (requestError) {
        if (!isMounted) {
          return;
        }

        const message =
          requestError instanceof Error ? requestError.message : "Unable to load form schema.";
        setError(message);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    void load();

    return () => {
      isMounted = false;
    };
  }, [formId]);

  const tabs = useMemo(() => resolveTabs(pathname), [pathname]);
  const activeTab = "Forms";

  const hrefForTab = useCallback(
    (tab: string) => {
      if (tab === "Forms") {
        return "/resources/forms";
      }

      const params = new URLSearchParams();
      params.set("tab", tab);
      return `/resources?${params.toString()}`;
    },
    [],
  );

  const clientOptions = useMemo(
    () => clients.map((client) => ({ label: client.name, value: client.id })),
    [clients],
  );

  useEffect(() => {
    if (!tabs.includes("Forms")) {
      router.replace("/resources");
    }
  }, [router, tabs]);

  return (
    <PageTemplate
      title={schema?.title ?? "Smart Form"}
      description={
        schema?.description ?? "Complete the engagement form and link it directly to client deliverables."
      }
      badges={[
        { label: "Auto-save" },
        { label: "Deliverables sync", variant: "success" as const },
      ]}
    >
      <PageTabs tabs={tabs} activeTab={activeTab} hrefForTab={hrefForTab} />

      <div className="mt-6 flex flex-col gap-4">
        <Link
          href="/resources/forms"
          className="text-sm font-medium text-[color:var(--color-positive)] hover:underline"
        >
          ← Back to Smart Forms
        </Link>

        {loading ? (
          <Card padding="500" roundedAbove="sm">
            <InlineStack align="center" blockAlign="center" gap="300">
              <Spinner accessibilityLabel="Loading form" size="large" />
              <Text as="span" variant="bodyMd">
                Loading form schema…
              </Text>
            </InlineStack>
          </Card>
        ) : error ? (
          <Banner title="Unable to load form" tone="critical">
            <Text as="p" variant="bodySm">
              {error}
            </Text>
          </Banner>
        ) : schema ? (
          <BlockStack gap="400">
            <Card padding="500" roundedAbove="sm">
              <BlockStack gap="200">
                <Select
                  label="Client"
                  options={clientOptions}
                  onChange={(value) => setSelectedClientId(value)}
                  value={selectedClientId}
                  placeholder="Select client"
                  disabled={clientOptions.length === 0}
                  helpText="The selected client will automatically receive this form under their Deliverables tab."
                />
                {clientOptions.length === 0 ? (
                  <Text as="p" tone="subdued" variant="bodySm">
                    Add clients to RevenueOS to start capturing deliverables.
                  </Text>
                ) : null}
              </BlockStack>
            </Card>

            <SmartForm formId={formId} schema={schema} clientId={selectedClientId} />
          </BlockStack>
        ) : (
          <Banner title="Form not found" tone="critical">
            <Text as="p" variant="bodySm">
              The requested form is not available.
            </Text>
          </Banner>
        )}
      </div>
    </PageTemplate>
  );
}
