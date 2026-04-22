# Rickroll Link Generator — Design Spec

## Overview

A tool on adebalogun.me that generates disguised links (like `adebalogun.me/r/free-pizza`) that all secretly redirect to Rick Astley's "Never Gonna Give You Up" on YouTube. Three components: a generator UI for creating/copying links, a redirect page with a fake loading screen, and nginx-level Open Graph tag injection so link previews in iMessage/Slack/Discord show a convincing title and thumbnail.

## Pages

### 1. Generator (`/tools/rickroll`)

Standard tools page using MUI + site theme, listed on the `/tools` index page.

**UI elements:**
- Text input for custom slug (placeholder: "free-pizza")
- "Random" button next to the input — fills it with a random 6-character alphanumeric string
- Title input (optional, placeholder: "Free Concert Tickets Giveaway") — sets the link preview title
- Image URL input (optional, placeholder: "https://example.com/image.jpg") — sets the link preview thumbnail
- Live preview below showing the full URL: `adebalogun.me/r/{slug}?t={title}&img={imageUrl}`
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

### 3. Open Graph Tag Injection (nginx)

Link preview crawlers (iMessage, Slack, Discord, Twitter) need to see OG tags in the raw HTML before JavaScript runs. Since this is an SPA, nginx handles the injection server-side.

**How links are encoded:**

The generator encodes title and image URL as query params:
```
adebalogun.me/r/free-tix?t=Free+Concert+Tickets&img=https://example.com/photo.jpg
```

Both params are optional. If omitted, no OG tags are injected and the page renders normally.

**How injection works:**

1. Add a placeholder comment `<!-- OG_TAGS -->` to `public/index.html`
2. In `nginx.conf`, add a `location /r/` block that uses an njs script to:
   - Read the `t` and `img` query params from the request
   - Build the OG meta tag string: `<meta property="og:title" content="...">`, `<meta property="og:image" content="...">`, `<meta property="og:type" content="article">`
   - Replace `<!-- OG_TAGS -->` in the served `index.html` with the built meta tags
3. If no query params are present, serve `index.html` as-is (placeholder comment stays, no effect)
4. The page still loads React normally for real users — they see the fake loading screen then get redirected

**nginx njs module:**
- Requires `nginx-module-njs` (available in `nginx:alpine` via `apk add nginx-module-njs`)
- Small inline script (~15 lines) that reads args and does string replacement
- Alternative: use `njs_set` to build meta tags, then `sub_filter` to inject them

**Dockerfile change:**
- Switch from `nginx:alpine` to installing njs module: `RUN apk add --no-cache nginx-module-njs`
- Or use `nginx:alpine` with the njs module pre-installed via `load_module`

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
| Create | `src/views/tools/rickroll/RickrollGenerator.tsx` | Generator form with slug, title, image URL inputs, random button, copy link |
| Create | `src/views/tools/rickroll/index.tsx` | Barrel export |
| Create | `src/views/rickroll-redirect/RickrollRedirect.tsx` | Fake loading screen + redirect |
| Create | `src/views/rickroll-redirect/RickrollRedirect.css` | Loading screen styles (standalone, no MUI) |
| Create | `src/views/rickroll-redirect/index.tsx` | Barrel export |
| Create | `nginx/og_inject.js` | njs script to read query params and build OG meta tags |
| Modify | `src/App.tsx` | Add both routes |
| Modify | `src/views/tools/ToolsIndex.tsx` | Add rickroll to tools list |
| Modify | `public/index.html` | Add `<!-- OG_TAGS -->` placeholder in `<head>` |
| Modify | `nginx/nginx.conf` | Add `/r/` location block with njs OG injection |
| Modify | `Dockerfile` | Add njs module installation |

## Technical Notes

- Generator uses MUI components (TextField, Button, Typography, Container) to match existing tools
- Redirect page is pure HTML/CSS (no MUI) — standalone like the donate page
- Random slug: 6 chars from `[a-zA-Z0-9]` via `Math.random`
- Copy to clipboard via `navigator.clipboard.writeText()`
- Redirect delay: `setTimeout(() => { window.location.href = '...' }, 3000)`
- The redirect page should work whether the slug is `r/abc` or `r/my-cool-article` — wildcard match
- Query params (`t`, `img`) are URL-encoded by the generator and decoded by the njs script
- OG tags only appear in the HTML served by nginx — React doesn't need to know about them
- Security: njs script must HTML-escape the query param values before injecting into the HTML to prevent XSS
