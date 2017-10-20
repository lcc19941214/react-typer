import React, { Component } from 'react';
import { findDOMNode } from 'react-dom';
import { EditorState, Modifier } from 'draft-js';
import decorateComponentWithProps from 'decorate-component-with-props';
import classnames from 'classnames';
import { modifierToolStore } from './store';
import * as BlockType from '../../constants/blockType';
import { computePopoverPosition } from './util';
import { toggleSelectRangeBackgroundColor, getTextNode, forceSelect } from '../../utils/selection';

const URL_REGEXP = /^((https?|ftp|file):\/\/)?[-a-zA-Z0-9@:%._+~#=]{2,256}\.[a-z]{2,6}[-a-zA-Z0-9@:%_+.~#?&/=]*$/;

function createLinkEntity (editorState, url) {
  const contentState = editorState.getCurrentContent();
  const selection = editorState.getSelection();
  const contentStateWithEntity = contentState.createEntity(BlockType.LINK, 'MUTABLE', { url });
  const entityKey = contentStateWithEntity.getLastCreatedEntityKey();
  return applyLinkEntity(editorState, selection, entityKey);
};

function applyLinkEntity (editorState, selection, entityKey) {
  const newContentState = Modifier.applyEntity(
    editorState.getCurrentContent(),
    selection,
    entityKey
  );
  const nextEditorState = EditorState.push(editorState, newContentState, 'apply-entity');
  return nextEditorState;
};

function extendLinkSelectionRange (editor, editorState, entityRange, selection) {
  if (!entityRange) return editorState;
  const { start, end } = entityRange;
  const { startOffset, endOffset } = selection;
  if (start < startOffset && endOffset < end) return forceSelect(editorState, start, end);
  return editorState;
};

class LinkModifierTool extends Component {
  preventNextClose = false;
  clearShowErrorShake = false;
  state = {
    url: '',
    visible: false,
    position: {},
    showError: false
  };

  componentWillMount() {
    this.props.store.subscribeToItem('visible', this.handleToggleVisible);
    this.props.store.subscribeToItem('url', this.updateURL);
    this.props.store.subscribeToItem('selectionRect', this.getPosition);
    document.addEventListener('click', this.handleClose);
  }

  componentWillUnmount() {
    this.props.store.unsubscribeFromItem('visible', this.handleToggleVisible);
    this.props.store.unsubscribeFromItem('url', this.updateURL);
    this.props.store.unsubscribeFromItem('selectionRect', this.getPosition);
    document.removeEventListener('click', this.handleClose);
  }

  getDOMNode = () => findDOMNode(this);
  getInputDOMNode = () => findDOMNode(this.Input);
  getPosition = selectionRect => {
    const position = computePopoverPosition(selectionRect, this.getDOMNode(), {
      top: 2,
      left: -15
    });
    this.setState({ position });
  };

  handleToggleVisible = visible => {
    const { store } = this.props;
    const selectedTextNodes = store.getItem('selectedTextNodes');
    const { range, container: rangeContainer } = store.getItem('range');

    if (selectedTextNodes.length) {
      if (selectedTextNodes.length === 1 && selectedTextNodes[0] === rangeContainer) {
        const s = window.getSelection();
        s.removeAllRanges();
        const r = document.createRange();
        const textNode = getTextNode(selectedTextNodes[0]);
        r.selectNodeContents(textNode);
        selectedTextNodes[0] = textNode;
        toggleSelectRangeBackgroundColor(selectedTextNodes, r);
      } else {
        toggleSelectRangeBackgroundColor(selectedTextNodes, range);
      }
    }

    if (visible) {
      // fix range dislocation after show popover
      const s = window.getSelection();
      s.removeAllRanges();
      this.preventNextClose = true;

      setTimeout(() => {
        const input = this.getInputDOMNode();
        input.focus();
        if (input.value) {
          input.select();
        }
      }, 10);
    } else {
      store.updateItem('url', '');
      store.updateItem('range', {});
      store.updateItem('entity', {});
      store.updateItem('selectionRect', null);
      store.updateItem('selectedTextNodes', []);
      store.updateItem('selection', {});
    }
    this.setState({ visible });
  };

  onPopoverClick = e => {
    e.stopPropagation();
    this.preventNextClose = true;
  };

  handleClose = () => {
    if (!this.preventNextClose && this.state.visible) {
      this.props.store.updateItem('visible', false);
    }
    this.preventNextClose = false;
  };

  handleConfirm = () => this.handleApplyLink(this.state.url);
  handleInputOnChange = e => {
    this.setState({ url: e.target.value, showError: false });
  };
  handleInputKeyDown = e => {
    if (e.keyCode === 13) {
      e.preventDefault();
      this.handleApplyLink(this.state.url);
    }
  };

  handleApplyLink = url => {
    if (url && URL_REGEXP.test(url)) {
      const urlValue = url.match(/^(https?:\/\/)/) ? url : `http://${url}`;

      const { store } = this.props;
      const selection = store.getItem('selection') || {};
      const entity = store.getItem('entity') || {};
      const editor = store.getItem('getEditor')();
      const { endOffset } = selection;

      const editorState = extendLinkSelectionRange(
        editor,
        editor.state.editorState,
        entity.range,
        selection
      );
      const editorStateWithLink = createLinkEntity(editorState, urlValue);
      const editorStateWithSelectEnd = forceSelect(editorStateWithLink, endOffset, endOffset);

      editor.changeState(editorStateWithSelectEnd, () => {
        this.setState({ position: {} });
        editor.focus();
      });
      this.handleClose();
    } else {
      this.setState({ showError: true, showErrorShake: true }, () => {
        this.getInputDOMNode().select();
        setTimeout(() => {
          this.setState({ showErrorShake: false });
        }, 500);
      });
    }
  };

  updateURL = url => this.setState({ url, showError: url && !URL_REGEXP.test(url) });

  render() {
    const { position, showError, showErrorShake, url, visible } = this.state;
    const { className } = this.props;
    return (
      <div
        className={classnames('react-typer__link-modifier', className, {
          'react-typer__link-modifier__hidden': !visible
        })}
        style={{
          ...{ top: position.top, left: position.left, transformOrigin: position.transformOrigin }
        }}
        onClick={this.onPopoverClick}
      >
        <div
          className={classnames('link-modifier__inner', {
            'link-modifier__status-error': showError,
            'link-modifier__status-shake': showErrorShake
          })}
        >
          <div className="link-modifier__arrow" style={{ left: position.arrowOffsetLeft }} />
          <div className="link-modifier__edit">
            <input
              ref={ref => (this.Input = ref)}
              type="text"
              placeholder="输入链接，回车确认"
              value={url}
              onChange={this.handleInputOnChange}
              onKeyDown={this.handleInputKeyDown}
            />
            <span
              key="confirm"
              className="link-modifier__button link-modifier__button-confirm link-modifier__button__solid"
              onClick={this.handleConfirm}
            />
          </div>
        </div>
      </div>
    );
  }
}

export default decorateComponentWithProps(LinkModifierTool, { store: modifierToolStore });
