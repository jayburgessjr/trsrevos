import { NextResponse } from 'next/server';

import { fetchRevOsDashboard } from '@/core/revos/dashboard';

export async function GET() {
  try {
    const snapshot = await fetchRevOsDashboard();
    return NextResponse.json({ snapshot });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error fetching dashboard snapshot';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

