# Client Work section

## Context

The site's Projects section currently mixes two different kinds of content: personal/solo projects (Ultiboard, iCloud Album Downloader, Reddit Downloader, E-commerce Web Scraper, Tracker — all self-directed, GitHub-linked, no client) and freelance client work (Proven, Life — landing pages built for paying clients). A new resume update adds HMS, a production property-management platform built and operated for multiple clients, structured in the resume like an Experience entry (role, tech stack, bullet points) rather than a Projects-card entry (image, blurb, repo link).

Squeezing HMS into the existing Projects grid would keep the same category-mixing problem, just with a third kind of content now blended in. Splitting client work into its own section is a genuine information-architecture improvement: a recruiter scanning the page sees "here's stuff I built for myself" separately from "here's what I've delivered for clients," which is a more legible signal than one undifferentiated grid.

This is a structural change (new section, new nav entries, renumbered eyebrows, content moved between sections), not a copy edit, so it gets its own design pass rather than being folded into the resume-content-sync work.

Three visual layouts were mocked up via the visual companion (case-study list rows, image-or-placeholder card grid, stat-forward compact strip). **The user selected the stat-forward strip** — client name rendered as a large accent-colored word in place of an image, three columns on desktop, no image slot to fill or leave as a placeholder.

## Scope

**In scope:**
- New `ClientWork` component + section, inserted in scroll order between Experience and Projects (About → Experience → Client Work → Projects → Contact).
- Three entries: HMS, Proven, Life — in that order (most recent/substantial first, matching the Experience and Projects sections' own "most notable first" convention).
- Nav updates (desktop `NavBar.tsx`, mobile `Menu.tsx`) adding a "Client Work" link.
- Eyebrow renumbering: About stays `01`, Experience stays `02`, **Client Work becomes `03`**, Projects becomes `04`, Contact becomes `05`.
- Removing Proven and Life from `Projects.tsx`'s project list.

**Out of scope:**
- Any new icon or image asset work — this layout has no image slot at all, so the "no screenshot yet" problem that motivated picking this layout over the other two options is fully sidestepped for now. If/when someone wants to add images to Client Work cards later, that's a separate follow-up design.
- Changing anything about how Projects itself renders (image-hover-reveal mechanic, alternating layout) — Projects keeps its exact current behavior, just with two fewer entries.
- Content changes beyond what's needed to populate the three cards (HMS's copy comes from the resume; Proven/Life's copy is carried over verbatim from their current Projects entries, not rewritten).

## Design

### Component: `src/components/ClientWork.tsx` + `src/components/ClientWork.css`

New files, following the existing component conventions (React class component, typed props/state interfaces, co-located CSS file imported via `components.css`).

Data shape:
```ts
type ClientWorkEntry = {
  name: string,
  tagline: string,       // short descriptor under the client name, e.g. "Production Property Management Platform"
  description: string,   // one dense paragraph
  techStacks: string[],
  url: string,            // external link; empty string means no link rendered
};
```

Three entries, in this order:
1. **HMS** — tagline "Production Property Management Platform", description synthesizing the resume's four bullets into one paragraph (built/operate a production platform for multiple clients covering bookings, billing, deposits, financial reporting; leading a ground-up modernization improving maintainability and test coverage), tech stack `Next.js, TypeScript, PostgreSQL, Prisma, AWS`, `url: ''` (no public link — private client platform, per explicit decision).
2. **Proven** — tagline "Landing Page", description and tech stack (`TypeScript, React, Vite.js`) carried over verbatim from the current Projects entry, `url` carried over from its current `projUrl` (`https://fl.klbf-proven.raymonds.dev`).
3. **Life** — same treatment, carried over from its current Projects entry, `url` from its current `projUrl` (`https://fl.klbf-life.raymonds.dev`).

Rendering: a 3-column grid (1 column on mobile, `md:grid-cols-3` on desktop — same responsive convention `#about-me-grid` already uses). Each column: client name in `font-display` (Anton) at a large size in `text-brutalist-accent`, tagline in muted mono beneath it, description paragraph, tech-stack chips (reusing the exact `.project-stack-list > li` chip styling — solid accent-filled, square, bold uppercase mono — from `Projects.css`, either by sharing the class name or duplicating the one rule; duplicating is simpler and keeps `ClientWork.css` self-contained, matching how each component today owns its own CSS file rather than reaching into siblings'), and an external-link icon (reusing the existing `External` icon component) only when `url` is non-empty.

No image, no hover-reveal mechanic, no alternating left/right layout — this is deliberately a simpler, flatter treatment than Projects, consistent with the chosen mockup.

### `App.tsx` changes

- Import `ClientWork` from `./components/ClientWork`.
- Insert a new `<section id="client-work">` between the closing `</section>` of Experience and the opening `<section id="projects">`, containing the `03 · Client Work` eyebrow, an `<h2>Client Work</h2>` heading, and `<ClientWork/>`.
- Renumber the Projects eyebrow from `03 · Projects` to `04 · Projects`.
- Renumber the Contact eyebrow from `04 · Contact` to `05 · Contact`.
- About (`01`) and Experience (`02`) eyebrows are unchanged.

### `App.css` changes

The existing section-border/spacing rules (`section:nth-of-type(2)`, `section:not(:first-of-type):not(:last-of-type):not(:nth-of-type(2))`, `section:nth-of-type(n+3)`, `section:last-of-type`) are all structural selectors keyed off position, not IDs — inserting a new `<section>` in the middle automatically picks up the correct border/spacing treatment with zero changes needed to `App.css`, since every section from position 3 onward already shares the same rule. This is a case where the existing CSS's positional-selector design pays off.

### Nav changes

`src/navigation/navbar/desktop/NavBar.tsx` and `src/navigation/menu/Menu.tsx` both get a new `<a href="#client-work">Client Work</a>` link inserted between the existing Experience and Projects links, matching each file's existing markup pattern exactly (icon + label for mobile, label only for desktop).

### `Projects.tsx` changes

Remove the `Proven` and `Life` objects from the `projects` array. No other changes to the component — the remaining five entries (Ultiboard, iCloud Album Downloader, Reddit Downloader, E-commerce Web Scraper, Tracker) keep their exact current rendering.

## Testing

No automated test suite exists for this project. Verification is manual, via the dev server and Playwright screenshots, same approach used throughout this project's prior work:
- Confirm all three Client Work cards render with correct content, correct chip styling, and correct link behavior (HMS has no link icon, Proven/Life do).
- Confirm section-border and spacing rules apply correctly to the newly-inserted section without any `App.css` changes (verifying the positional-selector claim above holds).
- Confirm eyebrow numbers read `01, 02, 03, 04, 05` in scroll order with no gaps or duplicates.
- Confirm both nav components (desktop + mobile) correctly scroll to the new section.
- Confirm Projects section now shows exactly five entries, with Proven/Life gone.
- Check both light/dark themes and desktop/mobile breakpoints.
