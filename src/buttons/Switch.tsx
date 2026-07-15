import React from 'react';
import BaseProps from '../common/interface/BaseProps';

export class Switch extends React.Component<SwitchProps, SwitchState> {
  constructor(props: any) {
    super(props);

    this.state = {
      isChecked: this.props.isChecked,
    };

    this.toggleState = this.toggleState.bind(this);
  }

  toggleState() {
    this.setState({
      isChecked: !this.state.isChecked,
    });
  }

  render() {
    return (
      <label className="toggle-wrapper" htmlFor="toggle">
        {this.props.leftIcon}
        <div className={`toggle ${this.state.isChecked ? 'enabled' : 'disabled'}`}>
          <input
            id="toggle"
            name="toggle"
            type="checkbox"
            checked={this.state.isChecked}
            onClick={this.toggleState}
            onChange={this.props.onChange}
          />
        </div>
        {this.props.rightIcon}
      </label>
    );
  }
}

export interface SwitchProps extends BaseProps {
  leftIcon?: JSX.Element
  rightIcon?: JSX.Element
  isChecked: boolean // Initial switch state
  onChange: (e: React.ChangeEvent) => void
}

export interface SwitchState {
  isChecked: boolean
}
