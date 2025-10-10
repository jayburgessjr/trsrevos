# TRS RevenueOS Page Template

This is the standard template for creating new pages in TRS RevenueOS. Follow this structure to ensure consistency across the application.

## Template Structure

```tsx
"use client"

import { useMemo } from "react"
import { usePathname, useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/ui/card"
import { Badge } from "@/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/ui/table"
import { Button } from "@/ui/button"
import { cn } from "@/lib/utils"
import { TRS_CARD, TRS_SECTION_TITLE, TRS_SUBTITLE } from "@/lib/style"
import { resolveTabs } from "@/lib/tabs"
import { PageTitle, PageDescription } from "@/ui/page-header"

export default function YourPage() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const tabs = useMemo(() => resolveTabs(pathname), [pathname])
  const activeTab = useMemo(() => {
    const current = searchParams.get("tab")
    return current && tabs.includes(current) ? current : tabs[0]
  }, [searchParams, tabs])

  return (
    <div className="mx-auto max-w-7xl space-y-4 px-4 py-4">
      {/* KPI Cards - Always Visible */}
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-4">
        <Card className={cn(TRS_CARD)}>
          <CardContent className="p-4 space-y-2">
            <div className={TRS_SUBTITLE}>Metric Name</div>
            <div className="text-2xl font-semibold text-black dark:text-white">Value</div>
            <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
              <span className="font-medium text-gray-700 dark:text-gray-300">Context</span>
              <span>description</span>
            </div>
          </CardContent>
        </Card>

        {/* Repeat for other KPI cards */}
      </div>

      {/* Tab Content */}
      {activeTab === "Overview" && (
        <div className="space-y-4">
          <div className={cn(TRS_CARD, "p-4 space-y-3")}>
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div className="space-y-1">
                <PageTitle className="text-lg font-semibold text-black dark:text-white">
                  Page Title
                </PageTitle>
                <PageDescription className="text-sm text-gray-500 dark:text-gray-400">
                  Page description explaining what this section does
                </PageDescription>
              </div>
              <Button variant="primary" size="sm">
                Primary Action
              </Button>
            </div>
          </div>

          {/* Content Cards */}
          <Card className={cn(TRS_CARD)}>
            <CardHeader>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <CardTitle className="text-sm font-medium">Section Title</CardTitle>
                  <CardDescription>Section description</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {/* Table or other content */}
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Column 1</TableHead>
                    <TableHead>Column 2</TableHead>
                    <TableHead className="text-right">Column 3</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {/* Table rows */}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Additional tabs */}
    </div>
  )
}
```

## Key Design Principles

### 1. Layout Container
Always use: `<div className="mx-auto max-w-7xl space-y-4 px-4 py-4">`

- `mx-auto max-w-7xl` - Centers content with max width
- `space-y-4` - Consistent 1rem vertical spacing
- `px-4 py-4` - Consistent padding

### 2. KPI Cards (Top Section)
- Grid layout: `grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-4`
- Use `TRS_CARD` for card styling
- Use `TRS_SUBTITLE` for metric labels
- Always include dark mode classes

Structure:
```tsx
<Card className={cn(TRS_CARD)}>
  <CardContent className="p-4 space-y-2">
    <div className={TRS_SUBTITLE}>Metric Name</div>
    <div className="text-2xl font-semibold text-black dark:text-white">$123K</div>
    <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
      <span className="font-medium text-gray-700 dark:text-gray-300">↑ 18%</span>
      <span>vs last month</span>
    </div>
  </CardContent>
</Card>
```

### 3. Tab Navigation
Tabs are automatically resolved from `/lib/tabs.ts`. Use:
```tsx
const tabs = useMemo(() => resolveTabs(pathname), [pathname])
const activeTab = useMemo(() => {
  const current = searchParams.get("tab")
  return current && tabs.includes(current) ? current : tabs[0]
}, [searchParams, tabs])
```

### 4. Content Cards
```tsx
<Card className={cn(TRS_CARD)}>
  <CardHeader>
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div>
        <CardTitle className="text-sm font-medium">Title</CardTitle>
        <CardDescription>Description</CardDescription>
      </div>
      <Button variant="primary" size="sm">Action</Button>
    </div>
  </CardHeader>
  <CardContent>
    {/* Content */}
  </CardContent>
</Card>
```

### 5. Typography
- Section titles: `TRS_SECTION_TITLE`
- Subtitles: `TRS_SUBTITLE`
- Page titles: `<PageTitle className="text-lg font-semibold text-black dark:text-white">`
- Descriptions: `<PageDescription className="text-sm text-gray-500 dark:text-gray-400">`

### 6. Spacing
- Between cards: `gap-3` (0.75rem)
- Card sections: `space-y-4` (1rem)
- Card padding: `p-4` (1rem)

### 7. Dark Mode Support
Always include dark mode variants:
- Text: `text-black dark:text-white`
- Gray text: `text-gray-600 dark:text-gray-400`
- Backgrounds: `bg-white dark:bg-gray-950`
- Borders: `border-gray-200 dark:border-gray-800`

## Adding New Pages to Tabs

1. Add your route to `/lib/tabs.ts`:
```tsx
export const PAGE_TABS: Record<string, string[]> = {
  "/your-page": ["Overview", "Details", "Settings"],
  // ...
}
```

2. Create page at `app/your-page/page.tsx` using the template above

3. Implement each tab section:
```tsx
{activeTab === "Overview" && (
  <div className="space-y-4">
    {/* Content */}
  </div>
)}
```

## Common Patterns

### Stats Grid
```tsx
<div className="mb-4 grid grid-cols-1 gap-3 md:grid-cols-4">
  <div>
    <div className="text-xs text-gray-500 dark:text-gray-400">Label</div>
    <div className="text-lg font-semibold text-black dark:text-white">Value</div>
  </div>
</div>
```

### Table with Actions
```tsx
<Table>
  <TableHeader>
    <TableRow>
      <TableHead>Name</TableHead>
      <TableHead>Status</TableHead>
      <TableHead className="text-right">Amount</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    {data.map((item) => (
      <TableRow key={item.id}>
        <TableCell className="font-medium">{item.name}</TableCell>
        <TableCell>
          <Badge variant={item.status === 'active' ? 'success' : 'outline'}>
            {item.status}
          </Badge>
        </TableCell>
        <TableCell className="text-right font-medium">
          ${item.amount.toLocaleString()}
        </TableCell>
      </TableRow>
    ))}
  </TableBody>
</Table>
```

### Date Formatting
```tsx
{new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
```

### Currency Formatting
```tsx
const formatCurrency = (amount: number) => `$${amount.toLocaleString()}`
```

## Example Pages
- `/app/pipeline/page.tsx` - Full featured example
- `/app/finance/page.tsx` - Finance module example
- `/app/settings/page.tsx` - Settings with theme toggle

## Style Constants
Import from `/lib/style.ts`:
- `TRS_CARD` - Card styling
- `TRS_SECTION_TITLE` - Section headings
- `TRS_SUBTITLE` - Subtitles and labels
