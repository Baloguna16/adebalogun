import { DirectoryList, DirectoryEntry } from '../../base/DirectoryList';

const entries: DirectoryEntry[] = [
  {
    href: '/tools/markdown-viewer',
    title: 'Markdown Viewer',
    description: 'Paste Markdown and preview it rendered in real time.',
    date: '2026-03',
  },
  {
    href: '/tools/wedding-budget',
    title: 'Wedding Budget Planner',
    description: 'Plan and compare wedding budget scenarios with CT cost estimates for a 300-guest celebration.',
    date: '2026-04',
  },
  {
    href: '/tools/rickroll',
    title: 'Rickroll Link Generator',
    description: 'Generate disguised links that redirect to a surprise.',
    date: '2026-04',
  },
];

export const ToolsIndex = () => (
  <DirectoryList heading="Tools" entries={entries} />
);
