# Rickroll Link Generator — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a rickroll link generator tool and redirect page with Open Graph tag injection for convincing link previews.

**Architecture:** Generator UI at `/tools/rickroll` (MUI, inside site layout) builds URLs with encoded title/image params. Redirect page at `/r/:slug` (standalone) shows fake loading then redirects to YouTube. nginx njs module injects OG meta tags server-side so link preview crawlers see convincing titles/thumbnails.

**Tech Stack:** React 18, TypeScript, MUI, nginx njs module, Docker

**Spec:** `docs/superpowers/specs/2026-04-01-rickroll-link-generator-design.md`

---

### File Structure

| Action | Path | Responsibility |
|--------|------|----------------|
| Create | `src/views/tools/rickroll/index.tsx` | Barrel export |
| Create | `src/views/tools/rickroll/RickrollGenerator.tsx` | Generator form UI |
| Create | `src/views/rickroll-redirect/index.tsx` | Barrel export |
| Create | `src/views/rickroll-redirect/RickrollRedirect.tsx` | Fake loading + redirect |
| Create | `src/views/rickroll-redirect/RickrollRedirect.css` | Loading screen styles |
| Create | `nginx/og_inject.js` | njs script for OG tag injection |
| Modify | `src/App.tsx` | Add `/tools/rickroll` and `/r/:slug` routes |
| Modify | `src/views/tools/ToolsIndex.tsx` | Add rickroll to tools list |
| Modify | `public/index.html` | Add `<!-- OG_TAGS -->` placeholder |
| Modify | `nginx/nginx.conf` | Add `/r/` location with njs injection |
| Modify | `Dockerfile` | Install njs module |

---

### Task 1: Redirect page shell and route

**Files:**
- Create: `src/views/rickroll-redirect/index.tsx`
- Create: `src/views/rickroll-redirect/RickrollRedirect.tsx`
- Create: `src/views/rickroll-redirect/RickrollRedirect.css`
- Modify: `src/App.tsx`

- [ ] **Step 1: Create barrel export**

Create `src/views/rickroll-redirect/index.tsx`:

```tsx
export { RickrollRedirect } from './RickrollRedirect';
```

- [ ] **Step 2: Create the redirect component**

Create `src/views/rickroll-redirect/RickrollRedirect.tsx`:

```tsx
import { useEffect } from 'react';
import './RickrollRedirect.css';

const RICKROLL_URL = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';
const REDIRECT_DELAY_MS = 3000;

export const RickrollRedirect = () => {
  useEffect(() => {
    const timer = setTimeout(() => {
      window.location.href = RICKROLL_URL;
    }, REDIRECT_DELAY_MS);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="rr-page">
      <div className="rr-content">
        <div className="rr-spinner" />
        <p className="rr-text">Redirecting you to your content...</p>
      </div>
    </div>
  );
};
```

- [ ] **Step 3: Create the loading screen styles**

Create `src/views/rickroll-redirect/RickrollRedirect.css`:

```css
.rr-page {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  background: #fff;
  color: #333;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
}

.rr-content {
  text-align: center;
}

.rr-spinner {
  width: 32px;
  height: 32px;
  border: 3px solid #e0e0e0;
  border-top-color: #666;
  border-radius: 50%;
  margin: 0 auto 16px;
  animation: rr-spin 0.8s linear infinite;
}

@keyframes rr-spin {
  to {
    transform: rotate(360deg);
  }
}

.rr-text {
  font-size: 14px;
  color: #999;
  margin: 0;
}
```

- [ ] **Step 4: Add route to App.tsx**

In `src/App.tsx`, add the lazy import near the other lazy imports:

```tsx
const RickrollRedirect = lazy(() => import('./views/rickroll-redirect').then(m => ({ default: m.RickrollRedirect })));
```

Add the route outside `AppProviderLayout`, next to the `/donate` route (inside the `<>` fragment, before the `<Route element={<AppProviderLayout />}>` block):

```tsx
    <Route path="/r/:slug" element={
      <Suspense fallback={<Loading />}>
        <RickrollRedirect />
      </Suspense>
    } />
```

- [ ] **Step 5: Verify it works**

Run: `yarn start`
Open: `http://localhost:3000/r/test-link`
Expected: White page with spinner, "Redirecting you to your content...", redirects to YouTube after ~3 seconds.

- [ ] **Step 6: Commit**

```bash
git add src/views/rickroll-redirect/ src/App.tsx
git commit -m "feat: add rickroll redirect page with fake loading screen"
```

---

### Task 2: Generator page UI

**Files:**
- Create: `src/views/tools/rickroll/index.tsx`
- Create: `src/views/tools/rickroll/RickrollGenerator.tsx`
- Modify: `src/views/tools/ToolsIndex.tsx`
- Modify: `src/App.tsx`

- [ ] **Step 1: Create barrel export**

Create `src/views/tools/rickroll/index.tsx`:

```tsx
export { RickrollGenerator } from './RickrollGenerator';
```

- [ ] **Step 2: Create the generator component**

Create `src/views/tools/rickroll/RickrollGenerator.tsx`:

```tsx
import { useState } from 'react';
import {
  Container,
  Typography,
  TextField,
  Button,
  Box,
  Paper,
  InputAdornment,
  IconButton,
} from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CasinoIcon from '@mui/icons-material/Casino';

const SITE_DOMAIN = 'adebalogun.me';

const generateRandomSlug = (): string => {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  return Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
};

const buildRickrollUrl = (slug: string, title: string, imageUrl: string): string => {
  const base = `https://${SITE_DOMAIN}/r/${slug}`;
  const params = new URLSearchParams();
  if (title.trim()) params.set('t', title.trim());
  if (imageUrl.trim()) params.set('img', imageUrl.trim());
  const qs = params.toString();
  return qs ? `${base}?${qs}` : base;
};

export const RickrollGenerator = () => {
  const [slug, setSlug] = useState('');
  const [title, setTitle] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [copied, setCopied] = useState(false);

  const displaySlug = slug || 'your-slug';
  const fullUrl = buildRickrollUrl(slug || 'your-slug', title, imageUrl);

  const handleCopy = async () => {
    if (!slug) return;
    const url = buildRickrollUrl(slug, title, imageUrl);
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRandom = () => {
    setSlug(generateRandomSlug());
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 4, mb: 8 }}>
      <Typography variant="h4" gutterBottom>
        Rickroll Link Generator
      </Typography>
      <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
        Generate a disguised link that redirects to a surprise. Add a title and image for a convincing link preview in iMessage, Slack, and Discord.
      </Typography>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <TextField
            fullWidth
            label="Slug"
            placeholder="free-pizza"
            value={slug}
            onChange={(e) => setSlug(e.target.value.replace(/\s/g, '-'))}
            size="small"
          />
          <Button
            variant="outlined"
            onClick={handleRandom}
            startIcon={<CasinoIcon />}
            sx={{ whiteSpace: 'nowrap' }}
          >
            Random
          </Button>
        </Box>

        <TextField
          fullWidth
          label="Link Preview Title (optional)"
          placeholder="Free Concert Tickets Giveaway"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          size="small"
        />

        <TextField
          fullWidth
          label="Link Preview Image URL (optional)"
          placeholder="https://example.com/image.jpg"
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
          size="small"
        />
      </Box>

      <Paper
        variant="outlined"
        sx={{
          mt: 3,
          p: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 1,
          bgcolor: 'action.hover',
        }}
      >
        <Typography
          variant="body2"
          sx={{
            fontFamily: 'monospace',
            wordBreak: 'break-all',
            flex: 1,
            color: slug ? 'text.primary' : 'text.disabled',
          }}
        >
          {fullUrl}
        </Typography>
        <IconButton
          onClick={handleCopy}
          disabled={!slug}
          color={copied ? 'success' : 'default'}
          size="small"
        >
          <ContentCopyIcon fontSize="small" />
        </IconButton>
      </Paper>

      {copied && (
        <Typography variant="caption" color="success.main" sx={{ mt: 1, display: 'block' }}>
          Copied!
        </Typography>
      )}
    </Container>
  );
};
```

- [ ] **Step 3: Add to tools index**

In `src/views/tools/ToolsIndex.tsx`, add to the `tools` array (after the wedding budget entry):

```ts
  {
    path: '/tools/rickroll',
    title: 'Rickroll Link Generator',
    description: 'Generate disguised links that redirect to a surprise.',
  },
```

- [ ] **Step 4: Add route to App.tsx**

In `src/App.tsx`, add the lazy import:

```tsx
const RickrollGenerator = lazy(() => import('./views/tools/rickroll').then(m => ({ default: m.RickrollGenerator })));
```

Add the route inside `AppProviderLayout`, with the other `/tools/*` routes:

```tsx
      <Route path="/tools/rickroll" element={<RickrollGenerator />} />
```

- [ ] **Step 5: Verify it works**

Run: `yarn start`
Open: `http://localhost:3000/tools/rickroll`
Expected: Form with slug input, random button, title field, image URL field, preview URL, copy button. Type a slug, click copy — URL should be in clipboard. Check `/tools` page lists it.

- [ ] **Step 6: Commit**

```bash
git add src/views/tools/rickroll/ src/views/tools/ToolsIndex.tsx src/App.tsx
git commit -m "feat: add rickroll link generator tool page"
```

---

### Task 3: OG tag placeholder in index.html

**Files:**
- Modify: `public/index.html`

- [ ] **Step 1: Add OG_TAGS placeholder**

In `public/index.html`, add the placeholder comment inside `<head>`, right after the `<meta name="description">` tag (after line 15):

```html
    <!-- OG_TAGS -->
```

- [ ] **Step 2: Verify build still works**

Run: `yarn build`
Expected: Builds successfully. Check that `build/index.html` contains the `<!-- OG_TAGS -->` comment.

```bash
grep "OG_TAGS" build/index.html
```

Expected output: `<!-- OG_TAGS -->`

- [ ] **Step 3: Commit**

```bash
git add public/index.html
git commit -m "feat: add OG_TAGS placeholder to index.html for nginx injection"
```

---

### Task 4: nginx njs script for OG tag injection

**Files:**
- Create: `nginx/og_inject.js`

- [ ] **Step 1: Create the njs script**

Create `nginx/og_inject.js`:

```js
function buildOgTags(r) {
  var title = r.args.t || '';
  var image = r.args.img || '';

  if (!title && !image) {
    return '';
  }

  var tags = '';

  if (title) {
    tags += '<meta property="og:title" content="' + escapeHtml(title) + '">';
  }
  if (image) {
    tags += '<meta property="og:image" content="' + escapeHtml(image) + '">';
  }
  tags += '<meta property="og:type" content="article">';

  return tags;
}

function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

export default { buildOgTags };
```

- [ ] **Step 2: Commit**

```bash
git add nginx/og_inject.js
git commit -m "feat: add njs script for OG tag injection"
```

---

### Task 5: nginx config and Dockerfile for njs

**Files:**
- Modify: `nginx/nginx.conf`
- Modify: `Dockerfile`

- [ ] **Step 1: Update nginx.conf**

Replace the entire contents of `nginx/nginx.conf` with:

```nginx
js_import og from /etc/nginx/og_inject.js;
js_set $og_tags og.buildOgTags;

server {
    listen 8080;
    root   /usr/share/nginx/html;
    index  index.html;

    location /r/ {
        sub_filter '<!-- OG_TAGS -->' $og_tags;
        sub_filter_once on;
        sub_filter_types text/html;
        try_files /index.html =404;
    }

    location / {
        try_files $uri $uri/ /index.html;
    }

    error_page 500 502 503 504 /50x.html;
    location = /50x.html {
        root  /usr/share/nginx/html;
    }
}
```

- [ ] **Step 2: Update Dockerfile**

Replace the nginx stage (everything after `FROM nginx:alpine`) in the `Dockerfile` with:

```dockerfile
FROM nginx:alpine

RUN apk add --no-cache nginx-module-njs

COPY --from=build /app/build /usr/share/nginx/html
COPY --from=build /app/nginx/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/nginx/og_inject.js /etc/nginx/og_inject.js

# Load njs module
RUN echo 'load_module modules/ngx_http_js_module.so;' | cat - /etc/nginx/nginx.conf > /tmp/nginx.conf && mv /tmp/nginx.conf /etc/nginx/nginx.conf

EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]
```

- [ ] **Step 3: Test Docker build locally**

Run:
```bash
docker build -t me-client-test .
docker run --rm -p 8080:8080 me-client-test
```

Then test:
```bash
# Should contain OG tags
curl -s 'http://localhost:8080/r/test?t=Free+Pizza&img=https://example.com/pic.jpg' | grep 'og:title'

# Should NOT contain OG tags (no params)
curl -s 'http://localhost:8080/r/test' | grep 'OG_TAGS'

# Other routes should still work
curl -s -o /dev/null -w "%{http_code}" http://localhost:8080/
```

Expected:
- First curl: `<meta property="og:title" content="Free Pizza">`
- Second curl: `<!-- OG_TAGS -->` (placeholder stays)
- Third curl: `200`

- [ ] **Step 4: Stop test container and commit**

```bash
docker stop $(docker ps -q --filter ancestor=me-client-test) 2>/dev/null
git add nginx/nginx.conf Dockerfile
git commit -m "feat: configure nginx njs for OG tag injection on /r/ routes"
```

---

### Task 6: End-to-end verification

**Files:** None (verification only)

- [ ] **Step 1: Verify generator page**

Open `http://localhost:3000/tools/rickroll`:
- [ ] Type a custom slug — preview URL updates
- [ ] Click Random — slug fills with 6 random chars
- [ ] Type a title and image URL — preview URL includes `?t=...&img=...` query params
- [ ] Click copy icon — URL copied to clipboard, "Copied!" appears
- [ ] Empty slug — copy button disabled, preview shows placeholder

- [ ] **Step 2: Verify redirect page**

Open `http://localhost:3000/r/anything`:
- [ ] White page with spinner and "Redirecting you to your content..."
- [ ] After ~3 seconds, redirects to YouTube rickroll
- [ ] No site navbar/footer visible

- [ ] **Step 3: Verify tools index**

Open `http://localhost:3000/tools`:
- [ ] "Rickroll Link Generator" appears in the list
- [ ] Clicking it navigates to `/tools/rickroll`

- [ ] **Step 4: Verify OG injection (Docker only)**

Build and run Docker:
```bash
docker build -t me-client-test . && docker run --rm -d -p 8080:8080 me-client-test
```

Test OG tags:
```bash
curl -s 'http://localhost:8080/r/free-pizza?t=Free+Pizza+Tonight&img=https://example.com/pizza.jpg' | grep -o '<meta property="og:[^"]*" content="[^"]*">'
```

Expected output:
```
<meta property="og:title" content="Free Pizza Tonight">
<meta property="og:image" content="https://example.com/pizza.jpg">
<meta property="og:type" content="article">
```

Test XSS escaping:
```bash
curl -s 'http://localhost:8080/r/xss?t=<script>alert(1)</script>' | grep 'og:title'
```

Expected: `<meta property="og:title" content="&lt;script&gt;alert(1)&lt;/script&gt;">`

- [ ] **Step 5: Clean up and final commit (if any fixes needed)**

```bash
docker stop $(docker ps -q --filter ancestor=me-client-test) 2>/dev/null
git add -A && git commit -m "polish: fixes from end-to-end verification"
```

Only commit if changes were needed. Skip if everything passed clean.
