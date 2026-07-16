import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import App from './App';

jest.mock('react-ga', () => ({
  initialize: jest.fn(),
  pageview: jest.fn(),
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
  document.body.innerHTML = '';
});

test('desktop backtick opens terminal', () => {
  Object.defineProperty(window, 'innerWidth', { writable: true, value: 1024 });
  render(<App />);

  fireEvent.keyDown(document, { key: '`' });

  expect(screen.getByRole('dialog', { name: 'Terminal mode' })).toBeInTheDocument();
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
