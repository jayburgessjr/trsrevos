import { NextResponse } from 'next/server';
import { listLabels } from '@/lib/integrations/google';

export async function GET(request: Request) {
  const accessToken = request.headers.get('Authorization')?.replace('Bearer ', '');
  if (!accessToken) {
    return NextResponse.json({ message: 'Missing access token' }, { status: 401 });
  }
  const labels = await listLabels(accessToken);
  return NextResponse.json(labels);
}
