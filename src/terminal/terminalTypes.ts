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
