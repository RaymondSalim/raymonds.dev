# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Raymond's personal website (raymonds.dev): a single-page React 17 + TypeScript site built with `craco` (Create React App wrapped for custom PostCSS/ESLint config) and styled with Tailwind CSS. There is no router and no backend; `src/App.tsx` renders one scrolling page split into `<section>`s (home, about-me, experience, projects, contact).

## Commands

- `npm start` — run the dev server (sets `TAILWIND_MODE=watch` and `REACT_APP_DEPLOYMENT_ENV=local`).
- `npm run build` — production build via craco.
- `npm test` — run tests via `craco test` (Jest/react-scripts test runner). No test files currently exist in `src/`, and the pre-push hook runs `npx craco test --onlyChanged`.
- `npm run lint` — `eslint --ext .tsx,.ts src/ public/`. Run this (and fix with `--fix`) before committing; the pre-commit hook runs eslint on staged `.ts`/`.tsx` files.
- `npm run deploy-stg` / `npm run deploy-prod` — build and deploy to GitHub Pages via `config/deploy.sh`; not meant to be run manually in normal development (triggered by `/deploy` PR comments in CI, see below).

## Git hooks

Hooks live in `scripts/hooks/` and must be installed once via `./scripts/setup-hooks.sh` (copies them into `.git/hooks`). They are not active by default in a fresh clone:
- `pre-commit` — runs eslint (with optional auto-fix) on staged `.ts`/`.tsx` files.
- `pre-push` — runs `craco test --onlyChanged`.
- `commit-msg` — enforces the commit message format below.

## Commit / branch conventions

Commit messages and branch names must follow `<type>(<scope>): <summary>` / `<type>/<issue-id>-<description>`, where `<type>` is one of `feat|fix|chore|perf|test`. This is enforced by the `commit-msg` hook regex: `(feat|fix|chore|perf|test){1}\([a-z-\/]+\)[!]?(:){1}`. Issue IDs are `GH-<id>` (GitHub) or `PW-<id>` (Jira).

Trunk-based development: PRs from `development` → `staging` are squash-merged; PRs from `staging`/`release/*` → `main` are rebase-merged. Deployment is triggered by commenting `/deploy` on a merged PR (see `.github/workflows/deploy-on-comment.yml`) — staging deploys off the `staging` branch, production off `main`. Only the repo owner (PR comment author association `OWNER`) can trigger it. Update `CHANGELOG.md` before merging a `release/*` branch into `main`.

## Architecture

**Class components, not hooks.** Every component in `src/` is a `React.Component` subclass with typed `Props`/`State` interfaces, not a function component. Follow this pattern for consistency — do not introduce hooks-based components without reason.

**Directory layout is by role, not by feature:**
- `src/components/` — page section components (`Contact`, `Experiences`, `Projects`, `Footer`, `Input`, `PageLoad`), each paired with a co-located `.css` file of the same name plus a shared `components.css`.
- `src/navigation/` — `Header` plus `navigation/navbar/{desktop,mobile}` and `navigation/menu`; desktop and mobile nav are separate components rendered conditionally by CSS breakpoints, both driven by shared `NavbarMobileProps`/menu state owned by `App`.
- `src/buttons/` — reusable `Button` and `Switch` controls.
- `src/icons/` — one component per SVG icon (tech-stack icons, UI icons like `Sun`/`Moon`/`External`); `Skill.tsx` wraps an icon + label for the "technologies" grid.
- `src/util/` — `common.ts` (e.g. `debounce`), `dimensions.ts` (px/rem/vh/dpi unit conversion), `LocalStorage.tsx` (typed localStorage get/set), `util/darkmode/DarkModeToggle.tsx`.
- `src/common/interface/` — shared prop/type contracts: `BaseProps` (dimension, className, onclick, onfocus) is the base interface most component props extend; `IconProps` extends it for icon components; `Dimension.tsx`.
- `src/enum.tsx` — `EnvironmentVariables` enum mapping to `process.env` keys (`NODE_ENV`, `REACT_APP_DEPLOYMENT_ENV`).

**State ownership is centralized in `App.tsx`.** `App` owns `siteReady`, `menuActive`, and `darkMode` state and passes callbacks/props down (e.g. `toggleMenu`, `toggleDarkMode` flow into `Header` → `NavBarMobile`/`NavBarDesktop` → `Menu`/`DarkModeToggle`). There is no context provider or external state library — prop drilling is the norm for the few pieces of shared state.

**Dark mode** is applied by toggling a `dark` class on `document.body`, driven by Tailwind's `darkMode: 'class'` config (`tailwind.config.js`). Initial value comes from `localStorage` (key `DarkModeToggle.localStorageKey`) falling back to `prefers-color-scheme`, computed in `App.isDarkModeEnabled()`.

**Deployment environments** are threaded through `process.env.REACT_APP_DEPLOYMENT_ENV` (`local`/`staging`/`production`), read via the `EnvironmentVariables` enum. This selects the Google Analytics tracking ID in `App`'s constructor and staging builds get additionally encrypted with `staticrypt` in `config/deploy.sh`.

**Styling**: Tailwind utility classes are used directly in JSX, plus co-located per-component `.css` files for anything Tailwind doesn't express well (animations, complex layout). Custom Tailwind colors (`blue.sky`, `blue.sapphire`, `gray.lightest/light/dark/darker/darkest`) and custom breakpoints (`bp-max-1080/768/600/480`, mobile-first `max-width` variants) are defined in `tailwind.config.js` — prefer these tokens over hardcoded hex/px values.

**ESLint config** extends `airbnb-base`/`airbnb-typescript` plus React/JSX-a11y/hooks plugins (`.eslintrc.json`). Notably `max-len` is off and several rules are downgraded to `warn` (e.g. `class-methods-use-this`, `import/prefer-default-export`, `no-use-before-define`).
