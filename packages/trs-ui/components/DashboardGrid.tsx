'use client';

import React, { ReactNode } from 'react';

/**
 * Dashboard Grid Props
 */
export interface DashboardGridProps {
  /** Grid content (cards, charts, etc.) */
  children: ReactNode;
  /** Number of columns */
  columns?: 1 | 2 | 3 | 4;
  /** Gap between items */
  gap?: 'sm' | 'base' | 'lg';
  /** Custom className */
  className?: string;
}

/**
 * Dashboard Grid Component
 *
 * Responsive grid layout for dashboard cards and charts.
 * Auto-adjusts on mobile/tablet/desktop.
 *
 * @example
 * ```tsx
 * <DashboardGrid columns={3}>
 *   <Card>Revenue Chart</Card>
 *   <Card>Client Health</Card>
 *   <Card>Documents</Card>
 * </DashboardGrid>
 * ```
 */
export function DashboardGrid({
  children,
  columns = 3,
  gap = 'base',
  className = '',
}: DashboardGridProps) {
  const gridColsClass = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 lg:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 xl:grid-cols-4',
  }[columns];

  const gapClass = {
    sm: 'gap-4',
    base: 'gap-6',
    lg: 'gap-8',
  }[gap];

  return (
    <div className={`grid ${gridColsClass} ${gapClass} ${className}`}>
      {children}
    </div>
  );
}

/**
 * Dashboard Card Props
 */
export interface DashboardCardProps {
  /** Card title */
  title?: string;
  /** Card content */
  children: ReactNode;
  /** Optional subtitle or description */
  subtitle?: string;
  /** Header actions (buttons, filters, etc.) */
  actions?: ReactNode;
  /** Loading state */
  loading?: boolean;
  /** Custom className */
  className?: string;
  /** Span multiple columns */
  colSpan?: 1 | 2 | 3 | 4 | 'full';
  /** Span multiple rows */
  rowSpan?: 1 | 2 | 3 | 4;
  /** Click handler */
  onClick?: () => void;
  /** Padding size */
  padding?: 'sm' | 'base' | 'lg' | 'none';
}

/**
 * Dashboard Card Component
 *
 * Standardized card for dashboard content (charts, tables, metrics).
 *
 * @example
 * ```tsx
 * <DashboardCard
 *   title="Revenue Trend"
 *   subtitle="Last 12 months"
 *   colSpan={2}
 * >
 *   <LineChart data={data} />
 * </DashboardCard>
 * ```
 */
export function DashboardCard({
  title,
  children,
  subtitle,
  actions,
  loading = false,
  className = '',
  colSpan,
  rowSpan,
  onClick,
  padding = 'base',
}: DashboardCardProps) {
  const isClickable = !!onClick;

  const colSpanClass = colSpan
    ? {
        1: 'col-span-1',
        2: 'col-span-1 md:col-span-2',
        3: 'col-span-1 md:col-span-2 xl:col-span-3',
        4: 'col-span-1 md:col-span-2 xl:col-span-4',
        full: 'col-span-full',
      }[colSpan]
    : '';

  const rowSpanClass = rowSpan
    ? {
        1: 'row-span-1',
        2: 'row-span-2',
        3: 'row-span-3',
        4: 'row-span-4',
      }[rowSpan]
    : '';

  const paddingClass = {
    none: 'p-0',
    sm: 'p-4',
    base: 'p-5',
    lg: 'p-6',
  }[padding];

  return (
    <div
      onClick={onClick}
      className={`
        bg-trs-surface
        border border-trs-border
        rounded-trs-base
        shadow-trs-card
        transition-all duration-fast
        ${isClickable ? 'cursor-pointer hover:bg-trs-surface-hover hover:shadow-trs-lg' : ''}
        ${colSpanClass}
        ${rowSpanClass}
        ${className}
      `}
    >
      {/* Card Header */}
      {(title || actions) && (
        <div className={`flex items-start justify-between border-b border-trs-border ${padding === 'none' ? 'p-5' : paddingClass}`}>
          <div>
            {title && (
              <h3 className="text-lg font-semibold text-trs-text-primary">
                {title}
              </h3>
            )}
            {subtitle && (
              <p className="text-sm text-trs-text-muted mt-1">
                {subtitle}
              </p>
            )}
          </div>
          {actions && (
            <div className="ml-4 flex items-center gap-2">
              {actions}
            </div>
          )}
        </div>
      )}

      {/* Card Content */}
      <div className={title || actions ? (padding === 'none' ? '' : paddingClass) : paddingClass}>
        {loading ? (
          <div className="space-y-3">
            <div className="h-8 bg-trs-border animate-pulse rounded-trs-sm" />
            <div className="h-24 bg-trs-border animate-pulse rounded-trs-sm" />
            <div className="h-8 bg-trs-border animate-pulse rounded-trs-sm w-3/4" />
          </div>
        ) : (
          children
        )}
      </div>
    </div>
  );
}

/**
 * Chart Placeholder Component
 *
 * Placeholder for chart components during development.
 */
export interface ChartPlaceholderProps {
  /** Chart type/name */
  type: string;
  /** Height in pixels or tailwind class */
  height?: string | number;
  /** Custom message */
  message?: string;
}

export function ChartPlaceholder({
  type,
  height = 300,
  message,
}: ChartPlaceholderProps) {
  const heightStyle = typeof height === 'number' ? `${height}px` : height;

  return (
    <div
      className="flex items-center justify-center bg-trs-background/50 border-2 border-dashed border-trs-border rounded-trs-base"
      style={{ height: heightStyle }}
    >
      <div className="text-center">
        <div className="text-trs-text-muted text-lg font-medium mb-2">
          {type}
        </div>
        {message && (
          <div className="text-sm text-trs-text-muted">
            {message}
          </div>
        )}
      </div>
    </div>
  );
}

export default DashboardGrid;
