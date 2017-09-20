import React, { Component } from 'react';
import classnames from 'classnames';
import { EditorState } from 'draft-js';
import Popover from './popover';
import { PLUGINS } from '../plugins/';

const { imagePlugin } = PLUGINS;

const noop = () => {};

export default class AddImageLink extends Component {
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

  addImage = (...args) => {
    const url = args[0];
    let extraData = {};
    let cb = args[1] || noop;

    if (args.length > 2) {
      extraData = args[1] || {};
      cb = args[2] || noop;
    }

    const { editorState, onChange, focus } = this.props;
    onChange(imagePlugin.addImage(editorState, url, extraData), focus);
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
      this.addImage(url, { uploading: true }, () => {
        const { editorState, onChange, focus, blur } = this.props;
        const contentState = editorState.getCurrentContent();
        const entityKey = contentState.getLastCreatedEntityKey();

        // release url
        setTimeout(() => {
          URL.revokeObjectURL(url);
        }, 1000);

        // TODO
        // upload file to remote server and replace placeholder src
        setTimeout(() => {
          const toMergeData = {
            // src: 'https://avatars2.githubusercontent.com/u/12473993?v=4&s=88',
            uploading: false
          };

          // use blur now and focus later on to make rerender and change the image src
          blur();
          const nextContentState = this.props.editorState
            .getCurrentContent()
            .mergeEntityData(entityKey, toMergeData);
          onChange(EditorState.push(this.props.editorState, nextContentState), focus);
        }, 2000);
      });
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

export class UploadImage extends Component {
  render() {
    return <div />;
  }
}
