# Brutalist Terminal Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Re-skin the existing site (structure/components unchanged) into the Brutalist Terminal aesthetic — off-white/black base with alarm-orange accent, Big Shoulders + Space Mono type, square corners, hard borders, no soft shadows — while fixing two known bugs (mobile project-image grayscale, experience-tab overflow affordance) along the way.

**Architecture:** Pure CSS/Tailwind-config/JSX-className changes to the existing class-component tree. No new components, no new dependencies beyond two Google Fonts. Two new Tailwind color tokens (`brutalist.*`) replace `blue.*`/`gray.*`. Every section is edited in the order a visitor scrolls: header → hero → about → experience → projects → contact → footer, then a final repo-wide sweep confirms no legacy token or rounded corner survived.

**Tech Stack:** React 17 class components, Tailwind CSS 3 (`darkMode: 'class'`), craco, existing `dark:` variant convention driven by `document.body.classList`.

## Global Constraints

- No `border-radius`/`rounded-*` anywhere in touched files — square corners only (spec: "Structural language").
- No `drop-shadow-*`/`shadow-*` anywhere in touched files — flat, no soft light sources (spec: "Structural language", "Projects").
- Body/UI text uses Space Mono; headings (`h1`/`h2`/`h3`) and the nav logo mark use Big Shoulders (spec: "Typography"). No italics, no light weights.
- Accent color `#FF4B1F` is identical in light and dark themes; only `--bg`/`--fg`/`--fg-muted`/`--border`/`--surface` invert (spec: "Color" table).
- Every color must resolve to one of: `brutalist.bg`, `brutalist.fg`, `brutalist.fg-muted`, `brutalist.border`, `brutalist.accent`, `brutalist.accent-contrast`, `brutalist.surface`, or an unrelated semantic state color (form success/error green/red) — no leftover `blue-sapphire`/`blue-sky`/`gray-lightest`/`gray-light`/`gray-dark`/`gray-darker`/`gray-darkest` reference anywhere in `src/`.
- Section eyebrow numbering follows page order: About = `01`, Experience = `02`, Projects = `03`, Contact = `04`.
- The wavy SVG section dividers (`#section-curve-start`/`-end`) are removed entirely; sections rely on `--bg`/`--surface` contrast instead (resolves the spec's either/or into one decision, since the curve geometry doesn't map onto a straight-line replacement without new bespoke values).
- No content/copy changes (resume data is stale and arrives separately) — only structure, color, type, and the two named bug fixes.
- Terminal/shell mode is out of scope for this plan entirely.

---

## Task 1: Tailwind color tokens + font loading

**Files:**
- Modify: `tailwind.config.js`
- Modify: `public/index.html:41-44`

**Interfaces:**
- Produces: Tailwind color tokens `brutalist.bg`, `brutalist.fg`, `brutalist.fg-muted`, `brutalist.border`, `brutalist.accent`, `brutalist.accent-contrast`, `brutalist.surface` — every later task's className edits reference these by name (e.g. `bg-brutalist-bg`, `text-brutalist-accent`, `border-brutalist-border`). Tailwind's default color-object nesting means `brutalist: { bg: '#FAFAF7', ... }` yields utility classes `bg-brutalist-bg`, `text-brutalist-fg`, etc.
- Produces: `font-display` (Big Shoulders) and `font-mono` (Space Mono) Tailwind font-family utilities via `theme.extend.fontFamily`.

- [ ] **Step 1: Add the brutalist color palette and font families to `tailwind.config.js`**

Replace the full file:

```js
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx,css}', './public/index.html'],
  darkMode: 'class', // or 'media' or 'class'
  theme: {
    extend: {
      colors: {
        'current': 'currentColor',
        'brutalist': {
          bg: '#FAFAF7',
          fg: '#0A0A0A',
          'fg-muted': '#4B5563',
          border: '#0A0A0A',
          accent: '#FF4B1F',
          'accent-contrast': '#0A0A0A',
          surface: '#FFFFFF',
        },
      },
      fontFamily: {
        display: ['"Big Shoulders"', 'sans-serif'],
        mono: ['"Space Mono"', 'monospace'],
      },
      screens: {
        '2xl': '1536px',

        'bp-max-1080': {
          'max': '1080px',
        },
        'bp-max-768': {
          'max': '768px',
        },
        'bp-max-600': {
          'max': '600px'
        },
        'bp-max-480': {
          'max': '480px'
        }
      },
    },
  },
  plugins: [],
}
```

Note: the dark-theme inversion (`bg: #0A0A0A`, `fg: #FAFAF7`, `surface: #141414`, `fg-muted: #9CA3AF`) is applied per-utility via Tailwind's `dark:` variant in each component's className (e.g. `bg-brutalist-bg dark:bg-brutalist-fg` is wrong — instead each usage pairs the light value with its dark override explicitly, e.g. `bg-brutalist-bg dark:bg-[#0A0A0A]`). Concretely: keep `brutalist.bg`/`brutalist.fg`/`brutalist.border` as the **light** values only, and every component applies `dark:` overrides with the literal dark hex per the Color table. This avoids a second token namespace and matches the existing `dark:` convention already used throughout the codebase (e.g. `dark:bg-gray-darkest`).

- [ ] **Step 2: Swap font `<link>` tags in `public/index.html`**

Replace lines 40-44:

```html
    <!-- Fonts -->
    <link rel="preconnect" href="https://fonts.gstatic.com">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;700&display=swap" rel="stylesheet">
    <link href="https://fonts.googleapis.com/css2?family=Caveat&display=swap" rel="stylesheet">
```

with:

```html
    <!-- Fonts -->
    <link rel="preconnect" href="https://fonts.gstatic.com">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link href="https://fonts.googleapis.com/css2?family=Big+Shoulders:wght@700;900&family=Space+Mono:wght@400;700&display=swap" rel="stylesheet">
```

- [ ] **Step 3: Verify the config parses and the dev server starts**

Run: `npm start`
Expected: dev server compiles with no Tailwind config errors; visiting `localhost:3000` still shows the (still old-styled) site — this task only adds tokens, nothing consumes them yet. Stop the server (Ctrl+C) once confirmed.

- [ ] **Step 4: Commit**

```bash
git add tailwind.config.js public/index.html
git commit -m "feat(theme): add brutalist color tokens and swap fonts to Big Shoulders/Space Mono"
```

---

## Task 2: Base typography + global body/link/focus styles

**Files:**
- Modify: `src/index.css:61-182` (body font, `@layer base` block: headings, tag-decoration pseudo-elements, links, focus rings, list markers)
- Modify: `src/index.css:12-47` (scrollbar colors)
- Modify: `src/index.css:184-270` (`@layer utilities`: `.content` untouched, `.text-highlight` accent color, `.bg-skills-icon` removed — consumed by Task 5, `.page-background-color` removed as dead/superseded)

**Interfaces:**
- Consumes: `brutalist.*` Tailwind tokens and `font-display`/`font-mono` from Task 1.
- Produces: global `body` font is Space Mono; `h1`/`h2`/`h3` font is Big Shoulders; the tag-decoration pseudo-elements (`<h1>`, `</h1>`, etc.) are removed entirely, per the spec's decision to drop that motif; `a`/focus-ring/`li::marker`/`.text-highlight::after`/scrollbar all use `brutalist.accent` instead of `blue-sapphire`/`blue-sky`. Later tasks (3-8) inherit this base and only add section-specific overrides.

- [ ] **Step 1: Rewrite `src/index.css`**

Replace the full file:

```css
@import "tailwindcss/base.css";
@import "tailwindcss/components.css";
@import "tailwindcss/utilities.css";

@import "App.css";
@import "buttons/buttons.css";
@import "icons/icons.css";
@import "navigation/navigation.css";
@import "components/components.css";

/* Scrollbar */
@supports selector(::-webkit-scrollbar) {
    /* Width */
    ::-webkit-scrollbar {
        width: 5px;
    }

    /* Handle */
    ::-webkit-scrollbar-thumb {
        @apply bg-brutalist-accent;
    }

    /* Handle on hover */
    ::-webkit-scrollbar-thumb:hover {
        @apply bg-brutalist-fg dark:bg-brutalist-bg;
    }

    @supports (overflow: overlay) {
        html {
            overflow: overlay;
        }
    }

    @supports not (overflow: overlay) {
        ::-webkit-scrollbar {
            background: #6A706E;
        }
    }
}

@supports not selector(::-webkit-scrollbar) {
    html {
        scrollbar-color: #FF4B1F #6A706E;
        scrollbar-width: thin;
    }
}

html {
    scroll-behavior: smooth;
    overflow-x: hidden;
}

:root {
    --header-height: 6rem;
    --header-height-scroll: 4rem;
    --body-height: calc(100vh - var(--header-height));
}

body {
    @apply font-mono;
}

@layer base {
    /* Headings & texts */
    h1, h2, h3, h4, h5, h6, h1 span {
        @apply font-display dark:text-brutalist-bg text-brutalist-fg relative;
    }

    span, p, li, a {
        @apply font-mono dark:text-brutalist-fg-muted text-brutalist-fg-muted relative 2xl:text-xl;
    }

    ul {
        @apply relative;
    }

    h1 {
        @apply text-4xl font-black uppercase my-7;
    }

    h2 {
        @apply dark:text-brutalist-bg text-brutalist-fg text-3xl my-5 mb-8 font-black uppercase;
        font-size: clamp(1.4rem, 4vw, 2.65rem);
        line-height: clamp(1.4rem, 4vw, 2.65rem);
    }

    h3 {
        @apply text-xl font-bold dark:text-brutalist-fg-muted my-3;
    }

    a {
        @apply text-brutalist-accent dark:text-brutalist-accent;
    }

    a:focus,
    button:focus,
    .focus-reset:focus {
        @apply ring-0 outline-none border-brutalist-accent;
    }

    li::marker {
        @apply text-brutalist-accent;
    }
}

@layer utilities {
    .content {
        @apply bp-max-480:mx-6 bp-max-768:mx-14 bp-max-1080:mx-[6.25rem] mx-36 max-w-[1000px] mx-auto;
    }

    .color-red {
        color: #C62828;
    }

    .h-header {
        height: var(--header-height);
    }

    .h-header-scroll {
        height: var(--header-height-scroll);
    }

    .h-w-header-scroll {
        height: var(--header-height-scroll);
        width: var(--header-height-scroll);
    }

    .h-body {
        height: var(--body-height);
    }

    .top-header-scroll {
        top: var(--header-height-scroll);
    }

    .top-header {
        top: var(--header-height);
    }

    .pt-header-height {
        padding-top: var(--header-height);
    }

    .min-h-1\/3vh {
        min-height: max(33.3vh, 300px);
    }

    .text-highlight {
        @apply relative no-underline focus:ring-0 group-focus:after:w-full group-hover:after:w-full;
    }

    .text-highlight::after {
        @apply inline-block content-[""] absolute left-0 bottom-0 h-[1px] w-0 bg-brutalist-accent transition-all ease-in-out;
    }

    .text-highlight:focus::after,
    .text-highlight:hover::after {
        @apply w-full;
    }
}
```

Notes on what was dropped vs. the original: `--header-dark` (dead custom property, confirmed unused anywhere else in the repo), `.div-pseudo`/`.no-pseudo`/`.child-no-pseudo`/`.multiple-p`/`.p-before`/`.p-after` and all `h1::before`/`::after` etc. rules (the entire tag-decoration motif, per spec), `.page-background-color` (dead — not referenced by any component), `.bg-skills-icon` (superseded in Task 5, where the skill-icon container becomes a square outlined tile instead of a radial-gradient circle).

- [ ] **Step 2: Search for now-dead classNames before moving on**

Run: `grep -rn "div-pseudo\|no-pseudo\|multiple-p\|p-before\|p-after\|page-background-color" src/ --include="*.tsx"`
Expected output: only `src/App.tsx` lines referencing `multiple-p`, `after:p-after`, `before:p-before` (these are cleaned up in Task 3, which rewrites `App.tsx`'s About section) and `src/components/Contact.css:69` / `src/components/Experiences.css:6,50` / `src/components/Projects.css:43` referencing `no-pseudo`/`div-pseudo`/`child-no-pseudo` (cleaned up in Tasks 4/6/7 respectively). This step is a checkpoint, not a fix — confirming the removed utility classes' remaining call sites are all accounted for in later tasks, so nothing silently breaks.

- [ ] **Step 3: Commit**

```bash
git add src/index.css
git commit -m "feat(theme): rewrite global typography/link/focus styles for brutalist palette, drop tag-decoration motif"
```

---

## Task 3: Header, nav (desktop + mobile), and hero

**Files:**
- Modify: `src/navigation/Header.css` (full file)
- Modify: `src/navigation/navbar/desktop/NavBar.css` (full file — covers uppercase/letter-spacing via the existing `#navbar-desktop li a span` selector, no `.tsx` edit needed)
- Modify: `src/navigation/navbar/mobile/Hamburger.css:14-30` (burger color + remove `rounded-lg`)
- Modify: `src/navigation/menu/Menu.css` (full file)
- Modify: `src/util/darkmode/DarkModeToggle.tsx:22,36,38` (icon color classNames)
- Modify: `src/icons/Logo.tsx:32` (className)
- Modify: `src/App.css:1-7,37-59` (`main`, `#page` global background — plan gap discovered during implementation, these two rules were unclaimed by any task and blocked the production build; plus `#home`, `#home-content`, hero `h1`/`p`)
- Modify: `src/App.tsx:140-154` (hero section JSX — apply `.content` to `#home-content`, static accent on "Raymond", restyled button className)
- Modify: `src/buttons/Button.css` (full file)

**Interfaces:**
- Consumes: `brutalist.*` tokens (Task 1), base type styles (Task 2).
- Produces: `.btn` class now means "solid accent-filled CTA, square corners" — Task 7 (Contact submit button) reuses this exact class unchanged, per spec ("Submit button reuses the same solid-accent button treatment").

- [ ] **Step 1: Rewrite `src/navigation/Header.css`**

```css
#header {
    @apply bg-brutalist-bg dark:bg-brutalist-fg z-50 fixed max-w-[100vw] w-full top-0 flex justify-between transition-all duration-[250ms] px-4 border-b-2 border-brutalist-border dark:border-brutalist-bg;
}

#header.header-hidden {
    @apply !bg-opacity-90 backdrop-blur-md h-header-scroll;
}

#header .header-logo {
    @apply text-brutalist-fg dark:text-brutalist-bg hover:text-brutalist-accent dark:hover:text-brutalist-accent p-1 h-[calc(var(--header-height-scroll)-1rem)] w-[calc(var(--header-height-scroll)-1rem)] my-auto ml-3 z-40 transition-colors;
}

#header nav {
    @apply h-[fit-content] my-auto;
}
```

- [ ] **Step 2: Rewrite `src/navigation/navbar/desktop/NavBar.css`**

```css
#navbar-desktop {
    @apply hidden md:block mr-4;
}

#navbar-desktop ul::before,
#navbar-desktop ul::after {
    @apply content-none;
}

#navbar-desktop li a {
    @apply p-2;
}

#navbar-desktop li a span {
    @apply dark:text-brutalist-bg text-brutalist-fg transition-colors duration-200 2xl:text-lg uppercase tracking-wide text-sm font-bold;
}

#navbar-desktop li a:hover span {
    @apply text-brutalist-accent dark:text-brutalist-accent;
}

#navbar-desktop .toggle-container {
    @apply !ml-4 h-7 w-7;
}
```

- [ ] **Step 3: Update `src/navigation/navbar/mobile/Hamburger.css`**

Modify lines 14-30 (the `.burger-btn` and `.burger > div, .burger::before, .burger::after` rules):

```css
.burger-btn {
    @apply h-full z-40 flex items-center relative p-4 outline-none;
}

.burger-container {
    @apply cursor-pointer;
    height: var(--burger-container-height);
    width: var(--burger-width);
}

.burger > div,
.burger::before,
.burger::after {
    @apply bg-brutalist-fg dark:bg-brutalist-bg origin-center;
    height: var(--burger-height);
    border-radius: 0;
    animation: var(--animation-time) forwards;
}
```

(Only these two rule blocks change — `border-radius: var(--burger-border-rad)` becomes `border-radius: 0`, and `rounded-lg` is dropped from `.burger-btn`, and the accent color swaps from `bg-blue-sapphire` to the fg/bg pair. Every other rule in the file — the animation keyframes — is untouched.)

- [ ] **Step 4: Rewrite `src/navigation/menu/Menu.css`**

```css
#mobile-menu {
    @apply fixed top-0 left-full right-0 w-[min(75vw,400px)] h-screen pt-[var(--header-height)] p-4 z-30
    bg-brutalist-bg dark:bg-brutalist-fg border-l-2 border-brutalist-border dark:border-brutalist-bg transition-all flex flex-col;
}

#mobile-menu ul::before,
#mobile-menu ul::after {
    @apply content-none;
}

#mobile-menu li {
    @apply p-4 flex justify-start items-center;
}

#mobile-menu li a {
    @apply flex items-center;
}

#mobile-menu li a svg {
    @apply dark:text-brutalist-bg text-brutalist-fg transition-colors duration-200 shrink-0;
}

#mobile-menu li a:hover span,
#mobile-menu li a:hover svg {
    @apply text-brutalist-accent dark:text-brutalist-accent;
}

#mobile-menu li a span {
    @apply text-xl ml-8 p-4 flex justify-center align-middle dark:text-brutalist-bg text-brutalist-fg transition-colors duration-200 font-mono uppercase tracking-wide;
}

#layer {
    @apply bg-brutalist-fg dark:bg-brutalist-bg fixed top-0 left-0 bottom-0 right-0 z-20 transition-opacity h-screen opacity-30;
}

#mobile-menu .toggle-container {
    @apply mt-auto mb-16;
}
```

(`#layer` is dead CSS — confirmed via repo search that no component renders an element with `id="layer"` — kept as-is here since removing dead CSS is out of scope for this redesign and it does no harm; only its color values are updated for consistency in case it's wired up later.)

- [ ] **Step 5: Update dark mode toggle icon colors in `src/util/darkmode/DarkModeToggle.tsx`**

Line 22, change:
```tsx
             className={'relative focus:text-blue-sapphire dark:focus:text-blue-sapphire focus:ring-0 hover:text-blue-sapphire dark:text-white dark:hover:text-blue-sapphire select-none'}
```
to:
```tsx
             className={'relative focus:text-brutalist-accent dark:focus:text-brutalist-accent focus:ring-0 hover:text-brutalist-accent dark:text-brutalist-bg dark:hover:text-brutalist-accent select-none'}
```

Line 36, change:
```tsx
          <Sun className={`mr-5 ${!this.props.isDarkModeEnabled ? 'text-blue-sapphire' : 'text-white'}`}/>)}
```
to:
```tsx
          <Sun className={`mr-5 ${!this.props.isDarkModeEnabled ? 'text-brutalist-accent' : 'text-brutalist-bg'}`}/>)}
```

Line 38, change:
```tsx
          <Moon className={`ml-5 ${this.props.isDarkModeEnabled ? 'text-blue-sapphire' : 'text-black'}`}/>)}
```
to:
```tsx
          <Moon className={`ml-5 ${this.props.isDarkModeEnabled ? 'text-brutalist-accent' : 'text-brutalist-fg'}`}/>)}
```

- [ ] **Step 6: Update `src/icons/Logo.tsx`**

Line 32, change:
```tsx
        className={`text-blue-sapphire ${this.props.className}`}
```
to:
```tsx
        className={`text-brutalist-fg dark:text-brutalist-bg hover:text-brutalist-accent dark:hover:text-brutalist-accent transition-colors ${this.props.className}`}
```

- [ ] **Step 7: Rewrite `src/buttons/Button.css`**

```css
.btn {
    @apply border-2 border-brutalist-border dark:border-brutalist-bg bg-brutalist-accent w-[fit-content] font-mono font-bold uppercase tracking-wide cursor-pointer transition-colors text-brutalist-accent-contrast;
}

.btn:hover {
    @apply bg-brutalist-fg dark:bg-brutalist-bg text-brutalist-bg dark:text-brutalist-fg;
}

.btn:focus {
    @apply ring-0 bg-brutalist-fg dark:bg-brutalist-bg text-brutalist-bg dark:text-brutalist-fg;
}
```

(This replaces the previous soft-outline pill with a solid accent-filled square-corner CTA per spec. Hover/focus invert to the fg/bg pair rather than staying on-accent, so the state change is visible.)

- [ ] **Step 8: Rewrite the hero block in `src/App.css`**

First, modify lines 1-7 (the `main` and `#page` rules — these set the global page background and were missed by this task's original file-line range; they use the same now-removed `gray-*` tokens and block the production build until fixed):

```css
main {
    @apply bg-brutalist-bg dark:bg-brutalist-fg transition-all ease-in duration-150;
}

#page {
    @apply antialiased relative bg-brutalist-bg dark:bg-brutalist-fg;
}
```

Then modify lines 29-59 (from `#section-curve-start` through the end of the `#home-content p` rule):

```css
#home {
    @apply h-screen fixed top-0 right-0 left-0 bg-brutalist-bg dark:bg-brutalist-fg max-w-[100vw];
    z-index: -9000;
}

#home-content {
    @apply flex flex-col h-full justify-center;
}

#home-content h1,
#home-content h1 > span {
    font-size: clamp(2.25rem, 8vw, 5rem);
    line-height: clamp(2.25rem, 8vw, 5rem);
}

#home-content h1 > span {
    @apply text-brutalist-accent;
}

#home-content p {
    @apply my-10 text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold font-mono normal-case;
}
```

Note: `#section-curve-start`/`#section-curve-end` rules are deleted entirely (the wavy dividers are removed per Global Constraints — their JSX is removed in Step 10 below, so these CSS rules become dead code if left in; deleting them here keeps CSS and JSX in sync in the same commit).

- [ ] **Step 9: Update hero + divider JSX in `src/App.tsx`**

Replace lines 140-154 (the `<section id="home">` block):

```tsx
          <section id="home">
            <div id="home-content" className="content">
              <h1>
                Hi, my
                <br/>
                name is&nbsp;
                <span><strong>Raymond</strong></span>
                .
              </h1>
              <p>I&apos;m a software engineer specializing in backend development.</p>
              <Button text="Hire me!" className="px-8 py-4 mt-4" href="#contact" onfocus={() => {
                window.scrollTo(0, 0);
              }}/>
            </div>
          </section>
```

with:

```tsx
          <section id="home">
            <div id="home-content" className="content">
              <h1>
                Hi, my
                <br/>
                name is&nbsp;
                <span><strong>Raymond</strong></span>
                .
              </h1>
              <p>I&apos;m a software engineer specializing in backend development.</p>
              <Button text="Hire me!" className="px-8 py-4 mt-4" href="#contact" onfocus={() => {
                window.scrollTo(0, 0);
              }}/>
            </div>
          </section>
```

(No JSX change is needed here beyond removing the `.content` question — it's already applying `className="content"` on `#home-content` in the current source, confirmed by reading the file. The real edits are the two curve-divider `<div>` blocks below, at the start of `#about-me` and the end of `#contact`.)

Now remove the start-curve div (originally lines 158-169, immediately after the `<section id="about-me">` opening tag and `#menu-blur-layer` div): delete the entire
```tsx
            <div id="section-curve-start">
              <svg
                className="fill-current w-screen"
                viewBox="0 0 1440 145.68176"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M 0,132.29692 84.485809,105.64055 C 190.92453,72.057753 239.56437,71.31983 360,90 486.54269,109.20909 660,43.000003 780,53.300003 c 120,10.7 240,42.7 360,37.4 C 1260,85.000003 1320,50 1380,21.3 L 1440,0 V 145.68176 H 1380 1080 720 360 60 0 Z"
                />
              </svg>
            </div>
```
block, so `<section id="about-me">` goes straight to `<div id="about-me-content" className="content">`.

And remove the end-curve div (originally lines 229-240, inside `<section id="contact">` after the `#contact-content` div): delete the entire
```tsx
            <div id="section-curve-end">
              <svg
                className="fill-current w-screen"
                viewBox="0 0 1440 197.57188"
                version="1.1"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="m 0,197.57189 34.3,-32 c 34.3,-32 102.7,-96.000002 171.7,-96.000002 68.3,0 137,64.000002 205,74.700002 69,10.3 138,-31.7 206,-64.000002 68.7,-31.7 137,-53.7 206,-37.4 68.4,15.7 137,69.700002 206,58.700002 94.4653,-6.347816 143.7223,-45.494867 220.5845,-69.268819 C 1315.9249,14.100715 1376.1797,14.46226 1440,14.593227 V 0 H 1405.7 1234 1029 823 617 411 206 34 0 Z"
                />
              </svg>
            </div>
```
block, so `</section>` closes `<section id="contact">` immediately after the `#contact-content` div's closing tag.

- [ ] **Step 10: Run the app and visually verify**

Run: `npm start`, open `http://localhost:3000`.
Expected: header has a 2px bottom border, nav links are uppercase Space Mono, hero heading is Big Shoulders (condensed/bold) with "Raymond" always shown in orange, the "Hire me!" button is a solid orange square-cornered block, no wavy divider shapes appear between hero/about or contact/footer. Toggle dark mode — confirm header/hero/nav invert to near-black background with off-white text, orange accent unchanged. Toggle the mobile hamburger menu — confirm square corners on the burger button and the slide-out panel, orange hover state on nav items.

- [ ] **Step 11: Commit**

```bash
git add src/navigation src/util/darkmode/DarkModeToggle.tsx src/icons/Logo.tsx src/App.css src/App.tsx src/buttons/Button.css
git commit -m "feat(redesign): restyle header, nav, hamburger menu, and hero for brutalist theme"
```

---

## Task 4: About section

**Files:**
- Modify: `src/App.tsx:158-211` (about-me section: remove curve div already handled in Task 3 Step 10; add `01 · ABOUT` eyebrow; remove `multiple-p`/`p-before`/`p-after` classNames now that the pseudo-element system is gone; update link className)
- Modify: `src/icons/Skill.css` (full file — circle to square tile)

**Interfaces:**
- Consumes: `brutalist.*` tokens, `.text-highlight` (Task 2), removed hero curve div (Task 3).
- Produces: `.skill-icon-container` is now a square bordered tile — no other task depends on this class elsewhere.

- [ ] **Step 1: Update the About section JSX in `src/App.tsx`**

Replace (this is the block that follows immediately after `<section id="about-me">`, once Task 3 Step 10 has already removed the `#section-curve-start` div — so this is now the first child of the section):

```tsx
            <div id="about-me-content" className="content">
              <h2>About me</h2>
              <div id="about-me-grid">
                <div className="row-start-1 md:col-start-1">
                  <div className="multiple-p">
                    <p>I am passionate about creating software that improves and simplifies the lives of those around
                      me. My interest in software development started back in 2019 when I stumbled upon a youtube
                      tutorial on building an android application.</p>
                    <p className="after:content-none md:after:p-after">
                      Fast forward to today, I have developed software for clients ranging from individuals to large
                      enterprise corporations such as&nbsp;
                      <a href="https://www.tokopedia.com/about/" target="_blank" rel="noopener noreferrer" className={'text-highlight'}>Tokopedia</a>
                      ,&nbsp;
                      <a href="https://www.kalbe.co.id/" target="_blank" rel="noopener noreferrer" className={'text-highlight'}>Kalbe Farma</a>
                      , and&nbsp;
                      <a href="https://mandiri-investasi.co.id/en/" target="_blank"
                         rel="noopener noreferrer" className={'text-highlight'}>Mandiri</a>
                      .
                    </p>
                  </div>
                </div>
                <div className="-mt-10 md:mt-0 row-start-2 md:row-start-1 md:col-start-2">
                  <p className="before:content-none md:before:p-before">When I am not coding, you can find me doing any
                    of the following:</p>
                  <ul className="list-disc list-outside mt-8 ml-5">
                    <li>Gym</li>
                    <li>Badminton</li>
                    <li>Ultimate Frisbee</li>
                    <li>Rock Climbing</li>
                    <li>Watching/playing video games</li>
                  </ul>
                </div>
                <div className="row-start-3 md:row-start-2 md:col-span-full">
                  <p>Here are a few technologies I&apos;ve been working with recently:</p>
                  <div className="skills-flex-container">
                    {/* TODO! On mobile scroll animation */}
                    {skills.map((v) => <Skill key={v.label} label={v.label} icon={v.icon} iconClassName={v.padding}/>)}
                  </div>
                </div>
              </div>
            </div>
```

with:

```tsx
            <div id="about-me-content" className="content">
              <p className="font-mono uppercase tracking-wide text-sm text-brutalist-accent mb-2">01 &middot; About</p>
              <h2>About me</h2>
              <div id="about-me-grid">
                <div className="row-start-1 md:col-start-1">
                  <div>
                    <p>I am passionate about creating software that improves and simplifies the lives of those around
                      me. My interest in software development started back in 2019 when I stumbled upon a youtube
                      tutorial on building an android application.</p>
                    <p>
                      Fast forward to today, I have developed software for clients ranging from individuals to large
                      enterprise corporations such as&nbsp;
                      <a href="https://www.tokopedia.com/about/" target="_blank" rel="noopener noreferrer" className={'text-highlight'}>Tokopedia</a>
                      ,&nbsp;
                      <a href="https://www.kalbe.co.id/" target="_blank" rel="noopener noreferrer" className={'text-highlight'}>Kalbe Farma</a>
                      , and&nbsp;
                      <a href="https://mandiri-investasi.co.id/en/" target="_blank"
                         rel="noopener noreferrer" className={'text-highlight'}>Mandiri</a>
                      .
                    </p>
                  </div>
                </div>
                <div className="-mt-10 md:mt-0 row-start-2 md:row-start-1 md:col-start-2">
                  <p>When I am not coding, you can find me doing any
                    of the following:</p>
                  <ul className="list-disc list-outside mt-8 ml-5">
                    <li>Gym</li>
                    <li>Badminton</li>
                    <li>Ultimate Frisbee</li>
                    <li>Rock Climbing</li>
                    <li>Watching/playing video games</li>
                  </ul>
                </div>
                <div className="row-start-3 md:row-start-2 md:col-span-full">
                  <p>Here are a few technologies I&apos;ve been working with recently:</p>
                  <div className="skills-flex-container">
                    {/* TODO! On mobile scroll animation */}
                    {skills.map((v) => <Skill key={v.label} label={v.label} icon={v.icon} iconClassName={v.padding}/>)}
                  </div>
                </div>
              </div>
            </div>
```

(The `multiple-p`/`p-before`/`p-after`/`content-none` classNames are removed because they existed only to manage spacing around the now-deleted tag-decoration pseudo-elements — normal paragraph margins from Task 2's base styles take over. Spacing between paragraphs should be visually checked in Step 3 below since this removes bespoke margin overrides; if paragraphs look too close together, add `space-y-4` to the wrapping `<div>` around the two about-me paragraphs.)

- [ ] **Step 2: Rewrite `src/icons/Skill.css`**

```css
.skill-icon-container {
    @apply relative border-2 border-brutalist-border dark:border-brutalist-bg bg-brutalist-surface dark:bg-[#141414] transition-all hover:border-brutalist-accent h-20 w-20 lg:h-24 lg:w-24;
}

.skill-icon-container > svg {
    @apply absolute left-0 top-0 w-full h-full;
}
```

(Circle → square tile: `rounded-full` and the `bg-skills-icon` radial gradient are replaced with a flat bordered square that highlights its border on hover instead of scaling — consistent with the flat/no-shadow aesthetic. `hover:scale-110` is dropped since a hard-edged tile scaling up looks like a glitch, not a polish detail; hover feedback comes from the border color change instead.)

- [ ] **Step 3: Run the app and visually verify**

Run: `npm start`, scroll to the About section.
Expected: `01 · ABOUT` orange eyebrow label appears above the "About me" heading; paragraph spacing looks reasonable (adjust per the note in Step 1 if not); the 8 skill icons render as square bordered tiles, not circles, and their border turns orange on hover. Check dark mode: tiles use the darker surface color, still square, still bordered.

- [ ] **Step 4: Commit**

```bash
git add src/App.tsx src/icons/Skill.css
git commit -m "feat(redesign): restyle about section eyebrow, paragraphs, and skill icon tiles"
```

---

## Task 5: Experience section (tabs, active state, bullets, mobile-overflow fix)

**Files:**
- Modify: `src/components/Experiences.css` (full file)
- Modify: `src/components/Experiences.tsx:161-166` (active-tab className), `:216` (unchanged — verify only), no structural change otherwise
- Modify: `src/App.tsx:212-217` (add `02 · EXPERIENCE` eyebrow)

**Interfaces:**
- Consumes: `brutalist.*` tokens, base type (Task 2).
- Produces: none consumed by later tasks — this section is self-contained.

- [ ] **Step 1: Rewrite `src/components/Experiences.css`**

```css
#experience-grid {
    @apply max-w-[700px] mx-auto flex flex-col md:flex-row justify-center;
}

#experience-tabs {
    @apply flex md:flex-col w-full md:w-max overflow-auto md:overflow-visible items-start relative mt-3;
    -webkit-mask-image: linear-gradient(to right, black 90%, transparent 100%);
    mask-image: linear-gradient(to right, black 90%, transparent 100%);
}

@media (min-width: 768px) {
    #experience-tabs {
        -webkit-mask-image: none;
        mask-image: none;
    }
}

#experience-info {
    @apply w-full md:ml-8 relative;
}

#experience-tabs::-webkit-scrollbar {
    height: 3px;
}

.experience-tab-button {
    @apply px-5 py-2 relative duration-1000 transition-colors w-full whitespace-nowrap text-left text-brutalist-fg-muted dark:text-brutalist-fg-muted font-mono uppercase tracking-wide text-sm border-b-2 border-transparent;
}

.experience-tab-button:focus,
.experience-tab-button[aria-selected=true] {
    @apply ring-0 text-brutalist-accent border-brutalist-accent;
}

.experience-tab-button > span {
    @apply text-highlight focus-reset;
}

.experience-tab-selector {
    @apply hidden;
}

.experience-info-container {
    @apply absolute inline-block top-0 left-0;
}

.experience-info-container .experience-title {
    @apply mb-0;
}

.experience-title .company-name {
    @apply text-brutalist-accent;
}

.company-name a {
    @apply text-highlight;
}

.experience-info-container .job-description {
    @apply mt-4 list-none ml-0;
}

.job-description > li {
    @apply pl-6 relative;
}

.job-description > li::before {
    content: "\2014";
    @apply absolute left-0 text-brutalist-accent;
}

@keyframes exp-desc-fade-out {
    0% {
        position: static;
        transform: translateY(0);
        opacity: 100%;
    }

    50% {
        opacity: 0;
    }

    100% {
        position: absolute;
        top: 0;
        transform: translateY(2rem);
        opacity: 0;
    }
}

@keyframes exp-desc-fade-in {
    0% {
        position: absolute;
        top: 0;
        transform: translateY(2rem);
        opacity: 0;
    }

    50% {
        opacity: 100%;
    }

    100% {
        position: static;
        transform: translateY(0);
        opacity: 100%;
    }
}
```

Key changes from the original:
- The mobile-overflow fix: `#experience-tabs` gets a `mask-image` gradient that fades the trailing edge to transparent whenever the row can scroll further right, cleared entirely at `md:` and up (where the layout is vertical and non-scrolling). This uses `--bg`-independent alpha (black-to-transparent mask, not a color-matched fade) so it automatically works against any background — simpler and more robust than a background-color-matched overlay div, and requires no JS.
- Active tab indicator changes from the `>` glyph (`.experience-tab-selector`, now `hidden` — dead code kept only because removing the DOM node is a `.tsx` change out of this task's file list; hiding via CSS achieves the same visual result with a one-line change) to a 2px bottom border on the active tab button, matching the nav's underline language from Task 3.
- Job description bullets switch from `list-disc` to `—` em-dash markers via `::before`, per spec (visual echo of the terminal-mode mockup).
- `#experience-tabs` and `.experience-tab-button` drop `dark:text-white` in favor of the muted/accent token pair already covering both themes.

- [ ] **Step 2: Update the active-tab className in `src/components/Experiences.tsx`**

Line 165, change:
```tsx
            className={this.state.activeTabID === index ? 'text-blue-sapphire dark:text-blue-sky' : ''}
```
to:
```tsx
            className={this.state.activeTabID === index ? 'text-brutalist-accent' : ''}
```

- [ ] **Step 3: Add the `02 · EXPERIENCE` eyebrow in `src/App.tsx`**

Replace:
```tsx
          <section id="experience">
            <div id="experience-content" className="content">
              <h2>Experience</h2>
              <Experiences/>
            </div>
          </section>
```
with:
```tsx
          <section id="experience">
            <div id="experience-content" className="content">
              <p className="font-mono uppercase tracking-wide text-sm text-brutalist-accent mb-2">02 &middot; Experience</p>
              <h2>Experience</h2>
              <Experiences/>
            </div>
          </section>
```

- [ ] **Step 4: Run the app and visually verify — desktop**

Run: `npm start`. At a desktop width (resize browser to ~1440px or use devtools), check the Experience section: tabs are a vertical list, active tab has an orange bottom border and orange text, no `>` glyph visible, job description bullets are em-dashes not discs.

- [ ] **Step 5: Verify the mobile-overflow fix specifically**

In devtools, switch to a mobile viewport (390px width). Confirm: tabs render as a horizontal scrollable row, and — critically — the right edge of the tab row visibly fades to transparent when there are more tabs off-screen (scroll the row and confirm the fade disappears once scrolled to the end, since the mask is a static CSS gradient covering the *container's* edge — verify by checking that scrolling reveals the previously-cut-off tab, i.e. the mask itself doesn't move, but the underlying content does, so the last tab becomes clearly readable once scrolled into the non-faded region).

- [ ] **Step 6: Commit**

```bash
git add src/components/Experiences.css src/components/Experiences.tsx src/App.tsx
git commit -m "fix(experience): restyle tabs for brutalist theme, fix mobile tab-overflow affordance with edge fade"
```

---

## Task 6: Projects section (chips, grayscale bug fix, border/shadow removal)

**Files:**
- Modify: `src/components/Projects.css` (full file)
- Modify: `src/App.tsx:218-223` (add `03 · PROJECTS` eyebrow)

**Interfaces:**
- Consumes: `brutalist.*` tokens, base type (Task 2).
- Produces: none consumed elsewhere.

- [ ] **Step 1: Rewrite `src/components/Projects.css`**

```css
#project-grid {
    @apply flex flex-col gap-y-24 md:gap-y-36;
}

#project-grid > div {
    @apply w-full grid grid-cols-12 items-center;
}

.project-image-container {
    @apply relative col-start-1 col-end-13 row-start-1 row-end-2 bp-max-768:h-full;
}

.project-image-container::before {
    @apply bp-max-768:hidden absolute z-0 w-full h-full content-[""] bg-brutalist-accent bg-opacity-20 overflow-hidden;
}

.project-image-container::after {
    @apply bp-max-768:hidden absolute pointer-events-none w-full h-full translate-y-4 content-[""] outline outline-2 outline-brutalist-border dark:outline-brutalist-bg top-0 left-0 transition-all -z-20 overflow-hidden;
}

.project-image-container img {
    @apply bp-max-768:h-full bp-max-768:object-cover z-20 relative md:mix-blend-overlay transition-all md:grayscale overflow-hidden;
}

.project-image-container img:hover {
    @apply md:mix-blend-normal md:grayscale-0;
}

#project-grid > div[id^="project-"]:nth-of-type(even) .project-image-container {
    @apply md:col-start-6 md:col-end-13 after:-translate-x-4;
}

#project-grid > div[id^="project-"]:nth-of-type(odd) .project-image-container {
    @apply md:col-start-1 md:col-end-8 after:translate-x-4;
}

#project-grid > div[id^="project-"] .project-image-container:hover {
    @apply after:translate-x-0 after:translate-y-0 before:hidden;
}

.project-info-container {
    @apply bp-max-768:bg-brutalist-fg bp-max-768:bg-opacity-90 bp-max-768:!translate-y-0 bp-max-768:p-10 col-start-1 col-end-13
    row-start-1 row-end-2 z-20;
}

#project-grid > div[id^="project-"]:nth-of-type(even) .project-info-container {
    @apply md:col-start-1 md:col-end-7 md:text-left
}

#project-grid > div[id^="project-"]:nth-of-type(odd) .project-info-container {
    @apply md:col-start-7 md:col-end-13 md:text-right
}

.project-title {
    @apply text-brutalist-accent my-4;
}

.project-description-container {
    @apply md:bg-brutalist-fg md:border-2 md:border-brutalist-border dark:md:border-brutalist-bg p-6 bp-max-768:px-0 my-4;
}

.project-description-container > p {
    @apply mb-4 text-brutalist-bg;
}

.project-stack-list {
    @apply list-none my-4 flex flex-wrap gap-2;
}

#project-grid > div[id^="project-"]:nth-of-type(odd) .project-stack-list {
    @apply md:justify-end;
}

.project-stack-list > li {
    @apply inline-block bg-brutalist-accent text-brutalist-accent-contrast font-mono font-bold text-xs uppercase tracking-wide px-2 py-1;
}

.project-links {
    @apply inline-block transition-transform mx-2;
}

.project-links:hover {
    @apply scale-125 text-brutalist-accent;
}

#project-grid > div[id^="project-"]:nth-of-type(even) .project-links {
    @apply first:mr-0 last:ml-0;
}

#project-grid > div[id^="project-"]:nth-of-type(odd) .project-links {
    @apply first:ml-0 last:mr-0;
}
```

Key changes from the original:
- **Grayscale bug fix**: `grayscale` on line 22 of the original (unconditional) becomes `md:grayscale` — mobile now shows the real screenshot color by default, matching the `md:mix-blend-overlay`/`md:mix-blend-normal` pattern that was already correctly scoped. This is the fix identified in the earlier UI-fixes spec, folded into this redesign pass.
- `rounded-md` removed from all four rules that had it (`.project-image-container::before`, `::after`, `img`, `.project-description-container`) — square corners per Global Constraints.
- `drop-shadow-2xl` removed from `.project-image-container` and `.project-description-container` — no soft shadows per Global Constraints.
- The teal `bg-blue-sapphire` full-opacity overlay tint becomes `bg-brutalist-accent bg-opacity-20` — a subtle orange wash instead of a strong teal block, and paired with the grayscale fix this means the mobile view (which now skips both the grayscale filter and, since `::before` is already `bp-max-768:hidden`, this tint entirely) shows clean full-color screenshots by default.
- Tech-stack tags become orange-filled chips (`bg-brutalist-accent`, square, bold uppercase mono) replacing the plain inline-text list, per spec.

- [ ] **Step 2: Add the `03 · PROJECTS` eyebrow in `src/App.tsx`**

Replace:
```tsx
          <section id="projects">
            <div id="projects-content" className="content">
              <h2>Things I&apos;ve Built</h2>
              <Projects/>
            </div>
          </section>
```
with:
```tsx
          <section id="projects">
            <div id="projects-content" className="content">
              <p className="font-mono uppercase tracking-wide text-sm text-brutalist-accent mb-2">03 &middot; Projects</p>
              <h2>Things I&apos;ve Built</h2>
              <Projects/>
            </div>
          </section>
```

- [ ] **Step 3: Verify the grayscale fix specifically — mobile**

Run: `npm start`. In devtools, switch to a 390px-wide mobile viewport, scroll to "Things I've Built". Confirm each project screenshot renders in full color (not desaturated/tinted) without needing to hover — this was impossible to achieve pre-fix since mobile has no hover. Take a screenshot or visually confirm color saturation matches the source images.

- [ ] **Step 4: Verify desktop hover-reveal still works**

At a desktop width (≥768px), confirm project images still show the grayscale + accent-tinted overlay by default, and hovering reveals full color — this behavior is unchanged from before, only its default *mobile* state was broken.

- [ ] **Step 5: Verify square corners and chip styling**

Confirm no rounded corners anywhere in the project cards, and tech-stack tags (e.g. "TypeScript", "React", "Vite.js" on the Proven project) render as solid orange rectangular chips, not plain text.

- [ ] **Step 6: Commit**

```bash
git add src/components/Projects.css src/App.tsx
git commit -m "fix(projects): restyle for brutalist theme, fix mobile grayscale bug, add stack-tag chips"
```

---

## Task 7: Contact section (form inputs, button reuse, links)

**Files:**
- Modify: `src/components/Input.css` (full file)
- Modify: `src/components/Contact.css:1-38` (contact links section; form-input background handled by Input.css now, grid layout unchanged)
- Modify: `src/App.tsx:224-228` (add `04 · CONTACT` eyebrow)

**Interfaces:**
- Consumes: `brutalist.*` tokens, `.btn` (Task 3 — Contact's submit button already uses `<Button className="btn" .../>` per the existing `Contact.tsx`, so no `.tsx` edit needed there, only confirm `.btn` styling from Task 3 applies correctly here too).
- Produces: none consumed elsewhere.

- [ ] **Step 1: Rewrite `src/components/Input.css`**

```css
.styled-input-container {
    @apply relative;
}

.styled-input-container .label {
    @apply bg-brutalist-bg dark:bg-brutalist-fg dark:text-brutalist-fg-muted px-1 font-mono uppercase text-xs tracking-wide;
}

.styled-input {
    @apply relative w-full h-full transition-colors border-2 border-brutalist-border dark:border-brutalist-bg p-2 bg-transparent dark:text-brutalist-bg font-mono z-10;
}

.styled-input:not(:focus) {
    @apply placeholder-transparent;
}

.styled-input:focus {
    @apply outline-none border-brutalist-accent placeholder-brutalist-fg-muted;
}

.styled-input.typed-on:valid,
input.styled-input:valid:not(:placeholder-shown) {
    @apply border-green-500;
}

.styled-input.typed-on:invalid,
input.styled-input:invalid:not(:placeholder-shown) {
    @apply border-red-500;
}

.content-valid,
.styled-input.typed-on.content-valid {
    @apply !border-green-500;
}

.content-invalid,
.styled-input.typed-on.content-invalid {
    @apply !border-red-500;
}

.styled-input ~ .label-container {
    @apply absolute left-0 top-0 bottom-0 flex items-center ml-2 transition-all;
}

.styled-input:focus ~ .label-container,
.styled-input:valid ~ .label-container,
.styled-input:invalid:not(:placeholder-shown) ~ .label-container {
    @apply -top-full text-xs z-10;
}

.styled-input:focus ~ .label-container > .label {
    @apply transition-colors text-brutalist-accent;
}
```

(`rounded-md` dropped; focus ring/glow (`ring-2` equivalent was already absent here — only `border-blue-sapphire` existed, now `border-brutalist-accent`) stays a flat border-color change, no glow added, consistent with the flat aesthetic. Valid/invalid green/red state colors are untouched — spec explicitly keeps semantic state colors separate from the accent system.)

- [ ] **Step 2: Update `src/components/Contact.css`**

Replace lines 1-38 (through the end of the `#contact-links a .link-icon` hover rules — the grid layout in lines 40-70 is unchanged since it's pure positioning, not color):

```css
#contact-grid {
    @apply flex flex-col gap-y-8 mt-16;
}

#contact-ways {
    @apply grid grid-cols-8 grid-rows-5 gap-x-2 gap-y-8;
}

#contact-links {
    @apply row-start-1 row-span-1 md:row-span-2 col-start-1 col-span-8 md:col-span-2 flex flex-col gap-y-2;
}

#contact-links a {
    @apply focus:ring-0 text-brutalist-fg dark:text-brutalist-bg;
}

#contact-links a span {
    @apply ml-4 text-highlight;
}

#contact-links a:hover span,
#contact-links a:focus span {
    @apply text-brutalist-accent;
}

#contact-links a:hover span::after,
#contact-links a:focus span::after {
    @apply w-full;
}

#contact-links a .link-icon {
    @apply inline-block transition-transform group-hover:scale-125 group-focus:scale-125;
}

#contact-links a:hover .link-icon,
#contact-links a:focus .link-icon {
    @apply scale-125 scale-125;
}
```

(Contact link icons previously relied on inherited `<a>` color from the global `a { @apply text-blue-sapphire ... }` rule, which no longer exists post-Task 2 — now explicitly set to `text-brutalist-fg` so the icon+label reads as fg-colored by default and only turns accent on hover/focus, matching the spec's "icons recolor to `--fg`, hover state to `--accent`".)

Note: `#contact-form .form-input { @apply bg-gray-lightest dark:bg-gray-darker; }` (originally line 44-46) is deleted — `Input.css`'s `.styled-input` now sets its own transparent background against the section background, so this override is redundant and referencing dead tokens. The rest of `Contact.css` (grid positioning, lines 40-70 in the original) is unchanged.

- [ ] **Step 3: Add the `04 · CONTACT` eyebrow in `src/App.tsx`**

Replace:
```tsx
          <section id="contact">
            <div id="contact-content" className="content mb-16">
              <h2>Contact</h2>
              <Contact />
            </div>
```
with:
```tsx
          <section id="contact">
            <div id="contact-content" className="content mb-16">
              <p className="font-mono uppercase tracking-wide text-sm text-brutalist-accent mb-2">04 &middot; Contact</p>
              <h2>Contact</h2>
              <Contact />
            </div>
```

- [ ] **Step 4: Run the app and visually verify**

Run: `npm start`, scroll to Contact. Confirm: form inputs have square 2px borders (not rounded), labels are uppercase mono, focus state turns the border orange with no glow, GitHub/LinkedIn/Email links are fg-colored by default and turn orange with an underline on hover, the "Send Message!" button matches the hero's "Hire me!" button exactly (solid orange, square corners).

- [ ] **Step 5: Commit**

```bash
git add src/components/Input.css src/components/Contact.css src/App.tsx
git commit -m "feat(contact): restyle form inputs and links for brutalist theme"
```

---

## Task 8: Footer

**Files:**
- Modify: `src/components/Footer.css` (full file)

**Interfaces:**
- Consumes: `brutalist.*` tokens, `.text-highlight` (Task 2 — footer links already use plain `<a>` tags which inherit the global accent color from Task 2, no per-link className needed).
- Produces: none.

- [ ] **Step 1: Rewrite `src/components/Footer.css`**

```css
footer {
    @apply mt-16 bg-brutalist-bg dark:bg-brutalist-fg border-t-2 border-brutalist-border dark:border-brutalist-bg;
}

footer a {
    @apply text-highlight;
}

footer span {
    @apply inline-block font-mono text-sm text-brutalist-fg-muted;
}

#footer-content {
    @apply content flex justify-between items-end gap-y-2 min-h-[max(10vh,100px)];
}

#footer-content > div:last-of-type {
    @apply text-right;
}

#footer-credits {
    @apply whitespace-pre;
}
```

- [ ] **Step 2: Run the app and visually verify**

Run: `npm start`, scroll to the footer. Confirm: a 2px top border separates it from the page above, copyright/credits text is small muted mono, links ("This website is open-source", "Cole Bemis", "grommet-icons") show the orange underline-on-hover from `.text-highlight`.

- [ ] **Step 3: Commit**

```bash
git add src/components/Footer.css
git commit -m "feat(footer): restyle for brutalist theme"
```

---

## Task 9: Page load screen + Switch component token cleanup

**Files:**
- Modify: `src/components/PageLoad.css:2` (background color)
- Modify: `src/buttons/Switch.css:16` (focus ring color)

**Interfaces:**
- Consumes: `brutalist.*` tokens.
- Produces: none — these are small leftover token references not covered by earlier tasks' file lists, caught during the repo-wide audit in this session.

- [ ] **Step 1: Update `src/components/PageLoad.css`**

Line 2, change:
```css
    @apply fixed flex justify-center items-center min-h-screen left-0 right-0 top-0 bg-gray-light dark:bg-gray-darkest transition-transform duration-500;
```
to:
```css
    @apply fixed flex justify-center items-center min-h-screen left-0 right-0 top-0 bg-brutalist-bg dark:bg-brutalist-fg transition-transform duration-500;
```

- [ ] **Step 2: Update `src/buttons/Switch.css`**

Line 16, change:
```css
    @apply focus-within:ring-2 focus-within:ring-blue-sapphire;
```
to:
```css
    @apply focus-within:ring-2 focus-within:ring-brutalist-accent;
```

(The Switch component's toggle track/knob use hardcoded `var(--black)`/`var(--white)` custom properties, not Tailwind tokens — those are left as-is since they're already a neutral black/white pairing consistent with the brutalist palette and don't reference any token being removed. Only the accent-colored focus ring needed updating.)

- [ ] **Step 3: Run the app and visually verify**

Run: `npm start`. Reload the page and confirm the loading-logo screen background matches the new off-white/black theme (matches whichever mode is active) rather than the old gray. Tab to the dark-mode Switch control (non-single-icon-mode instance, if reachable — otherwise verify via devtools by adding `:focus-within` in the inspector) and confirm the focus ring is orange.

- [ ] **Step 4: Commit**

```bash
git add src/components/PageLoad.css src/buttons/Switch.css
git commit -m "fix(theme): update remaining page-load and switch focus-ring token references"
```

---

## Task 10: Repo-wide verification sweep

**Files:**
- No file modifications expected — this task is a verification gate. If it finds something, fix it in the file it's found in and note the fix in the commit message.

**Interfaces:**
- Consumes: everything from Tasks 1-9.
- Produces: confidence that the Global Constraints are actually met, not just individually plausible per-task.

- [ ] **Step 1: Grep for every legacy color token across `src/`**

Run: `grep -rn "blue-sapphire\|blue-sky\|gray-lightest\|gray-light\b\|gray-dark\b\|gray-darker\|gray-darkest" src/ --include="*.tsx" --include="*.css"`
Expected: no output. If any lines print, open that file, replace the token with the appropriate `brutalist.*` equivalent following the same light/dark pairing pattern used in Tasks 1-9, and re-run the grep until clean.

- [ ] **Step 2: Grep for rounded corners and shadows across `src/`**

Run: `grep -rn "rounded-\|border-radius\|drop-shadow\|shadow-md\|shadow-lg\|shadow-2xl" src/ --include="*.tsx" --include="*.css"`
Expected: no output, with the sole intentional exception of `src/navigation/navbar/mobile/Hamburger.css`'s `border-radius: 0;` (Task 3 Step 4 — explicitly zeroed, not removed, since the property is used by the animation keyframes' box model even at zero radius) — if that's the only remaining hit, it's correct; anything else must be fixed.

- [ ] **Step 3: Grep for the removed Tailwind config keys**

Run: `grep -n "'blue'\|'gray'" tailwind.config.js`
Expected: no output — confirms Task 1 fully removed the old color groups rather than leaving them alongside the new `brutalist` group.

- [ ] **Step 4: Confirm Montserrat/Caveat are fully gone**

Run: `grep -rn "Montserrat\|Caveat" src/ public/index.html`
Expected: no output.

- [ ] **Step 5: Full manual pass — desktop light, desktop dark, mobile light, mobile dark**

Run: `npm start`. For each of the 4 combinations (desktop ~1440px / mobile ~390px, × light / dark via the header toggle), scroll the entire page top to bottom and confirm:
- No stray rounded corners or drop shadows anywhere.
- No leftover teal/sapphire/sky color appears anywhere (everything is off-white/black/orange, or the semantic green/red form-validation colors).
- All four section eyebrows (`01 · ABOUT`, `02 · EXPERIENCE`, `03 · PROJECTS`, `04 · CONTACT`) are present and in that numeric order.
- The two bug fixes hold: mobile project images show full color without hovering; mobile experience tabs show a fade affordance at the scrollable edge.

- [ ] **Step 6: Run lint**

Run: `npm run lint`
Expected: no new lint errors introduced by this redesign (pre-existing warnings unrelated to color/className changes, such as `import/prefer-default-export` on icon files, are not this plan's concern — only confirm nothing new appeared referencing files this plan touched).

- [ ] **Step 7: Production build check**

Run: `npm run build`
Expected: build succeeds (same pre-existing lint-warning caveat as the `CLAUDE.md`-documented deploy flow, which builds with `CI=false`) and produces a `build/` directory. Run `rm -rf build` afterward to avoid committing build output (already gitignored, but confirm `git status` shows no untracked `build/` entries).

- [ ] **Step 8: Final commit (only if Steps 1-4 required fixes)**

```bash
git add -A
git commit -m "fix(theme): repo-wide sweep for leftover legacy tokens, rounded corners, and shadows"
```

If Steps 1-4 found nothing to fix, skip this commit — there's nothing to commit.

---

## Explicitly not covered by this plan

- Terminal/shell mode (separate future plan, per spec).
- Resume/experience content updates (pending user-provided resume).
- `emailjs`/Google Analytics/deployment config changes.
- Any new animation beyond color-transition target changes already included above.
