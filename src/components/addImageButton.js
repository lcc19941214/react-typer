import React, { Component } from 'react';
import classnames from 'classnames';

export default class AddImage extends Component {
  // Start the popover closed
  state = {
    url: '',
    open: false
  };

  // When the popover is open and users click anywhere on the page,
  // the popover should close
  componentDidMount() {
    document.addEventListener('click', this.closePopover);
  }

  componentWillUnmount() {
    document.removeEventListener('click', this.closePopover);
  }

  // Note: make sure whenever a click happens within the popover it is not closed
  onPopoverClick = () => {
    this.preventNextClose = true;
  };

  openPopover = () => {
    if (!this.state.open) {
      this.preventNextClose = true;
      this.setState(
        {
          open: true
        },
        () => {
          document.querySelector('.RichEditor-toolbar__add-image__input').focus();
        }
      );
    }
  };

  closePopover = () => {
    if (!this.preventNextClose && this.state.open) {
      this.setState({
        open: false
      });
    }

    this.preventNextClose = false;
  };

  addImage = () => {
    const { editorState, onChange, focus } = this.props;
    const { url } = this.state;
    if (url && (/^https?:\/\/.+/.test(url) || /data:image\/.+/.test(url))) {
      onChange(this.props.modifier(editorState, url), focus);
      this.closePopover();
      this.setState({ url: '' });
    }
  };

  changeUrl = evt => {
    this.setState({ url: evt.target.value });
  };

  render() {
    const { open, url } = this.state;
    return (
      <div className="RichEditor-toolbar__add-image">
        <span
          className={classnames(
            'RichEditor-toolbar-button',
            'RichEditor-toolbar__add-image__button',
            {
              'RichEditor-toolbar-button__active': open
            }
          )}
          onClick={this.openPopover}
        >
          +
        </span>
        <div
          className={classnames('RichEditor-toolbar__add-image__popover', {
            'RichEditor-popover__hidden': !open
          })}
          onClick={this.onPopoverClick}
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
        </div>
      </div>
    );
  }
}
