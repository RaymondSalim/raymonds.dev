import React from 'react';
import BaseProps from '../common/interface/BaseProps';

export interface ButtonProps extends BaseProps {
  href?: string
  text: string
}

export class Button extends React.Component<ButtonProps> {
  render() {
    return (
      <a
        href={this.props.href}
        onClick={this.props.onclick}
        className={`btn ${this.props.className}`}
        onFocus={this.props.onfocus}
        tabIndex={0}
      >{this.props.text}</a>
    );
  }
}
