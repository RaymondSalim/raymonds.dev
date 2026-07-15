import React from 'react';
import BaseProps from '../common/interface/BaseProps';

export class Skill extends React.Component<SkillProps> {
  render() {
    return (
      <div className={'skill-icon-container'} aria-label={this.props.label}>
        {React.cloneElement(this.props.icon, { className: this.props.iconClassName })}
      </div>
    );
  }
}

export interface SkillProps extends BaseProps {
  iconClassName?: string
  icon: JSX.Element
  label: string
}
