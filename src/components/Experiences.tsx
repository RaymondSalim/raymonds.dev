import React from 'react';
import { getOuterHeight } from '../util/dimensions';
import { debounce } from '../util/common';

type Experience = {
  name: string;
  position: string;
  url: string;
  monthYearStart: string;
  monthYearEnd: string;
  description: string[];
};

interface ExperiencesState {
  activeTabID: number
  minPanelHeight: number
  isAnimating: boolean
}

interface ExperiencesProps {}

export class Experiences extends React.Component<ExperiencesProps, ExperiencesState> {
  buttonRefs: React.RefObject<HTMLButtonElement>[] = [];
  panelRefs: React.RefObject<HTMLDivElement>[] = [];
  debouncedResizeHandler: () => void = () => {};

  private ANIM_IN = 'exp-desc-fade-in';
  private ANIM_OUT = 'exp-desc-fade-out';

  constructor(props: ExperiencesProps) {
    super(props);

    this.state = {
      activeTabID: 0,
      minPanelHeight: 0,
      isAnimating: false,
    };
  }

  componentDidMount() {
    this.debouncedResizeHandler = debounce<Experiences>(this.updateMinPanelHeight, 200, this);
    window.addEventListener('resize', this.debouncedResizeHandler);

    this.updateMinPanelHeight();
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.debouncedResizeHandler);
  }

  updateMinPanelHeight() {
    const maxHeightPanel = this.panelRefs.reduce((prev, curr) => {
      const prevHeight = getOuterHeight(prev.current);
      const currHeight = getOuterHeight(curr.current);
      return (currHeight > prevHeight ? curr : prev);
    });

    // TODO Find out why the getOuterHeight(maxHeightPanel.current) does not equal the actual height of element
    this.setState({
      minPanelHeight: getOuterHeight(maxHeightPanel.current) * 1.1,
    });
  }

  setActiveTabID(i: number, el: React.MouseEvent<HTMLButtonElement>) {
    if (this.state.activeTabID === i) return;
    if (this.state.isAnimating) {
      el.currentTarget.blur();
      return;
    }
    this.setState({
      activeTabID: i,
      isAnimating: true,
    });
  }

  // TODO! Find better way to animate panel change
  animationEndHandler(e: React.AnimationEvent<HTMLDivElement>) {
    if (e.type === 'animationend' && e.animationName === 'exp-desc-fade-out') {
      const targetPanel = this.panelRefs[this.state.activeTabID].current;
      if (targetPanel !== null && targetPanel.style != null) {
        targetPanel.style.animation = `${this.ANIM_IN} 0.15s ease-in forwards`;
      }
    }

    this.setState({
      isAnimating: false,
    });
  }

  render() {
    let selector;
    const experiences: Experience[] = [
      {
        name: 'Novometrix',
        position: 'Software Engineer',
        url: 'https://novometrixinc.com/',
        monthYearStart: 'September 2022',
        monthYearEnd: 'February 2024',
        description: [
          'Designed and developed a backend system for information framework system with the goal of providing a repository for peer-reviewed information',
          'Implemented technologies such as message queueing with NSQ, caching system with Redis and microservices using Golang to provide scalability and ease of development',
          'Designed and produced a frontend site using Next.js framework with Typescript',
        ],
      },
      {
        name: 'Tokopedia',
        position: 'Software Engineer Intern',
        url: 'https://www.tokopedia.com/about/?lang=en',
        monthYearStart: 'October 2021',
        monthYearEnd: 'March 2022',
        description: [
          'Sped up application flow by 2000% by implementing concurrency in existing <b>Golang</b> code',
          'Increased code coverage by 20% by authoring unit tests',
          'Accelerated the credit bureau data submission process by 150 times by automating query and filtration and FTP upload',
          'Developed API endpoints with authentication, input validation, and basic CRUD functionality, as well as file imports',
          'Created library that allows masking of strings, struct, etc. for privacy purposes',
        ],
      },
      {
        name: 'Mandiri',
        position: 'Software Engineer Intern',
        url: 'https://mandiri-investasi.co.id/en/',
        monthYearStart: 'May 2021',
        monthYearEnd: 'July 2021',
        description: [
          'Assisted in the planning stage of the company’s website overhaul, including discussion based on customer journey analysis, and UI and UX improvement',
          'Designed and developed a new microservice using the <b>Java Spring</b> framework, removing the need for manual query and filtering, hence reducing task execution time from one day to minutes',
          'Integrated third party API to deliver push notification based on user events',
          'Utilized testing libraries such as <b>JUNIT</b>, <b>AssertJ</b> and <b>Mockito</b> in Unit and Integration Testing',
        ],
      },
      {
        name: 'Kalbe Farma',
        position: 'IT Developer Intern',
        url: 'https://www.kalbe.co.id/',
        monthYearStart: 'October 2020',
        monthYearEnd: 'March 2021',
        description: [
          'Achieved a 600% increase in the efficiency of the data collection process by designing and developing a fully responsive web scraper web application using <b>Python</b> + <b>PHP</b>',
          'Implemented authentication system, background task scheduling and Content Management System',
          'Collaborated with the Business Development Department to plan and build a dynamic responsive landing page using <b>jQuery</b> and <b>tailwindcss</b>',
          'Developed a Content Management System, with role-based authentication using Bootstrap and jQuery',
          'Set up <b>NGINX</b> and <b>MySQL</b>, and deployed website on <b>AWS S3</b>',
          'Used <b>Laravel</b> framework, with <b>tailwindcss</b> and <b>Alpine.js</b>',
        ],
      },
    ];
    const tabs = experiences.map((exp, index) => {
      this.buttonRefs[index] = this.buttonRefs[index] ?? React.createRef();
      return (
        <button
          onClick={(el) => this.setActiveTabID(index, el)}
          ref={ this.buttonRefs[index] }
          key={index}
          data-key={index}
          id={`tab-${index}`}
          role='tab'
          tabIndex={-1}
          aria-selected={this.state.activeTabID === index}
          aria-controls={`panel-${index}`}
          className={'experience-tab-button'}
        >
          <span
            tabIndex={0}
            className={this.state.activeTabID === index ? 'text-blue-sapphire dark:text-blue-sky' : ''}
          >{exp.name}</span>
        </button>
      );
    });
    if (this.buttonRefs.length > 0 && this.buttonRefs[0].current != null) {
      const btnHeight = this.buttonRefs[0].current.offsetHeight;
      const selectorHeight = this.state.activeTabID * btnHeight + btnHeight * 0.5;

      selector = (
        <span
          className={'experience-tab-selector'}
          style={{
            top: selectorHeight,
          }}
        >&gt;</span>
      );
    }
    const descriptions = experiences.map((exp, index) => {
      this.panelRefs[index] = this.panelRefs[index] ?? React.createRef();
      return (
        <div
          key={index}
          ref={this.panelRefs[index]}
          id={`panel-${index}`}
          role={'tabpanel'}
          tabIndex={this.state.activeTabID === index ? 0 : -1}
          aria-labelledby={`tab-${index}`}
          aria-hidden={this.state.activeTabID !== index}
          style={{
            animation: `${this.state.activeTabID === index ? '' : `${this.ANIM_OUT} 0.15s ease-in forwards`}`,
            opacity: 0,
          }}
          onAnimationEnd={(e) => this.animationEndHandler(e)}
          className={'experience-info-container'}
        >
          <h3 className={'experience-title'}>
            <span>{exp.position}</span>
            <span
              className={'company-name'}
            >
              &nbsp;@&nbsp;
              <a
                href={exp.url}
                target="_blank"
                rel="noopener noreferrer"
                tabIndex={this.state.activeTabID === index ? 0 : -1}
              >{exp.name}
              </a>
            </span>
          </h3>
          <p>{`${exp.monthYearStart} - ${exp.monthYearEnd}`}</p>
          <ul className={'job-description'}>
            {
              exp.description
                .map((desc, descIndex) => {
                  const content = {
                    __html: desc,
                  };
                  return <li key={descIndex} dangerouslySetInnerHTML={content}/>;
                })
            }
          </ul>
        </div>
      );
    });
    return (
      <div
        id={'experience-grid'}
      >
        <div
          role={'tablist'}
          aria-label={'Experiences tabs'}
          id={'experience-tabs'}
        >
          {tabs}
          {selector}
        </div>
        <div id={'experience-info'} style={{ minHeight: this.state.minPanelHeight }}>
          {descriptions}
        </div>
      </div>
    );
  }
}
