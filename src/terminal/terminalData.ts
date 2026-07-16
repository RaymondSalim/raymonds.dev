import { TerminalDirectory, TerminalDirectoryEntry, TerminalFile } from './terminalTypes';

export const terminalDirectories: Record<TerminalDirectory, { directories: TerminalDirectoryEntry[], files: TerminalFile[] }> = {
  '/': {
    directories: [
      { name: 'experience', path: '/experience' },
      { name: 'client-work', path: '/client-work' },
      { name: 'projects', path: '/projects' },
    ],
    files: [
      {
        name: 'about.txt',
        lines: [
          'Raymond Salim',
          'Software Engineer II specializing in backend engineering and data systems.',
          'Current focus: distributed pipelines, reliability, and practical product delivery.',
        ],
      },
      {
        name: 'contact.txt',
        lines: [
          'email: raymond@raymonds.dev',
          'github: https://github.com/RaymondSalim',
          'linkedin: https://www.linkedin.com/in/raymondsalim/',
        ],
      },
      {
        name: 'links.txt',
        lines: [
          'github     https://github.com/RaymondSalim',
          'linkedin   https://www.linkedin.com/in/raymondsalim/',
          'email      mailto:raymond@raymonds.dev',
        ],
      },
    ],
  },
  '/experience': {
    directories: [],
    files: [
      {
        name: 'domaintools.txt',
        lines: [
          'DomainTools',
          'Software Engineer II, July 2024 - Present',
          'Backend and data systems work across RDAP history, Kafka-connected services, OpenSearch, Redis, PostgreSQL, and Rust.',
        ],
      },
      {
        name: 'novometrix.txt',
        lines: [
          'Novometrix',
          'Software Engineer, September 2022 - February 2024',
          'Backend systems, async processing, Redis caching, Go microservices, and Next.js frontend work.',
        ],
      },
      {
        name: 'tokopedia.txt',
        lines: [
          'Tokopedia',
          'Software Engineer Intern, October 2021 - March 2022',
          'Golang performance work, test coverage, data submission automation, and authenticated API endpoints.',
        ],
      },
      {
        name: 'mandiri.txt',
        lines: [
          'Mandiri',
          'Software Engineer Intern, May 2021 - July 2021',
          'Java Spring microservice work, third-party API integration, UI/UX planning, and unit/integration testing.',
        ],
      },
      {
        name: 'kalbe-farma.txt',
        lines: [
          'Kalbe Farma',
          'IT Developer Intern, October 2020 - March 2021',
          'Python/PHP scraper, authentication, background scheduling, CMS work, and campaign landing pages.',
        ],
      },
      {
        name: 'freelance.txt',
        lines: [
          'Freelance',
          'Freelance Developer, March 2021 - Present',
          'Client websites and landing pages using Next.js, Vite, Gatsby, React, and TypeScript.',
        ],
      },
    ],
  },
  '/client-work': {
    directories: [],
    files: [
      {
        name: 'hms.txt',
        lines: [
          'HMS',
          'Production Property Management Platform',
          'Private client platform covering locations, rooms, tenants, bookings, billing, payments, deposits, and financial reporting.',
        ],
      },
      {
        name: 'proven.txt',
        lines: [
          'Proven',
          'Landing Page',
          'React and TypeScript landing page with an interactive quiz and analytics integration.',
        ],
      },
      {
        name: 'life.txt',
        lines: [
          'Life',
          'Landing Page',
          'React and TypeScript landing page with analytics integration.',
        ],
      },
    ],
  },
  '/projects': {
    directories: [],
    files: [
      {
        name: 'ultiboard.txt',
        lines: [
          'Ultiboard',
          'Full-stack strategy-board platform using Next.js, Prisma, TypeScript, PostgreSQL, Vitest, and Playwright.',
        ],
      },
      {
        name: 'icloud-album-downloader.txt',
        lines: [
          'iCloud Album Downloader',
          'Browser extension for downloading complete public iCloud shared albums with privacy-conscious telemetry.',
        ],
      },
      {
        name: 'reddit-downloader.txt',
        lines: [
          'Reddit Downloader',
          'Kotlin app for background media downloads with local persistence.',
        ],
      },
      {
        name: 'e-commerce-web-scraper.txt',
        lines: [
          'E-commerce Web Scraper',
          'Python and PHP scraper for Indonesian e-commerce product data.',
        ],
      },
      {
        name: 'tracker.txt',
        lines: [
          'Tracker',
          'Kotlin location, call-history, and message tracking project using Firebase.',
        ],
      },
    ],
  },
};

export const terminalSections: Record<string, string> = {
  about: 'about-me',
  experience: 'experience',
  work: 'experience',
  'client-work': 'client-work',
  clients: 'client-work',
  projects: 'projects',
  contact: 'contact',
};

export const terminalExternalLinks: Record<string, { label: string, url: string }> = {
  github: { label: 'GitHub', url: 'https://github.com/RaymondSalim' },
  linkedin: { label: 'LinkedIn', url: 'https://www.linkedin.com/in/raymondsalim/' },
  email: { label: 'email', url: 'mailto:raymond@raymonds.dev' },
};
