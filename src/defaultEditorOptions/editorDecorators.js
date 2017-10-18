// editor decorator
import React from 'react';
import classnames from 'classnames';
import Label from '../components/inlines/label';
import Link from '../components/linkModifier/link';
import * as BlockType from '../constants/blockType';

// strategy
export function labelStrategy(contentBlock, callback, contentState) {
  contentBlock.findEntityRanges(character => {
    const entityKey = character.getEntity();
    return (
      entityKey !== null && contentState.getEntity(entityKey).getType() === BlockType.LABEL_BLOCK
    );
  }, callback);
}

export function linkStrategy(contentBlock, callback, contentState) {
  contentBlock.findEntityRanges(character => {
    const entityKey = character.getEntity();
    return entityKey !== null && contentState.getEntity(entityKey).getType() === BlockType.LINK;
  }, callback);
}

// decorator
const decorator = [
  {
    strategy: labelStrategy,
    component: Label
  },
  {
    strategy: linkStrategy,
    component: Link
  }
];

export default decorator;
