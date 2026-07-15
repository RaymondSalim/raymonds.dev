import React from 'react';
import BaseProps from '../common/interface/BaseProps';

export class Kubernetes extends React.Component<BaseProps> {
  render() {
    return (
      <svg className={this.props.className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none">
        <path
          fill="#326CE5"
          d="M12 1.2 2.4 5.1v9.6l6.5 8.1h6.2l6.5-8.1V5.1L12 1.2Z"
        />
        <path
          fill="#FFF"
          d="M12 5.4a6.6 6.6 0 1 0 0 13.2 6.6 6.6 0 0 0 0-13.2Zm0 1.5a5.1 5.1 0 1 1 0 10.2 5.1 5.1 0 0 1 0-10.2Z"
        />
        <circle cx="12" cy="12" r="1.4" fill="#FFF"/>
        <path fill="#FFF" d="M12 6.5 12.6 9.6 11.4 9.6z"/>
        <path fill="#FFF" d="M16.6 9 14.1 11 13.5 9.9z"/>
        <path fill="#FFF" d="M16.6 15 13.5 14.1 14.1 13z"/>
        <path fill="#FFF" d="M12 17.5 11.4 14.4 12.6 14.4z"/>
        <path fill="#FFF" d="M7.4 15 10.5 13 11.1 14.1z"/>
        <path fill="#FFF" d="M7.4 9 11.1 9.9 10.5 11z"/>
      </svg>
    );
  }
}
