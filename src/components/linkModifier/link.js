import React, { Component } from 'react';
import decorateComponentWithProps from 'decorate-component-with-props';
import { findDOMNode } from 'react-dom';
import { LINK as LINK_STYLE } from '../../defaultEditorOptions/inlineStyles';
import { modifierToolStore, displayToolStore } from './store';

class Link extends Component {
  componentWillMount() {
    this.props.store.subscribeToItem('focusLink', this.toggleDisplayToolVisible);
  }

  componentWillUnmount() {
    this.props.store.unsubscribeFromItem('focusLink', this.toggleDisplayToolVisible);
  }

  getDOMNode = () => findDOMNode(this);
  getEntityData = () => {
    const { contentState, entityKey } = this.props;
    const data = contentState.getEntity(entityKey).getData();
    return data;
  }

  toggleDisplayToolVisible = (elem) => {
    if (this.getDOMNode() === elem) {
      const { store } = this.props;
      store.updateItem('visible', true);
      store.updateItem('url', this.getEntityData().url);
    }
  }

  render() {
    const { url } = this.getEntityData();
    return (
      <a data-link-block={true} style={LINK_STYLE} className="RichEditor-style__link" href={url}>
        {this.props.children}
      </a>
    );
  }
}

export default decorateComponentWithProps(Link, {
  store: displayToolStore,
  modifierToolStore
});
