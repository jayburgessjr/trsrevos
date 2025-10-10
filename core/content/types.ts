export type ContentStatus = 'Idea' | 'Draft' | 'Review' | 'Scheduled' | 'Published'

export type ContentStage =
  | 'Discovery'
  | 'Evaluation'
  | 'Decision'
  | 'Onboarding'
  | 'Adoption'

export interface ContentBrief {
  cta: string
  outline: string
  notes?: string
}

export interface ContentItem {
  id: string
  title: string
  type: string
  status: ContentStatus
  persona: string
  stage: ContentStage
  objection: string
  ownerId: string
  cost: number
  createdAt: string
  publishedAt?: string | null
  sla: string
  brief?: ContentBrief
}

export type VariantGroup = 'A' | 'B'

export interface Variant {
  id: string
  contentId: string
  kind: string
  headline: string
  cta: string
  group?: VariantGroup
  status: string
}

export interface Distribution {
  id: string
  contentId: string
  channel: string
  scheduledAt?: string | null
  publishedAt?: string | null
  utm?: string | null
  clicks?: number
}

export type TouchAction = 'used' | 'worked' | 'failed'

export interface Touch {
  id: string
  contentId: string
  opportunityId: string
  actor: string
  action: TouchAction
  ts: string
}

export interface Metrics {
  influenced: number
  advanced: number
  closedWon: number
  usageRate: number
  views: number
  ctr: number
}

// Marketing Content Types
export type ContentType = "Client" | "Prospect" | "Partner" | "Marketing";
export type ContentFormat = "Post" | "Webinar" | "Workshop" | "One-Pager" | "Email" | "Case Study" | "White Paper" | "Video" | "Infographic";
export type ContentPurpose = "Inspire" | "Sell" | "Add Value";
export type ContentChannel = "LinkedIn" | "Email" | "Website" | "Event" | "Direct Mail" | "Social Media";

export type ContentPiece = {
  id: string;
  title: string;
  contentType: ContentType;
  format: ContentFormat;
  status: ContentStatus;
  purpose: ContentPurpose;
  channel?: ContentChannel;
  targetAudience: string;
  targetId?: string;
  description?: string;
  createdBy: string;
  assignedTo?: string;
  createdAt: string;
  updatedAt: string;
  scheduledDate?: string;
  publishedDate?: string;
  dueDate?: string;
  aiGenerated?: boolean;
  performanceMetrics?: {
    views?: number;
    engagement?: number;
    conversions?: number;
    clicks?: number;
    shares?: number;
  };
  tags?: string[];
  notes?: string;
};

export type CreateContentInput = Omit<ContentPiece, "id" | "createdAt" | "updatedAt">;

export type AdCampaign = {
  id: string;
  name: string;
  platform: "LinkedIn" | "Google" | "Facebook" | "Twitter" | "Multi-Channel";
  objective: "Brand Awareness" | "Lead Generation" | "Conversion" | "Engagement";
  status: "Draft" | "Active" | "Paused" | "Completed";
  budget: number;
  spent: number;
  startDate: string;
  endDate?: string;
  targetAudience: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  metrics?: {
    impressions?: number;
    clicks?: number;
    conversions?: number;
    ctr?: number;
    cpc?: number;
    roas?: number;
  };
  contentIds?: string[];
  notes?: string;
};

export type CreateAdCampaignInput = Omit<AdCampaign, "id" | "createdAt" | "updatedAt">;
