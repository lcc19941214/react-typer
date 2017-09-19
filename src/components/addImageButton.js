import React, { Component } from 'react';
import classnames from 'classnames';
import Popover from './popover';
import { PLUGINS } from '../plugins/';

const { imagePlugin } = PLUGINS;

const noop = () => {};

export default class AddImage extends Component {
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
    document.querySelector('.add-image__input').focus();
  };

  handleOnClose = () => {
    this.setState(({ active }) => ({ active: false }));
  };

  addImage = (url, cb = noop) => {
    const { editorState, onChange, focus } = this.props;
    onChange(imagePlugin.addImage(editorState, url), focus);
    this.Popover.close();
    cb();
  };

  changeURL = e => {
    const url = e.target.value;
    this.setState({ url });
  };

  handleConfirm = () => {
    const { url } = this.state;
    if (url && (/^https?:\/\/.+/.test(url) || /data:image\/.+/.test(url))) {
      this.addImage(url, () => {
        this.setState({ url: '' });
      });
    }
  };

  handleUploadClick = () => {
    this.uploadInput.value = null;
    this.uploadInput.click();
  };

  handleOnUpload = e => {
    const file = e.target.files[0];
    if (file.type.includes('image/')) {
      const url = URL.createObjectURL(file);
      this.addImage(url, () => {
        setTimeout(() => {
          URL.revokeObjectURL(url);
        }, 2000);
      });

      // TODO
      // upload file to remote server
    }
  };

  render() {
    const { active, url } = this.state;
    return (
      <div className="RichEditor-toolbar__add-image RichEditor-toolbar-button__wrapped">
        <span
          className={classnames(
            'RichEditor-toolbar-button',
            'RichEditor-toolbar__add-image__button',
            {
              'RichEditor-toolbar-button__active': active
            }
          )}
          onClick={this.onToggle}
        >
          +
        </span>
        <Popover
          className="RichEditor-toolbar__add-image__popover"
          ref={ref => (this.Popover = ref)}
          placement="bottom"
          onOpen={this.handleOnOpen}
          onClose={this.handleOnClose}
        >
          <input
            type="text"
            placeholder="http://"
            className="add-image__input"
            onChange={this.changeURL}
            value={url}
          />
          <span
            className="add-image__button add-image__confirm-button"
            onClick={this.handleConfirm}
          >
            +
          </span>
          <span
            className="add-image__button add-image__upload-button"
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
        </Popover>
      </div>
    );
  }
}
