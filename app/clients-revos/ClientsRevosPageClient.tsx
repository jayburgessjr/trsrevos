'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { useRevosData } from '@/app/providers/RevosDataProvider'
import { Badge } from '@/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/ui/table'
import { ArrowUpDown, Building2, DollarSign, FileText, TrendingUp, Trash2 } from 'lucide-react'
import { Input } from '@/ui/input'
import AddClientDialog from '@/components/clients/AddClientDialog'
import DeleteConfirmationModal from '@/components/common/DeleteConfirmationModal'
import type { Project } from '@/lib/revos/types'

type ClientData = {
  name: string
  projects: Project[]
  totalRevenue: number
  monthlyRevenue: number
  documentsCount: number
  activeProjects: number
  totalProjects: number
}

type SortField =
  | 'name'
  | 'projects'
  | 'activeProjects'
  | 'documents'
  | 'annualRevenue'
  | 'monthlyRevenue'
type SortDirection = 'asc' | 'desc'

export default function ClientsRevosPageClient() {
  const { projects, documents, content, resources, deleteClient } = useRevosData()
  const [searchQuery, setSearchQuery] = useState('')
  const [clientToDelete, setClientToDelete] = useState<string | null>(null)
  const [sortField, setSortField] = useState<SortField>('name')
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc')

  // Aggregate data by client
  const clientsData = useMemo<ClientData[]>(() => {
    const clientMap = new Map<string, ClientData>()

    projects.forEach((project) => {
      const clientName = project.client || 'Unassigned'

      if (!clientMap.has(clientName)) {
        clientMap.set(clientName, {
          name: clientName,
          projects: [],
          totalRevenue: 0,
          monthlyRevenue: 0,
          documentsCount: 0,
          activeProjects: 0,
          totalProjects: 0,
        })
      }

      const clientData = clientMap.get(clientName)!
      clientData.projects.push(project)
      clientData.totalRevenue += project.revenueTarget || 0
      clientData.totalProjects += 1
      if (project.status === 'Active') {
        clientData.activeProjects += 1
      }

      // Count documents linked to this client's projects
      const projectDocs = documents.filter(doc => doc.projectId === project.id)
      clientData.documentsCount += projectDocs.length
    })

    // Calculate monthly revenue (annual / 12)
    clientMap.forEach((client) => {
      client.monthlyRevenue = Math.round(client.totalRevenue / 12)
    })

    return Array.from(clientMap.values()).sort((a, b) => b.totalRevenue - a.totalRevenue)
  }, [projects, documents])

  // Filter clients based on search
  const filteredClients = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()

    const results = clientsData.filter(client => {
      if (!query) return true
      return client.name.toLowerCase().includes(query)
    })

    const sorted = [...results]

    sorted.sort((a, b) => {
      let aValue: string | number
      let bValue: string | number

      switch (sortField) {
        case 'name':
          aValue = a.name.toLowerCase()
          bValue = b.name.toLowerCase()
          break
        case 'projects':
          aValue = a.totalProjects
          bValue = b.totalProjects
          break
        case 'activeProjects':
          aValue = a.activeProjects
          bValue = b.activeProjects
          break
        case 'documents':
          aValue = a.documentsCount
          bValue = b.documentsCount
          break
        case 'annualRevenue':
          aValue = a.totalRevenue
          bValue = b.totalRevenue
          break
        case 'monthlyRevenue':
          aValue = a.monthlyRevenue
          bValue = b.monthlyRevenue
          break
        default:
          return 0
      }

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1
      return 0
    })

    return sorted
  }, [clientsData, searchQuery, sortField, sortDirection])

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(prev => (prev === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  // Calculate totals
  const totals = useMemo(() => {
    return {
      totalAnnualRevenue: clientsData.reduce((sum, client) => sum + client.totalRevenue, 0),
      totalMonthlyRevenue: clientsData.reduce((sum, client) => sum + client.monthlyRevenue, 0),
      totalDocuments: clientsData.reduce((sum, client) => sum + client.documentsCount, 0),
      totalActiveProjects: clientsData.reduce((sum, client) => sum + client.activeProjects, 0),
    }
  }, [clientsData])

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Clients</h1>
          <p className="text-muted-foreground mt-1">Track revenue, projects, and deliverables by client</p>
        </div>
        <AddClientDialog />
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Clients</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{clientsData.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {totals.totalActiveProjects} active projects
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Annual Revenue</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totals.totalAnnualRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Across all clients
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totals.totalMonthlyRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Average MRR
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Documents</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totals.totalDocuments}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Deliverables created
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="flex items-center gap-4">
        <Input
          type="text"
          placeholder="Search clients..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-sm"
        />
      </div>

      {/* Clients Table */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-semibold">Client Portfolio</CardTitle>
          <CardDescription>Revenue and project breakdown by client</CardDescription>
        </CardHeader>
        <CardContent className="px-0">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="px-6">
                  <button
                    onClick={() => toggleSort('name')}
                    className="flex items-center gap-1 hover:text-foreground"
                  >
                    Client Name
                    <ArrowUpDown className="h-3 w-3" />
                  </button>
                </TableHead>
                <TableHead>
                  <button
                    onClick={() => toggleSort('projects')}
                    className="flex items-center gap-1 hover:text-foreground"
                  >
                    Projects
                    <ArrowUpDown className="h-3 w-3" />
                  </button>
                </TableHead>
                <TableHead>
                  <button
                    onClick={() => toggleSort('activeProjects')}
                    className="flex items-center gap-1 hover:text-foreground"
                  >
                    Active
                    <ArrowUpDown className="h-3 w-3" />
                  </button>
                </TableHead>
                <TableHead>
                  <button
                    onClick={() => toggleSort('documents')}
                    className="flex items-center gap-1 hover:text-foreground"
                  >
                    Documents
                    <ArrowUpDown className="h-3 w-3" />
                  </button>
                </TableHead>
                <TableHead>
                  <button
                    onClick={() => toggleSort('annualRevenue')}
                    className="flex items-center gap-1 hover:text-foreground"
                  >
                    Annual Revenue
                    <ArrowUpDown className="h-3 w-3" />
                  </button>
                </TableHead>
                <TableHead>
                  <button
                    onClick={() => toggleSort('monthlyRevenue')}
                    className="flex items-center gap-1 hover:text-foreground"
                  >
                    Monthly Revenue
                    <ArrowUpDown className="h-3 w-3" />
                  </button>
                </TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredClients.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="px-6 py-10 text-center text-sm text-muted-foreground">
                    {searchQuery ? `No clients found matching "${searchQuery}"` : 'No clients yet. Create a project to get started.'}
                  </TableCell>
                </TableRow>
              ) : (
                filteredClients.map((client) => (
                  <TableRow key={client.name}>
                    <TableCell className="px-6">
                      <Link href={`/clients-revos/${encodeURIComponent(client.name)}`} className="hover:underline">
                        <div className="font-medium text-foreground">{client.name}</div>
                      </Link>
                      <div className="text-xs text-muted-foreground mt-1">
                        {client.projects.map(p => p.type).filter((v, i, a) => a.indexOf(v) === i).join(', ')}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{client.totalProjects}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="default" className="bg-emerald-500 hover:bg-emerald-600">
                        {client.activeProjects}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Link href="/documents" className="text-emerald-600 hover:underline">
                        {client.documentsCount} docs
                      </Link>
                    </TableCell>
                    <TableCell className="font-semibold">
                      ${client.totalRevenue.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      ${client.monthlyRevenue.toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <button
                        onClick={() => setClientToDelete(client.name)}
                        className="text-xs text-red-600 underline hover:text-red-700 transition-colors flex items-center gap-1"
                      >
                        <Trash2 className="h-3 w-3" />
                        Delete
                      </button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {clientToDelete && (
        <DeleteConfirmationModal
          isOpen={!!clientToDelete}
          onClose={() => setClientToDelete(null)}
          onConfirm={() => deleteClient(clientToDelete)}
          itemName={clientToDelete}
          itemType="client"
        />
      )}
    </div>
  )
}
