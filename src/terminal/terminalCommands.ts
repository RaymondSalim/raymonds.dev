import { terminalDirectories, terminalExternalLinks, terminalSections } from './terminalData';
import {
  TerminalCommandResult,
  TerminalDirectory,
  TerminalDirectoryListingEntry,
  TerminalSectionKey,
  TerminalSession,
} from './terminalTypes';

const noAction = { type: 'none' as const };
const terminalCommandNames = ['cat', 'cd', 'clear', 'exit', 'help', 'ls', 'open', 'pwd', 'whoami'];
const terminalSectionCompletionKeys = ['about', 'experience', 'client-work', 'projects', 'contact'];

export function initialTerminalSession(): TerminalSession {
  return { cwd: '/' };
}

function normalizePath(input: string): string[] {
  return input.replace(/^\//, '').split('/').filter((part) => part.length > 0);
}

function directoryPathForName(name: string): TerminalDirectory | undefined {
  if (name === '') return '/';
  if (name === 'experience') return '/experience';
  if (name === 'client-work') return '/client-work';
  if (name === 'projects') return '/projects';

  return undefined;
}

function pathForDirectory(input: string, cwd: TerminalDirectory): TerminalDirectory | undefined {
  const normalized = input.replace(/^\/+/, '').replace(/\/+$/, '');

  if (input === '/' || normalized.length === 0) return '/';
  if (normalized === '.') return cwd;
  if (normalized === '..') return '/';

  return directoryPathForName(normalized);
}

function fileLinesForPath(input: string, cwd: TerminalDirectory): string[] | undefined {
  const baseDirectory = input.startsWith('/') ? '/' : cwd;
  const parts = normalizePath(input);

  if (parts.length === 1) {
    return terminalDirectories[baseDirectory].files.find((file) => file.name === parts[0])?.lines;
  }

  if (parts.length === 2) {
    const directory = directoryPathForName(parts[0]);
    if (directory === undefined) return undefined;

    return terminalDirectories[directory].files.find((file) => file.name === parts[1])?.lines;
  }

  return undefined;
}

function listingEntryName(entry: TerminalDirectoryListingEntry): string {
  return entry.type === 'directory' ? `${entry.name}/` : entry.name;
}

function listDirectory(path: TerminalDirectory): string[] {
  const directory = terminalDirectories[path];
  const listing = directory.listing ?? [
    ...directory.files.map((file) => ({ type: 'file' as const, name: file.name })),
    ...directory.directories.map((entry) => ({ type: 'directory' as const, name: entry.name })),
  ];

  return listing.map(listingEntryName).sort((left, right) => left.localeCompare(right));
}

function isTerminalSectionKey(input: string): input is TerminalSectionKey {
  return input in terminalSections;
}

function commonPrefix(values: string[]): string {
  if (values.length === 0) {
    return '';
  }

  return values.reduce((prefix, value) => {
    let index = 0;

    while (index < prefix.length && prefix[index] === value[index]) {
      index += 1;
    }

    return prefix.slice(0, index);
  });
}

function entriesForCompletion(cwd: TerminalDirectory, includeFiles: boolean): string[] {
  return listDirectory(cwd).filter((entry) => includeFiles || entry.endsWith('/'));
}

function completionEntriesForPath(input: string, cwd: TerminalDirectory, includeFiles: boolean): string[] {
  const parts = input.split('/');
  const prefix = parts.pop() ?? '';
  const parentInput = parts.join('/');
  const parentDirectory = parentInput.length === 0 ? cwd : pathForDirectory(parentInput, cwd);

  if (parentDirectory === undefined) {
    return [];
  }

  const parentPrefix = parentInput.length === 0 ? '' : `${parentInput.replace(/\/+$/, '')}/`;

  return entriesForCompletion(parentDirectory, includeFiles)
    .filter((entry) => entry.startsWith(prefix))
    .map((entry) => `${parentPrefix}${entry}`);
}

export function completeTerminalInput(input: string, session: TerminalSession): { input?: string, matches: string[] } {
  const normalized = input.replace(/\s+/g, ' ');
  const lower = normalized.toLowerCase();
  const [command = '', argument = ''] = normalized.split(' ');
  let matches: string[] = [];

  if (!normalized.includes(' ')) {
    matches = [
      ...terminalCommandNames,
      ...terminalSectionCompletionKeys,
      ...Object.keys(terminalExternalLinks),
    ].filter((candidate) => candidate.startsWith(lower));
  } else if (command === 'cd' || command === 'ls') {
    matches = completionEntriesForPath(argument, session.cwd, false)
      .map((entry) => entry.replace(/\/$/, ''));
  } else if (command === 'cat') {
    matches = completionEntriesForPath(argument, session.cwd, true);
  } else if (command === 'open') {
    matches = terminalSectionCompletionKeys.filter((candidate) => candidate.startsWith(argument));
  }

  const uniqueMatches = Array.from(new Set(matches)).sort((left, right) => left.localeCompare(right));

  if (uniqueMatches.length === 1) {
    return {
      input: normalized.includes(' ') ? `${command} ${uniqueMatches[0]}` : uniqueMatches[0],
      matches: uniqueMatches,
    };
  }

  const prefix = commonPrefix(uniqueMatches);

  if (prefix.length > argument.length && normalized.includes(' ')) {
    return { input: `${command} ${prefix}`, matches: uniqueMatches };
  }

  if (prefix.length > normalized.length && !normalized.includes(' ')) {
    return { input: prefix, matches: uniqueMatches };
  }

  return { matches: uniqueMatches };
}

export function executeTerminalCommand(rawCommand: string, session: TerminalSession): TerminalCommandResult {
  const command = rawCommand.trim().replace(/\s+/g, ' ');
  const lower = command.toLowerCase();

  if (command.length === 0) {
    return { session, lines: [], action: noAction };
  }

  if (lower === 'help') {
    return {
      session,
      lines: [
        'available commands:',
        'help clear exit whoami pwd ls cd cat open',
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
      lines: [
        'Raymond Salim',
        'Software Engineer II',
        'Backend engineering, data systems, and client product delivery.',
      ],
      action: noAction,
    };
  }

  if (lower === 'ls') return { session, lines: listDirectory(session.cwd), action: noAction };

  if (lower.startsWith('ls ')) {
    const requested = command.slice(3).trim();
    const directory = pathForDirectory(requested, session.cwd);

    if (directory === undefined) {
      return { session, lines: [`ls: ${requested}: no such directory`], action: noAction };
    }

    return { session, lines: listDirectory(directory), action: noAction };
  }

  if (lower.startsWith('cd ')) {
    const requested = command.slice(3).trim();
    const file = fileLinesForPath(requested, session.cwd);

    if (file !== undefined) {
      return { session, lines: [`cd: ${requested}: not a directory`], action: noAction };
    }

    const directory = pathForDirectory(requested, session.cwd);

    if (directory === undefined) {
      return { session, lines: [`cd: ${requested}: no such directory`], action: noAction };
    }

    return { session: { cwd: directory }, lines: [directory], action: noAction };
  }

  if (lower.startsWith('cat ')) {
    const requested = command.slice(4).trim();
    const lines = fileLinesForPath(requested, session.cwd);

    if (lines === undefined) {
      return { session, lines: [`cat: ${requested}: no such file`], action: noAction };
    }

    return { session, lines, action: noAction };
  }

  const openMatch = lower.match(/^open (about|experience|work|client-work|clients|projects|contact)$/);
  const sectionKey = openMatch?.[1] ?? lower;

  if (isTerminalSectionKey(sectionKey)) {
    const sectionTarget = terminalSections[sectionKey];

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
