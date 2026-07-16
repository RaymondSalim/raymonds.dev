# Terminal Mode Design

## Context

The Brutalist Terminal redesign spec intentionally left terminal/shell mode for a later pass. That visual redesign shipped the foundation this feature should use: off-white and black base colors, alarm-orange accent, Space Mono UI text, square borders, and a hard-edged interaction style.

Terminal mode is not a replacement for the portfolio. It is an easter egg and power-user layer for technical visitors. Recruiters and hiring managers must be able to read the whole site without discovering or using it.

## Product Shape

Terminal mode is a hybrid command palette with terminal-flavored commands. It lets visitors run deterministic commands like `help`, `whoami`, `projects`, `contact`, and `cat about.txt`.

The normal portfolio remains the primary experience. Terminal mode can navigate to sections, print compact information, and open external links, but it should not duplicate the full site as a second content system.

## Discovery

The header gets a small `>_` trigger near the existing dark-mode toggle on desktop and mobile.

On first visit, a small square-corner bubble appears near the trigger with short copy such as:

```text
feeling techy? try terminal mode
```

The bubble auto-hides after about 6 seconds. It is also dismissed when the visitor closes it or opens terminal mode. Store this as a boolean localStorage value, for example `terminalHintSeen`, so the bubble does not nag on future visits. A timeout counts as seen.

The desktop keyboard shortcut is the backtick key. Mobile uses the visible trigger only.

## Open State

Desktop uses a fixed floating panel. It should sit near the bottom-right of the viewport, use a width like `min(560px, calc(100vw - 2rem))`, and use a max height around `60vh`. It is not draggable.

Mobile uses a full-screen terminal panel. This avoids cramped overlays, virtual keyboard conflicts, and broken scroll behavior.

Both variants use the existing brutalist visual language:

- black terminal background in light mode, off-white text, orange accents.
- inverted but still high-contrast treatment in dark mode.
- 2px square borders.
- Space Mono for terminal text.
- no rounded corners, shadows, blur-heavy treatment, or soft modal styling.

## Command Behavior

Commands are deterministic and documented by `help`. Unknown commands print a short error and suggest `help`.

Baseline commands:

```text
help
clear
exit
whoami
pwd
ls
about
experience
client-work
projects
contact
github
linkedin
email
open projects
open contact
cat about.txt
```

Aliases can be added when they are obvious and low maintenance, for example `work` for `experience` or `clients` for `client-work`.

Output style is hybrid:

- Terse by default. Commands like `whoami`, `pwd`, and section navigation print short shell-like output.
- Richer output only for explicit detail commands like `help` and `cat about.txt`.
- No broad fake Unix surface. If a command appears supported, it must do something useful and predictable.

## Navigation Rules

Information commands keep the terminal open.

Section commands scroll to existing page sections:

```text
about -> #about-me
experience -> #experience
client-work -> #client-work
projects -> #projects
contact -> #contact
```

On desktop, section commands print a short acknowledgement and scroll the underlying page while keeping the terminal open.

On mobile, section commands print a short acknowledgement, close the terminal, blur the input, restore document scrolling, then scroll to the target section after the close state applies. Use a single deferred tick such as `requestAnimationFrame` or `setTimeout(..., 0)` after closing so the browser has applied the layout change before `scrollIntoView()` runs. This avoids fighting the virtual keyboard and fixed full-screen panel.

External commands open real links:

```text
github -> GitHub profile
linkedin -> LinkedIn profile
email -> mailto link
```

These commands should print what they are doing before opening the link.

## State And Persistence

Persist only the hint bubble state in localStorage.

Terminal command history is in-memory only for the current page session. ArrowUp and ArrowDown navigate that in-memory history while the input is focused.

Do not persist command history across visits. It adds little value for a public portfolio and creates unnecessary privacy expectations.

## Accessibility

The `>_` trigger is a real button with an accessible label, for example "Open terminal mode".

Opening terminal mode moves focus into the command input. Closing it returns focus to the trigger when possible.

`Esc` closes terminal mode. The `exit` command closes it too.

The terminal panel should use dialog semantics or equivalent accessible labeling. Mobile full-screen mode must restore document scrolling on close. It must not leave `html` or `body` locked.

The hint bubble must not trap focus. If it has a close button, that button must be keyboard reachable and labeled.

## Implementation Direction

Use a self-contained `TerminalMode` feature mounted inside `#page`, outside `main`. This component owns:

- open/closed state.
- hint bubble display and localStorage persistence.
- command input state.
- in-memory command history.
- command parsing and output rendering.
- desktop/mobile behavior differences.

Pass or define a small command table containing section IDs and external links. For v1, do not refactor the full portfolio into shared data just to power terminal output. That refactor would reduce future content drift, but it is larger than the feature needs now.

Header integration should expose an `onTerminalOpen` callback or equivalent prop path so the desktop and mobile nav can open the terminal without owning terminal state.

## Out Of Scope

- Draggable terminal window.
- Persistent command history.
- Full alternate terminal site mode.
- Route-based `/terminal` page.
- Natural-language command parsing.
- Network-backed commands.
- Full filesystem simulation.
- Refactoring all portfolio content into shared data.

## Testing

Automated coverage should focus on command parsing and state behavior where practical:

- known commands produce the expected action or output.
- unknown commands print a helpful error.
- `clear` clears output.
- `exit` closes the terminal.
- ArrowUp and ArrowDown navigate in-memory history.
- hint bubble localStorage rules work.

Manual verification should cover:

- desktop `>_` trigger opens the floating terminal.
- desktop backtick opens the terminal.
- desktop `Esc` and `exit` close it.
- desktop section commands scroll while keeping the panel open.
- mobile trigger opens full-screen terminal.
- mobile section commands close terminal, unlock scroll, and land on the target section.
- focus moves into the input on open and returns to trigger on close.
- the one-time bubble appears once and does not reappear after dismissal.
- light and dark themes remain legible.
