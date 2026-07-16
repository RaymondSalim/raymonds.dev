import React from 'react';
import {
  act,
  fireEvent,
  render,
  screen,
} from '@testing-library/react';
import { TerminalMode } from './TerminalMode';

function renderOpenTerminal(overrides: Partial<React.ComponentProps<typeof TerminalMode>> = {}) {
  const onClose = jest.fn();
  const onScrollToSection = jest.fn();
  const onExternalOpen = jest.fn();

  const view = render(
    <TerminalMode
      isOpen={true}
      onClose={onClose}
      onScrollToSection={onScrollToSection}
      onExternalOpen={onExternalOpen}
      isMobile={false}
      {...overrides}
    />,
  );

  return {
    onClose,
    onScrollToSection,
    onExternalOpen,
    ...view,
  };
}

function submitCommand(command: string) {
  const input = screen.getByLabelText('Terminal command');

  fireEvent.change(input, { target: { value: command } });
  fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });
}

function mockVisualViewport(initial: {
  height: number,
  width: number,
  offsetTop: number,
  offsetLeft: number,
}) {
  const listeners: Record<string, EventListener[]> = {
    resize: [],
    scroll: [],
  };
  const visualViewport = {
    ...initial,
    addEventListener: jest.fn((eventName: string, listener: EventListener) => {
      listeners[eventName].push(listener);
    }),
    removeEventListener: jest.fn((eventName: string, listener: EventListener) => {
      listeners[eventName] = listeners[eventName].filter((registered) => registered !== listener);
    }),
  };

  Object.defineProperty(window, 'visualViewport', {
    configurable: true,
    value: visualViewport,
  });

  return {
    visualViewport,
    update(next: Partial<typeof initial>, eventName: 'resize' | 'scroll' = 'resize') {
      Object.assign(visualViewport, next);
      listeners[eventName].forEach((listener) => listener(new Event(eventName)));
    },
  };
}

describe('TerminalMode', () => {
  afterEach(() => {
    Object.defineProperty(window, 'visualViewport', {
      configurable: true,
      value: undefined,
    });
  });

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

  test('mobile render follows the visual viewport when browser chrome or keyboard changes it', () => {
    const viewport = mockVisualViewport({
      height: 640,
      width: 390,
      offsetTop: 0,
      offsetLeft: 0,
    });

    renderOpenTerminal({ isMobile: true });

    const dialog = screen.getByRole('dialog', { name: 'Terminal mode' });
    expect(dialog).toHaveStyle({
      height: '640px',
      width: '390px',
      top: '0px',
      left: '0px',
    });

    act(() => {
      viewport.update({ height: 340, offsetTop: 180 });
    });

    expect(dialog).toHaveStyle({
      height: '340px',
      top: '180px',
    });
  });

  test('mobile visual viewport listeners are removed on unmount', () => {
    const { visualViewport } = mockVisualViewport({
      height: 640,
      width: 390,
      offsetTop: 0,
      offsetLeft: 0,
    });

    const { unmount } = renderOpenTerminal({ isMobile: true });

    unmount();

    expect(visualViewport.removeEventListener).toHaveBeenCalledWith('resize', expect.any(Function));
    expect(visualViewport.removeEventListener).toHaveBeenCalledWith('scroll', expect.any(Function));
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
