'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { getSupabaseClient } from '@/lib/supabaseClient';

type AsyncState<T> = {
  data: T | null;
  isLoading: boolean;
  error: Error | null;
};

type AnalyticsState<T> = AsyncState<T> & {
  refresh: () => Promise<T | null>;
};

export function useAnalyticsStream<T = unknown>(userId?: string | null): AnalyticsState<T> {
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

  const fetchAnalytics = useCallback(async () => {
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
      const response = await fetch('/api/analytics-sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ user_id: userId }),
      });

      if (!response.ok) {
        throw new Error(`Failed to sync analytics: ${response.statusText}`);
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
          error: error instanceof Error ? error : new Error('Unknown analytics sync error'),
        }));
      }
      return null;
    }
  }, [userId]);

  useEffect(() => {
    if (!userId) {
      return undefined;
    }

    fetchAnalytics();

    const client = getSupabaseClient();
    if (!client) {
      return undefined;
    }

    const channel = client
      .channel(`analytics-stream:${userId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'analytics_events' }, () => {
        void fetchAnalytics();
      })
      .subscribe();

    return () => {
      client.removeChannel(channel);
    };
  }, [fetchAnalytics, userId]);

  return useMemo(
    () => ({
      ...state,
      refresh: fetchAnalytics,
    }),
    [state, fetchAnalytics],
  );
}
