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
const TRIGGER = ['hover', 'click'];
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

class TooltipPopup extends Component {
  render() {
    const { style = {}, placement, visible, className = '', children } = this.props;
    const p = PLACEMENT.includes(placement) ? placement : defaultVal.placement;
    const cls = `RichEditor-tooltip__${p}`;
    return (
      <div>
        <div
          className={classnames('RichEditor-tooltip', cls, className, {
            'RichEditor-tooltip__hidden': !visible
          })}
          style={style}
        >
          <div className="RichEditor-tooltip-inner">{children}</div>
        </div>
      </div>
    );
  }
}

export default class Tooltip extends Component {
  static defaultProps = defaultVal;

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
  getTooltipDOMNode = () => findDOMNode(this.Tooltip);

  getStyle = placement => {
    const Tooltip = this.getTooltipDOMNode();
    const boundingRect = this.elem.getBoundingClientRect();
    const relativeParent = getRelativeParent(this.popup.parentElement);
    const popoverHeight = Tooltip.clientHeight;
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
    const { content, placement, className } = props;
    const { visible } = state;
    ReactDOM.render(
      <TooltipPopup
        ref={ref => (this.Tooltip = ref)}
        visible={visible}
        placement={placement}
        className={className}
        style={{
          position: 'absolute',
          ...style
        }}
      >
        {content}
      </TooltipPopup>,
      this.popup
    );
  };

  open = e => {
    if (!this.state.visible) {
      this.openId += 1;
      this.setState({ visible: true }, () => {
        if (this.props.onOpen) {
          this.props.onOpen();
        }
      });
    }
  };

  close = e => {
    if (this.state.visible) {
      this.setState({ visible: false });
      if (this.props.onClose) {
        this.props.onClose();
      }
    }
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

  onClick = e => this.open(e);
  onMouseEnter = e => this.open(e);
  onMouseLeave = e => this.close(e);

  render() {
    const { children, trigger } = this.props;
    const child = React.Children.only(this.props.children);
    const newChildProps = {};
    switch (trigger) {
      case 'click':
        newChildProps.onClick = this.fireEvent('onClick', this.onClick);
        break;
      case 'hover':
      default:
        newChildProps.onMouseEnter = this.fireEvent('onMouseEnter', this.onMouseEnter);
        newChildProps.onMouseLeave = this.fireEvent('onMouseLeave', this.onMouseLeave);
    }
    return React.cloneElement(child, newChildProps);
  }
}
