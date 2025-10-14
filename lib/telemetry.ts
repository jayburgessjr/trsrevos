export type TelemetryLevel = 'info' | 'warn' | 'error'

export type TelemetryPayload = {
  event: string
  level: TelemetryLevel
  context?: Record<string, unknown>
  error?: { message: string; stack?: string }
  timestamp?: string
}

function normalizeError(error: unknown): { message: string; stack?: string } {
  if (error instanceof Error) {
    return { message: error.message, stack: error.stack ?? undefined }
  }

  if (typeof error === 'object' && error !== null && 'message' in error) {
    const anyError = error as { message?: unknown; stack?: unknown }
    return {
      message: String(anyError.message ?? 'Unknown error'),
      stack: typeof anyError.stack === 'string' ? anyError.stack : undefined,
    }
  }

  return { message: String(error) }
}

function dispatchTelemetry(payload: TelemetryPayload) {
  if (typeof window !== 'undefined') {
    try {
      window.dispatchEvent(new CustomEvent('trs-telemetry', { detail: payload }))
    } catch (error) {
      if (process.env.NODE_ENV !== 'production') {
        console.warn('[telemetry] failed to dispatch telemetry event', error)
      }
    }
  }
}

export function trackClientEvent(
  event: string,
  context?: Record<string, unknown>,
  level: TelemetryLevel = 'info',
) {
  const payload: TelemetryPayload = {
    event,
    level,
    context,
    timestamp: new Date().toISOString(),
  }

  dispatchTelemetry(payload)

  if (process.env.NODE_ENV !== 'production') {
    console.log(`[telemetry] ${event}`, payload)
  }
}

export function reportClientError(
  event: string,
  error: unknown,
  context?: Record<string, unknown>,
) {
  const payload: TelemetryPayload = {
    event,
    level: 'error',
    context,
    error: normalizeError(error),
    timestamp: new Date().toISOString(),
  }

  dispatchTelemetry(payload)

  if (process.env.NODE_ENV !== 'production') {
    console.error(`[telemetry] ${event}`, error, context)
  }
}
