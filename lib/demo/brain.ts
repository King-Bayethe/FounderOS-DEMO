/**
 * Demo-mode G-Brain readout: a healthy sample knowledge core for the public
 * demo, used only when the gbrain CLI / database is not reachable.
 */
import type { BrainOverview } from '@/lib/connectors/gbrain';

export const DEMO_BRAIN_FOLDERS = [
  { name: 'clients', files: 214 },
  { name: 'content', files: 318 },
  { name: 'meetings', files: 196 },
  { name: 'offers', files: 42 },
  { name: 'people', files: 187 },
  { name: 'research', files: 141 },
  { name: 'sops', files: 96 },
  { name: 'strategy', files: 90 },
];

export function demoBrainOverview(storePath: string, realFiles = 0): BrainOverview {
  const folders = realFiles > 0 ? null : DEMO_BRAIN_FOLDERS;
  return {
    store: {
      path: storePath,
      totalFiles: folders ? folders.reduce((s, f) => s + f.files, 0) : realFiles,
      folders: folders ?? [],
    },
    doctor: {
      connected: true,
      status: 'demo',
      healthScore: 92,
      checks: [
        { name: 'connection', status: 'ok', message: 'Sample database reachable (demo)' },
        { name: 'embeddings', status: 'ok', message: '1,284 / 1,284 pages embedded' },
        { name: 'hybrid_search', status: 'ok', message: 'Keyword + vector search verified' },
        { name: 'freshness', status: 'warn', message: '3 notes not updated in 60+ days' },
        { name: 'links', status: 'ok', message: '0 broken wikilinks' },
        { name: 'storage', status: 'ok', message: '38 MB of 500 MB used' },
      ],
      detail: 'gbrain demo · health 92/100 (sample data)',
    },
  };
}
