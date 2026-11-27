/**
 * Demo mode — the public portfolio build shows how every screen works with
 * clearly fictional sample data instead of "not configured" / "offline" states.
 *
 * Rules that keep it honest:
 *  - Off unless FOUNDER_OS_DEMO is set to 1 / true / on.
 *  - Demo data only ever fills a source that is NOT configured (or is
 *    unreachable). A real key always wins, and real data is never mixed with
 *    sample data in the same source.
 *  - Anything filled from samples is labelled "demo" in the UI, and nothing in
 *    demo mode sends a message or touches a real account.
 */
export function isDemoMode(env: Record<string, string | undefined> = process.env): boolean {
  const raw = (env.FOUNDER_OS_DEMO ?? env.NEXT_PUBLIC_FOUNDER_OS_DEMO ?? '').trim().toLowerCase();
  return raw === '1' || raw === 'true' || raw === 'on' || raw === 'yes';
}

/** Account ids of the sample inboxes — the email API routes recognise them. */
export const DEMO_ACCOUNT_PREFIX = 'demo-';

export function isDemoAccount(account: string | undefined | null): boolean {
  return typeof account === 'string' && account.startsWith(DEMO_ACCOUNT_PREFIX);
}
