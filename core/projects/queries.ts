"use server";

import { supabaseServer } from "@/lib/supabaseServer";

export type ClientRow = {
  id: string;
  name: string;
  status: string | null;
  stage: string | null;
  health: string | null;
  owner_id: string | null;
  arr: number | null;
  created_at: string;
  phase: string | null;
  organization_id: string | null;
};

export type ClientOverview = {
  client_id: string;
  client_name: string;
  client_type: string | null;
  organization_id: string | null;
  owner_id: string | null;
  pipeline_id: string | null;
  pipeline_stage: string | null;
  pipeline_value: number | null;
  weighted_value: number | null;
  probability: number | null;
  finance_id: string | null;
  mrr: number | null;
  ar_outstanding: number | null;
  ar_collected: number | null;
};

export type OwnerRow = {
  id: string;
  email: string | null;
  full_name: string | null;
  role: string | null;
};

export type ProjectRecord = {
  id: string;
  client_id: string;
  name: string;
  status: string | null;
  health: string | null;
  start_date: string | null;
  end_date: string | null;
};

export type OpportunityRecord = {
  id: string;
  client_id: string;
  name: string | null;
  stage: string | null;
  amount: number | null;
  probability: number | null;
  next_step: string | null;
  next_step_date: string | null;
  close_date: string | null;
  owner_id: string | null;
};

export async function fetchClientsForProjects() {
  const sb = supabaseServer();
  const { data, error } = await sb
    .from("clients")
    .select(
      "id,name,status,stage,health,owner_id,arr,created_at,phase,organization_id"
    )
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as ClientRow[];
}

export async function fetchOverviewJoin() {
  const sb = supabaseServer();
  const { data, error } = await sb.from("vw_client_overview").select("*");
  if (error) throw error;
  return (data ?? []) as ClientOverview[];
}

export async function fetchOwners() {
  const sb = supabaseServer();
  const { data, error } = await sb
    .from("users")
    .select("id,email,full_name,role")
    .order("email", { ascending: true });
  if (error) throw error;
  return (data ?? []) as OwnerRow[];
}

export async function fetchProjects() {
  const sb = supabaseServer();
  const { data, error } = await sb
    .from("projects")
    .select("id,client_id,name,status,health,start_date,end_date")
    .order("start_date", { ascending: true });
  if (error) throw error;
  return (data ?? []) as ProjectRecord[];
}

export async function fetchOpportunities() {
  const sb = supabaseServer();
  const { data, error } = await sb
    .from("opportunities")
    .select(
      "id,client_id,name,stage,amount,probability,next_step,next_step_date,close_date,owner_id"
    );
  if (error) throw error;
  return (data ?? []) as OpportunityRecord[];
}
