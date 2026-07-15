import React, { ReactElement, SyntheticEvent } from 'react';
import BaseProps from '../common/interface/BaseProps';

interface InputState {}
export interface InputProps extends BaseProps {
  type: string
  name: string
  label: string
  id?: string
  hidden?: boolean
  autoComplete?: string
  required?: boolean
  pattern?: string
  resizable?: boolean
  placeholder?: string
  textArea?: boolean
}

export class Input extends React.Component<InputProps, InputState> {
  handleKeyUp = (e: SyntheticEvent) => {
    const target = e.currentTarget;
    let castedTarget: HTMLInputElement | HTMLTextAreaElement;
    target.classList.toggle('typed-on', true);

    if (target.tagName.toLowerCase() === 'textarea') {
      castedTarget = (target as HTMLTextAreaElement);
    } else {
      castedTarget = (target as HTMLInputElement);
    }

    if (this.props.pattern === undefined) return;
    const regexp = new RegExp(this.props.pattern);

    const result = regexp.test(castedTarget.value);
    target.classList.toggle('content-valid', result);
    target.classList.toggle('content-invalid', !result);
  };

  render() {
    let input: ReactElement;
    const inputProps = {
      ...this.props,
      'aria-required': this.props.required,
    };

    // @ts-ignore
    // Delete object properties to prevent react spitting out warnings
    ['resizable', 'textArea', 'label'].forEach((el) => delete inputProps[el]);

    if (this.props.textArea !== undefined && this.props.textArea) {
      input = (
        <textarea
          {...inputProps}
          className={`styled-input ${this.props.resizable ? '' : 'resize-none'}`}
          onKeyUp={this.handleKeyUp}
        />
      );
    } else {
      input = (
        <input
          {...inputProps}
          className={'styled-input '}
          onKeyUp={this.handleKeyUp}
        />
      );
    }

    const labelID = `label-${this.props.name}`;
    return (
      <div className={`styled-input-container ${this.props.className}`}>
        { input }
        <div className={'label-container'}>
          <label
            id={labelID}
            className={'label'}
          >{this.props.label}
          </label>
        </div>
      </div>
    );
  }
}
