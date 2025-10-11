'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { useDashboardSync } from '@/hooks/useDashboardSync';
import { useMorningBrief } from '@/hooks/useMorningBrief';
import { useAnalyticsStream } from '@/hooks/useAnalyticsStream';
import { useAgentNotifier } from '@/hooks/useAgentNotifier';
import type { AgentNotification } from '@/hooks/useAgentNotifier';

type RealtimeProviderProps = {
  userId: string;
  children: ReactNode;
};

type RealtimeContextValue = {
  dashboard: ReturnType<typeof useDashboardSync>;
  morningBrief: ReturnType<typeof useMorningBrief>;
  analytics: ReturnType<typeof useAnalyticsStream>;
  agentNotification: AgentNotification | null;
  agentNotificationError: Error | null;
};

const RealtimeContext = createContext<RealtimeContextValue | undefined>(undefined);

export function useRealtimeContext(): RealtimeContextValue {
  const context = useContext(RealtimeContext);
  if (!context) {
    throw new Error('useRealtimeContext must be used within a RealtimeProvider');
  }
  return context;
}

export default function RealtimeProvider({ userId, children }: RealtimeProviderProps) {
  const dashboard = useDashboardSync(userId);
  const morningBrief = useMorningBrief(userId);
  const analytics = useAnalyticsStream(userId);
  const [toast, setToast] = useState<string | null>(null);
  const handleAgentNotify = useCallback((notification: AgentNotification) => {
    setToast(notification.message);
  }, []);

  const { notification: agentNotification, error: agentNotificationError } = useAgentNotifier({
    userId,
    onNotify: handleAgentNotify,
  });

  useEffect(() => {
    if (!toast) {
      return undefined;
    }

    const timeout = window.setTimeout(() => {
      setToast(null);
    }, 4000);

    return () => {
      window.clearTimeout(timeout);
    };
  }, [toast]);

  const contextValue = useMemo<RealtimeContextValue>(() => ({
    dashboard,
    morningBrief,
    analytics,
    agentNotification,
    agentNotificationError,
  }), [dashboard, morningBrief, analytics, agentNotification, agentNotificationError]);

  return (
    <RealtimeContext.Provider value={contextValue}>
      {children}
      {toast && (
        <div className="fixed bottom-4 right-4 rounded-lg bg-neutral-900 px-4 py-2 text-sm text-white shadow-lg">
          {toast}
        </div>
      )}
    </RealtimeContext.Provider>
  );
}
