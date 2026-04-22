# April Fools GoFundMe Prank Page — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a pixel-perfect GoFundMe clone at `/donate` that reveals an April Fools prank when visitors click "Donate now."

**Architecture:** Single standalone React component with no MUI — pure HTML/CSS mimicking GoFundMe's layout. Route lives outside the `AppProviderLayout` wrapper so it has no site navbar/footer. CSS keyframe animations handle the melt-to-reveal transition.

**Tech Stack:** React 18, TypeScript, CSS keyframes, React Router v6

**Spec:** `docs/superpowers/specs/2026-04-01-april-fools-gofundme-design.md`

---

### File Structure

| Action | Path | Responsibility |
|--------|------|----------------|
| Create | `src/views/donate/DonatePage.tsx` | Main page component — GoFundMe layout, campaign content, reveal logic |
| Create | `src/views/donate/DonatePage.css` | All GoFundMe-clone styles + melt animation keyframes |
| Create | `src/views/donate/index.tsx` | Barrel export |
| Modify | `src/App.tsx` | Add `/donate` route outside `AppProviderLayout` |

Images already exist in `public/images/`: `melted-printer.jpg`, `profile.jpg`, `pax_artistica.png`

---

### Task 1: Create the DonatePage component shell and route

**Files:**
- Create: `src/views/donate/index.tsx`
- Create: `src/views/donate/DonatePage.tsx`
- Create: `src/views/donate/DonatePage.css`
- Modify: `src/App.tsx:25-120`

- [ ] **Step 1: Create barrel export**

Create `src/views/donate/index.tsx`:

```tsx
export { DonatePage } from './DonatePage';
```

- [ ] **Step 2: Create empty DonatePage component**

Create `src/views/donate/DonatePage.tsx`:

```tsx
import './DonatePage.css';

export const DonatePage = () => {
  return (
    <div className="gfm-page">
      <h1>GoFundMe Clone — Shell</h1>
    </div>
  );
};
```

- [ ] **Step 3: Create empty CSS file**

Create `src/views/donate/DonatePage.css`:

```css
/* GoFundMe clone styles */
.gfm-page {
  font-family: "GoFundMe Sans", Trebuchet, Helvetica, Arial, sans-serif;
  background: #fff;
  color: #232323;
  min-height: 100vh;
}
```

- [ ] **Step 4: Add route to App.tsx**

The `/donate` route must be **outside** the `AppProviderLayout` element so it doesn't get the site navbar/footer.

In `src/App.tsx`, add the lazy import near the other lazy imports (around line 37):

```tsx
const DonatePage = lazy(() => import('./views/donate').then(m => ({ default: m.DonatePage })));
```

Then change the route creation. Currently `routes` wraps everything under `<Route element={<AppProviderLayout />}>`. We need a second top-level route for `/donate`.

Replace the `routes` const (lines 86-114) with:

```tsx
const routes = createRoutesFromElements(
  <>
    <Route path="/donate" element={
      <Suspense fallback={<Loading />}>
        <DonatePage />
      </Suspense>
    } />

    <Route element={<AppProviderLayout />}>
      <Route path="/" element={<MainPage />} />
      <Route path="/projects" element={<ProjectPosts />} />
      <Route path="/projects/nyc-water" element={<WaterMap />} />
      <Route path="/projects/hubbub" element={<HubbubPage />} />
      <Route path="/projects/gyn-onc-fellowships" element={<GynOncMap />} />
      <Route path="/blog" element={<BlogPosts />} />
      <Route path="/blog/:slug" element={<PostPage />} />
      <Route path="/life" element={<GameOfLife />} />
      <Route path="/tools" element={<ToolsIndex />} />
      <Route path="/tools/markdown-viewer" element={<MarkdownViewer />} />
      <Route path="/tools/wedding-budget" element={<WeddingBudget />} />
      <Route path="/research" element={<ResearchIndex />} />
      <Route path="/research/:slug" element={<ResearchPaper />} />
      <Route path="*" element={<NotFound />} />
    </Route>
  </>
);
```

- [ ] **Step 5: Verify it loads**

Run: `cd /Users/adekunlebalogun/Projects/adebalogun && yarn start`

Open `http://localhost:3000/donate` — should show the shell text. Other routes should still work.

- [ ] **Step 6: Commit**

```bash
git add src/views/donate/ src/App.tsx
git commit -m "feat: add DonatePage shell and /donate route"
```

---

### Task 2: Build the GoFundMe top navbar

**Files:**
- Modify: `src/views/donate/DonatePage.tsx`
- Modify: `src/views/donate/DonatePage.css`

- [ ] **Step 1: Add the navbar markup**

Replace the content of `DonatePage.tsx` with:

```tsx
import './DonatePage.css';

export const DonatePage = () => {
  return (
    <div className="gfm-page">
      {/* Top Nav */}
      <nav className="gfm-nav">
        <div className="gfm-nav-inner">
          <div className="gfm-nav-left">
            <svg className="gfm-logo" viewBox="0 0 24 24" width="28" height="28" fill="none">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" fill="#274A34"/>
              <path d="M15.5 11H13v-2.5c0-.28-.22-.5-.5-.5h-1c-.28 0-.5.22-.5.5V11H8.5c-.28 0-.5.22-.5.5v1c0 .28.22.5.5.5H11v2.5c0 .28.22.5.5.5h1c.28 0 .5-.22.5-.5V13h2.5c.28 0 .5-.22.5-.5v-1c0-.28-.22-.5-.5-.5z" fill="#CCF88E"/>
            </svg>
            <span className="gfm-wordmark">GoFundMe</span>
          </div>
          <div className="gfm-nav-center">
            <div className="gfm-search-bar">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="2">
                <circle cx="11" cy="11" r="8"/>
                <line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              <span className="gfm-search-text">Search fundraisers</span>
            </div>
          </div>
          <div className="gfm-nav-right">
            <span className="gfm-nav-link">Donate</span>
            <span className="gfm-nav-link">Fundraise</span>
            <span className="gfm-nav-link">About</span>
            <span className="gfm-nav-link">Sign in</span>
            <button className="gfm-nav-start-btn">Start a GoFundMe</button>
          </div>
        </div>
      </nav>

      {/* Page body placeholder */}
      <div className="gfm-body">
        <p>Campaign content goes here</p>
      </div>
    </div>
  );
};
```

- [ ] **Step 2: Add navbar styles**

Add to `DonatePage.css`:

```css
.gfm-nav {
  border-bottom: 1px solid #e4e4e4;
  background: #fff;
  position: sticky;
  top: 0;
  z-index: 100;
}

.gfm-nav-inner {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 24px;
}

.gfm-nav-left {
  display: flex;
  align-items: center;
  gap: 8px;
}

.gfm-wordmark {
  font-size: 18px;
  font-weight: 900;
  color: #274A34;
  letter-spacing: -0.5px;
}

.gfm-nav-center {
  flex: 1;
  max-width: 400px;
  margin: 0 24px;
}

.gfm-search-bar {
  display: flex;
  align-items: center;
  gap: 8px;
  background: #f4f4f4;
  border-radius: 9999px;
  padding: 8px 16px;
}

.gfm-search-text {
  color: #999;
  font-size: 14px;
}

.gfm-nav-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

.gfm-nav-link {
  font-size: 14px;
  font-weight: 500;
  color: #232323;
  cursor: pointer;
}

.gfm-nav-start-btn {
  background: #274A34;
  color: #CCF88E;
  border: none;
  border-radius: 9999px;
  padding: 8px 16px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  font-family: inherit;
}

/* Hide nav extras on mobile */
@media (max-width: 768px) {
  .gfm-nav-center,
  .gfm-nav-right .gfm-nav-link {
    display: none;
  }
}
```

- [ ] **Step 3: Verify navbar renders**

Check `http://localhost:3000/donate` — should show a GoFundMe-style top nav bar.

- [ ] **Step 4: Commit**

```bash
git add src/views/donate/
git commit -m "feat: add GoFundMe navbar to donate page"
```

---

### Task 3: Build the campaign layout (two columns + hero + story)

**Files:**
- Modify: `src/views/donate/DonatePage.tsx`
- Modify: `src/views/donate/DonatePage.css`

- [ ] **Step 1: Replace the page body placeholder with full campaign layout**

In `DonatePage.tsx`, replace the `{/* Page body placeholder */}` div and its contents with:

```tsx
      {/* Campaign Body */}
      <div className="gfm-body">
        <div className="gfm-content">
          {/* Left Column */}
          <div className="gfm-main">
            <h1 className="gfm-title">Help Ade Replace His Destroyed 3D Printer</h1>

            <div className="gfm-hero">
              <img src="/images/melted-printer.jpg" alt="Destroyed 3D printer with melted filament" className="gfm-hero-img" />
            </div>

            <div className="gfm-organizer">
              <img src="/images/profile.jpg" alt="Ade Balogun" className="gfm-organizer-img" />
              <div className="gfm-organizer-info">
                <span className="gfm-organizer-name">Ade Balogun</span> is organizing this fundraiser
              </div>
            </div>

            <hr className="gfm-divider" />

            <div className="gfm-story">
              <p>I never thought I'd be making one of these but here we are.</p>
              <p>A few weeks ago my 3D printer completely self-destructed in the middle of a print. I came back to find melted plastic everywhere — it fused together into a giant mess and basically destroyed the whole machine from the inside out. I tried fixing it myself which only made things worse and cost me even more money in parts that didn't help.</p>
              <p>The repair guy took one look at it and said it's done. Between the printer itself, all the materials I've wasted, and the parts I bought trying to fix it, I'm over $800 in the hole. I was saving up for a new one but I'm not even close.</p>
              <p>3D printing is my favorite hobby and honestly one of the things that keeps me sane. I was in the middle of making gifts for friends when this happened which makes it even worse.</p>
              <p>Anything helps — even just sharing this. Thank you.</p>
            </div>

            <hr className="gfm-divider" />

            <div className="gfm-reactions">
              <span className="gfm-reaction">💚</span>
              <span className="gfm-reaction">😢</span>
              <span className="gfm-reaction">🙏</span>
              <span className="gfm-reaction-count">8</span>
            </div>

            <div className="gfm-protection">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="#274A34">
                <path d="M12 2L4 5v6.09c0 5.05 3.41 9.76 8 10.91 4.59-1.15 8-5.86 8-10.91V5l-8-3zm-1 15l-4-4 1.41-1.41L11 14.17l6.59-6.59L19 9l-8 8z"/>
              </svg>
              <span className="gfm-protection-text">Donation protected</span>
            </div>
          </div>

          {/* Right Column — Sidebar (built in next task) */}
          <div className="gfm-sidebar">
            <p>Sidebar placeholder</p>
          </div>
        </div>
      </div>
```

- [ ] **Step 2: Add layout and campaign styles**

Add to `DonatePage.css`:

```css
.gfm-body {
  max-width: 1200px;
  margin: 0 auto;
  padding: 32px 24px;
}

.gfm-content {
  display: flex;
  gap: 32px;
}

.gfm-main {
  flex: 1;
  min-width: 0;
}

.gfm-sidebar {
  width: 376px;
  flex-shrink: 0;
}

.gfm-title {
  font-size: 24px;
  font-weight: 900;
  color: #232323;
  margin: 0 0 16px 0;
  line-height: 1.3;
}

.gfm-hero {
  margin-bottom: 24px;
  border-radius: 10px;
  overflow: hidden;
}

.gfm-hero-img {
  width: 100%;
  display: block;
  border-radius: 10px;
}

.gfm-organizer {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.gfm-organizer-img {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
}

.gfm-organizer-info {
  font-size: 14px;
  color: #666;
}

.gfm-organizer-name {
  font-weight: 700;
  color: #232323;
}

.gfm-divider {
  border: none;
  border-top: 1px solid #e4e4e4;
  margin: 24px 0;
}

.gfm-story {
  font-size: 15px;
  line-height: 1.7;
  color: #232323;
}

.gfm-story p {
  margin: 0 0 16px 0;
}

.gfm-reactions {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-bottom: 16px;
}

.gfm-reaction {
  font-size: 20px;
  cursor: pointer;
}

.gfm-reaction-count {
  font-size: 14px;
  color: #666;
  margin-left: 8px;
}

.gfm-protection {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: #274A34;
  font-weight: 500;
}

/* Mobile: stack columns */
@media (max-width: 768px) {
  .gfm-content {
    flex-direction: column;
  }

  .gfm-sidebar {
    width: 100%;
  }
}
```

- [ ] **Step 3: Verify layout**

Check `http://localhost:3000/donate` — should show the nav, hero image, organizer line, story text, and a sidebar placeholder on the right. On mobile width, columns should stack.

- [ ] **Step 4: Commit**

```bash
git add src/views/donate/
git commit -m "feat: add campaign layout with hero, story, and organizer"
```

---

### Task 4: Build the donation sidebar

**Files:**
- Modify: `src/views/donate/DonatePage.tsx`
- Modify: `src/views/donate/DonatePage.css`

- [ ] **Step 1: Replace sidebar placeholder with donation card**

In `DonatePage.tsx`, replace `{/* Right Column — Sidebar (built in next task) */}` and the sidebar div with:

```tsx
          {/* Right Column — Sidebar */}
          <div className="gfm-sidebar">
            <div className="gfm-donation-card">
              <div className="gfm-raised">
                <span className="gfm-raised-amount">$150 raised</span>
                <span className="gfm-raised-goal"> of $1,200</span>
              </div>

              <div className="gfm-progress-track">
                <div className="gfm-progress-fill" style={{ width: '12.5%' }} />
              </div>

              <div className="gfm-donation-count">6 donations</div>

              <button className="gfm-share-btn" onClick={handleReveal}>Share</button>
              <button className="gfm-donate-btn" onClick={handleReveal}>Donate now</button>

              <div className="gfm-donor-list">
                <div className="gfm-donor-list-header">Recent donations</div>

                <div className="gfm-donor">
                  <div className="gfm-donor-avatar">J</div>
                  <div className="gfm-donor-info">
                    <div className="gfm-donor-name">Jake</div>
                    <div className="gfm-donor-detail"><span className="gfm-donor-amount">$50</span> · 2 hrs</div>
                  </div>
                  <div className="gfm-donor-comment">"Get back to printing bro"</div>
                </div>

                <div className="gfm-donor">
                  <div className="gfm-donor-avatar">F</div>
                  <div className="gfm-donor-info">
                    <div className="gfm-donor-name">Femi</div>
                    <div className="gfm-donor-detail"><span className="gfm-donor-amount">$40</span> · 5 hrs</div>
                  </div>
                  <div className="gfm-donor-comment">"This is so sad lol"</div>
                </div>

                <div className="gfm-donor">
                  <div className="gfm-donor-avatar">S</div>
                  <div className="gfm-donor-info">
                    <div className="gfm-donor-name">Sean</div>
                    <div className="gfm-donor-detail"><span className="gfm-donor-amount">$25</span> · 8 hrs</div>
                  </div>
                </div>

                <div className="gfm-donor">
                  <div className="gfm-donor-avatar">H</div>
                  <div className="gfm-donor-info">
                    <div className="gfm-donor-name">Hugh Jazz</div>
                    <div className="gfm-donor-detail"><span className="gfm-donor-amount">$20</span> · 12 hrs</div>
                  </div>
                  <div className="gfm-donor-comment">"Stay strong man"</div>
                </div>

                <div className="gfm-donor">
                  <div className="gfm-donor-avatar">A</div>
                  <div className="gfm-donor-info">
                    <div className="gfm-donor-name">Anonymous</div>
                    <div className="gfm-donor-detail"><span className="gfm-donor-amount">$15</span> · 1 day</div>
                  </div>
                </div>

                <div className="gfm-donor">
                  <div className="gfm-donor-avatar">L</div>
                  <div className="gfm-donor-info">
                    <div className="gfm-donor-name">Lisa Chen</div>
                    <div className="gfm-donor-detail"><span className="gfm-donor-amount">$10</span> · 1 day</div>
                  </div>
                  <div className="gfm-donor-comment">"Hope this helps!"</div>
                </div>
              </div>

              <div className="gfm-card-footer">
                <div className="gfm-card-meta">Creative Projects</div>
                <div className="gfm-card-meta">Created 2 days ago</div>
              </div>
            </div>
          </div>
```

Also add the `handleReveal` function. At the top of the component (before the return), add:

```tsx
const handleReveal = () => {
  // Will be implemented in Task 5
};
```

- [ ] **Step 2: Add sidebar styles**

Add to `DonatePage.css`:

```css
.gfm-donation-card {
  border: 1px solid #e4e4e4;
  border-radius: 10px;
  padding: 24px;
  position: sticky;
  top: 80px;
}

.gfm-raised {
  margin-bottom: 8px;
}

.gfm-raised-amount {
  font-size: 22px;
  font-weight: 900;
  color: #232323;
}

.gfm-raised-goal {
  font-size: 14px;
  color: #666;
}

.gfm-progress-track {
  height: 6px;
  background: #e4e4e4;
  border-radius: 3px;
  margin-bottom: 8px;
  overflow: hidden;
}

.gfm-progress-fill {
  height: 100%;
  background: #CCF88E;
  border-radius: 3px;
  transition: width 0.3s ease;
}

.gfm-donation-count {
  font-size: 14px;
  color: #666;
  margin-bottom: 20px;
}

.gfm-share-btn {
  width: 100%;
  padding: 12px;
  background: #274A34;
  color: #CCF88E;
  border: none;
  border-radius: 9999px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  margin-bottom: 10px;
  font-family: inherit;
}

.gfm-donate-btn {
  width: 100%;
  padding: 12px;
  background: #CCF88E;
  color: #274A34;
  border: none;
  border-radius: 9999px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  margin-bottom: 20px;
  font-family: inherit;
}

.gfm-share-btn:hover,
.gfm-donate-btn:hover {
  opacity: 0.9;
}

.gfm-donor-list {
  border-top: 1px solid #e4e4e4;
  padding-top: 16px;
}

.gfm-donor-list-header {
  font-size: 14px;
  font-weight: 700;
  color: #232323;
  margin-bottom: 16px;
}

.gfm-donor {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 16px;
}

.gfm-donor-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #e4e4e4;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 600;
  color: #666;
  flex-shrink: 0;
}

.gfm-donor-info {
  flex: 1;
  min-width: 0;
}

.gfm-donor-name {
  font-size: 14px;
  font-weight: 600;
  color: #232323;
}

.gfm-donor-detail {
  font-size: 13px;
  color: #666;
}

.gfm-donor-amount {
  font-weight: 600;
  color: #232323;
}

.gfm-donor-comment {
  font-size: 13px;
  color: #666;
  font-style: italic;
  margin-top: 2px;
  width: 100%;
}

.gfm-card-footer {
  border-top: 1px solid #e4e4e4;
  padding-top: 16px;
  display: flex;
  gap: 16px;
}

.gfm-card-meta {
  font-size: 12px;
  color: #999;
}

/* On mobile, sidebar card loses sticky and goes full width */
@media (max-width: 768px) {
  .gfm-donation-card {
    position: static;
  }
}
```

- [ ] **Step 3: Verify sidebar renders**

Check `http://localhost:3000/donate` — should show the full donation card with progress bar, buttons, and donor list in the right column. Buttons don't do anything yet.

- [ ] **Step 4: Commit**

```bash
git add src/views/donate/
git commit -m "feat: add donation sidebar with progress bar and donor list"
```

---

### Task 5: Build the reveal screen and melt animation

**Files:**
- Modify: `src/views/donate/DonatePage.tsx`
- Modify: `src/views/donate/DonatePage.css`

- [ ] **Step 1: Add state and reveal markup to DonatePage.tsx**

At the top of `DonatePage.tsx`, add the React import:

```tsx
import { useState } from 'react';
import './DonatePage.css';
```

Inside the component, replace the `handleReveal` placeholder with:

```tsx
const [revealed, setRevealed] = useState(false);

const handleReveal = () => {
  setRevealed(true);
};
```

After the closing `</div>` of `gfm-body` (and before the final closing `</div>` of `gfm-page`), add the reveal screen:

```tsx
      {/* Reveal Screen */}
      <div className={`gfm-reveal ${revealed ? 'gfm-reveal-visible' : ''}`}>
        <div className="gfm-reveal-content">
          <h1 className="gfm-reveal-title">YOU'VE BEEN FOOL'D BIGTIME</h1>
          <img src="/images/pax_artistica.png" alt="April Fools" className="gfm-reveal-img" />
          <p className="gfm-reveal-subtitle">Happy April Fools :)</p>
        </div>
      </div>
```

Also add the `gfm-melting` class to the wrapping elements. Change the outer nav and body wrappers to include the melt class:

Wrap the nav and body in a container div. The full return should look like:

```tsx
return (
  <div className="gfm-page">
    <div className={`gfm-campaign ${revealed ? 'gfm-melting' : ''}`}>
      <nav className="gfm-nav">
        {/* ... nav content unchanged ... */}
      </nav>
      <div className="gfm-body">
        {/* ... body content unchanged ... */}
      </div>
    </div>

    {/* Reveal Screen */}
    <div className={`gfm-reveal ${revealed ? 'gfm-reveal-visible' : ''}`}>
      <div className="gfm-reveal-content">
        <h1 className="gfm-reveal-title">YOU'VE BEEN FOOL'D BIGTIME</h1>
        <img src="/images/pax_artistica.png" alt="April Fools" className="gfm-reveal-img" />
        <p className="gfm-reveal-subtitle">Happy April Fools :)</p>
      </div>
    </div>
  </div>
);
```

- [ ] **Step 2: Add reveal and melt animation styles**

Add to `DonatePage.css`:

```css
/* Campaign wrapper — target of the melt animation */
.gfm-campaign {
  transition: transform 1.5s ease-in, opacity 1s ease-in;
  transform-origin: top center;
}

.gfm-melting {
  animation: meltAway 1.5s ease-in forwards;
  pointer-events: none;
}

@keyframes meltAway {
  0% {
    transform: translateY(0) skewX(0deg) scaleX(1);
    opacity: 1;
    filter: blur(0);
  }
  30% {
    transform: translateY(20px) skewX(-2deg) scaleX(1.02);
    opacity: 0.9;
    filter: blur(1px);
  }
  60% {
    transform: translateY(150px) skewX(3deg) scaleX(0.95);
    opacity: 0.5;
    filter: blur(3px);
  }
  100% {
    transform: translateY(100vh) skewX(-5deg) scaleX(0.8);
    opacity: 0;
    filter: blur(8px);
  }
}

/* Reveal screen */
.gfm-reveal {
  position: fixed;
  inset: 0;
  background: #111;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 50;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.8s ease-in 0.7s;
}

.gfm-reveal-visible {
  opacity: 1;
  pointer-events: auto;
}

.gfm-reveal-content {
  text-align: center;
  padding: 24px;
}

.gfm-reveal-title {
  font-family: "GoFundMe Sans", Trebuchet, Helvetica, Arial, sans-serif;
  font-size: 48px;
  font-weight: 900;
  color: #CCF88E;
  margin: 0 0 32px 0;
  text-transform: uppercase;
  letter-spacing: 2px;
  animation: revealBounce 0.6s ease-out 1.2s both;
}

@keyframes revealBounce {
  0% {
    transform: scale(0.3);
    opacity: 0;
  }
  50% {
    transform: scale(1.1);
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

.gfm-reveal-img {
  max-width: 400px;
  width: 100%;
  border-radius: 12px;
  animation: revealBounce 0.6s ease-out 1.5s both;
}

.gfm-reveal-subtitle {
  font-size: 24px;
  color: #fff;
  margin: 24px 0 0 0;
  animation: revealBounce 0.6s ease-out 1.8s both;
}

/* Mobile reveal */
@media (max-width: 768px) {
  .gfm-reveal-title {
    font-size: 32px;
  }

  .gfm-reveal-img {
    max-width: 280px;
  }

  .gfm-reveal-subtitle {
    font-size: 18px;
  }
}
```

- [ ] **Step 3: Verify the full flow**

1. Load `http://localhost:3000/donate`
2. Page should look like a real GoFundMe campaign
3. Click "Donate now" — the campaign should melt away and the reveal screen should appear with the statue and "FOOL'D" message
4. Test on mobile viewport width too

- [ ] **Step 4: Commit**

```bash
git add src/views/donate/
git commit -m "feat: add reveal screen with melt animation on donate click"
```

---

### Task 6: Final polish and visual QA

**Files:**
- Modify: `src/views/donate/DonatePage.tsx` (if needed)
- Modify: `src/views/donate/DonatePage.css` (if needed)

- [ ] **Step 1: Visual QA in browser**

Open `http://localhost:3000/donate` and check:
- [ ] GoFundMe nav looks right (logo, search bar, buttons)
- [ ] Hero image loads and has rounded corners
- [ ] Profile photo is circular
- [ ] Story text is readable
- [ ] Sidebar donation card is sticky on scroll
- [ ] Progress bar shows ~12.5% green fill
- [ ] All 6 donors display with correct names, amounts, comments
- [ ] "Donate now" and "Share" both trigger the reveal
- [ ] Melt animation is smooth
- [ ] Reveal text, image, and subtitle all animate in sequence
- [ ] Mobile layout stacks properly (test at 375px width)

- [ ] **Step 2: Fix any visual issues found in QA**

Adjust CSS as needed based on QA findings. Common things to watch:
- Image aspect ratios
- Sidebar card not sticking properly
- Mobile spacing

- [ ] **Step 3: Verify other site routes still work**

Check `http://localhost:3000/` and `http://localhost:3000/projects` to make sure existing pages are unaffected.

- [ ] **Step 4: Final commit**

```bash
git add src/views/donate/
git commit -m "polish: visual fixes for GoFundMe prank page"
```
