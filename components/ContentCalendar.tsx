/**
 * Two-week content calendar: this week and next, one column per day on wide
 * screens, a day-by-day list on phones. Server component, no handlers.
 */
import type { DemoCalendarPost } from '@/lib/demo/content';
import { PLATFORM_COLORS, PLATFORM_LABELS } from '@/lib/social';
import type { SocialPlatform } from '@/lib/schemas';

const STATUS_CLASS: Record<DemoCalendarPost['status'], string> = {
  published: 'text-os-ok',
  scheduled: 'text-os-accent',
  draft: 'text-os-dim',
};

const DAY = 86_400_000;

function mondayOf(nowMs: number): number {
  const d = new Date(nowMs);
  const day0 = Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
  const dow = (new Date(day0).getUTCDay() + 6) % 7; // Monday = 0
  return day0 - dow * DAY;
}

export function ContentCalendar({ posts, nowMs }: { posts: DemoCalendarPost[]; nowMs: number }) {
  const start = mondayOf(nowMs);
  const todayKey = new Date(nowMs).toISOString().slice(0, 10);
  const days = Array.from({ length: 14 }, (_, i) => {
    const ms = start + i * DAY;
    const key = new Date(ms).toISOString().slice(0, 10);
    return {
      key,
      label: new Date(ms).toLocaleDateString('en-US', { weekday: 'short', timeZone: 'UTC' }),
      num: new Date(ms).getUTCDate(),
      month: new Date(ms).toLocaleDateString('en-US', { month: 'short', timeZone: 'UTC' }),
      posts: posts.filter((p) => p.date === key).sort((a, b) => a.time.localeCompare(b.time)),
    };
  });

  return (
    <div className="grid grid-cols-1 gap-2 md:grid-cols-7">
      {days.map((d) => {
        const isToday = d.key === todayKey;
        return (
          <div
            key={d.key}
            className={`min-w-0 rounded-lg-t border bg-os-surface p-2 md:min-h-[132px] ${
              isToday ? 'border-[var(--accent-line)]' : 'border-os-border'
            } ${d.posts.length === 0 ? 'max-md:hidden' : ''}`}
          >
            <div className="mb-1.5 flex items-baseline justify-between font-mono text-[10px] uppercase tracking-[0.12em]">
              <span className={isToday ? 'text-os-accent' : 'text-os-dim'}>
                {d.label} {d.num}
                <span className="md:hidden"> {d.month}</span>
              </span>
              {isToday && <span className="text-os-accent">today</span>}
            </div>
            <ul className="flex flex-col gap-1.5">
              {d.posts.map((p) => (
                <li key={p.id} className="rounded-sm-t border border-os-border bg-os-surface2 px-2 py-1.5">
                  <div className="flex items-center justify-between gap-1 font-mono text-[9px] uppercase tracking-[0.08em]">
                    <span className="text-os-muted">
                      {p.time} · {p.format}
                    </span>
                    <span className={STATUS_CLASS[p.status]}>{p.status}</span>
                  </div>
                  <div className="mt-1 line-clamp-2 text-[11.5px] leading-snug [text-wrap:pretty]">{p.title}</div>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {p.platforms.map((pl) => (
                      <span
                        key={pl}
                        title={PLATFORM_LABELS[pl as SocialPlatform] ?? pl}
                        className="inline-flex items-center gap-1 font-mono text-[8.5px] uppercase text-os-dim"
                      >
                        <span
                          className="inline-block h-1.5 w-1.5"
                          style={{ background: PLATFORM_COLORS[pl as SocialPlatform] ?? 'var(--dim)' }}
                        />
                        {(PLATFORM_LABELS[pl as SocialPlatform] ?? pl).slice(0, 2)}
                      </span>
                    ))}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        );
      })}
    </div>
  );
}
