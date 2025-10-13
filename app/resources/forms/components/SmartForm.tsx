"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Banner,
  BlockStack,
  Button,
  Card,
  Divider,
  FormLayout,
  InlineStack,
  ProgressBar,
  RangeSlider,
  Select,
  Text,
  TextField,
} from "@shopify/polaris";
import { showToast } from "@/ui/toast";
import {
  type FormField,
  type FormSchema,
  type FormSubmissionStatus,
  saveFormSubmission,
} from "../services/form.service";

interface SmartFormProps {
  formId: string;
  schema: FormSchema;
  clientId?: string;
  initialValues?: Record<string, unknown>;
}

interface FieldRenderContext {
  field: FormField;
  value: unknown;
  onChange: (value: unknown) => void;
  error?: string;
}

const AUTOSAVE_INTERVAL = 30_000;

function isEmpty(value: unknown) {
  if (value === null || value === undefined) {
    return true;
  }

  if (typeof value === "string") {
    return value.trim().length === 0;
  }

  if (Array.isArray(value)) {
    return value.length === 0;
  }

  return false;
}

function shouldRenderField(field: FormField, values: Record<string, unknown>) {
  if (!field.conditions || field.conditions.length === 0) {
    return true;
  }

  return field.conditions.every((condition) => {
    const targetValue = values[condition.field];
    const operator = condition.operator ?? "equals";

    switch (operator) {
      case "not_equals":
        return String(targetValue).toLowerCase() !== String(condition.value).toLowerCase();
      case "equals":
      default:
        return String(targetValue).toLowerCase() === String(condition.value).toLowerCase();
    }
  });
}

function renderField({ field, value, onChange, error }: FieldRenderContext) {
  const label = field.label;
  const placeholder = field.placeholder;

  switch (field.type) {
    case "number":
      return (
        <TextField
          label={label}
          type="number"
          value={value === undefined || value === null ? "" : String(value)}
          onChange={(next) => onChange(next === "" ? undefined : Number(next))}
          helpText={field.helperText}
          placeholder={placeholder}
          autoComplete="off"
          error={error}
        />
      );
    case "select":
      return (
        <Select
          label={label}
          options={field.options ?? []}
          value={value === undefined || value === null ? "" : String(value)}
          onChange={(next) => onChange(next)}
          placeholder="Select an option"
          helpText={field.helperText}
          error={error}
        />
      );
    case "slider":
      return (
        <RangeSlider
          label={label}
          value={typeof value === "number" ? value : field.min ?? 0}
          onChange={(next) => onChange(next)}
          output
          min={field.min ?? 0}
          max={field.max ?? 100}
          step={field.step ?? 1}
          helpText={field.helperText}
        />
      );
    case "textarea":
      return (
        <TextField
          label={label}
          value={value === undefined || value === null ? "" : String(value)}
          onChange={onChange}
          helpText={field.helperText}
          placeholder={placeholder}
          autoComplete="off"
          multiline
          error={error}
        />
      );
    case "text":
    default:
      return (
        <TextField
          label={label}
          value={value === undefined || value === null ? "" : String(value)}
          onChange={onChange}
          helpText={field.helperText}
          placeholder={placeholder}
          autoComplete="off"
          error={error}
        />
      );
  }
}

export function SmartForm({ formId, schema, clientId, initialValues }: SmartFormProps) {
  const [values, setValues] = useState<Record<string, unknown>>(initialValues ?? {});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
  const [isDirty, setIsDirty] = useState(false);
  const valuesRef = useRef(values);

  const updateValue = useCallback((fieldKey: string, next: unknown) => {
    setValues((current) => {
      const existing = current[fieldKey];
      const nextValue = next;

      if (existing === nextValue || (isEmpty(existing) && isEmpty(nextValue))) {
        return current;
      }

      setIsDirty(true);

      if (nextValue === undefined) {
        const { [fieldKey]: _removed, ...rest } = current;
        return rest;
      }

      return { ...current, [fieldKey]: nextValue };
    });
  }, []);

  useEffect(() => {
    setValues(initialValues ?? {});
    setErrors({});
    setIsDirty(false);
  }, [initialValues]);

  useEffect(() => {
    valuesRef.current = values;
  }, [values]);

  const visibleFields = useMemo(
    () => schema.fields.filter((field) => shouldRenderField(field, values)),
    [schema.fields, values],
  );

  const completion = useMemo(() => {
    if (visibleFields.length === 0) {
      return 0;
    }

    const filled = visibleFields.reduce((count, field) => {
      const value = values[field.key];
      return count + (isEmpty(value) ? 0 : 1);
    }, 0);

    return Math.round((filled / visibleFields.length) * 100);
  }, [visibleFields, values]);

  const validate = useCallback(() => {
    const nextErrors: Record<string, string> = {};

    for (const field of visibleFields) {
      if (field.required && isEmpty(values[field.key])) {
        nextErrors[field.key] = "This field is required.";
      }
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }, [visibleFields, values]);

  const persist = useCallback(
    async (status: FormSubmissionStatus, silent = false) => {
      if (!clientId) {
        if (!silent) {
          showToast({
            title: "Select a client",
            description: "Choose a client before saving the form.",
            variant: "warning",
          });
        }
        return false;
      }

      const payload = {
        formId,
        clientId,
        formData: valuesRef.current,
        status,
      } as const;

      if (status === "submitted") {
        setIsSubmitting(true);
      } else {
        setIsSavingDraft(true);
      }

      try {
        await saveFormSubmission(payload);
        setLastSavedAt(new Date());
        setIsDirty(false);
        if (!silent) {
          showToast({
            title: status === "submitted" ? "Form submitted" : "Draft saved",
            description:
              status === "submitted"
                ? "The submission has been linked to the client deliverables."
                : "We saved your progress and linked it to the client deliverables.",
            variant: "success",
          });
        }
        return true;
      } catch (error) {
        const message = error instanceof Error ? error.message : "Unable to save the form.";
        if (!silent) {
          showToast({
            title: "Save failed",
            description: message,
            variant: "destructive",
          });
        }
        return false;
      } finally {
        if (status === "submitted") {
          setIsSubmitting(false);
        } else {
          setIsSavingDraft(false);
        }
      }
    },
    [clientId, formId],
  );

  const handleDraftSave = useCallback(async () => {
    await persist("draft");
  }, [persist]);

  const handleSubmit = useCallback(async () => {
    const valid = validate();
    if (!valid) {
      showToast({
        title: "Check required fields",
        description: "Please complete the highlighted fields before submitting.",
        variant: "warning",
      });
      return;
    }

    await persist("submitted");
  }, [persist, validate]);

  useEffect(() => {
    if (!clientId) {
      return;
    }

    const interval = window.setInterval(() => {
      if (isDirty) {
        void persist("draft", true);
      }
    }, AUTOSAVE_INTERVAL);

    return () => window.clearInterval(interval);
  }, [clientId, isDirty, persist]);

  return (
    <Card padding="500" roundedAbove="sm">
      <BlockStack gap="500">
        <InlineStack align="space-between" blockAlign="center" gap="400" wrap={false}>
          <BlockStack gap="200">
            <Text variant="headingMd" as="h2">
              {schema.title}
            </Text>
            {schema.description ? (
              <Text as="p" variant="bodyMd" tone="subdued">
                {schema.description}
              </Text>
            ) : null}
          </BlockStack>
          <BlockStack gap="200" align="end">
            <Text as="span" tone="subdued" variant="bodySm">
              Completion
            </Text>
            <ProgressBar progress={completion} size="small" />
            <Text as="span" variant="bodySm">
              {completion}% complete
            </Text>
          </BlockStack>
        </InlineStack>

        {!clientId ? (
          <Banner title="Select a client" tone="warning">
            <Text as="p" variant="bodySm">
              Please choose a client before entering form responses so we can sync deliverables.
            </Text>
          </Banner>
        ) : null}

        <FormLayout>
          {visibleFields.map((field) => (
            <div key={field.key}>
              {renderField({
                field,
                value: values[field.key],
                onChange: (next) => updateValue(field.key, next),
                error: errors[field.key],
              })}
            </div>
          ))}
          {visibleFields.length === 0 ? (
            <Text as="p" tone="subdued">
              No fields are currently required for this configuration.
            </Text>
          ) : null}
        </FormLayout>

        <Divider />

        <InlineStack align="space-between" blockAlign="center" gap="400" wrap={false}>
          <BlockStack gap="100">
            <Text as="span" variant="bodySm" tone="subdued">
              Auto-save runs every 30 seconds when changes are detected.
            </Text>
            {lastSavedAt ? (
              <Text as="span" variant="bodySm" tone="subdued">
                Last saved {lastSavedAt.toLocaleTimeString()}
              </Text>
            ) : null}
          </BlockStack>
          <InlineStack gap="300">
            <Button
              disabled={!clientId}
              loading={isSavingDraft}
              onClick={handleDraftSave}
              variant="secondary"
            >
              Save draft
            </Button>
            <Button
              disabled={!clientId}
              loading={isSubmitting}
              onClick={handleSubmit}
              variant="primary"
            >
              Submit
            </Button>
          </InlineStack>
        </InlineStack>
      </BlockStack>
    </Card>
  );
}
