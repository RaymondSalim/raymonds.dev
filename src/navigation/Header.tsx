import React from 'react';
import { NavBar as NavBarMobile, NavbarMobileProps } from './navbar/mobile/NavBar';
import { NavBar as NavBarDesktop } from './navbar/desktop/NavBar';
import { Logo } from '../icons/Logo';

export class Header extends React.Component<HeaderProps, HeaderState> {
  static elementID = 'header';
  static terminalHintStorageKey = 'terminalHintSeen';

  expandYLimit = 90;
  hiddenYStart = 150;
  terminalHintTimer?: ReturnType<typeof window.setTimeout>;

  constructor(props: HeaderProps) {
    super(props);
    this.state = {
      windowY: Number.MIN_SAFE_INTEGER,
      terminalHintVisible: localStorage.getItem(Header.terminalHintStorageKey) !== 'true',
    };
  }

  componentDidMount() {
    this.setState({
      windowY: window.scrollY,
    });
    this.toggleOnScroll();
    this.terminalHintTimer = window.setTimeout(this.dismissTerminalHint, 6000);
  }

  componentWillUnmount() {
    if (this.terminalHintTimer) {
      window.clearTimeout(this.terminalHintTimer);
    }
  }

  forceHeaderState(visible?: boolean) {
    this.setState({
      forceNotHidden: visible,
    });
  }

  toggleOnScroll() {
    document.addEventListener('scroll', () => {
      const scrollPos = window.scrollY;

      // Limit scroll event to trigger only when change is greater than 10px
      if (Math.abs(this.state.windowY - scrollPos) < 10) {
        return;
      }

      const yLessThan90 = scrollPos < this.expandYLimit;

      const hidden = this.state.windowY < scrollPos && scrollPos > this.hiddenYStart;

      this.setState({
        windowY: window.scrollY,
        expanded: yLessThan90,
        hidden,
        forceNotHidden: undefined,
      });
    });
    window.scroll();
  }

  dismissTerminalHint = () => {
    localStorage.setItem(Header.terminalHintStorageKey, 'true');
    this.setState({ terminalHintVisible: false });
  };

  openTerminal = () => {
    this.dismissTerminalHint();
    this.props.onTerminalOpen();
  };

  render() {
    const terminalHint = this.state.terminalHintVisible
      ? (
        <div id="terminal-hint" role="status">
          <span>feeling techy?</span>
          <button type="button" aria-label="Dismiss terminal hint" onClick={this.dismissTerminalHint}>x</button>
        </div>
      )
      : null;

    return (
      <header
        id={Header.elementID}
        className={`
          ${(this.state.expanded ?? true) ? 'h-header' : 'header-hidden'}
          ${(this.state.forceNotHidden ?? !this.state.hidden) ? '' : '-translate-y-full'}
        `}
      >
        <Logo
          className={'header-logo'}/>
        <nav
          onFocus={() => {
            this.forceHeaderState(true);
          }}
          onBlur={() => {
            this.forceHeaderState(undefined);
          }}
        >
          <NavBarMobile hamburger={this.props.navBarMobileProps.hamburger}
                        menu={this.props.navBarMobileProps.menu}
                        onTerminalOpen={this.openTerminal}/>
          <NavBarDesktop darkMode={this.props.navBarMobileProps.menu.darkMode}
                         darkModeToggle={this.props.navBarMobileProps.menu.darkModeToggle}
                         onTerminalOpen={this.openTerminal}
                         terminalHintId={terminalHint ? 'terminal-hint' : undefined}/>
        </nav>
        {terminalHint}
      </header>
    );
  }
}

export interface HeaderProps {
  navBarMobileProps: Omit<NavbarMobileProps, 'onTerminalOpen'>
  onTerminalOpen: () => void
}

export interface HeaderState {
  windowY: number
  expanded?: boolean
  hidden?: boolean
  forceNotHidden?: boolean
  terminalHintVisible: boolean
}
