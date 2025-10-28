import { prisma } from './prisma';
import { OpenAI } from 'openai';
import { isWithinInterval } from 'date-fns';
import sg from '@sendgrid/mail';

type ResearchResult = {
  summary: string;
  triggers: string[];
  citations: Array<{ title: string; url: string }>;
};

type CopyArgs = {
  firstName?: string | null;
  company?: string | null;
  researchSummary?: string;
  triggers?: string[];
};

type SendArgs = {
  to: string;
  subject: string;
  body: string;
};

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
sg.setApiKey(process.env.SENDGRID_API_KEY || '');

export function isWithinSendWindow(quietStart = 20, quietEnd = 7) {
  const now = new Date();
  const start = new Date(now);
  start.setHours(quietStart, 0, 0, 0);
  const end = new Date(now);
  end.setHours(quietEnd, 0, 0, 0);

  const inQuiet =
    quietStart > quietEnd
      ? now >= start || now <= end
      : isWithinInterval(now, { start, end });

  return !inQuiet;
}

export async function researchCompany(args: {
  url?: string;
  company?: string;
  email?: string;
}): Promise<ResearchResult> {
  let text = '';

  if (args.url) {
    try {
      const res = await fetch(args.url, { method: 'GET' });
      const html = await res.text();
      text = html
        .replace(/<script[\s\S]*?<\/script>/gi, '')
        .replace(/<style[\s\S]*?<\/style>/gi, '')
        .replace(/<[^>]+>/g, ' ')
        .replace(/\s+/g, ' ')
        .slice(0, 8000);
    } catch (error) {
      console.error('Research fetch error', error);
    }
  }

  const prompt = [
    'You are a cautious research assistant. Summarize the company in 4 bullets using ONLY the provided text. Then extract 3 possible "triggers" (recent initiative, product angle, ICP fit). If evidence is weak, say "Unknown". Output JSON with keys: summary (string), triggers (string[]), citations ({title,url}[]).',
    `Company: ${args.company || 'Unknown'}`,
    `Homepage text: ${text || 'N/A'}`,
  ].join('\n\n');

  const resp = await openai.responses.create({
    model: 'gpt-4.1-mini',
    input: prompt,
  });

  const raw = (resp as any).output_text?.trim?.() ?? (resp as any).output_text ?? '';
  let parsed: Partial<ResearchResult> = {};
  try {
    parsed = JSON.parse(raw);
  } catch (error) {
    console.error('Research parse error', error, raw);
    parsed = { summary: 'Unknown', triggers: [], citations: [] };
  }

  return {
    summary: parsed.summary || 'Unknown',
    triggers: Array.isArray(parsed.triggers) ? (parsed.triggers as string[]) : [],
    citations: Array.isArray(parsed.citations)
      ? (parsed.citations as Array<{ title: string; url: string }>)
      : [],
  };
}

export function basicCopyEval(body: string) {
  const hard = [/guarantee/i, /no risk/i, /free money/i, /act now/i];
  if (hard.some((r) => r.test(body))) return { ok: false, reason: 'Spammy phrasing' } as const;
  if (body.length > 1200) return { ok: false, reason: 'Too long' } as const;
  return { ok: true } as const;
}

export async function generateCopy(args: CopyArgs) {
  const system =
    'You write concise B2B first-touch emails. 80 words max body. No fluff. One specific hypothesis. End with a single soft CTA to book.';
  const user = `Prospect: ${args.firstName || ''} at ${args.company || ''}.\nResearch: ${
    args.researchSummary || 'Unknown'
  }\nTriggers: ${(args.triggers || []).join(', ')}\nWrite subject and body.`;

  const response = await openai.responses.create({
    model: 'gpt-4.1-mini',
    input: [
      { role: 'system', content: system },
      { role: 'user', content: user },
    ],
  });

  const text = ((response as any).output_text as string) || '';
  const [subjectLine, ...rest] = text.split('\n').filter(Boolean);
  const subject = subjectLine?.replace(/^Subject:\s*/i, '').slice(0, 120) ?? 'Quick intro';
  const body = rest.join('\n').trim().slice(0, 1200);
  const evalRes = basicCopyEval(body);

  if (!evalRes.ok) {
    throw new Error(`Eval failed: ${evalRes.reason}`);
  }

  return { subject, body };
}

export async function sendEmail(args: SendArgs) {
  const fromEmail = process.env.SENDER_EMAIL || '';
  if (!fromEmail) throw new Error('Missing SENDER_EMAIL');

  const allowed = (process.env.ALLOWED_SENDER_DOMAINS || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  const senderDomain = fromEmail.split('@')[1];

  if (allowed.length && (!senderDomain || !allowed.includes(senderDomain))) {
    throw new Error('Sender domain not allowed');
  }

  await sg.send({
    to: args.to,
    from: { email: fromEmail, name: process.env.SENDER_NAME || 'TRS Prospecting' },
    subject: args.subject,
    text: `${args.body}\n\nBook here: ${process.env.BOOKING_LINK || ''}`.trim(),
  });
}

export async function classifyReply(text: string) {
  const prompt =
    'Classify the email into one of: positive, neutral, objection, ooo, unsubscribe. Only output the label.\n\nEmail:\n' +
    text;
  const response = await openai.responses.create({ model: 'gpt-4.1-mini', input: prompt });
  const label = ((response as any).output_text as string)?.trim().toLowerCase() || 'neutral';
  const allowed = ['positive', 'neutral', 'objection', 'ooo', 'unsubscribe'];
  return allowed.includes(label) ? label : 'neutral';
}

export async function logSendAttempt(params: {
  prospectId: string;
  step: number;
  status: string;
  providerId?: string | null;
  error?: string | null;
}) {
  await prisma.sendAttempt.create({
    data: {
      prospectId: params.prospectId,
      step: params.step,
      status: params.status,
      providerId: params.providerId ?? null,
      error: params.error ?? null,
    },
  });
}
