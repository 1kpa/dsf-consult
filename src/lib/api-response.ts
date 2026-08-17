import { NextResponse } from 'next/server';

/**
 * Always returns a generic, safe message to the client. The real error
 * (which may contain database/internals detail) is logged server-side only —
 * never sent in the response body.
 */
export function jsonError(message: string, status: number, cause?: unknown) {
  if (cause !== undefined) {
    console.error(`[api-error] ${message}`, cause);
  }
  return NextResponse.json({ success: false, error: message }, { status });
}

export function jsonSuccess<T extends Record<string, unknown>>(data: T, status = 200) {
  return NextResponse.json({ success: true, ...data }, { status });
}
