/**
 * TRS UI Design System
 *
 * Complete UI theme system for The Revenue Scientists.
 * Enterprise-grade components with dark/light themes and GSAP animations.
 *
 * @example
 * ```tsx
 * import { TRSLayout, MetricCard, useThemeToggle, useScrollMotion } from '@trs/ui';
 *
 * export default function Dashboard() {
 *   const { theme, toggleTheme } = useThemeToggle();
 *   const ref = useScrollMotion({ animation: 'fadeUp' });
 *
 *   return (
 *     <TRSLayout>
 *       <div ref={ref}>
 *         <MetricCard label="Revenue" value="$40,024" delta="+12%" />
 *       </div>
 *     </TRSLayout>
 *   );
 * }
 * ```
 */

// ========================================
// Theme System
// ========================================
export {
  theme,
  darkTheme,
  lightTheme,
  type Theme,
  type ThemeMode,
  type ThemeColors,
} from './theme/theme';

// ========================================
// Tailwind Configuration
// ========================================
export {
  trsUITailwindExtend,
  generateThemeCSS,
} from './tailwind.config.extend';

// ========================================
// Layout Components
// ========================================
export {
  TRSLayout,
  PageHeader,
  type TRSLayoutProps,
  type PageHeaderProps,
} from './layout/TRSLayout';

// ========================================
// Navigation Components
// ========================================
export {
  Sidebar,
  defaultNavItems,
  type SidebarProps,
  type NavItem,
} from './components/Sidebar';

// ========================================
// Metric Components
// ========================================
export {
  MetricCard,
  MetricCardGrid,
  type MetricCardProps,
  type MetricCardGridProps,
} from './components/MetricCard';

// ========================================
// Dashboard Components
// ========================================
export {
  DashboardGrid,
  DashboardCard,
  ChartPlaceholder,
  type DashboardGridProps,
  type DashboardCardProps,
  type ChartPlaceholderProps,
} from './components/DashboardGrid';

// ========================================
// Chart Components
// ========================================
export {
  ChartCard,
  type ChartCardProps,
} from './components/ChartCard';

// ========================================
// Hooks
// ========================================
export {
  useThemeToggle,
  ThemeGuard,
} from './hooks/useThemeToggle';

export {
  useScrollMotion,
  useStaggerChildren,
  useFadeIn,
  useSlideIn,
  useCountUp,
  type UseScrollMotionOptions,
  type AnimationType,
  type StaggerType,
  type ScrollType,
} from './hooks/useScrollMotion';

// ========================================
// Animation Configuration
// ========================================
export {
  gsap,
  ScrollTrigger,
  durations,
  easings,
  animations,
  staggers,
  scrollDefaults,
  initGSAP,
  cleanupGSAP,
  createScrollAnimation,
} from './animations/gsap.config';

// ========================================
// Default Export
// ========================================
export default {
  // Theme
  theme,
  darkTheme,
  lightTheme,

  // Layout
  TRSLayout,
  PageHeader,

  // Navigation
  Sidebar,
  defaultNavItems,

  // Metrics
  MetricCard,
  MetricCardGrid,

  // Dashboard
  DashboardGrid,
  DashboardCard,
  ChartPlaceholder,
  ChartCard,

  // Hooks
  useThemeToggle,
  useScrollMotion,
  useStaggerChildren,
  useFadeIn,
  useSlideIn,
  useCountUp,

  // Animation
  gsap,
  ScrollTrigger,

  // Config
  trsUITailwindExtend,
  generateThemeCSS,
};
