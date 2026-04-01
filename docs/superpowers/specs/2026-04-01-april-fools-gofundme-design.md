# April Fools GoFundMe Prank Page

## Overview

A pixel-perfect GoFundMe campaign clone at `adebalogun.me/donate` that looks like a real fundraiser for Ade's broken 3D printer. When visitors click "Donate now," the entire page melts away to reveal a "YOU'VE BEEN FOOL'D BIGTIME" screen.

## Route

- **Path:** `/donate`
- **Standalone page** — no site navbar/footer. Must look like GoFundMe, not the portfolio.

## Layout

Two-column desktop (60/40 split), single column on mobile.

### Left Column
1. GoFundMe-style top nav bar (non-functional, cosmetic only)
2. Campaign title: "Help Ade Replace His Destroyed 3D Printer"
3. Hero image: `melted-printer.jpg`
4. Organizer line: circular profile photo (`profile.jpg`) + "Ade Balogun is organizing this fundraiser"
5. Story text (see Content section)
6. Reaction emoji row + "Donation protected" badge

### Right Column (sticky on desktop)
1. Amount raised: **$150 of $1,200** (12.5% progress bar)
2. Donation count: **6 donations**
3. "Share" button (dark green bg `#274A34`, lime text `#CCF88E`, pill-shaped)
4. "Donate now" button (lime bg `#CCF88E`, dark green text `#274A34`, pill-shaped)
5. Recent donor list (see Donors section)
6. Category: "Creative Projects" · Created 2 days ago

## Visual Design

- **Font stack:** "GoFundMe Sans", Trebuchet, Helvetica, Arial, sans-serif (fallback — no proprietary font)
- **Background:** `#FFFFFF`
- **Text color:** `#232323`
- **Primary accent (Donate now):** `#CCF88E` bg, `#274A34` text, `border-radius: 9999px`
- **Share button:** `#274A34` bg, `#CCF88E` text, `border-radius: 9999px`
- **Progress bar:** `#CCF88E` fill on light gray (`#E4E4E4`) track
- **Top nav:** White bar with "GoFundMe" text in dark green, search bar, nav links — all non-functional
- **No MUI components.** Pure CSS/inline styles to match GoFundMe's look.

## Campaign Content

### Story Text

> I never thought I'd be making one of these but here we are.
>
> A few weeks ago my 3D printer completely self-destructed in the middle of a print. I came back to find melted plastic everywhere — it fused together into a giant mess and basically destroyed the whole machine from the inside out. I tried fixing it myself which only made things worse and cost me even more money in parts that didn't help.
>
> The repair guy took one look at it and said it's done. Between the printer itself, all the materials I've wasted, and the parts I bought trying to fix it, I'm over $800 in the hole. I was saving up for a new one but I'm not even close.
>
> 3D printing is my favorite hobby and honestly one of the things that keeps me sane. I was in the middle of making gifts for friends when this happened which makes it even worse.
>
> Anything helps — even just sharing this. Thank you.

### Donors

| Name | Amount | Comment |
|------|--------|---------|
| Jake | $50 | "Get back to printing bro" |
| Femi | $40 | "This is so sad lol" |
| Sean | $25 | |
| Hugh Jazz | $20 | "Stay strong man" |
| Anonymous | $15 | |
| Lisa Chen | $10 | "Hope this helps!" |

**Total displayed:** $150 raised, 6 donations

## The Reveal

**Trigger:** Clicking "Donate now" OR "Share" button.

**Melt animation (~1.5s):**
- The GoFundMe page distorts and slides off screen
- CSS animation: `transform: skewX()` + `translateY(100vh)` + `opacity: 0`
- The reveal screen is positioned behind, already rendered

**Reveal screen:**
- Full-screen dark background
- `pax_artistica.png` (statue image) centered
- Large bold text: **"YOU'VE BEEN FOOL'D BIGTIME"**
- Smaller text below: **"Happy April Fools :)"**
- No buttons, no links, no navigation. Just the moment.

**Safety:** No payment forms, no redirects to real GoFundMe, no way to accidentally send money. The donate button only triggers the reveal animation.

## Images

All in `/public/images/`:
- `melted-printer.jpg` — hero image of the destroyed printer
- `profile.jpg` — Ade's profile photo (circular crop)
- `pax_artistica.png` — statue image for the reveal screen

## Technical Notes

- New React component: `src/views/donate/DonatePage.tsx`
- Lazy-loaded route in `App.tsx` at `/donate`
- No shared layout components (navbar/footer) — fully standalone
- Pure CSS animations for the melt effect (no animation libraries)
- Mobile responsive — single column layout on small screens
