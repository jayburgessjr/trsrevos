"use client";

import { useState, useTransition } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/ui/card";
import { Button } from "@/ui/button";
import { Input } from "@/ui/input";
import { Select } from "@/ui/select";
import { createProspect } from "@/core/pipeline/actions";

type AddProspectModalProps = {
  onClose: () => void;
  userId: string;
};

export function AddProspectModal({ onClose, userId }: AddProspectModalProps) {
  const [formData, setFormData] = useState({
    companyName: "",
    dealName: "",
    amount: "",
    expectedCloseDate: "",
    industry: "",
    region: "",
    primaryContact: "",
    contactEmail: "",
    contactPhone: "",
    nextStep: "Initial outreach",
  });
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validate required fields
    if (!formData.companyName.trim()) {
      setError("Company name is required");
      return;
    }
    if (!formData.dealName.trim()) {
      setError("Deal name is required");
      return;
    }
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      setError("Deal amount must be greater than 0");
      return;
    }

    startTransition(async () => {
      const result = await createProspect({
        companyName: formData.companyName.trim(),
        dealName: formData.dealName.trim(),
        amount: parseFloat(formData.amount),
        expectedCloseDate: formData.expectedCloseDate || undefined,
        owner_id: userId,
        industry: formData.industry.trim() || undefined,
        region: formData.region.trim() || undefined,
        primaryContact: formData.primaryContact.trim() || undefined,
        contactEmail: formData.contactEmail.trim() || undefined,
        contactPhone: formData.contactPhone.trim() || undefined,
        nextStep: formData.nextStep.trim() || undefined,
      });

      if (result.success) {
        onClose();
        // Reload the page to show the new prospect
        window.location.reload();
      } else {
        setError(result.error || "Failed to create prospect");
      }
    });
  };

  const handleCancel = () => {
    if (!isPending) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isPending) {
          onClose();
        }
      }}
    >
      <Card className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <CardHeader className="border-b border-gray-200">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl font-semibold text-gray-900">
              Add New Prospect
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
            Create a new prospect opportunity. When won, this will automatically become a client.
          </p>
        </CardHeader>

        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Company Information */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-gray-900 border-b border-gray-200 pb-2">
                Company Information
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
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
                    className="w-full"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Will be created as a client when deal is won
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Industry
                  </label>
                  <Input
                    value={formData.industry}
                    onChange={(e) =>
                      setFormData({ ...formData, industry: e.target.value })
                    }
                    placeholder="SaaS, Manufacturing, Healthcare, etc."
                    disabled={isPending}
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Region
                  </label>
                  <Input
                    value={formData.region}
                    onChange={(e) =>
                      setFormData({ ...formData, region: e.target.value })
                    }
                    placeholder="North America, EMEA, APAC, etc."
                    disabled={isPending}
                    className="w-full"
                  />
                </div>
              </div>
            </div>

            {/* Deal Information */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-gray-900 border-b border-gray-200 pb-2">
                Deal Information
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
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
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
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
                    step="1000"
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Expected Close Date
                  </label>
                  <Input
                    type="date"
                    value={formData.expectedCloseDate}
                    onChange={(e) =>
                      setFormData({ ...formData, expectedCloseDate: e.target.value })
                    }
                    disabled={isPending}
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Next Step
                  </label>
                  <Select
                    value={formData.nextStep}
                    onChange={(e) =>
                      setFormData({ ...formData, nextStep: e.target.value })
                    }
                    disabled={isPending}
                    className="w-full"
                  >
                    <option value="Initial outreach">Initial outreach</option>
                    <option value="Discovery call scheduled">Discovery call scheduled</option>
                    <option value="Send proposal">Send proposal</option>
                    <option value="Follow up">Follow up</option>
                    <option value="Schedule demo">Schedule demo</option>
                    <option value="Negotiate terms">Negotiate terms</option>
                    <option value="Contract review">Contract review</option>
                  </Select>
                </div>
              </div>
            </div>

            {/* Primary Contact */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-gray-900 border-b border-gray-200 pb-2">
                Primary Contact (Optional)
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Name
                  </label>
                  <Input
                    value={formData.primaryContact}
                    onChange={(e) =>
                      setFormData({ ...formData, primaryContact: e.target.value })
                    }
                    placeholder="John Doe"
                    disabled={isPending}
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Email
                  </label>
                  <Input
                    type="email"
                    value={formData.contactEmail}
                    onChange={(e) =>
                      setFormData({ ...formData, contactEmail: e.target.value })
                    }
                    placeholder="john@example.com"
                    disabled={isPending}
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Phone
                  </label>
                  <Input
                    type="tel"
                    value={formData.contactPhone}
                    onChange={(e) =>
                      setFormData({ ...formData, contactPhone: e.target.value })
                    }
                    placeholder="+1 (555) 123-4567"
                    disabled={isPending}
                    className="w-full"
                  />
                </div>
              </div>
            </div>

            {error && (
              <div className="text-sm text-red-600 bg-red-50 border border-red-200 p-3 rounded-md">
                {error}
              </div>
            )}

            <div className="flex gap-3 justify-end pt-4 border-t border-gray-200">
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                disabled={isPending}
              >
                Cancel
              </Button>
              <Button type="submit" variant="primary" disabled={isPending}>
                {isPending ? "Creating..." : "Create Prospect"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
