import React from 'react';
import { NavBar as NavBarMobile, NavbarMobileProps } from './navbar/mobile/NavBar';
import { NavBar as NavBarDesktop } from './navbar/desktop/NavBar';
import { Logo } from '../icons/Logo';

export class Header extends React.Component<HeaderProps, HeaderState> {
  static elementID = 'header';

  expandYLimit = 90;
  hiddenYStart = 150;

  constructor(props: HeaderProps) {
    super(props);
    this.state = {
      windowY: Number.MIN_SAFE_INTEGER,
    };
  }

  componentDidMount() {
    this.setState({
      windowY: window.scrollY,
    });
    this.toggleOnScroll();
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

  render() {
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
          <NavBarMobile hamburger={this.props.navBarMobileProps.hamburger} menu={this.props.navBarMobileProps.menu}/>
          <NavBarDesktop darkMode={this.props.navBarMobileProps.menu.darkMode}
                         darkModeToggle={this.props.navBarMobileProps.menu.darkModeToggle}/>
        </nav>
      </header>
    );
  }
}

export interface HeaderProps {
  navBarMobileProps: NavbarMobileProps
}

export interface HeaderState {
  windowY: number
  expanded?: boolean
  hidden?: boolean
  forceNotHidden?: boolean
}
