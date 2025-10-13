"use client";

import Link from "next/link";
import { Badge, BlockStack, InlineStack, ProgressBar, ResourceItem, Text } from "@shopify/polaris";

export interface FormSummary {
  id: string;
  title: string;
  category: string;
  description: string;
  completion?: number;
  status?: "Draft" | "Completed" | "Not Started";
}

interface FormCardProps {
  form: FormSummary;
}

export function FormCard({ form }: FormCardProps) {
  const completion = Math.max(0, Math.min(100, form.completion ?? 0));
  const status = form.status ?? (completion > 0 ? "Draft" : "Not Started");

  return (
    <ResourceItem
      id={form.id}
      url={`/resources/forms/${form.id}`}
      accessibilityLabel={`Open ${form.title}`}
    >
      <InlineStack align="space-between" blockAlign="start" gap="400" wrap={false}>
        <BlockStack gap="200">
          <InlineStack gap="200" align="start">
            <Text variant="headingMd" as="h3">
              {form.title}
            </Text>
            <Badge tone="success">{form.category}</Badge>
          </InlineStack>
          <Text as="p" variant="bodyMd" tone="subdued">
            {form.description}
          </Text>
          <Link
            href={`/resources/forms/${form.id}`}
            className="mt-2 inline-flex items-center text-sm font-medium text-[color:var(--color-positive)] hover:underline"
          >
            Open form
          </Link>
        </BlockStack>
        <BlockStack gap="200" align="end">
          <InlineStack align="space-between" blockAlign="center" gap="200">
            <Text as="span" variant="bodySm" tone="subdued">
              {status}
            </Text>
            <Text as="span" variant="bodySm">
              {completion}%
            </Text>
          </InlineStack>
          <ProgressBar progress={completion} size="small" />
        </BlockStack>
      </InlineStack>
    </ResourceItem>
  );
}
