import { prisma } from '@/src/lib/prisma';

type CalendlyPayload = {
  payload?: {
    event?: { uuid?: string; start_time?: string; end_time?: string };
    invitee?: { email?: string };
  };
};

export async function POST(request: Request) {
  let body: CalendlyPayload | null = null;
  try {
    body = (await request.json()) as CalendlyPayload;
  } catch {
    return new Response('bad payload', { status: 400 });
  }

  const event = body?.payload?.event;
  const externalId =
    (typeof event === 'string' ? event : event?.uuid) || null;
  const startTime = typeof event === 'object' ? event?.start_time : undefined;
  const endTime = typeof event === 'object' ? event?.end_time : undefined;
  const email = body?.payload?.invitee?.email?.toLowerCase();

  if (!externalId || !startTime || !endTime || !email) {
    return new Response('bad payload', { status: 400 });
  }

  const contact = await prisma.contact.findUnique({ where: { email } });
  if (!contact) return new Response('ok');

  const prospect = await prisma.prospect.findFirst({ where: { contactId: contact.id } });
  if (!prospect) return new Response('ok');

  await prisma.booking.create({
    data: {
      prospectId: prospect.id,
      calendar: 'calendly',
      externalId,
      start: new Date(startTime),
      end: new Date(endTime),
    },
  });

  await prisma.prospect.update({
    where: { id: prospect.id },
    data: { status: 'booked' },
  });

  return new Response('ok');
}
