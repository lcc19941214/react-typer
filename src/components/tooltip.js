import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import classnames from 'classnames';
import util from '../editorUtils/util';

const defaultVal = {
  placement: 'top',
  trigger: 'hover',
  renderLayout: () => document.querySelector('body')
};

const PLACEMENT_MAP = {
  top: 'bottom',
  bottom: 'top'
};

const TooltipItem = ({ style = {}, content, placement, visible, className = '' }) => {
  const cls = `RichEditor-tooltip__${placement}`;
  return (
    <div
      className={classnames('RichEditor-tooltip', cls, className, {
        'RichEditor-tooltip__hidden': !visible
      })}
      style={style}
    >
      <div className="RichEditor-tooltip-inner">{content}</div>
    </div>
  );
};

export default class Tooltip extends Component {
  static defaultProps = defaultVal;

  static placement = ['top', 'bottom'];
  static trigger = ['hover', 'click'];

  constructor(...arg) {
    super(...arg);

    this.eventHook = {
      mouseenter: this.open,
      mouseleave: this.close
    };
    this.renderLayout = defaultVal.renderLayout();
    this.popup = null;
    this.openId = 0;
  }

  state = {
    visible: false
  };

  // When the tooltip is visible and users click anywhere on the page,
  // the tooltip should close
  componentDidMount() {
    this.elem = ReactDOM.findDOMNode(this);
    this.popup = document.createElement('div');

    this.createHook(this.elem, this.eventHook);
    this.createHook(document, { click: this.close });
  }

  componentWillUnmount() {
    ReactDOM.unmountComponentAtNode(this.popup);
    this.renderLayout.removeChild(this.popup);
    this.popup = null;

    this.createHook(this.elem, this.eventHook, true);
    this.createHook(document, { click: this.close }, true);
  }

  componentWillUpdate(nextProps, nextState) {
    if (this.state.visible !== nextState.visible) {
      if (!this.openId) {
        this.mountLayer(nextProps, nextState);
      }
      this.renderLayer(nextProps, nextState);
    }
  }

  createHook = (target, handlers, remove) => {
    let fn = remove ? 'removeEventListener' : 'addEventListener';
    Object.keys(handlers).forEach(event => {
      target[fn](event, handlers[event], false);
    });
  };

  mountLayer = (props, state) => {
    this.renderLayout = props.renderLayout() || defaultVal.renderLayout();
    this.renderLayout.appendChild(this.popup);
  };

  renderLayer = (props, state) => {
    const { content, placement, className } = props;
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
      <TooltipItem
        visible={visible}
        content={content}
        placement={placement}
        className={className}
        style={style}
      />,
      this.popup
    );
  };

  open = e => {
    if (!this.state.visible) {
      this.setState({ visible: true }, () => {
        this.openId += 1;
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

  render() {
    return this.props.children;
  }
}
