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
    overrideStyle = {
      minWidth: '30px',
      maxWidth: '100%'
    };
    render() {
      const { blockProps, className, style, ...elemProps } = this.props;
      const { isFocused } = blockProps;
      return (
        <WrappedComponent
          {...this.props}
          style={Object.assign({}, style, this.overrideStyle)}
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
