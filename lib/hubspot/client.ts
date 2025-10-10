/**
 * HubSpot API Client
 *
 * Provides typed access to HubSpot CRM API endpoints.
 * All requests use the HUBSPOT_API_KEY from environment variables.
 */

const HUBSPOT_API_KEY = process.env.HUBSPOT_API_KEY;
const HUBSPOT_BASE_URL = "https://api.hubapi.com";

if (!HUBSPOT_API_KEY && process.env.NODE_ENV !== "development") {
  console.warn("HUBSPOT_API_KEY not configured - HubSpot integration disabled");
}

export interface HubSpotDeal {
  id: string;
  properties: {
    dealname: string;
    amount: string;
    dealstage: string;
    closedate: string;
    pipeline: string;
    hubspot_owner_id: string;
    hs_deal_stage_probability: string;
    hs_lastmodifieddate: string;
    description?: string;
    notes_last_updated?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface HubSpotCompany {
  id: string;
  properties: {
    name: string;
    domain: string;
    industry: string;
    country: string;
    annualrevenue: string;
    numberofemployees: string;
    hubspot_owner_id: string;
    hs_lastmodifieddate: string;
    lifecyclestage?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface HubSpotContact {
  id: string;
  properties: {
    firstname: string;
    lastname: string;
    email: string;
    jobtitle: string;
    phone: string;
    hubspot_owner_id: string;
    hs_lastmodifieddate: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface HubSpotNote {
  id: string;
  properties: {
    hs_note_body: string;
    hs_timestamp: string;
    hubspot_owner_id: string;
  };
  createdAt: string;
  updatedAt: string;
}

class HubSpotClient {
  private baseURL: string;
  private apiKey: string | undefined;

  constructor() {
    this.baseURL = HUBSPOT_BASE_URL;
    this.apiKey = HUBSPOT_API_KEY;
  }

  private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    if (!this.apiKey) {
      throw new Error("HubSpot API key not configured");
    }

    const url = `${this.baseURL}${endpoint}`;
    const response = await fetch(url, {
      ...options,
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        "Content-Type": "application/json",
        ...options?.headers,
      },
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`HubSpot API error (${response.status}): ${error}`);
    }

    return response.json();
  }

  /**
   * Fetch all deals with pagination support
   */
  async getDeals(limit = 100): Promise<{ results: HubSpotDeal[]; paging?: { next?: { after: string } } }> {
    return this.request<{ results: HubSpotDeal[]; paging?: { next?: { after: string } } }>(
      `/crm/v3/objects/deals?limit=${limit}&properties=dealname,amount,dealstage,closedate,pipeline,hubspot_owner_id,hs_deal_stage_probability,hs_lastmodifieddate,description`
    );
  }

  /**
   * Fetch a single deal by ID
   */
  async getDeal(dealId: string): Promise<HubSpotDeal> {
    return this.request<HubSpotDeal>(
      `/crm/v3/objects/deals/${dealId}?properties=dealname,amount,dealstage,closedate,pipeline,hubspot_owner_id,hs_deal_stage_probability,hs_lastmodifieddate,description`
    );
  }

  /**
   * Fetch all companies with pagination support
   */
  async getCompanies(limit = 100): Promise<{ results: HubSpotCompany[]; paging?: { next?: { after: string } } }> {
    return this.request<{ results: HubSpotCompany[]; paging?: { next?: { after: string } } }>(
      `/crm/v3/objects/companies?limit=${limit}&properties=name,domain,industry,country,annualrevenue,numberofemployees,hubspot_owner_id,hs_lastmodifieddate,lifecyclestage`
    );
  }

  /**
   * Fetch a single company by ID
   */
  async getCompany(companyId: string): Promise<HubSpotCompany> {
    return this.request<HubSpotCompany>(
      `/crm/v3/objects/companies/${companyId}?properties=name,domain,industry,country,annualrevenue,numberofemployees,hubspot_owner_id,hs_lastmodifieddate,lifecyclestage`
    );
  }

  /**
   * Fetch all contacts with pagination support
   */
  async getContacts(limit = 100): Promise<{ results: HubSpotContact[]; paging?: { next?: { after: string } } }> {
    return this.request<{ results: HubSpotContact[]; paging?: { next?: { after: string } } }>(
      `/crm/v3/objects/contacts?limit=${limit}&properties=firstname,lastname,email,jobtitle,phone,hubspot_owner_id,hs_lastmodifieddate`
    );
  }

  /**
   * Fetch contacts associated with a company
   */
  async getCompanyContacts(companyId: string): Promise<{ results: HubSpotContact[] }> {
    return this.request<{ results: HubSpotContact[] }>(
      `/crm/v3/objects/companies/${companyId}/associations/contacts`
    );
  }

  /**
   * Fetch notes associated with a deal
   */
  async getDealNotes(dealId: string): Promise<{ results: HubSpotNote[] }> {
    return this.request<{ results: HubSpotNote[] }>(
      `/crm/v3/objects/deals/${dealId}/associations/notes?properties=hs_note_body,hs_timestamp,hubspot_owner_id`
    );
  }

  /**
   * Create a note associated with a deal
   */
  async createDealNote(dealId: string, noteBody: string, ownerId?: string): Promise<HubSpotNote> {
    const note = await this.request<HubSpotNote>("/crm/v3/objects/notes", {
      method: "POST",
      body: JSON.stringify({
        properties: {
          hs_note_body: noteBody,
          hs_timestamp: new Date().getTime(),
          hubspot_owner_id: ownerId,
        },
      }),
    });

    // Associate note with deal
    await this.request(`/crm/v3/objects/notes/${note.id}/associations/deals/${dealId}/note_to_deal`, {
      method: "PUT",
    });

    return note;
  }

  /**
   * Update a deal's properties
   */
  async updateDeal(dealId: string, properties: Partial<HubSpotDeal["properties"]>): Promise<HubSpotDeal> {
    return this.request<HubSpotDeal>(`/crm/v3/objects/deals/${dealId}`, {
      method: "PATCH",
      body: JSON.stringify({ properties }),
    });
  }

  /**
   * Create a new deal
   */
  async createDeal(properties: Partial<HubSpotDeal["properties"]>): Promise<HubSpotDeal> {
    return this.request<HubSpotDeal>("/crm/v3/objects/deals", {
      method: "POST",
      body: JSON.stringify({ properties }),
    });
  }

  /**
   * Update a company's properties
   */
  async updateCompany(companyId: string, properties: Partial<HubSpotCompany["properties"]>): Promise<HubSpotCompany> {
    return this.request<HubSpotCompany>(`/crm/v3/objects/companies/${companyId}`, {
      method: "PATCH",
      body: JSON.stringify({ properties }),
    });
  }

  /**
   * Create a new company
   */
  async createCompany(properties: Partial<HubSpotCompany["properties"]>): Promise<HubSpotCompany> {
    return this.request<HubSpotCompany>("/crm/v3/objects/companies", {
      method: "POST",
      body: JSON.stringify({ properties }),
    });
  }

  /**
   * Update a contact's properties
   */
  async updateContact(contactId: string, properties: Partial<HubSpotContact["properties"]>): Promise<HubSpotContact> {
    return this.request<HubSpotContact>(`/crm/v3/objects/contacts/${contactId}`, {
      method: "PATCH",
      body: JSON.stringify({ properties }),
    });
  }

  /**
   * Create a new contact
   */
  async createContact(properties: Partial<HubSpotContact["properties"]>): Promise<HubSpotContact> {
    return this.request<HubSpotContact>("/crm/v3/objects/contacts", {
      method: "POST",
      body: JSON.stringify({ properties }),
    });
  }

  /**
   * Fetch deal stages and pipelines
   */
  async getDealStages(): Promise<any> {
    return this.request("/crm/v3/pipelines/deals");
  }

  /**
   * Check if API key is configured
   */
  isConfigured(): boolean {
    return !!this.apiKey;
  }
}

export const hubspot = new HubSpotClient();
