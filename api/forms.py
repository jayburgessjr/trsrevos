from typing import Any, Dict, List, Optional

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from database import db

router = APIRouter(prefix="/forms", tags=["forms"])


class FormFieldOption(BaseModel):
  label: str
  value: str


class FormFieldCondition(BaseModel):
  field: str
  operator: Optional[str] = Field(default="equals", pattern="^(equals|not_equals)$")
  value: Any


class FormField(BaseModel):
  key: str
  label: str
  type: str
  required: bool | None = False
  helperText: Optional[str] = None
  placeholder: Optional[str] = None
  min: Optional[float] = None
  max: Optional[float] = None
  step: Optional[float] = None
  options: Optional[List[FormFieldOption]] = None
  conditions: Optional[List[FormFieldCondition]] = None


class FormSchemaResponse(BaseModel):
  id: str
  title: str
  description: Optional[str] = None
  fields: List[FormField]


class FormSubmission(BaseModel):
  formId: str
  clientId: str
  formData: Dict[str, Any]
  status: Optional[str] = Field(default="draft", pattern="^(draft|submitted)$")


FORM_SCHEMAS: Dict[str, Dict[str, Any]] = {
  "client-intake": {
    "id": "client-intake",
    "title": "Client Intake",
    "description": "Establish GTM context, sponsor alignment, and core revenue metrics.",
    "fields": [
      {
        "key": "executiveSponsor",
        "label": "Executive sponsor",
        "type": "text",
        "required": True,
        "helperText": "Who ultimately signs off on revenue interventions?",
      },
      {
        "key": "businessModel",
        "label": "Business model",
        "type": "select",
        "required": True,
        "options": [
          {"label": "SaaS", "value": "saas"},
          {"label": "Services", "value": "services"},
          {"label": "Marketplace", "value": "marketplace"},
          {"label": "Hybrid", "value": "hybrid"},
        ],
      },
      {
        "key": "saasCustomers",
        "label": "Active SaaS customers",
        "type": "number",
        "helperText": "Only required for SaaS models.",
        "conditions": [{"field": "businessModel", "value": "saas"}],
      },
      {
        "key": "servicesMix",
        "label": "Services revenue mix (%)",
        "type": "number",
        "helperText": "Only required for services-led engagements.",
        "conditions": [{"field": "businessModel", "value": "services"}],
      },
      {
        "key": "northStar",
        "label": "North-star outcome",
        "type": "textarea",
        "required": True,
        "helperText": "What board-level outcome are we anchoring on?",
      },
    ],
  },
  "revenue-audit": {
    "id": "revenue-audit",
    "title": "Revenue Audit",
    "description": "Capture pipeline diagnostics and risk posture for the upcoming quarter.",
    "fields": [
      {
        "key": "currentArr",
        "label": "Current ARR ($)",
        "type": "number",
        "required": True,
      },
      {
        "key": "pipelineCoverage",
        "label": "Pipeline coverage (x)",
        "type": "number",
        "required": True,
      },
      {
        "key": "riskNotes",
        "label": "Key risk commentary",
        "type": "textarea",
        "helperText": "Highlight top risks to plan.",
      },
    ],
  },
  "pricing-diagnostic": {
    "id": "pricing-diagnostic",
    "title": "Pricing Diagnostic",
    "description": "Understand pricing guardrails, packaging, and discount strategy.",
    "fields": [
      {
        "key": "listToFloorDelta",
        "label": "List to floor delta (%)",
        "type": "number",
        "required": True,
      },
      {
        "key": "discountGuardrail",
        "label": "Discount guardrail confidence",
        "type": "slider",
        "min": 0,
        "max": 100,
        "step": 5,
        "helperText": "How confident are you in current guardrails?",
      },
      {
        "key": "pricingNotes",
        "label": "Packaging or pricing notes",
        "type": "textarea",
      },
    ],
  },
  "intervention-blueprint": {
    "id": "intervention-blueprint",
    "title": "Intervention Blueprint",
    "description": "Plan the intervention backlog and resource alignment.",
    "fields": [
      {
        "key": "priorityWorkstream",
        "label": "Top priority workstream",
        "type": "text",
        "required": True,
      },
      {
        "key": "owner",
        "label": "Workstream owner",
        "type": "text",
        "required": True,
      },
      {
        "key": "confidence",
        "label": "Execution confidence",
        "type": "slider",
        "min": 0,
        "max": 100,
        "step": 10,
      },
      {
        "key": "dependencies",
        "label": "Critical dependencies",
        "type": "textarea",
      },
    ],
  },
  "outcome-report": {
    "id": "outcome-report",
    "title": "Outcome Report",
    "description": "Summarize realized outcomes and board updates.",
    "fields": [
      {
        "key": "realizedArr",
        "label": "Realized ARR impact ($)",
        "type": "number",
        "required": True,
      },
      {
        "key": "leadingIndicator",
        "label": "Leading indicator movement",
        "type": "text",
      },
      {
        "key": "boardSummary",
        "label": "Board-ready summary",
        "type": "textarea",
        "required": True,
      },
    ],
  },
}


@router.get("/schema/{formId}", response_model=FormSchemaResponse)
async def get_schema(formId: str) -> FormSchemaResponse:
  normalized = formId.lower()
  schema = FORM_SCHEMAS.get(normalized)

  if not schema:
    title = formId.replace("-", " ").title()
    schema = {
      "id": normalized,
      "title": title,
      "description": "Dynamic schema placeholder.",
      "fields": [
        {
          "key": "revenue",
          "label": "Current Monthly Revenue",
          "type": "number",
        },
        {
          "key": "churn",
          "label": "Customer Churn %",
          "type": "number",
        },
        {
          "key": "notes",
          "label": "Additional Notes",
          "type": "text",
        },
      ],
    }

  return FormSchemaResponse(**schema)


@router.post("/save")
async def save_form(submission: FormSubmission):
  status = submission.status or "draft"

  client = await db.fetch_one(
    "SELECT id FROM clients WHERE id = :client_id",
    {"client_id": submission.clientId},
  )
  if not client:
    raise HTTPException(status_code=404, detail="Client not found")

  await db.insert(
    "client_forms",
    {
      "client_id": submission.clientId,
      "form_id": submission.formId,
      "data": submission.formData,
      "status": status,
    },
  )

  await db.insert(
    "client_deliverables",
    {
      "client_id": submission.clientId,
      "reference": submission.formId,
      "type": "Form Submission",
      "status": "Completed" if status == "submitted" else "Draft",
    },
  )

  return {"status": "success"}
