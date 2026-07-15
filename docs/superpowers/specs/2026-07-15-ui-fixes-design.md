# UI fixes: mobile project images, experience tab overflow, hero alignment

## Context

The site's primary audience is recruiters/hiring managers, so scannability and
first-impression credibility matter more than developer-facing flourishes.
Reviewed the live site (raymonds.dev) directly — desktop, mobile (390×844),
and dark mode — and cross-checked findings against the source CSS to confirm
root causes before proposing fixes. This is a targeted-fixes pass: three
concrete, independently-verified problems, not a visual redesign. The
decorative `<h1>`/`<p>`/`<ul>` tag-literal text and other stylistic choices
are explicitly out of scope for this pass.

## Issue 1: Mobile project images are permanently grayscale/tinted

**Root cause** (`src/components/Projects.css:21-26`):

```css
.project-image-container img {
    @apply bp-max-768:h-full bp-max-768:object-cover z-20 relative md:mix-blend-overlay transition-all grayscale overflow-hidden rounded-md;
}

.project-image-container img:hover {
    @apply md:mix-blend-normal grayscale-0;
}
```

The `grayscale` filter applies unconditionally at all breakpoints. The
`:hover` rule that clears it (`grayscale-0`) exists, but on mobile there is no
hover input, so the image never reveals its real colors. Desktop users
discover this by hovering (confirmed live); mobile users — likely the
largest share of traffic clicking through from a resume or LinkedIn — see a
permanently desaturated, teal-tinted screenshot of every project.

**Fix:** Scope the `grayscale` filter (and the `mix-blend-overlay` it pairs
with) to `md:` and up, so mobile shows the real screenshot by default. Keep
the hover-to-reveal treatment for desktop/pointer devices, since that
behavior isn't broken there, just invisible on touch.

```css
.project-image-container img {
    @apply bp-max-768:h-full bp-max-768:object-cover z-20 relative md:mix-blend-overlay transition-all md:grayscale overflow-hidden rounded-md;
}

.project-image-container img:hover {
    @apply md:mix-blend-normal md:grayscale-0;
}
```

## Issue 2: Experience tabs overflow silently on mobile

**Root cause** (`src/components/Experiences.css:6,13-15`):

```css
#experience-tabs {
    @apply flex md:flex-col w-full md:w-max overflow-auto md:overflow-visible items-start dark:text-white relative div-pseudo mt-3;
}

#experience-tabs::-webkit-scrollbar {
    height: 3px;
}
```

The tab list is horizontally scrollable on mobile (`overflow-auto`), so it's
functionally reachable, but the only affordance is a 3px scrollbar that's
easy to miss. Confirmed live at 390px width: "Kalbe Farma" (the 4th tab) sits
outside the initial viewport with no visual cue that more tabs exist.

**Fix:** Add a fading gradient mask on the trailing edge of `#experience-tabs`
(mobile only) that's visible whenever the list has unscrolled overflow to the
right, using a `mask-image` gradient or an absolutely-positioned fade overlay
sized to the container. Remove/hide it once scrolled to the end.

## Issue 3: Hero content isn't aligned with the rest of the page

**Root cause** (`src/App.css:37-44`):

```css
#home {
    @apply h-screen fixed top-0 right-0 left-0 bg-gray-light dark:bg-gray-dark max-w-[100vw];
    z-index: -9000;
}

#home-content {
    @apply flex flex-col h-full justify-center;
}
```

Every other section's content sits inside `.content`
(`src/index.css:191-193`, `max-w-[1000px] mx-auto` with responsive margins),
but `#home-content` has no such constraint — it inherits raw viewport-relative
positioning from `#home`. At wide desktop widths (confirmed at 1440px) the
hero text block sits off on its own near the left edge instead of aligning
with the column used by About/Experience/Projects/Contact below it, making
the page feel inconsistent and the hero under-filled.

**Fix:** Apply the `.content` class to `#home-content` (already used
elsewhere in `App.tsx` via `className="content"` on other section divs), so
the hero text column lines up with the shared content width and margins.

## Testing

No test suite exists for this project (`npm test` has no test files to run
against, per `CLAUDE.md`). Verification will be manual:
- Rebuild locally (`npm start`), check hero/tabs/project images at desktop
  (1440px) and mobile (390px) widths, light and dark mode.
- Confirm hover-to-reveal still works on desktop project images.
- Confirm experience tab fade appears/disappears correctly as the user
  scrolls the tab list on a touch-sized viewport.

## Out of scope

- Decorative `<tag>` text throughout the page.
- Broader visual/typography refresh.
- Any changes to the contact form, footer, or experience content.
