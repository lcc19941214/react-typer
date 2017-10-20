import React, { Component } from 'react';
import { EditorState, Modifier } from 'draft-js';
import { findDOMNode } from 'react-dom';
import { modifierToolStore, displayToolStore, closeLinkDisplayTool } from './store';
import decorateComponentWithProps from 'decorate-component-with-props';
import classnames from 'classnames';
import { computePopoverPosition, showLinkModifierTool } from './util';
import { forceSelect } from '../../utils/selection';

class LinkDisplayTool extends Component {
  state = {
    position: {},
    visible: false
  };

  componentWillMount() {
    this.props.store.subscribeToItem('visible', this.handleToggleVisible);
    document.addEventListener('click', this.handleClose);
  }

  componentWillUnmount() {
    this.props.store.unsubscribeFromItem('visible', this.handleToggleVisible);
    document.removeEventListener('click', this.handleClose);
  }

  getDOMNode = () => findDOMNode(this);

  getPosition = selectionRect => {
    const position = computePopoverPosition(selectionRect, this.getDOMNode(), {
      left: -2
    });
    return position;
  };

  handleToggleVisible = visible => {
    let position = {};
    if (visible) {
      this.preventNextClose = true;
      const focusLink = this.props.store.getItem('focusLink');
      position = this.getPosition(focusLink.getBoundingClientRect());
    }
    this.setState({ visible, position });
  };

  onPopoverClick = e => {
    e.preventDefault();
    e.stopPropagation();
    this.preventNextClose = true;
  };

  handleClose = () => {
    if (!this.preventNextClose && this.state.visible) {
      closeLinkDisplayTool();
    }
    this.preventNextClose = false;
  };

  handleEdit = () => {
    const { store, modifierToolStore } = this.props;
    this.handleClose();
    const editor = store.getItem('getEditor')();
    showLinkModifierTool(editor.state.editorState, modifierToolStore);
  };

  handleDelete = () => {
    const { store } = this.props;
    const editor = store.getItem('getEditor')();
    const entity = store.getItem('entity') || {};
    let editorState = editor.state.editorState;
    let selection = editorState.getSelection();
    if (entity.range) {
      const { start, end } = entity.range;
      selection = selection.merge({
        anchorOffset: start,
        focusOffset: end
      });
      editorState = EditorState.forceSelection(editorState, selection);
      const newContentState = Modifier.applyEntity(
        editorState.getCurrentContent(),
        selection,
        null
      );
      const nextEditorState = EditorState.push(editorState, newContentState, 'apply-entity');
      const editorStateWithSelectEnd = forceSelect(nextEditorState, end, end);
      editor.changeState(editorStateWithSelectEnd, () => {
        this.setState({ position: {} });
        editor.focus();
      });
      this.handleClose();
    }
  };

  render() {
    const { className, store } = this.props;
    const { position, visible } = this.state;
    const url = store.getItem('url');
    return (
      <div
        className={classnames('react-typer__link-modifier', className, {
          'react-typer__link-modifier__hidden': !visible
        })}
        onMouseDown={this.onPopoverClick}
        style={{
          ...{ top: position.top, left: position.left, transformOrigin: position.transformOrigin }
        }}
      >
        <div className="link-modifier__inner">
          <div className="link-modifier__display">
            <div className="link-wrapper">
              <a href={url} target="_blank">
                {url}
              </a>
            </div>
            <span
              key="edit"
              className="link-modifier__button link-modifier__button-edit"
              onClick={this.handleEdit}
            />
            <span
              key="delete"
              className="link-modifier__button link-modifier__button-delete"
              onClick={this.handleDelete}
            />
          </div>
        </div>
      </div>
    );
  }
}

export default decorateComponentWithProps(LinkDisplayTool, {
  store: displayToolStore,
  modifierToolStore
});
