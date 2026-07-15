import React, { SyntheticEvent } from 'react';
import BaseProps from '../../../common/interface/BaseProps';

export class Hamburger extends React.Component<HamburgerProps> {
  constructor(props: HamburgerProps | Readonly<HamburgerProps>) {
    super(props);
    this.handleClick = this.handleClick.bind(this);
  }

  handleClick(e: SyntheticEvent) {
    e.preventDefault();
    this.props.onclick();
  }

  render() {
    return (
      <button
        ref={this.props.innerRef}
        aria-label="Menu"
        onClick={this.handleClick} // Using custom function for future uses
        className={`burger-btn ${this.props.class ?? ''} ${this.props.isActive ? 'active' : 'inactive'}`}
        type="button">
        <div className="burger-container">
          <div className="burger">
            <div/>
          </div>
        </div>
      </button>
    );
  }
}

export interface HamburgerProps extends BaseProps {
  class?: string
  isActive: boolean
  onclick: () => void
  innerRef?: React.RefObject<HTMLButtonElement>
}
