# Brutalist Terminal redesign

## Context

Prior UI review (see `2026-07-15-ui-fixes-design.md`) identified concrete bugs
in the current design. Separately, the user wants a full visual redesign, not
just fixes — the current template-shaped structure (hero → about → tabs →
card grid → form) and the handwritten-tag decoration are the bigger
opportunity than any individual spacing/color tweak.

Three directions were mocked up via the visual companion: Systems Console
(near-black, IBM Plex, signal-green), Brutalist Terminal (stark black/white,
alarm-orange, industrial type), and Editorial/Refined (ink-green, serif,
case-study framing). **The user selected Brutalist Terminal.**

This spec defines the visual redesign only. A terminal/shell "mode" (typing
`ls`, `cat about.txt`, etc. as an alternate way to browse the site) is
explicitly a separate, later spec — the user said "we can add this on after."
This spec's tokens (colors, type, spacing) are the foundation the terminal
mode spec will build on, per the user's approved sequencing.

Audience remains recruiters/hiring managers (established earlier), so despite
the bold aesthetic, content must stay scannable — the boldness lives in
color/type/borders, not in obscuring information.

Resume content (experience entries, dates, bullet points) is known to be
stale and will be provided separately. This spec covers structure and style,
not content — the redesign should not hardcode content changes beyond what's
needed to demonstrate layout.

## Design tokens

### Color

Two themes, same accent, inverted base — not two different aesthetics.

| Token | Light (default) | Dark |
|---|---|---|
| `--bg` | `#FAFAF7` (off-white, current mockup) | `#0A0A0A` (true black) |
| `--fg` | `#0A0A0A` | `#FAFAF7` |
| `--fg-muted` | `#4B5563` (gray-600) | `#9CA3AF` (gray-400) |
| `--border` | `#0A0A0A` | `#FAFAF7` |
| `--accent` | `#FF4B1F` (alarm orange) | `#FF4B1F` (unchanged — it's the signature) |
| `--accent-contrast-text` | `#0A0A0A` (text sitting on an orange chip) | `#0A0A0A` |
| `--surface` | `#FFFFFF` | `#141414` (slightly lifted off pure black, for cards) |

Implementation: extend `tailwind.config.js` `theme.extend.colors` with a
`brutalist` group (`brutalist.bg`, `brutalist.fg`, `brutalist.accent`,
`brutalist.surface`), and drive light/dark via the existing `dark:` variant
convention (`darkMode: 'class'`) — no new theming mechanism, reuse
`App.isDarkModeEnabled()` / the `dark` class on `document.body`. The current
`blue.sky`/`blue.sapphire`/`gray.*` tokens are superseded by this redesign
and should be removed from `tailwind.config.js` once no component references
them (verify with a repo-wide search before deleting).

### Typography

- Display font: **Big Shoulders** (condensed, industrial, weights 700/900) —
  headings (`h1`, `h2`, `h3`), nav logo mark.
- Body/UI font: **Space Mono** (400/700) — body copy, nav links, buttons,
  form inputs, tab labels, footer. Replaces Montserrat entirely.
- Remove **Caveat** (only used for the handwritten tag-decoration being
  dropped) and the Google Fonts `<link>` tags for Montserrat/Caveat in
  `public/index.html`; add Big Shoulders + Space Mono links in their place.
- No italics, no light weights — the aesthetic is blunt, not delicate.

### Structural language (replaces the tag-decoration motif)

The dropped `<h1>`/`<p>`/`<ul>` pseudo-element decoration is replaced by:
- **2px solid borders** (`--border`) on section dividers, cards, buttons,
  inputs, and the header — no `border-radius` anywhere (square corners is a
  hard rule of this aesthetic; replaces the current `rounded-md` usage).
- **Numbered/tagged labels** in Space Mono uppercase for section eyebrows
  (e.g. `01 · EXPERIENCE`, `02 · PROJECTS`) instead of decorative tag text —
  same impulse (developer-flavored structure) with more restraint and higher
  legibility.
- **Orange-filled chips** (Space Mono, bold, `--accent` background,
  `--accent-contrast-text` text, square corners) for tags/labels that
  currently use a soft pill (e.g. tech stack tags on project cards, the
  active experience tab indicator).

## Per-section treatment

### Header / Nav (`src/navigation/`)

- `#header` gets a `border-b-2` in `--border` (replacing the current
  `shadow-md` on scroll) — the brutalist language uses hard lines, not soft
  shadows.
- Nav links (`NavBar.tsx` desktop, `Menu.tsx` mobile) restyle in Space Mono,
  uppercase, letter-spaced. Active/hover state changes from the current
  `text-blue-sapphire` color-shift to an underline drawn with `--accent`.
  Both desktop and mobile menu need this treatment since they're separate
  components sharing no styling today beyond `NavbarMobileProps`.
- Dark mode toggle (`DarkModeToggle.tsx`) icon colors swap from
  `blue-sapphire`/`blue-sky` to `--fg`/`--accent`; no structural change to
  the component, just its Tailwind classes.
- Logo (`icons/Logo.tsx`) already renders via `stroke="currentColor"` with
  the color set by a Tailwind text-color class (`text-blue-sapphire`) — no
  prop or SVG change needed. Swap the class to `text-brutalist-fg
  hover:text-brutalist-accent` (or equivalent tokens once added to
  `tailwind.config.js`).

### Hero (`#home` / `#home-content` in `App.tsx` + `App.css`)

- Per the earlier UI-fixes spec, `#home-content` gains the `.content`
  max-width constraint so it aligns with every section below it — this
  redesign keeps that fix and builds the new type/color on top of it.
  `.content`'s definition (`src/index.css:191-193`) is retained as the
  layout primitive; only colors/fonts on top of it change.
- `h1` becomes Big Shoulders 900, uppercase, tighter line-height (brutalist
  display type is compressed, not the current `font-medium` humanist scale).
  "Raymond" (currently `<strong>`) switches from its current hover-only
  `hover:text-blue-sapphire` to a static `--accent` text color — always on,
  not hover-revealed, since it's the one word on the page that should draw
  the eye immediately.
- "Hire me!" button (`Button.tsx` / `.btn` in `buttons.css`) restyles from
  its current soft-outline pill to a solid `--accent` fill, square corners,
  `--accent-contrast-text` label, Space Mono bold — this is the loudest
  single element on the page and should read as a CTA, not a ghost button.
- The wavy SVG section dividers (`#section-curve-start`/`-end`) are a soft,
  organic shape that conflicts with the hard-edge aesthetic. Replace with a
  flat 2px rule (`border-t`) in `--border`, or remove the divider entirely
  and rely on background-color contrast between sections instead.

### About (`#about-me` content in `App.tsx`)

- Section eyebrow label added above `<h2>About me</h2>`: `01 · ABOUT`.
- The skills icon grid (`Skill.tsx`, `icons/Skill.css`) currently renders
  icons in soft white circles with a radial-gradient background
  (`.bg-skills-icon`). Replace circles with square `--border`-outlined
  tiles — circles read soft, this aesthetic is all right angles.
- Body copy (the two `<p>` about-me paragraphs, the "not coding" list)
  switches to Space Mono; external client links (Tokopedia, Kalbe Farma,
  Mandiri) keep underline-on-hover but in `--accent` instead of
  `blue-sapphire`.

### Experience (`Experiences.tsx` + `Experiences.css`)

- Tabs restyle: current vertical list with a `>` selector glyph becomes a
  row of bordered tab buttons (Space Mono uppercase), active tab gets a
  solid `--accent` underline (2px, matching nav) instead of the color-shift
  text treatment.
- This is also where the mobile-overflow fix from the earlier spec applies —
  same root cause (`#experience-tabs` `overflow-auto` with only a 3px
  scrollbar as the affordance), same fix (fading edge mask), now executed in
  the new visual language: the fade should key off `--bg` so it works in
  both themes automatically via the CSS variable rather than a hardcoded
  color.
- Job description bullets (`.job-description`) switch from disc bullets to
  `—` em-dash-style markers rendered via `list-style: none` + `::before`,
  consistent with the terminal-mode mockup's `—` bullet style shown earlier
  — this is a deliberate visual echo that will make the future terminal mode
  feel like the same product rather than a bolted-on gimmick.

### Projects (`Projects.tsx` + `Projects.css`)

- This is where the earlier-identified mobile grayscale bug
  (`Projects.css:21-26`, unconditional `grayscale` filter with a `md:`-only,
  hover-only escape) gets fixed as part of this redesign rather than as a
  standalone patch — same root cause, same fix (scope `grayscale` /
  `mix-blend-overlay` to `md:` and up).
- Visual treatment changes alongside the fix: drop the teal/sapphire
  `::before` overlay tint (`bg-blue-sapphire`) in favor of `--accent` at low
  opacity, and drop `rounded-md` on the image container/screenshot for
  square corners consistent with the rest of the redesign.
- Tech-stack tags (`.project-stack-list`) become the orange-filled chip
  style defined above, replacing the current plain-text inline list.
- `rounded-md` on `.project-description-container` and the drop-shadow
  treatment (`drop-shadow-2xl`) both go — replaced with a solid `--border`
  outline, no shadow. Shadows imply soft light sources; this aesthetic is
  flat.

### Contact (`Contact.tsx` + `Contact.css`, `Input.tsx` + `Input.css`)

- Form inputs (`Input.tsx`, `.styled-input`) restyle from soft rounded
  fields to square-cornered fields with a 2px `--border`, Space Mono
  placeholder/label text. Focus state changes from `ring-2 ring-blue-sapphire`
  to a solid `--accent` border (no ring/glow — flat, not soft).
- Submit button reuses the same solid-`--accent` button treatment as the
  hero's "Hire me!" button, for consistency.
- Contact links (GitHub/LinkedIn/Email) icons recolor to `--fg`, hover state
  to `--accent`, replacing the current sapphire/sky hover.
- Email success/failure status text keeps semantic green/red (not touched by
  the accent system — these are state colors, not brand colors).

### Footer (`Footer.tsx` + `Footer.css`)

- Restyle to Space Mono, `--fg-muted` for the copyright/thanks line,
  `--accent` underline-on-hover for links (open-source link, credits).
  Structurally unchanged.

### Page load (`PageLoad.tsx` + `PageLoad.css`)

- Out of scope for color/font changes beyond what's needed for the Logo
  recolor described above — the loading animation itself (`Logo`'s
  `wantAnimation`) is a motion detail, not a color/type concern, and isn't
  being redesigned here.

## What's explicitly out of scope for this spec

- The terminal/shell mode — separate spec, comes after this one ships.
- Resume content changes — separate task, pending user input.
- New animations/motion beyond what's needed to restyle existing
  transitions (e.g. changing a color transition's target color, not adding
  new motion).
- Any change to `emailjs`/Google Analytics/deployment configuration.

## Testing

No test suite exists for this project (see main `CLAUDE.md`). Verification
is manual: rebuild locally (`npm start`), check every section listed above
at desktop (1440px) and mobile (390px) widths, in both light and dark mode,
confirming:
- No `rounded-*` classes remain in redesigned components (square-corner rule
  is absolute for this aesthetic — a stray rounded corner will look like a
  mistake, not a stylistic choice).
- Dark mode toggle still functions and both themes use only tokens from the
  color table above (no leftover `blue-sapphire`/`blue-sky`/`gray-*`
  references).
- The two bugs folded into this redesign (mobile project-image grayscale,
  experience-tab overflow affordance) are confirmed fixed, not just visually
  restyled around.
