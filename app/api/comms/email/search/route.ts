import { NextResponse } from 'next/server';
import { z } from 'zod';
import { searchInboxEmails } from '@/lib/connectors/email';
import { EmailInboxItemSchema } from '@/lib/email-thread';
import { isDemoAccount, isDemoMode } from '@/lib/demo/mode';
import { demoEmailSearch } from '@/lib/demo/comms';

export const dynamic = 'force-dynamic';

const SearchQuerySchema = z.object({
  account: z.string().min(1).max(80),
  q: z.string().trim().min(2).max(200),
});

export async function GET(request: Request) {
  const parsed = SearchQuerySchema.safeParse(Object.fromEntries(new URL(request.url).searchParams));
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  if (isDemoMode() && isDemoAccount(parsed.data.account)) {
    return NextResponse.json({ items: z.array(EmailInboxItemSchema).parse(demoEmailSearch(parsed.data.account, parsed.data.q)) });
  }
  const result = await searchInboxEmails(parsed.data.account, parsed.data.q, 50);
  if (!result.ok) return NextResponse.json({ items: [], unavailable: true, error: result.error });
  return NextResponse.json({ items: z.array(EmailInboxItemSchema).parse(result.value) });
}
