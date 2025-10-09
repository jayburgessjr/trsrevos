'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function CommandPalette() {
  const r = useRouter()

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        const action = prompt(
          'Actions:\n' +
            '• home | pipeline | pricing | projects | content | finance | partners | clients | flags\n' +
            '• compute-plan | lock-plan | start-focus\n' +
            '• new-task | new-opportunity | create-invoice | share',
        )
        if (!action) return

        // Navigation routes
        const routeMap: Record<string, string> = {
          home: '/',
          pipeline: '/pipeline',
          pricing: '/pricing',
          projects: '/projects',
          content: '/content',
          finance: '/finance',
          partners: '/partners',
          clients: '/clients',
          flags: '/admin/flags',
        }

        if (routeMap[action]) {
          r.push(routeMap[action])
          return
        }

        // Server actions (trigger via form submission in DOM)
        const actionMap: Record<string, string> = {
          'compute-plan': 'computePlan',
          'lock-plan': 'lockPlan',
          'start-focus': 'startFocus',
        }

        if (actionMap[action]) {
          const formId = actionMap[action]
          const form = document.getElementById(formId) as HTMLFormElement
          if (form) {
            form.requestSubmit()
          } else {
            alert(`Action ${action} ready - navigate to Home to execute`)
          }
          return
        }

        // Stub actions
        const stubActions = ['new-task', 'new-opportunity', 'create-invoice', 'share']
        if (stubActions.includes(action)) {
          alert(`${action} - stub action. Wire to ${action} page or modal.`)
          return
        }

        alert('Unknown command')
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [r])

  return null
}
