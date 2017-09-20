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

  onToggle = () => {
    this.setState(({ active }) => ({ active: !active }));
    this.Popover.open();
  };

  handleOnOpen = () => {
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
    return (
      <div className="RichEditor-toolbar__add-image RichEditor-toolbar-button__wrapped">
        <span
          className={classnames('RichEditor-toolbar-button', {
            'RichEditor-toolbar-button__active': active
          })}
          onClick={this.onToggle}
        >
          +
        </span>
        <Popover
          className="RichEditor-toolbar__add-image__link__popover"
          ref={ref => (this.Popover = ref)}
          placement="bottom"
          onOpen={this.handleOnOpen}
          onClose={this.handleOnClose}
        >
          <input
            type="text"
            placeholder="http://"
            className="add-image-link__input"
            onChange={this.changeURL}
            value={url}
          />
          <span
            className="add-image-link__button add-image-link__confirm-button"
            onClick={this.handleConfirm}
          >
            +
          </span>
        </Popover>
      </div>
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
      const nextEditorState = addImage(editorState, url, { uploading: true });
      changeState(nextEditorState, () => {
        // release url
        setTimeout(() => {
          URL.revokeObjectURL(url);
        }, 1000);

        const config = {
          onUploadProgress: event => {
            console.log(Math.round(event.loaded / event.total * 100));
          }
        };
        uploadImage(this.props.action, file, config).then(res => {
          const toMergeData = {
            // src: 'https://avatars2.githubusercontent.com/u/12473993?v=4&s=88',
            uploading: false
          };

          // use blur now and focus later on to make rerender and change the image src
          blur();
          const newEditorState = updateImage(this.props.editorState, toMergeData, url);
          changeState(newEditorState, focus);
        });
      });
    }
  };

  render() {
    return (
      <div className="RichEditor-toolbar__add-image RichEditor-toolbar-button__wrapped">
        <span
          className="RichEditor-toolbar-button RichEditor-toolbar__add-image__upload"
          onClick={this.handleUploadClick}
        >
          ↑
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
