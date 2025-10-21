'use client';

import React, { ReactNode } from 'react';

/**
 * Chart Card Props
 */
export interface ChartCardProps {
  /** Chart title */
  title: string;
  /** Chart subtitle or description */
  subtitle?: string;
  /** Header actions (filters, dropdowns, etc.) */
  actions?: ReactNode;
  /** Chart content */
  children: ReactNode;
  /** Loading state */
  loading?: boolean;
  /** Custom className */
  className?: string;
  /** Span multiple columns */
  colSpan?: 1 | 2 | 3 | 4 | 'full';
  /** Span multiple rows */
  rowSpan?: 1 | 2 | 3 | 4;
  /** Chart height */
  height?: string | number;
  /** Padding size */
  padding?: 'none' | 'sm' | 'base' | 'lg';
  /** Click handler */
  onClick?: () => void;
}

/**
 * TRS Chart Card Component
 *
 * Specialized card component for data visualizations and charts.
 * Includes header with title/actions and content area optimized for charts.
 *
 * @example
 * ```tsx
 * <ChartCard
 *   title="Revenue Trend"
 *   subtitle="Last 12 months"
 *   height={300}
 *   actions={
 *     <select>
 *       <option>Last 12 months</option>
 *       <option>Last 6 months</option>
 *     </select>
 *   }
 * >
 *   <LineChart data={data} />
 * </ChartCard>
 * ```
 */
export function ChartCard({
  title,
  subtitle,
  actions,
  children,
  loading = false,
  className = '',
  colSpan,
  rowSpan,
  height = 300,
  padding = 'base',
  onClick,
}: ChartCardProps) {
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

  const heightStyle = typeof height === 'number' ? `${height}px` : height;

  return (
    <div
      onClick={onClick}
      className={`
        bg-[var(--trs-surface)]
        border border-[var(--trs-border)]
        rounded-[12px]
        shadow-[0px_4px_10px_rgba(0,0,0,0.1)]
        transition-all duration-200
        ${isClickable ? 'cursor-pointer hover:bg-[var(--trs-surface-hover)] hover:shadow-[0_10px_15px_-3px_rgba(0,0,0,0.15)]' : ''}
        ${colSpanClass}
        ${rowSpanClass}
        ${className}
      `}
    >
      {/* Card Header */}
      <div className={`flex items-start justify-between border-b border-[var(--trs-border)] ${paddingClass}`}>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-[var(--trs-text-primary)]">
            {title}
          </h3>
          {subtitle && (
            <p className="text-sm text-[var(--trs-text-muted)] mt-1">
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

      {/* Chart Content */}
      <div
        className={padding === 'none' ? '' : paddingClass}
        style={{ minHeight: heightStyle }}
      >
        {loading ? (
          <div className="flex items-center justify-center" style={{ height: heightStyle }}>
            <div className="space-y-3 w-full">
              <div className="h-8 bg-[var(--trs-border)] animate-pulse rounded-[6px]" />
              <div className="h-32 bg-[var(--trs-border)] animate-pulse rounded-[6px]" />
              <div className="h-8 bg-[var(--trs-border)] animate-pulse rounded-[6px] w-3/4" />
            </div>
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
 * Visual placeholder for charts during development.
 * Shows chart type and optional message.
 */
export interface ChartPlaceholderProps {
  /** Chart type/name to display */
  type: string;
  /** Height of placeholder */
  height?: string | number;
  /** Optional message or description */
  message?: string;
  /** Show chart icon */
  showIcon?: boolean;
}

export function ChartPlaceholder({
  type,
  height = 300,
  message,
  showIcon = true,
}: ChartPlaceholderProps) {
  const heightStyle = typeof height === 'number' ? `${height}px` : height;

  return (
    <div
      className="flex flex-col items-center justify-center bg-[var(--trs-background)]/50 border-2 border-dashed border-[var(--trs-border)] rounded-[12px]"
      style={{ height: heightStyle }}
    >
      {showIcon && (
        <svg
          className="w-16 h-16 text-[var(--trs-text-muted)] mb-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
          />
        </svg>
      )}
      <div className="text-center">
        <div className="text-[var(--trs-text-muted)] text-lg font-medium mb-2">
          {type}
        </div>
        {message && (
          <div className="text-sm text-[var(--trs-text-muted)] max-w-xs">
            {message}
          </div>
        )}
      </div>
    </div>
  );
}

export default ChartCard;
