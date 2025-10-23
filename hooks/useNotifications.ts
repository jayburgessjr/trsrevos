'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export interface NotificationCounts {
  newClients: number
  newProjects: number
  newDocuments: number
  total: number
}

const HOURS_THRESHOLD = 48 // Consider items new if created in last 48 hours

export function useNotifications() {
  const [counts, setCounts] = useState<NotificationCounts>({
    newClients: 0,
    newProjects: 0,
    newDocuments: 0,
    total: 0,
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const supabase = createClient()
        const cutoffDate = new Date()
        cutoffDate.setHours(cutoffDate.getHours() - HOURS_THRESHOLD)
        const cutoffIso = cutoffDate.toISOString()

        // Fetch counts in parallel
        const [clientsResult, projectsResult, documentsResult] = await Promise.all([
          // New clients
          supabase
            .from('clients')
            .select('id', { count: 'exact', head: true })
            .gte('created_at', cutoffIso),

          // New projects
          supabase
            .from('revos_projects')
            .select('id', { count: 'exact', head: true })
            .gte('created_at', cutoffIso),

          // New documents
          supabase
            .from('revos_documents')
            .select('id', { count: 'exact', head: true })
            .gte('created_at', cutoffIso),
        ])

        const newClients = clientsResult.count ?? 0
        const newProjects = projectsResult.count ?? 0
        const newDocuments = documentsResult.count ?? 0

        setCounts({
          newClients,
          newProjects,
          newDocuments,
          total: newClients + newProjects + newDocuments,
        })
      } catch (error) {
        console.error('Error fetching notifications:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchNotifications()

    // Refresh notifications every 5 minutes
    const interval = setInterval(fetchNotifications, 5 * 60 * 1000)

    return () => clearInterval(interval)
  }, [])

  return { counts, isLoading }
}
