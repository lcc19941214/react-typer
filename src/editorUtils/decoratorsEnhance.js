// editor decorator
import React from 'react';
import classnames from 'classnames';
import * as EntityType from '../constants/entity';

// strategy
export function findLabel(contentBlock, callback, contentState) {
  contentBlock.findEntityRanges(character => {
    const entityKey = character.getEntity();
    return (
      entityKey !== null && contentState.getEntity(entityKey).getType() === EntityType.LABEL_BLOCK
    );
  }, callback);
}


// component
export const Label = props => {
  const data = props.contentState.getEntity(props.entityKey).getData();
  const { label, highlight } = data;
  return (
    <span className={classnames(
      'RichEditor-style-block__label',
      {
        'RichEditor-style-block__label__highlight': highlight
      }
    )}
      data-highlight={!!highlight}>
      {props.children}
    </span>
  );
};


// decorator
const decorator = [
  {
    strategy: findLabel,
    component: Label
  }
];

export default decorator;
