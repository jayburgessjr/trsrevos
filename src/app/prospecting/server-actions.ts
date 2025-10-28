'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { startOfDay } from 'date-fns';
import { prisma } from '@/src/lib/prisma';
import {
  generateCopy,
  isWithinSendWindow,
  logSendAttempt,
  researchCompany,
  sendEmail,
} from '@/src/lib/prospecting';

const optionalString = z.preprocess((val) => {
  if (typeof val !== 'string') return undefined;
  const trimmed = val.trim();
  return trimmed === '' ? undefined : trimmed;
}, z.string().optional());

const optionalUrl = z.preprocess((val) => {
  if (typeof val !== 'string') return undefined;
  const trimmed = val.trim();
  return trimmed === '' ? undefined : trimmed;
}, z.string().url().optional());

const rowSchema = z.object({
  email: z.string().email(),
  firstName: optionalString,
  lastName: optionalString,
  title: optionalString,
  company: optionalString,
  website: optionalUrl,
});

export async function ingestCsvAction(rows: any[]) {
  for (const row of rows) {
    const parsed = rowSchema.safeParse(row);
    if (!parsed.success) continue;

    const { email, firstName, lastName, title, company, website } = parsed.data;
    const normalizedEmail = email.toLowerCase();

    let account = null;
    if (company) {
      account = await prisma.account.upsert({
        where: { name: company },
        update: { website: website ?? undefined },
        create: { name: company, website: website ?? undefined },
      });
    }

    const contact = await prisma.contact.upsert({
      where: { email: normalizedEmail },
      update: {
        firstName,
        lastName,
        title,
        accountId: account?.id,
      },
      create: {
        email: normalizedEmail,
        firstName,
        lastName,
        title,
        accountId: account?.id,
      },
    });

    const existingProspect = await prisma.prospect.findFirst({
      where: { contactId: contact.id },
    });

    if (!existingProspect) {
      await prisma.prospect.create({
        data: {
          contactId: contact.id,
          accountId: account?.id,
          source: 'csv',
          status: 'new',
        },
      });
    }
  }

  revalidatePath('/prospecting');
}

export async function queueResearchAction() {
  const prospects = await prisma.prospect.findMany({
    where: { status: 'new' },
    include: {
      contact: true,
      account: true,
    },
    take: 200,
  });

  for (const prospect of prospects) {
    const result = await researchCompany({
      url: prospect.account?.website ?? undefined,
      company: prospect.account?.name ?? undefined,
      email: prospect.contact?.email ?? undefined,
    });

    const research = await prisma.researchSnapshot.create({
      data: {
        url: prospect.account?.website ?? null,
        summary: result.summary,
        triggers: JSON.stringify(result.triggers ?? []),
        citations: JSON.stringify(result.citations ?? []),
      },
    });

    await prisma.prospect.update({
      where: { id: prospect.id },
      data: {
        researchId: research.id,
        status: 'researched',
      },
    });
  }

  revalidatePath('/prospecting');
}

export async function runDailySendsAction() {
  const sequence = await prisma.sequence.findFirst({
    orderBy: { createdAt: 'asc' },
  });
  if (!sequence) return;
  if (!isWithinSendWindow(sequence.quietStart, sequence.quietEnd)) return;

  const todayStart = startOfDay(new Date());
  const sentToday = await prisma.sendAttempt.count({
    where: {
      createdAt: { gte: todayStart },
      prospect: { sequenceId: sequence.id },
    },
  });

  const remaining = Math.max(sequence.maxDailySends - sentToday, 0);
  if (remaining <= 0) return;

  const batch = await prisma.prospect.findMany({
    where: { status: 'researched' },
    include: {
      research: true,
      contact: true,
      account: true,
    },
    take: remaining,
  });

  for (const prospect of batch) {
    if (!prospect.contact?.email) {
      await logSendAttempt({
        prospectId: prospect.id,
        step: 1,
        status: 'failed',
        error: 'Missing contact email',
      });
      continue;
    }

    let subject: string | undefined;
    let body: string | undefined;

    try {
      const triggers = safeParseArray<string>(prospect.research?.triggers);
      const copy = await generateCopy({
        firstName: prospect.contact.firstName,
        company: prospect.account?.name,
        researchSummary: prospect.research?.summary ?? '',
        triggers,
      });
      subject = copy.subject;
      body = copy.body;
    } catch (error) {
      await logSendAttempt({
        prospectId: prospect.id,
        step: 1,
        status: 'failed',
        error: error instanceof Error ? error.message : String(error),
      });
      continue;
    }

    try {
      await sendEmail({
        to: prospect.contact.email,
        subject: subject!,
        body: body!,
      });

      await prisma.prospect.update({
        where: { id: prospect.id },
        data: {
          status: 'sent',
          sequenceId: prospect.sequenceId ?? sequence.id,
        },
      });

      await logSendAttempt({ prospectId: prospect.id, step: 1, status: 'sent' });
    } catch (error) {
      await logSendAttempt({
        prospectId: prospect.id,
        step: 1,
        status: 'failed',
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  revalidatePath('/prospecting');
}

function safeParseArray<T = unknown>(value?: string | null): T[] {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? (parsed as T[]) : [];
  } catch {
    return [];
  }
}
