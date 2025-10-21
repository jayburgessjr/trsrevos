# TRS UI v2.0 - Enhanced Features

## 🎉 What's New

TRS UI Design System has been significantly enhanced with **dark/light theme support** and **GSAP-powered animations**.

---

## ✨ New Features

### 1. Dual Theme Support (Dark + Light)

**Dark Theme (Default)**
- Deep forest green background (#0d3a23)
- Orange accent (#fd8216)
- Professional, modern aesthetic

**Light Theme**
- Clean white background (#f8f8f6)
- Same orange accent for brand consistency
- Accessible, professional look

**Theme Switching**
```tsx
import { useThemeToggle } from '@trs/ui';

function ThemeToggleButton() {
  const { theme, toggleTheme, isDark } = useThemeToggle();

  return (
    <button onClick={toggleTheme}>
      {isDark ? '☀️ Light Mode' : '🌙 Dark Mode'}
    </button>
  );
}
```

**Features:**
- ✅ Auto-detect system preference
- ✅ LocalStorage persistence
- ✅ CSS variables for instant switching
- ✅ No flash of unstyled content (FOUC)

---

### 2. GSAP Animation System

Professional, meaning-driven motion design powered by GSAP + ScrollTrigger.

**Pre-built Animations:**
- `fadeUp` - Fade in while moving up
- `fadeIn` - Simple opacity transition
- `slideInLeft` - Slide from left
- `slideInRight` - Slide from right
- `scaleIn` - Scale up with bounce
- `countUp` - Animated number counter

**Scroll-Triggered Animations**
```tsx
import { useScrollMotion } from '@trs/ui';

function Card() {
  const ref = useScrollMotion({ animation: 'fadeUp' });

  return <div ref={ref}>Animates on scroll!</div>;
}
```

**Staggered Animations**
```tsx
import { useStaggerChildren } from '@trs/ui';

function MetricGrid() {
  const ref = useStaggerChildren('fadeUp', 'base');

  return (
    <div ref={ref}>
      <MetricCard label="Revenue" value="$40k" />
      <MetricCard label="Clients" value="127" />
      <MetricCard label="Projects" value="5" />
      {/* Cards animate in sequence */}
    </div>
  );
}
```

**Number Counter**
```tsx
import { useCountUp } from '@trs/ui';

function MetricValue() {
  const [count, ref] = useCountUp(40024);

  return <div ref={ref}>${count.toLocaleString()}</div>;
}
```

---

### 3. New Components

#### ChartCard
Specialized card for data visualizations.

```tsx
import { ChartCard } from '@trs/ui';

<ChartCard
  title="Revenue Trend"
  subtitle="Last 12 months"
  height={300}
  actions={
    <select>
      <option>12 months</option>
      <option>6 months</option>
    </select>
  }
>
  <YourChart />
</ChartCard>
```

---

### 4. Enhanced Theme System

**New Theme Structure:**
```
packages/trs-ui/theme/
├── theme.ts      # Unified theme with shared tokens
├── dark.ts       # Dark theme colors
└── light.ts      # Light theme colors
```

**Typography System:**
```tsx
import { theme } from '@trs/ui';

// Access typography styles
theme.typography.h1  // { fontSize: '2.25rem', fontWeight: 700, ... }
theme.typography.body  // { fontSize: '0.875rem', fontWeight: 400, ... }
theme.typography.metric  // { fontSize: '2rem', fontWeight: 700, ... }
```

**Animation Tokens:**
```tsx
theme.animation.duration  // { fast: 150, base: 200, slow: 300, slower: 500 }
theme.animation.easing   // { easeIn, easeOut, smooth, etc. }
```

---

## 🔧 New Hooks

### useThemeToggle
```tsx
const {
  theme,        // 'dark' | 'light'
  setTheme,     // (theme: 'dark' | 'light') => void
  toggleTheme,  // () => void
  useSystemTheme, // () => void - Reset to system preference
  systemTheme,  // 'dark' | 'light' - System preference
  isDark,       // boolean
  isLight,      // boolean
  mounted,      // boolean - Prevents hydration issues
} = useThemeToggle();
```

### useScrollMotion
```tsx
const ref = useScrollMotion<HTMLDivElement>({
  animation: 'fadeUp',
  stagger: 'base',
  scroll: 'once',
  delay: 0.2,
  onStart: () => console.log('Started!'),
  onComplete: () => console.log('Done!'),
});
```

### useStaggerChildren
```tsx
const ref = useStaggerChildren<HTMLDivElement>('fadeUp', 'base');
```

### useFadeIn
```tsx
const ref = useFadeIn<HTMLDivElement>(0.2); // delay in seconds
```

### useSlideIn
```tsx
const leftRef = useSlideIn<HTMLDivElement>('left');
const rightRef = useSlideIn<HTMLDivElement>('right');
```

### useCountUp
```tsx
const [count, ref] = useCountUp(targetValue, duration);
```

---

## 📦 Updated Exports

```tsx
// Theme
import { theme, darkTheme, lightTheme } from '@trs/ui';

// Hooks
import {
  useThemeToggle,
  useScrollMotion,
  useStaggerChildren,
  useFadeIn,
  useSlideIn,
  useCountUp,
} from '@trs/ui';

// Animations
import {
  gsap,
  ScrollTrigger,
  durations,
  easings,
  animations,
  staggers,
} from '@trs/ui';

// Components
import {
  ChartCard,
  // ... all existing components
} from '@trs/ui';
```

---

## 🎨 CSS Variables

Theme colors are now CSS variables that automatically switch with theme:

```css
/* Automatically switches with theme */
.my-card {
  background: var(--trs-surface);
  color: var(--trs-text-primary);
  border: 1px solid var(--trs-border);
}
```

**Available CSS Variables:**
- `--trs-background`
- `--trs-surface`
- `--trs-surface-hover`
- `--trs-accent`
- `--trs-accent-hover`
- `--trs-text-primary`
- `--trs-text-secondary`
- `--trs-text-muted`
- `--trs-border`
- `--trs-border-light`
- And more...

---

## 🚀 Quick Start with New Features

### 1. Add Theme CSS Variables

In your `globals.css` or `app/globals.css`:

```css
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

@tailwind base;
@tailwind components;
@tailwind utilities;

/* TRS Theme Variables */
:root[data-theme="dark"], :root {
  --trs-background: #0d3a23;
  --trs-surface: #124f2e;
  --trs-surface-hover: #156336;
  --trs-accent: #fd8216;
  --trs-accent-hover: #ff9233;
  --trs-text-primary: #f8f8f6;
  --trs-text-secondary: #e8e8e6;
  --trs-text-muted: #b3c2b0;
  --trs-border: #1c5c3b;
  /* ... more variables */
}

:root[data-theme="light"] {
  --trs-background: #f8f8f6;
  --trs-surface: #ffffff;
  --trs-surface-hover: #f0f0ee;
  --trs-accent: #fd8216;
  --trs-accent-hover: #ff9233;
  --trs-text-primary: #0d3a23;
  --trs-text-secondary: #1a5a35;
  --trs-text-muted: #44684e;
  --trs-border: #cfd8cf;
  /* ... more variables */
}

@layer base {
  body {
    @apply bg-trs-background text-trs-text-primary font-sans;
  }
}
```

Or use the generator:

```tsx
import { generateThemeCSS } from '@trs/ui';

// In your _app.tsx or layout.tsx
const themeCSSString = generateThemeCSS();
// Inject into <style> tag or CSS file
```

### 2. Create Animated Dashboard

```tsx
import {
  TRSLayout,
  PageHeader,
  MetricCardGrid,
  MetricCard,
  DashboardGrid,
  ChartCard,
  useThemeToggle,
  useStaggerChildren,
} from '@trs/ui';

export default function Dashboard() {
  const { toggleTheme, isDark } = useThemeToggle();
  const metricsRef = useStaggerChildren('fadeUp', 'base');

  return (
    <TRSLayout
      header={
        <PageHeader
          title="Dashboard"
          breadcrumb={['Execution Layer', 'TRS-RevOS']}
          actions={
            <button onClick={toggleTheme} className="px-4 py-2 bg-trs-accent text-white rounded-trs-base">
              {isDark ? '☀️' : '🌙'}
            </button>
          }
        />
      }
    >
      {/* Animated Metrics */}
      <div ref={metricsRef}>
        <MetricCardGrid columns={3} className="mb-8">
          <MetricCard label="Revenue" value="$40,024" delta="+12%" deltaType="positive" />
          <MetricCard label="Clients" value="127" delta="+8" deltaType="positive" />
          <MetricCard label="Success Rate" value="94.2%" delta="+3.1%" deltaType="positive" />
        </MetricCardGrid>
      </div>

      {/* Animated Charts */}
      <DashboardGrid columns={2}>
        <ChartCard title="Revenue Trend" subtitle="Last 12 months" colSpan={2}>
          <YourChart />
        </ChartCard>
      </DashboardGrid>
    </TRSLayout>
  );
}
```

---

## 📊 File Structure

```
packages/trs-ui/
├── theme/
│   ├── theme.ts          # Unified theme system
│   ├── dark.ts           # Dark theme colors
│   └── light.ts          # Light theme colors
├── hooks/
│   ├── useThemeToggle.ts # Theme switching hook
│   └── useScrollMotion.ts # Animation hooks
├── animations/
│   └── gsap.config.ts    # GSAP configuration
├── components/
│   ├── Sidebar.tsx
│   ├── MetricCard.tsx
│   ├── DashboardGrid.tsx
│   └── ChartCard.tsx     # NEW
├── layout/
│   └── TRSLayout.tsx
├── examples/
│   └── DashboardPage.tsx
├── index.ts
├── tailwind.config.extend.ts
└── package.json (v2.0.0)
```

---

## 🎯 Use Cases

1. **Dashboard with theme toggle** - Revenue analytics with dark/light switch
2. **Marketing site** - Scroll-triggered animations on landing pages
3. **Data visualization** - Animated charts that trigger on scroll
4. **Admin panels** - Professional, accessible UI with theme support
5. **Client portals** - Customizable theme for client preferences

---

## 🔄 Migration from v1.x

### Breaking Changes
- Theme file moved from `./theme.ts` to `./theme/theme.ts`
- Components now use CSS variables instead of direct colors
- Need to add CSS variables to global styles

### Migration Steps

1. **Update imports:**
   ```tsx
   // Before
   import { theme } from '@trs/ui/theme';

   // After
   import { theme } from '@trs/ui/theme/theme';
   // Or just
   import { theme } from '@trs/ui';
   ```

2. **Add CSS variables to globals.css** (see Quick Start above)

3. **Update Tailwind config:**
   ```tsx
   // Already compatible! No changes needed
   import { trsUITailwindExtend } from '@trs/ui/tailwind';
   ```

4. **Optional: Add animations to existing components**
   ```tsx
   import { useScrollMotion } from '@trs/ui';

   function MyCard() {
     const ref = useScrollMotion({ animation: 'fadeUp' });
     return <div ref={ref}>...</div>;
   }
   ```

---

## 📚 Documentation

- **README.md** - Complete API documentation
- **USAGE.md** - Code examples and patterns
- **INTEGRATION.md** - Setup guide
- **V2-FEATURES.md** - This document

---

## 🎉 Summary

**What's New in v2.0:**
- ✅ Dark + Light theme support
- ✅ Theme toggle hook with localStorage
- ✅ GSAP + ScrollTrigger animations
- ✅ 5 animation hooks
- ✅ ChartCard component
- ✅ CSS variables for theme switching
- ✅ Pre-configured animation presets
- ✅ Scroll-triggered effects
- ✅ Stagger animations
- ✅ Number counters

**Total Components:** 10 (was 9)
**Total Hooks:** 6 (was 0)
**Theme Modes:** 2 (Dark + Light)
**Animation Presets:** 6
**New Files:** 6

**Status:** ✅ **PRODUCTION READY**

---

**Built for The Revenue Scientists**
*Enterprise design system with professional motion design*
