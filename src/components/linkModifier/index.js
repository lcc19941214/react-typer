import React, { Component } from 'react';
import decorateComponentWithProps from 'decorate-component-with-props';
import { getVisibleSelectionRect } from 'draft-js';
import classnames from 'classnames';
import { modifierToolStore, displayToolStore, closeLinkDisplayTool } from './store';
import { getLinkEntityURL, getLinkDOMOnEdge, getLinkEntityRange } from './util';
import { getSelectedTextNodes } from '../../utils/selection';
import './linkModifier.less';

const getLinkEntityRangeWithOffset = (contentState, contentBlock, offset, url, store) => {
  getLinkEntityRange(contentState, contentBlock, offset, (start, end) => {
    var s = window.getSelection();
    if (s.rangeCount > 0) {
      var r = s.getRangeAt(0);
      const linkEl = getLinkDOMOnEdge(r, offset, { start, end });
      if (linkEl) {
        const { startOffset, endOffset } = offset;
        // keep this order!
        store.updateItem('range', {
          range: r,
          container: linkEl
        });
        store.updateItem('selectionRect', linkEl.getBoundingClientRect());
        store.updateItem('selectedTextNodes', [linkEl]);
        store.updateItem('selection', { startOffset, endOffset });
        store.updateItem('visible', true);
        store.updateItem('url', url);
        s.removeAllRanges();
      }
    }
  });
};

const showLinkModifierTool = (editorState, store) => {
  const selection = editorState.getSelection();
  const contentState = editorState.getCurrentContent();
  const startOffset = selection.getStartOffset();
  const endOffset = selection.getEndOffset();
  const offset = { startOffset, endOffset };
  if (!selection.isCollapsed()) {
    const startKey = selection.getStartKey();
    const contentBlock = contentState.getBlockForKey(startKey);
    const entityKey = contentBlock.getEntityAt(startOffset);

    // TODO
    // if endOffset has no entity, extend selection with currentSelection and the link
    if (entityKey) {
      const url = getLinkEntityURL(contentState, entityKey);
      if (url) {
        getLinkEntityRangeWithOffset(contentState, contentBlock, offset, url, store);
      }
    } else {
      var s = window.getSelection();
      if (s.rangeCount > 0) {
        var r = s.getRangeAt(0);
        // keep this order!
        store.updateItem('range', {
          range: r,
          container: r.startContainer.parentElement
        });
        store.updateItem('selectionRect', getVisibleSelectionRect(window));
        store.updateItem('selectedTextNodes', getSelectedTextNodes());
        store.updateItem('selection', { startOffset, endOffset });
        store.updateItem('visible', true);
        store.updateItem('url', '');
      }
    }
  } else {
    // if selection is collapsed, use focusKey instead of anchorKey or startKey
    // if focus character has an link entity, then select this piece of characters
    const focusKey = selection.getFocusKey();
    const contentBlock = contentState.getBlockForKey(focusKey);

    // 优先取当前entity的offset，如果没有，则减少一个offset取前一个character所属的entity
    let entityKey = contentBlock.getEntityAt(startOffset);
    if (entityKey === null) entityKey = contentBlock.getEntityAt(startOffset - 1);
    if (entityKey) {
      const url = getLinkEntityURL(contentState, entityKey);
      if (url) {
        getLinkEntityRangeWithOffset(contentState, contentBlock, offset, url, store);
      }
    }
  }
};

class LinkModifier extends Component {
  state = {
    active: false
  };

  componentWillMount() {
    this.props.store.subscribeToItem('visible', this.handleOnButtonActive);
  }

  componentWillUnmount() {
    this.props.store.unsubscribeFromItem('visible', this.handleOnButtonActive);
  }

  handleOnButtonActive = visible => {
    this.setState({ active: visible });
  };

  toggleLinkModifierTool = e => {
    e.preventDefault();
    const { store, getEditor } = this.props;
    const { active } = this.state;
    const editor = getEditor();
    const editorState = editor.state.editorState;
    const focus = editor.focus;

    store.updateItem('getEditor', getEditor);

    if (displayToolStore.getItem('visible')) {
      closeLinkDisplayTool();
    }

    if (active) {
      // keep this order!
      store.updateItem('visible', false);
      store.updateItem('url', '');
      store.updateItem('range', null);
      store.updateItem('selectionRect', null);
      store.updateItem('selectedTextNodes', []);
      store.updateItem('selection', {});
      focus();
    } else {
      showLinkModifierTool(editorState, store);
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
      getEditor,
      store,
      displayToolStore,
      ...extraProps
    } = this.props;
    const { active } = this.state;
    return (
      <span
        className={classnames('RichEditor-button', `RichEditor-button-${controlKey}`, {
          'RichEditor-button__active': active
        })}
        {...extraProps}
        onMouseDown={this.toggleLinkModifierTool}
      />
    );
  }
}

const WrappedLinkModifier = decorateComponentWithProps(LinkModifier, {
  store: modifierToolStore,
  displayToolStore
});

WrappedLinkModifier.showLinkModifierTool = showLinkModifierTool;

export default WrappedLinkModifier;
