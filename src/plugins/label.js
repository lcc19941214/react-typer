import React, { Component } from 'react';
import classnames from 'classnames';
import { EditorState, AtomicBlockUtils } from 'draft-js';

// type
const TYPE = 'label';

// action
export const addLabel = (label, editorState, extraData = {}) => {
  const entityType = TYPE;
  const contentState = editorState.getCurrentContent();
  const contentStateWithEntity = contentState.createEntity(entityType, 'IMMUTABLE', {
    label,
    ...extraData
  });
  const entityKey = contentStateWithEntity.getLastCreatedEntityKey();
  const newEditorState = AtomicBlockUtils.insertAtomicBlock(editorState, entityKey, ' ');
  return newEditorState;
};

// atomic element
class LabelBlock extends Component {
  render() {
    const { block, ...otherProps } = this.props;
    const {
      blockProps, // eslint-disable-line no-unused-vars
      customStyleMap, // eslint-disable-line no-unused-vars
      customStyleFn, // eslint-disable-line no-unused-vars
      decorator, // eslint-disable-line no-unused-vars
      forceSelection, // eslint-disable-line no-unused-vars
      offsetKey, // eslint-disable-line no-unused-vars
      selection, // eslint-disable-line no-unused-vars
      tree, // eslint-disable-line no-unused-vars
      contentState,
      ...elementProps
    } = otherProps;
    const data = contentState.getEntity(block.getEntityAt(0)).getData();
    const { label, highlight } = data;
    console.log(blockProps.isFocused);
    console.log(this.props);
    return (
      <span
        className={classnames('RichEditor-style-block__label', {
          'RichEditor-style-block__label__highlight': highlight
        })}
        data-highlight={!!highlight}
      >
        {label}
      </span>
    );
  }
}

// plugin
const createLabelBlockPlugin = (config = {}) => {
  const component = config.decorator ? config.decorator(LabelBlock) : LabelBlock;
  return {
    blockRendererFn: (block, { getEditorState }) => {
      if (block.getType() === 'atomic') {
        const contentState = getEditorState().getCurrentContent();
        const entity = contentState.getEntity(block.getEntityAt(0));
        const type = entity.getType();
        if (type === TYPE) {
          return {
            component: LabelBlock,
            editable: false
          };
        }
      }

      return null;
    },
    addLabel
  };
};

export default createLabelBlockPlugin;
