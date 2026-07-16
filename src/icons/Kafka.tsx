import React from 'react';
import BaseProps from '../common/interface/BaseProps';

export class Kafka extends React.Component<BaseProps> {
  render() {
    return (
      <svg className={this.props.className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none">
        <g fill="#000">
          <circle cx="5" cy="5" r="2"/>
          <circle cx="5" cy="12" r="2.4"/>
          <circle cx="5" cy="19" r="2"/>
          <circle cx="18" cy="4.5" r="1.6"/>
          <circle cx="18" cy="12" r="1.6"/>
          <circle cx="18" cy="19.5" r="1.6"/>
          <path stroke="#000" strokeWidth="1.1" d="M6.8 6.1 16.4 10.9"/>
          <path stroke="#000" strokeWidth="1.1" d="M7.3 12 16.4 12"/>
          <path stroke="#000" strokeWidth="1.1" d="M6.8 17.9 16.4 13.1"/>
        </g>
      </svg>
    );
  }
}
