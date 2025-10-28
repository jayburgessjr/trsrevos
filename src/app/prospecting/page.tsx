'use client';

import { useState, useTransition } from 'react';
import Papa from 'papaparse';
import {
  ingestCsvAction,
  queueResearchAction,
  runDailySendsAction,
} from './server-actions';

type CsvRecord = Record<string, unknown>;

export default function ProspectingPage() {
  const [rows, setRows] = useState<CsvRecord[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [isPending, startTransition] = useTransition();

  const upload = async () => {
    if (!file) return;
    const text = await file.text();
    const parsed = Papa.parse<CsvRecord>(text, { header: true });
    const data = (parsed.data || []).filter(Boolean) as CsvRecord[];
    setRows(data);
    startTransition(() => ingestCsvAction(data));
  };

  const handleQueueResearch = () => {
    startTransition(() => queueResearchAction());
  };

  const handleRunSends = () => {
    startTransition(() => runDailySendsAction());
  };

  return (
    <main className="mx-auto max-w-6xl space-y-8 p-6">
      <section>
        <h1 className="text-2xl font-semibold">Prospecting</h1>
        <p>Upload contacts, run research, send sequences, auto-book via Calendly.</p>
      </section>

      <section className="space-y-2">
        <h2 className="text-xl font-semibold">1) Upload CSV</h2>
        <input
          type="file"
          accept=".csv"
          onChange={(event) => setFile(event.target.files?.[0] ?? null)}
          disabled={isPending}
        />
        <button
          className="rounded border px-3 py-2 disabled:opacity-50"
          onClick={upload}
          disabled={!file || isPending}
        >
          Ingest
        </button>
        {rows.length > 0 && <p>Rows ingested: {rows.length}</p>}
      </section>

      <section className="space-y-2">
        <h2 className="text-xl font-semibold">2) Research</h2>
        <button
          className="rounded border px-3 py-2 disabled:opacity-50"
          onClick={handleQueueResearch}
          disabled={isPending}
        >
          Queue Research
        </button>
      </section>

      <section className="space-y-2">
        <h2 className="text-xl font-semibold">3) Send Daily Batch</h2>
        <button
          className="rounded border px-3 py-2 disabled:opacity-50"
          onClick={handleRunSends}
          disabled={isPending}
        >
          Run Sends
        </button>
      </section>
    </main>
  );
}
