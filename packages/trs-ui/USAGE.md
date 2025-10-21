# TRS UI - Quick Usage Guide

## Import Examples

### Simple Dashboard Page

```tsx
import { TRSLayout, MetricCard, DashboardGrid } from '@trs/ui';

export default function Dashboard() {
  return (
    <TRSLayout>
      <h1 className="text-2xl font-bold text-trs-text-primary mb-6">
        Dashboard
      </h1>

      <DashboardGrid columns={3}>
        <MetricCard label="Revenue" value="$40,024" delta="+12%" />
        <MetricCard label="Clients" value="127" delta="+8" />
        <MetricCard label="Success Rate" value="94.2%" delta="+3.1%" />
      </DashboardGrid>
    </TRSLayout>
  );
}
```

### Full Featured Page

```tsx
import {
  TRSLayout,
  PageHeader,
  MetricCardGrid,
  MetricCard,
  DashboardGrid,
  DashboardCard,
  ChartPlaceholder,
} from '@trs/ui';

export default function AnalyticsPage() {
  return (
    <TRSLayout
      header={
        <PageHeader
          title="Analytics"
          breadcrumb={['Execution Layer', 'Analytics']}
          subtitle="Revenue and performance metrics"
          actions={
            <button className="px-4 py-2 bg-trs-accent text-white rounded-trs-base">
              Export
            </button>
          }
        />
      }
    >
      {/* Metrics */}
      <MetricCardGrid columns={4} className="mb-8">
        <MetricCard
          label="Total Revenue"
          value="$1.2M"
          delta="+15.3%"
          deltaType="positive"
          subtitle="This quarter"
        />
        <MetricCard
          label="New Clients"
          value="45"
          delta="+12"
          deltaType="positive"
        />
        <MetricCard
          label="Churn Rate"
          value="2.1%"
          delta="-0.5%"
          deltaType="positive"
        />
        <MetricCard
          label="Avg Deal Size"
          value="$26,667"
          delta="+8.2%"
          deltaType="positive"
        />
      </MetricCardGrid>

      {/* Charts */}
      <DashboardGrid columns={2}>
        <DashboardCard
          title="Revenue Trend"
          subtitle="Monthly breakdown"
          colSpan={2}
        >
          <ChartPlaceholder type="Line Chart" height={300} />
        </DashboardCard>

        <DashboardCard title="Top Clients">
          <ChartPlaceholder type="Bar Chart" height={250} />
        </DashboardCard>

        <DashboardCard title="Revenue by Segment">
          <ChartPlaceholder type="Pie Chart" height={250} />
        </DashboardCard>
      </DashboardGrid>
    </TRSLayout>
  );
}
```

### Custom Navigation

```tsx
import { TRSLayout, type NavItem } from '@trs/ui';

const myNavItems: NavItem[] = [
  { label: 'Overview', href: '/overview' },
  { label: 'Clients', href: '/clients', badge: '12' },
  { label: 'Reports', href: '/reports' },
  { label: 'Settings', href: '/settings' },
];

export default function CustomPage() {
  return (
    <TRSLayout
      navItems={myNavItems}
      logo={<img src="/logo.png" alt="Logo" />}
    >
      {/* Your content */}
    </TRSLayout>
  );
}
```

### Using Theme Tokens Directly

```tsx
import { theme } from '@trs/ui';

export function CustomComponent() {
  return (
    <div
      style={{
        backgroundColor: theme.colors.surface,
        color: theme.colors.textPrimary,
        padding: theme.spacing[6],
        borderRadius: theme.radii.base,
      }}
    >
      Custom styled component
    </div>
  );
}
```

### Tailwind Classes

```tsx
export function StyledCard() {
  return (
    <div className="bg-trs-surface border border-trs-border rounded-trs-base p-6 shadow-trs-card">
      <h2 className="text-trs-text-primary font-semibold text-xl mb-2">
        Card Title
      </h2>
      <p className="text-trs-text-muted text-sm">
        Card description
      </p>
      <button className="mt-4 px-4 py-2 bg-trs-accent hover:bg-trs-accent-hover text-white rounded-trs-base transition-colors">
        Action
      </button>
    </div>
  );
}
```

### Loading States

```tsx
<MetricCard
  label="Revenue"
  value="Loading..."
  loading={true}
/>

<DashboardCard title="Chart" loading={true}>
  Content here
</DashboardCard>
```

### Interactive Cards

```tsx
<MetricCard
  label="Active Projects"
  value="42"
  onClick={() => router.push('/projects')}
/>

<DashboardCard
  title="Recent Activity"
  onClick={() => console.log('Card clicked')}
>
  Content
</DashboardCard>
```

## Color Reference

```tsx
// Use these Tailwind classes directly
bg-trs-background       // #0d3a23 - Main background
bg-trs-surface          // #124f2e - Card background
bg-trs-surface-hover    // #156336 - Hover state
bg-trs-accent           // #fd8216 - Orange accent
bg-trs-accent-hover     // #ff9233 - Accent hover

text-trs-text-primary   // #f8f8f6 - Primary text
text-trs-text-secondary // #e8e8e6 - Secondary text
text-trs-text-muted     // #b3c2b0 - Muted text

border-trs-border       // #1c5c3b - Border color
border-trs-border-light // #2a7048 - Light border

text-trs-success        // Green - Positive metrics
text-trs-error          // Red - Negative metrics
text-trs-warning        // Yellow - Warnings
text-trs-info           // Blue - Info
```

## Responsive Grid Examples

```tsx
// 3 columns on desktop, 2 on tablet, 1 on mobile
<MetricCardGrid columns={3}>
  {metrics.map(m => <MetricCard key={m.id} {...m} />)}
</MetricCardGrid>

// 2 columns with full-width first card
<DashboardGrid columns={2}>
  <DashboardCard title="Overview" colSpan="full">
    Full width content
  </DashboardCard>
  <DashboardCard title="Chart 1">Content</DashboardCard>
  <DashboardCard title="Chart 2">Content</DashboardCard>
</DashboardGrid>
```

## Common Patterns

### Dashboard Header

```tsx
<PageHeader
  title="Dashboard"
  breadcrumb={['Execution Layer', 'TRS-RevOS']}
  actions={
    <>
      <button className="px-4 py-2 bg-trs-surface border border-trs-border rounded-trs-base text-trs-text-primary hover:bg-trs-surface-hover">
        Filter
      </button>
      <button className="px-4 py-2 bg-trs-accent text-white rounded-trs-base hover:bg-trs-accent-hover">
        Export
      </button>
    </>
  }
/>
```

### Metric with Icon

```tsx
import { DollarSign } from 'lucide-react';

<MetricCard
  label="Total Revenue"
  value="$125,000"
  delta="+15%"
  deltaType="positive"
  icon={<DollarSign size={20} />}
/>
```

### Card with Actions

```tsx
<DashboardCard
  title="Revenue Chart"
  actions={
    <select className="px-3 py-1.5 bg-trs-background border border-trs-border rounded-trs-sm text-trs-text-primary text-sm">
      <option>Last 30 days</option>
      <option>Last 90 days</option>
      <option>Last year</option>
    </select>
  }
>
  <YourChart />
</DashboardCard>
```

---

**For full documentation, see [README.md](./README.md)**
