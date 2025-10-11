import type { ComponentProps, ReactNode } from "react"

import { Badge } from "@/ui/badge"
import { PageDescription, PageTitle } from "@/ui/page-header"
import { cn } from "@/lib/utils"

export type PageTemplateBadge = {
  label: string
  variant?: ComponentProps<typeof Badge>["variant"]
}

export type PageTemplateProps = {
  title: string
  description: string
  actions?: ReactNode
  badges?: PageTemplateBadge[]
  toolbar?: ReactNode
  toolbarClassName?: string
  stats?: ReactNode
  statsWrapperClassName?: string
  containerClassName?: string
  headerClassName?: string
  contentClassName?: string
  children: ReactNode
}

export function PageTemplate({
  title,
  description,
  actions,
  badges,
  toolbar,
  toolbarClassName,
  stats,
  statsWrapperClassName,
  containerClassName,
  headerClassName,
  contentClassName,
  children,
}: PageTemplateProps) {
  return (
    <div className={cn("mx-auto max-w-7xl space-y-4 px-4 py-4", containerClassName)}>
      <section className={cn("space-y-4", headerClassName)}>
        <div className="space-y-3">
          <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
            <div className="space-y-1">
              <PageTitle className="text-xl font-semibold text-black">{title}</PageTitle>
              <PageDescription className="text-sm text-gray-500">{description}</PageDescription>
            </div>
            {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
          </div>

          {badges?.length ? (
            <div className="flex flex-wrap items-center gap-2 text-xs text-gray-600 md:text-sm">
              {badges.map((badge) => (
                <Badge key={badge.label} variant={badge.variant ?? "outline"}>
                  {badge.label}
                </Badge>
              ))}
            </div>
          ) : null}

          {toolbar ? (
            <div className={cn(toolbarClassName ?? "flex flex-wrap items-center gap-2")}>{toolbar}</div>
          ) : null}
        </div>

        {stats ? (
          <div className={cn("space-y-3", statsWrapperClassName)}>{stats}</div>
        ) : null}
      </section>

      <div className={cn("space-y-4", contentClassName)}>{children}</div>
    </div>
  )
}
