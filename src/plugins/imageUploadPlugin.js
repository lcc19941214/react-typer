import React, { Component } from 'react';
import classnames from 'classnames';
import * as EntityType from '../constants/entity';

// applied to resizeable image
// need focus and resizeable
const createDecorator = (config = {}) => WrappedComponent =>
  class ImageUploadPluginDecorator extends Component {
    render() {
      const { contentState, block, blockProps, className } = this.props;
      const entity = contentState.getEntity(block.getEntityAt(0));
      const { uploading } = entity.getData();
      return (
        <WrappedComponent
          {...this.props}
          className={classnames(
            !uploading ? className : '',
            'RichEditor-plugin__image-upload',
            {
              'RichEditor-plugin__image-upload__uploading': uploading
            }
          )}
        />
      );
    }
  };

export default config => ({
  decorator: createDecorator(config)
});
