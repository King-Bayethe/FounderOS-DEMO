import { CalendarDays, Hash, Mail, MessageSquare, type LucideIcon } from 'lucide-react';
import { PageHeader } from '@/components/PageHeader';
import { CommsTabs } from '@/components/CommsTabs';
import { gatherCommsLanes } from '@/lib/comms-lanes';
import { gatherSlackClientBoard } from '@/lib/slack-clients';
import { listChannels } from '@/lib/connectors/slack';
import { caldavAccounts, calendarStatus, upcomingEvents } from '@/lib/connectors/gcal';
import { Badge, Dot, SectionHead } from '@/components/terminal';
import { isDemoMode } from '@/lib/demo/mode';
import { DEMO_CAL_ACCOUNTS, demoSlackCards, demoSlackChannels, demoWeekEvents } from '@/lib/demo/comms';
import type { ConnectorStatus } from '@/lib/connectors/types';

export const dynamic = 'force-dynamic';

const SOURCE_ICON: Record<string, LucideIcon> = {
  whatsapp: MessageSquare,
  email: Mail,
  slack: Hash,
  calendar: CalendarDays,
};

export default async function CommsPage() {
  const [{ lanes, emailState, whatsappState }, slackBoard, liveChannels, liveCalendar, liveWeekEvents] =
    await Promise.all([
      gatherCommsLanes(),
      gatherSlackClientBoard(),
      listChannels(),
      calendarStatus(),
      upcomingEvents(undefined, { days: 7, limit: 200 }),
    ]);

  let slackCards = slackBoard.cards;
  let slackState: ConnectorStatus = slackBoard.status;
  let channels = liveChannels;
  let calendar: ConnectorStatus = liveCalendar;
  let weekEvents = liveWeekEvents;
  let calLegend = caldavAccounts().map((a) => ({ name: a.name, color: a.color }));

  // Demo mode: fill Slack and the meetings calendar with fictional samples,
  // only when they are not really connected.
  if (isDemoMode()) {
    if (slackState.state !== 'connected') {
      slackCards = demoSlackCards();
      channels = demoSlackChannels();
      slackState = { ...slackState, state: 'demo', detail: 'Sample client channels. Add SLACK_BOT_TOKEN to read real Slack.' };
    }
    if (calendar.state !== 'connected') {
      weekEvents = demoWeekEvents();
      calLegend = DEMO_CAL_ACCOUNTS;
      calendar = { ...calendar, state: 'demo', detail: `${weekEvents.length} sample meetings this week. Live calendars read over CalDAV.` };
    }
  }
  const nowISO = new Date().toISOString();
  const sources = [emailState, whatsappState, slackState, calendar];

  const connectedSources = sources.filter((s) => s.state === 'connected').length;
  const demoSources = sources.filter((s) => s.state === 'demo').length;
  const totalUnread = lanes.reduce((sum, lane) => sum + lane.unread, 0);

  return (
    <div>
      <PageHeader
        eyebrow="by source"
        title="Comms"
        right={<Badge tone="accent">{totalUnread} unread</Badge>}
      />

      {/* Source status row */}
      <section className="mb-7">
        <SectionHead label="Sources" count={demoSources > 0 ? `${connectedSources} connected · ${demoSources} demo` : `${connectedSources}/${sources.length} connected`} />
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {sources.map((source) => {
            const Icon = SOURCE_ICON[source.id] ?? Mail;
            const ok = source.state === 'connected';
            const demo = source.state === 'demo';
            return (
              <div key={source.id} className="hoverable rounded-2xl border border-os-border bg-os-surface px-4 py-3.5">
                <div className="flex items-center gap-[9px]">
                  <Icon className={`h-[15px] w-[15px] shrink-0 ${ok || demo ? 'text-os-accent' : 'text-os-dim'}`} strokeWidth={1.7} />
                  <span className="text-[13px] font-semibold">{source.name}</span>
                  <span className="ml-auto flex items-center gap-2">
                    {(ok || demo) && <Dot state={source.state} pulse />}
                    <Badge
                      tone={ok ? 'ok' : demo ? 'accent' : source.state === 'error' ? 'err' : 'default'}
                      ghost={source.state === 'not_configured'}
                    >
                      {ok ? 'Connected' : demo ? 'Demo data' : source.state === 'error' ? 'Error' : 'Not configured'}
                    </Badge>
                  </span>
                </div>
                <p className="mt-[9px] font-mono text-[10.5px] leading-relaxed text-os-dim">{source.detail}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Swappable front: the messaging board (source lanes + Slack) or the 7-day meetings calendar */}
      <CommsTabs lanes={lanes} slackCards={slackCards} channels={channels} events={weekEvents} accounts={calLegend} nowISO={nowISO} />

      <p className="mt-4 rounded-xl border border-dashed border-os-border-strong px-3 py-3 text-center font-mono text-[10.5px] text-os-dim">
        Four inboxes (expand to read + reply) and WhatsApp as lanes · Slack per client + every current channel · meetings via CalDAV
      </p>
    </div>
  );
}
