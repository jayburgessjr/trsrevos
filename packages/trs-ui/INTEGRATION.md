# TRS UI - Integration Guide

Step-by-step guide to integrate TRS UI into your Next.js application.

## Step 1: Update Tailwind Configuration

Update your root `tailwind.config.ts`:

```typescript
import type { Config } from 'tailwindcss';
import { trsUITailwindExtend } from './packages/trs-ui/tailwind.config.extend';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    // IMPORTANT: Include TRS UI components
    './packages/trs-ui/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      // Merge TRS UI theme tokens
      ...trsUITailwindExtend.theme.extend,
    },
  },
  plugins: [],
};

export default config;
```

## Step 2: Update Global Styles

Add TRS fonts to your `globals.css` or `app/globals.css`:

```css
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  body {
    @apply bg-trs-background text-trs-text-primary font-sans;
  }
}
```

## Step 3: Update TypeScript Paths (Optional)

For cleaner imports, add to `tsconfig.json`:

```json
{
  "compilerOptions": {
    "paths": {
      "@trs/ui": ["./packages/trs-ui"],
      "@trs/ui/*": ["./packages/trs-ui/*"]
    }
  }
}
```

Then import like:

```tsx
import { TRSLayout, MetricCard } from '@trs/ui';
```

## Step 4: Create a Layout Wrapper

Create `app/layout.tsx` or update your root layout:

```tsx
import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'TRS Dashboard',
  description: 'The Revenue Scientists Dashboard',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
```

## Step 5: Create Your First Page

Create `app/dashboard/page.tsx`:

```tsx
import {
  TRSLayout,
  PageHeader,
  MetricCardGrid,
  MetricCard,
  DashboardGrid,
  DashboardCard,
  ChartPlaceholder,
  defaultNavItems,
} from '@trs/ui';

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
        />
      }
    >
      {/* Metrics */}
      <MetricCardGrid columns={3} className="mb-8">
        <MetricCard
          label="Annual Revenue"
          value="$40,024"
          delta="+12%"
          deltaType="positive"
        />
        <MetricCard
          label="Active Clients"
          value="127"
          delta="+8"
          deltaType="positive"
        />
        <MetricCard
          label="Success Rate"
          value="94.2%"
          delta="+3.1%"
          deltaType="positive"
        />
      </MetricCardGrid>

      {/* Charts */}
      <DashboardGrid columns={2}>
        <DashboardCard
          title="Revenue Trend"
          subtitle="Last 12 months"
          colSpan={2}
        >
          <ChartPlaceholder type="Line Chart" height={300} />
        </DashboardCard>

        <DashboardCard title="Client Health">
          <ChartPlaceholder type="Donut Chart" height={250} />
        </DashboardCard>

        <DashboardCard title="Documents by Type">
          <ChartPlaceholder type="Bar Chart" height={250} />
        </DashboardCard>
      </DashboardGrid>
    </TRSLayout>
  );
}
```

## Step 6: Run Development Server

```bash
npm run dev
# or
pnpm dev
```

Visit `http://localhost:3000/dashboard` to see your TRS-themed dashboard!

## Common Issues & Solutions

### Issue: Tailwind classes not working

**Solution:** Ensure TRS UI path is in `tailwind.config.ts` content array:

```ts
content: [
  './app/**/*.{js,ts,jsx,tsx}',
  './packages/trs-ui/**/*.{js,ts,jsx,tsx}', // Add this
]
```

### Issue: Module not found '@trs/ui'

**Solution:** Use relative import or configure TypeScript paths:

```tsx
// Option 1: Relative import
import { TRSLayout } from '../../packages/trs-ui';

// Option 2: Configure paths in tsconfig.json
{
  "compilerOptions": {
    "paths": {
      "@trs/ui": ["./packages/trs-ui"]
    }
  }
}
```

### Issue: Fonts not loading

**Solution:** Add Inter font to `globals.css`:

```css
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
```

### Issue: Colors look different

**Solution:** Verify Tailwind config merges TRS theme:

```ts
theme: {
  extend: {
    ...trsUITailwindExtend.theme.extend,
  },
}
```

## Customization Examples

### Custom Brand Logo

```tsx
import Logo from './components/Logo';

<TRSLayout
  logo={<Logo />}
  // ...
/>
```

### Custom Navigation

```tsx
import { TRSLayout, type NavItem } from '@trs/ui';
import { Home, Users, Settings } from 'lucide-react';

const navItems: NavItem[] = [
  { label: 'Home', href: '/', icon: <Home size={20} /> },
  { label: 'Clients', href: '/clients', icon: <Users size={20} />, badge: 12 },
  { label: 'Settings', href: '/settings', icon: <Settings size={20} /> },
];

<TRSLayout navItems={navItems} />
```

### Add Custom Theme Colors

```ts
// tailwind.config.ts
export default {
  theme: {
    extend: {
      ...trsUITailwindExtend.theme.extend,
      colors: {
        ...trsUITailwindExtend.theme.extend.colors,
        // Add custom colors
        brand: {
          purple: '#8b5cf6',
          yellow: '#fbbf24',
        },
      },
    },
  },
};
```

## Next Steps

1. **Add Charts**: Integrate Recharts, Chart.js, or your preferred charting library
2. **Add Icons**: Install `lucide-react` or `react-icons` for icons
3. **Add Data Fetching**: Connect to your API/database
4. **Customize Components**: Extend base components with your own variants
5. **Add Authentication**: Integrate auth in layout wrapper

## Resources

- [TRS UI README](./README.md) - Full documentation
- [Usage Examples](./USAGE.md) - Code snippets and patterns
- [Example Dashboard](./examples/DashboardPage.tsx) - Complete example

---

**Need help?** Contact the TRS development team.
