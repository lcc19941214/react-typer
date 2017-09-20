import React, { Component } from 'react';
import classnames from 'classnames';
import * as EntityType from '../constants/entity';

// applied to resizeable image
// need focus and resizeable
const createDecorator = (config = {}) => WrappedComponent =>
  class EnhancedResizeableDecorator extends Component {
    render() {
      const { blockProps, className, ...elemProps } = this.props;
      const { isFocused, resizeData } = blockProps;
      return (
        <WrappedComponent
          {...this.props}
          className={classnames(className, {
            'RichEditor-plugin__enhance-resizeable__focus': isFocused && resizeData.src,
            'RichEditor-plugin__enhance-resizeable__blur': !isFocused && resizeData.src
          })}
        />
      );
    }
  };

export default config => ({
  decorator: createDecorator(config),
  blockRendererFn: (block, { getEditorState }) => {
    if (block.getType() === 'atomic') {
      const contentState = getEditorState().getCurrentContent();
      const entityKey = block.getEntityAt(0);
      if (!entityKey) return null;
      const entity = contentState.getEntity(entityKey);
      const type = entity.getType();
      if (type === 'image') {
        return {
          props: {
            enhanceResizeable: true
          }
        };
      }
    }
  }
});
