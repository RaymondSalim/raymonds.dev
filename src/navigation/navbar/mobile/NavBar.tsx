import React from 'react';
import { Hamburger, HamburgerProps } from './Hamburger';
import { Menu, MenuProps } from '../../menu/Menu';
import BaseProps from '../../../common/interface/BaseProps';

export class NavBar extends React.Component<NavbarMobileProps> {
  private readonly menuRef: React.RefObject<HTMLElement>;

  private readonly burgerRef: React.RefObject<HTMLButtonElement>;

  constructor(props: NavbarMobileProps) {
    super(props);
    this.menuRef = React.createRef();
    this.burgerRef = React.createRef();
  }

  componentDidMount() {
    this.trapFocus();
  }

  trapFocus() {
    const menu = this.menuRef.current;
    if (menu == null) {
      return;
    }
    const focusableElements = [this.burgerRef.current, ...Array.from(menu.querySelectorAll('a, input'))];
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    document.addEventListener('keydown', (e) => {
      const isTabPressed = e.key === 'Tab' || e.code === 'Tab' || e.keyCode === 9;

      if (!isTabPressed) {
        return;
      }

      if (e.shiftKey) { // shift + tab
        if (document.activeElement === firstElement) {
          (lastElement as HTMLElement).focus();
          e.preventDefault();
        }
      } else if (document.activeElement === lastElement) {
        (firstElement as HTMLElement).focus();
        e.preventDefault();
      }
    });
  }

  render() {
    return (
      <div
        className="md:hidden"
      >
        <Hamburger innerRef={this.burgerRef} onclick={this.props.hamburger.onclick}
                   isActive={this.props.hamburger.isActive}/>
        <Menu innerRef={this.menuRef} isOpen={this.props.menu.isOpen} onItemClick={this.props.menu.onItemClick}
              darkMode={this.props.menu.darkMode} darkModeToggle={this.props.menu.darkModeToggle}/>
      </div>
    );
  }
}

export interface NavbarMobileProps extends BaseProps {
  hamburger: HamburgerProps
  menu: MenuProps
}
