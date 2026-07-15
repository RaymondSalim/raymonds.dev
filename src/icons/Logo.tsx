import React from 'react';
import { anime } from 'react-anime';
import BaseProps from '../common/interface/BaseProps';

export class Logo extends React.Component<LogoProps> {
  animate(callback: () => void) {
    const animObj = anime({
      targets: `#${this.props.id ?? 'logo'} path`,
      strokeDashoffset: [anime.setDashoffset, 0],
      easing: 'easeInOutQuad',
      duration: 1600,
      direction: 'alternate',
      autoplay: false,
      loop: false,
      delay: 1000,
    });

    animObj.play();
    animObj.finished.then(callback);
  }

  componentDidMount() {
    if (this.props.wantAnimation) {
      this.animate(this.props.animationCallback!!);
    }
  }

  render() {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className={`text-blue-sapphire ${this.props.className}`}
        id={this.props.id ?? 'logo'}
        viewBox="0 0 132.10498 132.10498"
        fill="none"
        stroke="currentColor"
      >
        <g
          style={{ opacity: 1 }}>
          <path
            style={{
              strokeWidth: 9,
              strokeLinecap: 'round',
              strokeLinejoin: 'miter',
              strokeDasharray: 608.298,
            }}
            d="m 55.736855,51.895158 c 0,0 7.75687,-1.29281 9.04968,1.29281 1.15632,2.31265 1.29281,2.58562 -1.29281,7.75687 -0.54923,1.09847 -8.05281,9.73453 -14.0694,20.66509 C 41.2788,96.408198 34.079972,115.8122 32.592818,116.55578 30.007199,117.84859 22.19743,108.70072 20.830936,107.48606 9.1956343,97.143558 -10.196537,58.359208 22.862724,21.724152 44.532635,-2.2896355 90.642765,-1.1101145 112.62056,24.746115 152.69772,75.165758 100.98526,122.99979 95.814015,120.41416 90.642765,117.82854 64.786535,94.557938 60.908105,82.922628 85.471515,75.165758 107.32883,50.969828 100.98526,44.13829 88.057145,18.282058 28.587804,48.016718 31.173428,57.066398 c 1.292812,3.87844 7.756872,7.75687 9.049682,3.87844"
          />
        </g>
      </svg>
    );
  }
}

export interface LogoProps extends BaseProps {
  id?: string
  wantAnimation?: boolean
  animationCallback?: () => void
}
