import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const { accessToken } = await request.json();
  if (!accessToken) {
    return NextResponse.json({ message: 'Missing access token' }, { status: 401 });
  }
  // Import dynamically to avoid bundling on client
  const { listEvents } = await import('@/lib/integrations/google');
  const events = await listEvents(accessToken);
  return NextResponse.json(events);
}
