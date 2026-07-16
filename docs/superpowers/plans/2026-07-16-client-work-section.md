# Client Work Section Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a new "Client Work" section (HMS, Proven, Life) between Experience and Projects, using a 3-column stat-forward strip layout with no images, and remove Proven/Life from the existing Projects grid so Projects holds only personal/solo work.

**Architecture:** One new React class component (`ClientWork`) + co-located CSS file, following the exact conventions every other section component already uses (typed props/state interfaces, `components.css` import registration). `App.tsx` gets a new `<section>` inserted in JSX between the existing Experience and Projects sections, plus eyebrow-number updates on the two sections that shift position. Both nav components (`NavBar.tsx` desktop, `Menu.tsx` mobile) get a new link. `Projects.tsx` loses two array entries. One new icon component (`Handshake`) for the mobile nav link.

**Tech Stack:** React 17 class components, TypeScript, Tailwind CSS (utility classes via `@apply` in co-located `.css` files), no new dependencies.

## Global Constraints

- New section renders between Experience and Projects in scroll order: About → Experience → **Client Work** → Projects → Contact.
- Eyebrow numbers become: About `01` (unchanged), Experience `02` (unchanged), Client Work `03` (new), Projects `04` (was `03`), Contact `05` (was `04`).
- No image slot anywhere in the Client Work card — confirmed decision from the design spec, not a placeholder to fill in later.
- HMS entry: `url: ''` (no link rendered) — it is private client work with no public URL.
- Proven and Life move out of `Projects.tsx` entirely (not duplicated) — they exist only in `ClientWork.tsx` after this plan.
- No changes to `App.css`'s section-spacing/border rules — the existing positional selectors (`section:nth-of-type(2)`, `section:not(:first-of-type):not(:last-of-type):not(:nth-of-type(2))`, `section:nth-of-type(n+3)`, `section:last-of-type`) already apply correctly to a newly-inserted section with zero edits, confirmed by reading the current file.
- No new icon/screenshot assets for HMS/Proven/Life beyond what already exists — this task is layout only.

---

## Task 1: `Handshake` icon component

**Files:**
- Create: `src/icons/Handshake.tsx`

**Interfaces:**
- Produces: `Handshake` — a bare `React.Component` (no props, matching `Work.tsx`/`User.tsx`/`Project.tsx`/`Contact.tsx`'s exact pattern — none of those four take props either), rendering a 24x24 outline SVG icon depicting a handshake. Task 6 (mobile nav) imports and renders `<Handshake/>` with no props, exactly like `<Work/>` is currently rendered in `Menu.tsx`.

- [ ] **Step 1: Create the icon file**

```tsx
import React from 'react';

export class Handshake extends React.Component {
  render() {
    return (
      <svg
        fill="none"
        height="24"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        viewBox="0 0 24 24"
        width="24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M11 17l-4-4a2 2 0 0 0-2.83 0l-.34.34a2 2 0 0 0 0 2.83L8 21" />
        <path d="M7 13l4.5-4.5a2 2 0 0 1 2.83 0L16 10" />
        <path d="M13 19l1.5 1.5a2 2 0 0 0 2.83 0l.34-.34a2 2 0 0 0 0-2.83L14 13.67" />
        <path d="M16 10l2.5-2.5a2 2 0 0 0 0-2.83l-.34-.34a2 2 0 0 0-2.83 0L13 6.67" />
        <path d="M2 12l3-3" />
        <path d="M22 12l-3-3" />
      </svg>
    );
  }
}
```

- [ ] **Step 2: Verify the component compiles**

Run: `cd /Users/rsalim/personal/raymonds.dev && npx tsc --noEmit -p tsconfig.json 2>&1 | grep -i "Handshake"`
Expected: no output (no type errors referencing this file). This file isn't imported anywhere yet, so a standalone compile check is the only verification possible at this point.

- [ ] **Step 3: Lint the new file**

Run: `cd /Users/rsalim/personal/raymonds.dev && npx eslint --ext .tsx src/icons/Handshake.tsx`
Expected: only the same warning categories every other icon file in this repo already has (`import/prefer-default-export`, possibly `class-methods-use-this` if `render()` doesn't reference `this`) — zero errors. Compare against `npx eslint --ext .tsx src/icons/Work.tsx` if unsure whether a given warning is pre-existing-pattern or new.

- [ ] **Step 4: Commit**

```bash
cd /Users/rsalim/personal/raymonds.dev
git add src/icons/Handshake.tsx
git commit -m "feat(icons): add Handshake icon for Client Work nav link"
```

---

## Task 2: `ClientWork` component + CSS

**Files:**
- Create: `src/components/ClientWork.tsx`
- Create: `src/components/ClientWork.css`
- Modify: `src/components/components.css`

**Interfaces:**
- Consumes: `External` icon component from `src/icons/External.tsx` (no props, exact same usage as `<External />` in `Projects.tsx`).
- Produces: `ClientWork` — a bare `React.Component<ClientWorkProps, ClientWorkState>` (both interfaces empty, matching `Projects`' `ProjectsProps`/`ProjectsState` pattern) rendering a `<div id="client-work-grid">` of three cards. No props are threaded in from `App.tsx` — `<ClientWork/>` is rendered with zero props, exactly like `<Projects/>` and `<Experiences/>` already are. Task 3 (`App.tsx`) imports `{ ClientWork } from './components/ClientWork'` and renders `<ClientWork/>` inside the new section.

- [ ] **Step 1: Create `src/components/ClientWork.tsx`**

```tsx
import React from 'react';
import { External } from '../icons/External';

type ClientWorkEntry = {
  name: string,
  tagline: string,
  description: string,
  techStacks: string[],
  url: string,
};

interface ClientWorkState {}

interface ClientWorkProps {}

export class ClientWork extends React.Component<ClientWorkProps, ClientWorkState> {
  render() {
    const entries: ClientWorkEntry[] = [
      {
        name: 'HMS',
        tagline: 'Production Property Management Platform',
        description: 'Built and currently operate a production property-management platform used by multiple clients to manage locations, rooms, tenants, bookings, billing, payments, deposits, and financial reporting. Leading a ground-up modernization of the platform while preserving existing business rules and improving maintainability, financial correctness, and test coverage.',
        techStacks: ['Next.js', 'TypeScript', 'PostgreSQL', 'Prisma', 'AWS'],
        url: '',
      },
      {
        name: 'Proven',
        tagline: 'Landing Page',
        description: 'Developed a landing page for a client using React with TypeScript, featuring an interactive online quiz and Google Analytics integration for user engagement and tracking.',
        techStacks: ['TypeScript', 'React', 'Vite.js'],
        url: 'https://fl.klbf-proven.raymonds.dev',
      },
      {
        name: 'Life',
        tagline: 'Landing Page',
        description: 'Developed a landing page for a client using React with TypeScript, featuring Google Analytics integration for user engagement and tracking.',
        techStacks: ['TypeScript', 'React', 'Vite.js'],
        url: 'https://fl.klbf-life.raymonds.dev',
      },
    ];

    return (
      <div id="client-work-grid">
        {
          entries.map((entry) => (
            <div key={entry.name} className={'client-work-card'}>
              <h3 className={'client-work-name'}>{entry.name}</h3>
              <p className={'client-work-tagline'}>{entry.tagline}</p>
              <p className={'client-work-description'}>{entry.description}</p>
              <ul className={'client-work-stack-list'}>
                {entry.techStacks.map((tech) => (
                  <li key={tech}>{tech}</li>
                ))}
              </ul>
              {
                entry.url.length > 0
                  ? <a href={entry.url} target="_blank" rel="noopener noreferrer" className={'client-work-link'}>
                    <External />
                  </a>
                  : null
              }
            </div>
          ))
        }
      </div>
    );
  }
}
```

- [ ] **Step 2: Create `src/components/ClientWork.css`**

```css
#client-work-grid {
    @apply grid md:grid-cols-3 gap-y-12 md:gap-y-0 gap-x-4 md:gap-x-10 2xl:gap-x-16;
}

.client-work-name {
    @apply font-display text-brutalist-accent text-3xl uppercase mb-2;
}

.client-work-tagline {
    @apply font-mono text-brutalist-fg-muted dark:text-brutalist-fg-muted-dark text-xs uppercase tracking-wide mb-4;
}

.client-work-description {
    @apply mb-4;
}

.client-work-stack-list {
    @apply list-none mb-4 flex flex-wrap gap-2;
}

.client-work-stack-list > li {
    @apply inline-block bg-brutalist-accent text-brutalist-accent-contrast font-mono font-bold text-xs uppercase tracking-wide px-2 py-1;
}

.client-work-link {
    @apply inline-block transition-transform hover:scale-125 hover:text-brutalist-accent;
}
```

Notes on token choices, cross-checked against the current codebase: `font-display` and `text-brutalist-accent` match the client-name-as-visual-anchor treatment from the approved mockup (option C used `font-family:'Anton'` + the accent color for the large name). `.client-work-tagline` reuses the exact `dark:text-brutalist-fg-muted-dark` pairing already used for muted text elsewhere (e.g. `Experiences.css`'s `.experience-tab-button`). `.client-work-stack-list > li` is a byte-for-byte copy of `Projects.css`'s `.project-stack-list > li` rule (`src/components/Projects.css:70-72`), per the spec's explicit choice to duplicate rather than share the class across files, keeping `ClientWork.css` self-contained. `.client-work-link` mirrors `Projects.css`'s `.project-links:hover` treatment (`scale-125` + accent color) without needing the odd/even-column mirroring logic Projects uses, since this layout has no alternating sides.

- [ ] **Step 3: Register the new CSS file**

Modify `src/components/components.css` — current full contents:
```css
@import "Experiences.css";
@import "Input.css";
@import "PageLoad.css";
@import "Projects.css";
@import "Contact.css";
@import "Footer.css";
```
Replace with:
```css
@import "Experiences.css";
@import "Input.css";
@import "PageLoad.css";
@import "Projects.css";
@import "ClientWork.css";
@import "Contact.css";
@import "Footer.css";
```

- [ ] **Step 4: Verify compilation**

Run: `cd /Users/rsalim/personal/raymonds.dev && npx tsc --noEmit -p tsconfig.json 2>&1 | grep -i "ClientWork"`
Expected: no output. (`ClientWork` isn't imported into `App.tsx` yet — Task 3 does that — so this only confirms the file itself is syntactically and structurally valid TypeScript in isolation.)

- [ ] **Step 5: Lint**

Run: `cd /Users/rsalim/personal/raymonds.dev && npx eslint --ext .tsx src/components/ClientWork.tsx`
Expected: only pre-existing-pattern warnings (e.g. `import/prefer-default-export`), zero errors.

- [ ] **Step 6: Commit**

```bash
cd /Users/rsalim/personal/raymonds.dev
git add src/components/ClientWork.tsx src/components/ClientWork.css src/components/components.css
git commit -m "feat(client-work): add ClientWork component with HMS, Proven, Life entries"
```

---

## Task 3: Insert the Client Work section into `App.tsx`

**Files:**
- Modify: `src/App.tsx`

**Interfaces:**
- Consumes: `ClientWork` component from Task 2 (`import { ClientWork } from './components/ClientWork';`, rendered as `<ClientWork/>` with no props).
- Produces: the `#client-work` section anchor that Task 6 (nav links) will point `href="#client-work"` at.

- [ ] **Step 1: Add the import**

In `src/App.tsx`, the current import block (lines 1-27) ends with:
```tsx
import { Footer } from './components/Footer';
import { ScrollToTop } from './buttons/ScrollToTop';
import { ScrollProgress } from './buttons/ScrollProgress';
```
Add a new import line after the `Projects` import (to group it near the other section-content components):
```tsx
import { Projects } from './components/Projects';
import { ClientWork } from './components/ClientWork';
```
(i.e. insert `import { ClientWork } from './components/ClientWork';` immediately after the existing `import { Projects } from './components/Projects';` line.)

- [ ] **Step 2: Insert the new section and renumber the two eyebrows that shift**

Current `render()` JSX has this exact block (Experience section, followed immediately by Projects section):
```tsx
          <section id="experience">
            <div id="experience-content" className="content">
              <p className="font-mono uppercase tracking-wide text-sm text-brutalist-accent mb-2">02 &middot; Experience</p>
              <h2>Experience</h2>
              <Experiences/>
            </div>
          </section>
          <section id="projects">
            <div id="projects-content" className="content">
              <p className="font-mono uppercase tracking-wide text-sm text-brutalist-accent mb-2">03 &middot; Projects</p>
              <h2>Things I&apos;ve Built</h2>
              <Projects/>
            </div>
          </section>
          <section id="contact">
            <div id="contact-content" className="content mb-16">
              <p className="font-mono uppercase tracking-wide text-sm text-brutalist-accent mb-2">04 &middot; Contact</p>
              <h2>Contact</h2>
              <Contact />
            </div>
          </section>
```

Replace it with:
```tsx
          <section id="experience">
            <div id="experience-content" className="content">
              <p className="font-mono uppercase tracking-wide text-sm text-brutalist-accent mb-2">02 &middot; Experience</p>
              <h2>Experience</h2>
              <Experiences/>
            </div>
          </section>
          <section id="client-work">
            <div id="client-work-content" className="content">
              <p className="font-mono uppercase tracking-wide text-sm text-brutalist-accent mb-2">03 &middot; Client Work</p>
              <h2>Client Work</h2>
              <ClientWork/>
            </div>
          </section>
          <section id="projects">
            <div id="projects-content" className="content">
              <p className="font-mono uppercase tracking-wide text-sm text-brutalist-accent mb-2">04 &middot; Projects</p>
              <h2>Things I&apos;ve Built</h2>
              <Projects/>
            </div>
          </section>
          <section id="contact">
            <div id="contact-content" className="content mb-16">
              <p className="font-mono uppercase tracking-wide text-sm text-brutalist-accent mb-2">05 &middot; Contact</p>
              <h2>Contact</h2>
              <Contact />
            </div>
          </section>
```

Note exactly three changes from the original: (1) the new `<section id="client-work">` block is inserted between Experience and Projects, using the same `<div id="X-content" className="content">` + eyebrow `<p>` + `<h2>` + component wrapper pattern every other section already uses; (2) the Projects eyebrow text changed from `03 &middot; Projects` to `04 &middot; Projects`; (3) the Contact eyebrow text changed from `04 &middot; Contact` to `05 &middot; Contact`. The About and Experience eyebrows (`01`, `02`) are untouched.

- [ ] **Step 3: Verify compilation**

Run: `cd /Users/rsalim/personal/raymonds.dev && npx tsc --noEmit -p tsconfig.json 2>&1 | grep -i "App.tsx"`
Expected: no output.

- [ ] **Step 4: Start the dev server and visually verify**

Run: `cd /Users/rsalim/personal/raymonds.dev && npm start` (leave running), then open `http://localhost:3000`.
Expected: scrolling from the top shows sections in order Home → About (`01`) → Experience (`02`) → **Client Work (`03`)** → Projects (`04`) → Contact (`05`). The Client Work section shows a heading "Client Work" and, beneath it, three columns (stacked on narrow viewports) for HMS, Proven, and Life — each with a large orange client name, a muted tagline, a description paragraph, orange tech-stack chips, and an external-link icon on Proven/Life only (HMS has none, since its `url` is empty). Confirm the section has the same top border and vertical spacing as Experience/Projects (no visual gap or missing border) — this is the positional-CSS-selector claim from the spec; if the border or spacing looks wrong here, stop and re-check `src/App.css`'s section rules before proceeding, since the plan assumes zero CSS changes are needed for this.

- [ ] **Step 5: Commit**

```bash
cd /Users/rsalim/personal/raymonds.dev
git add src/App.tsx
git commit -m "feat(client-work): insert Client Work section between Experience and Projects"
```

---

## Task 4: Remove Proven and Life from `Projects.tsx`

**Files:**
- Modify: `src/components/Projects.tsx`

**Interfaces:**
- Consumes: nothing new.
- Produces: nothing new — this task only removes data, no interface changes. `Projects`' existing render logic, `Project` type, and all other entries (Ultiboard, iCloud Album Downloader, Reddit Downloader, E-commerce Web Scraper, Tracker) are untouched.

- [ ] **Step 1: Remove the Proven and Life entries**

In `src/components/Projects.tsx`, the `projects` array currently contains (in this exact order) Ultiboard, iCloud Album Downloader, Proven, Life, Reddit Downloader, E-commerce Web Scraper, Tracker. Remove the Proven and Life objects entirely. Specifically, find this block (it sits between the iCloud Album Downloader entry and the Reddit Downloader entry):

```tsx
      {
        name: 'Proven',
        repoUrl: '',
        projUrl: 'https://fl.klbf-proven.raymonds.dev',
        imgUrl: 'https://raw.githubusercontent.com/RaymondSalim/CDN_Assets/main/Personal%20Website/Proven.png',
        imgAlt: 'Proven',
        techStacks: [
          'TypeScript', 'React', 'Vite.js',
        ],
        description: 'Developed a landing page for a client using React with TypeScript, featuring an interactive online quiz and Google Analytics integration for user engagement and tracking.',
        date: new Date(2023, 9),
      },
      {
        name: 'Life',
        repoUrl: '',
        projUrl: 'https://fl.klbf-life.raymonds.dev',
        imgUrl: 'https://raw.githubusercontent.com/RaymondSalim/CDN_Assets/main/Personal%20Website/Life.png',
        imgAlt: 'Proven',
        techStacks: [
          'TypeScript', 'React', 'Vite.js',
        ],
        description: 'Developed a landing page for a client using React with TypeScript, featuring Google Analytics integration for user engagement and tracking.',
        date: new Date(2024, 1),
      },
```

Delete this entire block (both objects, including their trailing commas), so the array goes directly from the iCloud Album Downloader entry's closing `},` to the Reddit Downloader entry's opening `{`.

- [ ] **Step 2: Verify compilation**

Run: `cd /Users/rsalim/personal/raymonds.dev && npx tsc --noEmit -p tsconfig.json 2>&1 | grep -i "Projects.tsx"`
Expected: no output.

- [ ] **Step 3: Visually verify in the dev server**

With `npm start` still running (from Task 3, Step 4) or restarted if stopped, scroll to the Projects section (now `04 · Projects`). Confirm it shows exactly five entries in this order: Ultiboard, iCloud Album Downloader, Reddit Downloader, E-commerce Web Scraper, Tracker. Confirm Proven and Life no longer appear here (they should now only appear in the Client Work section above it).

- [ ] **Step 4: Commit**

```bash
cd /Users/rsalim/personal/raymonds.dev
git add src/components/Projects.tsx
git commit -m "feat(client-work): remove Proven and Life from Projects (moved to Client Work)"
```

---

## Task 5: Desktop nav link

**Files:**
- Modify: `src/navigation/navbar/desktop/NavBar.tsx`

**Interfaces:**
- Consumes: the `#client-work` section anchor from Task 3.
- Produces: nothing new consumed by later tasks.

- [ ] **Step 1: Add the nav link**

Current full contents of the `<ul>` in `src/navigation/navbar/desktop/NavBar.tsx`:
```tsx
        <ul className={'flex space-x-8 items-center h-full'}>
          <li>
            <a
              href="#about-me">
              <span>About Me</span>
            </a>
          </li>
          <li>
            <a href="#experience">
              <span>Experience</span>
            </a>
          </li>
          <li>
            <a href="#projects">
              <span>Projects</span>
            </a>
          </li>
          <li>
            <a href="#contact">
              <span>Contact</span>
            </a>
          </li>
          <li className={'toggle-container'}>
            <DarkModeToggle singleIconDim={iconDim?.pixels} isDarkModeEnabled={this.props.darkMode}
                            onChange={this.props.darkModeToggle} singleIconMode={true}/>
          </li>
        </ul>
```

Replace with (inserting a new `<li>` between Experience and Projects):
```tsx
        <ul className={'flex space-x-8 items-center h-full'}>
          <li>
            <a
              href="#about-me">
              <span>About Me</span>
            </a>
          </li>
          <li>
            <a href="#experience">
              <span>Experience</span>
            </a>
          </li>
          <li>
            <a href="#client-work">
              <span>Client Work</span>
            </a>
          </li>
          <li>
            <a href="#projects">
              <span>Projects</span>
            </a>
          </li>
          <li>
            <a href="#contact">
              <span>Contact</span>
            </a>
          </li>
          <li className={'toggle-container'}>
            <DarkModeToggle singleIconDim={iconDim?.pixels} isDarkModeEnabled={this.props.darkMode}
                            onChange={this.props.darkModeToggle} singleIconMode={true}/>
          </li>
        </ul>
```

- [ ] **Step 2: Verify compilation**

Run: `cd /Users/rsalim/personal/raymonds.dev && npx tsc --noEmit -p tsconfig.json 2>&1 | grep -i "NavBar.tsx"`
Expected: no output.

- [ ] **Step 3: Visually verify at desktop width**

With the dev server running, resize the browser to at least 1024px wide (desktop nav only shows at `md:` and up — check `src/navigation/navbar/desktop/NavBar.css` if unsure of the exact breakpoint, but any width ≥1024px is safely past it). Confirm the header nav now reads "About Me · Experience · Client Work · Projects · Contact" and clicking "Client Work" scrolls to the new section.

- [ ] **Step 4: Commit**

```bash
cd /Users/rsalim/personal/raymonds.dev
git add src/navigation/navbar/desktop/NavBar.tsx
git commit -m "feat(client-work): add Client Work link to desktop nav"
```

---

## Task 6: Mobile nav link

**Files:**
- Modify: `src/navigation/menu/Menu.tsx`

**Interfaces:**
- Consumes: `Handshake` icon from Task 1 (`import { Handshake } from '../../icons/Handshake';`), the `#client-work` section anchor from Task 3.
- Produces: nothing new consumed by later tasks.

- [ ] **Step 1: Add the import**

Current top-of-file imports in `src/navigation/menu/Menu.tsx`:
```tsx
import React, { SyntheticEvent } from 'react';
import { User } from '../../icons/User';
import { Work } from '../../icons/Work';
import { Project } from '../../icons/Project';
import { Contact } from '../../icons/Contact';
import { DarkModeToggle } from '../../util/darkmode/DarkModeToggle';
import BaseProps from '../../common/interface/BaseProps';
```
Add the new icon import after the `Work` import:
```tsx
import React, { SyntheticEvent } from 'react';
import { User } from '../../icons/User';
import { Work } from '../../icons/Work';
import { Handshake } from '../../icons/Handshake';
import { Project } from '../../icons/Project';
import { Contact } from '../../icons/Contact';
import { DarkModeToggle } from '../../util/darkmode/DarkModeToggle';
import BaseProps from '../../common/interface/BaseProps';
```

- [ ] **Step 2: Add the nav link**

Current full contents of the `<ul>` in `src/navigation/menu/Menu.tsx`:
```tsx
        <ul>
          <li>
            <a href="#about-me" onClick={this.props.onItemClick}>
              <User/>
              <span>About Me</span>
            </a>
          </li>
          <li>
            <a href="#experience" onClick={this.props.onItemClick}>
              <Work/>
              <span>Experience</span>
            </a>
          </li>
          <li>
            <a href="#projects" onClick={this.props.onItemClick}>
              <Project/>
              <span>Projects</span>
            </a>
          </li>
          <li>
            <a href="#contact" onClick={this.props.onItemClick}>
              <Contact/>
              <span>Contact</span>
            </a>
          </li>
        </ul>
```

Replace with (inserting a new `<li>` between Experience and Projects, using the same `onClick={this.props.onItemClick}` pattern every other link uses so tapping it also closes the mobile menu):
```tsx
        <ul>
          <li>
            <a href="#about-me" onClick={this.props.onItemClick}>
              <User/>
              <span>About Me</span>
            </a>
          </li>
          <li>
            <a href="#experience" onClick={this.props.onItemClick}>
              <Work/>
              <span>Experience</span>
            </a>
          </li>
          <li>
            <a href="#client-work" onClick={this.props.onItemClick}>
              <Handshake/>
              <span>Client Work</span>
            </a>
          </li>
          <li>
            <a href="#projects" onClick={this.props.onItemClick}>
              <Project/>
              <span>Projects</span>
            </a>
          </li>
          <li>
            <a href="#contact" onClick={this.props.onItemClick}>
              <Contact/>
              <span>Contact</span>
            </a>
          </li>
        </ul>
```

- [ ] **Step 3: Verify compilation**

Run: `cd /Users/rsalim/personal/raymonds.dev && npx tsc --noEmit -p tsconfig.json 2>&1 | grep -i "Menu.tsx"`
Expected: no output.

- [ ] **Step 4: Visually verify at mobile width**

With the dev server running, resize the browser below the mobile breakpoint (390px wide is a safe test width, matching this project's established mobile-testing convention) and open the hamburger menu. Confirm it now lists "About Me · Experience · Client Work · Projects · Contact" with a distinct handshake icon next to "Client Work" (not a duplicate of the Experience briefcase icon or the Projects package icon), and tapping it scrolls to the Client Work section and closes the menu.

- [ ] **Step 5: Commit**

```bash
cd /Users/rsalim/personal/raymonds.dev
git add src/navigation/menu/Menu.tsx
git commit -m "feat(client-work): add Client Work link to mobile nav"
```

---

## Task 7: Full verification sweep

**Files:**
- No file modifications expected — this task is a verification gate. If it finds something, fix it in the file it's found in and note the fix in the commit message.

**Interfaces:**
- Consumes: everything from Tasks 1-6.
- Produces: confidence the whole feature works end-to-end, not just task-by-task in isolation.

- [ ] **Step 1: Stop any running dev server, then run a clean production build**

Run: `cd /Users/rsalim/personal/raymonds.dev && npm run build 2>&1 | tail -20`
Expected: `The build folder is ready to be deployed.` with no compile errors (pre-existing ESLint warnings on files this plan didn't touch, e.g. `import/prefer-default-export` on unrelated icon files, are not this task's concern). Clean up afterward: `rm -rf build`.

- [ ] **Step 2: Full manual pass — desktop light, desktop dark, mobile light, mobile dark**

Run: `cd /Users/rsalim/personal/raymonds.dev && npm start`, then for each of the 4 combinations (desktop ≥1024px width / mobile 390px width, × light / dark via the header's dark-mode toggle), scroll the entire page top to bottom and confirm:
- Eyebrows read `01 · About`, `02 · Experience`, `03 · Client Work`, `04 · Projects`, `05 · Contact` in that exact order with no gaps or duplicates.
- The Client Work section's three cards (HMS, Proven, Life) render correctly in both themes — client name uses the accent color in both light and dark (confirm it doesn't disappear or lose contrast in either theme), tech-stack chips are legible, and only Proven/Life show the external-link icon.
- The Client Work section's top border and spacing match Experience and Projects exactly (confirming the zero-`App.css`-changes assumption held).
- Both nav components (desktop header, mobile hamburger menu) show all 5 links in the correct order and each one scrolls to the correct section.
- Projects section shows exactly 5 entries (no Proven/Life).

- [ ] **Step 3: Run lint across all touched files**

Run: `cd /Users/rsalim/personal/raymonds.dev && npx eslint --ext .tsx,.ts src/icons/Handshake.tsx src/components/ClientWork.tsx src/App.tsx src/components/Projects.tsx src/navigation/navbar/desktop/NavBar.tsx src/navigation/menu/Menu.tsx`
Expected: zero errors. Any warnings should match the pre-existing pattern already present across this codebase's other class-component files (`import/prefer-default-export`, `class-methods-use-this`) — if a genuinely new warning category appears, fix it before proceeding.

- [ ] **Step 4: Final commit (only if Step 1 or 2 required fixes)**

```bash
cd /Users/rsalim/personal/raymonds.dev
git add -A
git commit -m "fix(client-work): address issues found in final verification sweep"
```

If nothing needed fixing, skip this commit — there's nothing to commit.

---

## Explicitly not covered by this plan

- Adding real screenshots or images to Client Work cards — this layout has no image slot by design (per the spec's chosen mockup option).
- Any change to the Projects component's own rendering behavior (hover-reveal mechanic, alternating layout, image handling) beyond removing two array entries.
- Any content rewrite of HMS/Proven/Life's descriptions beyond what's specified in Task 2 — Proven/Life copy is carried over verbatim from the current Projects entries; HMS copy is synthesized from the resume as specified in the design doc.
- A "Client Work" entry in the site's `<title>`/meta tags or sitemap — out of scope, not mentioned in the spec.
