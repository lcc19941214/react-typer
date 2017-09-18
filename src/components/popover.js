import React, { Component } from 'react';
import classnames from 'classnames';

export default class Popover extends Component {
  static defaultProps = {
    placement: 'top'
  };

  static placement = ['top', 'bottom'];

  state = {
    visible: false
  };

  // When the popover is visible and users click anywhere on the page,
  // the popover should close
  componentDidMount() {
    document.addEventListener('click', this.close);
  }

  componentWillUnmount() {
    document.removeEventListener('click', this.close);
  }

  // Note: make sure whenever a click happens within the popover it is not closed
  onPopoverClick = () => {
    this.preventNextClose = true;
  };

  open = () => {
    if (!this.state.visible) {
      this.preventNextClose = true;
      this.setState(
        {
          visible: true
        },
        () => {
          if (this.props.onOpen) {
            this.props.onOpen();
          }
        }
      );
    }
  };

  close = () => {
    if (!this.preventNextClose && this.state.visible) {
      this.setState({
        visible: false
      });
      if (this.props.onClose) {
        this.props.onClose();
      }
    }

    this.preventNextClose = false;
  };

  render() {
    const { visible } = this.state;
    const { placement, className = '' } = this.props;
    const p = Popover.placement.includes(placement) ? placement : 'bottom';
    const cls = `RichEditor-popover__${p}`;
    return (
      <div
        className={classnames('RichEditor-popover', cls, className, {
          'RichEditor-popover__hidden': !visible
        })}
        onClick={this.onPopoverClick}
      >
        {this.props.children}
      </div>
    );
  }
}
