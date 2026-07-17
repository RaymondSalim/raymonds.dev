import React from 'react';
import { render, screen } from '@testing-library/react';
import { Contact } from './Contact';

jest.mock('@emailjs/browser', () => ({
  sendForm: jest.fn(),
}));

jest.mock('react-ga', () => ({
  event: jest.fn(),
  exception: jest.fn(),
}));

const originalEnv = process.env;

beforeEach(() => {
  process.env = { ...originalEnv };
});

afterEach(() => {
  process.env = originalEnv;
});

test('renders static contact links when contact form flag is not enabled', () => {
  delete process.env.REACT_APP_CONTACT_FORM_ENABLED;

  render(<Contact />);

  expect(screen.getByRole('link', { name: /Email/i })).toHaveAttribute('href', 'mailto:raymond@raymonds.dev');
  expect(screen.getByRole('link', { name: /GitHub/i })).toHaveAttribute('href', 'https://github.com/RaymondSalim');
  expect(screen.getByRole('link', { name: /LinkedIn/i })).toHaveAttribute('href', 'https://www.linkedin.com/in/raymondsalim/');
  expect(screen.queryByTestId('contact-form')).not.toBeInTheDocument();
  expect(screen.queryByPlaceholderText('Your name')).not.toBeInTheDocument();
  expect(screen.getByText(/email me directly/i)).toBeInTheDocument();
});

test('renders email form when contact form flag is enabled', () => {
  process.env.REACT_APP_CONTACT_FORM_ENABLED = 'true';

  render(<Contact />);

  expect(screen.getByTestId('contact-form')).toBeInTheDocument();
  expect(screen.getByPlaceholderText('Your name')).toBeInTheDocument();
  expect(screen.getByPlaceholderText('you@awesome.com')).toBeInTheDocument();
  expect(screen.getByPlaceholderText('I would like to chat with you!')).toBeInTheDocument();
  expect(screen.getByPlaceholderText('I would like to talk to you about...')).toBeInTheDocument();
  expect(screen.getByText('Send Message!')).toBeInTheDocument();
});
