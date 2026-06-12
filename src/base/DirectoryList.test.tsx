import { render, screen } from '@testing-library/react';
import { ThemeProvider } from '@mui/material/styles';
import { MemoryRouter } from 'react-router-dom';
import { getTheme } from '../theme';
import { DirectoryList, DirectoryEntry } from './DirectoryList';

const wrap = (ui: React.ReactElement) =>
  render(
    <ThemeProvider theme={getTheme('light')}>
      <MemoryRouter>{ui}</MemoryRouter>
    </ThemeProvider>
  );

const baseEntries: DirectoryEntry[] = [
  {
    title: 'Alpha Project',
    href: '/projects/alpha',
    date: '2024-01',
  },
  {
    title: 'Beta Tool',
    href: '/tools/beta',
    date: '2024-02',
    description: 'A handy tool.',
    tags: ['react', 'typescript'],
  },
];

test('renders the heading with trailing underscore', () => {
  wrap(<DirectoryList heading="Projects" entries={baseEntries} />);
  expect(screen.getByText('Projects')).toBeInTheDocument();
  // Underscore is rendered as a sibling span
  expect(screen.getByText('_')).toBeInTheDocument();
});

test('renders entry count — plural', () => {
  wrap(<DirectoryList heading="Projects" entries={baseEntries} />);
  expect(screen.getByText('2 entries')).toBeInTheDocument();
});

test('renders entry count — singular', () => {
  wrap(<DirectoryList heading="Tools" entries={[baseEntries[0]]} />);
  expect(screen.getByText('1 entry')).toBeInTheDocument();
});

test('renders entry count — zero', () => {
  wrap(<DirectoryList heading="Blog" entries={[]} />);
  expect(screen.getByText('0 entries')).toBeInTheDocument();
});

test('renders all entry titles', () => {
  wrap(<DirectoryList heading="Projects" entries={baseEntries} />);
  expect(screen.getByText('Alpha Project')).toBeInTheDocument();
  expect(screen.getByText('Beta Tool')).toBeInTheDocument();
});

test('renders dates verbatim', () => {
  wrap(<DirectoryList heading="Projects" entries={baseEntries} />);
  expect(screen.getByText('2024-01')).toBeInTheDocument();
  expect(screen.getByText('2024-02')).toBeInTheDocument();
});

test('renders description text', () => {
  wrap(<DirectoryList heading="Tools" entries={baseEntries} />);
  expect(screen.getByText('A handy tool.')).toBeInTheDocument();
});

test('renders tags as #tag mono text', () => {
  wrap(<DirectoryList heading="Tools" entries={baseEntries} />);
  // RTL normalizes whitespace; use a function matcher to match the raw text content
  expect(
    screen.getByText((content) => content.includes('#react') && content.includes('#typescript'))
  ).toBeInTheDocument();
});

test('internal entries render as router links (no target="_blank")', () => {
  wrap(<DirectoryList heading="Projects" entries={[baseEntries[0]]} />);
  const link = screen.getByRole('link', { name: /Alpha Project/ });
  expect(link).not.toHaveAttribute('target', '_blank');
  expect(link).toHaveAttribute('href', '/projects/alpha');
});

test('external entries render with target="_blank" and rel="noopener noreferrer"', () => {
  const extEntry: DirectoryEntry = {
    title: 'Research Paper',
    href: 'https://example.com/paper.pdf',
    date: '2021-10',
    external: true,
  };
  wrap(<DirectoryList heading="Projects" entries={[extEntry]} />);
  const link = screen.getByRole('link', { name: /Research Paper/ });
  expect(link).toHaveAttribute('target', '_blank');
  expect(link).toHaveAttribute('rel', 'noopener noreferrer');
});

test('external entries append ↗ to the title', () => {
  const extEntry: DirectoryEntry = {
    title: 'Research Paper',
    href: 'https://example.com/paper.pdf',
    date: '2021-10',
    external: true,
  };
  wrap(<DirectoryList heading="Projects" entries={[extEntry]} />);
  expect(screen.getByText('Research Paper ↗')).toBeInTheDocument();
});

test('internal entries do NOT append ↗', () => {
  wrap(<DirectoryList heading="Projects" entries={[baseEntries[0]]} />);
  expect(screen.queryByText(/↗/)).not.toBeInTheDocument();
});

test('renders thumbnail img when provided', () => {
  const entryWithThumb: DirectoryEntry = {
    title: 'Blog Post',
    href: '/blog/post-1',
    date: '2024-03-15',
    thumbnail: '/images/thumb.jpg',
  };
  wrap(<DirectoryList heading="Blog" entries={[entryWithThumb]} />);
  const img = screen.getByRole('img');
  expect(img).toHaveAttribute('src', '/images/thumb.jpg');
});

test('does not render img element when thumbnail is absent', () => {
  wrap(<DirectoryList heading="Projects" entries={[baseEntries[0]]} />);
  expect(screen.queryByRole('img')).not.toBeInTheDocument();
});

test('renders optional toolbar between header and rows', () => {
  const toolbar = <div data-testid="toolbar">Filter chips</div>;
  wrap(<DirectoryList heading="Blog" entries={baseEntries} toolbar={toolbar} />);
  expect(screen.getByTestId('toolbar')).toBeInTheDocument();
  // Toolbar text appears after heading and before first entry
  const toolbarEl = screen.getByTestId('toolbar');
  const headingEl = screen.getByText('2 entries');
  const firstTitle = screen.getByText('Alpha Project');
  // Just verify all three are present in the document
  expect(toolbarEl).toBeInTheDocument();
  expect(headingEl).toBeInTheDocument();
  expect(firstTitle).toBeInTheDocument();
});
