"use client";

import { useMemo, useState, useTransition } from "react";

import { createProspect } from "@/core/pipeline/actions";
import { Button } from "@/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/ui/card";
import { Input } from "@/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/ui/table";

const CSV_TEMPLATE = `Company Name,Deal Name,Amount,Expected Close Date,Industry,Region,Primary Contact,Contact Email,Contact Phone,Next Step
Acme Corp,Q1 Expansion,50000,2025-03-31,SaaS,North America,Jamie Lee,jamie@example.com,+1 (555) 010-1234,Discovery call scheduled`;

type ParsedProspect = {
  rowNumber: number;
  companyName: string;
  dealName: string;
  amount: number;
  expectedCloseDate?: string;
  industry?: string;
  region?: string;
  primaryContact?: string;
  contactEmail?: string;
  contactPhone?: string;
  nextStep?: string;
};

type ImportProspectsModalProps = {
  onClose: () => void;
  userId: string;
};

type ParseResult = {
  prospects: ParsedProspect[];
  errors: string[];
  warnings: string[];
};

function downloadTemplate() {
  const blob = new Blob([CSV_TEMPLATE], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "prospects-template.csv";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function normalizeHeader(value: string) {
  return value.trim().toLowerCase().replace(/[^a-z0-9]/g, "");
}

const HEADER_MAP: Record<string, keyof ParsedProspect | "rowNumber" | null> = {
  companyname: "companyName",
  dealname: "dealName",
  amount: "amount",
  expectedclosedate: "expectedCloseDate",
  industry: "industry",
  region: "region",
  primarycontact: "primaryContact",
  contactemail: "contactEmail",
  contactphone: "contactPhone",
  nextstep: "nextStep",
};

const REQUIRED_HEADERS = ["companyname", "dealname", "amount"];

const HEADER_LABELS: Record<string, string> = {
  companyname: "Company Name",
  dealname: "Deal Name",
  amount: "Amount",
  expectedclosedate: "Expected Close Date",
  industry: "Industry",
  region: "Region",
  primarycontact: "Primary Contact",
  contactemail: "Contact Email",
  contactphone: "Contact Phone",
  nextstep: "Next Step",
};

function parseCsv(content: string): ParseResult {
  const rows: string[][] = [];
  let current = "";
  let row: string[] = [];
  let insideQuotes = false;

  const pushValue = () => {
    row.push(current);
    current = "";
  };

  const pushRow = () => {
    if (row.length === 0) return;
    const isEmpty = row.every((value) => value.trim() === "");
    if (!isEmpty) {
      rows.push(row);
    }
    row = [];
  };

  for (let i = 0; i < content.length; i += 1) {
    const char = content[i];

    if (char === "\r") {
      if (insideQuotes) {
        current += char;
        continue;
      }

      pushValue();

      if (content[i + 1] === "\n") {
        i += 1;
      }

      pushRow();
      continue;
    }

    if (char === "\n") {
      if (insideQuotes) {
        current += char;
        continue;
      }

      pushValue();
      pushRow();
      continue;
    }

    if (char === '"') {
      if (insideQuotes && content[i + 1] === '"') {
        current += '"';
        i += 1;
      } else {
        insideQuotes = !insideQuotes;
      }
      continue;
    }

    if (char === "," && !insideQuotes) {
      pushValue();
      continue;
    }

    current += char;
  }

  if (current.length > 0 || row.length > 0) {
    pushValue();
    pushRow();
  }

  if (rows.length === 0) {
    return {
      prospects: [],
      errors: ["No data rows found in CSV"],
      warnings: [],
    };
  }

  const [headerRow, ...dataRows] = rows;
  const headerKeys = headerRow.map((header) => normalizeHeader(header));
  const missing = REQUIRED_HEADERS.filter(
    (required) => !headerKeys.includes(required),
  );

  if (missing.length > 0) {
    return {
      prospects: [],
      errors: [
        `Missing required columns: ${missing
          .map((value) => HEADER_LABELS[value] ?? value)
          .join(", ")}. Required columns are Company Name, Deal Name, and Amount.`,
      ],
      warnings: [],
    };
  }

  const columnMap = headerKeys.map((key) => HEADER_MAP[key] ?? null);
  const warnings: string[] = [];
  const prospects: ParsedProspect[] = [];
  const errors: string[] = [];

  dataRows.forEach((values, index) => {
    const rowNumber = index + 2; // account for header row
    const prospect: ParsedProspect = {
      rowNumber,
      companyName: "",
      dealName: "",
      amount: 0,
    };
    const rowErrors: string[] = [];

    columnMap.forEach((key, columnIndex) => {
      if (!key || key === "rowNumber") {
        return;
      }

      const rawValue = (values[columnIndex] ?? "").trim();

      if (key === "amount") {
        const numericValue = parseFloat(rawValue.replace(/[$,]/g, ""));
        if (Number.isNaN(numericValue)) {
          rowErrors.push("Amount must be a number");
        } else {
          prospect.amount = numericValue;
        }
        return;
      }

      if (rawValue) {
        (prospect as ParsedProspect & Record<string, string | number | undefined>)[
          key
        ] = rawValue;
      }
    });

    if (!prospect.companyName) {
      rowErrors.push("Company Name is required");
    }
    if (!prospect.dealName) {
      rowErrors.push("Deal Name is required");
    }
    if (!prospect.amount || prospect.amount <= 0) {
      rowErrors.push("Amount must be greater than 0");
    }

    if (rowErrors.length > 0) {
      errors.push(`Row ${rowNumber}: ${rowErrors.join(", ")}`);
      return;
    }

    const optionalFields: (keyof ParsedProspect)[] = [
      "expectedCloseDate",
      "industry",
      "region",
      "primaryContact",
      "contactEmail",
      "contactPhone",
      "nextStep",
    ];

    optionalFields.forEach((field) => {
      if (!prospect[field]) {
        return;
      }

      if (field === "expectedCloseDate") {
        const date = new Date(prospect[field] as string);
        if (Number.isNaN(date.getTime())) {
          warnings.push(
            `Row ${rowNumber}: Expected Close Date "${prospect[field]}" is not a valid date. Value will be ignored.`,
          );
          delete prospect.expectedCloseDate;
        }
      }

      if (field === "contactEmail") {
        const value = prospect[field] as string;
        const emailPattern = /.+@.+\..+/;
        if (!emailPattern.test(value)) {
          warnings.push(
            `Row ${rowNumber}: Contact Email "${value}" does not appear valid.`,
          );
        }
      }
    });

    prospects.push(prospect);
  });

  return { prospects, errors, warnings };
}

export function ImportProspectsModal({
  onClose,
  userId,
}: ImportProspectsModalProps) {
  const [fileName, setFileName] = useState<string | null>(null);
  const [parseErrors, setParseErrors] = useState<string[]>([]);
  const [parseWarnings, setParseWarnings] = useState<string[]>([]);
  const [prospects, setProspects] = useState<ParsedProspect[]>([]);
  const [importErrors, setImportErrors] = useState<string[]>([]);
  const [successCount, setSuccessCount] = useState<number | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleCancel = () => {
    if (!isPending) {
      onClose();
    }
  };

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    setImportErrors([]);
    setSuccessCount(null);

    if (!file) {
      setFileName(null);
      setProspects([]);
      setParseErrors([]);
      setParseWarnings([]);
      return;
    }

    const content = await file.text();
    const result = parseCsv(content);

    setFileName(file.name);
    setParseErrors(result.errors);
    setParseWarnings(result.warnings);
    setProspects(result.prospects);

    // reset the input so the same file can be re-uploaded if needed
    event.target.value = "";
  };

  const handleImport = () => {
    if (prospects.length === 0) {
      setParseErrors(["Upload a CSV with at least one valid row before importing."]);
      return;
    }

    setImportErrors([]);
    setSuccessCount(null);

    startTransition(async () => {
      const errors: string[] = [];
      let successes = 0;

      for (const prospect of prospects) {
        const result = await createProspect({
          companyName: prospect.companyName,
          dealName: prospect.dealName,
          amount: prospect.amount,
          expectedCloseDate: prospect.expectedCloseDate,
          owner_id: userId,
          industry: prospect.industry,
          region: prospect.region,
          primaryContact: prospect.primaryContact,
          contactEmail: prospect.contactEmail,
          contactPhone: prospect.contactPhone,
          nextStep: prospect.nextStep,
        });

        if (result.success) {
          successes += 1;
        } else {
          errors.push(
            `Row ${prospect.rowNumber}: ${result.error ?? "Failed to create prospect"}`,
          );
        }
      }

      setSuccessCount(successes);
      setImportErrors(errors);

      if (errors.length === 0) {
        onClose();
        window.location.reload();
      }
    });
  };

  const previewProspects = useMemo(
    () => prospects.slice(0, 5),
    [prospects],
  );

  const summaryText = useMemo(() => {
    if (prospects.length === 0) {
      return "";
    }

    return prospects.length === 1
      ? "1 prospect ready to import"
      : `${prospects.length} prospects ready to import`;
  }, [prospects.length]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={(event) => {
        if (event.target === event.currentTarget && !isPending) {
          onClose();
        }
      }}
    >
      <Card className="w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="border-b border-gray-200">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl font-semibold text-gray-900">
              Import Prospects from CSV
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCancel}
              disabled={isPending}
              className="h-8 w-8 p-0"
            >
              ✕
            </Button>
          </div>
          <p className="text-sm text-gray-500 mt-1">
            Upload a CSV file using the provided column names to create prospects in bulk.
          </p>
        </CardHeader>

        <CardContent className="space-y-6 p-6">
          <div className="space-y-3">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="text-sm font-semibold text-gray-900">
                  CSV Requirements
                </h3>
                <p className="text-xs text-gray-500">
                  Required columns: Company Name, Deal Name, Amount. Optional: Expected Close Date, Industry, Region, Primary Contact, Contact Email, Contact Phone, Next Step.
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={downloadTemplate}
              >
                Download template
              </Button>
            </div>

            <label className="flex flex-col gap-2 rounded-md border border-dashed border-gray-300 bg-gray-50 p-4 text-sm text-gray-600 hover:border-gray-400">
              <span className="font-medium text-gray-800">
                {fileName ? `Selected file: ${fileName}` : "Upload prospects CSV"}
              </span>
              <Input
                type="file"
                accept=".csv"
                onChange={handleFileUpload}
                disabled={isPending}
                className="cursor-pointer"
              />
            </label>

            {summaryText ? (
              <p className="text-sm text-gray-700">{summaryText}</p>
            ) : null}

            {parseWarnings.length > 0 && (
              <div className="rounded-md border border-yellow-200 bg-yellow-50 p-3 text-xs text-yellow-800">
                <p className="font-medium">Warnings</p>
                <ul className="mt-1 list-disc space-y-1 pl-4">
                  {parseWarnings.map((warning) => (
                    <li key={warning}>{warning}</li>
                  ))}
                </ul>
              </div>
            )}

            {parseErrors.length > 0 && (
              <div className="rounded-md border border-red-200 bg-red-50 p-3 text-xs text-red-700">
                <p className="font-medium">Fix these errors before importing:</p>
                <ul className="mt-1 list-disc space-y-1 pl-4">
                  {parseErrors.map((error) => (
                    <li key={error}>{error}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {previewProspects.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-gray-900">Preview (first 5 rows)</h3>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Company</TableHead>
                    <TableHead>Deal</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Close Date</TableHead>
                    <TableHead>Next Step</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {previewProspects.map((prospect) => (
                    <TableRow key={prospect.rowNumber}>
                      <TableCell className="font-medium">
                        {prospect.companyName}
                      </TableCell>
                      <TableCell>{prospect.dealName}</TableCell>
                      <TableCell>${prospect.amount.toLocaleString()}</TableCell>
                      <TableCell>{prospect.expectedCloseDate ?? "—"}</TableCell>
                      <TableCell>{prospect.nextStep ?? "—"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {prospects.length > 5 ? (
                <p className="text-xs text-gray-500">
                  Showing first 5 of {prospects.length} rows.
                </p>
              ) : null}
            </div>
          )}

          {successCount !== null && (
            <div className="rounded-md border border-green-200 bg-green-50 p-3 text-xs text-green-800">
              Imported {successCount} {successCount === 1 ? "prospect" : "prospects"} successfully.
            </div>
          )}

          {importErrors.length > 0 && (
            <div className="rounded-md border border-red-200 bg-red-50 p-3 text-xs text-red-700">
              <p className="font-medium">Some rows could not be imported:</p>
              <ul className="mt-1 list-disc space-y-1 pl-4">
                {importErrors.map((error) => (
                  <li key={error}>{error}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="flex items-center justify-end gap-3 border-t border-gray-200 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="primary"
              onClick={handleImport}
              disabled={isPending || prospects.length === 0 || parseErrors.length > 0}
            >
              {isPending ? "Importing…" : "Import Prospects"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
