# TRS Resources - Markdown Knowledge Base

This folder contains all TRS framework documentation, playbooks, and delivery resources displayed in the RevOS Knowledge Base.

## How to Add a New Resource

1. **Choose a category folder** (or create a new one):
   - `revenue-modeling/` - Pricing, LTV, unit economics
   - `client-onboarding/` - Intake, discovery, kickoff
   - `delivery-frameworks/` - Gap maps, blueprints, methodologies

2. **Create a markdown file** with frontmatter:
```markdown
---
title: "Your Resource Title"
category: "Category Name"
tags: ["tag1", "tag2", "tag3"]
lastUpdated: "2025-01-19"
author: "TRS Team"
---

# Your Content Here

Write your content using standard markdown...
```

3. **Save the file** with a descriptive slug:
   - `pricing-strategies.md`
   - `intake-process.md`
   - `gap-map-framework.md`

4. **Your resource will automatically appear** on the Resources page with:
   - Full markdown formatting
   - Code syntax highlighting
   - Tables, lists, checkboxes
   - TRS branding and styling

## Markdown Features Supported

- **Headers**: `# H1`, `## H2`, `### H3`, etc.
- **Bold/Italic**: `**bold**`, `*italic*`
- **Lists**: Ordered and unordered
- **Checkboxes**: `- [ ] Task` and `- [x] Done`
- **Code blocks**: ` ```language ` with syntax highlighting
- **Tables**: GitHub Flavored Markdown tables
- **Links**: `[text](url)`
- **Blockquotes**: `> quote`
- **Horizontal rules**: `---`

## Frontmatter Fields

- **title** (required): Display title of the resource
- **category** (required): Folder name (e.g., "revenue-modeling")
- **tags** (required): Array of searchable tags
- **lastUpdated** (required): Date in YYYY-MM-DD format
- **author** (required): Author name or "TRS Team"

## Example Frontmatter

```yaml
---
title: "Pricing Strategies & Optimization"
category: "Revenue Modeling"
tags: ["pricing", "strategy", "optimization", "revenue"]
lastUpdated: "2025-01-19"
author: "TRS Team"
---
```

## File Organization

```
content/resources/
├── README.md
├── revenue-modeling/
│   ├── pricing-strategies.md
│   ├── ltv-calculations.md
│   └── unit-economics.md
├── client-onboarding/
│   ├── intake-process.md
│   ├── discovery-framework.md
│   └── kickoff-checklist.md
└── delivery-frameworks/
    ├── gap-map-framework.md
    ├── intervention-playbook.md
    └── roi-tracking.md
```

## Tips

- **Be specific**: Clear, actionable content
- **Use examples**: Real-world scenarios and numbers
- **Add checklists**: Helps with execution
- **Include templates**: Link to tools and calculators
- **Keep it current**: Update the lastUpdated field

## Questions?

Reach out to the TRS team or add an issue in GitHub.
