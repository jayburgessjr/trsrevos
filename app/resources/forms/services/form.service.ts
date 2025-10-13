export type FormFieldType = "text" | "number" | "select" | "slider" | "textarea";

export type FieldConditionOperator = "equals" | "not_equals";

export interface FieldCondition {
  field: string;
  operator?: FieldConditionOperator;
  value: string | number | boolean;
}

export interface FormFieldOption {
  label: string;
  value: string;
}

export interface FormField {
  key: string;
  label: string;
  type: FormFieldType;
  required?: boolean;
  helperText?: string;
  placeholder?: string;
  min?: number;
  max?: number;
  step?: number;
  options?: FormFieldOption[];
  conditions?: FieldCondition[];
}

export interface FormSchema {
  id: string;
  title: string;
  description?: string;
  fields: FormField[];
}

export interface ClientOption {
  id: string;
  name: string;
  industry?: string | null;
  mrr?: number | null;
}

export type FormSubmissionStatus = "draft" | "submitted";

export interface SaveFormPayload {
  formId: string;
  clientId: string;
  formData: Record<string, unknown>;
  status?: FormSubmissionStatus;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_TRS_API_BASE_URL ?? "/api";

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || "Unexpected server response");
  }

  return (await response.json()) as T;
}

export async function fetchFormSchema(formId: string): Promise<FormSchema> {
  const response = await fetch(`${API_BASE_URL}/forms/schema/${formId}`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
    cache: "no-store",
  });

  return handleResponse<FormSchema>(response);
}

export async function fetchClients(): Promise<ClientOption[]> {
  const response = await fetch(`${API_BASE_URL}/clients/list`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
    cache: "no-store",
  });

  return handleResponse<ClientOption[]>(response);
}

export async function saveFormSubmission(
  payload: SaveFormPayload,
): Promise<{ status: string }> {
  const response = await fetch(`${API_BASE_URL}/forms/save`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  return handleResponse<{ status: string }>(response);
}
