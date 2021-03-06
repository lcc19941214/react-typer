import React, { Component, PropTypes } from 'react';
import classnames from 'classnames';
import { EditorState } from 'draft-js';
import Popover from './popover';
import { addImage, updateImage, uploadImage } from '../utils/imageUtil';

const noop = () => {};

export class AddImageLink extends Component {
  // Start the popover closed
  state = {
    url: '',
    active: false
  };

  handleOnOpen = () => {
    this.setState(({ active }) => ({ active: !active }));
    document.querySelector('.add-image-link__input').focus();
  };

  handleOnClose = () => {
    this.setState(({ active }) => ({ active: false }));
  };

  changeURL = e => {
    const url = e.target.value;
    this.setState({ url });
  };

  handleConfirm = () => {
    const { url } = this.state;
    const { editorState, changeState, focus } = this.props;
    if (url && (/^https?:\/\/.+/.test(url) || /data:image\/.+/.test(url))) {
      const nextEditorState = addImage(editorState, url);
      changeState(nextEditorState, () => {
        this.setState({ url: '' });
        focus();
      });
      this.Popover.close();
    }
  };

  render() {
    const { active, url } = this.state;
    const {
      editorState,
      changeState,
      controlKey,
      onToggle,
      focus,
      blur,
      getEditor,
      ...extraProps
    } = this.props;
    return (
      <Popover
        className="RichEditor-toolbar__add-image__link__popover"
        ref={ref => (this.Popover = ref)}
        placement="bottom"
        onOpen={this.handleOnOpen}
        onClose={this.handleOnClose}
        overlay={[
          <input
            key="input"
            type="text"
            placeholder="http://"
            className="add-image-link__input"
            onChange={this.changeURL}
            value={url}
          />,
          <span
            key="confirm"
            className="add-image-link__button RichEditor-button RichEditor-button-confirm"
            onClick={this.handleConfirm}
          />
        ]}
      >
        <div
          className="RichEditor-toolbar__add-image RichEditor-toolbar-button__wrapped"
          {...extraProps}
        >
          <span
            className={classnames('RichEditor-button', `RichEditor-button-${controlKey}`, {
              'RichEditor-button__active': active
            })}
          />
        </div>
      </Popover>
    );
  }
}

export class UploadImage extends Component {
  static propTypes = {
    action: PropTypes.string.isRequired
  };

  handleUploadClick = () => {
    this.uploadInput.value = null;
    this.uploadInput.click();
  };

  handleOnUpload = e => {
    const file = e.target.files[0];
    if (file.type.includes('image/')) {
      const url = URL.createObjectURL(file);

      const {
        editorState,
        changeState,
        focus,
        blur,
        getEditor,
        onUpload,
        onUploadError
      } = this.props;
      const nextEditorState = addImage(editorState, url, {
        uploading: true,
        progress: 0
      });
      changeState(nextEditorState, () => {
        const config = {
          //   onUploadProgress: event => {
          //     const progress = Math.round(event.loaded / event.total * 100);
          //     if (progress !== 100) {
          //       changeState(updateImage(this.props.editorState, { progress }, url));
          //     }
          //   }
        };
        uploadImage(this.props.action, file, {
          onUpload,
          onUploadError,
          editor: getEditor(),
          requestConfig: config,
          localURL: url
        });
      });
    }
  };

  render() {
    const {
      editorState,
      changeState,
      controlKey,
      onToggle,
      focus,
      blur,
      onUpload,
      onUploadError,
      getEditor,
      ...extraProps
    } = this.props;
    return (
      <div
        className="RichEditor-toolbar__add-image RichEditor-toolbar-button__wrapped"
        {...extraProps}
      >
        <span
          className={`RichEditor-button RichEditor-toolbar__add-image__upload RichEditor-button-${controlKey}`}
          onClick={this.handleUploadClick}
        >
          <input
            type="file"
            accept="image/*"
            ref={ref => (this.uploadInput = ref)}
            onChange={this.handleOnUpload}
          />
        </span>
      </div>
    );
  }
}
