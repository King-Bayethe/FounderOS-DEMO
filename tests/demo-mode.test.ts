import { describe, expect, it } from 'vitest';
import { openDb } from '@/lib/db';
import { seedDatabase } from '@/lib/seed';
import { isDemoMode, isDemoAccount } from '@/lib/demo/mode';
import { asDemoStatus } from '@/lib/connectors';
import { stateOfWorld } from '@/lib/pulse-history';
import { buildCommsLanes } from '@/lib/comms-lanes';
import { DEMO_INBOXES, demoEmails, demoEmailThread, demoEmailSearch, demoInstagram, demoWhatsapp } from '@/lib/demo/comms';
import { refreshDemoActivity } from '@/lib/demo/seed';
import { demoCalendar, demoPostDays } from '@/lib/demo/content';
import { demoBrainOverview } from '@/lib/demo/brain';
import { BrainOverviewSchema } from '@/lib/schemas';
import { EmailThreadSchema } from '@/lib/email-thread';
import type { ConnectorStatus } from '@/lib/connectors/types';

const status = (state: ConnectorStatus['state']): ConnectorStatus => ({
  id: 'x',
  name: 'X',
  kind: 'email',
  state,
  detail: 'detail',
});

describe('demo mode flag', () => {
  it('is off unless FOUNDER_OS_DEMO is truthy', () => {
    expect(isDemoMode({})).toBe(false);
    expect(isDemoMode({ FOUNDER_OS_DEMO: '0' })).toBe(false);
    expect(isDemoMode({ FOUNDER_OS_DEMO: '1' })).toBe(true);
    expect(isDemoMode({ FOUNDER_OS_DEMO: 'true' })).toBe(true);
  });

  it('recognises only the sample inbox ids', () => {
    expect(isDemoAccount('demo-founder')).toBe(true);
    expect(isDemoAccount('inbox-1')).toBe(false);
    expect(isDemoAccount(undefined)).toBe(false);
  });
});

describe('connector statuses in demo mode', () => {
  it('relabels unconfigured and failing connectors as demo, never a live one', () => {
    expect(asDemoStatus(status('connected')).state).toBe('connected');
    expect(asDemoStatus(status('not_configured')).state).toBe('demo');
    expect(asDemoStatus(status('error')).state).toBe('demo');
    expect(asDemoStatus(status('error')).detail).toMatch(/^Demo data/);
  });

  it('does not count demo connectors as down on the home line', () => {
    const segs = stateOfWorld({
      activeAgents: 3,
      totalAgents: 5,
      connected: 1,
      totalConnectors: 21,
      inbound: 0,
      health: 92,
      brainConnected: true,
      failedRuns: 0,
      demo: 20,
    });
    const text = segs.map((s) => s.text).join(' · ');
    expect(text).not.toMatch(/down/);
    expect(text).toMatch(/20 connectors on demo data/);
  });
});

describe('sample comms', () => {
  it('fills two inboxes, WhatsApp and an Instagram lane with a dozen-plus threads', () => {
    const demo = status('demo');
    const lanes = buildCommsLanes({
      inboxes: DEMO_INBOXES,
      emails: demoEmails(),
      emailState: demo,
      whatsapp: demoWhatsapp(),
      whatsappState: demo,
      tags: [],
      instagram: { items: demoInstagram(), state: demo },
    });
    expect(lanes.map((l) => l.source)).toEqual(['email', 'email', 'whatsapp', 'instagram']);
    const threads = lanes.reduce((n, l) => n + l.items.length, 0);
    expect(threads).toBeGreaterThanOrEqual(12);
    expect(lanes.every((l) => l.state === 'demo')).toBe(true);
  });

  it('uses only fictional addresses', () => {
    for (const e of demoEmails()) expect(e.replyTo).toMatch(/\.example$/);
  });

  it('serves a schema-valid thread and search for a sample inbox', () => {
    const first = demoEmails()[0];
    const thread = demoEmailThread(first.account!, { uid: first.emailUid });
    expect(thread).not.toBeNull();
    expect(() => EmailThreadSchema.parse(thread)).not.toThrow();
    expect(demoEmailSearch('demo-founder', 'contract').length).toBeGreaterThan(0);
  });
});

describe('sample agent activity', () => {
  it('adds runs, crons and owned tasks, and refreshing does not duplicate them', () => {
    const db = openDb(':memory:');
    seedDatabase(db);
    const tasksBefore = db.agentTasks.all().length;
    refreshDemoActivity(db, Date.now());
    const runs = db.agentRuns.recent(1000).length;
    const crons = db.agentCrons.all().length;
    expect(runs).toBeGreaterThan(20);
    expect(crons).toBeGreaterThanOrEqual(5);
    expect(db.agentTasks.all().length).toBeGreaterThan(tasksBefore);
    // a later refresh slides timestamps forward without adding rows
    refreshDemoActivity(db, Date.now() + 60 * 60_000);
    expect(db.agentRuns.recent(1000).length).toBe(runs);
    expect(db.agentCrons.all().length).toBe(crons);
    db.close();
  });
});

describe('sample content and brain', () => {
  it('plans published, scheduled and draft posts around today', () => {
    const statuses = new Set(demoCalendar().map((p) => p.status));
    expect(statuses).toEqual(new Set(['published', 'scheduled', 'draft']));
    expect(demoPostDays().length).toBeGreaterThan(30);
  });

  it('reports a healthy, schema-valid G-Brain readout', () => {
    const overview = demoBrainOverview('/tmp/brain-store');
    expect(() => BrainOverviewSchema.parse(overview)).not.toThrow();
    expect(overview.doctor.healthScore).toBe(92);
    expect(overview.store.totalFiles).toBeGreaterThan(1000);
  });
});
