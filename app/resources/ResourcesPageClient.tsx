'use client'

import { useMemo, useState } from 'react'

import { useRevosData } from '@/app/providers/RevosDataProvider'
import { Badge } from '@/ui/badge'
import { Button } from '@/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/ui/card'
import { Input } from '@/ui/input'
import { Select } from '@/ui/select'
import { Textarea } from '@/ui/textarea'

const resourceTypes = ['File', 'Link'] as const

type FormState = {
  name: string
  type: (typeof resourceTypes)[number]
  description: string
  link: string
  tags: string
  relatedProjectIds: string[]
}

const initialForm: FormState = {
  name: '',
  type: 'File',
  description: '',
  link: '',
  tags: '',
  relatedProjectIds: [],
}

export default function ResourcesPageClient() {
  const { resources, projects, createResource } = useRevosData()
  const [form, setForm] = useState<FormState>(initialForm)
  const [filterType, setFilterType] = useState<string>('All')

  const filteredResources = useMemo(() => {
    if (filterType === 'All') return resources
    return resources.filter((resource) => resource.type === filterType)
  }, [resources, filterType])

  const tagCounts = useMemo(() => {
    return resources.reduce<Record<string, number>>((acc, resource) => {
      resource.tags.forEach((tag) => {
        acc[tag] = (acc[tag] ?? 0) + 1
      })
      return acc
    }, {})
  }, [resources])

  const toggleProject = (projectId: string) => {
    setForm((current) => {
      const exists = current.relatedProjectIds.includes(projectId)
      return {
        ...current,
        relatedProjectIds: exists
          ? current.relatedProjectIds.filter((id) => id !== projectId)
          : [...current.relatedProjectIds, projectId],
      }
    })
  }

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!form.name.trim()) return
    createResource({
      name: form.name.trim(),
      description: form.description.trim(),
      type: form.type,
      link: form.link.trim(),
      tags: form.tags
        .split(',')
        .map((tag) => tag.trim())
        .filter(Boolean),
      relatedProjectIds: form.relatedProjectIds,
    })
    setForm(initialForm)
  }

  return (
    <div className="space-y-8">
      <section className="grid gap-4 lg:grid-cols-3">
        <Card className="border-slate-200 lg:col-span-2">
          <CardHeader className="border-b border-slate-200/60 pb-4">
            <CardTitle className="text-lg font-semibold">Add Resource</CardTitle>
            <CardDescription>Capture frameworks, calculators, and training assets.</CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            <form className="grid grid-cols-1 gap-4 md:grid-cols-2" onSubmit={handleSubmit}>
              <div className="space-y-2 md:col-span-2">
                <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Name</label>
                <Input
                  value={form.name}
                  onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
                  placeholder="Gap Map Template"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Type</label>
                <Select
                  value={form.type}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, type: event.target.value as FormState['type'] }))
                  }
                >
                  {resourceTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Link</label>
                <Input
                  value={form.link}
                  onChange={(event) => setForm((current) => ({ ...current, link: event.target.value }))}
                  placeholder="https://storage.trs.dev/..."
                  required
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Description</label>
                <Textarea
                  value={form.description}
                  onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
                  placeholder="Explain how this resource is used during delivery"
                  rows={4}
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Tags</label>
                <Input
                  value={form.tags}
                  onChange={(event) => setForm((current) => ({ ...current, tags: event.target.value }))}
                  placeholder="Comma separated"
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Related Projects</p>
                <div className="flex flex-wrap gap-3">
                  {projects.map((project) => {
                    const checked = form.relatedProjectIds.includes(project.id)
                    return (
                      <label
                        key={project.id}
                        className="flex items-center gap-2 rounded-lg border border-slate-200/80 bg-white px-3 py-2 text-xs text-slate-600 shadow-sm"
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggleProject(project.id)}
                          className="h-3 w-3"
                        />
                        {project.name}
                      </label>
                    )
                  })}
                  {projects.length === 0 && <span className="text-xs text-slate-500">No projects yet.</span>}
                </div>
              </div>
              <div className="md:col-span-2">
                <Button type="submit" className="w-full md:w-auto">
                  Save Resource
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
        <Card className="border-slate-200">
          <CardHeader className="border-b border-slate-200/60 pb-4">
            <CardTitle className="text-lg font-semibold">Filters</CardTitle>
            <CardDescription>Browse by delivery usage.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 pt-4 text-sm text-slate-600">
            <Select value={filterType} onChange={(event) => setFilterType(event.target.value)}>
              <option value="All">All Resources</option>
              {resourceTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </Select>
            <div className="rounded-lg border border-slate-200/80 bg-white p-3 shadow-sm">
              <p className="text-xs uppercase tracking-widest text-slate-500">Total Resources</p>
              <p className="mt-1 text-2xl font-semibold text-slate-900">{resources.length}</p>
            </div>
            <div className="space-y-2">
              {Object.entries(tagCounts).map(([tag, count]) => (
                <div key={tag} className="flex items-center justify-between rounded-lg border border-slate-200/80 bg-white p-3 shadow-sm">
                  <span className="text-sm text-slate-600">#{tag}</span>
                  <Badge variant="outline" className="border-slate-300 text-slate-600">
                    {count}
                  </Badge>
                </div>
              ))}
              {Object.keys(tagCounts).length === 0 && <p className="text-xs text-slate-500">No tags recorded.</p>}
            </div>
          </CardContent>
        </Card>
      </section>

      <Card className="border-slate-200">
        <CardHeader className="border-b border-slate-200/60 pb-4">
          <CardTitle className="text-lg font-semibold">Resource Catalog</CardTitle>
          <CardDescription>Knowledge base powering every project.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filteredResources.length === 0 ? (
            <p className="text-sm text-slate-500">No resources found for this filter.</p>
          ) : (
            filteredResources.map((resource) => (
              <div key={resource.id} className="flex flex-col rounded-lg border border-slate-200/80 bg-white p-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-slate-900">{resource.name}</p>
                  <Badge variant="outline" className="border-slate-300 text-slate-600">
                    {resource.type}
                  </Badge>
                </div>
                <p className="mt-2 text-sm text-slate-600">{resource.description}</p>
                <a href={resource.link} className="mt-3 text-sm text-emerald-600 underline">
                  Open resource
                </a>
                <div className="mt-3 flex flex-wrap gap-1 text-xs">
                  {resource.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="bg-slate-100 text-slate-700">
                      {tag}
                    </Badge>
                  ))}
                </div>
                <div className="mt-3 text-xs text-slate-500">
                  Linked Projects: {resource.relatedProjectIds.length}
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  )
}
