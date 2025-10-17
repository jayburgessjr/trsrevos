import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Client Intake Form | The Revenue Scientists',
  description: 'Complete your intake form to get started with The Revenue Scientists',
}

export default function FormLayout({ children }: { children: React.ReactNode }) {
  // No header, no navigation - just the form
  return children
}
