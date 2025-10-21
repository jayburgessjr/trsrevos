'use client';

import React, { ReactNode, useState } from 'react';
import { Sidebar, SidebarProps, defaultNavItems } from '../components/Sidebar';

/**
 * TRS Layout Props
 */
export interface TRSLayoutProps {
  /** Main content to render */
  children: ReactNode;
  /** Navigation items for sidebar */
  navItems?: SidebarProps['items'];
  /** Logo or branding component */
  logo?: ReactNode;
  /** Header content (breadcrumbs, page title, etc.) */
  header?: ReactNode;
  /** Sidebar footer content */
  sidebarFooter?: ReactNode;
  /** Whether sidebar starts collapsed */
  defaultCollapsed?: boolean;
  /** Custom className for main content area */
  className?: string;
  /** Hide sidebar completely */
  hideSidebar?: boolean;
}

/**
 * TRS Layout Component
 *
 * Base layout structure for TRS applications.
 * Provides consistent sidebar navigation and content area.
 *
 * @example
 * ```tsx
 * <TRSLayout
 *   header={<h1>Dashboard</h1>}
 *   navItems={customNavItems}
 * >
 *   <YourPageContent />
 * </TRSLayout>
 * ```
 */
export function TRSLayout({
  children,
  navItems = defaultNavItems,
  logo,
  header,
  sidebarFooter,
  defaultCollapsed = false,
  className = '',
  hideSidebar = false,
}: TRSLayoutProps) {
  const [collapsed, setCollapsed] = useState(defaultCollapsed);

  return (
    <div className="min-h-screen bg-trs-background">
      {/* Sidebar */}
      {!hideSidebar && (
        <Sidebar
          items={navItems}
          logo={logo}
          footer={sidebarFooter}
          collapsed={collapsed}
        />
      )}

      {/* Main Content Area */}
      <main
        className={`
          transition-all duration-base ease-smooth
          min-h-screen
          ${hideSidebar ? 'ml-0' : collapsed ? 'ml-sidebar-collapsed' : 'ml-sidebar'}
        `}
        style={{
          marginLeft: hideSidebar ? 0 : collapsed ? '80px' : '250px',
        }}
      >
        {/* Header */}
        {header && (
          <header className="sticky top-0 z-sticky bg-trs-background/95 backdrop-blur-sm border-b border-trs-border">
            <div className="px-8 py-4">
              {header}
            </div>
          </header>
        )}

        {/* Content */}
        <div className={`p-8 ${className}`}>
          {children}
        </div>
      </main>
    </div>
  );
}

/**
 * TRS Page Header Component
 *
 * Standardized header with breadcrumb and actions.
 */
export interface PageHeaderProps {
  /** Page title */
  title: string;
  /** Breadcrumb path (e.g., ["Execution Layer", "TRS-RevOS"]) */
  breadcrumb?: string[];
  /** Action buttons or controls */
  actions?: ReactNode;
  /** Subtitle or description */
  subtitle?: string;
}

export function PageHeader({
  title,
  breadcrumb,
  actions,
  subtitle,
}: PageHeaderProps) {
  return (
    <div className="flex items-start justify-between">
      <div>
        {/* Breadcrumb */}
        {breadcrumb && breadcrumb.length > 0 && (
          <nav className="flex items-center gap-2 text-sm text-trs-text-muted mb-2">
            {breadcrumb.map((crumb, index) => (
              <React.Fragment key={index}>
                {index > 0 && <span>/</span>}
                <span>{crumb}</span>
              </React.Fragment>
            ))}
          </nav>
        )}

        {/* Title */}
        <h1 className="text-3xl font-bold text-trs-text-primary mb-1">
          {title}
        </h1>

        {/* Subtitle */}
        {subtitle && (
          <p className="text-trs-text-muted">
            {subtitle}
          </p>
        )}
      </div>

      {/* Actions */}
      {actions && (
        <div className="flex items-center gap-3">
          {actions}
        </div>
      )}
    </div>
  );
}

export default TRSLayout;
