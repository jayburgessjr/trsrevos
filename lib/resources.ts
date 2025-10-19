import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'

const resourcesDirectory = path.join(process.cwd(), 'content/resources')

export type ResourceMetadata = {
  title: string
  category: string
  tags: string[]
  lastUpdated: string
  author: string
}

export type Resource = {
  slug: string
  category: string
  metadata: ResourceMetadata
  content: string
}

export function getAllResources(): Resource[] {
  const categories = fs.readdirSync(resourcesDirectory)
  const resources: Resource[] = []

  categories.forEach((category) => {
    const categoryPath = path.join(resourcesDirectory, category)
    if (!fs.statSync(categoryPath).isDirectory()) return

    const files = fs.readdirSync(categoryPath).filter((file) => file.endsWith('.md'))

    files.forEach((file) => {
      const slug = file.replace(/\.md$/, '')
      const fullPath = path.join(categoryPath, file)
      const fileContents = fs.readFileSync(fullPath, 'utf8')
      const { data, content } = matter(fileContents)

      resources.push({
        slug: `${category}/${slug}`,
        category,
        metadata: data as ResourceMetadata,
        content,
      })
    })
  })

  return resources.sort((a, b) => {
    // Sort by category, then by title
    if (a.category !== b.category) {
      return a.category.localeCompare(b.category)
    }
    return a.metadata.title.localeCompare(b.metadata.title)
  })
}

export function getResourceBySlug(slug: string): Resource | null {
  const resources = getAllResources()
  return resources.find((r) => r.slug === slug) || null
}

export function getResourcesByCategory(category: string): Resource[] {
  const resources = getAllResources()
  return resources.filter((r) => r.category === category)
}

export function getAllCategories(): string[] {
  const resources = getAllResources()
  const categories = new Set(resources.map((r) => r.category))
  return Array.from(categories).sort()
}

export function getAllTags(): string[] {
  const resources = getAllResources()
  const tags = new Set(resources.flatMap((r) => r.metadata.tags))
  return Array.from(tags).sort()
}
