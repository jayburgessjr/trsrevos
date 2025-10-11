import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const { accessToken } = await request.json();
  if (!accessToken) {
    return NextResponse.json({ message: 'Missing access token' }, { status: 401 });
  }
  // Import dynamically to avoid bundling on client
  const { listLabels } = await import('@/lib/integrations/google');
  const labels = await listLabels(accessToken);
  return NextResponse.json(labels);
}

export async function GET(request: Request) {
  const accessToken = request.headers.get('Authorization')?.replace('Bearer ', '');
  if (!accessToken) {
    return NextResponse.json({ message: 'Missing access token' }, { status: 401 });
  }
  // Import dynamically to avoid bundling on client
  const { listLabels } = await import('@/lib/integrations/google');
  const labels = await listLabels(accessToken);
  return NextResponse.json(labels);
}
