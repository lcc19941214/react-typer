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
      console.log(blockProps);
      return (
        <div>
          <WrappedComponent
            className={classnames(className, {
              'RichEditor-plugin__enhance-resizeable__focus': isFocused && resizeData.src,
              'RichEditor-plugin__enhance-resizeable__blur': !isFocused && resizeData.src
            })}
            {...elemProps}
          />
        </div>
      );
    }
  };

export default config => ({
  decorator: createDecorator(config),
  blockRendererFn: (block, { getEditorState }) => {
    if (block.getType() === 'atomic') {
      const contentState = getEditorState().getCurrentContent();
      const entity = contentState.getEntity(block.getEntityAt(0));
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
