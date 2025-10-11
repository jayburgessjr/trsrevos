"use client";

import { useState, useEffect, useTransition, useCallback } from "react";
import { Button } from "@/ui/button";
import { Input } from "@/ui/input";
import { Badge } from "@/ui/badge";
import {
  createActivity,
  completeActivity,
  deleteActivity,
  getOpportunityActivities,
  type OpportunityActivityWithUser,
} from "@/core/pipeline/activities";
import { cn } from "@/lib/utils";

type ActivitySectionProps = {
  opportunityId: string;
  userId: string;
};

const ACTIVITY_TYPES = [
  { value: "task", label: "Task", icon: "☑", color: "text-blue-600" },
  { value: "call", label: "Call", icon: "📞", color: "text-green-600" },
  { value: "meeting", label: "Meeting", icon: "🤝", color: "text-purple-600" },
  { value: "email", label: "Email", icon: "✉", color: "text-orange-600" },
] as const;

export function ActivitySection({ opportunityId, userId }: ActivitySectionProps) {
  const [activities, setActivities] = useState<OpportunityActivityWithUser[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [filter, setFilter] = useState<"all" | "pending" | "completed">("all");

  const [formData, setFormData] = useState({
    type: "task" as "task" | "call" | "meeting" | "email",
    title: "",
    description: "",
    due_date: "",
  });

  const loadActivities = useCallback(async () => {
    const data = await getOpportunityActivities(opportunityId);
    setActivities(data);
  }, [opportunityId]);

  // Load activities
  useEffect(() => {
    void loadActivities();
  }, [loadActivities]);

  const handleAdd = () => {
    if (!formData.title.trim()) return;

    startTransition(async () => {
      const result = await createActivity({
        opportunity_id: opportunityId,
        type: formData.type,
        title: formData.title.trim(),
        description: formData.description.trim() || undefined,
        due_date: formData.due_date || undefined,
        assigned_to: userId,
      });

      if (result.success) {
        setFormData({
          type: "task",
          title: "",
          description: "",
          due_date: "",
        });
        setIsAdding(false);
        await loadActivities();
      }
    });
  };

  const handleComplete = async (activityId: string) => {
    startTransition(async () => {
      await completeActivity(activityId);
      await loadActivities();
    });
  };

  const handleDelete = async (activityId: string) => {
    if (!confirm("Delete this activity?")) return;

    startTransition(async () => {
      await deleteActivity(activityId);
      await loadActivities();
    });
  };

  const filteredActivities = activities.filter((activity) => {
    if (filter === "all") return true;
    return activity.status === filter;
  });

  const getActivityIcon = (type: string) => {
    return ACTIVITY_TYPES.find((t) => t.value === type)?.icon || "📋";
  };

  const getActivityColor = (type: string) => {
    return ACTIVITY_TYPES.find((t) => t.value === type)?.color || "text-gray-600";
  };

  const isOverdue = (dueDate: string | null) => {
    if (!dueDate) return false;
    return new Date(dueDate) < new Date();
  };

  const formatDueDate = (dueDate: string | null) => {
    if (!dueDate) return null;
    const date = new Date(dueDate);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) return "Today";
    if (date.toDateString() === tomorrow.toDateString()) return "Tomorrow";
    return date.toLocaleDateString();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Activities & Tasks</h3>
        <Button
          variant="primary"
          size="sm"
          onClick={() => setIsAdding(true)}
          disabled={isPending}
        >
          + Add Activity
        </Button>
      </div>

      {/* Add Activity Form */}
      {isAdding && (
        <div className="p-4 bg-gray-50 rounded-md space-y-3">
          <div className="flex gap-2">
            {ACTIVITY_TYPES.map((type) => (
              <button
                key={type.value}
                onClick={() => setFormData({ ...formData, type: type.value })}
                className={cn(
                  "px-3 py-1 text-sm rounded-md border transition-colors",
                  formData.type === type.value
                    ? "bg-black text-white border-black"
                    : "bg-white text-gray-700 border-gray-300 hover:border-gray-400"
                )}
              >
                {type.icon} {type.label}
              </button>
            ))}
          </div>

          <Input
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder={`${ACTIVITY_TYPES.find((t) => t.value === formData.type)?.label} title...`}
            disabled={isPending}
          />

          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Description (optional)"
            className="w-full px-3 py-2 border border-gray-300 rounded-md resize-none"
            rows={2}
            disabled={isPending}
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Due Date
            </label>
            <Input
              type="datetime-local"
              value={formData.due_date}
              onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
              disabled={isPending}
            />
          </div>

          <div className="flex gap-2 justify-end">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setIsAdding(false);
                setFormData({ type: "task", title: "", description: "", due_date: "" });
              }}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleAdd}
              disabled={isPending || !formData.title.trim()}
            >
              {isPending ? "Adding..." : "Add"}
            </Button>
          </div>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-gray-200">
        {["all", "pending", "completed"].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f as typeof filter)}
            className={cn(
              "px-3 py-2 text-sm font-medium transition-colors",
              filter === f
                ? "border-b-2 border-black text-black"
                : "text-gray-600 hover:text-black"
            )}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
            {f !== "all" && (
              <span className="ml-1 text-xs">
                ({activities.filter((a) => a.status === f).length})
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Activities List */}
      <div className="space-y-2 max-h-[400px] overflow-y-auto">
        {filteredActivities.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-4">
            No {filter !== "all" ? filter : ""} activities
          </p>
        ) : (
          filteredActivities.map((activity) => (
            <div
              key={activity.id}
              className={cn(
                "p-3 border rounded-md transition-colors",
                activity.status === "completed"
                  ? "bg-gray-50 border-gray-200"
                  : "bg-white border-gray-300 hover:border-gray-400"
              )}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={cn("text-lg", getActivityColor(activity.type))}>
                      {getActivityIcon(activity.type)}
                    </span>
                    <h4
                      className={cn(
                        "font-medium text-sm",
                        activity.status === "completed" && "line-through text-gray-500"
                      )}
                    >
                      {activity.title}
                    </h4>
                    {activity.due_date && (
                      <Badge
                        variant={
                          isOverdue(activity.due_date) && activity.status === "pending"
                            ? "destructive"
                            : "outline"
                        }
                        className="text-xs"
                      >
                        {formatDueDate(activity.due_date)}
                      </Badge>
                    )}
                  </div>

                  {activity.description && (
                    <p className="text-xs text-gray-600 mt-1">{activity.description}</p>
                  )}

                  <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                    <span>
                      {activity.assigned_user?.name || activity.creator?.name || "Unassigned"}
                    </span>
                    <span>•</span>
                    <span>{new Date(activity.created_at).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  {activity.status === "pending" && (
                    <button
                      onClick={() => handleComplete(activity.id)}
                      className="p-1 text-green-600 hover:bg-green-50 rounded"
                      disabled={isPending}
                    >
                      ✓
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(activity.id)}
                    className="p-1 text-red-600 hover:bg-red-50 rounded"
                    disabled={isPending}
                  >
                    ✕
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
