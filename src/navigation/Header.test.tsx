import React from 'react';
import {
  act,
  fireEvent,
  render,
  screen,
} from '@testing-library/react';
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
        },
      }}
    />,
  );

  return { onTerminalOpen };
}

beforeEach(() => {
  localStorage.clear();
  document.documentElement.style.fontSize = '16px';
  jest.spyOn(window, 'scroll').mockImplementation(() => {});
});

afterEach(() => {
  jest.restoreAllMocks();
  jest.useRealTimers();
});

test('desktop terminal trigger opens terminal', () => {
  const { onTerminalOpen } = renderHeader();

  fireEvent.click(screen.getAllByRole('button', { name: 'Open terminal mode' })[0]);

  expect(onTerminalOpen).toHaveBeenCalledTimes(1);
});

test('mobile terminal trigger opens terminal', () => {
  const { onTerminalOpen } = renderHeader();

  fireEvent.click(screen.getAllByRole('button', { name: 'Open terminal mode' })[1]);

  expect(onTerminalOpen).toHaveBeenCalledTimes(1);
});

test('desktop terminal hint appears once and can be dismissed', () => {
  renderHeader();

  expect(screen.getByText('feeling techy?')).toBeInTheDocument();

  fireEvent.click(screen.getByRole('button', { name: 'Dismiss terminal hint' }));

  expect(localStorage.getItem('terminalHintSeen')).toBe('true');
  expect(screen.queryByText('feeling techy?')).not.toBeInTheDocument();
});

test('opening terminal hides and persists the desktop hint', () => {
  const { onTerminalOpen } = renderHeader();

  fireEvent.click(screen.getAllByRole('button', { name: 'Open terminal mode' })[0]);

  expect(onTerminalOpen).toHaveBeenCalledTimes(1);
  expect(localStorage.getItem('terminalHintSeen')).toBe('true');
  expect(screen.queryByText('feeling techy?')).not.toBeInTheDocument();
});

test('desktop terminal hint is not shown after persistence', () => {
  localStorage.setItem('terminalHintSeen', 'true');

  renderHeader();

  expect(screen.queryByText('feeling techy?')).not.toBeInTheDocument();
});

test('desktop terminal hint auto-dismisses and persists', () => {
  jest.useFakeTimers();
  renderHeader();

  expect(screen.getByText('feeling techy?')).toBeInTheDocument();

  act(() => {
    jest.advanceTimersByTime(6000);
  });

  expect(localStorage.getItem('terminalHintSeen')).toBe('true');
  expect(screen.queryByText('feeling techy?')).not.toBeInTheDocument();
});

test('unmount clears desktop terminal hint timer', () => {
  jest.useFakeTimers();
  const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
  const { unmount } = render(
    <Header
      onTerminalOpen={jest.fn()}
      navBarMobileProps={{
        hamburger: { isActive: false, onclick: jest.fn() },
        menu: {
          isOpen: false,
          onItemClick: jest.fn(),
          darkMode: false,
          darkModeToggle: jest.fn(),
        },
      }}
    />,
  );

  unmount();
  act(() => {
    jest.advanceTimersByTime(6000);
  });

  expect(localStorage.getItem('terminalHintSeen')).toBeNull();
  expect(consoleError).not.toHaveBeenCalled();
});
