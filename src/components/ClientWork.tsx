import React from 'react';
import { External } from '../icons/External';

type ClientWorkEntry = {
  name: string,
  tagline: string,
  description: string,
  techStacks: string[],
  url: string,
};

interface ClientWorkState {}

interface ClientWorkProps {}

export class ClientWork extends React.Component<ClientWorkProps, ClientWorkState> {
  render() {
    const entries: ClientWorkEntry[] = [
      {
        name: 'HMS',
        tagline: 'Production Property Management Platform',
        description: 'Built and currently operate a production property-management platform used by multiple clients to manage locations, rooms, tenants, bookings, billing, payments, deposits, and financial reporting. Leading a ground-up modernization of the platform while preserving existing business rules and improving maintainability, financial correctness, and test coverage.',
        techStacks: ['Next.js', 'TypeScript', 'PostgreSQL', 'Prisma', 'AWS'],
        url: '',
      },
      {
        name: 'Proven',
        tagline: 'Landing Page',
        description: 'Developed a landing page for a client using React with TypeScript, featuring an interactive online quiz and Google Analytics integration for user engagement and tracking.',
        techStacks: ['TypeScript', 'React', 'Vite.js'],
        url: 'https://fl.klbf-proven.raymonds.dev',
      },
      {
        name: 'Life',
        tagline: 'Landing Page',
        description: 'Developed a landing page for a client using React with TypeScript, featuring Google Analytics integration for user engagement and tracking.',
        techStacks: ['TypeScript', 'React', 'Vite.js'],
        url: 'https://fl.klbf-life.raymonds.dev',
      },
    ];

    return (
      <div id="client-work-grid">
        {
          entries.map((entry) => (
            <div key={entry.name} className={'client-work-card'}>
              <h3 className={'client-work-name'}>{entry.name}</h3>
              <p className={'client-work-tagline'}>{entry.tagline}</p>
              <p className={'client-work-description'}>{entry.description}</p>
              <ul className={'client-work-stack-list'}>
                {entry.techStacks.map((tech) => (
                  <li key={tech}>{tech}</li>
                ))}
              </ul>
              {
                entry.url.length > 0
                  ? <a href={entry.url} target="_blank" rel="noopener noreferrer" className={'client-work-link'}>
                    <External />
                  </a>
                  : null
              }
            </div>
          ))
        }
      </div>
    );
  }
}
