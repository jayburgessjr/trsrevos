import { prisma } from '@/src/lib/prisma';
import { classifyReply } from '@/src/lib/prospecting';

export async function POST(request: Request) {
  const form = await request.formData();
  const fromField = String(form.get('from') || '');
  const emailMatch = (fromField.split('<')[1] || fromField).replace('>', '').trim().toLowerCase();
  const text = String(form.get('text') || '').trim();

  if (!emailMatch || !text) {
    return new Response('ok');
  }

  const contact = await prisma.contact.findUnique({ where: { email: emailMatch } });
  if (!contact) {
    return new Response('ok');
  }

  const prospect = await prisma.prospect.findFirst({ where: { contactId: contact.id } });
  if (!prospect) {
    return new Response('ok');
  }

  const classification = await classifyReply(text);

  await prisma.reply.create({
    data: {
      prospectId: prospect.id,
      rawText: text,
      classification,
    },
  });

  await prisma.prospect.update({
    where: { id: prospect.id },
    data: { status: 'replied' },
  });

  return new Response('ok');
}
