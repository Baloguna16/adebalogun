# Directory Pages — Design Spec

**Date:** 2026-06-11
**Status:** Approved by Ade (option B — "Monospace directory index", with blog thumbnails kept and dim description lines).
**Scope:** Unify the three list pages — `/projects`, `/tools`, `/blog` — under one shared component and visual language. No changes to detail pages.

## Decisions (locked)

| Question | Decision |
|---|---|
| Direction | Monospace directory index: dense rows, Space Mono titles, hairline dividers. |
| Shared component | `src/base/DirectoryList.tsx` renders all three pages; pages become thin wrappers that map their data into entries. |
| Page header | Title in Space Mono (MUI h4) with a trailing underscore in `palette.primary.main` (e.g. `Projects_`), then a dim mono caption `N entries` (blog: reflects filtered count). |
| Row layout | Flex row: optional thumbnail (blog), then title block (title + optional dim description + optional tags), date right-aligned. Hairline `border-bottom` (`divider` token) between rows, none after the last. |
| Title | Space Mono, bold, `palette.primary.main`. Underline on row hover. Row hover background: `action.hover`. |
| Date | Right-aligned, dim (`text.secondary`), monospace. Projects/tools: `YYYY-MM`. Blog: `YYYY-MM-DD` (as stored). Whole row is the link. |
| Descriptions | Optional dim one-line (`text.secondary`, body2) under the title: tools keep their descriptions, blog uses its subtitle, projects have none today (field supported). |
| External links | Entries that aren't internal (e.g. the malaria-vaccine PDF) open in a new tab and render an `↗` suffix after the title. |
| Blog thumbnails | Kept: compact square (56px, `object-fit: cover`, slight radius) on the left of rows that have `banner_image`. |
| Blog tags | Tag filter chip bar above the list stays as-is. Per-row tags render as small dim mono `#tag` text after the description line. |
| Tools dates | Tools currently have no dates — derive each tool's ship month from git history (first commit touching its directory/file) and hardcode as `date: 'YYYY-MM'` in the tools array. |
| Projects dates | Convert existing strings in `linksData` to `YYYY-MM` ('June 2026' → '2026-06', 'May 2025' → '2025-05', 'March 2026' → '2026-03', 'December 2022' → '2022-12', 'October 1, 2021' → '2021-10'). |
| Theming | All colors via theme tokens (`useTheme`/`sx`) — must look right in light (purple) and dark (neon green) modes. No hardcoded hex. |
| Mobile | Rows stay horizontal; date column stays right-aligned; long titles wrap. Thumbnail stays 56px. |
| Testing | One RTL test file for `DirectoryList`: renders heading + entry count, titles, dates, external `↗` + `target="_blank"`, internal entries as router links, description and `#tag` rendering. Existing 13 travel-map tests must keep passing. |

## Data shape

```ts
export interface DirectoryEntry {
  title: string;
  href: string;            // internal path or external URL
  external?: boolean;      // default false → RouterLink; true → <a target="_blank">
  date: string;            // 'YYYY-MM' or 'YYYY-MM-DD', displayed verbatim
  description?: string;    // dim second line
  thumbnail?: string;      // blog banner_image
  tags?: string[];         // rendered as '#tag' dim mono text
}

export interface DirectoryListProps {
  heading: string;         // 'Projects' | 'Tools' | 'Blog'
  entries: DirectoryEntry[];
  toolbar?: React.ReactNode; // blog tag-filter chips, rendered between header and rows
}
```

## Page wrappers

- `ProjectPosts.tsx`: keeps `linksData` (dates converted), maps to entries, renders `<DirectoryList heading="Projects" …/>`. Internal/external derived from existing `type` field.
- `ToolsIndex.tsx`: keeps `tools` array (+ new `date` field), maps to entries.
- `BlogPosts.tsx`: keeps fetch/tag-filter logic and chip bar (passed as `toolbar`), maps filtered posts to entries (`title`, `description: subtitle`, `thumbnail: banner_image`, `date: date_created`, `tags`, `href: slug`).

## Out of scope

Detail pages, navbar/footer, blog post JSON format, pagination, search.
