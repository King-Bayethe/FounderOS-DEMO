import { mergeFeed, type CommsItem } from '@/lib/comms';
import { latestEmails } from '@/lib/connectors/email';
import { recentChats } from '@/lib/connectors/whatsapp';
import { recentMessages } from '@/lib/connectors/slack';
import { isDemoMode } from '@/lib/demo/mode';
import { demoEmails, demoInstagram, demoWhatsapp } from '@/lib/demo/comms';

/** Gather the unified comms feed from every source that is reachable. */
export async function gatherCommsFeed(limit = 40): Promise<CommsItem[]> {
  const [whatsapp, email, slack] = await Promise.allSettled([
    recentChats(15),
    latestEmails(5),
    process.env.SLACK_BOT_TOKEN
      ? recentMessages(15).then((messages) =>
          messages.map(
            (m): CommsItem => ({
              source: 'slack',
              title: `#${m.channel} — ${m.user}`,
              sender: m.user,
              replyTo: m.channel,
              preview: m.text.slice(0, 140),
              ts: new Date(Number(m.ts) * 1000).toISOString(),
            }),
          ),
        )
      : Promise.resolve([] as CommsItem[]),
  ]);
  const wa = whatsapp.status === 'fulfilled' ? whatsapp.value : [];
  const mail = email.status === 'fulfilled' ? email.value : [];
  const items: CommsItem[] = [...wa, ...mail, ...(slack.status === 'fulfilled' ? slack.value : [])];
  // Demo mode: sources with nothing real behind them get the sample threads.
  if (isDemoMode()) {
    if (mail.length === 0) items.push(...demoEmails());
    if (wa.length === 0) items.push(...demoWhatsapp(), ...demoInstagram());
  }
  return mergeFeed(items, limit);
}
