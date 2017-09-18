import React, { Component } from 'react';
import classnames from 'classnames';
import Popover from './popover';

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

  handleOnClose = () => {
    this.setState(({ active }) => ({ active: false }));
  };

  addImage = () => {
    const { editorState, onChange, focus } = this.props;
    const { url } = this.state;
    if (url && (/^https?:\/\/.+/.test(url) || /data:image\/.+/.test(url))) {
      onChange(this.props.modifier(editorState, url), focus);
      this.Popover.close();
      this.setState({ url: '' });
    }
  };

  changeUrl = evt => {
    this.setState({ url: evt.target.value });
  };

  render() {
    const { active, url } = this.state;
    return (
      <div className="RichEditor-toolbar__add-image">
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
          ref={ref => (this.Popover = ref)}
          placement="bottom"
          onClose={this.handleOnClose}
        >
          <input
            type="text"
            placeholder="http://"
            className="RichEditor-toolbar__add-image__input"
            onChange={this.changeUrl}
            value={url}
          />
          <span
            className="RichEditor-toolbar__add-image__confirm-button"
            onClick={this.addImage}
          >
            +
          </span>
        </Popover>
      </div>
    );
  }
}
