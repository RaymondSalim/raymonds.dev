import React, { SyntheticEvent } from 'react';
import { DarkModeToggle } from '../../../util/darkmode/DarkModeToggle';
import { convert } from '../../../util/dimensions';

export class NavBar extends React.Component<NavBarDesktopProps> {
  render() {
    const iconDim = convert(undefined, 1.75);
    return (
      <div
        id={'navbar-desktop'}
      >
        <ul className={'flex space-x-8 items-center h-full'}>
          <li>
            <a
              href="#about-me">
              <span>About Me</span>
            </a>
          </li>
          <li>
            <a href="#experience">
              <span>Experience</span>
            </a>
          </li>
          <li>
            <a href="#client-work">
              <span>Client Work</span>
            </a>
          </li>
          <li>
            <a href="#projects">
              <span>Projects</span>
            </a>
          </li>
          <li>
            <a href="#contact">
              <span>Contact</span>
            </a>
          </li>
          <li className={'terminal-trigger-container'}>
            <button
              type="button"
              className="terminal-trigger"
              aria-label="Open terminal mode"
              aria-describedby={this.props.terminalHintId}
              onClick={this.props.onTerminalOpen}
            >
              &gt;_
            </button>
          </li>
          <li className={'toggle-container'}>
            <DarkModeToggle singleIconDim={iconDim?.pixels} isDarkModeEnabled={this.props.darkMode}
                            onChange={this.props.darkModeToggle} singleIconMode={true}/>
          </li>
        </ul>
      </div>
    );
  }
}

export interface NavBarDesktopProps {
  darkMode: boolean
  darkModeToggle: (e: SyntheticEvent) => void
  onTerminalOpen: () => void
  terminalHintId?: string
}
