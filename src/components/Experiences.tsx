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
        name: 'DomainTools',
        position: 'Software Engineer II',
        url: 'https://www.domaintools.com/',
        monthYearStart: 'July 2024',
        monthYearEnd: 'Present',
        description: [
          'Designed and executed the migration of an RDAP-history <b>OpenSearch</b> cluster containing hundreds of millions of documents from <b>AWS</b> to <b>Red Hat OpenShift</b>, implementing shard-parallel backfill that reduced projected completion time from 220+ days to 8 weeks',
          'Migrated a multi-terabyte RDAP archive containing more than 1 million objects from <b>Amazon S3</b> to on-premises <b>Ceph RGW</b>, cutting over <b>Kafka</b>-connected services and validating data integrity before decommissioning legacy workloads',
          'Led the design and rollout of <b>Redis</b>-backed per-registrar rate limiting for a distributed data collection pipeline processing millions of requests per day, reducing HTTP 429 responses from approximately 5% to 0.1%',
          'Increased throughput of a production data collection pipeline by 20% through request-path and processing optimizations',
          'Audited 6 <b>MirrorMaker 2</b> deployments across 3 environments, identifying alias-collision risks in 5 deployments',
          'Built an automated IANA bootstrap pipeline that retrieves, stores, refreshes, and distributes 3 routing datasets hourly, replacing manual updates and improving RDAP provider-routing reliability',
          'Resolved production parsing defects and validated repairs across more than 31,000 files with zero discrepancies, improving data correctness',
          'Architected a domain-scheduling platform using <b>Rust</b>, <b>Kafka</b>, <b>PostgreSQL</b> on CloudNativePG, implementing queue-management workflows and 5 stored procedures for request lifecycle, partitioning, and recovery',
          'Implemented role-based access control for an <b>OpenSearch</b> cluster, introducing more than 5 dedicated service accounts across development, CI, and production environments',
        ],
      },
      {
        name: 'Novometrix',
        position: 'Software Engineer',
        url: 'https://novometrixinc.com/',
        monthYearStart: 'September 2022',
        monthYearEnd: 'February 2024',
        description: [
          'Architected and developed a comprehensive backend system for a peer-reviewed information repository, enhancing data reliability and access efficiency by 40%',
          'Decoupled asynchronous processing with <b>NSQ</b> and introduced <b>Redis</b> caching, microservices with <b>Golang</b>, reducing backend contention and improving horizontal scalability',
          'Created a dynamic and user-friendly frontend site using the <b>Next.js</b> framework with <b>TypeScript</b>, leading to a 25% increase in user engagement and improved overall user experience',
        ],
      },
      {
        name: 'Tokopedia',
        position: 'Software Engineer Intern',
        url: 'https://www.tokopedia.com/about/?lang=en',
        monthYearStart: 'October 2021',
        monthYearEnd: 'March 2022',
        description: [
          'Enhanced application performance from approximately 60 minutes to three minutes through the implementation of concurrency in existing <b>Golang</b> code',
          'Increased code coverage by 20% through comprehensive unit tests, enhancing code quality and reliability',
          'Accelerated the credit bureau data submission process by 150 times by automating query filtration and FTP upload, significantly reducing manual processing time',
          'Developed robust API endpoints with authentication, input validation, and basic CRUD functionality, as well as file import capabilities, improving overall system functionality and security',
        ],
      },
      {
        name: 'Mandiri',
        position: 'Software Engineer Intern',
        url: 'https://mandiri-investasi.co.id/en/',
        monthYearStart: 'May 2021',
        monthYearEnd: 'July 2021',
        description: [
          'Designed and developed a microservice using the <b>Java Spring</b> framework, automating query and filtering processes, and reducing task execution time from one day to minutes',
          'Integrated a third-party API to deliver push notifications based on user events, enhancing real-time user engagement and communication',
          'Contributed to the planning phase of a company website overhaul by analyzing customer journeys and recommending UI/UX improvements, resulting in a more user-centric design',
          'Employed testing libraries such as <b>JUnit</b>, <b>AssertJ</b>, and <b>Mockito</b> to perform comprehensive unit and integration testing, significantly improving code reliability and performance',
        ],
      },
      {
        name: 'Kalbe Farma',
        position: 'IT Developer Intern',
        url: 'https://www.kalbe.co.id/',
        monthYearStart: 'October 2020',
        monthYearEnd: 'March 2021',
        description: [
          'Achieved a 600% increase in data collection efficiency by designing and developing a fully responsive web scraper application using <b>Python</b> and <b>PHP</b>',
          'Implemented an authentication system, background task scheduling, and a content management system, enhancing security, automation, and content handling',
          'Collaborated with the business development department to plan and create a fully responsive landing page using <b>jQuery</b> and <b>Tailwind CSS</b>, improving user engagement and conversion rates',
          'Configured and deployed a web server using <b>NGINX</b> and <b>MySQL</b> on an <b>AWS EC2</b> instance, ensuring robust performance and scalability for web applications',
        ],
      },
      {
        name: 'Freelance',
        position: 'Freelance Developer',
        url: '',
        monthYearStart: 'March 2021',
        monthYearEnd: 'Present',
        description: [
          'Accomplished the development of 15+ websites for small and large businesses by leveraging frameworks such as <b>Next.js</b>, <b>Vite</b>, <b>Gatsby</b>, and <b>React</b> with <b>TypeScript</b>, resulting in a 30% increase in overall client web traffic',
          'Achieved a 25% reduction in bounce rates and a 20% increase in conversion rates across various campaigns by optimizing landing page designs and enhancing user experiences',
          'Successfully managed up to 10 projects concurrently, ensuring all projects were completed on time and achieving a 95% client satisfaction rate by implementing effective project management strategies',
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
            className={this.state.activeTabID === index ? 'text-brutalist-accent' : ''}
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
              {
                exp.url.length > 0
                  ? <a
                    href={exp.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    tabIndex={this.state.activeTabID === index ? 0 : -1}
                  >{exp.name}
                  </a>
                  : exp.name
              }
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
