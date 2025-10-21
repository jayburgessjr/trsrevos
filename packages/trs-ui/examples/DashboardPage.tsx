'use client';

import React from 'react';
import { TRSLayout, PageHeader } from '../layout/TRSLayout';
import { defaultNavItems } from '../components/Sidebar';
import { MetricCard, MetricCardGrid } from '../components/MetricCard';
import { DashboardGrid, DashboardCard, ChartPlaceholder } from '../components/DashboardGrid';

/**
 * Example Dashboard Page
 *
 * Demonstrates the complete TRS UI design system in action.
 * Shows metrics, charts, and layout matching the provided screenshot.
 */
export default function DashboardPage() {
  return (
    <TRSLayout
      navItems={defaultNavItems}
      logo={
        <div className="text-trs-text-primary font-bold text-xl">
          TRS
        </div>
      }
      header={
        <PageHeader
          title="Dashboard"
          breadcrumb={['Execution Layer', 'TRS-RevOS']}
          actions={
            <button className="px-4 py-2 bg-trs-accent hover:bg-trs-accent-hover text-white rounded-trs-base font-medium transition-colors">
              Export Report
            </button>
          }
        />
      }
    >
      {/* Key Metrics Grid */}
      <section className="mb-8">
        <h2 className="text-lg font-semibold text-trs-text-primary mb-4">
          Key Performance Indicators
        </h2>
        <MetricCardGrid columns={3}>
          <MetricCard
            label="Annual Revenue"
            value="$40,024"
            delta="+12.5%"
            deltaType="positive"
            subtitle="Year-over-year growth"
          />
          <MetricCard
            label="Active Clients"
            value="127"
            delta="+8"
            deltaType="positive"
            subtitle="New this quarter"
          />
          <MetricCard
            label="Project Success Rate"
            value="94.2%"
            delta="+3.1%"
            deltaType="positive"
          />
          <MetricCard
            label="Total Documents"
            value="1,543"
            delta="+156"
            deltaType="positive"
            subtitle="Last 30 days"
          />
          <MetricCard
            label="Agent Utilization"
            value="87%"
            delta="-2%"
            deltaType="negative"
            subtitle="Avg across all agents"
          />
          <MetricCard
            label="Revenue per Client"
            value="$315"
            delta="+5.2%"
            deltaType="positive"
            subtitle="Monthly average"
          />
        </MetricCardGrid>
      </section>

      {/* Charts Section */}
      <section>
        <h2 className="text-lg font-semibold text-trs-text-primary mb-4">
          Analytics & Trends
        </h2>
        <DashboardGrid columns={2}>
          {/* Revenue Trend Chart */}
          <DashboardCard
            title="Revenue Trend"
            subtitle="Last 12 months"
            colSpan={2}
            actions={
              <select className="px-3 py-1.5 bg-trs-background border border-trs-border rounded-trs-sm text-sm text-trs-text-primary">
                <option>Last 12 months</option>
                <option>Last 6 months</option>
                <option>Last 3 months</option>
              </select>
            }
          >
            <ChartPlaceholder
              type="Revenue Line Chart"
              height={300}
              message="Insert your preferred charting library (Recharts, Chart.js, etc.)"
            />
          </DashboardCard>

          {/* Client Health Score */}
          <DashboardCard
            title="Client Health Score"
            subtitle="Distribution by segment"
          >
            <ChartPlaceholder
              type="Donut Chart"
              height={280}
              message="Healthy: 78% | At Risk: 15% | Critical: 7%"
            />
          </DashboardCard>

          {/* Documents by Type */}
          <DashboardCard
            title="Documents by Type"
            subtitle="Current month breakdown"
          >
            <ChartPlaceholder
              type="Bar Chart"
              height={280}
              message="Proposals, Contracts, Reports, Audits"
            />
          </DashboardCard>

          {/* Recent Activity */}
          <DashboardCard
            title="Recent Activity"
            subtitle="Last 7 days"
            colSpan={2}
          >
            <div className="space-y-3">
              {recentActivities.map((activity, index) => (
                <div
                  key={index}
                  className="flex items-start gap-4 p-3 bg-trs-background rounded-trs-sm border border-trs-border hover:border-trs-accent transition-colors"
                >
                  <div className="flex-shrink-0 w-10 h-10 bg-trs-accent/20 rounded-full flex items-center justify-center text-trs-accent font-semibold">
                    {activity.icon}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-trs-text-primary font-medium">
                      {activity.title}
                    </p>
                    <p className="text-xs text-trs-text-muted mt-1">
                      {activity.description}
                    </p>
                  </div>
                  <div className="flex-shrink-0 text-xs text-trs-text-muted">
                    {activity.time}
                  </div>
                </div>
              ))}
            </div>
          </DashboardCard>
        </DashboardGrid>
      </section>
    </TRSLayout>
  );
}

// Sample activity data
const recentActivities = [
  {
    icon: '📄',
    title: 'New proposal submitted',
    description: 'Acme Corp - Q4 Revenue Optimization Strategy',
    time: '2h ago',
  },
  {
    icon: '✅',
    title: 'Project milestone completed',
    description: 'TechStart Inc - Phase 2 Implementation',
    time: '5h ago',
  },
  {
    icon: '👤',
    title: 'New client onboarded',
    description: 'Global Ventures LLC signed annual contract',
    time: '1d ago',
  },
  {
    icon: '📊',
    title: 'Quarterly report generated',
    description: 'Q3 Performance Analysis - 47 clients',
    time: '2d ago',
  },
  {
    icon: '🤖',
    title: 'Agent task completed',
    description: 'Market Analysis Agent finished competitive research',
    time: '3d ago',
  },
];
