"use client";

import { useState, useTransition } from "react";
import { Card, CardContent } from "@/ui/card";
import { Badge } from "@/ui/badge";
import { cn } from "@/lib/utils";
import { moveOpportunityStage, type OpportunityWithNotes } from "@/core/pipeline/actions";
import { DealDetailModal } from "./DealDetailModal";

type PipelineKanbanProps = {
  opportunitiesByStage: {
    [stage: string]: OpportunityWithNotes[];
  };
  userId: string;
};

const STAGES = [
  { key: "Prospect", label: "Prospect", color: "bg-gray-100" },
  { key: "Qualify", label: "Qualify", color: "bg-blue-100" },
  { key: "Proposal", label: "Proposal", color: "bg-purple-100" },
  { key: "Negotiation", label: "Negotiation", color: "bg-yellow-100" },
  { key: "ClosedWon", label: "Closed Won", color: "bg-green-100" },
];

export function PipelineKanban({ opportunitiesByStage, userId }: PipelineKanbanProps) {
  const [draggedOpportunity, setDraggedOpportunity] = useState<string | null>(null);
  const [selectedDeal, setSelectedDeal] = useState<OpportunityWithNotes | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleDragStart = (e: React.DragEvent, opportunityId: string) => {
    setDraggedOpportunity(opportunityId);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e: React.DragEvent, newStage: string) => {
    e.preventDefault();

    if (!draggedOpportunity) return;

    startTransition(async () => {
      const result = await moveOpportunityStage(draggedOpportunity, newStage);

      if (result.success && result.clientId) {
        alert(`🎉 Deal won! Prospect converted to client. View at /clients/${result.clientId}`);
      } else if (!result.success) {
        alert(`Error: ${result.error}`);
      }

      setDraggedOpportunity(null);
    });
  };

  const getDaysInStage = (updatedAt: string) => {
    const updated = new Date(updatedAt);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - updated.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <>
      <div className="flex gap-4 overflow-x-auto pb-4">
        {STAGES.map((stage) => (
          <div
            key={stage.key}
            className="flex-shrink-0 w-80"
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, stage.key)}
          >
            {/* Column Header */}
            <div className={cn("rounded-t-lg p-3", stage.color)}>
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-sm">{stage.label}</h3>
                <Badge variant="outline" className="bg-white">
                  {opportunitiesByStage[stage.key]?.length || 0}
                </Badge>
              </div>
              <div className="text-xs text-gray-600 mt-1">
                $
                {(
                  (opportunitiesByStage[stage.key]?.reduce(
                    (sum, opp) => sum + opp.amount,
                    0
                  ) || 0) / 1000
                ).toFixed(0)}
                K
              </div>
            </div>

            {/* Cards Container */}
            <div className="bg-gray-50 p-2 rounded-b-lg min-h-[200px] space-y-2">
              {opportunitiesByStage[stage.key]?.map((opp) => (
                <Card
                  key={opp.id}
                  draggable={!isPending}
                  onDragStart={(e) => handleDragStart(e, opp.id)}
                  onClick={() => setSelectedDeal(opp)}
                  className={cn(
                    "cursor-pointer hover:shadow-md transition-shadow",
                    draggedOpportunity === opp.id && "opacity-50"
                  )}
                >
                  <CardContent className="p-3 space-y-2">
                    <div className="font-medium text-sm">{opp.name}</div>
                    <div className="text-xs text-gray-600">{opp.client?.name || "Unknown Company"}</div>

                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-black">
                        ${(opp.amount / 1000).toFixed(0)}K
                      </span>
                      <Badge variant="outline" className="text-xs">
                        {opp.probability}%
                      </Badge>
                    </div>

                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>{opp.owner?.name || "Unassigned"}</span>
                      <span>{getDaysInStage(opp.updated_at)}d</span>
                    </div>

                    {opp.next_step && (
                      <div className="text-xs text-gray-600 italic">
                        Next: {opp.next_step}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Deal Detail Modal */}
      {selectedDeal && (
        <DealDetailModal
          deal={selectedDeal}
          onClose={() => setSelectedDeal(null)}
          userId={userId}
        />
      )}
    </>
  );
}
