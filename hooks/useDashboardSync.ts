'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { getSupabaseClient } from '@/lib/supabaseClient';

type AsyncState<T> = {
  data: T | null;
  isLoading: boolean;
  error: Error | null;
};

type DashboardState<T> = AsyncState<T> & {
  refresh: () => Promise<T | null>;
};

export function useDashboardSync<T = unknown>(userId?: string | null): DashboardState<T> {
  const isMountedRef = useRef(true);
  const [state, setState] = useState<AsyncState<T>>({
    data: null,
    isLoading: true,
    error: null,
  });

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const refresh = useCallback(async () => {
    if (!userId) {
      if (isMountedRef.current) {
        setState((prev) => ({
          ...prev,
          isLoading: false,
        }));
      }
      return null;
    }

    if (isMountedRef.current) {
      setState((prev) => ({
        ...prev,
        isLoading: true,
        error: null,
      }));
    }

    try {
      const response = await fetch('/api/dashboard-refresh', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ user_id: userId }),
      });

      if (!response.ok) {
        throw new Error(`Failed to refresh dashboard: ${response.statusText}`);
      }

      const payload: T = await response.json();

      if (isMountedRef.current) {
        setState({
          data: payload,
          isLoading: false,
          error: null,
        });
      }

      return payload;
    } catch (error) {
      if (isMountedRef.current) {
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: error instanceof Error ? error : new Error('Unknown dashboard refresh error'),
        }));
      }
      return null;
    }
  }, [userId]);

  useEffect(() => {
    if (!userId) {
      return undefined;
    }

    refresh();

    const client = getSupabaseClient();
    if (!client) {
      return undefined;
    }

    const channel = client
      .channel(`dashboard-sync:${userId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'finance' }, () => {
        void refresh();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'pipeline' }, () => {
        void refresh();
      })
      .subscribe();

    return () => {
      client.removeChannel(channel);
    };
  }, [refresh, userId]);

  return useMemo(
    () => ({
      ...state,
      refresh,
    }),
    [state, refresh],
  );
}
