# Rickroll Link Generator — Design Spec

## Overview

A tool on adebalogun.me that generates disguised links (like `adebalogun.me/r/free-pizza`) that all secretly redirect to Rick Astley's "Never Gonna Give You Up" on YouTube. Two components: a generator UI for creating/copying links, and a redirect page that shows a fake loading screen before the rickroll.

## Pages

### 1. Generator (`/tools/rickroll`)

Standard tools page using MUI + site theme, listed on the `/tools` index page.

**UI elements:**
- Text input for custom slug (placeholder: "free-pizza")
- "Random" button next to the input — fills it with a random 6-character alphanumeric string
- Live preview below showing the full URL: `adebalogun.me/r/{slug}`
- "Copy Link" button — copies full URL to clipboard, shows brief "Copied!" feedback

**No storage, no backend.** The generator just builds a URL string for the user to copy.

### 2. Redirect Page (`/r/:slug`)

**Standalone page** — no site navbar/footer (same pattern as `/donate`). Route lives outside `AppProviderLayout`.

**Fake loading screen (~3 seconds):**
- Clean white page, centered content
- Spinner animation
- Text: "Redirecting you to your content..."
- Looks like a generic link shortener loading page
- After ~3 seconds, redirects via `window.location.href` to `https://www.youtube.com/watch?v=dQw4w9WgXcQ`

**The `:slug` parameter is completely ignored** — every `/r/*` URL does the same thing. The slug exists solely to make URLs look legitimate.

## Route Changes in App.tsx

- Add `/tools/rickroll` inside `AppProviderLayout` (standard tool page)
- Add `/r/:slug` outside `AppProviderLayout` (standalone, like `/donate`)

## Tools Index Update

Add to the `tools` array in `ToolsIndex.tsx`:

```ts
{
  path: '/tools/rickroll',
  title: 'Rickroll Link Generator',
  description: 'Generate disguised links that redirect to a surprise.',
}
```

## Files

| Action | Path | Responsibility |
|--------|------|----------------|
| Create | `src/views/tools/rickroll/RickrollGenerator.tsx` | Generator form with slug input, random button, copy link |
| Create | `src/views/tools/rickroll/index.tsx` | Barrel export |
| Create | `src/views/rickroll-redirect/RickrollRedirect.tsx` | Fake loading screen + redirect |
| Create | `src/views/rickroll-redirect/RickrollRedirect.css` | Loading screen styles (standalone, no MUI) |
| Create | `src/views/rickroll-redirect/index.tsx` | Barrel export |
| Modify | `src/App.tsx` | Add both routes |
| Modify | `src/views/tools/ToolsIndex.tsx` | Add rickroll to tools list |

## Technical Notes

- Generator uses MUI components (TextField, Button, Typography, Container) to match existing tools
- Redirect page is pure HTML/CSS (no MUI) — standalone like the donate page
- Random slug: 6 chars from `[a-zA-Z0-9]` via `Math.random`
- Copy to clipboard via `navigator.clipboard.writeText()`
- Redirect delay: `setTimeout(() => { window.location.href = '...' }, 3000)`
- The redirect page should work whether the slug is `r/abc` or `r/my-cool-article` — wildcard match
