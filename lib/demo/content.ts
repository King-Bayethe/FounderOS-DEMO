/**
 * Demo-mode content: a believable posting history (published) and the next
 * two weeks of scheduled posts, used only when no Zernio key is configured.
 * Captions are generic; no real accounts or links.
 */
import type { ZernioPost, ZernioPostDay } from '@/lib/connectors/zernio';

const DAY = 86_400_000;

export type DemoCalendarPost = {
  id: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM, operator local
  platforms: string[];
  format: 'Reel' | 'Carousel' | 'Short' | 'Thread' | 'Newsletter' | 'Video' | 'Post';
  title: string;
  status: 'published' | 'scheduled' | 'draft';
};

/** [dayOffset (negative = past), time, platforms, format, title] */
const PLAN: [number, string, string[], DemoCalendarPost['format'], string][] = [
  [-13, '09:00', ['instagram', 'tiktok'], 'Reel', 'Missed calls are lost revenue (with the math)'],
  [-12, '12:30', ['linkedin'], 'Post', 'What a one-person agency actually runs on'],
  [-11, '18:00', ['youtube'], 'Video', 'I let 6 AI agents run my week'],
  [-10, '09:00', ['instagram'], 'Carousel', 'Agency niches that work in 2026'],
  [-9, '08:00', ['twitter'], 'Thread', 'The client-onboarding agent, step by step'],
  [-8, '09:00', ['instagram', 'tiktok', 'youtube'], 'Short', 'Day in the life: inbox zero by 9am'],
  [-7, '10:00', ['twitter', 'linkedin'], 'Newsletter', 'Issue #41: pricing a done-for-you build'],
  [-6, '09:00', ['instagram', 'tiktok'], 'Reel', 'Before/after: dental front desk with AI intake'],
  [-5, '12:30', ['linkedin'], 'Post', 'Why I stopped selling hours'],
  [-4, '09:00', ['instagram'], 'Carousel', 'One person, a company of agents'],
  [-3, '18:00', ['youtube'], 'Video', 'Building a booking agent live'],
  [-2, '09:00', ['tiktok', 'instagram'], 'Short', 'The 3-message DM script that books calls'],
  [-1, '08:00', ['twitter'], 'Thread', 'Every tool in the operator stack'],
  [0, '09:00', ['instagram', 'tiktok'], 'Reel', 'Roofers: book 20 estimates a month'],
  [0, '17:00', ['linkedin'], 'Post', 'Cohort wins: first retainer in week 3'],
  [1, '09:00', ['instagram'], 'Carousel', 'The automation teardown (comment TEARDOWN)'],
  [2, '10:00', ['twitter', 'linkedin'], 'Newsletter', 'Issue #42: the weekly agent review'],
  [3, '09:00', ['instagram', 'tiktok', 'youtube'], 'Short', 'What G-Brain remembers so I do not have to'],
  [4, '18:00', ['youtube'], 'Video', 'Q&A: running clients with agents'],
  [5, '09:00', ['instagram'], 'Reel', 'Cohort doors open: what you build in 6 weeks'],
  [7, '09:00', ['tiktok', 'instagram'], 'Reel', 'Speed-to-lead: 60 seconds or lose it'],
  [8, '12:30', ['linkedin'], 'Post', 'Hiring my first human after 9 agents'],
  [9, '09:00', ['instagram'], 'Carousel', 'The operator stack, layer by layer'],
  [10, '08:00', ['twitter'], 'Thread', 'How the conductor routes a broadcast'],
  [12, '18:00', ['youtube'], 'Video', 'Full build: missed-call text-back'],
];

const dayKey = (ms: number) => new Date(ms).toISOString().slice(0, 10);

export function demoCalendar(now = Date.now()): DemoCalendarPost[] {
  const today = Date.UTC(new Date(now).getUTCFullYear(), new Date(now).getUTCMonth(), new Date(now).getUTCDate());
  return PLAN.map(([offset, time, platforms, format, title], i) => ({
    id: `demo-post-${i}`,
    date: dayKey(today + offset * DAY),
    time,
    platforms,
    format,
    title,
    status: offset < 0 ? 'published' : offset === 0 && time < '12:00' ? 'published' : offset <= 5 ? 'scheduled' : 'draft',
  }));
}

/** Published history as Zernio post-days (powers the posting charts). Adds an
    older steady cadence so 30/90-day charts are not empty on the left. */
export function demoPostDays(now = Date.now()): ZernioPostDay[] {
  const today = Date.UTC(new Date(now).getUTCFullYear(), new Date(now).getUTCMonth(), new Date(now).getUTCDate());
  const days: ZernioPostDay[] = demoCalendar(now)
    .filter((p) => p.status === 'published')
    .map((p) => ({ date: p.date, platforms: p.platforms }));
  const rota = [['instagram', 'tiktok'], ['linkedin'], ['youtube'], ['instagram'], ['twitter'], ['tiktok', 'instagram']];
  for (let d = 14; d < 90; d++) {
    if (d % 7 === 6) continue; // a rest day each week
    days.push({ date: dayKey(today - d * DAY), platforms: rota[d % rota.length] });
  }
  return days;
}

export function demoRecentPosts(limit: number, now = Date.now()): ZernioPost[] {
  return demoCalendar(now)
    .filter((p) => p.status === 'published')
    .reverse()
    .slice(0, limit)
    .map((p) => ({
      platform: p.platforms[0],
      caption: `${p.format} · ${p.title}`,
      url: '',
      publishedAt: `${p.date}T${p.time}:00.000Z`,
      status: 'published',
    }));
}
