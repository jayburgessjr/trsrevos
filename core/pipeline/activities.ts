"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export type OpportunityActivity = {
  id: string;
  opportunity_id: string;
  type: "task" | "call" | "meeting" | "email" | "note";
  title: string;
  description: string | null;
  status: "pending" | "completed" | "cancelled";
  due_date: string | null;
  completed_at: string | null;
  assigned_to: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
};

export type OpportunityActivityWithUser = OpportunityActivity & {
  assigned_user: { name: string } | null;
  creator: { name: string } | null;
};

/**
 * Get all activities for an opportunity
 */
export async function getOpportunityActivities(
  opportunityId: string
): Promise<OpportunityActivityWithUser[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("opportunity_activities")
    .select(`
      *,
      assigned_user:users!opportunity_activities_assigned_to_fkey(name),
      creator:users!opportunity_activities_created_by_fkey(name)
    `)
    .eq("opportunity_id", opportunityId)
    .order("due_date", { ascending: true, nullsFirst: false })
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching activities:", error);
    return [];
  }

  return data as OpportunityActivityWithUser[];
}

/**
 * Create a new activity
 */
export async function createActivity(input: {
  opportunity_id: string;
  type: "task" | "call" | "meeting" | "email" | "note";
  title: string;
  description?: string;
  due_date?: string;
  assigned_to?: string;
}): Promise<{ success: boolean; activity?: OpportunityActivity; error?: string }> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "User not authenticated" };
  }

  const { data, error } = await supabase
    .from("opportunity_activities")
    .insert({
      opportunity_id: input.opportunity_id,
      type: input.type,
      title: input.title,
      description: input.description || null,
      due_date: input.due_date || null,
      assigned_to: input.assigned_to || user.id,
      created_by: user.id,
      status: "pending",
    })
    .select()
    .single();

  if (error) {
    console.error("Error creating activity:", error);
    return { success: false, error: error.message };
  }

  revalidatePath("/pipeline");
  return { success: true, activity: data };
}

/**
 * Update an activity
 */
export async function updateActivity(
  id: string,
  updates: Partial<Omit<OpportunityActivity, "id" | "created_at" | "updated_at" | "created_by">>
): Promise<{ success: boolean; activity?: OpportunityActivity; error?: string }> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("opportunity_activities")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Error updating activity:", error);
    return { success: false, error: error.message };
  }

  revalidatePath("/pipeline");
  return { success: true, activity: data };
}

/**
 * Mark activity as completed
 */
export async function completeActivity(
  id: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();

  const { error } = await supabase
    .from("opportunity_activities")
    .update({
      status: "completed",
      completed_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) {
    console.error("Error completing activity:", error);
    return { success: false, error: error.message };
  }

  revalidatePath("/pipeline");
  return { success: true };
}

/**
 * Delete an activity
 */
export async function deleteActivity(
  id: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();

  const { error } = await supabase
    .from("opportunity_activities")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("Error deleting activity:", error);
    return { success: false, error: error.message };
  }

  revalidatePath("/pipeline");
  return { success: true };
}

/**
 * Get upcoming activities across all opportunities
 */
export async function getUpcomingActivities(
  limit: number = 10
): Promise<OpportunityActivityWithUser[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("opportunity_activities")
    .select(`
      *,
      assigned_user:users!opportunity_activities_assigned_to_fkey(name),
      creator:users!opportunity_activities_created_by_fkey(name)
    `)
    .eq("status", "pending")
    .not("due_date", "is", null)
    .gte("due_date", new Date().toISOString())
    .order("due_date", { ascending: true })
    .limit(limit);

  if (error) {
    console.error("Error fetching upcoming activities:", error);
    return [];
  }

  return data as OpportunityActivityWithUser[];
}

/**
 * Get overdue activities
 */
export async function getOverdueActivities(): Promise<OpportunityActivityWithUser[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("opportunity_activities")
    .select(`
      *,
      assigned_user:users!opportunity_activities_assigned_to_fkey(name),
      creator:users!opportunity_activities_created_by_fkey(name)
    `)
    .eq("status", "pending")
    .not("due_date", "is", null)
    .lt("due_date", new Date().toISOString())
    .order("due_date", { ascending: true });

  if (error) {
    console.error("Error fetching overdue activities:", error);
    return [];
  }

  return data as OpportunityActivityWithUser[];
}
