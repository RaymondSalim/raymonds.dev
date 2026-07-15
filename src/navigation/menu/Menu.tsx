import React, { SyntheticEvent } from 'react';
import { User } from '../../icons/User';
import { Work } from '../../icons/Work';
import { Project } from '../../icons/Project';
import { Contact } from '../../icons/Contact';
import { DarkModeToggle } from '../../util/darkmode/DarkModeToggle';
import BaseProps from '../../common/interface/BaseProps';

export class Menu extends React.Component<MenuProps> {
  render() {
    let cls;
    let tabIndex;
    if (this.props.isOpen) {
      cls = '-translate-x-full visible';
      tabIndex = 1;
    } else {
      cls = 'invisible';
      tabIndex = -1;
    }

    return (
      <aside
        aria-hidden={!this.props.isOpen}
        ref={this.props.innerRef}
        id="mobile-menu"
        tabIndex={tabIndex}
        className={cls}
      >
        <ul>
          <li>
            <a href="#about-me" onClick={this.props.onItemClick}>
              <User/>
              <span>About Me</span>
            </a>
          </li>
          <li>
            <a href="#experience" onClick={this.props.onItemClick}>
              <Work/>
              <span>Experience</span>
            </a>
          </li>
          <li>
            <a href="#projects" onClick={this.props.onItemClick}>
              <Project/>
              <span>Projects</span>
            </a>
          </li>
          <li>
            <a href="#contact" onClick={this.props.onItemClick}>
              <Contact/>
              <span>Contact</span>
            </a>
          </li>
        </ul>
        <div className={'toggle-container'}>
          <DarkModeToggle isDarkModeEnabled={this.props.darkMode} onChange={this.props.darkModeToggle}
                          singleIconMode={false}/>
        </div>
      </aside>
    );
  }
}

export interface MenuProps extends BaseProps {
  isOpen: boolean
  onItemClick: () => void
  darkMode: boolean
  darkModeToggle: (e: SyntheticEvent) => void
  innerRef?: React.RefObject<HTMLElement>
}
