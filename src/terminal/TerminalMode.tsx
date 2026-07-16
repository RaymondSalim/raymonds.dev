import React from 'react';
import { executeTerminalCommand, initialTerminalSession } from './terminalCommands';
import { TerminalSession } from './terminalTypes';

export interface TerminalModeProps {
  isOpen: boolean
  isMobile: boolean
  onClose: () => void
  onScrollToSection: (targetId: string) => void
  onExternalOpen: (url: string) => void
}

type TerminalModeState = {
  input: string,
  session: TerminalSession,
  outputLines: string[],
  commandHistory: string[],
  historyIndex?: number,
};

export class TerminalMode extends React.Component<TerminalModeProps, TerminalModeState> {
  private readonly inputRef = React.createRef<HTMLInputElement>();

  constructor(props: TerminalModeProps) {
    super(props);

    this.state = {
      input: '',
      session: initialTerminalSession(),
      outputLines: [],
      commandHistory: [],
    };
  }

  componentDidMount() {
    if (this.props.isOpen) {
      this.focusInput();
    }
  }

  componentDidUpdate(prevProps: TerminalModeProps) {
    if (!prevProps.isOpen && this.props.isOpen) {
      this.focusInput();
    }
  }

  private focusInput() {
    this.inputRef.current?.focus();
  }

  private handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ input: event.target.value, historyIndex: undefined });
  };

  private handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      this.submitCommand();
      return;
    }

    if (event.key === 'Escape') {
      event.preventDefault();
      this.props.onClose();
      return;
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault();
      this.navigateHistory('previous');
      return;
    }

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      this.navigateHistory('next');
    }
  };

  private submitCommand() {
    const command = this.state.input.trim();

    if (command.length === 0) {
      return;
    }

    const result = executeTerminalCommand(command, this.state.session);

    this.setState((state) => {
      const commandHistory = [...state.commandHistory, command];

      if (result.action.type === 'clear') {
        return {
          input: '',
          session: result.session,
          outputLines: [],
          commandHistory,
          historyIndex: undefined,
        };
      }

      return {
        input: '',
        session: result.session,
        outputLines: [...state.outputLines, `> ${command}`, ...result.lines],
        commandHistory,
        historyIndex: undefined,
      };
    });

    this.handleCommandAction(result.action);
  }

  private handleCommandAction(action: ReturnType<typeof executeTerminalCommand>['action']) {
    if (action.type === 'close') {
      this.props.onClose();
    }

    if (action.type === 'scroll') {
      this.props.onScrollToSection(action.targetId);
    }

    if (action.type === 'external') {
      this.props.onExternalOpen(action.url);
    }
  }

  private navigateHistory(direction: 'previous' | 'next') {
    this.setState((state) => {
      if (state.commandHistory.length === 0) {
        return null;
      }

      if (direction === 'previous') {
        const previousIndex = state.historyIndex === undefined
          ? state.commandHistory.length - 1
          : Math.max(state.historyIndex - 1, 0);

        return {
          input: state.commandHistory[previousIndex],
          historyIndex: previousIndex,
        };
      }

      if (state.historyIndex === undefined) {
        return null;
      }

      if (state.historyIndex >= state.commandHistory.length - 1) {
        return {
          input: '',
          historyIndex: undefined,
        };
      }

      const nextIndex = state.historyIndex + 1;

      return {
        input: state.commandHistory[nextIndex],
        historyIndex: nextIndex,
      };
    });
  }

  render() {
    if (!this.props.isOpen) {
      return null;
    }

    return (
      <section
        id="terminal-mode"
        role="dialog"
        aria-label="Terminal mode"
        className={this.props.isMobile ? 'terminal-mode-mobile' : 'terminal-mode-desktop'}
      >
        <header>
          <button type="button" onClick={this.props.onClose} aria-label="Close terminal">
            Close
          </button>
        </header>
        <div aria-live="polite">
          {this.state.outputLines.map((line, index) => (
            <div key={`${index}-${line}`}>
              {line}
            </div>
          ))}
        </div>
        <label htmlFor="terminal-command-input">
          Terminal command
        </label>
        <input
          id="terminal-command-input"
          ref={this.inputRef}
          value={this.state.input}
          onChange={this.handleInputChange}
          onKeyDown={this.handleKeyDown}
        />
      </section>
    );
  }
}
