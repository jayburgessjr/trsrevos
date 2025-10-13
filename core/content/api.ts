import { createClient } from "@/lib/supabase/client";
import type {
  AdCampaign,
  ContentPiece,
  ContentPurpose,
  ContentStatus,
  CreateAdCampaignInput,
  CreateContentInput,
} from "./types";

type SupabaseContentRow = {
  id: string;
  title: string;
  content_type: ContentPiece["contentType"];
  format: ContentPiece["format"];
  status: ContentStatus;
  purpose: ContentPurpose | null;
  channel: ContentPiece["channel"] | null;
  target_audience: string;
  target_id: string | null;
  description: string | null;
  created_by: string | null;
  assigned_to: string | null;
  scheduled_date: string | null;
  published_date: string | null;
  due_date: string | null;
  ai_generated: boolean | null;
  performance_metrics: ContentPiece["performanceMetrics"] | null;
  tags: string[] | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  created_by_user?: { full_name?: string | null } | null;
  assigned_to_user?: { full_name?: string | null } | null;
};

type SupabaseCampaignRow = {
  id: string;
  name: string;
  platform: AdCampaign["platform"];
  objective: AdCampaign["objective"];
  status: AdCampaign["status"];
  budget: number | string;
  spent: number | string;
  start_date: string;
  end_date: string | null;
  target_audience: string;
  created_by: string | null;
  metrics: AdCampaign["metrics"] | null;
  content_ids: string[] | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  created_by_user?: { full_name?: string | null } | null;
};

export type MarketingKPIs = {
  content: {
    total: number;
    published: number;
    scheduled: number;
    draft: number;
    ideas: number;
    views: number;
    engagement: number;
    conversions: number;
  };
  advertising: {
    activeCampaigns: number;
    totalSpend: number;
    totalBudget: number;
    impressions: number;
    clicks: number;
    conversions: number;
    avgCTR: number;
    avgROAS: number;
  };
};

function getBrowserClient() {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    return createClient();
  } catch (error) {
    console.error("content-api:create-client-error", error);
    return null;
  }
}

const fallbackContentPieces: ContentPiece[] = [
  {
    id: "mkt-1",
    title: "AI RevOps Playbook",
    contentType: "Prospect",
    format: "Guide",
    status: "Scheduled",
    purpose: "Sell",
    channel: "LinkedIn",
    targetAudience: "Revenue Leaders",
    description:
      "A tactical guide for CROs on orchestrating an AI-powered revenue engine across sales, success, and finance.",
    createdBy: "Maya Patel",
    assignedTo: "Alexa Ruiz",
    createdAt: new Date("2025-02-10").toISOString(),
    updatedAt: new Date("2025-02-12").toISOString(),
    scheduledDate: new Date("2025-02-18").toISOString(),
    aiGenerated: false,
    performanceMetrics: {
      views: 1280,
      engagement: 460,
      conversions: 38,
      clicks: 520,
      shares: 32,
    },
    tags: ["revops", "playbook", "ai"],
  },
  {
    id: "mkt-2",
    title: "Weekly Forecast Pulse",
    contentType: "Client",
    format: "Post",
    status: "Draft",
    purpose: "Add Value",
    channel: "Email",
    targetAudience: "Executive Stakeholders",
    description:
      "Snapshot of forecast accuracy, pipeline coverage, and risks synthesized from Rosie and the Finance module.",
    createdBy: "Jay Burgess",
    createdAt: new Date("2025-02-14").toISOString(),
    updatedAt: new Date("2025-02-14").toISOString(),
    dueDate: new Date("2025-02-20").toISOString(),
    aiGenerated: true,
    performanceMetrics: {
      views: 640,
      engagement: 220,
      conversions: 14,
    },
    tags: ["forecast", "insights"],
  },
  {
    id: "mkt-3",
    title: "Partner Co-Marketing One-Pager",
    contentType: "Partner",
    format: "One-Pager",
    status: "Draft",
    purpose: "Add Value",
    targetAudience: "Salesforce Partner Network",
    description: "Joint solution brief for Salesforce integration",
    createdBy: "Jordan Lee",
    assignedTo: "Jay Burgess",
    createdAt: new Date("2025-02-10").toISOString(),
    updatedAt: new Date("2025-02-12").toISOString(),
    dueDate: new Date("2025-02-28").toISOString(),
    aiGenerated: false,
    tags: ["partner", "salesforce", "integration"],
  },
  {
    id: "mkt-4",
    title: "Email: Revenue Intelligence White Paper",
    contentType: "Marketing",
    format: "White Paper",
    status: "Review",
    purpose: "Add Value",
    channel: "Email",
    targetAudience: "Email Subscribers",
    description: "Deep dive on AI-powered revenue intelligence",
    createdBy: "Maya Patel",
    assignedTo: "Alexa Ruiz",
    createdAt: new Date("2025-01-28").toISOString(),
    updatedAt: new Date("2025-02-08").toISOString(),
    dueDate: new Date("2025-02-18").toISOString(),
    aiGenerated: true,
    tags: ["white paper", "revenue intelligence", "AI"],
  },
  {
    id: "mkt-5",
    title: "Case Study Video: Globex Implementation",
    contentType: "Prospect",
    format: "Video",
    status: "Idea",
    purpose: "Inspire",
    targetAudience: "Mid-Market SaaS",
    targetId: "globex-corp",
    description: "Video case study showing Globex's implementation journey",
    createdBy: "Riya Sethi",
    createdAt: new Date("2025-02-14").toISOString(),
    updatedAt: new Date("2025-02-14").toISOString(),
    aiGenerated: false,
    tags: ["case study", "video", "implementation"],
  },
];

const fallbackCampaigns: AdCampaign[] = [
  {
    id: "ad-1",
    name: "Q1 Revenue Leaders Campaign",
    platform: "LinkedIn",
    objective: "Lead Generation",
    status: "Active",
    budget: 15000,
    spent: 8500,
    startDate: new Date("2025-01-15").toISOString(),
    endDate: new Date("2025-03-31").toISOString(),
    targetAudience: "CROs, VP Revenue, Enterprise SaaS",
    createdBy: "Morgan Pace",
    createdAt: new Date("2025-01-10").toISOString(),
    updatedAt: new Date("2025-02-15").toISOString(),
    metrics: {
      impressions: 125000,
      clicks: 2400,
      conversions: 180,
      ctr: 1.92,
      cpc: 3.54,
      roas: 3.8,
    },
    contentIds: ["mkt-1", "mkt-4"],
  },
  {
    id: "ad-2",
    name: "Partner Co-Marketing Push",
    platform: "Multi-Channel",
    objective: "Brand Awareness",
    status: "Active",
    budget: 8000,
    spent: 3200,
    startDate: new Date("2025-02-01").toISOString(),
    endDate: new Date("2025-04-30").toISOString(),
    targetAudience: "Salesforce ecosystem",
    createdBy: "Jay Burgess",
    createdAt: new Date("2025-01-25").toISOString(),
    updatedAt: new Date("2025-02-10").toISOString(),
    metrics: {
      impressions: 45000,
      clicks: 890,
      conversions: 45,
      ctr: 1.98,
    },
    contentIds: ["mkt-3"],
  },
  {
    id: "ad-3",
    name: "Forecast Webinar Promotion",
    platform: "LinkedIn",
    objective: "Conversion",
    status: "Draft",
    budget: 5000,
    spent: 0,
    startDate: new Date("2025-02-18").toISOString(),
    endDate: new Date("2025-02-25").toISOString(),
    targetAudience: "Finance & RevOps Leaders",
    createdBy: "Alexa Ruiz",
    createdAt: new Date("2025-02-12").toISOString(),
    updatedAt: new Date("2025-02-12").toISOString(),
    contentIds: ["mkt-2"],
  },
];

let inMemoryPieces = [...fallbackContentPieces];
let inMemoryCampaigns = [...fallbackCampaigns];

function mapContentPiece(row: SupabaseContentRow): ContentPiece {
  return {
    id: row.id,
    title: row.title,
    contentType: row.content_type,
    format: row.format,
    status: row.status,
    purpose: (row.purpose ?? "Inspire") as ContentPurpose,
    channel: row.channel ?? undefined,
    targetAudience: row.target_audience,
    targetId: row.target_id ?? undefined,
    description: row.description ?? undefined,
    createdBy:
      row.created_by_user?.full_name ??
      row.created_by ??
      "Automation",
    assignedTo: row.assigned_to_user?.full_name ?? row.assigned_to ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    scheduledDate: row.scheduled_date ?? undefined,
    publishedDate: row.published_date ?? undefined,
    dueDate: row.due_date ?? undefined,
    aiGenerated: row.ai_generated ?? false,
    performanceMetrics: row.performance_metrics ?? undefined,
    tags: row.tags ?? undefined,
    notes: row.notes ?? undefined,
  };
}

function mapAdCampaign(row: SupabaseCampaignRow): AdCampaign {
  return {
    id: row.id,
    name: row.name,
    platform: row.platform,
    objective: row.objective,
    status: row.status,
    budget: typeof row.budget === "string" ? Number(row.budget) : row.budget,
    spent: typeof row.spent === "string" ? Number(row.spent) : row.spent,
    startDate: row.start_date,
    endDate: row.end_date ?? undefined,
    targetAudience: row.target_audience,
    createdBy: row.created_by_user?.full_name ?? row.created_by ?? "Automation",
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    metrics: row.metrics ?? undefined,
    contentIds: row.content_ids ?? undefined,
    notes: row.notes ?? undefined,
  };
}

export async function fetchContentPieces(): Promise<ContentPiece[]> {
  const client = getBrowserClient();
  if (!client) {
    return inMemoryPieces;
  }

  try {
    const { data, error } = await client
      .from("content_pieces")
      .select(
        "*, created_by_user:users!content_pieces_created_by_fkey(full_name), assigned_to_user:users!content_pieces_assigned_to_fkey(full_name)",
      )
      .order("created_at", { ascending: false });

    if (error || !data) {
      console.error("content-api:fetch-pieces-error", error);
      return inMemoryPieces;
    }

    const mapped = data.map((row) => mapContentPiece(row as SupabaseContentRow));
    inMemoryPieces = mapped;
    return mapped;
  } catch (error) {
    console.error("content-api:fetch-pieces-exception", error);
    return inMemoryPieces;
  }
}

export async function fetchContentPiece(id: string): Promise<ContentPiece | null> {
  const client = getBrowserClient();
  if (!client) {
    return inMemoryPieces.find((piece) => piece.id === id) ?? null;
  }

  try {
    const { data, error } = await client
      .from("content_pieces")
      .select(
        "*, created_by_user:users!content_pieces_created_by_fkey(full_name), assigned_to_user:users!content_pieces_assigned_to_fkey(full_name)",
      )
      .eq("id", id)
      .maybeSingle();

    if (error) {
      console.error("content-api:fetch-piece-error", error);
      return inMemoryPieces.find((piece) => piece.id === id) ?? null;
    }

    return data ? mapContentPiece(data as SupabaseContentRow) : null;
  } catch (error) {
    console.error("content-api:fetch-piece-exception", error);
    return inMemoryPieces.find((piece) => piece.id === id) ?? null;
  }
}

export async function fetchContentPiecesForClient(clientId: string): Promise<ContentPiece[]> {
  const client = getBrowserClient();
  if (!client) {
    return inMemoryPieces.filter((piece) => piece.targetId === clientId);
  }

  try {
    const { data, error } = await client
      .from("content_pieces")
      .select(
        "*, created_by_user:users!content_pieces_created_by_fkey(full_name), assigned_to_user:users!content_pieces_assigned_to_fkey(full_name)"
      )
      .eq("target_id", clientId)
      .order("created_at", { ascending: false });

    if (error || !data) {
      console.error("content-api:fetch-client-pieces-error", error);
      return inMemoryPieces.filter((piece) => piece.targetId === clientId);
    }

    return data.map((row) => mapContentPiece(row as SupabaseContentRow));
  } catch (error) {
    console.error("content-api:fetch-client-pieces-exception", error);
    return inMemoryPieces.filter((piece) => piece.targetId === clientId);
  }
}

export async function updateContentPiece(
  id: string,
  updates: Partial<ContentPiece>,
): Promise<ContentPiece | null> {
  const client = getBrowserClient();
  if (!client) {
    const index = inMemoryPieces.findIndex((piece) => piece.id === id);
    if (index === -1) return null;
    inMemoryPieces[index] = {
      ...inMemoryPieces[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    return { ...inMemoryPieces[index] };
  }

  try {
    const payload: Record<string, unknown> = {};
    if (updates.title !== undefined) payload.title = updates.title;
    if (updates.description !== undefined) payload.description = updates.description;
    if (updates.status !== undefined) payload.status = updates.status;
    if (updates.format !== undefined) payload.format = updates.format;
    if (updates.contentType !== undefined) payload.content_type = updates.contentType;
    if (updates.purpose !== undefined) payload.purpose = updates.purpose;
    if (updates.channel !== undefined) payload.channel = updates.channel;
    if (updates.targetAudience !== undefined) payload.target_audience = updates.targetAudience;
    if (updates.dueDate !== undefined) payload.due_date = updates.dueDate;
    if (updates.scheduledDate !== undefined) payload.scheduled_date = updates.scheduledDate;
    if (updates.publishedDate !== undefined) payload.published_date = updates.publishedDate;
    if (updates.notes !== undefined) payload.notes = updates.notes;
    if (updates.aiGenerated !== undefined) payload.ai_generated = updates.aiGenerated;
    if (updates.performanceMetrics !== undefined)
      payload.performance_metrics = updates.performanceMetrics;
    if (updates.tags !== undefined) payload.tags = updates.tags;

    const { data, error } = await client
      .from("content_pieces")
      .update(payload)
      .eq("id", id)
      .select(
        "*, created_by_user:users!content_pieces_created_by_fkey(full_name), assigned_to_user:users!content_pieces_assigned_to_fkey(full_name)"
      )
      .maybeSingle();

    if (error) {
      console.error("content-api:update-piece-error", error);
      return null;
    }

    const mapped = data ? mapContentPiece(data as SupabaseContentRow) : null;
    if (mapped) {
      const index = inMemoryPieces.findIndex((piece) => piece.id === id);
      if (index >= 0) {
        inMemoryPieces[index] = mapped;
      }
    }
    return mapped;
  } catch (error) {
    console.error("content-api:update-piece-exception", error);
    return null;
  }
}

export async function createContentDraft(
  input: CreateContentInput,
): Promise<ContentPiece> {
  const client = getBrowserClient();
  if (!client) {
    const now = new Date().toISOString();
    const draft: ContentPiece = {
      ...input,
      id: `mkt-${Math.random().toString(36).slice(2, 8)}`,
      createdAt: now,
      updatedAt: now,
    };
    inMemoryPieces = [draft, ...inMemoryPieces];
    return draft;
  }

  try {
    const { data: userData } = await client.auth.getUser();
    const payload: Record<string, unknown> = {
      title: input.title,
      content_type: input.contentType,
      format: input.format,
      status: input.status,
      purpose: input.purpose,
      channel: input.channel,
      target_audience: input.targetAudience,
      target_id: input.targetId,
      description: input.description,
      created_by: userData?.user?.id ?? input.createdBy ?? null,
      assigned_to: input.assignedTo ?? null,
      scheduled_date: input.scheduledDate ?? null,
      published_date: input.publishedDate ?? null,
      due_date: input.dueDate ?? null,
      ai_generated: input.aiGenerated ?? null,
      performance_metrics: input.performanceMetrics ?? null,
      tags: input.tags ?? null,
      notes: input.notes ?? null,
    };

    const { data, error } = await client
      .from("content_pieces")
      .insert(payload)
      .select(
        "*, created_by_user:users!content_pieces_created_by_fkey(full_name), assigned_to_user:users!content_pieces_assigned_to_fkey(full_name)"
      )
      .maybeSingle();

    if (error || !data) {
      console.error("content-api:create-piece-error", error);
      return createContentDraftFallback(input);
    }

    const mapped = mapContentPiece(data as SupabaseContentRow);
    inMemoryPieces = [mapped, ...inMemoryPieces];
    return mapped;
  } catch (error) {
    console.error("content-api:create-piece-exception", error);
    return createContentDraftFallback(input);
  }
}

function createContentDraftFallback(input: CreateContentInput): ContentPiece {
  const now = new Date().toISOString();
  const draft: ContentPiece = {
    ...input,
    id: `mkt-${Math.random().toString(36).slice(2, 8)}`,
    createdAt: now,
    updatedAt: now,
  };
  inMemoryPieces = [draft, ...inMemoryPieces];
  return draft;
}

export async function fetchAdCampaigns(): Promise<AdCampaign[]> {
  const client = getBrowserClient();
  if (!client) {
    return inMemoryCampaigns;
  }

  try {
    const { data, error } = await client
      .from("ad_campaigns")
      .select(
        "*, created_by_user:users!ad_campaigns_created_by_fkey(full_name)"
      )
      .order("created_at", { ascending: false });

    if (error || !data) {
      console.error("content-api:fetch-campaigns-error", error);
      return inMemoryCampaigns;
    }

    const mapped = data.map((row) => mapAdCampaign(row as SupabaseCampaignRow));
    inMemoryCampaigns = mapped;
    return mapped;
  } catch (error) {
    console.error("content-api:fetch-campaigns-exception", error);
    return inMemoryCampaigns;
  }
}

export async function createAdCampaignDraft(
  input: CreateAdCampaignInput,
): Promise<AdCampaign> {
  const client = getBrowserClient();
  if (!client) {
    const now = new Date().toISOString();
    const campaign: AdCampaign = {
      ...input,
      id: `ad-${Math.random().toString(36).slice(2, 8)}`,
      createdAt: now,
      updatedAt: now,
    };
    inMemoryCampaigns = [campaign, ...inMemoryCampaigns];
    return campaign;
  }

  try {
    const { data: userData } = await client.auth.getUser();
    const payload: Record<string, unknown> = {
      name: input.name,
      platform: input.platform,
      objective: input.objective,
      status: input.status,
      budget: input.budget,
      spent: input.spent,
      start_date: input.startDate,
      end_date: input.endDate ?? null,
      target_audience: input.targetAudience,
      created_by: userData?.user?.id ?? input.createdBy ?? null,
      metrics: input.metrics ?? null,
      content_ids: input.contentIds ?? null,
      notes: input.notes ?? null,
    };

    const { data, error } = await client
      .from("ad_campaigns")
      .insert(payload)
      .select("*, created_by_user:users!ad_campaigns_created_by_fkey(full_name)")
      .maybeSingle();

    if (error || !data) {
      console.error("content-api:create-campaign-error", error);
      return createAdCampaignFallback(input);
    }

    const mapped = mapAdCampaign(data as SupabaseCampaignRow);
    inMemoryCampaigns = [mapped, ...inMemoryCampaigns];
    return mapped;
  } catch (error) {
    console.error("content-api:create-campaign-exception", error);
    return createAdCampaignFallback(input);
  }
}

function createAdCampaignFallback(input: CreateAdCampaignInput): AdCampaign {
  const now = new Date().toISOString();
  const campaign: AdCampaign = {
    ...input,
    id: `ad-${Math.random().toString(36).slice(2, 8)}`,
    createdAt: now,
    updatedAt: now,
  };
  inMemoryCampaigns = [campaign, ...inMemoryCampaigns];
  return campaign;
}

export function calculateMarketingKPIs(
  pieces: ContentPiece[],
  campaigns: AdCampaign[],
): MarketingKPIs {
  const totalContent = pieces.length;
  const publishedContent = pieces.filter((p) => p.status === "Published").length;
  const scheduledContent = pieces.filter((p) => p.status === "Scheduled").length;
  const draftContent = pieces.filter((p) => p.status === "Draft").length;
  const ideaContent = pieces.filter((p) => p.status === "Idea").length;

  const totalViews = pieces.reduce((sum, p) => sum + (p.performanceMetrics?.views ?? 0), 0);
  const totalEngagement = pieces.reduce((sum, p) => sum + (p.performanceMetrics?.engagement ?? 0), 0);
  const totalConversions = pieces.reduce((sum, p) => sum + (p.performanceMetrics?.conversions ?? 0), 0);

  const activeCampaigns = campaigns.filter((c) => c.status === "Active");
  const totalAdSpend = campaigns.reduce((sum, c) => sum + c.spent, 0);
  const totalAdBudget = campaigns.reduce((sum, c) => sum + c.budget, 0);
  const totalImpressions = campaigns.reduce((sum, c) => sum + (c.metrics?.impressions ?? 0), 0);
  const totalClicks = campaigns.reduce((sum, c) => sum + (c.metrics?.clicks ?? 0), 0);
  const totalAdConversions = campaigns.reduce((sum, c) => sum + (c.metrics?.conversions ?? 0), 0);

  const avgCTR =
    activeCampaigns.length > 0
      ? activeCampaigns.reduce((sum, c) => sum + (c.metrics?.ctr ?? 0), 0) /
        activeCampaigns.length
      : 0;

  const avgROAS =
    activeCampaigns.length > 0
      ? activeCampaigns.reduce((sum, c) => sum + (c.metrics?.roas ?? 0), 0) /
        activeCampaigns.length
      : 0;

  return {
    content: {
      total: totalContent,
      published: publishedContent,
      scheduled: scheduledContent,
      draft: draftContent,
      ideas: ideaContent,
      views: totalViews,
      engagement: totalEngagement,
      conversions: totalConversions,
    },
    advertising: {
      activeCampaigns: activeCampaigns.length,
      totalSpend: totalAdSpend,
      totalBudget: totalAdBudget,
      impressions: totalImpressions,
      clicks: totalClicks,
      conversions: totalAdConversions,
      avgCTR,
      avgROAS,
    },
  };
}

export async function generateIdeaBatch(
  audience: string,
  goal: string,
): Promise<ContentPiece[]> {
  const ideaInputs: CreateContentInput[] = [
    {
      title: `${audience} Spotlight: ${goal}`,
      contentType: "Prospect",
      format: "Post",
      status: "Idea",
      purpose: "Inspire",
      channel: "LinkedIn",
      targetAudience: audience,
      description: `Hook ${audience.toLowerCase()} with a quick win on ${goal.toLowerCase()} and invite them into a deeper asset.`,
      createdBy: "Automation",
      aiGenerated: true,
    },
    {
      title: `${goal} Workshop Outline`,
      contentType: "Client",
      format: "Workshop",
      status: "Idea",
      purpose: "Sell",
      targetAudience: audience,
      description: `Interactive workshop structure to help ${audience.toLowerCase()} operationalize ${goal.toLowerCase()} within 30 days.`,
      createdBy: "Automation",
      aiGenerated: true,
    },
    {
      title: `${audience} Proof Deck`,
      contentType: "Marketing",
      format: "One-Pager",
      status: "Idea",
      purpose: "Sell",
      targetAudience: audience,
      description: `One-pager summarizing the ROI story and next steps aligned to ${goal.toLowerCase()}.`,
      createdBy: "Automation",
      aiGenerated: true,
    },
  ];

  const created: ContentPiece[] = [];
  for (const idea of ideaInputs) {
    const piece = await createContentDraft(idea);
    created.push(piece);
  }

  return created;
}

