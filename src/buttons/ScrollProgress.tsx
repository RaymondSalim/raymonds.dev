import React from 'react';
import { debounce } from '../util/common';

const SEGMENT_COUNT = 18;

export class ScrollProgress extends React.Component<any, ScrollProgressState> {
  debouncedScrollHandler: () => void = () => {};

  constructor(props: any) {
    super(props);
    this.state = {
      percent: 0,
    };
  }

  componentDidMount() {
    this.debouncedScrollHandler = debounce<ScrollProgress>(this.handleScroll, 50, this);
    window.addEventListener('scroll', this.debouncedScrollHandler);
    window.addEventListener('resize', this.debouncedScrollHandler);
  }

  componentWillUnmount() {
    window.removeEventListener('scroll', this.debouncedScrollHandler);
    window.removeEventListener('resize', this.debouncedScrollHandler);
  }

  handleScroll() {
    const scrollable = document.documentElement.scrollHeight - window.innerHeight;
    const percent = scrollable > 0 ? (window.scrollY / scrollable) * 100 : 0;
    this.setState({
      percent: Math.min(100, Math.max(0, percent)),
    });
  }

  render() {
    const litSegments = Math.floor((this.state.percent / 100) * SEGMENT_COUNT);
    const segments = Array.from({ length: SEGMENT_COUNT }, (_, i) => (
      <div
        key={i}
        className={`scroll-progress-segment ${i < litSegments ? 'scroll-progress-segment-lit' : ''}`}
      />
    ));

    return (
      <>
        <div id="scroll-progress-snake" aria-hidden="true">
          {segments}
        </div>
        <div id="scroll-progress-bar" aria-hidden="true">
          <div id="scroll-progress-bar-fill" style={{ width: `${this.state.percent}%` }} />
        </div>
      </>
    );
  }
}

interface ScrollProgressState {
  percent: number
}
