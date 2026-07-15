import React from 'react';
import { Logo } from '../icons/Logo';

export class Footer extends React.Component<any, any> {
  render() {
    return (
      <footer>
        <div id={'footer-content'}>
          <div>
            <Logo
              className={'h-12 w-12'}
            />
            <span className={'my-2'}>Thanks for visiting!</span>
            <span className={'mt-6'}>© Copyright 2022, Raymond Salim</span>
          </div>
          <div>
            <div id="sellout">
              <a href="https://github.com/RaymondSalim/PersonalWebsite">This website is open-source</a>
            </div>
            <div id="footer-credits">
              <span>Thanks to </span>
              <a href="https://colebemis.com/" target="_blank" rel="noopener noreferrer">Cole Bemis</a>
              <span>, </span>
              <a href=" https://icons.grommet.io/" target="_blank" rel="noopener noreferrer">grommet-icons</a>
              <span> for the icons!</span>
            </div>
          </div>
        </div>
      </footer>
    );
  }
}
