import React from 'react';
import { GitHub } from '../icons/GitHub';
import { External } from '../icons/External';

type Project = {
  name: string,
  description: string,
  techStacks: string[],
  repoUrl: string,
  projUrl: string,
  imgUrl: string,
  imgAlt: string,
  date: Date,
};

interface ProjectsState {}

interface ProjectsProps {}

export class Projects extends React.Component<ProjectsProps, ProjectsState> {
  private imageRefs: React.RefObject<HTMLDivElement>[];

  constructor(props: ProjectsProps) {
    super(props);

    this.imageRefs = [];
  }

  handleScroll() {
    if (window.innerWidth <= 768) {
      return;
    }

    this.imageRefs.forEach((refObj) => {
      if (refObj.current === null) {
        return;
      }

      const el = refObj.current;
      const imageEl: HTMLElement | null = el.querySelector('.project-image-container');
      const descEl: HTMLElement | null = el.querySelector('.project-info-container');

      if (imageEl === null || descEl === null) {
        return;
      }

      if (
        imageEl.getBoundingClientRect().top > window.innerHeight * 1.2
        || imageEl.getBoundingClientRect().bottom < window.innerHeight * -0.2
      ) {
        descEl.style.transform = '';
      }

      const target = window.innerHeight * 0.5;
      const diff = imageEl.getBoundingClientRect().top + (imageEl.offsetHeight / 2) - target;
      const diffPercentage = (0.35 * diff) / target;

      descEl.style.transform = `translateY(${imageEl.offsetHeight * diffPercentage}px)`;
    });
  }

  componentDidMount() {
    window.addEventListener('scroll', this.handleScroll.bind(this));
  }

  componentWillUnmount() {
    window.removeEventListener('scroll', this.handleScroll.bind(this));
  }

  render() {
    const projects: Project[] = [
      {
        name: 'Proven',
        repoUrl: '',
        projUrl: 'https://fl.klbf-proven.raymonds.dev',
        imgUrl: 'https://raw.githubusercontent.com/RaymondSalim/CDN_Assets/main/Personal%20Website/Proven.png',
        imgAlt: 'Proven',
        techStacks: [
          'TypeScript', 'React', 'Vite.js',
        ],
        description: 'Developed a landing page for a client using React with TypeScript, featuring an interactive online quiz and Google Analytics integration for user engagement and tracking.',
        date: new Date(2023, 9),
      },
      {
        name: 'Life',
        repoUrl: '',
        projUrl: 'https://fl.klbf-life.raymonds.dev',
        imgUrl: 'https://raw.githubusercontent.com/RaymondSalim/CDN_Assets/main/Personal%20Website/Life.png',
        imgAlt: 'Proven',
        techStacks: [
          'TypeScript', 'React', 'Vite.js',
        ],
        description: 'Developed a landing page for a client using React with TypeScript, featuring Google Analytics integration for user engagement and tracking.',
        date: new Date(2024, 1),
      },
      {
        name: 'Reddit Downloader',
        repoUrl: 'https://github.com/RaymondSalim/RedditDownloader-Kotlin',
        projUrl: '',
        imgUrl: 'https://raw.githubusercontent.com/RaymondSalim/CDN_Assets/main/Personal%20Website/Reddit%20Downloader.png',
        imgAlt: 'Reddit Downloader',
        techStacks: [
          'Kotlin',
        ],
        description: 'Easily download media files from reddit. Stores post information, supports background download. Utilizes tools & libraries such as WorkManager, RoomDB, Coroutines, etc.',
        date: new Date(2021, 3),
      },
      {
        name: 'E-commerce Web Scraper',
        repoUrl: 'https://github.com/RaymondSalim/FinalWebScrape',
        projUrl: '',
        imgUrl: 'https://raw.githubusercontent.com/RaymondSalim/CDN_Assets/main/Personal%20Website/WebScrape.jpeg',
        imgAlt: 'Web Scraper',
        techStacks: [
          'Python',
          'PHP',
        ],
        description: 'Web scraping tool that gathers product information (price, name, seller, etc.) from various e-commerce sites in Indonesia. Supports concurrent scraping, and task management. Written in Python with the Selenium library, and PHP with Laravel as the frontend',
        date: new Date(2021, 1),
      },
      {
        name: 'Tracker',
        repoUrl: 'https://github.com/RaymondSalim/Tracker',
        projUrl: '',
        imgUrl: 'https://raw.githubusercontent.com/RaymondSalim/CDN_Assets/main/Personal%20Website/Tracker.png',
        imgAlt: 'Tracker',
        techStacks: [
          'Kotlin',
        ],
        description: "Logs and track user's location, call history, messages. Data is viewable from a seperate app. Uses Firebase for database and authentication. ",
        date: new Date(2020, 10),
      },
    ];
    // TODO! Find better color for light scheme? (replace bg-gray-dark)
    return (
      <div id="project-grid">
        {
          projects.map((proj, index) => {
            const descriptionContent = {
              __html: proj.description,
            };
            let ref = this.imageRefs[index];
            if (ref === undefined) {
              this.imageRefs[index] = React.createRef();
              ref = this.imageRefs[index];
            }

            return (
              <div
                key={proj.name}
                id={`project-${index}`}
                ref={ref}
              >
                <div
                  data-image-id={index}
                  className={'project-image-container'}
                >
                  <img
                    src={proj.imgUrl}
                    alt={proj.imgAlt}
                    style={{
                      aspectRatio: '16/9',
                      // maxWidth: '25vw',
                    }}
                  />
                </div>
                <div
                  data-description-id={index}
                  className={'project-info-container'}
                >
                  <h3 className={'project-title'}>{proj.name}</h3>
                  <div className={'project-description-container'}>
                    <p dangerouslySetInnerHTML={descriptionContent} />
                  </div>
                  <ul className={'project-stack-list'}>
                    {proj.techStacks.map((el, ind) => (
                      <li
                        key={ind}
                      >{el}</li>
                    ))}
                  </ul>
                  <div>
                    {
                      proj.repoUrl.length > 0
                        ? <a href={proj.repoUrl} className={'project-links'}>
                          <GitHub />
                        </a>
                        : null
                    }
                    {
                      proj.projUrl.length > 0
                        ? <a href={proj.projUrl} className={'project-links'}>
                          <External />
                        </a>
                        : null
                    }
                  </div>
                </div>
              </div>
            );
          })
        }
      </div>
    );
  }
}
