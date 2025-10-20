// lib/supabase.ts
import { createBrowserClient, createServerClient } from "@supabase/ssr";
import { cookies, headers } from "next/headers";

export function getServerSupabase() {
  const cookieStore = cookies();
  const headerStore = headers();
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anon) {
    throw new Error('Supabase environment variables are not configured');
  }
  return createServerClient(url, anon, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(_cookies) {}, // no-op for SSR fetch
    },
    global: {
      headers: {
        "x-trs-host": headerStore.get("host") ?? "",
      },
    },
  });
}

export function getBrowserSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anon) {
    throw new Error('Supabase environment variables are not configured');
  }
  return createBrowserClient(url, anon);
}
