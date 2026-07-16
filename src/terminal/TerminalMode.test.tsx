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

  test('submits whoami and prints output', () => {
    renderOpenTerminal();

    submitCommand('whoami');

    expect(screen.getByText('> whoami')).toBeInTheDocument();
    expect(screen.getByText('Raymond Salim')).toBeInTheDocument();
    expect(screen.getByText('Software Engineer II')).toBeInTheDocument();
  });

  test('clear removes prior output', () => {
    renderOpenTerminal();

    submitCommand('whoami');
    submitCommand('clear');

    expect(screen.queryByText('> whoami')).not.toBeInTheDocument();
    expect(screen.queryByText('Raymond Salim')).not.toBeInTheDocument();
    expect(screen.queryByText('> clear')).not.toBeInTheDocument();
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
});
