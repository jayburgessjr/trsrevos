"use client";

import { useMemo, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import Link from "next/link";

import { Card } from "@/components/kit/Card";
import { resolveTabs } from "@/lib/tabs";
import { cn } from "@/lib/utils";
import { TRS_CARD, TRS_SUBTITLE } from "@/lib/style";
import { listContentPieces, listAdCampaigns, getMarketingKPIs, createAdCampaign } from "@/core/content/store";
import type { CreateAdCampaignInput } from "@/core/content/types";

export default function ContentStudioPage() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const tabs = useMemo(() => resolveTabs(pathname), [pathname]);
  const activeTab = useMemo(() => {
    const current = searchParams.get("tab");
    return current && tabs.includes(current) ? current : tabs[0];
  }, [searchParams, tabs]);

  const contentPieces = useMemo(() => listContentPieces(), []);
  const [adCampaigns, setAdCampaigns] = useState(() => listAdCampaigns());
  const kpis = useMemo(() => getMarketingKPIs(), []);

  const [showCampaignModal, setShowCampaignModal] = useState(false);
  const [showAgentModal, setShowAgentModal] = useState(false);
  const [campaignForm, setCampaignForm] = useState<CreateAdCampaignInput>({
    name: '',
    platform: 'LinkedIn',
    objective: 'Lead Generation',
    status: 'Draft',
    budget: 0,
    spent: 0,
    startDate: '',
    targetAudience: '',
    createdBy: 'User',
  });
  const [agentPrompt, setAgentPrompt] = useState('');

  const pipelineContent = contentPieces.filter(p => p.status === 'Draft' || p.status === 'Review');
  const scheduledContent = contentPieces.filter(p => p.status === 'Scheduled');
  const ideaContent = contentPieces.filter(p => p.status === 'Idea');
  const publishedContent = contentPieces.filter(p => p.status === 'Published');

  const handleCreateCampaign = () => {
    if (campaignForm.name && campaignForm.targetAudience) {
      const newCampaign = createAdCampaign(campaignForm);
      setAdCampaigns([...adCampaigns, newCampaign]);
      setShowCampaignModal(false);
      setCampaignForm({
        name: '',
        platform: 'LinkedIn',
        objective: 'Lead Generation',
        status: 'Draft',
        budget: 0,
        spent: 0,
        startDate: '',
        targetAudience: '',
        createdBy: 'User',
      });
    }
  };

  const handleGenerateWithAgent = () => {
    if (agentPrompt) {
      const campaignInput: CreateAdCampaignInput = {
        name: `AI Generated: ${agentPrompt.substring(0, 50)}...`,
        platform: 'Multi-Channel',
        objective: 'Brand Awareness',
        status: 'Draft',
        budget: 5000,
        spent: 0,
        startDate: new Date().toISOString(),
        targetAudience: 'AI-selected audience',
        createdBy: 'AI Agent',
      };
      const generatedCampaign = createAdCampaign(campaignInput);
      setAdCampaigns([...adCampaigns, generatedCampaign]);
      setShowAgentModal(false);
      setAgentPrompt('');
    }
  };

  return (
    <div className="mx-auto max-w-7xl space-y-4 px-4 py-4">
      <section className="space-y-4">
        <header className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold text-black">Marketing & Content</h1>
        <p className="text-sm text-gray-600">
          Create content to inspire, sell, and add value for clients, prospects, partners, and market presence.
        </p>
        </header>

        {activeTab === "Overview" && (
        <div className="space-y-4">
          <Card className={cn(TRS_CARD, "p-4")}>
            <div className="text-sm font-semibold text-black mb-4">Content Pipeline Overview</div>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
              <div className={cn(TRS_CARD, "p-3")}>
                <div className={TRS_SUBTITLE}>Total Content</div>
                <div className="mt-1 text-2xl font-semibold text-black">{kpis.content.total}</div>
                <div className="text-[11px] text-gray-600">All pieces</div>
              </div>
              <div className={cn(TRS_CARD, "p-3")}>
                <div className={TRS_SUBTITLE}>Published</div>
                <div className="mt-1 text-2xl font-semibold text-black">{kpis.content.published}</div>
                <div className="text-[11px] text-gray-600">Live content</div>
              </div>
              <div className={cn(TRS_CARD, "p-3")}>
                <div className={TRS_SUBTITLE}>Scheduled</div>
                <div className="mt-1 text-2xl font-semibold text-black">{kpis.content.scheduled}</div>
                <div className="text-[11px] text-gray-600">Ready to ship</div>
              </div>
              <div className={cn(TRS_CARD, "p-3")}>
                <div className={TRS_SUBTITLE}>In Draft</div>
                <div className="mt-1 text-2xl font-semibold text-black">{kpis.content.draft}</div>
                <div className="text-[11px] text-gray-600">In progress</div>
              </div>
              <div className={cn(TRS_CARD, "p-3")}>
                <div className={TRS_SUBTITLE}>Ideas</div>
                <div className="mt-1 text-2xl font-semibold text-black">{kpis.content.ideas}</div>
                <div className="text-[11px] text-gray-600">In backlog</div>
              </div>
            </div>
          </Card>

          <Card className={cn(TRS_CARD, "p-4")}>
            <div className="text-sm font-semibold text-black mb-4">Performance Metrics</div>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
              <div className={cn(TRS_CARD, "p-3")}>
                <div className={TRS_SUBTITLE}>Total Views</div>
                <div className="mt-1 text-2xl font-semibold text-black">{kpis.content.views.toLocaleString()}</div>
                <div className="text-[11px] text-gray-600">Across all content</div>
              </div>
              <div className={cn(TRS_CARD, "p-3")}>
                <div className={TRS_SUBTITLE}>Engagement</div>
                <div className="mt-1 text-2xl font-semibold text-black">{kpis.content.engagement.toLocaleString()}</div>
                <div className="text-[11px] text-gray-600">Interactions</div>
              </div>
              <div className={cn(TRS_CARD, "p-3")}>
                <div className={TRS_SUBTITLE}>Conversions</div>
                <div className="mt-1 text-2xl font-semibold text-black">{kpis.content.conversions}</div>
                <div className="text-[11px] text-gray-600">Generated leads</div>
              </div>
            </div>
          </Card>

          <Card className={cn(TRS_CARD, "p-4")}>
            <div className="text-sm font-semibold text-black mb-4">Advertising Overview</div>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
              <div className={cn(TRS_CARD, "p-3")}>
                <div className={TRS_SUBTITLE}>Active Campaigns</div>
                <div className="mt-1 text-2xl font-semibold text-black">{kpis.advertising.activeCampaigns}</div>
                <div className="text-[11px] text-gray-600">Running now</div>
              </div>
              <div className={cn(TRS_CARD, "p-3")}>
                <div className={TRS_SUBTITLE}>Ad Spend</div>
                <div className="mt-1 text-2xl font-semibold text-black">${(kpis.advertising.totalSpend / 1000).toFixed(1)}k</div>
                <div className="text-[11px] text-gray-600">of ${(kpis.advertising.totalBudget / 1000).toFixed(1)}k budget</div>
              </div>
              <div className={cn(TRS_CARD, "p-3")}>
                <div className={TRS_SUBTITLE}>Avg CTR</div>
                <div className="mt-1 text-2xl font-semibold text-black">{kpis.advertising.avgCTR.toFixed(2)}%</div>
                <div className="text-[11px] text-gray-600">Click-through rate</div>
              </div>
              <div className={cn(TRS_CARD, "p-3")}>
                <div className={TRS_SUBTITLE}>Avg ROAS</div>
                <div className="mt-1 text-2xl font-semibold text-black">{kpis.advertising.avgROAS.toFixed(1)}x</div>
                <div className="text-[11px] text-gray-600">Return on ad spend</div>
              </div>
            </div>
          </Card>
        </div>
      )}

      {activeTab === "Pipeline" && (
        <Card className={cn(TRS_CARD, "p-4")}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-sm font-semibold text-black">Active Content Flow</div>
              <p className="text-[13px] text-gray-600">Content in Draft and Review stages</p>
            </div>
            <button className="text-xs px-3 py-1.5 rounded-md border border-gray-300 hover:bg-gray-100 bg-white">
              + New Content
            </button>
          </div>
          <div className="mt-3 overflow-hidden rounded-lg border border-gray-200">
            <table className="w-full text-sm">
              <thead className="bg-white text-left text-[12px] uppercase tracking-wide text-gray-500">
                <tr>
                  <th className="px-3 py-2 font-medium">Title</th>
                  <th className="px-3 py-2 font-medium">Type</th>
                  <th className="px-3 py-2 font-medium">Format</th>
                  <th className="px-3 py-2 font-medium">Status</th>
                  <th className="px-3 py-2 font-medium">Owner</th>
                  <th className="px-3 py-2 font-medium">Due Date</th>
                  <th className="px-3 py-2 font-medium">Purpose</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {pipelineContent.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-3 py-2 font-medium text-black">
                      <Link href={`/content/${item.id}`} className="hover:text-gray-600 hover:underline">
                        {item.title}
                      </Link>
                    </td>
                    <td className="px-3 py-2 text-gray-700">{item.contentType}</td>
                    <td className="px-3 py-2 text-gray-700">{item.format}</td>
                    <td className="px-3 py-2">
                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ${
                        item.status === 'Review' ? 'bg-amber-100 text-amber-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-gray-700">{item.createdBy}</td>
                    <td className="px-3 py-2 text-gray-700">{item.dueDate ? new Date(item.dueDate).toLocaleDateString() : '—'}</td>
                    <td className="px-3 py-2 text-gray-700">{item.purpose}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {activeTab === "Ideas" && (
        <Card className={cn(TRS_CARD, "p-4")}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-sm font-semibold text-black">Content Ideas</div>
              <p className="text-[13px] text-gray-600">AI-generated ideas based on sales trends and market conditions</p>
            </div>
            <button className="text-xs px-3 py-1.5 rounded-md bg-black text-white hover:bg-gray-800">
              Generate Ideas
            </button>
          </div>
          <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-3">
            {ideaContent.map((idea) => (
              <div key={idea.id} className="rounded-lg border border-gray-200 p-3 hover:border-gray-400 transition">
                <div className="flex items-start justify-between">
                  <div className="text-sm font-medium text-black">{idea.title}</div>
                  {idea.aiGenerated && (
                    <span className="rounded border border-gray-300 px-1.5 py-0.5 text-[10px] text-gray-600">AI</span>
                  )}
                </div>
                <div className="mt-1 text-[12px] text-gray-600">{idea.format} • {idea.contentType}</div>
                <div className="mt-2 text-[12px] text-gray-500">{idea.description}</div>
                <div className="mt-2 text-[11px] text-gray-500">Purpose: {idea.purpose}</div>
                <button
                  type="button"
                  className="mt-3 inline-flex items-center justify-center rounded-lg border border-gray-300 px-3 py-1 text-[12px] font-medium text-gray-700 transition hover:border-black hover:text-black"
                >
                  Move to Pipeline
                </button>
              </div>
            ))}
          </div>
        </Card>
      )}

      {activeTab === "Scheduled" && (
        <Card className={cn(TRS_CARD, "p-4")}>
          <div className="text-sm font-semibold text-black mb-4">Scheduled Distribution</div>
          <p className="text-[13px] text-gray-600 mb-4">Content ready to ship: LinkedIn posts, webinars, workshops, and more</p>
          <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-3">
            {scheduledContent.map((release) => (
              <div key={release.id} className="rounded-lg border border-gray-200 p-3">
                <div className="text-[11px] uppercase tracking-wide text-gray-500">{release.channel || release.format}</div>
                <div className="mt-1 text-lg font-semibold text-black">{release.title}</div>
                <div className="text-[12px] text-gray-600 mt-1">
                  Launch: {release.scheduledDate ? new Date(release.scheduledDate).toLocaleDateString() : 'TBD'}
                </div>
                <div className="text-[12px] text-gray-600">Owner: {release.assignedTo || release.createdBy}</div>
                <div className="mt-2">
                  <span className="inline-flex items-center rounded-full border border-gray-300 bg-white text-gray-700 px-2 py-0.5 text-[11px] font-medium">
                    {release.purpose}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {activeTab === "Performance" && (
        <Card className={cn(TRS_CARD, "p-4")}>
          <div className="text-sm font-semibold text-black mb-4">Performance Signals</div>
          <p className="text-[13px] text-gray-600 mb-4">Track engagement, reach, and conversions for published content</p>
          <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-3">
            {publishedContent.map((content) => (
              <Link key={content.id} href={`/content/${content.id}`} className="rounded-lg border border-gray-200 p-3 block hover:border-gray-400 transition">
                <div className="text-sm font-medium text-black hover:text-gray-600">{content.title}</div>
                <div className="mt-1 text-[11px] text-gray-500">{content.format} • {content.channel}</div>
                {content.performanceMetrics && (
                  <div className="mt-2 space-y-1">
                    <div className="text-[12px] text-gray-600">Views: {content.performanceMetrics.views?.toLocaleString() || 0}</div>
                    <div className="text-[12px] text-gray-600">Engagement: {content.performanceMetrics.engagement?.toLocaleString() || 0}</div>
                    <div className="text-[12px] text-gray-600">Clicks: {content.performanceMetrics.clicks || 0}</div>
                    {content.performanceMetrics.shares && (
                      <div className="text-[12px] text-gray-600">Shares: {content.performanceMetrics.shares}</div>
                    )}
                  </div>
                )}
                <div className="mt-3">
                  <span className="inline-flex items-center rounded-full border border-gray-300 bg-white text-gray-700 px-2 py-0.5 text-[11px] font-medium">
                    Published
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </Card>
      )}

      {activeTab === "Create" && (
        <Card className={cn(TRS_CARD, "p-4")}>
          <div className="text-sm font-semibold text-black mb-4">Content Creation Studio</div>
          <p className="text-[13px] text-gray-600 mb-4">Generate and edit content for clients, prospects, partners, and marketing</p>

          <div className="space-y-4">
            <div className="rounded-lg border border-gray-200 p-4">
              <div className="text-sm font-medium text-black mb-2">Quick Create</div>
              <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                <button className="rounded-lg border-2 border-dashed border-gray-300 p-4 text-center hover:border-gray-400 transition">
                  <div className="text-[11px] uppercase tracking-wide text-gray-500">LinkedIn Post</div>
                  <div className="mt-1 text-sm text-gray-700">Client Success</div>
                </button>
                <button className="rounded-lg border-2 border-dashed border-gray-300 p-4 text-center hover:border-gray-400 transition">
                  <div className="text-[11px] uppercase tracking-wide text-gray-500">One-Pager</div>
                  <div className="mt-1 text-sm text-gray-700">Prospect Pitch</div>
                </button>
                <button className="rounded-lg border-2 border-dashed border-gray-300 p-4 text-center hover:border-gray-400 transition">
                  <div className="text-[11px] uppercase tracking-wide text-gray-500">Email</div>
                  <div className="mt-1 text-sm text-gray-700">Partner Outreach</div>
                </button>
                <button className="rounded-lg border-2 border-dashed border-gray-300 p-4 text-center hover:border-gray-400 transition">
                  <div className="text-[11px] uppercase tracking-wide text-gray-500">White Paper</div>
                  <div className="mt-1 text-sm text-gray-700">Thought Leadership</div>
                </button>
              </div>
            </div>

            <div className="rounded-lg border border-gray-200 bg-white p-4">
              <div className="text-sm font-medium text-black mb-2">AI Content Generator</div>
              <div className="space-y-3">
                <textarea
                  className="w-full rounded-lg border border-gray-300 p-3 text-sm resize-none"
                  rows={3}
                  placeholder="Describe the content you want to create... (e.g., 'Create a LinkedIn post about ACME Corp's 40% revenue growth using our platform')"
                />
                <div className="flex gap-2">
                  <select className="rounded-lg border border-gray-300 px-3 py-2 text-sm">
                    <option>Client</option>
                    <option>Prospect</option>
                    <option>Partner</option>
                    <option>Marketing</option>
                  </select>
                  <select className="rounded-lg border border-gray-300 px-3 py-2 text-sm">
                    <option>Post</option>
                    <option>Email</option>
                    <option>One-Pager</option>
                    <option>White Paper</option>
                    <option>Case Study</option>
                  </select>
                  <button className="ml-auto rounded-lg bg-black px-4 py-2 text-sm text-white hover:bg-gray-800">
                    Generate Content
                  </button>
                </div>
              </div>
            </div>
          </div>
        </Card>
      )}

      {activeTab === "Advertising" && (
        <div className="space-y-4">
          <Card className={cn(TRS_CARD, "p-4")}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="text-sm font-semibold text-black">Ad Campaigns</div>
                <p className="text-[13px] text-gray-600">Develop advertising strategy and track campaign performance</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowAgentModal(true)}
                  className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-xs text-gray-700 hover:bg-gray-50"
                >
                  AI Agent
                </button>
                <button
                  onClick={() => setShowCampaignModal(true)}
                  className="text-xs px-3 py-1.5 rounded-md border border-gray-300 hover:bg-gray-100 bg-white"
                >
                  + New Campaign
                </button>
              </div>
            </div>
            <div className="mt-3 overflow-hidden rounded-lg border border-gray-200">
              <table className="w-full text-sm">
                <thead className="bg-white text-left text-[12px] uppercase tracking-wide text-gray-500">
                  <tr>
                    <th className="px-3 py-2 font-medium">Campaign</th>
                    <th className="px-3 py-2 font-medium">Platform</th>
                    <th className="px-3 py-2 font-medium">Status</th>
                    <th className="px-3 py-2 font-medium">Budget</th>
                    <th className="px-3 py-2 font-medium">Spent</th>
                    <th className="px-3 py-2 font-medium">CTR</th>
                    <th className="px-3 py-2 font-medium">ROAS</th>
                    <th className="px-3 py-2 font-medium">Conversions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {adCampaigns.map((campaign) => (
                    <tr key={campaign.id} className="hover:bg-gray-50 cursor-pointer">
                      <td className="px-3 py-2 font-medium text-black">{campaign.name}</td>
                      <td className="px-3 py-2 text-gray-700">{campaign.platform}</td>
                      <td className="px-3 py-2">
                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ${
                          campaign.status === 'Active' ? 'border border-gray-300 bg-white text-gray-700' :
                          campaign.status === 'Paused' ? 'bg-amber-100 text-amber-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {campaign.status}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-gray-700">${(campaign.budget / 1000).toFixed(1)}k</td>
                      <td className="px-3 py-2 text-gray-700">${(campaign.spent / 1000).toFixed(1)}k</td>
                      <td className="px-3 py-2 text-gray-700">{campaign.metrics?.ctr?.toFixed(2)}%</td>
                      <td className="px-3 py-2 text-gray-600 font-medium">{campaign.metrics?.roas?.toFixed(1)}x</td>
                      <td className="px-3 py-2 text-gray-700">{campaign.metrics?.conversions || 0}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <Card className={cn(TRS_CARD, "p-4")}>
              <div className="text-sm font-semibold text-black mb-3">Campaign Performance</div>
              <div className="space-y-3">
                <div className={cn(TRS_CARD, "p-3")}>
                  <div className={TRS_SUBTITLE}>Total Impressions</div>
                  <div className="mt-1 text-2xl font-semibold text-black">{kpis.advertising.impressions.toLocaleString()}</div>
                </div>
                <div className={cn(TRS_CARD, "p-3")}>
                  <div className={TRS_SUBTITLE}>Total Clicks</div>
                  <div className="mt-1 text-2xl font-semibold text-black">{kpis.advertising.clicks.toLocaleString()}</div>
                </div>
                <div className={cn(TRS_CARD, "p-3")}>
                  <div className={TRS_SUBTITLE}>Total Conversions</div>
                  <div className="mt-1 text-2xl font-semibold text-black">{kpis.advertising.conversions}</div>
                </div>
              </div>
            </Card>

            <Card className={cn(TRS_CARD, "p-4")}>
              <div className="text-sm font-semibold text-black mb-3">Budget Overview</div>
              <div className="space-y-4">
                {adCampaigns.filter(c => c.status === 'Active').map((campaign) => (
                  <div key={campaign.id}>
                    <div className="flex items-center justify-between mb-1">
                      <div className="text-[12px] font-medium text-black">{campaign.name}</div>
                      <div className="text-[12px] text-gray-600">
                        ${(campaign.spent / 1000).toFixed(1)}k / ${(campaign.budget / 1000).toFixed(1)}k
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-gray-700 h-2 rounded-full"
                        style={{ width: `${Math.min((campaign.spent / campaign.budget) * 100, 100)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* Campaign Creation Modal */}
      {showCampaignModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-semibold text-black mb-4">Create New Campaign</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Campaign Name</label>
                <input
                  type="text"
                  value={campaignForm.name}
                  onChange={(e) => setCampaignForm({...campaignForm, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="Q1 Revenue Campaign"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Platform</label>
                <select
                  value={campaignForm.platform}
                  onChange={(e) => setCampaignForm({...campaignForm, platform: e.target.value as any})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="LinkedIn">LinkedIn</option>
                  <option value="Google">Google</option>
                  <option value="Facebook">Facebook</option>
                  <option value="Twitter">Twitter</option>
                  <option value="Multi-Channel">Multi-Channel</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Objective</label>
                <select
                  value={campaignForm.objective}
                  onChange={(e) => setCampaignForm({...campaignForm, objective: e.target.value as any})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="Brand Awareness">Brand Awareness</option>
                  <option value="Lead Generation">Lead Generation</option>
                  <option value="Conversion">Conversion</option>
                  <option value="Engagement">Engagement</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Budget ($)</label>
                <input
                  type="number"
                  value={campaignForm.budget}
                  onChange={(e) => setCampaignForm({...campaignForm, budget: parseInt(e.target.value) || 0})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="10000"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Target Audience</label>
                <input
                  type="text"
                  value={campaignForm.targetAudience}
                  onChange={(e) => setCampaignForm({...campaignForm, targetAudience: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="CROs, VP Revenue, Enterprise SaaS"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                <input
                  type="date"
                  value={campaignForm.startDate}
                  onChange={(e) => setCampaignForm({...campaignForm, startDate: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
            </div>
            <div className="flex gap-2 mt-6">
              <button
                onClick={() => setShowCampaignModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateCampaign}
                className="flex-1 px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800"
              >
                Create Campaign
              </button>
            </div>
          </div>
        </div>
      )}

      {/* AI Agent Modal */}
      {showAgentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-semibold text-black mb-4">Advertising Agent</h2>
            <p className="text-sm text-gray-600 mb-4">
              Describe your advertising goals and let AI create a campaign strategy for you.
            </p>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Campaign Description</label>
                <textarea
                  value={agentPrompt}
                  onChange={(e) => setAgentPrompt(e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="Create a LinkedIn campaign to generate leads from enterprise SaaS companies, focusing on revenue operations and forecasting pain points..."
                />
              </div>
              <div className="text-xs text-gray-500">
                Tip: Be specific about your target audience, platform preferences, and campaign objectives
              </div>
            </div>
            <div className="mt-6 flex gap-2">
              <button
                onClick={() => setShowAgentModal(false)}
                className="flex-1 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleGenerateWithAgent}
                className="flex-1 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
              >
                Generate with AI
              </button>
            </div>
          </div>
        </div>
      )}
      </section>
    </div>
  );
}
