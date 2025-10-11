"use client";

import { useState, useTransition } from "react";
import { Card, CardContent } from "@/ui/card";
import { Button } from "@/ui/button";
import { Input } from "@/ui/input";
import { Select } from "@/ui/select";
import { createProspect } from "@/core/pipeline/actions";

type AddProspectModalProps = {
  onClose: () => void;
  userId: string;
};

type SegmentOption = "" | "SMB" | "Mid" | "Enterprise";

type ProspectFormState = {
  companyName: string;
  segment: SegmentOption;
  arr: string;
  industry: string;
  region: string;
  dealName: string;
  amount: string;
  expectedCloseDate: string;
};

const INITIAL_FORM_STATE: ProspectFormState = {
  companyName: "",
  segment: "",
  arr: "",
  industry: "",
  region: "",
  dealName: "",
  amount: "",
  expectedCloseDate: "",
};

export function AddProspectModal({ onClose, userId }: AddProspectModalProps) {
  const [formData, setFormData] = useState<ProspectFormState>({
    ...INITIAL_FORM_STATE,
  });
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.companyName.trim() || !formData.dealName.trim() || !formData.amount) {
      setError("Please fill in all required fields");
      return;
    }

    const parsedAmount = Number.parseFloat(formData.amount);
    if (Number.isNaN(parsedAmount) || parsedAmount <= 0) {
      setError("Enter a valid deal amount greater than 0");
      return;
    }

    let parsedArr: number | undefined;
    if (formData.arr) {
      const arrValue = Number.parseFloat(formData.arr);
      if (Number.isNaN(arrValue) || arrValue < 0) {
        setError("Enter a valid ARR amount or leave it blank");
        return;
      }
      parsedArr = Number(arrValue.toFixed(2));
    }

    const segmentValue =
      formData.segment === "SMB" ||
      formData.segment === "Mid" ||
      formData.segment === "Enterprise"
        ? formData.segment
        : undefined;

    startTransition(async () => {
      const result = await createProspect({
        companyName: formData.companyName.trim(),
        segment: segmentValue,
        arr: parsedArr,
        industry: formData.industry.trim() || undefined,
        region: formData.region.trim() || undefined,
        dealName: formData.dealName.trim(),
        amount: Number(parsedAmount.toFixed(2)),
        expectedCloseDate: formData.expectedCloseDate || undefined,
        owner_id: userId,
      });

      if (result.success) {
        setFormData({ ...INITIAL_FORM_STATE });
        onClose();
      } else {
        setError(result.error || "Failed to create prospect");
      }
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isPending) {
          onClose();
        }
      }}
    >
      <Card className="max-w-md w-full mx-4">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Add New Prospect</h2>
            <Button variant="ghost" size="sm" onClick={onClose} disabled={isPending}>
              ✕
            </Button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-3">
              <div>
                <p className="text-sm font-semibold text-gray-900">Company details</p>
                <p className="text-xs text-gray-500">
                  These fields populate the client record when the prospect is created.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Company Name *
                  </label>
                  <Input
                    value={formData.companyName}
                    onChange={(e) =>
                      setFormData({ ...formData, companyName: e.target.value })
                    }
                    placeholder="Acme Corporation"
                    required
                    disabled={isPending}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Segment
                  </label>
                  <Select
                    value={formData.segment}
                    onChange={(e) =>
                      setFormData({ ...formData, segment: e.target.value })
                    }
                    disabled={isPending}
                  >
                    <option value="">Select segment</option>
                    <option value="SMB">SMB</option>
                    <option value="Mid">Mid-Market</option>
                    <option value="Enterprise">Enterprise</option>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Annual Recurring Revenue ($)
                  </label>
                  <Input
                    type="number"
                    value={formData.arr}
                    onChange={(e) =>
                      setFormData({ ...formData, arr: e.target.value })
                    }
                    placeholder="25000"
                    min="0"
                    step="0.01"
                    disabled={isPending}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Industry
                  </label>
                  <Input
                    value={formData.industry}
                    onChange={(e) =>
                      setFormData({ ...formData, industry: e.target.value })
                    }
                    placeholder="Fintech"
                    disabled={isPending}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Region
                  </label>
                  <Input
                    value={formData.region}
                    onChange={(e) =>
                      setFormData({ ...formData, region: e.target.value })
                    }
                    placeholder="North America"
                    disabled={isPending}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <p className="text-sm font-semibold text-gray-900">Deal information</p>
                <p className="text-xs text-gray-500">
                  Aligns with the Supabase opportunities table for forecasting.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Deal Name *
                  </label>
                  <Input
                    value={formData.dealName}
                    onChange={(e) =>
                      setFormData({ ...formData, dealName: e.target.value })
                    }
                    placeholder="Q1 2025 Partnership"
                    required
                    disabled={isPending}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Deal Amount ($) *
                  </label>
                  <Input
                    type="number"
                    value={formData.amount}
                    onChange={(e) =>
                      setFormData({ ...formData, amount: e.target.value })
                    }
                    placeholder="50000"
                    required
                    disabled={isPending}
                    min="0"
                    step="0.01"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Expected Close Date
                  </label>
                  <Input
                    type="date"
                    value={formData.expectedCloseDate}
                    onChange={(e) =>
                      setFormData({ ...formData, expectedCloseDate: e.target.value })
                    }
                    disabled={isPending}
                  />
                </div>
              </div>
            </div>

            {error && (
              <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">
                {error}
              </div>
            )}

            <div className="flex gap-2 justify-end pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isPending}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? "Creating..." : "Create Prospect"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
