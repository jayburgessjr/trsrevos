'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/ui/dialog'
import { Button } from '@/ui/button'
import { Input } from '@/ui/input'
import { Label } from '@/ui/label'
import { Textarea } from '@/ui/textarea'
import { Select } from '@/ui/select'
import { Plus, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import type { ProjectType } from '@/lib/revos/types'

export default function AddClientDialog() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  // Client and Project Information
  const [clientName, setClientName] = useState('')
  const [contactName, setContactName] = useState('')
  const [contactEmail, setContactEmail] = useState('')
  const [contactPhone, setContactPhone] = useState('')
  const [companyWebsite, setCompanyWebsite] = useState('')
  const [industry, setIndustry] = useState('')
  const [notes, setNotes] = useState('')

  // Initial Project Information
  const [projectName, setProjectName] = useState('')
  const [projectType, setProjectType] = useState<ProjectType>('Audit')
  const [revenueTarget, setRevenueTarget] = useState('')
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0])
  const [teamMembers, setTeamMembers] = useState('')

  const resetForm = () => {
    setClientName('')
    setContactName('')
    setContactEmail('')
    setContactPhone('')
    setCompanyWebsite('')
    setIndustry('')
    setNotes('')
    setProjectName('')
    setProjectType('Audit')
    setRevenueTarget('')
    setStartDate(new Date().toISOString().split('T')[0])
    setTeamMembers('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!clientName.trim()) {
      alert('Please enter a client name')
      return
    }

    if (!projectName.trim()) {
      alert('Please enter an initial project name')
      return
    }

    setLoading(true)

    try {
      const supabase = createClient()

      // Create the initial project
      const projectId = `project-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

      const { error: projectError } = await supabase
        .from('revos_projects')
        .insert({
          id: projectId,
          name: projectName,
          client: clientName,
          type: projectType,
          team: teamMembers.split(',').map(t => t.trim()).filter(Boolean),
          start_date: startDate,
          status: 'Active',
          revenue_target: parseFloat(revenueTarget) || 0,
          documents: [],
          agents: [],
          resources: []
        })

      if (projectError) {
        console.error('Error creating project:', projectError)
        alert('Failed to create project. Please try again.')
        return
      }

      // Create client note if provided
      if (notes.trim()) {
        await supabase
          .from('client_notes')
          .insert({
            id: `note-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            client_name: clientName,
            title: 'Client Onboarding Information',
            content: `Contact: ${contactName}
Email: ${contactEmail}
Phone: ${contactPhone}
Website: ${companyWebsite}
Industry: ${industry}

Notes:
${notes}`,
          })
      }

      // Success! Show success message, reset form, and navigate
      alert(`Client "${clientName}" created successfully! Redirecting to client page...`)
      resetForm()
      setOpen(false)

      // Force refresh and navigate
      router.refresh()

      // Small delay to allow router refresh to complete
      setTimeout(() => {
        router.push(`/clients-revos/${encodeURIComponent(clientName)}`)
      }, 500)
    } catch (error) {
      console.error('Error creating client:', error)
      alert('Failed to create client. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger>
        <Button className="bg-[#015e32] hover:bg-[#01753d]">
          <Plus className="h-4 w-4 mr-2" />
          Add Client
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Add New Client</DialogTitle>
            <DialogDescription>
              Enter client and initial project information to get started
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Client Information */}
            <div className="space-y-4">
              <h3 className="font-semibold text-sm text-foreground border-b pb-2">
                Client Information
              </h3>

              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="clientName">
                    Client Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="clientName"
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    placeholder="e.g., Acme Corporation"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="contactName">Primary Contact</Label>
                    <Input
                      id="contactName"
                      value={contactName}
                      onChange={(e) => setContactName(e.target.value)}
                      placeholder="John Doe"
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="contactEmail">Contact Email</Label>
                    <Input
                      id="contactEmail"
                      type="email"
                      value={contactEmail}
                      onChange={(e) => setContactEmail(e.target.value)}
                      placeholder="john@example.com"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="contactPhone">Contact Phone</Label>
                    <Input
                      id="contactPhone"
                      type="tel"
                      value={contactPhone}
                      onChange={(e) => setContactPhone(e.target.value)}
                      placeholder="(555) 123-4567"
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="companyWebsite">Company Website</Label>
                    <Input
                      id="companyWebsite"
                      type="url"
                      value={companyWebsite}
                      onChange={(e) => setCompanyWebsite(e.target.value)}
                      placeholder="https://example.com"
                    />
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="industry">Industry</Label>
                  <Input
                    id="industry"
                    value={industry}
                    onChange={(e) => setIndustry(e.target.value)}
                    placeholder="e.g., Technology, Healthcare, Finance"
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="notes">Initial Notes</Label>
                  <Textarea
                    id="notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Any important notes about this client..."
                    rows={3}
                  />
                </div>
              </div>
            </div>

            {/* Initial Project Information */}
            <div className="space-y-4">
              <h3 className="font-semibold text-sm text-foreground border-b pb-2">
                Initial Project
              </h3>

              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="projectName">
                    Project Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="projectName"
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                    placeholder="e.g., Revenue Operations Audit"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="projectType">Project Type</Label>
                    <Select
                      id="projectType"
                      value={projectType}
                      onChange={(e) => setProjectType(e.target.value as ProjectType)}
                    >
                      <option value="Audit">Audit</option>
                      <option value="Blueprint">Blueprint</option>
                      <option value="Advisory">Advisory</option>
                      <option value="Internal">Internal</option>
                    </Select>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="revenueTarget">Annual Revenue Target ($)</Label>
                    <Input
                      id="revenueTarget"
                      type="number"
                      value={revenueTarget}
                      onChange={(e) => setRevenueTarget(e.target.value)}
                      placeholder="50000"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="startDate">Start Date</Label>
                    <Input
                      id="startDate"
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="teamMembers">Team Members</Label>
                    <Input
                      id="teamMembers"
                      value={teamMembers}
                      onChange={(e) => setTeamMembers(e.target.value)}
                      placeholder="Jay, Sarah, Mike (comma-separated)"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                resetForm()
                setOpen(false)
              }}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-[#015e32] hover:bg-[#01753d]"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Client'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
