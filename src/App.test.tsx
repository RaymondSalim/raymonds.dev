import React from 'react';
import {
  act,
  fireEvent,
  render,
  screen,
} from '@testing-library/react';
import App from './App';

jest.mock('react-ga', () => ({
  initialize: jest.fn(),
  pageview: jest.fn(),
}));

jest.mock('./components/PageLoad', () => ({
  PageLoad: ({ togglePageOverflow }: { togglePageOverflow: (force?: boolean) => void }) => (
    <button type="button" aria-label="Finish page load" onClick={() => togglePageOverflow(false)} />
  ),
}));

beforeEach(() => {
  jest.spyOn(window, 'scrollTo').mockImplementation(() => {});
  jest.spyOn(window, 'scroll').mockImplementation(() => {});
  document.documentElement.style.fontSize = '16px';
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation(() => ({ matches: false })),
  });
});

afterEach(() => {
  jest.restoreAllMocks();
  jest.useRealTimers();
  document.documentElement.classList.remove('overflow-hidden');
  document.body.innerHTML = '';
});

test('desktop backtick opens terminal', () => {
  Object.defineProperty(window, 'innerWidth', { writable: true, value: 1024 });
  render(<App />);

  fireEvent.keyDown(document, { key: '`' });

  expect(screen.getByRole('dialog', { name: 'Terminal mode' })).toBeInTheDocument();
});

test('desktop backtick is ignored in an input', () => {
  Object.defineProperty(window, 'innerWidth', { writable: true, value: 1024 });
  render(<App />);
  const input = document.createElement('input');
  document.body.appendChild(input);
  input.focus();

  fireEvent.keyDown(input, { key: '`' });

  expect(screen.queryByRole('dialog', { name: 'Terminal mode' })).not.toBeInTheDocument();
});

test('backtick is ignored on mobile viewport', () => {
  Object.defineProperty(window, 'innerWidth', { writable: true, value: 768 });
  render(<App />);

  fireEvent.keyDown(document, { key: '`' });

  expect(screen.queryByRole('dialog', { name: 'Terminal mode' })).not.toBeInTheDocument();
});

test('unmount removes the desktop backtick shortcut listener', () => {
  Object.defineProperty(window, 'innerWidth', { writable: true, value: 1024 });
  const removeEventListener = jest.spyOn(document, 'removeEventListener');

  const { unmount } = render(<App />);

  unmount();
  fireEvent.keyDown(document, { key: '`' });

  expect(removeEventListener.mock.calls.some(([eventName, handler]) => (
    eventName === 'keydown' && typeof handler === 'function'
  ))).toBe(true);
  expect(screen.queryByRole('dialog', { name: 'Terminal mode' })).not.toBeInTheDocument();
});

test('unmount removes the window load listener', () => {
  const addEventListener = jest.spyOn(window, 'addEventListener');
  const removeEventListener = jest.spyOn(window, 'removeEventListener');

  const { unmount } = render(<App />);
  const loadHandler = addEventListener.mock.calls.find(([eventName]) => eventName === 'load')?.[1];

  unmount();

  expect(loadHandler).toBeDefined();
  expect(removeEventListener).toHaveBeenCalledWith('load', loadHandler);
});

test('unmount clears document overflow lock', () => {
  Object.defineProperty(window, 'innerWidth', { writable: true, value: 1024 });
  const { unmount } = render(<App />);

  expect(document.documentElement).toHaveClass('overflow-hidden');

  unmount();

  expect(document.documentElement).not.toHaveClass('overflow-hidden');
});

test('desktop section command projects scrolls to #projects and keeps terminal open', () => {
  Object.defineProperty(window, 'innerWidth', { writable: true, value: 1024 });
  const target = document.createElement('section');
  target.id = 'projects';
  target.scrollIntoView = jest.fn();
  document.body.appendChild(target);

  render(<App />);
  fireEvent.keyDown(document, { key: '`' });
  const input = screen.getByLabelText('Terminal command');

  fireEvent.change(input, { target: { value: 'projects' } });
  fireEvent.keyDown(input, { key: 'Enter' });

  expect(target.scrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth' });
  expect(screen.getByRole('dialog', { name: 'Terminal mode' })).toBeInTheDocument();
});

test('mobile section command closes terminal and unlocks scroll before deferred scroll', () => {
  jest.useFakeTimers();
  Object.defineProperty(window, 'innerWidth', { writable: true, value: 1024 });
  const target = document.createElement('section');
  target.id = 'projects';
  target.scrollIntoView = jest.fn();
  document.body.appendChild(target);

  render(<App />);
  fireEvent.click(screen.getByRole('button', { name: 'Finish page load' }));
  fireEvent.keyDown(document, { key: '`' });
  Object.defineProperty(window, 'innerWidth', { writable: true, value: 768 });
  act(() => {
    window.dispatchEvent(new Event('resize'));
    jest.runOnlyPendingTimers();
  });
  expect(document.documentElement).toHaveClass('overflow-hidden');
  const input = screen.getByLabelText('Terminal command');

  fireEvent.change(input, { target: { value: 'projects' } });
  fireEvent.keyDown(input, { key: 'Enter' });

  expect(screen.queryByRole('dialog', { name: 'Terminal mode' })).not.toBeInTheDocument();
  expect(document.documentElement).not.toHaveClass('overflow-hidden');
  expect(target.scrollIntoView).not.toHaveBeenCalled();

  act(() => {
    jest.runOnlyPendingTimers();
  });

  expect(target.scrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth' });
});
