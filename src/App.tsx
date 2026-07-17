import React, { SyntheticEvent } from 'react';
import ReactGA from 'react-ga';

import { NavbarMobileProps } from './navigation/navbar/mobile/NavBar';
import { PageLoad } from './components/PageLoad';
import { getItemFromLocalStorage, setItemInLocalStorage } from './util/LocalStorage';
import { DarkModeToggle } from './util/darkmode/DarkModeToggle';
import { Header } from './navigation/Header';
import { Button } from './buttons/Button';
import { Gopher } from './icons/Gopher';
import { Typescript } from './icons/Typescript';
import { Python } from './icons/Python';
import { Java } from './icons/Java';
import { Rust } from './icons/Rust';
import { PostgreSQL } from './icons/PostgreSQL';
import { Kafka } from './icons/Kafka';
import { Kubernetes } from './icons/Kubernetes';
import { AWS } from './icons/AWS';
import { Redis } from './icons/Redis';
import { Skill } from './icons/Skill';
import { Experiences } from './components/Experiences';
import { Projects } from './components/Projects';
import { ClientWork } from './components/ClientWork';
import { debounce } from './util/common';
import { EnvironmentVariables } from './enum';
import { Contact } from './components/Contact';
import { Footer } from './components/Footer';
import { ScrollToTop } from './buttons/ScrollToTop';
import { ScrollProgress } from './buttons/ScrollProgress';
import { TerminalMode } from './terminal/TerminalMode';

export interface AppState {
  siteReady: boolean
  pageLoadActive: boolean
  menuActive: boolean
  darkMode: boolean
  terminalModeActive: boolean
  isMobileViewport: boolean
}

export default class App extends React.Component<any, AppState> {
  debouncedResizeHandler: () => void = () => {};
  GOOGLE_TRACKING_ID_STG = 'UA-236482642-1';
  GOOGLE_TRACKING_ID_PROD = 'UA-236482642-2';

  // @ts-ignore
  constructor(p) {
    super(p);
    this.state = {
      siteReady: false,
      pageLoadActive: true,
      menuActive: false,
      darkMode: App.isDarkModeEnabled(),
      terminalModeActive: false,
      isMobileViewport: window.innerWidth <= 768,
    };

    if (process.env[EnvironmentVariables.DEPLOYMENT_ENV] === 'staging') {
      ReactGA.initialize(this.GOOGLE_TRACKING_ID_STG);
    } else if (process.env[EnvironmentVariables.DEPLOYMENT_ENV] === 'production') {
      ReactGA.initialize(this.GOOGLE_TRACKING_ID_PROD);
    }
  }

  componentDidMount = () => {
    ReactGA.pageview('/');

    window.addEventListener('load', this.handleWindowLoad);
    this.syncDocumentOverflow();
    this.initDarkMode();

    this.debouncedResizeHandler = debounce<App>(this.handleResize, 200, this);
    window.addEventListener('resize', this.debouncedResizeHandler);
    document.addEventListener('keydown', this.handleTerminalShortcut);
  };

  componentWillUnmount() {
    window.removeEventListener('load', this.handleWindowLoad);
    window.removeEventListener('resize', this.debouncedResizeHandler);
    document.removeEventListener('keydown', this.handleTerminalShortcut);
    document.documentElement.classList.remove('overflow-hidden');
  }

  handleWindowLoad = () => {
    this.setState({
      siteReady: true,
    }, this.syncDocumentOverflow);
  };

  handleResize() {
    const isMobileViewport = window.innerWidth <= 768;

    if (!isMobileViewport) {
      this.setState({
        isMobileViewport,
        menuActive: false,
      }, this.syncDocumentOverflow);
      return;
    }

    this.setState({ isMobileViewport }, this.syncDocumentOverflow);
  }

  shouldLockDocumentOverflow = (state: AppState = this.state) => (
    state.pageLoadActive || state.menuActive || (state.terminalModeActive && state.isMobileViewport)
  );

  syncDocumentOverflow = (nextState: AppState = this.state) => {
    document.documentElement.classList.toggle('overflow-hidden', this.shouldLockDocumentOverflow(nextState));
  };

  handlePageLoadOverflow = (force?: boolean) => {
    const pageLoadActive = force ?? !this.state.pageLoadActive;

    this.setState({ pageLoadActive }, this.syncDocumentOverflow);
  };

  toggleMenu = (forceShow?: boolean) => {
    const menuActive = forceShow ?? !this.state.menuActive;

    this.setState({
      menuActive,
    }, this.syncDocumentOverflow);
  };

  openTerminalMode = () => {
    const isMobileViewport = window.innerWidth <= 768;

    this.toggleMenu(false);
    this.setState({
      terminalModeActive: true,
      isMobileViewport,
    }, this.syncDocumentOverflow);
  };

  closeTerminalMode = () => {
    this.setState({
      terminalModeActive: false,
    }, this.syncDocumentOverflow);
  };

  scrollToSectionFromTerminal = (targetId: string) => {
    const scroll = () => {
      document.getElementById(targetId)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    if (this.state.isMobileViewport) {
      (document.activeElement as HTMLElement | null)?.blur();
      this.closeTerminalMode();
      window.setTimeout(scroll, 300);
      return;
    }

    scroll();
  };

  // Required as a TerminalMode callback; it has no App state dependency.
  // eslint-disable-next-line class-methods-use-this
  openExternalFromTerminal = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  handleTerminalShortcut = (e: KeyboardEvent) => {
    const target = e.target as HTMLElement | null;
    const tagName = target?.tagName?.toLowerCase();
    const isTextInput = tagName === 'input' || tagName === 'textarea' || target?.isContentEditable;

    if (isTextInput || window.innerWidth <= 768) {
      return;
    }

    if (e.key === '`') {
      e.preventDefault();
      this.openTerminalMode();
    }
  };

  initDarkMode() {
    document.body.classList.toggle('dark', this.state.darkMode);
  }

  toggleDarkMode = (e: SyntheticEvent) => {
    const isDark = (e.target as HTMLInputElement).checked ?? !App.isDarkModeEnabled();
    setItemInLocalStorage(DarkModeToggle.localStorageKey, isDark);
    this.setState({
      darkMode: isDark,
    });

    document.body.classList.toggle('dark', isDark);
  };

  // Checks localStorage for existing data, else check system preference
  static isDarkModeEnabled(): boolean {
    const saved = getItemFromLocalStorage(DarkModeToggle.localStorageKey);
    const system = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    return saved ?? system;
  }

  render() {
    const navbarMobileProps: Omit<NavbarMobileProps, 'onTerminalOpen'> = {
      hamburger: {
        isActive: this.state.menuActive,
        onclick: this.toggleMenu,
      },
      menu: {
        isOpen: this.state.menuActive,
        onItemClick: this.toggleMenu,
        darkModeToggle: this.toggleDarkMode,
        darkMode: this.state.darkMode,
      },
    };

    const skills: { icon: JSX.Element, label: string, padding: string }[] = [
      { icon: <Gopher/>, label: 'Go', padding: 'p-4' },
      { icon: <Python/>, label: 'Python', padding: 'p-4' },
      { icon: <Java/>, label: 'Java', padding: 'p-4' },
      { icon: <Rust/>, label: 'Rust', padding: 'p-5' },
      { icon: <Typescript/>, label: 'Typescript', padding: 'p-5' },
      { icon: <Kafka/>, label: 'Kafka', padding: 'p-5' },
      { icon: <Kubernetes/>, label: 'Kubernetes', padding: 'p-4' },
      { icon: <AWS/>, label: 'AWS', padding: 'p-5' },
      { icon: <PostgreSQL/>, label: 'PostgreSQL', padding: 'p-5' },
      { icon: <Redis/>, label: 'Redis', padding: 'p-5' },
    ];
    return (
      <div id={'page'}>
        <PageLoad togglePageOverflow={this.handlePageLoadOverflow} siteReady={this.state.siteReady}/>
        <Header navBarMobileProps={navbarMobileProps} onTerminalOpen={this.openTerminalMode}/>
        <main>
          <section id="home">
            <div id="home-content" className="content">
              <h1>
                Hi, my
                <br/>
                name is&nbsp;
                <span><strong>Raymond</strong></span>
                .
              </h1>
              <p>I&apos;m a software engineer specializing in backend engineering.</p>
              <Button text="Hire me!" className="px-8 py-4 mt-4" href="#contact" onfocus={() => {
                window.scrollTo(0, 0);
              }}/>
            </div>
          </section>
          {/* Using div as applying filter to the main tag will cause position:fixed element to be relative to the main tag (why???) */}
          {/* See https://developer.mozilla.org/en-US/docs/Web/CSS/position#fixed */}
          <div id="menu-blur-layer" data-testid="menu-blur-layer" className={`${this.state.menuActive ? 'translate-x-0' : 'translate-x-full'}`} onClick={() => { this.toggleMenu(); }}/>
          <section id="about-me">
            <div id="about-me-content" className="content">
              <p className="font-mono uppercase tracking-wide text-sm text-brutalist-accent mb-2">01 &middot; About</p>
              <h2>About me</h2>
              <div id="about-me-grid">
                <div className="row-start-1 md:col-start-1">
                  <div className="space-y-4">
                    <p>I am passionate about creating software that improves and simplifies the lives of those around
                      me. My interest in software development started back in 2019 when I stumbled upon a youtube
                      tutorial on building an android application.</p>
                    <p>
                      Fast forward to today, I&apos;m a Software Engineer II at&nbsp;
                      <a href="https://www.domaintools.com/" target="_blank" rel="noopener noreferrer" className={'text-highlight'}>DomainTools</a>
                      , building and operating distributed data pipelines. I&apos;ve also developed software for
                      clients ranging from individuals to large enterprise corporations such as&nbsp;
                      <a href="https://www.tokopedia.com/about/" target="_blank" rel="noopener noreferrer" className={'text-highlight'}>Tokopedia</a>
                      ,&nbsp;
                      <a href="https://www.kalbe.co.id/" target="_blank" rel="noopener noreferrer" className={'text-highlight'}>Kalbe Farma</a>
                      , and&nbsp;
                      <a href="https://mandiri-investasi.co.id/en/" target="_blank"
                         rel="noopener noreferrer" className={'text-highlight'}>Mandiri</a>
                      .
                    </p>
                  </div>
                </div>
                <div className="-mt-10 md:mt-0 row-start-2 md:row-start-1 md:col-start-2">
                  <p>When I am not coding, you can find me doing any
                    of the following:</p>
                  <ul className="list-disc list-outside mt-8 ml-5">
                    <li>Badminton</li>
                    <li>Ultimate Frisbee</li>
                    <li>Hiking</li>
                    <li>Rock Climbing</li>
                    <li>Video Games</li>
                    <li>Volunteering</li>
                  </ul>
                </div>
                <div className="row-start-3 md:row-start-2 md:col-span-full">
                  <p>Here are a few technologies I&apos;ve been working with recently:</p>
                  <div className="skills-flex-container">
                    {/* TODO! On mobile scroll animation */}
                    {skills.map((v) => <Skill key={v.label} label={v.label} icon={v.icon} iconClassName={v.padding}/>)}
                  </div>
                </div>
              </div>
            </div>
          </section>
          <section id="experience">
            <div id="experience-content" className="content">
              <p className="font-mono uppercase tracking-wide text-sm text-brutalist-accent mb-2">02 &middot; Experience</p>
              <h2>Experience</h2>
              <Experiences/>
            </div>
          </section>
          <section id="client-work">
            <div id="client-work-content" className="content">
              <p className="font-mono uppercase tracking-wide text-sm text-brutalist-accent mb-2">03 &middot; Client Work</p>
              <h2>Client Work</h2>
              <ClientWork/>
            </div>
          </section>
          <section id="projects">
            <div id="projects-content" className="content">
              <p className="font-mono uppercase tracking-wide text-sm text-brutalist-accent mb-2">04 &middot; Projects</p>
              <h2>Things I&apos;ve Built</h2>
              <Projects/>
            </div>
          </section>
          <section id="contact">
            <div id="contact-content" className="content mb-16">
              <p className="font-mono uppercase tracking-wide text-sm text-brutalist-accent mb-2">05 &middot; Contact</p>
              <h2>Contact</h2>
              <Contact />
            </div>
          </section>
        </main>
        <Footer />
        <ScrollToTop />
        <ScrollProgress />
        <TerminalMode
          isOpen={this.state.terminalModeActive}
          isMobile={this.state.isMobileViewport}
          onClose={this.closeTerminalMode}
          onScrollToSection={this.scrollToSectionFromTerminal}
          onExternalOpen={this.openExternalFromTerminal}
        />
      </div>
    );
  }
}
