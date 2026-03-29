# Research Pages — Design Spec

## Overview

Add a hidden `/research` section to adebalogun.com that renders research `.md` files from `~/Documents/Research/` as formatted, searchable pages with pre-generated audio playback via OpenAI TTS.

## Requirements

- **Hidden route**: `/research` is not linked from the navbar or any public page. Accessible only by typing the URL directly.
- **Auto-sync at build time**: A build script scans `~/Documents/Research/*.md`, copies files into the project, infers categories, generates audio, and produces a manifest.
- **Auto-categorization**: Categories are inferred from filename prefixes. No manual tagging.
- **Search**: A text search bar on the index page filters papers by title and description.
- **Audio playback**: Each paper has a pre-generated `.mp3` from OpenAI TTS with a custom audio player (play/pause, progress bar, speed controls).
- **Design**: Matches the existing site design system exactly — Space Mono headings, Open Sans body, flat cards, primary color adaptive (`#5D3FD3` light / `#08FF00` dark), `maxWidth="sm"` container.

## Routes

| Route | Component | Description |
|---|---|---|
| `/research` | `ResearchIndex` | Searchable, category-grouped list of all papers |
| `/research/:slug` | `ResearchPaper` | Individual paper with audio player + rendered markdown |

Both routes are lazy-loaded via `React.lazy`, consistent with the existing router pattern in `App.tsx`. Neither route is linked from the navbar, footer, or any other page.

## Research Index Page (`/research`)

### Layout
- Page title: `<Typography variant="h4">` in Space Mono — "Research"
- Paper count subtitle: `<Typography variant="subtitle1" color="textSecondary">`
- Search bar: MUI `TextField` with search icon, filters papers by title and description (case-insensitive substring match)
- Category filter pills: Row of `Chip` components. "All" pill uses `color="primary"` fill. Others are outlined. Clicking a category filters the list. Active category gets primary fill.
- Category sections: Category name as uppercase `Typography` in primary color with `letterSpacing: 1` and `textTransform: 'uppercase'`, using Space Mono
- Paper items: Flat, no card wrapper. Title in Space Mono + primary color (`variant="h6"`, `fontWeight="bold"`, `color="primary"`). Description snippet in `variant="body2"` + `color="textSecondary"`. Meta line: date, read time, audio indicator. Separated by `<Divider>`.

### Behavior
- On mount, fetches `/research/manifest.json`
- Search filters across all categories in real-time
- Category pills filter to a single category (or "All")
- Search + category filter are combinable
- Clicking a paper navigates to `/research/:slug`

## Research Paper Page (`/research/:slug`)

### Layout
- Back link: `← Back to Research` in primary color, navigates to `/research`
- Category tag: Uppercase Space Mono in primary color
- Title: `<Typography variant="h4">` in Space Mono
- Meta: Date + read time in `textSecondary`
- Audio player (see below)
- Markdown content: Rendered via `react-markdown` with `remark-gfm`, using the same syntax highlighting setup as the existing Markdown Viewer (`react-syntax-highlighter` with Prism, `oneDark`/`oneLight` themes)

### Audio Player Component
- Container: Subtle background (`action.hover`), 4px border-radius, 1px border
- Play/pause button: 36px circle in primary color, white/dark icon
- Progress bar: 4px height, `divider` color background, primary color fill
- Time display: `0:00 / 14:32` in Space Mono, `textSecondary` color
- Speed controls: Row of small buttons — 0.5x, 1x, 1.5x, 2x. Active speed gets primary color border + subtle primary background
- Uses native `<audio>` element (hidden), controlled via React refs

### Behavior
- On mount, fetches the `.md` file from `/research/papers/{slug}.md` and renders it
- Audio player loads `/research/audio/{slug}.mp3` if `hasAudio` is true in manifest
- If no audio exists, the audio player section is hidden
- Play/pause toggles audio playback
- Progress bar updates in real-time via `timeupdate` event
- Clicking the progress bar seeks to that position
- Speed buttons set `audio.playbackRate`

## Build Script (`scripts/sync-research.ts`)

A single Node/TypeScript script run via `npm run sync-research`.

### Pipeline

1. **Scan**: Read all `*.md` files from `~/Documents/Research/`
2. **Parse each file**:
   - **Title**: First `# ` heading in the file, or humanized filename (strip date suffix, replace hyphens with spaces, title-case)
   - **Description**: First non-heading paragraph (first 200 characters)
   - **Category**: Inferred from filename prefix (see mapping below)
   - **Date**: Extracted from filename date suffix (e.g., `-2026-03-17.md`). Falls back to file modification time.
   - **Slug**: Filename without `.md` extension
   - **Read time**: `Math.ceil(wordCount / 200)` minutes
3. **Copy**: Copy `.md` files to `public/research/papers/`
4. **Audio generation** (skipped with `--no-audio`):
   - For each paper missing a corresponding `public/research/audio/{slug}.mp3`
   - Call OpenAI TTS API: model `tts-1`, voice `alloy` (configurable)
   - OpenAI TTS has a 4096-character input limit per request. For longer papers, split the markdown into chunks at paragraph boundaries, generate audio for each chunk, and concatenate the resulting MP3 files using simple buffer concatenation.
   - Save to `public/research/audio/{slug}.mp3`
   - Requires `OPENAI_API_KEY` environment variable
5. **Manifest**: Write `public/research/manifest.json`

### Category Mapping (filename prefix → category)

| Prefix pattern | Category |
|---|---|
| `anvil-*`, `swppp-*`, `compliance-*`, `stormwater-*`, `nyc-metro-stormwater-*`, `water-engineering-*` | Project Anvil |
| `ai-*`, `ai_*` | AI Infrastructure |
| `raspberry-pi-*`, `openai-codex-cli-on-raspberry-*` | Hardware |
| `wedding-*`, `dual-ceremony-*` | Planning |
| `instagram-*` | Growth |
| `system-decomposition-*` | Systems Engineering |
| `secure-*` | Security |
| Everything else | Other |

### Manifest Schema

```json
{
  "generatedAt": "2026-03-28T00:00:00Z",
  "papers": [
    {
      "slug": "ai-infra-value-capture-brief",
      "title": "AI Infra Value Capture Brief",
      "description": "Bottoms-up value capture model: $0.34 GPU, $0.15 construction per $1 capex",
      "category": "AI Infrastructure",
      "date": "2026-03-17",
      "readTimeMinutes": 12,
      "hasAudio": true,
      "audioFile": "audio/ai-infra-value-capture-brief.mp3"
    }
  ],
  "categories": ["AI Infrastructure", "Project Anvil", "Hardware", "Planning", "Growth", "Systems Engineering", "Security", "Other"]
}
```

### npm script

```json
{
  "sync-research": "npx tsx scripts/sync-research.ts",
  "sync-research:no-audio": "npx tsx scripts/sync-research.ts --no-audio"
}
```

`tsx` is used over `ts-node` as it requires zero configuration and handles ESM/CJS resolution automatically. It's invoked via `npx` so no global install is needed.

## File Structure (new files)

```
scripts/
  sync-research.ts              # Build script

public/research/
  manifest.json                 # Generated manifest
  papers/                       # Copied .md files
    ai-infra-value-capture-brief.md
    ...
  audio/                        # Generated .mp3 files
    ai-infra-value-capture-brief.mp3
    ...

src/views/research/
  ResearchIndex.tsx             # Index page component
  ResearchPaper.tsx             # Paper view component
  AudioPlayer.tsx               # Audio player component
  types.ts                      # TypeScript types (Paper, Manifest)
```

## Dependencies (new)

- `openai` — npm package for TTS API calls in the build script (devDependency)
- No new runtime dependencies. `react-markdown`, `remark-gfm`, and `react-syntax-highlighter` are already installed.

## Out of Scope

- Server-side rendering or SSR
- Authentication or password protection
- Full-text search (just substring matching on title + description)
- Editing research papers from the website
- Auto-rebuilding when research files change (manual `npm run sync-research` trigger)
