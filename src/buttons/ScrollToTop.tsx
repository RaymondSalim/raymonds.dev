import React from 'react';
import { ArrowUp } from '../icons/ArrowUp';
import { debounce } from '../util/common';

export class ScrollToTop extends React.Component<any, ScrollToTopState> {
  debouncedScrollHandler: () => void = () => {};

  constructor(props: any) {
    super(props);
    this.state = {
      visible: false,
    };
  }

  componentDidMount() {
    this.debouncedScrollHandler = debounce<ScrollToTop>(this.handleScroll, 100, this);
    window.addEventListener('scroll', this.debouncedScrollHandler);
  }

  componentWillUnmount() {
    window.removeEventListener('scroll', this.debouncedScrollHandler);
  }

  handleScroll() {
    this.setState({
      visible: window.scrollY > window.innerHeight * 0.75,
    });
  }

  scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  render() {
    return (
      <button
        type="button"
        id="scroll-to-top"
        aria-label="Scroll to top"
        onClick={this.scrollToTop}
        className={this.state.visible ? 'scroll-to-top-visible' : 'scroll-to-top-hidden'}
      >
        <ArrowUp />
      </button>
    );
  }
}

interface ScrollToTopState {
  visible: boolean
}
