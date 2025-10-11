"use client";

import { useState, useTransition } from "react";
import { Card, CardContent } from "@/ui/card";
import { Button } from "@/ui/button";
import { Input } from "@/ui/input";
import { Badge } from "@/ui/badge";
import {
  updateOpportunity,
  deleteOpportunity,
  addOpportunityNote,
  type OpportunityWithNotes
} from "@/core/pipeline/actions";
import { cn } from "@/lib/utils";
import { ActivitySection } from "./ActivitySection";

type DealDetailModalProps = {
  deal: OpportunityWithNotes;
  onClose: () => void;
  userId: string;
};

const STAGES = [
  { key: "Prospect", label: "Prospect", probability: 10 },
  { key: "Qualify", label: "Qualify", probability: 25 },
  { key: "Proposal", label: "Proposal", probability: 50 },
  { key: "Negotiation", label: "Negotiation", probability: 75 },
  { key: "ClosedWon", label: "Closed Won", probability: 100 },
  { key: "ClosedLost", label: "Closed Lost", probability: 0 },
];

export function DealDetailModal({ deal, onClose, userId }: DealDetailModalProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"notes" | "activities">("activities");

  const [formData, setFormData] = useState({
    name: deal.name,
    amount: deal.amount.toString(),
    stage: deal.stage,
    probability: deal.probability.toString(),
    close_date: deal.close_date || "",
    next_step: deal.next_step || "",
  });

  const [noteText, setNoteText] = useState("");

  const handleUpdate = () => {
    setError(null);
    startTransition(async () => {
      const result = await updateOpportunity(deal.id, {
        name: formData.name,
        amount: parseFloat(formData.amount),
        stage: formData.stage,
        probability: parseInt(formData.probability),
        close_date: formData.close_date || null,
        next_step: formData.next_step || null,
      });

      if (result.success) {
        setIsEditing(false);
      } else {
        setError(result.error || "Failed to update deal");
      }
    });
  };

  const handleDelete = () => {
    if (!confirm("Are you sure you want to delete this deal?")) return;

    startTransition(async () => {
      const result = await deleteOpportunity(deal.id);
      if (result.success) {
        onClose();
      } else {
        setError(result.error || "Failed to delete deal");
      }
    });
  };

  const handleMarkAsLost = () => {
    startTransition(async () => {
      const result = await updateOpportunity(deal.id, {
        stage: "ClosedLost",
        probability: 0,
      });

      if (result.success) {
        onClose();
      } else {
        setError(result.error || "Failed to mark as lost");
      }
    });
  };

  const handleAddNote = () => {
    if (!noteText.trim()) return;

    startTransition(async () => {
      const result = await addOpportunityNote(deal.id, noteText.trim(), userId);
      if (result.success) {
        setNoteText("");
      } else {
        setError(result.error || "Failed to add note");
      }
    });
  };

  const getDaysInStage = () => {
    const updated = new Date(deal.updated_at);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - updated.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
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
      <Card className="max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <CardContent className="p-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-6">
            <div className="flex-1">
              {isEditing ? (
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="text-xl font-semibold mb-2"
                  placeholder="Deal Name"
                />
              ) : (
                <h2 className="text-2xl font-semibold mb-2">{deal.name}</h2>
              )}
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <span>{deal.client?.name || "Unknown Company"}</span>
                <span>•</span>
                <span>{deal.owner?.name || "Unassigned"}</span>
                <span>•</span>
                <span>{getDaysInStage()} days in stage</span>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose} disabled={isPending}>
              ✕
            </Button>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column - Deal Details */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Deal Amount
                </label>
                {isEditing ? (
                  <Input
                    type="number"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    disabled={isPending}
                  />
                ) : (
                  <div className="text-2xl font-semibold text-black">
                    ${(deal.amount / 1000).toFixed(0)}K
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Stage
                </label>
                {isEditing ? (
                  <select
                    value={formData.stage}
                    onChange={(e) => {
                      const stage = STAGES.find(s => s.key === e.target.value);
                      setFormData({
                        ...formData,
                        stage: e.target.value,
                        probability: stage?.probability.toString() || formData.probability
                      });
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    disabled={isPending}
                  >
                    {STAGES.map((stage) => (
                      <option key={stage.key} value={stage.key}>
                        {stage.label}
                      </option>
                    ))}
                  </select>
                ) : (
                  <Badge variant="outline" className="text-sm">
                    {deal.stage === "ClosedWon" ? "Closed Won" : deal.stage}
                  </Badge>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Probability
                </label>
                {isEditing ? (
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      value={formData.probability}
                      onChange={(e) => setFormData({ ...formData, probability: e.target.value })}
                      disabled={isPending}
                      min="0"
                      max="100"
                    />
                    <span className="text-sm text-gray-600">%</span>
                  </div>
                ) : (
                  <div className="text-lg font-medium">{deal.probability}%</div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Expected Close Date
                </label>
                {isEditing ? (
                  <Input
                    type="date"
                    value={formData.close_date}
                    onChange={(e) => setFormData({ ...formData, close_date: e.target.value })}
                    disabled={isPending}
                  />
                ) : (
                  <div className="text-sm">
                    {deal.close_date
                      ? new Date(deal.close_date).toLocaleDateString()
                      : "Not set"
                    }
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Next Step
                </label>
                {isEditing ? (
                  <Input
                    value={formData.next_step}
                    onChange={(e) => setFormData({ ...formData, next_step: e.target.value })}
                    disabled={isPending}
                    placeholder="e.g., Schedule demo call"
                  />
                ) : (
                  <div className="text-sm text-gray-600">
                    {deal.next_step || "No next step defined"}
                  </div>
                )}
              </div>

              <div className="pt-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Created
                </label>
                <div className="text-sm text-gray-600">
                  {new Date(deal.created_at).toLocaleDateString()} at{" "}
                  {new Date(deal.created_at).toLocaleTimeString()}
                </div>
              </div>
            </div>

            {/* Right Column - Activities & Notes */}
            <div className="space-y-4">
              {/* Tabs */}
              <div className="flex items-center gap-2 border-b border-gray-200">
                <button
                  onClick={() => setActiveTab("activities")}
                  className={cn(
                    "px-3 py-2 text-sm font-medium transition-colors",
                    activeTab === "activities"
                      ? "border-b-2 border-black text-black"
                      : "text-gray-600 hover:text-black"
                  )}
                >
                  Activities
                </button>
                <button
                  onClick={() => setActiveTab("notes")}
                  className={cn(
                    "px-3 py-2 text-sm font-medium transition-colors",
                    activeTab === "notes"
                      ? "border-b-2 border-black text-black"
                      : "text-gray-600 hover:text-black"
                  )}
                >
                  Notes
                </button>
              </div>

              {/* Activities Tab */}
              {activeTab === "activities" && (
                <ActivitySection opportunityId={deal.id} userId={userId} />
              )}

              {/* Notes Tab */}
              {activeTab === "notes" && (
                <div>
                  {/* Add Note */}
                  <div className="mb-4">
                    <textarea
                      value={noteText}
                      onChange={(e) => setNoteText(e.target.value)}
                      placeholder="Add a note..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-md resize-none"
                      rows={3}
                      disabled={isPending}
                    />
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={handleAddNote}
                      disabled={isPending || !noteText.trim()}
                      className="mt-2"
                    >
                      Add Note
                    </Button>
                  </div>

                  {/* Notes List */}
                  <div className="space-y-3 max-h-[400px] overflow-y-auto">
                    {deal.notes && deal.notes.length > 0 ? (
                      deal.notes.map((note) => (
                        <div key={note.id} className="p-3 bg-gray-50 rounded-md">
                          <div className="text-sm text-gray-900">{note.body}</div>
                          <div className="text-xs text-gray-500 mt-1">
                            {new Date(note.created_at).toLocaleDateString()} at{" "}
                            {new Date(note.created_at).toLocaleTimeString()}
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-gray-500">No notes yet</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mt-4 text-sm text-red-600 bg-red-50 p-3 rounded-md">
              {error}
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-between gap-2 pt-6 border-t mt-6">
            <div className="flex gap-2">
              {!isEditing && deal.stage !== "ClosedLost" && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleMarkAsLost}
                  disabled={isPending}
                >
                  Mark as Lost
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={handleDelete}
                disabled={isPending}
                className="text-red-600 hover:bg-red-50"
              >
                Delete Deal
              </Button>
            </div>

            <div className="flex gap-2">
              {isEditing ? (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setIsEditing(false);
                      setFormData({
                        name: deal.name,
                        amount: deal.amount.toString(),
                        stage: deal.stage,
                        probability: deal.probability.toString(),
                        close_date: deal.close_date || "",
                        next_step: deal.next_step || "",
                      });
                    }}
                    disabled={isPending}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={handleUpdate}
                    disabled={isPending}
                  >
                    {isPending ? "Saving..." : "Save Changes"}
                  </Button>
                </>
              ) : (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => setIsEditing(true)}
                >
                  Edit Deal
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
