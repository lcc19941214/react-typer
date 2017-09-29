import React, { Component } from 'react';
import ReactDOM, { findDOMNode } from 'react-dom';
import classnames from 'classnames';
import util from '../editorUtils/util';

const defaultVal = {
  placement: 'top',
  trigger: 'hover',
  renderLayout: () => document.querySelector('body')
};

const initialPopoverStyle = {
  transform: 'translate(-50%) scale(0)'
};

const PLACEMENT = ['top', 'bottom'];
const PLACEMENT_MAP = {
  top: 'bottom',
  bottom: 'top'
};

const getRelativeParent = element => {
  if (!element) {
    return null;
  }

  const position = window.getComputedStyle(element).getPropertyValue('position');
  if (position !== 'static') {
    return element;
  }

  return getRelativeParent(element.parentElement);
};

class PopoverPopup extends Component {
  render() {
    const {
      style = {},
      placement,
      visible,
      className = '',
      onClick,
      children
    } = this.props;
    const p = PLACEMENT.includes(placement) ? placement : defaultVal.placement;
    const cls = `RichEditor-popover__${p}`;
    return (
      <div>
        <div
          className={classnames('RichEditor-popover', cls, className, {
            'RichEditor-popover__hidden': !visible
          })}
          onClick={onClick}
          style={style}
        >
          <div className="RichEditor-popover-inner">{children}</div>
        </div>
      </div>
    );
  }
}

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
        setTimeout(() => {
          this.renderPopup(nextProps, nextState, this.getStyle(this.props.placement));
        }, 0);
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
  getPopoverDOMNode = () => findDOMNode(this.Popover);

  getStyle = placement => {
    const Popover = this.getPopoverDOMNode();
    const boundingRect = this.elem.getBoundingClientRect();
    const relativeParent = getRelativeParent(this.popup.parentElement);
    const popoverHeight = Popover.clientHeight;
    const relativeRect = relativeParent
      ? relativeParent.getBoundingClientRect()
      : document.body.getBoundingClientRect();
    let height = 0;
    if (placement === 'top') {
      height = -popoverHeight;
    } else if (placement === 'bottom') {
      height = boundingRect.height;
    }
    const style = {
      top: boundingRect.top - relativeRect.top + height,
      left: boundingRect.left - relativeRect.left + boundingRect.width / 2,
      transform: 'translate(-50%) scale(1)',
      [util.transformHyphenWithUpper(`margin-${PLACEMENT_MAP[placement]}`)]: '15px'
    };
    return style;
  };

  mountPopup = (props, state) => {
    this.renderLayout = props.renderLayout
      ? props.renderLayout()
      : defaultVal.renderLayout();
    this.renderLayout.appendChild(this.popup);
    this.renderPopup(props, state, initialPopoverStyle);
  };

  renderPopup = (props, state, style) => {
    const { content, placement, className, overlay } = props;
    const { visible } = state;
    ReactDOM.render(
      <PopoverPopup
        ref={ref => (this.Popover = ref)}
        visible={visible}
        content={content}
        placement={placement}
        className={className}
        style={{
          position: 'absolute',
          ...style
        }}
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
