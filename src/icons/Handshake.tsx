import React from 'react';

export class Handshake extends React.Component {
  render() {
    return (
      <svg
        fill="none"
        height="24"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        viewBox="0 0 24 24"
        width="24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M11 17l-4-4a2 2 0 0 0-2.83 0l-.34.34a2 2 0 0 0 0 2.83L8 21" />
        <path d="M7 13l4.5-4.5a2 2 0 0 1 2.83 0L16 10" />
        <path d="M13 19l1.5 1.5a2 2 0 0 0 2.83 0l.34-.34a2 2 0 0 0 0-2.83L14 13.67" />
        <path d="M16 10l2.5-2.5a2 2 0 0 0 0-2.83l-.34-.34a2 2 0 0 0-2.83 0L13 6.67" />
        <path d="M2 12l3-3" />
        <path d="M22 12l-3-3" />
      </svg>
    );
  }
}
