import { terminalDirectories, terminalExternalLinks, terminalSections } from './terminalData';
import {
  TerminalCommandResult,
  TerminalDirectory,
  TerminalDirectoryListingEntry,
  TerminalSectionKey,
  TerminalSession,
} from './terminalTypes';

const noAction = { type: 'none' as const };

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

  if (directory.listing !== undefined) {
    return directory.listing.map(listingEntryName);
  }

  return [
    ...directory.files.map((file) => file.name),
    ...directory.directories.map((entry) => `${entry.name}/`),
  ];
}

function isTerminalSectionKey(input: string): input is TerminalSectionKey {
  return input in terminalSections;
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
        'help clear exit whoami pwd ls',
        'cd experience cd client-work cd projects cd .. cd /',
        'ls experience ls client-work ls projects',
        'cat about.txt cat experience/domaintools.txt',
        'about experience client-work projects contact',
        'open projects open contact',
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
