import React, { Component } from 'react';
import decorateComponentWithProps from 'decorate-component-with-props';
import classnames from 'classnames';
import { showLinkModifierTool } from './util';
import { modifierToolStore, displayToolStore, closeLinkDisplayTool } from './store';
import LinkModifierTool from './linkModifierTool';
import LinkDisplayTool from './linkDisplayTool';
import './linkModifier.less';

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
      store.updateItem('range', {});
      store.updateItem('entity', {});
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

WrappedLinkModifier.LinkModifierTool = LinkModifierTool;
WrappedLinkModifier.LinkDisplayTool = LinkDisplayTool;

export default WrappedLinkModifier;
