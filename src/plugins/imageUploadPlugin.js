import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import classnames from 'classnames';
import * as BlockType from '../constants/blockType';

// applied to resizeable image
// need focus and resizeable
const createDecorator = (config = {}) => WrappedComponent =>
  class ImageUploadPluginDecorator extends Component {
    uploaded = false;

    componentDidMount() {
      this.elem = ReactDOM.findDOMNode(this);
    }

    // componentWillUpdate(nextProps, nextState) {
    //   const { uploading, progress } = this.getData(nextProps);
    //   if (uploading) {
    //     // TODO
    //     // show progress bar
    //   }
    // }

    componentDidUpdate(prevProps, prevState) {
      const { uploading } = this.getData(prevProps);
      if (!uploading && !this.uploaded) {
        this.uploaded = true;
      }
    }

    getData = props => {
      const { contentState, block } = this.props;
      const entity = contentState.getEntity(block.getEntityAt(0));
      return entity.getData();
    };

    render() {
      const { style, className } = this.props;
      const { uploading, src, uid, error } = this.getData(this.props);
      const dataSet = { 'data-image-uid': uid };

      if (!uploading) {
        this.uploaded = true;
      }

      return uploading ? (
        <div
          className={classnames('RichEditor-plugin__image-upload', {
            'RichEditor-plugin__image-upload__uploading': uploading
          })}
        >
          <img src={src} style={style} />
        </div>
      ) : (
        <WrappedComponent
          {...this.props}
          {...dataSet}
          className={classnames(className, {
            'RichEditor-plugin__image-upload__uploaded': !error && !uploading && !this.uploaded,
            'RichEditor-plugin__image-error': error
          })}
        />
      );
    }
  };

export default config => ({
  decorator: createDecorator(config)
});
