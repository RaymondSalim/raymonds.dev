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

  test('lists named virtual directories from root', () => {
    const experience = executeTerminalCommand('ls experience', initialTerminalSession());
    const clientWork = executeTerminalCommand('ls client-work', initialTerminalSession());
    const projects = executeTerminalCommand('ls projects', initialTerminalSession());

    expect(experience.lines).toContain('domaintools.txt');
    expect(clientWork.lines).toContain('hms.txt');
    expect(projects.lines).toContain('ultiboard.txt');
  });

  test('lists the current directory after cd', () => {
    const session = executeTerminalCommand('cd experience', initialTerminalSession()).session;
    const result = executeTerminalCommand('ls .', session);

    expect(result.session.cwd).toBe('/experience');
    expect(result.lines).toContain('domaintools.txt');
    expect(result.lines).toContain('freelance.txt');
  });

  test('changes directories and resolves relative cat commands', () => {
    const cdResult = executeTerminalCommand('cd experience', initialTerminalSession());
    const catResult = executeTerminalCommand('cat domaintools.txt', cdResult.session);

    expect(cdResult.session.cwd).toBe('/experience');
    expect(cdResult.lines).toEqual(['/experience']);
    expect(catResult.lines[0]).toContain('DomainTools');
    expect(catResult.lines.join('\n')).toContain('Software Engineer II');
  });

  test('resolves absolute cat paths from nested directories', () => {
    const session = executeTerminalCommand('cd experience', initialTerminalSession()).session;
    const result = executeTerminalCommand('cat /about.txt', session);

    expect(result.session.cwd).toBe('/experience');
    expect(result.lines[0]).toBe('Raymond Salim');
    expect(result.lines.join('\n')).toContain('Software Engineer II specializing in backend engineering and data systems.');
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

  test('returns precise cat errors for unknown files', () => {
    const result = executeTerminalCommand('cat missing.txt', initialTerminalSession());

    expect(result.lines).toEqual(['cat: missing.txt: no such file']);
    expect(result.action).toEqual({ type: 'none' });
  });

  test('prints the working directory', () => {
    const session = executeTerminalCommand('cd projects', initialTerminalSession()).session;
    const result = executeTerminalCommand('pwd', session);

    expect(result.lines).toEqual(['/projects']);
    expect(result.action).toEqual({ type: 'none' });
  });

  test('prints identity information', () => {
    const result = executeTerminalCommand('whoami', initialTerminalSession());

    expect(result.lines).toEqual([
      'Raymond Salim',
      'Software Engineer II',
      'Backend engineering, data systems, and client product delivery.',
    ]);
    expect(result.action).toEqual({ type: 'none' });
  });

  test('returns section scroll actions', () => {
    const result = executeTerminalCommand('projects', initialTerminalSession());

    expect(result.lines).toEqual(['opening projects...']);
    expect(result.action).toEqual({ type: 'scroll', targetId: 'projects' });
  });

  test('returns open section scroll actions', () => {
    const projects = executeTerminalCommand('open projects', initialTerminalSession());
    const contact = executeTerminalCommand('open contact', initialTerminalSession());

    expect(projects.lines).toEqual(['opening projects...']);
    expect(projects.action).toEqual({ type: 'scroll', targetId: 'projects' });
    expect(contact.lines).toEqual(['opening contact...']);
    expect(contact.action).toEqual({ type: 'scroll', targetId: 'contact' });
  });

  test('returns external link actions', () => {
    const result = executeTerminalCommand('github', initialTerminalSession());

    expect(result.lines).toEqual(['opening GitHub...']);
    expect(result.action).toEqual({ type: 'external', url: 'https://github.com/RaymondSalim' });
  });

  test('returns linkedin and email external actions', () => {
    const linkedin = executeTerminalCommand('linkedin', initialTerminalSession());
    const email = executeTerminalCommand('email', initialTerminalSession());

    expect(linkedin.lines).toEqual(['opening LinkedIn...']);
    expect(linkedin.action).toEqual({ type: 'external', url: 'https://www.linkedin.com/in/raymondsalim/' });
    expect(email.lines).toEqual(['opening email...']);
    expect(email.action).toEqual({ type: 'external', url: 'mailto:raymond@raymonds.dev' });
  });

  test('returns close and clear actions', () => {
    expect(executeTerminalCommand('exit', initialTerminalSession()).action).toEqual({ type: 'close' });
    expect(executeTerminalCommand('clear', initialTerminalSession()).action).toEqual({ type: 'clear' });
  });

  test('documents baseline command forms in help', () => {
    const result = executeTerminalCommand('help', initialTerminalSession());
    const helpText = result.lines.join('\n');

    expect(helpText).toContain('cd experience');
    expect(helpText).toContain('cd client-work');
    expect(helpText).toContain('cd projects');
    expect(helpText).toContain('cd ..');
    expect(helpText).toContain('cd /');
    expect(helpText).toContain('ls experience');
    expect(helpText).toContain('ls client-work');
    expect(helpText).toContain('ls projects');
    expect(helpText).toContain('cat about.txt');
    expect(helpText).toContain('cat experience/domaintools.txt');
    expect(helpText).toContain('open projects');
    expect(helpText).toContain('open contact');
    expect(result.lines[1]).toBe('help clear exit whoami pwd ls');
  });

  test('suggests help for unknown commands', () => {
    const result = executeTerminalCommand('sudo make me a sandwich', initialTerminalSession());

    expect(result.lines).toEqual(['command not found: sudo make me a sandwich', 'type `help` to see available commands']);
    expect(result.action).toEqual({ type: 'none' });
  });
});
