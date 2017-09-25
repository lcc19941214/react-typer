import React, { Component, PropTypes } from 'react';
import classnames from 'classnames';
import { EditorState } from 'draft-js';
import Popover from './popover';
import { addImage, updateImage, uploadImage } from '../editorUtils/imageUtil';

const noop = () => {};

export class AddImageLinkButton extends Component {
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
            className="add-image-link__button add-image-link__confirm-button"
            onClick={this.handleConfirm}
          >
            +
          </span>
        ]}
      >
        <div
          className="RichEditor-toolbar__add-image RichEditor-toolbar-button__wrapped"
          {...extraProps}
        >
          <span
            className={classnames(
              'RichEditor-toolbar-button',
              `RichEditor-toolbar-button-${controlKey}`,
              {
                'RichEditor-toolbar-button__active': active
              }
            )}
          />
        </div>
      </Popover>
    );
  }
}

export class UploadImageButton extends Component {
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

      const { editorState, changeState, focus, blur } = this.props;
      const nextEditorState = addImage(editorState, url, {
        uploading: true,
        progress: 0
      });
      changeState(nextEditorState, () => {
        const config = {
          onUploadProgress: event => {
            const progress = Math.round(event.loaded / event.total * 100);
            if (progress !== 100) {
              changeState(updateImage(this.props.editorState, { progress }, url));
            }
          }
        };
        uploadImage(this.props.action, file, config).then(res => {
          const extraMergeData = this.props.onUpload(res) || {};
          const toMergeData = {
            src: res.url,
            uploading: false,
            progress: 100,
            ...extraMergeData
          };

          // use blur now and focus later on to make rerender and change the image src
          blur();
          const newEditorState = updateImage(this.props.editorState, toMergeData, url);
          changeState(newEditorState, () => {
            focus();

            // release url
            setTimeout(() => {
              URL.revokeObjectURL(url);
            }, 1000);
          });
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
      ...extraProps
    } = this.props;
    return (
      <div
        className="RichEditor-toolbar__add-image RichEditor-toolbar-button__wrapped"
        {...extraProps}
      >
        <span
          className={`RichEditor-toolbar-button RichEditor-toolbar__add-image__upload RichEditor-toolbar-button-${controlKey}`}
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
