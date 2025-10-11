'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

type AsyncState<T> = {
  data: T | null;
  isLoading: boolean;
  error: Error | null;
};

type MorningBriefState<T> = AsyncState<T> & {
  refresh: () => Promise<T | null>;
};

const THIRTY_MINUTES = 30 * 60 * 1000;

export function useMorningBrief<T = unknown>(userId?: string | null): MorningBriefState<T> {
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

  const fetchBrief = useCallback(async () => {
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
      const response = await fetch('/api/morning-brief', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ user_id: userId }),
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch morning brief: ${response.statusText}`);
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
          error: error instanceof Error ? error : new Error('Unknown morning brief error'),
        }));
      }
      return null;
    }
  }, [userId]);

  useEffect(() => {
    if (!userId) {
      return undefined;
    }

    fetchBrief();

    const channel = supabase
      .channel(`morning-brief:${userId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'finance' }, () => {
        void fetchBrief();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'pipeline' }, () => {
        void fetchBrief();
      })
      .subscribe();

    const intervalId = window.setInterval(() => {
      void fetchBrief();
    }, THIRTY_MINUTES);

    return () => {
      window.clearInterval(intervalId);
      supabase.removeChannel(channel);
    };
  }, [fetchBrief, userId]);

  return useMemo(
    () => ({
      ...state,
      refresh: fetchBrief,
    }),
    [state, fetchBrief],
  );
}
