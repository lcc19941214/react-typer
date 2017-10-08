// editor decorator
import React from 'react';
import classnames from 'classnames';
import Label from '../components/inlines/label';
import * as BlockType from '../constants/blockType';

// strategy
export function findLabel(contentBlock, callback, contentState) {
  contentBlock.findEntityRanges(character => {
    const entityKey = character.getEntity();
    return (
      entityKey !== null && contentState.getEntity(entityKey).getType() === BlockType.LABEL_BLOCK
    );
  }, callback);
}


// decorator
const decorator = [
  {
    strategy: findLabel,
    component: Label
  }
];

export default decorator;
