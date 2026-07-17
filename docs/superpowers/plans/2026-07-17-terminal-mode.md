# Terminal Mode Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a terminal-mode easter egg with a header trigger, one-time hint bubble, desktop floating panel, mobile full-screen panel, deterministic commands, virtual filesystem navigation, and accessible keyboard behavior.

**Architecture:** Keep command behavior in pure TypeScript under `src/terminal/` so it can be tested without rendering React. Add a self-contained `TerminalMode` React class component for UI, localStorage hint state, keyboard history, focus handling, and mobile versus desktop command actions. Thread one `openTerminal` callback from `App` into `Header`, desktop nav, and mobile nav.

**Tech Stack:** React 17 class components, TypeScript 4.4, Jest via `craco test`, Testing Library, Tailwind CSS through existing CSS `@apply`, existing localStorage helper.

---

## File Structure

- Create `src/terminal/terminalTypes.ts`: shared command, filesystem, result, and action types.
- Create `src/terminal/terminalData.ts`: curated virtual filesystem entries, external links, and section mappings.
- Create `src/terminal/terminalCommands.ts`: pure command parsing and execution.
- Create `src/terminal/terminalCommands.test.ts`: unit tests for commands, virtual paths, errors, and actions.
- Create `src/terminal/TerminalMode.tsx`: React UI and behavior shell.
- Create `src/terminal/TerminalMode.css`: panel, hint bubble, input, output, mobile full-screen, and desktop floating styles.
- Create `src/terminal/TerminalMode.test.tsx`: interaction tests for opening, closing, command submission, history, and hint persistence.
- Modify `src/App.tsx`: own terminal open state and render `TerminalMode`.
- Modify `src/navigation/Header.tsx`: accept and pass `onTerminalOpen`.
- Modify `src/navigation/navbar/desktop/NavBar.tsx`: render desktop `>_` trigger.
- Modify `src/navigation/navbar/mobile/NavBar.tsx`: render mobile `>_` trigger next to hamburger.
- Modify `src/navigation/menu/Menu.tsx`: extend props only if needed for type compatibility. The trigger should live in the mobile header, not inside the slide-out menu.
- Modify `src/navigation/Header.css`, `src/navigation/navbar/desktop/NavBar.css`, and `src/navigation/navbar/mobile/Hamburger.css`: align the terminal trigger with existing nav controls.
- Modify `src/components/components.css`: import `../terminal/TerminalMode.css`.

The plan intentionally avoids extracting all portfolio content into shared data. The virtual filesystem uses concise curated summaries for v1.

---

## Task 1: Pure Terminal Command Engine

**Files:**
- Create: `src/terminal/terminalTypes.ts`
- Create: `src/terminal/terminalData.ts`
- Create: `src/terminal/terminalCommands.ts`
- Test: `src/terminal/terminalCommands.test.ts`

- [x] **Step 1: Write failing command tests**

Create `src/terminal/terminalCommands.test.ts`:

```typescript
import { executeTerminalCommand, initialTerminalSession } from './terminalCommands';

describe('executeTerminalCommand', () => {
  test('lists top-level virtual files from root', () => {
    const result = executeTerminalCommand('ls', initialTerminalSession());

    expect(result.session.cwd).toBe('/');
    expect(result.lines).toEqual([
      'about.txt',
      'experience/',
      'client-work/',
      'projects/',
      'contact.txt',
      'links.txt',
    ]);
    expect(result.action).toEqual({ type: 'none' });
  });

  test('changes directories and resolves relative cat commands', () => {
    const cdResult = executeTerminalCommand('cd experience', initialTerminalSession());
    const catResult = executeTerminalCommand('cat domaintools.txt', cdResult.session);

    expect(cdResult.session.cwd).toBe('/experience');
    expect(cdResult.lines).toEqual(['/experience']);
    expect(catResult.lines[0]).toContain('DomainTools');
    expect(catResult.lines.join('\\n')).toContain('Software Engineer II');
  });

  test('supports parent and root directory navigation', () => {
    const inExperience = executeTerminalCommand('cd experience', initialTerminalSession()).session;
    const parent = executeTerminalCommand('cd ..', inExperience);
    const root = executeTerminalCommand('cd /', inExperience);

    expect(parent.session.cwd).toBe('/');
    expect(parent.lines).toEqual(['/']);
    expect(root.session.cwd).toBe('/');
    expect(root.lines).toEqual(['/']);
  });

  test('returns precise directory errors', () => {
    const fileResult = executeTerminalCommand('cd about.txt', initialTerminalSession());
    const missingResult = executeTerminalCommand('cd missing', initialTerminalSession());

    expect(fileResult.lines).toEqual(['cd: about.txt: not a directory']);
    expect(fileResult.action).toEqual({ type: 'none' });
    expect(missingResult.lines).toEqual(['cd: missing: no such directory']);
  });

  test('returns section scroll actions', () => {
    const result = executeTerminalCommand('projects', initialTerminalSession());

    expect(result.lines).toEqual(['opening projects...']);
    expect(result.action).toEqual({ type: 'scroll', targetId: 'projects' });
  });

  test('returns external link actions', () => {
    const result = executeTerminalCommand('github', initialTerminalSession());

    expect(result.lines).toEqual(['opening GitHub...']);
    expect(result.action).toEqual({ type: 'external', url: 'https://github.com/RaymondSalim' });
  });

  test('returns close and clear actions', () => {
    expect(executeTerminalCommand('exit', initialTerminalSession()).action).toEqual({ type: 'close' });
    expect(executeTerminalCommand('clear', initialTerminalSession()).action).toEqual({ type: 'clear' });
  });

  test('suggests help for unknown commands', () => {
    const result = executeTerminalCommand('sudo make me a sandwich', initialTerminalSession());

    expect(result.lines).toEqual(['command not found: sudo make me a sandwich', 'type `help` to see available commands']);
    expect(result.action).toEqual({ type: 'none' });
  });
});
```

- [x] **Step 2: Run tests and verify they fail**

Run:

```bash
CI=true npm test -- --runTestsByPath src/terminal/terminalCommands.test.ts --watchAll=false
```

Expected: FAIL because `src/terminal/terminalCommands.ts` does not exist.

- [x] **Step 3: Add terminal types**

Create `src/terminal/terminalTypes.ts`:

```typescript
export type TerminalDirectory = '/' | '/experience' | '/client-work' | '/projects';

export type TerminalAction =
  | { type: 'none' }
  | { type: 'scroll', targetId: string }
  | { type: 'external', url: string }
  | { type: 'close' }
  | { type: 'clear' };

export type TerminalSession = {
  cwd: TerminalDirectory,
};

export type TerminalCommandResult = {
  session: TerminalSession,
  lines: string[],
  action: TerminalAction,
};

export type TerminalFile = {
  name: string,
  lines: string[],
};

export type TerminalDirectoryEntry = {
  name: string,
  path: TerminalDirectory,
};
```

- [x] **Step 4: Add virtual filesystem and command metadata**

Create `src/terminal/terminalData.ts`:

```typescript
import { TerminalDirectory, TerminalDirectoryEntry, TerminalFile } from './terminalTypes';

export const terminalDirectories: Record<TerminalDirectory, { directories: TerminalDirectoryEntry[], files: TerminalFile[] }> = {
  '/': {
    directories: [
      { name: 'experience', path: '/experience' },
      { name: 'client-work', path: '/client-work' },
      { name: 'projects', path: '/projects' },
    ],
    files: [
      {
        name: 'about.txt',
        lines: [
          'Raymond Salim',
          'Software Engineer II specializing in backend engineering and data systems.',
          'Current focus: distributed pipelines, reliability, and practical product delivery.',
        ],
      },
      {
        name: 'contact.txt',
        lines: [
          'email: raymond@raymonds.dev',
          'github: https://github.com/RaymondSalim',
          'linkedin: https://www.linkedin.com/in/raymondsalim/',
        ],
      },
      {
        name: 'links.txt',
        lines: [
          'github     https://github.com/RaymondSalim',
          'linkedin   https://www.linkedin.com/in/raymondsalim/',
          'email      mailto:raymond@raymonds.dev',
        ],
      },
    ],
  },
  '/experience': {
    directories: [],
    files: [
      {
        name: 'domaintools.txt',
        lines: [
          'DomainTools',
          'Software Engineer II, July 2024 - Present',
          'Backend and data systems work across RDAP history, Kafka-connected services, OpenSearch, Redis, PostgreSQL, and Rust.',
        ],
      },
      {
        name: 'novometrix.txt',
        lines: [
          'Novometrix',
          'Software Engineer, September 2022 - February 2024',
          'Backend systems, async processing, Redis caching, Go microservices, and Next.js frontend work.',
        ],
      },
      {
        name: 'tokopedia.txt',
        lines: [
          'Tokopedia',
          'Software Engineer Intern, October 2021 - March 2022',
          'Golang performance work, test coverage, data submission automation, and authenticated API endpoints.',
        ],
      },
      {
        name: 'mandiri.txt',
        lines: [
          'Mandiri',
          'Software Engineer Intern, May 2021 - July 2021',
          'Java Spring microservice work, third-party API integration, UI/UX planning, and unit/integration testing.',
        ],
      },
      {
        name: 'kalbe-farma.txt',
        lines: [
          'Kalbe Farma',
          'IT Developer Intern, October 2020 - March 2021',
          'Python/PHP scraper, authentication, background scheduling, CMS work, and campaign landing pages.',
        ],
      },
      {
        name: 'freelance.txt',
        lines: [
          'Freelance',
          'Freelance Developer, March 2021 - Present',
          'Client websites and landing pages using Next.js, Vite, Gatsby, React, and TypeScript.',
        ],
      },
    ],
  },
  '/client-work': {
    directories: [],
    files: [
      {
        name: 'hms.txt',
        lines: [
          'HMS',
          'Production Property Management Platform',
          'Private client platform covering locations, rooms, tenants, bookings, billing, payments, deposits, and financial reporting.',
        ],
      },
      {
        name: 'proven.txt',
        lines: [
          'Proven',
          'Landing Page',
          'React and TypeScript landing page with an interactive quiz and analytics integration.',
        ],
      },
      {
        name: 'life.txt',
        lines: [
          'Life',
          'Landing Page',
          'React and TypeScript landing page with analytics integration.',
        ],
      },
    ],
  },
  '/projects': {
    directories: [],
    files: [
      {
        name: 'ultiboard.txt',
        lines: [
          'Ultiboard',
          'Full-stack strategy-board platform using Next.js, Prisma, TypeScript, PostgreSQL, Vitest, and Playwright.',
        ],
      },
      {
        name: 'icloud-album-downloader.txt',
        lines: [
          'iCloud Album Downloader',
          'Browser extension for downloading complete public iCloud shared albums with privacy-conscious telemetry.',
        ],
      },
      {
        name: 'reddit-downloader.txt',
        lines: [
          'Reddit Downloader',
          'Kotlin app for background media downloads with local persistence.',
        ],
      },
      {
        name: 'e-commerce-web-scraper.txt',
        lines: [
          'E-commerce Web Scraper',
          'Python and PHP scraper for Indonesian e-commerce product data.',
        ],
      },
      {
        name: 'tracker.txt',
        lines: [
          'Tracker',
          'Kotlin location, call-history, and message tracking project using Firebase.',
        ],
      },
    ],
  },
};

export const terminalSections: Record<string, string> = {
  about: 'about-me',
  experience: 'experience',
  work: 'experience',
  'client-work': 'client-work',
  clients: 'client-work',
  projects: 'projects',
  contact: 'contact',
};

export const terminalExternalLinks: Record<string, { label: string, url: string }> = {
  github: { label: 'GitHub', url: 'https://github.com/RaymondSalim' },
  linkedin: { label: 'LinkedIn', url: 'https://www.linkedin.com/in/raymondsalim/' },
  email: { label: 'email', url: 'mailto:raymond@raymonds.dev' },
};
```

- [x] **Step 5: Implement command execution**

Create `src/terminal/terminalCommands.ts`:

```typescript
import { terminalDirectories, terminalExternalLinks, terminalSections } from './terminalData';
import { TerminalCommandResult, TerminalDirectory, TerminalSession } from './terminalTypes';

const noAction = { type: 'none' as const };

export function initialTerminalSession(): TerminalSession {
  return { cwd: '/' };
}

function normalizeDirectoryName(input: string): string {
  return input.replace(/^\\//, '').replace(/\\/$/, '');
}

function pathForDirectory(input: string, cwd: TerminalDirectory): TerminalDirectory | undefined {
  const normalized = normalizeDirectoryName(input);

  if (input === '/' || normalized.length === 0) return '/';
  if (normalized === '..') return '/';

  if (normalized === 'experience') return '/experience';
  if (normalized === 'client-work') return '/client-work';
  if (normalized === 'projects') return '/projects';

  if (cwd !== '/' && normalized === '.') return cwd;

  return undefined;
}

function fileLinesForPath(input: string, cwd: TerminalDirectory): string[] | undefined {
  const normalized = input.replace(/^\\//, '');
  const parts = normalized.split('/').filter((part) => part.length > 0);

  if (parts.length === 1) {
    return terminalDirectories[cwd].files.find((file) => file.name === parts[0])?.lines;
  }

  if (parts.length === 2) {
    const directory = pathForDirectory(parts[0], '/');
    if (directory === undefined) return undefined;
    return terminalDirectories[directory].files.find((file) => file.name === parts[1])?.lines;
  }

  return undefined;
}

function listDirectory(path: TerminalDirectory): string[] {
  const directory = terminalDirectories[path];
  return [
    ...directory.files.map((file) => file.name),
    ...directory.directories.map((entry) => `${entry.name}/`),
  ];
}

export function executeTerminalCommand(rawCommand: string, session: TerminalSession): TerminalCommandResult {
  const command = rawCommand.trim().replace(/\\s+/g, ' ');
  const lower = command.toLowerCase();

  if (command.length === 0) {
    return { session, lines: [], action: noAction };
  }

  if (lower === 'help') {
    return {
      session,
      lines: [
        'available commands:',
        'help clear exit whoami pwd ls cd cat',
        'about experience client-work projects contact',
        'github linkedin email',
      ],
      action: noAction,
    };
  }

  if (lower === 'clear') return { session, lines: [], action: { type: 'clear' } };
  if (lower === 'exit') return { session, lines: ['closing terminal...'], action: { type: 'close' } };
  if (lower === 'pwd') return { session, lines: [session.cwd], action: noAction };
  if (lower === 'whoami') {
    return {
      session,
      lines: ['Raymond Salim', 'Software Engineer II', 'Backend engineering, data systems, and client product delivery.'],
      action: noAction,
    };
  }

  if (lower === 'ls') return { session, lines: listDirectory(session.cwd), action: noAction };
  if (lower.startsWith('ls ')) {
    const requested = command.slice(3).trim();
    const directory = pathForDirectory(requested, session.cwd);
    if (directory === undefined) return { session, lines: [`ls: ${requested}: no such directory`], action: noAction };
    return { session, lines: listDirectory(directory), action: noAction };
  }

  if (lower.startsWith('cd ')) {
    const requested = command.slice(3).trim();
    const file = fileLinesForPath(requested, session.cwd);
    if (file !== undefined) return { session, lines: [`cd: ${requested}: not a directory`], action: noAction };

    const directory = pathForDirectory(requested, session.cwd);
    if (directory === undefined) return { session, lines: [`cd: ${requested}: no such directory`], action: noAction };

    return { session: { cwd: directory }, lines: [directory], action: noAction };
  }

  if (lower.startsWith('cat ')) {
    const requested = command.slice(4).trim();
    const lines = fileLinesForPath(requested, session.cwd);
    if (lines === undefined) return { session, lines: [`cat: ${requested}: no such file`], action: noAction };
    return { session, lines, action: noAction };
  }

  const openMatch = lower.match(/^open (about|experience|work|client-work|clients|projects|contact)$/);
  const sectionKey = openMatch?.[1] ?? lower;
  const sectionTarget = terminalSections[sectionKey];
  if (sectionTarget !== undefined) {
    return { session, lines: [`opening ${sectionKey}...`], action: { type: 'scroll', targetId: sectionTarget } };
  }

  const external = terminalExternalLinks[lower];
  if (external !== undefined) {
    return { session, lines: [`opening ${external.label}...`], action: { type: 'external', url: external.url } };
  }

  return {
    session,
    lines: [`command not found: ${command}`, 'type `help` to see available commands'],
    action: noAction,
  };
}
```

- [x] **Step 6: Run command tests and verify they pass**

Run:

```bash
CI=true npm test -- --runTestsByPath src/terminal/terminalCommands.test.ts --watchAll=false
```

Expected: PASS.

- [x] **Step 7: Commit command engine**

```bash
git add src/terminal/terminalTypes.ts src/terminal/terminalData.ts src/terminal/terminalCommands.ts src/terminal/terminalCommands.test.ts
git commit -m "feat(terminal): add command engine"
```

---

## Task 2: Terminal UI Component

**Files:**
- Create: `src/terminal/TerminalMode.tsx`
- Create: `src/terminal/TerminalMode.test.tsx`

- [x] **Step 1: Write failing component interaction tests**

Create `src/terminal/TerminalMode.test.tsx`:

```typescript
import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { TerminalMode } from './TerminalMode';

function renderOpenTerminal(overrides: Partial<React.ComponentProps<typeof TerminalMode>> = {}) {
  const onClose = jest.fn();
  const onScrollToSection = jest.fn();
  const onExternalOpen = jest.fn();

  render(
    <TerminalMode
      isOpen={true}
      onClose={onClose}
      onScrollToSection={onScrollToSection}
      onExternalOpen={onExternalOpen}
      isMobile={false}
      {...overrides}
    />,
  );

  return { onClose, onScrollToSection, onExternalOpen };
}

test('focuses the command input when opened', () => {
  renderOpenTerminal();

  expect(screen.getByLabelText('Terminal command')).toHaveFocus();
});

test('submits whoami and prints output', () => {
  renderOpenTerminal();
  const input = screen.getByLabelText('Terminal command');

  fireEvent.change(input, { target: { value: 'whoami' } });
  fireEvent.keyDown(input, { key: 'Enter' });

  expect(screen.getByText('> whoami')).toBeInTheDocument();
  expect(screen.getByText('Raymond Salim')).toBeInTheDocument();
});

test('clear removes prior output', () => {
  renderOpenTerminal();
  const input = screen.getByLabelText('Terminal command');

  fireEvent.change(input, { target: { value: 'whoami' } });
  fireEvent.keyDown(input, { key: 'Enter' });
  fireEvent.change(input, { target: { value: 'clear' } });
  fireEvent.keyDown(input, { key: 'Enter' });

  expect(screen.queryByText('Raymond Salim')).not.toBeInTheDocument();
});

test('exit closes terminal', () => {
  const { onClose } = renderOpenTerminal();
  const input = screen.getByLabelText('Terminal command');

  fireEvent.change(input, { target: { value: 'exit' } });
  fireEvent.keyDown(input, { key: 'Enter' });

  expect(onClose).toHaveBeenCalledTimes(1);
});

test('section commands request scroll', () => {
  const { onScrollToSection } = renderOpenTerminal();
  const input = screen.getByLabelText('Terminal command');

  fireEvent.change(input, { target: { value: 'projects' } });
  fireEvent.keyDown(input, { key: 'Enter' });

  expect(onScrollToSection).toHaveBeenCalledWith('projects');
});

test('external commands request link opening', () => {
  const { onExternalOpen } = renderOpenTerminal();
  const input = screen.getByLabelText('Terminal command');

  fireEvent.change(input, { target: { value: 'github' } });
  fireEvent.keyDown(input, { key: 'Enter' });

  expect(onExternalOpen).toHaveBeenCalledWith('https://github.com/RaymondSalim');
});

test('arrow keys navigate in-memory command history', () => {
  renderOpenTerminal();
  const input = screen.getByLabelText('Terminal command') as HTMLInputElement;

  fireEvent.change(input, { target: { value: 'whoami' } });
  fireEvent.keyDown(input, { key: 'Enter' });
  fireEvent.change(input, { target: { value: 'pwd' } });
  fireEvent.keyDown(input, { key: 'Enter' });
  fireEvent.keyDown(input, { key: 'ArrowUp' });

  expect(input.value).toBe('pwd');

  fireEvent.keyDown(input, { key: 'ArrowUp' });
  expect(input.value).toBe('whoami');

  fireEvent.keyDown(input, { key: 'ArrowDown' });
  expect(input.value).toBe('pwd');
});
```

- [x] **Step 2: Run component tests and verify they fail**

Run:

```bash
CI=true npm test -- --runTestsByPath src/terminal/TerminalMode.test.tsx --watchAll=false
```

Expected: FAIL because `TerminalMode` does not exist.

- [x] **Step 3: Implement `TerminalMode`**

Create `src/terminal/TerminalMode.tsx`:

```tsx
import React from 'react';
import { executeTerminalCommand, initialTerminalSession } from './terminalCommands';
import { TerminalSession } from './terminalTypes';

type TerminalOutputLine = {
  id: number,
  text: string,
  kind: 'input' | 'output' | 'error',
};

export interface TerminalModeProps {
  isOpen: boolean
  isMobile: boolean
  onClose: () => void
  onScrollToSection: (targetId: string) => void
  onExternalOpen: (url: string) => void
}

export interface TerminalModeState {
  input: string
  session: TerminalSession
  lines: TerminalOutputLine[]
  history: string[]
  historyIndex?: number
}

export class TerminalMode extends React.Component<TerminalModeProps, TerminalModeState> {
  inputRef: React.RefObject<HTMLInputElement>;
  lineId = 0;

  constructor(props: TerminalModeProps) {
    super(props);
    this.inputRef = React.createRef();
    this.state = {
      input: '',
      session: initialTerminalSession(),
      lines: [
        this.outputLine('type `help` to see available commands'),
      ],
      history: [],
    };
  }

  componentDidMount() {
    if (this.props.isOpen) {
      this.focusInput();
    }
  }

  componentDidUpdate(prevProps: TerminalModeProps) {
    if (!prevProps.isOpen && this.props.isOpen) {
      this.focusInput();
    }
  }

  focusInput = () => {
    window.setTimeout(() => this.inputRef.current?.focus(), 0);
  };

  outputLine(text: string, kind: TerminalOutputLine['kind'] = 'output'): TerminalOutputLine {
    this.lineId += 1;
    return { id: this.lineId, text, kind };
  }

  submitCommand = () => {
    const command = this.state.input.trim();
    if (command.length === 0) return;

    const result = executeTerminalCommand(command, this.state.session);

    if (result.action.type === 'clear') {
      this.setState({
        input: '',
        lines: [],
        session: result.session,
        history: [...this.state.history, command],
        historyIndex: undefined,
      });
      return;
    }

    const nextLines = [
      ...this.state.lines,
      this.outputLine(`> ${command}`, 'input'),
      ...result.lines.map((line) => this.outputLine(line, line.startsWith('command not found') ? 'error' : 'output')),
    ];

    this.setState({
      input: '',
      lines: nextLines,
      session: result.session,
      history: [...this.state.history, command],
      historyIndex: undefined,
    }, () => {
      if (result.action.type === 'close') this.props.onClose();
      if (result.action.type === 'scroll') this.props.onScrollToSection(result.action.targetId);
      if (result.action.type === 'external') this.props.onExternalOpen(result.action.url);
    });
  };

  handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      this.submitCommand();
      return;
    }

    if (e.key === 'Escape') {
      e.preventDefault();
      this.props.onClose();
      return;
    }

    if (e.key === 'ArrowUp') {
      e.preventDefault();
      const nextIndex = this.state.historyIndex === undefined
        ? this.state.history.length - 1
        : Math.max(0, this.state.historyIndex - 1);
      if (nextIndex >= 0) {
        this.setState({ input: this.state.history[nextIndex], historyIndex: nextIndex });
      }
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (this.state.historyIndex === undefined) return;
      const nextIndex = this.state.historyIndex + 1;
      if (nextIndex >= this.state.history.length) {
        this.setState({ input: '', historyIndex: undefined });
      } else {
        this.setState({ input: this.state.history[nextIndex], historyIndex: nextIndex });
      }
    }
  };

  render() {
    if (!this.props.isOpen) return null;

    return (
      <section
        id="terminal-mode"
        className={this.props.isMobile ? 'terminal-mode-mobile' : 'terminal-mode-desktop'}
        role="dialog"
        aria-modal={this.props.isMobile}
        aria-label="Terminal mode"
      >
        <div id="terminal-mode-header">
          <span>raymonds.dev:{this.state.session.cwd}</span>
          <button type="button" onClick={this.props.onClose} aria-label="Close terminal mode">x</button>
        </div>
        <div id="terminal-mode-output" aria-live="polite">
          {this.state.lines.map((line) => (
            <p key={line.id} className={`terminal-line terminal-line-${line.kind}`}>{line.text}</p>
          ))}
        </div>
        <label id="terminal-mode-input-row">
          <span>&gt;</span>
          <input
            ref={this.inputRef}
            aria-label="Terminal command"
            value={this.state.input}
            onChange={(e) => this.setState({ input: e.target.value })}
            onKeyDown={this.handleKeyDown}
            autoComplete="off"
            spellCheck={false}
          />
        </label>
      </section>
    );
  }
}
```

- [x] **Step 4: Run component tests and verify they pass**

Run:

```bash
CI=true npm test -- --runTestsByPath src/terminal/TerminalMode.test.tsx --watchAll=false
```

Expected: PASS.

- [x] **Step 5: Commit component behavior**

```bash
git add src/terminal/TerminalMode.tsx src/terminal/TerminalMode.test.tsx
git commit -m "feat(terminal): add terminal mode component"
```

---

## Task 3: Terminal Styling And CSS Import

**Files:**
- Create: `src/terminal/TerminalMode.css`
- Modify: `src/components/components.css`

- [x] **Step 1: Add terminal styles**

Create `src/terminal/TerminalMode.css`:

```css
#terminal-mode {
    @apply z-[60] border-2 border-brutalist-border dark:border-brutalist-bg bg-brutalist-fg dark:bg-brutalist-bg text-brutalist-bg dark:text-brutalist-fg font-mono;
}

.terminal-mode-desktop {
    @apply fixed right-4 bottom-4 w-[min(560px,calc(100vw_-_2rem))] max-h-[60vh] flex flex-col;
}

.terminal-mode-mobile {
    @apply fixed inset-0 w-screen h-screen flex flex-col;
}

#terminal-mode-header {
    @apply flex items-center justify-between border-b-2 border-brutalist-bg dark:border-brutalist-fg px-3 py-2 text-sm;
}

#terminal-mode-header span,
#terminal-mode-header button {
    @apply text-brutalist-bg dark:text-brutalist-fg font-mono;
}

#terminal-mode-header button {
    @apply px-2 py-1 border-2 border-brutalist-bg dark:border-brutalist-fg uppercase font-bold;
}

#terminal-mode-header button:hover,
#terminal-mode-header button:focus {
    @apply text-brutalist-accent border-brutalist-accent;
}

#terminal-mode-output {
    @apply flex-1 overflow-y-auto px-3 py-3 space-y-1;
}

.terminal-line {
    @apply text-sm leading-6 text-brutalist-bg dark:text-brutalist-fg font-mono whitespace-pre-wrap;
}

.terminal-line-input {
    @apply text-brutalist-accent dark:text-brutalist-accent;
}

.terminal-line-error {
    @apply text-red-400 dark:text-red-400;
}

#terminal-mode-input-row {
    @apply flex items-center gap-2 border-t-2 border-brutalist-bg dark:border-brutalist-fg px-3 py-2;
}

#terminal-mode-input-row span {
    @apply text-brutalist-accent dark:text-brutalist-accent font-mono;
}

#terminal-mode-input-row input {
    @apply flex-1 bg-transparent text-brutalist-bg dark:text-brutalist-fg font-mono outline-none border-0 p-0;
}
```

- [x] **Step 2: Import terminal CSS**

Modify `src/components/components.css`:

```css
@import "Experiences.css";
@import "Input.css";
@import "PageLoad.css";
@import "Projects.css";
@import "ClientWork.css";
@import "Contact.css";
@import "Footer.css";
@import "../terminal/TerminalMode.css";
```

- [x] **Step 3: Run build**

Run:

```bash
npm run build
```

Expected: exit 0. Existing warnings about `react-anime` sourcemap and older lint rules may still appear.

- [x] **Step 4: Commit styles**

```bash
git add src/terminal/TerminalMode.css src/components/components.css
git commit -m "feat(terminal): style terminal panel"
```

---

## Task 4: App Integration, Desktop Shortcut, And Terminal Actions

**Files:**
- Modify: `src/App.tsx`
- Test: `src/App.test.tsx`

- [x] **Step 1: Write failing app integration tests**

Create `src/App.test.tsx`:

```typescript
import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import App from './App';

beforeEach(() => {
  jest.spyOn(window, 'scrollTo').mockImplementation(() => {});
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation(() => ({ matches: false })),
  });
});

afterEach(() => {
  jest.restoreAllMocks();
});

test('backtick opens terminal on desktop', () => {
  Object.defineProperty(window, 'innerWidth', { writable: true, value: 1024 });
  render(<App />);

  fireEvent.keyDown(document, { key: '`' });

  expect(screen.getByRole('dialog', { name: 'Terminal mode' })).toBeInTheDocument();
});

test('desktop section command scrolls and keeps terminal open', () => {
  Object.defineProperty(window, 'innerWidth', { writable: true, value: 1024 });
  const target = document.createElement('section');
  target.id = 'projects';
  target.scrollIntoView = jest.fn();
  document.body.appendChild(target);

  render(<App />);
  fireEvent.keyDown(document, { key: '`' });
  const input = screen.getByLabelText('Terminal command');

  fireEvent.change(input, { target: { value: 'projects' } });
  fireEvent.keyDown(input, { key: 'Enter' });

  expect(target.scrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth' });
  expect(screen.getByRole('dialog', { name: 'Terminal mode' })).toBeInTheDocument();
});
```

- [x] **Step 2: Run app tests and verify they fail**

Run:

```bash
CI=true npm test -- --runTestsByPath src/App.test.tsx --watchAll=false
```

Expected: FAIL because `App` does not yet render terminal mode, handle backtick, or process terminal scroll actions.

- [x] **Step 3: Extend `AppState` and imports**

Modify the top of `src/App.tsx`:

```tsx
import { TerminalMode } from './terminal/TerminalMode';
```

Update `AppState`:

```tsx
export interface AppState {
  siteReady: boolean
  menuActive: boolean
  darkMode: boolean
  terminalModeActive: boolean
  isMobileViewport: boolean
}
```

Update constructor state:

```tsx
this.state = {
  siteReady: false,
  menuActive: false,
  darkMode: App.isDarkModeEnabled(),
  terminalModeActive: false,
  isMobileViewport: window.innerWidth <= 768,
};
```

- [x] **Step 4: Add terminal control methods**

Add methods inside `App`:

```tsx
openTerminalMode = () => {
  this.toggleMenu(false);
  this.toggleDocumentOverflow(window.innerWidth <= 768);
  this.setState({
    terminalModeActive: true,
    isMobileViewport: window.innerWidth <= 768,
  });
};

closeTerminalMode = () => {
  this.toggleDocumentOverflow(false);
  this.setState({
    terminalModeActive: false,
  });
};

scrollToSectionFromTerminal = (targetId: string) => {
  const scroll = () => {
    document.getElementById(targetId)?.scrollIntoView({ behavior: 'smooth' });
  };

  if (this.state.isMobileViewport) {
    this.closeTerminalMode();
    window.setTimeout(scroll, 0);
    return;
  }

  scroll();
};

openExternalFromTerminal = (url: string) => {
  window.open(url, '_blank', 'noopener,noreferrer');
};

handleTerminalShortcut = (e: KeyboardEvent) => {
  const target = e.target as HTMLElement | null;
  const tagName = target?.tagName?.toLowerCase();
  const isTextInput = tagName === 'input' || tagName === 'textarea' || target?.isContentEditable;

  if (isTextInput || window.innerWidth <= 768) return;

  if (e.key === '`') {
    e.preventDefault();
    this.openTerminalMode();
  }
};
```

- [x] **Step 5: Register and remove the shortcut listener**

In `componentDidMount`, after the resize listener:

```tsx
document.addEventListener('keydown', this.handleTerminalShortcut);
```

In `componentWillUnmount`:

```tsx
document.removeEventListener('keydown', this.handleTerminalShortcut);
```

- [x] **Step 6: Keep mobile state current on resize**

Update `handleResize()`:

```tsx
handleResize() {
  const isMobileViewport = window.innerWidth <= 768;
  this.setState({ isMobileViewport });

  if (window.innerWidth > 768) {
    this.toggleMenu(false);
    if (this.state.terminalModeActive) {
      this.toggleDocumentOverflow(false);
    }
  } else if (this.state.terminalModeActive) {
    this.toggleDocumentOverflow(true);
  }
}
```

- [x] **Step 7: Render terminal mode**

Do not pass `onTerminalOpen` into `Header` yet. Header trigger props are added in Task 5. Task 4 only wires the desktop backtick shortcut and terminal actions.

Render `TerminalMode` before closing `#page`:

```tsx
<TerminalMode
  isOpen={this.state.terminalModeActive}
  isMobile={this.state.isMobileViewport}
  onClose={this.closeTerminalMode}
  onScrollToSection={this.scrollToSectionFromTerminal}
  onExternalOpen={this.openExternalFromTerminal}
/>
```

- [x] **Step 8: Run app tests**

Run:

```bash
CI=true npm test -- --runTestsByPath src/App.test.tsx --watchAll=false
```

Expected: PASS.

- [x] **Step 9: Commit app integration**

```bash
git add src/App.tsx src/App.test.tsx
git commit -m "feat(terminal): integrate terminal mode in app"
```

---

## Task 5: Header Triggers And One-Time Hint Bubble

**Files:**
- Modify: `src/App.tsx`
- Modify: `src/navigation/Header.tsx`
- Modify: `src/navigation/navbar/desktop/NavBar.tsx`
- Modify: `src/navigation/navbar/mobile/NavBar.tsx`
- Modify: `src/navigation/menu/Menu.tsx`
- Modify: `src/navigation/Header.css`
- Modify: `src/navigation/navbar/desktop/NavBar.css`
- Modify: `src/navigation/navbar/mobile/Hamburger.css`
- Test: `src/navigation/Header.test.tsx`

- [x] **Step 1: Write failing header tests**

Create `src/navigation/Header.test.tsx`:

```typescript
import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { Header } from './Header';

function renderHeader() {
  const onTerminalOpen = jest.fn();
  render(
    <Header
      onTerminalOpen={onTerminalOpen}
      navBarMobileProps={{
        hamburger: { isActive: false, onclick: jest.fn() },
        menu: {
          isOpen: false,
          onItemClick: jest.fn(),
          darkMode: false,
          darkModeToggle: jest.fn(),
          onTerminalOpen,
        },
      }}
    />,
  );
  return { onTerminalOpen };
}

test('desktop terminal trigger opens terminal', () => {
  const { onTerminalOpen } = renderHeader();

  fireEvent.click(screen.getAllByRole('button', { name: 'Open terminal mode' })[0]);

  expect(onTerminalOpen).toHaveBeenCalledTimes(1);
});

test('terminal hint can be dismissed and persisted', () => {
  localStorage.clear();
  renderHeader();

  expect(screen.getByText('feeling techy? try terminal mode')).toBeInTheDocument();

  fireEvent.click(screen.getByRole('button', { name: 'Dismiss terminal hint' }));

  expect(localStorage.getItem('terminalHintSeen')).toBe('true');
  expect(screen.queryByText('feeling techy? try terminal mode')).not.toBeInTheDocument();
});
```

- [x] **Step 2: Run header tests and verify they fail**

Run:

```bash
CI=true npm test -- --runTestsByPath src/navigation/Header.test.tsx --watchAll=false
```

Expected: FAIL because header trigger and hint bubble do not exist.

- [x] **Step 3: Extend app/header/nav prop types**

Modify `src/App.tsx` `Header` usage:

```tsx
<Header navBarMobileProps={navbarMobileProps} onTerminalOpen={this.openTerminalMode}/>
```

Modify `src/navigation/Header.tsx` `HeaderProps`:

```tsx
export interface HeaderProps {
  navBarMobileProps: NavbarMobileProps
  onTerminalOpen: () => void
}
```

Modify desktop nav props in `src/navigation/navbar/desktop/NavBar.tsx`:

```tsx
export interface NavBarDesktopProps {
  darkMode: boolean
  darkModeToggle: (e: SyntheticEvent) => void
  onTerminalOpen: () => void
}
```

Modify mobile menu props in `src/navigation/menu/Menu.tsx`:

```tsx
onTerminalOpen: () => void
```

- [x] **Step 4: Add trigger and hint state to Header**

Modify `HeaderState`:

```tsx
export interface HeaderState {
  windowY: number
  expanded?: boolean
  hidden?: boolean
  forceNotHidden?: boolean
  terminalHintVisible: boolean
}
```

Initialize state in constructor:

```tsx
this.state = {
  windowY: Number.MIN_SAFE_INTEGER,
  terminalHintVisible: localStorage.getItem('terminalHintSeen') !== 'true',
};
```

Add methods:

```tsx
dismissTerminalHint = () => {
  localStorage.setItem('terminalHintSeen', 'true');
  this.setState({ terminalHintVisible: false });
};

openTerminal = () => {
  this.dismissTerminalHint();
  this.props.onTerminalOpen();
};
```

In `componentDidMount`, add:

```tsx
window.setTimeout(() => {
  if (this.state.terminalHintVisible) {
    this.dismissTerminalHint();
  }
}, 6000);
```

- [x] **Step 5: Pass trigger callback to navs and render hint bubble**

Modify the `Header` render body:

```tsx
<NavBarMobile hamburger={this.props.navBarMobileProps.hamburger}
              menu={{ ...this.props.navBarMobileProps.menu, onTerminalOpen: this.openTerminal }}/>
<NavBarDesktop darkMode={this.props.navBarMobileProps.menu.darkMode}
               darkModeToggle={this.props.navBarMobileProps.menu.darkModeToggle}
               onTerminalOpen={this.openTerminal}/>
{
  this.state.terminalHintVisible
    ? <div id="terminal-hint" role="status">
      <span>feeling techy? try terminal mode</span>
      <button type="button" aria-label="Dismiss terminal hint" onClick={this.dismissTerminalHint}>x</button>
    </div>
    : null
}
```

- [x] **Step 6: Render desktop trigger button**

In `src/navigation/navbar/desktop/NavBar.tsx`, add this list item before the dark-mode toggle:

```tsx
<li className={'terminal-trigger-container'}>
  <button type="button" className="terminal-trigger" aria-label="Open terminal mode" onClick={this.props.onTerminalOpen}>
    &gt;_
  </button>
</li>
```

- [x] **Step 7: Render mobile trigger button**

In `src/navigation/navbar/mobile/NavBar.tsx`, render trigger before `Hamburger`:

```tsx
<button
  type="button"
  className="terminal-trigger terminal-trigger-mobile"
  aria-label="Open terminal mode"
  onClick={this.props.menu.onTerminalOpen}
>
  &gt;_
</button>
```

- [x] **Step 8: Style trigger and hint**

Add to `src/navigation/Header.css`:

```css
#terminal-hint {
    @apply absolute right-4 top-[calc(var(--header-height-scroll)+0.75rem)] z-[70] border-2 border-brutalist-border dark:border-brutalist-bg bg-brutalist-bg dark:bg-brutalist-fg px-3 py-2 flex items-center gap-3;
}

#terminal-hint span,
#terminal-hint button {
    @apply font-mono text-sm text-brutalist-fg dark:text-brutalist-bg;
}

#terminal-hint button {
    @apply border-2 border-brutalist-border dark:border-brutalist-bg px-2 font-bold;
}
```

Add to `src/navigation/navbar/desktop/NavBar.css`:

```css
#navbar-desktop .terminal-trigger-container {
    @apply !ml-4;
}

#navbar-desktop .terminal-trigger {
    @apply h-7 px-2 border-2 border-brutalist-border dark:border-brutalist-bg text-brutalist-fg dark:text-brutalist-bg font-mono font-bold transition-colors;
}

#navbar-desktop .terminal-trigger:hover,
#navbar-desktop .terminal-trigger:focus {
    @apply text-brutalist-accent border-brutalist-accent;
}
```

Add to `src/navigation/navbar/mobile/Hamburger.css`:

```css
.terminal-trigger-mobile {
    @apply fixed top-5 right-[calc(5rem+0.75rem)] z-50 h-10 px-2 border-2 border-brutalist-border dark:border-brutalist-bg text-brutalist-fg dark:text-brutalist-bg bg-brutalist-bg dark:bg-brutalist-fg font-mono font-bold;
}

.terminal-trigger-mobile:hover,
.terminal-trigger-mobile:focus {
    @apply text-brutalist-accent border-brutalist-accent;
}
```

- [x] **Step 9: Run header tests**

Run:

```bash
CI=true npm test -- --runTestsByPath src/navigation/Header.test.tsx --watchAll=false
```

Expected: PASS.

- [x] **Step 10: Commit header trigger and hint**

```bash
git add src/App.tsx src/navigation/Header.tsx src/navigation/Header.css src/navigation/navbar/desktop/NavBar.tsx src/navigation/navbar/desktop/NavBar.css src/navigation/navbar/mobile/NavBar.tsx src/navigation/navbar/mobile/Hamburger.css src/navigation/menu/Menu.tsx src/navigation/Header.test.tsx
git commit -m "feat(terminal): add header trigger and hint"
```

---

## Task 6: Final Verification Sweep

**Files:**
- Modify only files needed to fix issues found by verification.

- [x] **Step 1: Run focused terminal tests**

Run:

```bash
CI=true npm test -- --runTestsByPath src/terminal/terminalCommands.test.ts src/terminal/TerminalMode.test.tsx src/navigation/Header.test.tsx src/App.test.tsx --watchAll=false
```

Expected: PASS.

- [x] **Step 2: Run production build**

Run:

```bash
npm run build
```

Expected: exit 0. Existing warnings about `react-anime` sourcemap and legacy lint rules may appear. New TypeScript errors or new build failures must be fixed.

- [x] **Step 3: Manual desktop verification**

Run:

```bash
npm start
```

Open `http://localhost:3000` at desktop width.

Verify:

- The `>_` trigger appears near the dark-mode toggle.
- The one-time hint appears once and can be dismissed.
- Backtick opens the floating terminal.
- `whoami`, `help`, `ls`, `cd experience`, `cat domaintools.txt`, `projects`, `github`, `clear`, and `exit` behave as specified.
- `projects` scrolls to the Projects section and leaves the terminal open.
- `Esc` closes the terminal.
- Light and dark mode remain legible.

- [x] **Step 4: Manual mobile verification**

With the dev server still running, use a 390px-wide viewport.

Verify:

- The `>_` trigger appears in the mobile header.
- Tapping it opens a full-screen terminal.
- `projects` closes terminal, unlocks document scroll, and lands on Projects.
- `help`, `whoami`, `ls`, and `cat about.txt` keep terminal open.
- The input receives focus on open.
- Closing terminal restores page scroll.

- [x] **Step 5: Commit final fixes if needed**

If verification required code changes:

```bash
git add src
git commit -m "fix(terminal): address verification issues"
```

If no changes were needed, skip this commit.

---

## Spec Coverage Self-Review

- Discovery: Task 5 adds `>_` trigger, backtick support is in Task 4, one-time bubble is in Task 5.
- Open state: Task 2 and Task 3 add desktop floating and mobile full-screen UI.
- Commands: Task 1 implements deterministic command behavior.
- Virtual filesystem: Task 1 adds `ls`, `cat`, `cd`, `pwd`, relative resolution, and errors.
- Navigation: Task 4 implements desktop scroll and mobile close-then-scroll.
- External links: Task 1 defines actions and Task 4 opens URLs.
- Persistence: Task 5 persists only `terminalHintSeen`; Task 2 keeps history in memory.
- Accessibility: Task 2 adds dialog labeling and input focus; Task 5 uses real buttons and labels.
- Out of scope items: No draggable window, no route page, no network-backed command parsing, no real shell features, and no portfolio-wide content refactor.
