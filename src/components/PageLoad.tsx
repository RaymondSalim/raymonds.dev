import React from 'react';
import { Logo } from '../icons/Logo';
import BaseProps from '../common/interface/BaseProps';
import { wait } from '../util/common';

export class PageLoad extends React.Component<PageLoadProps, PageLoadState> {
  private readonly logoRef: React.RefObject<Logo>;

  constructor(p: PageLoadProps | Readonly<PageLoadProps>) {
    super(p);
    this.state = {
      pageDestroyed: false,
      animationDone: false,
    };
    this.logoRef = React.createRef();
  }

  animationDone = () => {
    wait(500).then(() => {
      this.setState({
        animationDone: true,
      });
      this.props.togglePageOverflow(false);
    }).then(() => {
      wait(650).then(() => {
        this.setState({
          pageDestroyed: true,
        });
      });
    });
  };

  render() {
    if (this.state.pageDestroyed) {
      return <></>;
    }
    return (
      <div
        id="page-load"
        style={{
          zIndex: 5000,
        }}
        className={`${this.props.siteReady && this.state.animationDone ? '-translate-y-full' : ''}`}
      >
        <div>
          <Logo id="load-logo" wantAnimation={true} animationCallback={this.animationDone}/>
        </div>
      </div>
    );
  }
}

export interface PageLoadProps extends BaseProps {
  siteReady: boolean
  togglePageOverflow: (force?: boolean) => void
}

export interface PageLoadState {
  animationDone: boolean
  pageDestroyed: boolean
}
