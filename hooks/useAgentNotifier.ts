'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import type { RealtimePostgresChangesPayload } from '@supabase/supabase-js';
import { getSupabaseClient } from '@/lib/supabaseClient';

export type AgentNotification<T = unknown> = {
  message: string;
  payload: T;
  raw: RealtimePostgresChangesPayload<Record<string, unknown>>;
};

type AgentNotifierState<T> = {
  notification: AgentNotification<T> | null;
  error: Error | null;
};

type UseAgentNotifierOptions<T> = {
  onNotify?: (notification: AgentNotification<T>) => void;
  userId?: string | null;
};

export function useAgentNotifier<T = unknown>(options?: UseAgentNotifierOptions<T>): AgentNotifierState<T> {
  const { onNotify, userId } = options ?? {};
  const isMountedRef = useRef(true);
  const [notification, setNotification] = useState<AgentNotification<T> | null>(null);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    const client = getSupabaseClient();
    if (!client) {
      return;
    }

    const channel = client
      .channel(`agent-notifier:${userId ?? 'global'}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'agents' }, async (payload) => {
        try {
          const response = await fetch('/api/notify-agent', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              user_id: userId,
              agent: payload.new,
              event: payload.eventType,
            }),
          });

          if (!response.ok) {
            throw new Error(`Failed to notify agent: ${response.statusText}`);
          }

          const result: T = await response.json();
          const message =
            typeof result === 'object' && result !== null && 'message' in result
              ? String((result as Record<string, unknown>).message)
              : 'Agent notification received';

          const nextNotification: AgentNotification<T> = {
            message,
            payload: result,
            raw: payload as RealtimePostgresChangesPayload<Record<string, unknown>>,
          };

          if (isMountedRef.current) {
            setNotification(nextNotification);
            setError(null);
          }

          if (onNotify) {
            onNotify(nextNotification);
          }
        } catch (agentError) {
          if (isMountedRef.current) {
            setError(agentError instanceof Error ? agentError : new Error('Unknown agent notifier error'));
          }
        }
      })
      .subscribe();

    return () => {
      client.removeChannel(channel);
    };
  }, [onNotify, userId]);

  return useMemo(
    () => ({
      notification,
      error,
    }),
    [notification, error],
  );
}
