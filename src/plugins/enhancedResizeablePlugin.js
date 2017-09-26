import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import classnames from 'classnames';
import * as EntityType from '../constants/entity';

const store = {
  getEditorRef: undefined,
  getEditorState: undefined
};

// applied to resizeable image
// need focus and resizeable
const createDecorator = ({ config = {}, store }) => WrappedComponent =>
  class EnhancedResizeableDecorator extends Component {
    wrapperWidth = undefined;
    state = {
      style: {}
    };

    componentWillUpdate(nextProps, nextState) {
      setTimeout(() => {
        // this.resizeImg(nextProps, nextState);
      }, 10);
    }

    resizeImg = (nextProps, nextState) => {
      // const wrapper = store.getEditorRef().refs.editor;
      const imageElem = ReactDOM.findDOMNode(this);
      const wrapper = imageElem.parentElement;
      const wrapperWidth = wrapper.getBoundingClientRect
        ? wrapper.getBoundingClientRect().width
        : wrapper.clientWidth;
      const { style } = nextProps;
      if (style.width !== this.props.style.width || this.wrapperWidth !== wrapperWidth) {
        this.setState({
          style: Object.assign({}, style, {
            width: `${wrapperWidth * parseFloat(style.width, 10) / 100}px`
          })
        });
      }
      this.wrapperWidth = wrapperWidth;
    };

    render() {
      const { blockProps, className, style, ...elemProps } = this.props;
      const { isFocused } = blockProps;
      const { style: overrideStyle } = this.state;
      return (
        <WrappedComponent
          {...this.props}
          style={Object.assign({}, style, overrideStyle)}
          className={classnames(className, {
            'RichEditor-plugin__enhance-resizeable__focus': isFocused,
            'RichEditor-plugin__enhance-resizeable__blur': !isFocused
          })}
        />
      );
    }
  };

export default config => ({
  initialize: ({ getEditorRef, getEditorState }) => {
    store.getEditorRef = getEditorRef;
    store.getEditorState = getEditorState;
  },
  decorator: createDecorator({ config, store })
});
