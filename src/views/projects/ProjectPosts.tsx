import { DirectoryList, DirectoryEntry } from '../../base/DirectoryList';

const entries: DirectoryEntry[] = [
  {
    href: '/projects/travel-map',
    title: 'Travel Map',
    date: '2026-06',
    external: false,
  },
  {
    href: '/projects/kitchelin',
    title: 'Kitchelin — AI Cooking Assistant',
    date: '2025-05',
    external: false,
  },
  {
    href: '/projects/gyn-onc-fellowships',
    title: 'ACGME Gynecologic Oncology Fellowship Map',
    date: '2026-03',
    external: false,
  },
  {
    href: '/projects/hubbub',
    title: 'Hubbub — Rental marketplace',
    date: '2022-12',
    external: false,
  },
  {
    href: '/documents/pr-cultivation-io-2021.pdf',
    title: 'Modelling input-output relationships to optimize production of a live-attenuated malaria vaccine',
    date: '2021-10',
    external: true,
  },
];

export const ProjectPosts = () => (
  <DirectoryList heading="Projects" entries={entries} />
);
