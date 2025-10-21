'use client';

import React, { ReactNode } from 'react';

/**
 * Metric Card Props
 */
export interface MetricCardProps {
  /** Metric label/title */
  label: string;
  /** Primary value to display */
  value: string | number;
  /** Optional delta/change indicator (e.g., "+12%", "-3.2%") */
  delta?: string;
  /** Delta trend: positive, negative, or neutral */
  deltaType?: 'positive' | 'negative' | 'neutral';
  /** Optional icon */
  icon?: ReactNode;
  /** Optional subtitle or description */
  subtitle?: string;
  /** Custom action or link */
  action?: ReactNode;
  /** Loading state */
  loading?: boolean;
  /** Custom className */
  className?: string;
  /** Click handler */
  onClick?: () => void;
  /** Format for the value (e.g., currency, percentage) */
  valuePrefix?: string;
  valueSuffix?: string;
}

/**
 * TRS Metric Card Component
 *
 * Displays a single KPI with optional delta indicator.
 * Matches the TRS design system card style.
 *
 * @example
 * ```tsx
 * <MetricCard
 *   label="Annual Revenue"
 *   value="$40,024"
 *   delta="+12%"
 *   deltaType="positive"
 * />
 * ```
 */
export function MetricCard({
  label,
  value,
  delta,
  deltaType = 'neutral',
  icon,
  subtitle,
  action,
  loading = false,
  className = '',
  onClick,
  valuePrefix,
  valueSuffix,
}: MetricCardProps) {
  const isClickable = !!onClick;

  // Determine delta color based on type
  const deltaColorClass = {
    positive: 'text-trs-success',
    negative: 'text-trs-error',
    neutral: 'text-trs-text-muted',
  }[deltaType];

  return (
    <div
      onClick={onClick}
      className={`
        bg-trs-surface
        border border-trs-border
        rounded-trs-base
        p-5
        shadow-trs-card
        transition-all duration-fast
        ${isClickable ? 'cursor-pointer hover:bg-trs-surface-hover hover:shadow-trs-lg' : ''}
        ${className}
      `}
    >
      {/* Header: Label + Icon */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="text-sm font-medium text-trs-text-muted uppercase tracking-wide">
            {label}
          </h3>
          {subtitle && (
            <p className="text-xs text-trs-text-muted mt-1">
              {subtitle}
            </p>
          )}
        </div>
        {icon && (
          <div className="ml-3 text-trs-text-muted">
            {icon}
          </div>
        )}
      </div>

      {/* Value */}
      <div className="mb-2">
        {loading ? (
          <div className="h-10 bg-trs-border animate-pulse rounded-trs-sm" />
        ) : (
          <div className="text-3xl font-bold text-trs-text-primary flex items-baseline gap-1">
            {valuePrefix && (
              <span className="text-2xl text-trs-text-secondary">
                {valuePrefix}
              </span>
            )}
            <span>{value}</span>
            {valueSuffix && (
              <span className="text-xl text-trs-text-secondary">
                {valueSuffix}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Delta / Actions */}
      <div className="flex items-center justify-between">
        {delta && (
          <div className={`text-sm font-semibold ${deltaColorClass} flex items-center gap-1`}>
            {deltaType === 'positive' && '↑'}
            {deltaType === 'negative' && '↓'}
            <span>{delta}</span>
          </div>
        )}

        {action && (
          <div className="ml-auto">
            {action}
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Metric Card Grid
 *
 * Responsive grid container for multiple metric cards.
 */
export interface MetricCardGridProps {
  children: ReactNode;
  /** Number of columns (responsive) */
  columns?: 1 | 2 | 3 | 4 | 6;
  /** Gap between cards */
  gap?: 'sm' | 'base' | 'lg';
  /** Custom className */
  className?: string;
}

export function MetricCardGrid({
  children,
  columns = 3,
  gap = 'base',
  className = '',
}: MetricCardGridProps) {
  const gridColsClass = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
    6: 'grid-cols-1 md:grid-cols-3 lg:grid-cols-6',
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

export default MetricCard;
