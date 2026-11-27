/**
 * Demo-mode agent activity: recent runs, chat replies, cron jobs and open
 * tasks with owners, so /agents, /tasks and the home console read as a team
 * at work. Rows use fixed `demo-*` ids and INSERT OR REPLACE, so refreshing
 * just slides the same sample history forward to "now" — it never piles up
 * and never overwrites a real row.
 */
import type { FounderDb } from '@/lib/db';

const MIN = 60_000;

/** [agentId, summary, ok, minutesAgo, durationSeconds] */
const RUNS: [string, string, boolean, number, number][] = [
  ['comms-agent', 'Triaged 14 inbound across 2 inboxes · 3 flagged hot', true, 6, 41],
  ['whatsapp-worker', 'Read 9 chats · drafted 2 replies for approval', true, 14, 12],
  ['sales-agent', 'Northpeak Dental moved to Won · contract + deposit link drafted', true, 33, 28],
  ['data-agent', 'G-Brain health 92/100 · 1,284 pages · 3 stale notes queued', true, 52, 19],
  ['postly-publisher', 'Scheduled 5 posts across IG, TikTok, LinkedIn', true, 71, 23],
  ['crm-pulse', 'Synced 38 contacts · 2 deals changed stage', true, 95, 16],
  ['stack-monitor', 'All 9 local services up · disk 61%', true, 120, 7],
  ['social-agent', 'Drafted 3 hooks for the missed-call reel', true, 150, 34],
  ['vector-auditor', 'Re-embedded 42 pages · 0 orphans', true, 185, 58],
  ['adsmith-creative', 'Render timed out on variant 4 (retry queued)', false, 210, 300],
  ['client-roster', 'Weekly roster: 7 active clients · 1 at risk', true, 260, 11],
  ['markdown-auditor', 'Fixed 6 broken wikilinks in /sops', true, 330, 14],
  ['reelkit-editor', 'Cut 3 clips from the Thursday call', true, 410, 96],
  ['comms-agent', 'Overnight sweep: 22 inbound · 5 need a reply', true, 600, 44],
  ['conductor', 'Morning brief sent: 3 calls, 2 proposals, 1 payout', true, 640, 22],
  ['renderly-creative', 'Generated 8 carousel frames for "agency niches"', true, 760, 71],
  ['sales-agent', 'Follow-ups sent to 6 warm leads (approved)', true, 900, 31],
  ['data-agent', 'Nightly doctor: embeddings OK · 2 slow queries', true, 1380, 20],
  ['postly-publisher', 'Published "One person, a company of agents" ×4 platforms', true, 1500, 18],
  ['crm-pulse', 'Webhook from booking form · new lead Jordan Pike', true, 1620, 4],
  ['whatsapp-worker', 'Cohort group digest posted', true, 1800, 9],
  ['stack-monitor', 'Port 4000 restarted after a crash · healthy again', true, 2100, 12],
  ['social-agent', 'Weekly social report: +412 followers', true, 2900, 27],
  ['vector-auditor', 'Weekly vector audit · 0 drift', true, 4300, 63],
  ['conductor', 'Broadcast: "what moved revenue this week?" · 6 replies', true, 5800, 55],
  ['client-roster', 'Onboarding checklist created for Rafael Costa', true, 7200, 15],
  ['sales-agent', 'Proposal sent to Fischer Physio', true, 8600, 26],
  ['comms-agent', 'Triaged 31 inbound after the reel went out', true, 9900, 49],
];

/** Assistant replies that show up in each agent's chat and the activity feed. */
const MESSAGES: [string, string, number][] = [
  ['sales-agent', 'Northpeak is ready to sign. I drafted the contract and a $4,750 deposit link. Want me to send both?', 30],
  ['comms-agent', 'Three hot threads this morning: Northpeak (contract), Pike Roofing (call Thursday) and @studio.kaia (asked SCALE).', 5],
  ['data-agent', 'G-Brain is healthy at 92/100. The pricing SOP has not been touched in 60 days, so I queued it for review.', 50],
  ['conductor', 'Today: 2 discovery calls, 1 kickoff, and $9,500 waiting on a signature. Inbox is under control.', 638],
];

/** [id, agentId, schedule, description] */
const CRONS: [string, string, string, string][] = [
  ['demo-cron-1', 'comms-agent', '*/30 * * * *', 'Triage every inbox and flag anything hot'],
  ['demo-cron-2', 'conductor', '0 7 * * 1-5', 'Morning brief: calls, money, what needs you'],
  ['demo-cron-3', 'data-agent', '0 2 * * *', 'Nightly G-Brain doctor and stale-note sweep'],
  ['demo-cron-4', 'postly-publisher', '0 9 * * 1', 'Schedule the week of posts across six platforms'],
  ['demo-cron-5', 'crm-pulse', '0 * * * *', 'Sync contacts and deal stages from the CRM'],
  ['demo-cron-6', 'stack-monitor', '*/15 * * * *', 'Check local services and restart anything down'],
];

/** [id, agentId, title, status] — owners are the agents themselves. */
const TASKS: [string, string, string, 'open' | 'doing' | 'done'][] = [
  ['demo-task-1', 'sales-agent', 'Send the Northpeak contract + deposit link', 'open'],
  ['demo-task-2', 'comms-agent', 'Reply to Lena (booking widget on mobile)', 'doing'],
  ['demo-task-3', 'client-roster', 'Onboard Rafael Costa: kickoff + access', 'open'],
  ['demo-task-4', 'data-agent', 'Review the stale pricing SOP', 'open'],
  ['demo-task-5', 'reelkit-editor', 'Captions for the missed-call reel', 'doing'],
  ['demo-task-6', 'crm-pulse', 'Tag 12 webinar attendees as warm', 'open'],
];

let lastRefresh = 0;

export function refreshDemoActivity(db: FounderDb, now = Date.now()): void {
  // Slide the sample history forward at most every 10 minutes.
  if (now - lastRefresh < 10 * MIN) return;
  lastRefresh = now;

  const agentIds = new Set(db.agents.all().map((a) => a.id));
  const iso = (minutesAgo: number) => new Date(now - minutesAgo * MIN).toISOString();

  RUNS.forEach(([agentId, summary, ok, minutesAgo, seconds], i) => {
    if (!agentIds.has(agentId)) return;
    db.agentRuns.insert({
      id: `demo-run-${i}`,
      agentId,
      startedAt: iso(minutesAgo),
      finishedAt: new Date(now - minutesAgo * MIN + seconds * 1000).toISOString(),
      ok,
      summary,
    });
  });

  MESSAGES.forEach(([agentId, content, minutesAgo], i) => {
    if (!agentIds.has(agentId)) return;
    db.agentMessages.insert({
      id: `demo-msg-${i}`,
      agentId,
      role: 'assistant',
      content,
      toolCalls: [],
      createdAt: iso(minutesAgo),
    });
  });

  const existingCrons = new Set(db.agentCrons.all().map((c) => c.id));
  for (const [id, agentId, schedule, description] of CRONS) {
    if (existingCrons.has(id) || !agentIds.has(agentId)) continue; // keep a visitor's toggle
    db.agentCrons.insert({ id, agentId, schedule, description, enabled: true, createdAt: iso(20_000) });
  }

  const existingTasks = new Set(db.agentTasks.all().map((t) => t.id));
  TASKS.forEach(([id, agentId, title, status], i) => {
    if (existingTasks.has(id) || !agentIds.has(agentId)) return; // keep a visitor's moves
    db.agentTasks.insert({ id, agentId, title, status, createdAt: iso(300 + i * 90), updatedAt: iso(60 + i * 30) });
  });
}
