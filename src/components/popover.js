import React, { Component } from 'react';
import ReactDOM, { findDOMNode } from 'react-dom';
import classnames from 'classnames';
import util from '../editorUtils/util';

const defaultVal = {
  placement: 'top',
  trigger: 'hover',
  renderLayout: () => document.querySelector('body')
};

const PLACEMENT = ['top', 'bottom'];

const PLACEMENT_MAP = {
  top: 'bottom',
  bottom: 'top'
};

const PopoverPopup = props => {
  const { style = {}, placement, visible, className = '', onClick, children } = props;
  const p = PLACEMENT.includes(placement) ? placement : defaultVal.placement;
  const cls = `RichEditor-popover__${p}`;
  return (
    <div
      className={classnames('RichEditor-popover', cls, className, {
        'RichEditor-popover__hidden': !visible
      })}
      onClick={onClick}
      style={style}
    >
      <div className="RichEditor-popover-inner">{children}</div>
    </div>
  );
};

export default class Popover extends Component {
  static defaultProps = {
    placement: defaultVal.placement
  };

  openId = 0;
  state = {
    visible: false
  };

  componentDidMount() {
    this.elem = this.getRootDOMNode();
    this.popup = document.createElement('div');
    document.addEventListener('click', this.close);
  }

  componentWillUpdate(nextProps, nextState) {
    if (this.openId) {
      if (!this.renderLayout) {
        this.mountPopup(nextProps, nextState);
      }
      if (this.renderLayout) {
        this.renderPopup(nextProps, nextState);
      }
    }
  }

  componentWillUnmount() {
    if (this.renderLayout) {
      ReactDOM.unmountComponentAtNode(this.popup);
      this.renderLayout.removeChild(this.popup);
    }
    this.popup = null;
    document.removeEventListener('click', this.close);
  }

  getRootDOMNode = () => findDOMNode(this);
  getPopupDOMNode = () => this.popup && findDOMNode(this.popup);

  mountPopup = (props, state) => {
    this.renderLayout = props.renderLayout
      ? props.renderLayout()
      : defaultVal.renderLayout();
    this.renderLayout.appendChild(this.popup);
  };

  renderPopup = (props, state) => {
    const { content, placement, className, overlay } = props;
    const { visible } = state;
    this.rect = this.elem.getBoundingClientRect();
    const { left, top, width, height } = this.rect;
    const scrollTop = document.documentElement.scrollTop;
    const scrollHeight = document.documentElement.scrollHeight;

    let poxY = 0;
    switch (placement) {
      case 'top':
        poxY = `${scrollHeight - scrollTop - top}px`;
        break;
      case 'bottom':
        poxY = `${scrollTop + top + height}px`;
        break;
      default:
        break;
    }

    const style = {
      position: 'absolute',
      bottom: 'auto',
      top: 'auto',
      [PLACEMENT_MAP[placement]]: poxY,
      left: `${left + width / 2}px`,
      [util.transformHyphenWithUpper(`margin-${PLACEMENT_MAP[placement]}`)]: '15px'
    };
    ReactDOM.render(
      <PopoverPopup
        visible={visible}
        content={content}
        placement={placement}
        className={className}
        style={style}
        onClick={this.onPopoverClick}
      >
        {overlay}
      </PopoverPopup>,
      this.popup
    );
  };

  // Note: make sure whenever a click happens within the popover it is not closed
  onPopoverClick = () => {
    this.preventNextClose = true;
  };

  open = () => {
    if (!this.state.visible) {
      this.preventNextClose = true;
      this.openId += 1;
      this.setState({ visible: true }, () => {
        if (this.props.onOpen) {
          this.props.onOpen();
        }
      });
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

  fireEvent = (handler, callback) => {
    const childProps = this.props.children.props;
    const props = this.props;
    return e => {
      if (childProps[handler]) {
        childProps[handler](e);
      }
      if (props[handler]) {
        props[handler](e);
      }
      callback(e);
    };
  };

  render() {
    const child = React.Children.only(this.props.children);
    const newChildProps = {};
    newChildProps.onClick = this.fireEvent('onClick', this.open);

    return React.cloneElement(child, newChildProps);
  }
}
