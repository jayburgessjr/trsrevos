export type Session = {
  user: {
    id: string
    name: string
    role: 'admin' | 'revops' | 'finance' | 'partner'
  }
}

export async function getSession(): Promise<Session> {
  return {
    user: {
      id: 'revops-lead',
      name: 'Morgan Singh',
      role: 'revops',
    },
  }
}
