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

function submitCommand(command: string) {
  const input = screen.getByLabelText('Terminal command');

  fireEvent.change(input, { target: { value: command } });
  fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });
}

describe('TerminalMode', () => {
  test('focuses command input when opened', () => {
    renderOpenTerminal();

    expect(screen.getByLabelText('Terminal command')).toHaveFocus();
  });

  test('mobile render exposes mobile dialog semantics', () => {
    renderOpenTerminal({ isMobile: true });

    const dialog = screen.getByRole('dialog', { name: 'Terminal mode' });

    expect(dialog).toHaveClass('terminal-mode-mobile');
    expect(dialog).toHaveAttribute('aria-modal', 'true');
  });

  test('desktop render exposes desktop dialog semantics', () => {
    renderOpenTerminal();

    const dialog = screen.getByRole('dialog', { name: 'Terminal mode' });

    expect(dialog).toHaveClass('terminal-mode-desktop');
    expect(dialog).toHaveAttribute('aria-modal', 'false');
  });

  test('exposes terminal markup hooks for styling', () => {
    renderOpenTerminal();

    expect(screen.getByRole('group', { name: 'Terminal header' })).toHaveAttribute('id', 'terminal-mode-header');
    expect(screen.getByRole('log', { name: 'Terminal output' })).toHaveAttribute('id', 'terminal-mode-output');
    expect(screen.getByRole('group', { name: 'Terminal input' })).toHaveAttribute('id', 'terminal-mode-input-row');
  });

  test('submits whoami and prints output', () => {
    renderOpenTerminal();

    submitCommand('whoami');

    expect(screen.getByText('root@raymonds:/$ whoami')).toBeInTheDocument();
    expect(screen.getByText('Raymond Salim')).toBeInTheDocument();
    expect(screen.getByText('Software Engineer II')).toBeInTheDocument();
  });

  test('clear removes prior output', () => {
    renderOpenTerminal();

    submitCommand('whoami');
    submitCommand('clear');

    expect(screen.queryByText('root@raymonds:/$ whoami')).not.toBeInTheDocument();
    expect(screen.queryByText('Raymond Salim')).not.toBeInTheDocument();
    expect(screen.queryByText('root@raymonds:/$ clear')).not.toBeInTheDocument();
  });

  test('exit calls onClose', () => {
    const { onClose } = renderOpenTerminal();

    submitCommand('exit');

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  test('section command projects calls onScrollToSection', () => {
    const { onScrollToSection } = renderOpenTerminal();

    submitCommand('projects');

    expect(onScrollToSection).toHaveBeenCalledWith('projects');
  });

  test('external command github calls onExternalOpen', () => {
    const { onExternalOpen } = renderOpenTerminal();

    submitCommand('github');

    expect(onExternalOpen).toHaveBeenCalledWith('https://github.com/RaymondSalim');
  });

  test('ArrowUp and ArrowDown navigate in-memory command history', () => {
    renderOpenTerminal();
    const input = screen.getByLabelText('Terminal command');

    submitCommand('whoami');
    submitCommand('pwd');
    fireEvent.keyDown(input, { key: 'ArrowUp', code: 'ArrowUp' });

    expect(input).toHaveValue('pwd');

    fireEvent.keyDown(input, { key: 'ArrowUp', code: 'ArrowUp' });

    expect(input).toHaveValue('whoami');

    fireEvent.keyDown(input, { key: 'ArrowDown', code: 'ArrowDown' });

    expect(input).toHaveValue('pwd');

    fireEvent.keyDown(input, { key: 'ArrowDown', code: 'ArrowDown' });

    expect(input).toHaveValue('');
  });

  test('submitted command line has input styling hook', () => {
    renderOpenTerminal();

    submitCommand('whoami');

    expect(screen.getByText('root@raymonds:/$ whoami')).toHaveClass('terminal-line', 'terminal-line-input');
  });

  test('input row shows a linux-style prompt for the current directory', () => {
    renderOpenTerminal();

    expect(screen.getByText('root@raymonds:/$')).toBeInTheDocument();

    submitCommand('cd experience');

    expect(screen.getByText('root@raymonds:/experience$')).toBeInTheDocument();
  });

  test('submitted commands scroll output to the bottom', () => {
    renderOpenTerminal();
    const output = screen.getByRole('log', { name: 'Terminal output' });

    Object.defineProperty(output, 'scrollHeight', { configurable: true, value: 200 });
    Object.defineProperty(output, 'clientHeight', { configurable: true, value: 100 });
    output.scrollTop = 0;

    submitCommand('whoami');

    expect(output.scrollTop).toBe(200);
  });

  test('Tab completes command names by prefix', () => {
    renderOpenTerminal();
    const input = screen.getByLabelText('Terminal command');

    fireEvent.change(input, { target: { value: 'who' } });
    fireEvent.keyDown(input, { key: 'Tab', code: 'Tab' });

    expect(input).toHaveValue('whoami');
  });

  test('Tab completes cd directory names by prefix', () => {
    renderOpenTerminal();
    const input = screen.getByLabelText('Terminal command');

    fireEvent.change(input, { target: { value: 'cd c' } });
    fireEvent.keyDown(input, { key: 'Tab', code: 'Tab' });

    expect(input).toHaveValue('cd client-work');
  });

  test('Tab completes cat paths and keeps directory slash for partial directories', () => {
    renderOpenTerminal();
    const input = screen.getByLabelText('Terminal command');

    fireEvent.change(input, { target: { value: 'cat ex' } });
    fireEvent.keyDown(input, { key: 'Tab', code: 'Tab' });

    expect(input).toHaveValue('cat experience/');

    fireEvent.change(input, { target: { value: 'cat experience/do' } });
    fireEvent.keyDown(input, { key: 'Tab', code: 'Tab' });

    expect(input).toHaveValue('cat experience/domaintools.txt');
  });

  test('Tab prints sorted matches when completion is ambiguous', () => {
    renderOpenTerminal();
    const input = screen.getByLabelText('Terminal command');

    fireEvent.change(input, { target: { value: 'c' } });
    fireEvent.keyDown(input, { key: 'Tab', code: 'Tab' });

    expect(input).toHaveValue('c');
    expect(screen.getByText('cat cd clear client-work contact')).toBeInTheDocument();
  });
});
