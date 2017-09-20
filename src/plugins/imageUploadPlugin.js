import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import classnames from 'classnames';
import * as EntityType from '../constants/entity';

// applied to resizeable image
// need focus and resizeable
const createDecorator = (config = {}) => WrappedComponent =>
  class ImageUploadPluginDecorator extends Component {
    componentDidMount() {
      this.elem = ReactDOM.findDOMNode(this);
    }

    componentWillUpdate(nextProps, nextState) {
      const { uploading, progress } = this.getData(nextProps);
      if (uploading) {
        // TODO
        // show progress bar
      }
    }

    getData = props => {
      const { contentState, block } = this.props;
      const entity = contentState.getEntity(block.getEntityAt(0));
      return entity.getData();
    };

    render() {
      const { style, className } = this.props;
      const { uploading, src } = this.getData(this.props);
      return uploading ? (
        <div
          className={classnames('RichEditor-plugin__image-upload', {
            'RichEditor-plugin__image-upload__uploading': uploading
          })}
        >
          <img src={src} style={style}/>
        </div>
      ) : (
        <WrappedComponent {...this.props} className={classnames(className, 'RichEditor-plugin__image-upload__uploaded')}/>
      );
    }
  };

export default config => ({
  decorator: createDecorator(config)
});
