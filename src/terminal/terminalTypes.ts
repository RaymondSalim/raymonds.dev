export type TerminalDirectory = '/' | '/experience' | '/client-work' | '/projects';

export type TerminalSectionKey = 'about' | 'experience' | 'work' | 'client-work' | 'clients' | 'projects' | 'contact';

export type TerminalSectionId = 'about-me' | 'experience' | 'client-work' | 'projects' | 'contact';

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

export type TerminalDirectoryListingEntry =
  | { type: 'file', name: string }
  | { type: 'directory', name: string };

export type TerminalDirectoryData = {
  directories: TerminalDirectoryEntry[],
  files: TerminalFile[],
  listing?: TerminalDirectoryListingEntry[],
};
