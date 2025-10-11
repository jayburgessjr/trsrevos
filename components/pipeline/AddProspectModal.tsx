"use client";

import { useState, useTransition } from "react";
import { Card, CardContent } from "@/ui/card";
import { Button } from "@/ui/button";
import { Input } from "@/ui/input";
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

    startTransition(async () => {
      const result = await createProspect({
        companyName: formData.companyName.trim(),
        dealName: formData.dealName.trim(),
        amount: parseFloat(formData.amount),
        expectedCloseDate: formData.expectedCloseDate || undefined,
        owner_id: userId,
      });

      if (result.success) {
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
            <div>
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
                step="1000"
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
