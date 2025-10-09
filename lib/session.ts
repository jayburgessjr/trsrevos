export type Session = {
  user: {
    id: string
    name: string
    role: 'SuperAdmin' | 'Admin' | 'Director' | 'Member' | 'Client'
  }
}

export async function getSession(): Promise<Session> {
  return {
    user: {
      id: 'revops-lead',
      name: 'Morgan Singh',
      role: 'Admin',
    },
  }
}
