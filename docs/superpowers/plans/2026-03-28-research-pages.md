# Research Pages Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a hidden `/research` section that renders markdown research files as searchable, categorized pages with pre-generated audio playback.

**Architecture:** A Node build script (`scripts/sync-research.mjs`) scans `~/Documents/Research/*.md`, copies them to `public/research/papers/`, generates audio via OpenAI TTS, and writes a `manifest.json`. Two React components (`ResearchIndex`, `ResearchPaper`) consume the manifest and render the UI. An `AudioPlayer` component wraps a native `<audio>` element with custom controls.

**Tech Stack:** React 18, MUI 5, React Router 6, react-markdown, remark-gfm, react-syntax-highlighter, OpenAI TTS API (tts-1), Node.js (ESM script)

**Spec:** `docs/superpowers/specs/2026-03-28-research-pages-design.md`

---

### Task 1: TypeScript Types

**Files:**
- Create: `src/views/research/types.ts`

- [ ] **Step 1: Create the types file**

```ts
export interface Paper {
  slug: string;
  title: string;
  description: string;
  category: string;
  date: string;
  readTimeMinutes: number;
  hasAudio: boolean;
  audioFile: string;
}

export interface ResearchManifest {
  generatedAt: string;
  papers: Paper[];
  categories: string[];
}
```

- [ ] **Step 2: Commit**

```bash
git add src/views/research/types.ts
git commit -m "feat(research): add Paper and ResearchManifest types"
```

---

### Task 2: Build Script

**Files:**
- Create: `scripts/sync-research.mjs`

This is a standalone Node ESM script (`.mjs`) that runs outside the CRA build. It does not use TypeScript because the project's `tsconfig.json` only includes `src/`.

- [ ] **Step 1: Create the sync script**

```js
#!/usr/bin/env node

/**
 * sync-research.mjs
 *
 * Scans ~/Documents/Research/*.md, copies to public/research/papers/,
 * generates audio via OpenAI TTS, writes public/research/manifest.json.
 *
 * Usage:
 *   node scripts/sync-research.mjs              # full sync with audio
 *   node scripts/sync-research.mjs --no-audio   # skip audio generation
 */

import { readdir, readFile, writeFile, mkdir, copyFile, stat } from 'fs/promises';
import { existsSync } from 'fs';
import { join, basename } from 'path';
import { homedir } from 'os';

const RESEARCH_DIR = join(homedir(), 'Documents', 'Research');
const PUBLIC_DIR = join(process.cwd(), 'public', 'research');
const PAPERS_DIR = join(PUBLIC_DIR, 'papers');
const AUDIO_DIR = join(PUBLIC_DIR, 'audio');
const MANIFEST_PATH = join(PUBLIC_DIR, 'manifest.json');
const NO_AUDIO = process.argv.includes('--no-audio');

// --- Category inference from filename prefix ---

const CATEGORY_RULES = [
  { patterns: ['anvil', 'swppp', 'compliance', 'stormwater', 'nyc-metro-stormwater', 'water-engineering'], category: 'Project Anvil' },
  { patterns: ['ai-', 'ai_'], category: 'AI Infrastructure' },
  { patterns: ['raspberry-pi', 'openai-codex-cli-on-raspberry'], category: 'Hardware' },
  { patterns: ['wedding', 'dual-ceremony'], category: 'Planning' },
  { patterns: ['instagram'], category: 'Growth' },
  { patterns: ['system-decomposition'], category: 'Systems Engineering' },
  { patterns: ['secure-'], category: 'Security' },
];

function inferCategory(filename) {
  const lower = filename.toLowerCase();
  for (const rule of CATEGORY_RULES) {
    if (rule.patterns.some(p => lower.startsWith(p))) {
      return rule.category;
    }
  }
  // Auto-generated files (2026-03-26-NNNN-...) — try to match on content keywords in filename
  for (const rule of CATEGORY_RULES) {
    if (rule.patterns.some(p => lower.includes(p))) {
      return rule.category;
    }
  }
  return 'Other';
}

// --- Parse date from filename suffix or fall back to mtime ---

function extractDate(filename, fileStat) {
  // Match patterns like -2026-03-17.md or 2026-03-26-0003-...
  const isoMatch = filename.match(/(\d{4}-\d{2}-\d{2})/);
  if (isoMatch) return isoMatch[1];
  return fileStat.mtime.toISOString().split('T')[0];
}

// --- Parse title and description from markdown content ---

function parseMarkdown(content) {
  const lines = content.split('\n');

  // Title: first H1 heading
  let title = '';
  for (const line of lines) {
    const h1Match = line.match(/^#\s+(.+)/);
    if (h1Match) {
      title = h1Match[1].trim();
      break;
    }
  }

  // Description: first non-empty paragraph that isn't a heading or metadata
  let description = '';
  let pastFirstHeading = false;
  for (const line of lines) {
    if (line.startsWith('#')) {
      pastFirstHeading = true;
      continue;
    }
    if (!pastFirstHeading) continue;
    const trimmed = line.trim();
    // Skip metadata lines (Date:, Prepared for:, Classification:, ---)
    if (!trimmed || trimmed.startsWith('---') || /^(Date|Prepared for|Classification|Source):/i.test(trimmed)) continue;
    // Skip lines that are just bold labels like **Date:**
    if (/^\*\*\w+:\*\*/.test(trimmed)) continue;
    description = trimmed.replace(/[*_`#]/g, '').slice(0, 200);
    break;
  }

  const wordCount = content.split(/\s+/).filter(Boolean).length;
  const readTimeMinutes = Math.max(1, Math.ceil(wordCount / 200));

  return { title, description, readTimeMinutes };
}

// --- Humanize filename as fallback title ---

function humanizeFilename(filename) {
  return filename
    .replace(/\.md$/, '')
    .replace(/\d{4}-\d{2}-\d{2}(-\d{4})?-?/, '') // strip date prefix/suffix
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase())
    .trim();
}

// --- OpenAI TTS ---

const TTS_CHUNK_LIMIT = 4096;

async function generateAudio(text, outputPath) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    console.warn('  ⚠ OPENAI_API_KEY not set, skipping audio generation');
    return false;
  }

  // Strip markdown syntax for cleaner audio
  const cleanText = text
    .replace(/^#{1,6}\s+/gm, '') // headings
    .replace(/\*\*(.+?)\*\*/g, '$1') // bold
    .replace(/\*(.+?)\*/g, '$1') // italic
    .replace(/`{1,3}[^`]*`{1,3}/g, '') // code
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // links
    .replace(/^\s*[-*]\s+/gm, '') // list markers
    .replace(/^\s*\d+\.\s+/gm, '') // numbered lists
    .replace(/\|[^\n]+\|/g, '') // tables
    .replace(/^---+$/gm, '') // horizontal rules
    .replace(/\n{3,}/g, '\n\n')
    .trim();

  // Split into chunks at paragraph boundaries
  const paragraphs = cleanText.split(/\n\n+/);
  const chunks = [];
  let current = '';

  for (const para of paragraphs) {
    if ((current + '\n\n' + para).length > TTS_CHUNK_LIMIT && current) {
      chunks.push(current.trim());
      current = para;
    } else {
      current = current ? current + '\n\n' + para : para;
    }
  }
  if (current.trim()) chunks.push(current.trim());

  if (chunks.length === 0) return false;

  const audioBuffers = [];

  for (let i = 0; i < chunks.length; i++) {
    console.log(`    Chunk ${i + 1}/${chunks.length} (${chunks[i].length} chars)`);
    const response = await fetch('https://api.openai.com/v1/audio/speech', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'tts-1',
        voice: 'alloy',
        input: chunks[i],
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error(`    ✗ TTS API error: ${response.status} ${err}`);
      return false;
    }

    const buffer = Buffer.from(await response.arrayBuffer());
    audioBuffers.push(buffer);
  }

  await writeFile(outputPath, Buffer.concat(audioBuffers));
  return true;
}

// --- Main ---

async function main() {
  console.log('Syncing research papers...');
  console.log(`Source: ${RESEARCH_DIR}`);
  console.log(`Target: ${PUBLIC_DIR}`);
  console.log(`Audio:  ${NO_AUDIO ? 'SKIPPED' : 'enabled'}\n`);

  // Ensure output dirs exist
  await mkdir(PAPERS_DIR, { recursive: true });
  await mkdir(AUDIO_DIR, { recursive: true });

  // Scan for .md files
  const files = (await readdir(RESEARCH_DIR))
    .filter(f => f.endsWith('.md'))
    .sort();

  console.log(`Found ${files.length} markdown files\n`);

  const papers = [];
  const categorySet = new Set();

  for (const file of files) {
    const srcPath = join(RESEARCH_DIR, file);
    const slug = file.replace(/\.md$/, '');
    const content = await readFile(srcPath, 'utf-8');
    const fileStat = await stat(srcPath);

    const { title: parsedTitle, description, readTimeMinutes } = parseMarkdown(content);
    const title = parsedTitle || humanizeFilename(file);
    const category = inferCategory(file);
    const date = extractDate(file, fileStat);

    categorySet.add(category);

    // Copy markdown file
    const destPath = join(PAPERS_DIR, file);
    await copyFile(srcPath, destPath);

    // Audio generation
    let hasAudio = false;
    const audioPath = join(AUDIO_DIR, `${slug}.mp3`);

    if (!NO_AUDIO) {
      if (existsSync(audioPath)) {
        hasAudio = true;
        console.log(`✓ ${title} (audio exists)`);
      } else {
        console.log(`♪ ${title} (generating audio...)`);
        hasAudio = await generateAudio(content, audioPath);
        if (hasAudio) {
          console.log(`  ✓ Audio saved`);
        }
      }
    } else {
      hasAudio = existsSync(audioPath);
      console.log(`${hasAudio ? '✓' : '○'} ${title}`);
    }

    papers.push({
      slug,
      title,
      description,
      category,
      date,
      readTimeMinutes,
      hasAudio,
      audioFile: hasAudio ? `audio/${slug}.mp3` : '',
    });
  }

  // Sort papers by date descending
  papers.sort((a, b) => b.date.localeCompare(a.date));

  // Build categories array (sorted, "Other" last)
  const categories = [...categorySet].sort((a, b) => {
    if (a === 'Other') return 1;
    if (b === 'Other') return -1;
    return a.localeCompare(b);
  });

  const manifest = {
    generatedAt: new Date().toISOString(),
    papers,
    categories,
  };

  await writeFile(MANIFEST_PATH, JSON.stringify(manifest, null, 2));
  console.log(`\n✓ Manifest written with ${papers.length} papers across ${categories.length} categories`);
}

main().catch(err => {
  console.error('Sync failed:', err);
  process.exit(1);
});
```

- [ ] **Step 2: Add npm scripts to package.json**

Add to the `"scripts"` section in `package.json`:

```json
"sync-research": "node scripts/sync-research.mjs",
"sync-research:no-audio": "node scripts/sync-research.mjs --no-audio"
```

- [ ] **Step 3: Run the script in no-audio mode to verify it works**

```bash
cd /Users/adekunlebalogun/Projects/adebalogun
npm run sync-research:no-audio
```

Expected: Output listing all 57 files with categories, a `public/research/manifest.json` created, and `.md` files copied to `public/research/papers/`.

- [ ] **Step 4: Verify the manifest**

```bash
cat public/research/manifest.json | head -50
```

Expected: JSON with `generatedAt`, `papers` array with slug/title/description/category/date fields, and `categories` array.

- [ ] **Step 5: Add public/research/ to .gitignore**

Append to `.gitignore`:

```
# Generated research files
public/research/
```

These are generated artifacts — the source of truth is `~/Documents/Research/`.

- [ ] **Step 6: Commit**

```bash
git add scripts/sync-research.mjs package.json .gitignore
git commit -m "feat(research): add sync-research build script with category inference and OpenAI TTS"
```

---

### Task 3: AudioPlayer Component

**Files:**
- Create: `src/views/research/AudioPlayer.tsx`

- [ ] **Step 1: Create the AudioPlayer component**

```tsx
import { useState, useRef, useEffect, useCallback } from 'react';
import { Box, IconButton, Typography, useTheme } from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';

interface AudioPlayerProps {
  src: string;
}

const SPEEDS = [0.5, 1, 1.5, 2];

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export const AudioPlayer = ({ src }: AudioPlayerProps) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const primaryColor = theme.palette.primary.main;
  const borderColor = isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.12)';

  const audioRef = useRef<HTMLAudioElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [speed, setSpeed] = useState(1);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onTimeUpdate = () => setCurrentTime(audio.currentTime);
    const onLoadedMetadata = () => setDuration(audio.duration);
    const onEnded = () => setPlaying(false);

    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('loadedmetadata', onLoadedMetadata);
    audio.addEventListener('ended', onEnded);

    return () => {
      audio.removeEventListener('timeupdate', onTimeUpdate);
      audio.removeEventListener('loadedmetadata', onLoadedMetadata);
      audio.removeEventListener('ended', onEnded);
    };
  }, []);

  const togglePlay = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (playing) {
      audio.pause();
    } else {
      audio.play();
    }
    setPlaying(!playing);
  }, [playing]);

  const handleSeek = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const audio = audioRef.current;
    const bar = progressRef.current;
    if (!audio || !bar || !duration) return;
    const rect = bar.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    audio.currentTime = ratio * duration;
  }, [duration]);

  const handleSpeed = useCallback((s: number) => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.playbackRate = s;
    setSpeed(s);
  }, []);

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <Box
      sx={{
        bgcolor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
        borderRadius: '4px',
        p: 2,
        mb: 4,
        border: `1px solid ${borderColor}`,
      }}
    >
      <audio ref={audioRef} src={src} preload="metadata" />

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <IconButton
          onClick={togglePlay}
          sx={{
            bgcolor: primaryColor,
            color: isDark ? '#121212' : '#fff',
            width: 36,
            height: 36,
            '&:hover': { bgcolor: primaryColor, opacity: 0.85 },
          }}
        >
          {playing ? <PauseIcon fontSize="small" /> : <PlayArrowIcon fontSize="small" />}
        </IconButton>

        <Box sx={{ flex: 1 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.75 }}>
            <Typography
              variant="caption"
              sx={{ fontFamily: 'Space Mono, monospace', color: 'text.secondary' }}
            >
              Listen to this paper
            </Typography>
            <Typography
              variant="caption"
              sx={{ fontFamily: 'Space Mono, monospace', color: 'text.secondary' }}
            >
              {formatTime(currentTime)} / {formatTime(duration)}
            </Typography>
          </Box>

          <Box
            ref={progressRef}
            onClick={handleSeek}
            sx={{
              height: 4,
              borderRadius: '2px',
              bgcolor: isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.12)',
              cursor: 'pointer',
              position: 'relative',
            }}
          >
            <Box
              sx={{
                height: '100%',
                borderRadius: '2px',
                bgcolor: primaryColor,
                width: `${progress}%`,
                transition: 'width 0.1s linear',
              }}
            />
          </Box>
        </Box>
      </Box>

      <Box sx={{ display: 'flex', gap: 1, mt: 1.25, ml: '48px' }}>
        {SPEEDS.map(s => (
          <Box
            key={s}
            onClick={() => handleSpeed(s)}
            sx={{
              fontFamily: 'Space Mono, monospace',
              fontSize: '0.7rem',
              px: 0.75,
              py: 0.25,
              borderRadius: '3px',
              cursor: 'pointer',
              border: `1px solid ${s === speed ? primaryColor : borderColor}`,
              color: s === speed ? primaryColor : 'text.secondary',
              bgcolor: s === speed ? (isDark ? 'rgba(8,255,0,0.08)' : 'rgba(93,63,211,0.06)') : 'transparent',
              '&:hover': { borderColor: primaryColor },
            }}
          >
            {s}x
          </Box>
        ))}
      </Box>
    </Box>
  );
};
```

- [ ] **Step 2: Commit**

```bash
git add src/views/research/AudioPlayer.tsx
git commit -m "feat(research): add AudioPlayer component with play/pause, seek, and speed controls"
```

---

### Task 4: ResearchPaper Component (Individual Paper View)

**Files:**
- Create: `src/views/research/ResearchPaper.tsx`

- [ ] **Step 1: Create the ResearchPaper component**

```tsx
import { useState, useEffect } from 'react';
import { useParams, Link as RouterLink } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  CircularProgress,
  useTheme,
} from '@mui/material';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark, oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { AudioPlayer } from './AudioPlayer';
import type { Paper, ResearchManifest } from './types';

export const ResearchPaper = () => {
  const { slug } = useParams<{ slug: string }>();
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const primaryColor = theme.palette.primary.main;
  const borderColor = isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.12)';

  const [paper, setPaper] = useState<Paper | null>(null);
  const [markdown, setMarkdown] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [manifestRes, mdRes] = await Promise.all([
          fetch(`${process.env.PUBLIC_URL}/research/manifest.json`),
          fetch(`${process.env.PUBLIC_URL}/research/papers/${slug}.md`),
        ]);

        if (manifestRes.ok) {
          const manifest: ResearchManifest = await manifestRes.json();
          const found = manifest.papers.find(p => p.slug === slug);
          if (found) setPaper(found);
        }

        if (mdRes.ok) {
          setMarkdown(await mdRes.text());
        }
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [slug]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!paper) {
    return (
      <Container maxWidth="sm" sx={{ mt: 4 }}>
        <Typography variant="h5">Paper not found</Typography>
        <RouterLink to="/research" style={{ color: primaryColor, textDecoration: 'none' }}>
          ← Back to Research
        </RouterLink>
      </Container>
    );
  }

  return (
    <Container maxWidth="sm" sx={{ mt: 4, mb: 6 }}>
      <RouterLink
        to="/research"
        style={{ color: primaryColor, textDecoration: 'none', fontSize: '0.875rem' }}
      >
        ← Back to Research
      </RouterLink>

      <Typography
        sx={{
          fontFamily: 'Space Mono, monospace',
          fontSize: '0.75rem',
          fontWeight: 'bold',
          color: 'primary.main',
          textTransform: 'uppercase',
          letterSpacing: 1,
          mt: 3,
          mb: 1,
        }}
      >
        {paper.category}
      </Typography>

      <Typography
        variant="h4"
        sx={{ fontFamily: 'Space Mono, monospace', fontWeight: 'bold', mb: 1, lineHeight: 1.3 }}
      >
        {paper.title}
      </Typography>

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
        <Typography variant="body2" color="textSecondary">
          {new Date(paper.date + 'T00:00:00').toLocaleDateString('en-US', {
            year: 'numeric', month: 'long', day: 'numeric',
          })}
        </Typography>
        <Typography variant="body2" color="textSecondary">·</Typography>
        <Typography variant="body2" color="textSecondary">
          {paper.readTimeMinutes} min read
        </Typography>
      </Box>

      {paper.hasAudio && (
        <AudioPlayer src={`${process.env.PUBLIC_URL}/research/${paper.audioFile}`} />
      )}

      {/* Markdown content */}
      <Box
        sx={{
          fontFamily: 'Open Sans, Roboto, sans-serif',
          fontSize: '1rem',
          lineHeight: 1.7,
          color: 'text.primary',
          '& h1, & h2, & h3, & h4, & h5, & h6': {
            fontFamily: 'Space Mono, Roboto Mono, monospace',
            mt: 3,
            mb: 1,
          },
          '& h1': { fontSize: '2rem', borderBottom: `2px solid ${primaryColor}`, pb: 0.5 },
          '& h2': { fontSize: '1.5rem', borderBottom: `1px solid ${borderColor}`, pb: 0.5 },
          '& h3': { fontSize: '1.25rem' },
          '& p': { my: 1.5 },
          '& a': { color: primaryColor, textDecoration: 'none', '&:hover': { textDecoration: 'underline' } },
          '& blockquote': {
            borderLeft: `3px solid ${primaryColor}`,
            pl: 2,
            ml: 0,
            color: 'text.secondary',
            fontStyle: 'italic',
          },
          '& code': {
            fontFamily: 'Space Mono, monospace',
            fontSize: '0.85em',
            bgcolor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)',
            px: 0.75,
            py: 0.25,
            borderRadius: 0.5,
          },
          '& pre': { my: 2, borderRadius: 1, overflow: 'auto' },
          '& pre code': { bgcolor: 'transparent', p: 0 },
          '& .table-wrapper': {
            overflowX: 'auto',
            my: 2,
            borderRadius: 1,
            border: `1px solid ${borderColor}`,
          },
          '& table': { width: '100%', borderCollapse: 'collapse', minWidth: 400 },
          '& th, & td': {
            borderBottom: `1px solid ${borderColor}`,
            px: 2,
            py: 1.25,
            textAlign: 'left',
            verticalAlign: 'top',
            lineHeight: 1.6,
            fontSize: '0.9rem',
          },
          '& td:not(:last-child), & th:not(:last-child)': {
            borderRight: `1px solid ${borderColor}`,
          },
          '& th': {
            bgcolor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
            fontFamily: 'Space Mono, monospace',
            fontWeight: 600,
            fontSize: '0.85rem',
            whiteSpace: 'nowrap',
          },
          '& tr:last-child td': { borderBottom: 'none' },
          '& tr:nth-of-type(even)': {
            bgcolor: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.015)',
          },
          '& hr': { border: 'none', borderTop: `1px solid ${borderColor}`, my: 3 },
          '& img': { maxWidth: '100%', borderRadius: 1 },
          '& ul, & ol': { pl: 3 },
          '& li': { mb: 0.5 },
        }}
      >
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            table({ children }) {
              return (
                <div className="table-wrapper">
                  <table>{children}</table>
                </div>
              );
            },
            code({ node, className, children, ...props }) {
              const match = /language-(\w+)/.exec(className || '');
              const inline = !match && !String(children).includes('\n');
              return !inline && match ? (
                <SyntaxHighlighter
                  style={isDark ? oneDark : oneLight}
                  language={match[1]}
                  PreTag="div"
                  customStyle={{ margin: 0, borderRadius: 6, fontSize: '0.85rem' }}
                >
                  {String(children).replace(/\n$/, '')}
                </SyntaxHighlighter>
              ) : (
                <code className={className} {...props}>{children}</code>
              );
            },
          }}
        >
          {markdown}
        </ReactMarkdown>
      </Box>
    </Container>
  );
};
```

- [ ] **Step 2: Commit**

```bash
git add src/views/research/ResearchPaper.tsx
git commit -m "feat(research): add ResearchPaper component with markdown rendering and audio"
```

---

### Task 5: ResearchIndex Component

**Files:**
- Create: `src/views/research/ResearchIndex.tsx`

- [ ] **Step 1: Create the ResearchIndex component**

```tsx
import { useState, useEffect, useMemo } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  TextField,
  Chip,
  Divider,
  CircularProgress,
  InputAdornment,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import type { Paper, ResearchManifest } from './types';

export const ResearchIndex = () => {
  const [manifest, setManifest] = useState<ResearchManifest | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

  useEffect(() => {
    fetch(`${process.env.PUBLIC_URL}/research/manifest.json`)
      .then(res => res.json())
      .then((data: ResearchManifest) => setManifest(data))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    if (!manifest) return [];
    const query = search.toLowerCase();
    return manifest.papers.filter(p => {
      const matchesCategory = activeCategory === 'All' || p.category === activeCategory;
      const matchesSearch = !query ||
        p.title.toLowerCase().includes(query) ||
        p.description.toLowerCase().includes(query);
      return matchesCategory && matchesSearch;
    });
  }, [manifest, search, activeCategory]);

  const grouped = useMemo(() => {
    const groups: Record<string, Paper[]> = {};
    for (const paper of filtered) {
      if (!groups[paper.category]) groups[paper.category] = [];
      groups[paper.category].push(paper);
    }
    return groups;
  }, [filtered]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!manifest) {
    return (
      <Container maxWidth="sm" sx={{ mt: 4 }}>
        <Typography variant="h5">No research papers found</Typography>
        <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
          Run <code>npm run sync-research</code> to sync papers.
        </Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="sm" sx={{ mt: 4, mb: 6 }}>
      <Typography variant="h4" gutterBottom>
        Research
      </Typography>
      <Typography variant="subtitle1" color="textSecondary" sx={{ mb: 3 }}>
        {manifest.papers.length} papers across {manifest.categories.length} categories
      </Typography>

      <TextField
        fullWidth
        size="small"
        placeholder="Search papers..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon fontSize="small" sx={{ color: 'text.secondary' }} />
            </InputAdornment>
          ),
        }}
        sx={{ mb: 2.5 }}
      />

      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 3.5 }}>
        <Chip
          label={`All (${manifest.papers.length})`}
          onClick={() => setActiveCategory('All')}
          color={activeCategory === 'All' ? 'primary' : 'default'}
          variant={activeCategory === 'All' ? 'filled' : 'outlined'}
          size="small"
        />
        {manifest.categories.map(cat => (
          <Chip
            key={cat}
            label={cat}
            onClick={() => setActiveCategory(cat)}
            color={activeCategory === cat ? 'primary' : 'default'}
            variant={activeCategory === cat ? 'filled' : 'outlined'}
            size="small"
          />
        ))}
      </Box>

      {Object.entries(grouped).map(([category, papers]) => (
        <Box key={category} sx={{ mb: 3 }}>
          <Typography
            sx={{
              fontFamily: 'Space Mono, monospace',
              fontSize: '0.8rem',
              fontWeight: 'bold',
              color: 'primary.main',
              textTransform: 'uppercase',
              letterSpacing: 1,
              mb: 1.5,
            }}
          >
            {category}
          </Typography>

          {papers.map((paper, i) => (
            <Box key={paper.slug}>
              <RouterLink
                to={`/research/${paper.slug}`}
                style={{ textDecoration: 'none', color: 'inherit' }}
              >
                <Box
                  sx={{
                    py: 1.75,
                    '&:hover': { bgcolor: 'action.hover' },
                    transition: 'background-color 0.2s',
                    px: 1,
                    borderRadius: '4px',
                  }}
                >
                  <Typography variant="h6" fontWeight="bold" color="primary">
                    {paper.title}
                  </Typography>
                  {paper.description && (
                    <Typography variant="body2" color="textSecondary" sx={{ mt: 0.5 }}>
                      {paper.description}
                    </Typography>
                  )}
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mt: 1 }}>
                    <Typography variant="caption" color="textSecondary">
                      {new Date(paper.date + 'T00:00:00').toLocaleDateString('en-US', {
                        year: 'numeric', month: 'short', day: 'numeric',
                      })}
                    </Typography>
                    <Typography variant="caption" color="textSecondary">·</Typography>
                    <Typography variant="caption" color="textSecondary">
                      {paper.readTimeMinutes} min read
                    </Typography>
                    {paper.hasAudio && (
                      <>
                        <Typography variant="caption" color="textSecondary">·</Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <VolumeUpIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                          <Typography variant="caption" color="textSecondary">Audio</Typography>
                        </Box>
                      </>
                    )}
                  </Box>
                </Box>
              </RouterLink>
              {i < papers.length - 1 && <Divider />}
            </Box>
          ))}
        </Box>
      ))}

      {filtered.length === 0 && (
        <Typography variant="body2" color="textSecondary" sx={{ mt: 4, textAlign: 'center' }}>
          No papers match your search.
        </Typography>
      )}
    </Container>
  );
};
```

- [ ] **Step 2: Commit**

```bash
git add src/views/research/ResearchIndex.tsx
git commit -m "feat(research): add ResearchIndex with search and category filtering"
```

---

### Task 6: Add Routes to App.tsx

**Files:**
- Modify: `src/App.tsx`

- [ ] **Step 1: Add lazy imports**

Add after the existing lazy imports (after line 35 in `App.tsx`):

```tsx
const ResearchIndex = lazy(() => import('./views/research/ResearchIndex').then(m => ({ default: m.ResearchIndex })));
const ResearchPaper = lazy(() => import('./views/research/ResearchPaper').then(m => ({ default: m.ResearchPaper })));
```

- [ ] **Step 2: Add routes**

Add before the `<Route path="*"` catch-all route:

```tsx
    <Route path="/research" element={<ResearchIndex />} />
    <Route path="/research/:slug" element={<ResearchPaper />} />
```

- [ ] **Step 3: Verify the app compiles**

```bash
cd /Users/adekunlebalogun/Projects/adebalogun
npm start
```

Expected: App starts without errors. Navigate to `http://localhost:3000/research` and see the index page. Click a paper to see the detail view.

- [ ] **Step 4: Commit**

```bash
git add src/App.tsx
git commit -m "feat(research): add /research and /research/:slug routes"
```

---

### Task 7: Manual Smoke Test

- [ ] **Step 1: Run sync-research if not already done**

```bash
npm run sync-research:no-audio
```

- [ ] **Step 2: Start the dev server and test**

```bash
npm start
```

Verify in browser:
1. `http://localhost:3000/research` — shows index with categories, search bar, and paper list
2. Search filters papers in real-time
3. Category chips filter correctly
4. Clicking a paper navigates to `/research/{slug}`
5. Paper view shows back link, category, title, date, read time, and rendered markdown
6. Audio player section is hidden (no audio files yet)
7. `/research` is NOT linked from navbar or any other page
8. Light/dark mode toggle works correctly on both pages

- [ ] **Step 3: Test audio generation (optional, requires OPENAI_API_KEY)**

```bash
OPENAI_API_KEY=sk-... npm run sync-research
```

Then reload a paper page — the audio player should appear and be functional.
