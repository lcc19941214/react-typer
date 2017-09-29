import React, { Component } from 'react';
import classnames from 'classnames';
import './alignmentTool.less';

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

class AlignmentButton extends Component {
  activate = event => {
    event.preventDefault();
    this.props.setAlignment({ alignment: this.props.alignment });
  };

  preventBubblingUp = event => {
    event.preventDefault();
  };

  render() {
    const { alignment } = this.props;
    return (
      <div
        onMouseDown={this.preventBubblingUp}
        className="react-typer__alignment-tool__button-wrapper"
      >
        <div
          className={classnames(
            'react-typer__alignment-tool__button',
            `react-typer__alignment-tool__button-${alignment}`,
            {
              'react-typer__alignment-tool__button__active': this.props.active
            }
          )}
          onClick={this.activate}
        />
      </div>
    );
  }
}

export default class AlignmentTool extends React.Component {
  state = {
    position: {},
    alignment: null
  };

  componentWillMount() {
    this.props.store.subscribeToItem('visibleBlock', this.onVisibilityChanged);
    this.props.store.subscribeToItem('alignment', this.onAlignmentChange);
  }

  componentWillUnmount() {
    this.props.store.unsubscribeFromItem('visibleBlock', this.onVisibilityChanged);
    this.props.store.unsubscribeFromItem('alignment', this.onAlignmentChange);
  }

  onVisibilityChanged = visibleBlock => {
    setTimeout(() => {
      let position;
      const boundingRect = this.props.store.getItem('boundingRect');
      if (visibleBlock) {
        const relativeParent = getRelativeParent(this.toolbar.parentElement);
        const toolbarHeight = this.toolbar.clientHeight;
        const relativeRect = relativeParent
          ? relativeParent.getBoundingClientRect()
          : document.body.getBoundingClientRect();
        position = {
          top: boundingRect.top - relativeRect.top - toolbarHeight - 15,
          left: boundingRect.left - relativeRect.left + boundingRect.width / 2,
          transform: 'translate(-50%) scale(1)',
          transition: 'transform 0.15s cubic-bezier(.3,1.2,.2,1)'
        };
      } else {
        position = { transform: 'translate(-50%) scale(0)' };
      }
      const alignment = this.props.store.getItem('alignment') || 'default';
      this.setState({
        alignment,
        position
      });
    }, 0);
  };

  onAlignmentChange = alignment => {
    this.setState({
      alignment
    });
  };

  render() {
    const buttons = [
      {
        alignment: 'left'
      },
      {
        alignment: 'center'
      },
      {
        alignment: 'right'
      }
    ];
    return (
      <div
        style={this.state.position}
        ref={toolbar => {
          this.toolbar = toolbar;
        }}
        className="react-typer__alignment-tool"
      >
        {buttons.map(({ img, alignment }, index) => (
          <AlignmentButton
            key={index}
            alignment={alignment}
            active={this.state.alignment === alignment}
            setAlignment={this.props.store.getItem('setAlignment')}
          />
        ))}
      </div>
    );
  }
}
