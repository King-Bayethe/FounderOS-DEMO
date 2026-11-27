'use client';

import { usePathname } from 'next/navigation';
import { Bot, Search } from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';
import { OsMark } from '@/components/OsMark';
import { CONDUCTOR_OPEN_EVENT } from '@/components/ConductorPanel';

const SEGMENT_LABELS: Record<string, string> = {
  '': 'home',
  social: 'social',
  comms: 'comms',
  agents: 'agents',
  org: 'org-chart',
  brain: 'g-brain',
  integrations: 'connections',
  roadmap: 'roadmap',
  analytics: 'analytics',
  reference: 'reference-model',
};

export function openPalette() {
  window.dispatchEvent(new CustomEvent('alex:palette'));
}

export function Topbar({ demo = false }: { demo?: boolean }) {
  const pathname = usePathname();
  const segment = pathname.split('/')[1] ?? '';
  const here = SEGMENT_LABELS[segment] ?? segment;

  return (
    <div className="sticky top-0 z-30 flex h-[52px] shrink-0 items-center gap-3.5 border-b border-os-border bg-os-bg2/70 px-6 backdrop-blur max-md:gap-2 max-md:px-3">
      <div className="flex min-w-0 items-center gap-[7px] whitespace-nowrap font-mono text-[11px] tracking-[0.04em] text-os-dim">
        <span className="max-md:hidden">founder-os</span>
        <span className="opacity-45 max-md:hidden">/</span>
        <span className="truncate text-os-text">{here}</span>
      </div>
      <div className="ml-auto flex shrink-0 items-center gap-2.5 max-md:gap-1.5">
        {demo && (
          <span
            title="Every name, message and number here is fictional sample data"
            className="hidden whitespace-nowrap rounded-sm-t border border-dashed border-os-border-strong px-2 py-1 font-mono text-[9.5px] uppercase tracking-[0.16em] text-os-dim sm:inline-block"
          >
            demo · sample data
          </span>
        )}
        <ThemeToggle />
        <button
          onClick={openPalette}
          title="Command palette (⌘K)"
          className="grid h-[30px] w-[30px] place-items-center rounded-sm-t border border-os-border bg-os-surface text-os-muted transition-colors hover:border-os-border-strong hover:text-os-text"
        >
          <Search className="h-3.5 w-3.5" />
        </button>
        {/* the agent dock, on the far right where ⌘K used to sit — the
            Conductor answers about whatever screen you're on */}
        <button
          onClick={() => window.dispatchEvent(new CustomEvent(CONDUCTOR_OPEN_EVENT))}
          title="Ask the Conductor about this screen"
          aria-label="Open the Conductor agent panel"
          className="grid h-[30px] w-[30px] place-items-center rounded-sm-t border border-os-border bg-os-surface text-os-muted transition-colors hover:border-os-border-strong hover:text-os-accent"
        >
          <Bot className="h-3.5 w-3.5" />
        </button>
        {/* the OS mark, anchoring the brand in the top-right corner */}
        <OsMark size={26} className="ml-1 shrink-0 max-md:hidden" />
      </div>
    </div>
  );
}
