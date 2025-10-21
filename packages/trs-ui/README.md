# TRS UI Design System

Complete UI theme system for The Revenue Scientists (TRS). Enterprise-grade components and design tokens for Next.js + TailwindCSS + TypeScript applications.

## 🎨 Design Principles

- **Deep green primary** (#0d3a23) with **orange accent** (#fd8216)
- Minimal, professional typography (Inter font family)
- Modular card-based layouts with subtle shadows
- Responsive grid system for dashboards
- Consistent spacing and border radius

## 📦 Installation

Since this is a monorepo package, reference it in your `package.json`:

```json
{
  "dependencies": {
    "@trs/ui": "workspace:*"
  }
}
```

Or use direct imports:

```tsx
import { TRSLayout, MetricCard } from '@trs/ui';
```

## 🚀 Quick Start

### 1. Configure Tailwind

Extend your `tailwind.config.ts` with TRS theme tokens:

```typescript
import { trsUITailwindExtend } from '@trs/ui/tailwind';

const config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './packages/trs-ui/**/*.{js,ts,jsx,tsx}', // Include TRS UI components
  ],
  theme: {
    extend: trsUITailwindExtend.theme.extend,
  },
};

export default config;
```

### 2. Use TRS Layout

Wrap your pages with `TRSLayout` for consistent navigation and structure:

```tsx
import { TRSLayout, PageHeader, defaultNavItems } from '@trs/ui';

export default function DashboardPage() {
  return (
    <TRSLayout
      navItems={defaultNavItems}
      header={
        <PageHeader
          title="Dashboard"
          breadcrumb={['Execution Layer', 'TRS-RevOS']}
        />
      }
    >
      <YourContent />
    </TRSLayout>
  );
}
```

### 3. Display Metrics

Use `MetricCard` for KPIs with delta indicators:

```tsx
import { MetricCard, MetricCardGrid } from '@trs/ui';

<MetricCardGrid columns={3}>
  <MetricCard
    label="Annual Revenue"
    value="$40,024"
    delta="+12.5%"
    deltaType="positive"
  />
  <MetricCard
    label="Active Clients"
    value="127"
    delta="+8"
    deltaType="positive"
  />
  <MetricCard
    label="Conversion Rate"
    value="94.2%"
  />
</MetricCardGrid>
```

### 4. Build Dashboard Grids

Create responsive dashboard layouts with `DashboardGrid` and `DashboardCard`:

```tsx
import { DashboardGrid, DashboardCard, ChartPlaceholder } from '@trs/ui';

<DashboardGrid columns={2}>
  <DashboardCard
    title="Revenue Trend"
    subtitle="Last 12 months"
    colSpan={2}
  >
    <ChartPlaceholder type="Line Chart" height={300} />
  </DashboardCard>

  <DashboardCard title="Client Health">
    <DonutChart data={data} />
  </DashboardCard>

  <DashboardCard title="Documents by Type">
    <BarChart data={data} />
  </DashboardCard>
</DashboardGrid>
```

## 🧩 Components

### Layout Components

#### `TRSLayout`

Base layout with sidebar and main content area.

**Props:**
- `children` - Main content
- `navItems` - Navigation menu items (defaults to `defaultNavItems`)
- `logo` - Logo/branding component
- `header` - Page header content
- `sidebarFooter` - Footer in sidebar
- `defaultCollapsed` - Start with collapsed sidebar
- `hideSidebar` - Hide sidebar completely

#### `PageHeader`

Standardized page header with breadcrumbs.

**Props:**
- `title` - Page title
- `breadcrumb` - Breadcrumb path array
- `actions` - Action buttons/controls
- `subtitle` - Page description

### Navigation Components

#### `Sidebar`

Persistent navigation sidebar.

**Props:**
- `items` - `NavItem[]` navigation items
- `logo` - Logo/branding
- `footer` - Footer content
- `collapsed` - Collapsed state
- `onNavClick` - Click handler

### Metric Components

#### `MetricCard`

Display single KPI with optional delta.

**Props:**
- `label` - Metric name
- `value` - Primary value
- `delta` - Change indicator (e.g., "+12%")
- `deltaType` - `'positive' | 'negative' | 'neutral'`
- `icon` - Optional icon
- `subtitle` - Description
- `loading` - Loading state

#### `MetricCardGrid`

Responsive grid for metric cards.

**Props:**
- `columns` - `1 | 2 | 3 | 4 | 6`
- `gap` - `'sm' | 'base' | 'lg'`

### Dashboard Components

#### `DashboardGrid`

Responsive grid layout for dashboard content.

**Props:**
- `columns` - `1 | 2 | 3 | 4`
- `gap` - `'sm' | 'base' | 'lg'`

#### `DashboardCard`

Standardized card for charts and tables.

**Props:**
- `title` - Card title
- `subtitle` - Card description
- `actions` - Header actions
- `colSpan` - `1 | 2 | 3 | 4 | 'full'`
- `rowSpan` - `1 | 2 | 3 | 4`
- `padding` - `'none' | 'sm' | 'base' | 'lg'`
- `loading` - Loading state

#### `ChartPlaceholder`

Placeholder for charts during development.

**Props:**
- `type` - Chart name/type
- `height` - Height in pixels or Tailwind class
- `message` - Custom message

## 🎨 Theme Tokens

### Colors

```tsx
import { theme } from '@trs/ui';

theme.colors.background    // #0d3a23 - Deep green
theme.colors.surface       // #124f2e - Card background
theme.colors.accent        // #fd8216 - Orange accent
theme.colors.textPrimary   // #f8f8f6 - Primary text
theme.colors.textMuted     // #b3c2b0 - Muted text
theme.colors.border        // #1c5c3b - Borders
```

### Typography

```tsx
theme.fonts.sans           // Inter, sans-serif
theme.fontSizes.base       // 1rem (16px)
theme.fontSizes['2xl']     // 1.5rem (24px)
theme.fontWeights.semibold // 600
```

### Spacing & Layout

```tsx
theme.spacing[8]           // 2rem (32px)
theme.radii.base           // 12px
theme.shadows.card         // Card shadow
theme.layout.sidebarWidth  // 250px
```

## 🎯 Tailwind Classes

TRS-specific Tailwind classes:

```tsx
// Background colors
bg-trs-background
bg-trs-surface
bg-trs-surface-hover

// Accent colors
bg-trs-accent
bg-trs-accent-hover

// Text colors
text-trs-text-primary
text-trs-text-secondary
text-trs-text-muted

// Border colors
border-trs-border
border-trs-border-light

// Shadows
shadow-trs-card
shadow-trs-lg

// Border radius
rounded-trs-base    // 12px
rounded-trs-lg      // 16px
```

## 📖 Examples

See `/examples/DashboardPage.tsx` for a complete example showing:
- Full page layout with sidebar
- Metric cards in responsive grid
- Dashboard cards with chart placeholders
- Recent activity feed
- Consistent styling and spacing

## 🔧 TypeScript Support

Full TypeScript support with exported types:

```tsx
import type {
  Theme,
  TRSLayoutProps,
  MetricCardProps,
  DashboardCardProps,
  NavItem,
} from '@trs/ui';
```

## 🎭 Customization

### Custom Navigation

```tsx
const customNavItems: NavItem[] = [
  { label: 'Home', href: '/', icon: <HomeIcon /> },
  { label: 'Analytics', href: '/analytics', badge: '5' },
  { label: 'Settings', href: '/settings' },
];

<TRSLayout navItems={customNavItems} />
```

### Custom Logo

```tsx
<TRSLayout
  logo={
    <img src="/logo.svg" alt="TRS" className="h-8" />
  }
/>
```

### Custom Theme Extension

```tsx
// In your tailwind.config.ts
import { trsUITailwindExtend } from '@trs/ui/tailwind';

export default {
  theme: {
    extend: {
      ...trsUITailwindExtend.theme.extend,
      colors: {
        ...trsUITailwindExtend.theme.extend.colors,
        // Add your custom colors
        brand: {
          custom: '#abc123',
        },
      },
    },
  },
};
```

## 📱 Responsive Behavior

All components are mobile-first and responsive:

- **Mobile (< 768px)**: 1 column, stacked layout
- **Tablet (768px - 1024px)**: 2 columns
- **Desktop (> 1024px)**: Full grid (3-4 columns)

## 🚦 Status Colors

Use status colors for different states:

```tsx
<MetricCard deltaType="positive" /> // Green
<MetricCard deltaType="negative" /> // Red
<MetricCard deltaType="neutral" />  // Gray
```

## 📄 License

MIT License - The Revenue Scientists

## 🤝 Contributing

This design system is the foundation for all TRS products. Keep it clean, consistent, and well-documented.

---

**Built with ❤️ by The Revenue Scientists**
