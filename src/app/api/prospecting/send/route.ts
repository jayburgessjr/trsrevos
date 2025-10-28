import { runDailySendsAction } from '@/src/app/prospecting/server-actions';

export async function GET() {
  await runDailySendsAction();
  return new Response('ok');
}
