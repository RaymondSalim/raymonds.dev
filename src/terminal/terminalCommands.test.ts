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
    expect(catResult.lines.join('\n')).toContain('Software Engineer II');
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

  test('documents open section commands in help', () => {
    const result = executeTerminalCommand('help', initialTerminalSession());
    const helpText = result.lines.join('\n');

    expect(helpText).toContain('open projects');
    expect(helpText).toContain('open contact');
  });

  test('suggests help for unknown commands', () => {
    const result = executeTerminalCommand('sudo make me a sandwich', initialTerminalSession());

    expect(result.lines).toEqual(['command not found: sudo make me a sandwich', 'type `help` to see available commands']);
    expect(result.action).toEqual({ type: 'none' });
  });
});
