/**
 * Sample inbox for demo mode: two email inboxes, WhatsApp and Instagram DMs.
 * Every person, company and address here is fictional (example.com / .test
 * domains, invented names). Timestamps are relative to "now" so the board
 * always reads as a live morning, never as stale July data.
 */
import type { CommsItem } from '@/lib/comms';
import type { EmailThread } from '@/lib/email-thread';
import type { CalEvent } from '@/lib/connectors/gcal';
import type { SlackClientCard } from '@/lib/slack-clients';
import type { SlackChannel } from '@/lib/connectors/slack';

const MIN = 60_000;
const at = (minutesAgo: number, now: number) => new Date(now - minutesAgo * MIN).toISOString();

export const DEMO_INBOXES = [
  { id: 'demo-founder', name: 'Founder · alex@founderos.example' },
  { id: 'demo-support', name: 'Support · hello@vantage.example' },
];

type DemoMessage = { from: string; address: string; mine?: boolean; minutesAgo: number; body: string };

type DemoEmail = {
  account: string;
  uid: number;
  sender: string;
  address: string;
  subject: string;
  unread: number;
  starred?: boolean;
  messages: DemoMessage[];
};

const ME = { from: 'Alex (FounderOS)', address: 'alex@founderos.example' };

const EMAILS: DemoEmail[] = [
  {
    account: 'demo-founder',
    uid: 101,
    sender: 'Maya Torres',
    address: 'maya@northpeak-dental.example',
    subject: 'Re: AI intake build — ready to sign',
    unread: 1,
    starred: true,
    messages: [
      { from: 'Alex (FounderOS)', address: ME.address, mine: true, minutesAgo: 1440, body: 'Hi Maya,\n\nAttached is the scope for the AI intake build: missed-call text-back, online booking for new patients and a weekly report. Two-week sprint, $9,500 fixed.\n\nHappy to walk through it on a call.\n\nAlex' },
      { from: 'Maya Torres', address: 'maya@northpeak-dental.example', minutesAgo: 38, body: 'Hi Alex,\n\nWe went through it with both partners and we are in. Can you send the contract and the deposit link today? We would like to start Monday.\n\nThanks,\nMaya\nNorthpeak Dental (fictional)' },
    ],
  },
  {
    account: 'demo-founder',
    uid: 102,
    sender: 'Jordan Pike',
    address: 'jordan@pike-roofing.example',
    subject: 'Discovery call — Thursday 2pm?',
    unread: 1,
    messages: [
      { from: 'Jordan Pike', address: 'jordan@pike-roofing.example', minutesAgo: 95, body: 'Hey Alex,\n\nSaw the estimate-booking case study. We run 3 crews and lose leads after hours. Does Thursday at 2pm work for a quick call?\n\nJordan' },
    ],
  },
  {
    account: 'demo-founder',
    uid: 103,
    sender: 'Priya Nair',
    address: 'priya@launchpad-student.example',
    subject: 'Week 3 homework — first client signed!',
    unread: 0,
    messages: [
      { from: 'Priya Nair', address: 'priya@launchpad-student.example', minutesAgo: 260, body: 'Alex — just signed my first retainer ($1,800/mo) using the outreach script from week 2. Thank you! Posting the win in the community now.' },
      { from: 'Alex (FounderOS)', address: ME.address, mine: true, minutesAgo: 210, body: 'Huge, Priya. Proud of you. Bring the onboarding questions to Thursday\'s group call and we will build your delivery SOP live.' },
    ],
  },
  {
    account: 'demo-founder',
    uid: 104,
    sender: 'Ben Cho',
    address: 'ben@quill-podcast.example',
    subject: 'Podcast guest slot — agents for solo founders',
    unread: 1,
    messages: [
      { from: 'Ben Cho', address: 'ben@quill-podcast.example', minutesAgo: 520, body: 'Hi Alex, we host a weekly show for solo founders (fictional, 12k listeners). Would you join us to talk about running a company of AI agents? Any Tuesday in December works.' },
    ],
  },
  {
    account: 'demo-support',
    uid: 201,
    sender: 'Lena Fischer',
    address: 'lena@fischer-physio.example',
    subject: 'Booking widget not showing on mobile',
    unread: 1,
    messages: [
      { from: 'Lena Fischer', address: 'lena@fischer-physio.example', minutesAgo: 22, body: 'Hi team, the booking widget shows on desktop but not on my phone (iPhone, Safari). Can you take a look before the weekend?\n\nLena' },
    ],
  },
  {
    account: 'demo-support',
    uid: 202,
    sender: 'Stripe (sample)',
    address: 'receipts@payments.example',
    subject: 'Payout of $4,212.40 is on the way',
    unread: 0,
    messages: [
      { from: 'Stripe (sample)', address: 'receipts@payments.example', minutesAgo: 610, body: 'A payout of $4,212.40 is on its way to your bank account ending 0000 (sample data). Expected arrival: 2 business days.' },
    ],
  },
  {
    account: 'demo-support',
    uid: 203,
    sender: 'Omar Haddad',
    address: 'omar@haddad-law.example',
    subject: 'Invoice #1042 question',
    unread: 0,
    messages: [
      { from: 'Omar Haddad', address: 'omar@haddad-law.example', minutesAgo: 1500, body: 'Quick one: can invoice #1042 be split into two payments? Same total.' },
      { from: 'Support (Vantage)', address: 'hello@vantage.example', mine: true, minutesAgo: 1410, body: 'Absolutely, Omar. I have re-issued it as two payments of $1,400, the second due in 30 days. New links are in your inbox.' },
    ],
  },
];

const WHATSAPP: { sender: string; preview: string; minutesAgo: number; unread: number }[] = [
  { sender: 'Chris Ellison · Ellison HVAC', preview: 'The text-back caught 4 missed calls last night, 2 booked 🙌', minutesAgo: 12, unread: 2 },
  { sender: 'Launchpad Cohort · Dec group', preview: 'Sam: is the Thursday call recorded? I have a client meeting', minutesAgo: 47, unread: 5 },
  { sender: 'Dana (editor)', preview: 'Reel v2 is up in the drive, captions fixed', minutesAgo: 180, unread: 0 },
  { sender: 'Rafael Costa', preview: 'Deposit sent. Excited to get started!', minutesAgo: 400, unread: 0 },
];

const INSTAGRAM: { sender: string; preview: string; minutesAgo: number; unread: number }[] = [
  { sender: '@studio.kaia', preview: 'SCALE — how does the done-for-you build work?', minutesAgo: 8, unread: 1 },
  { sender: '@mikes.detailing', preview: 'saw your reel on missed calls. does it work for a 1-man shop?', minutesAgo: 64, unread: 1 },
  { sender: '@thegrowthnurse', preview: 'Booked a call for Friday, see you then!', minutesAgo: 230, unread: 0 },
  { sender: '@lumen.coffee.co', preview: 'Can you send pricing for the cohort?', minutesAgo: 720, unread: 1 },
];

function emailItem(e: DemoEmail, now: number): CommsItem {
  const last = e.messages[e.messages.length - 1];
  return {
    source: 'email',
    title: e.subject,
    sender: e.sender,
    preview: last.body.replace(/\s+/g, ' ').slice(0, 140),
    ts: at(last.minutesAgo, now),
    unread: e.unread,
    replyTo: e.address,
    account: e.account,
    subject: e.subject,
    emailUid: e.uid,
    emailThreadId: `demo-thread-${e.uid}`,
    emailMessageId: `<demo-${e.uid}@founderos.example>`,
    starred: e.starred ?? false,
  };
}

export function demoEmails(now = Date.now()): CommsItem[] {
  return EMAILS.map((e) => emailItem(e, now));
}

export function demoWhatsapp(now = Date.now()): CommsItem[] {
  return WHATSAPP.map((w) => ({
    source: 'whatsapp' as const,
    title: w.sender,
    sender: w.sender,
    preview: w.preview,
    ts: at(w.minutesAgo, now),
    unread: w.unread,
  }));
}

/** Instagram DMs as comms items (the lane builder treats them like WhatsApp). */
export function demoInstagram(now = Date.now()): CommsItem[] {
  return INSTAGRAM.map((d) => ({
    source: 'whatsapp' as const,
    title: d.sender,
    sender: d.sender,
    preview: d.preview,
    ts: at(d.minutesAgo, now),
    unread: d.unread,
  }));
}

/** Full thread for the expanded email reader. */
export function demoEmailThread(
  account: string,
  ids: { threadId?: string; uid?: number; messageId?: string },
  now = Date.now(),
): EmailThread | null {
  const email = EMAILS.find(
    (e) =>
      e.account === account &&
      ((ids.uid && e.uid === ids.uid) ||
        (ids.threadId && `demo-thread-${e.uid}` === ids.threadId) ||
        (ids.messageId && `<demo-${e.uid}@founderos.example>` === ids.messageId)),
  );
  if (!email) return null;
  return {
    account,
    threadId: `demo-thread-${email.uid}`,
    subject: email.subject,
    replyTo: email.address,
    messages: email.messages.map((m, i) => ({
      uid: email.uid * 10 + i,
      messageId: `<demo-${email.uid}-${i}@founderos.example>`,
      from: m.from,
      fromAddress: m.address,
      to: [m.mine ? email.address : account === 'demo-support' ? 'hello@vantage.example' : ME.address],
      cc: [],
      sentByMe: m.mine ?? false,
      subject: i === 0 ? email.subject.replace(/^Re:\s*/i, '') : email.subject,
      date: at(m.minutesAgo, now),
      body: m.body,
      unread: !m.mine && i === email.messages.length - 1 && email.unread > 0,
      starred: email.starred ?? false,
      attachments: [],
    })),
  };
}

/** Inbox search over the sample threads (subject, sender and bodies). */
export function demoEmailSearch(account: string, q: string, now = Date.now()) {
  const needle = q.toLowerCase();
  return EMAILS.filter(
    (e) =>
      e.account === account &&
      [e.subject, e.sender, ...e.messages.map((m) => m.body)].some((t) => t.toLowerCase().includes(needle)),
  ).map((e) => {
    const item = emailItem(e, now);
    return {
      id: `${e.account}:${e.uid}`,
      sender: e.sender,
      subject: e.subject,
      preview: item.preview,
      ts: item.ts,
      unread: e.unread,
      replyTo: e.address,
      emailUid: e.uid,
      emailThreadId: item.emailThreadId,
      emailMessageId: item.emailMessageId,
      starred: e.starred ?? false,
    };
  });
}

// ── Meetings + Slack (Comms page, demo mode) ────────────────────────────────


export const DEMO_CAL_ACCOUNTS = [
  { name: 'Founder', color: '#3df08c' },
  { name: 'Sales calls', color: '#5ec9f8' },
];

/** A believable week of meetings in the visitor's local week (UTC-anchored). */
export function demoWeekEvents(now = new Date()): CalEvent[] {
  const day0 = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  const slot = (dayOffset: number, hourUtc: number, minutes: number) =>
    new Date(day0 + dayOffset * 86_400_000 + hourUtc * 3_600_000).toISOString() +
    '|' +
    new Date(day0 + dayOffset * 86_400_000 + hourUtc * 3_600_000 + minutes * 60_000).toISOString();
  const rows: [number, number, number, string, number, string | null][] = [
    [0, 14, 30, 'Discovery — Pike Roofing (sample)', 1, 'https://meet.example.com/pike'],
    [0, 17, 60, 'Launchpad Cohort · group coaching', 0, 'https://meet.example.com/cohort'],
    [1, 15, 45, 'Kickoff — Northpeak Dental (sample)', 1, 'https://meet.example.com/northpeak'],
    [1, 19, 30, 'Content batch: 4 reels', 0, null],
    [2, 13, 30, 'Weekly agent review', 0, null],
    [2, 16, 30, 'Discovery — Studio Kaia (sample)', 1, 'https://meet.example.com/kaia'],
    [3, 15, 60, 'Podcast recording — Quill (sample)', 0, 'https://meet.example.com/quill'],
    [4, 14, 30, 'Support review — Fischer Physio', 1, null],
    [4, 18, 45, 'Finance close + payouts', 0, null],
    [5, 16, 30, 'Discovery — Mike\'s Detailing (sample)', 1, 'https://meet.example.com/mikes'],
  ];
  return rows.map(([d, h, m, title, acct, join], i) => {
    const [start, end] = slot(d, h, m).split('|');
    const account = DEMO_CAL_ACCOUNTS[acct];
    return { id: `demo-ev-${i}`, account: account.name, color: account.color, title, start, end, allDay: false, location: null, joinUrl: join };
  });
}

export function demoSlackCards(now = Date.now()): SlackClientCard[] {
  return [
    { id: 'demo-c1', name: 'Northpeak Dental', channel: 'client-northpeak', lastText: 'Maya: contract signed, sending the logo files now', lastTs: at(41, now), unread: 2, heat: 'hot', waiting: 'you', live: true, demo: true },
    { id: 'demo-c2', name: 'Ellison HVAC', channel: 'client-ellison', lastText: 'You: weekly report is in the channel, 2 new bookings', lastTs: at(150, now), unread: 0, heat: 'warm', waiting: 'them', live: true, demo: true },
    { id: 'demo-c3', name: 'Fischer Physio', channel: 'client-fischer', lastText: 'Lena: widget fixed on mobile, thanks!', lastTs: at(300, now), unread: 1, heat: 'warm', waiting: 'you', live: true, demo: true },
    { id: 'demo-c4', name: 'Haddad Law', channel: 'client-haddad', lastText: 'You: split invoice sent', lastTs: at(1450, now), unread: 0, heat: 'cold', waiting: 'none', live: true, demo: true },
  ];
}

export function demoSlackChannels(): SlackChannel[] {
  return [
    { id: 'demo-ch1', name: 'general', isMember: true, isPrivate: false, members: 6, topic: 'Team updates' },
    { id: 'demo-ch2', name: 'agents-log', isMember: true, isPrivate: false, members: 3, topic: 'Agent run reports' },
    { id: 'demo-ch3', name: 'client-northpeak', isMember: true, isPrivate: true, members: 4, topic: 'Northpeak Dental build' },
    { id: 'demo-ch4', name: 'client-ellison', isMember: true, isPrivate: true, members: 3, topic: 'Ellison HVAC retainer' },
    { id: 'demo-ch5', name: 'content', isMember: true, isPrivate: false, members: 4, topic: 'Reels, carousels, newsletter' },
  ];
}
