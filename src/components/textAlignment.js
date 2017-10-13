import React, { Component } from 'react';
import { Modifier, EditorState } from 'draft-js';
import classnames from 'classnames';
import { Map } from 'immutable';
import * as BlockType from '../constants/blockType';

const isAlignmentBlock = contentBlock =>
  contentBlock &&
  contentBlock.getType &&
  Object.keys(BlockType.BASIC_BLOCKS).some(
    key => BlockType.BASIC_BLOCKS[key] === contentBlock.getType()
  );

const checkChangeType = editorState => {
  const changeType = editorState.getLastChangeType();
  // using split-block will get a new line, and a new block doesn't have text-align data
  return ['split-block'].some(v => v === changeType);
};

const isInit = editorState => !editorState.getCurrentContent().hasText();

const applyAlignment = (editorState, textAlign) => {
  const selection = editorState.getSelection();
  const contentState = editorState.getCurrentContent();

  const blockData = Map({ textAlign });

  const nextContentState = Modifier.mergeBlockData(contentState, selection, blockData);
  const nextEditorState = EditorState.push(editorState, nextContentState, 'change-block-data');
  return nextEditorState;
};

export const setAlignmentDecorator = (target, key, descriptor) => {
  const fn = descriptor.value;
  descriptor.value = function(...args) {
    const ctx = this;
    const editorState = args[0];

    if (checkChangeType(editorState) || isInit(editorState)) {
      const contentState = editorState.getCurrentContent();
      const selection = editorState.getSelection();
      const focusKey = selection.getFocusKey();
      const contentBlock = contentState.getBlockForKey(focusKey);

      if (isAlignmentBlock(contentBlock)) {
        let textAlign = contentBlock.getData().get('textAlign');
        if (typeof textAlign === 'undefined') {
          const preContentBlock = contentState.getBlockBefore(focusKey);
          if (preContentBlock && preContentBlock.getData().get('textAlign')) {
            textAlign = preContentBlock.getData().get('textAlign');
          } else {
            textAlign = 'left';
          }

          args[0] = applyAlignment(editorState, textAlign);
        }

        setTimeout(() => {
          const editorPlaceholder = document.querySelector('.public-DraftEditorPlaceholder-root');
          if (editorPlaceholder) {
            editorPlaceholder.style.textAlign = textAlign;
          }
        }, 10);
      }
    }

    const rst = fn.apply(ctx, args);
    return rst;
  };
  return descriptor;
};

export default class TextAlignment extends Component {
  handleApplyStyle = textAlign => {
    const { editorState, changeState, focus } = this.props;
    changeState(applyAlignment(editorState, textAlign), focus);
  };

  getActive = (editorState, textAlignProp) => {
    const contentState = editorState.getCurrentContent();
    const selection = editorState.getSelection();
    const focusKey = selection.getFocusKey();
    const contentBlock = contentState.getBlockForKey(focusKey);
    if (isAlignmentBlock(contentBlock)) {
      const textAlign = contentBlock.getData().get('textAlign');
      return textAlign === textAlignProp;
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
      textAlign,
      ...extraProps
    } = this.props;
    return (
      <span
        className={classnames(
          'RichEditor-button',
          `RichEditor-button-${controlKey}`,
          {
            'RichEditor-button__active': this.getActive(editorState, textAlign)
          }
        )}
        {...extraProps}
        onMouseDown={e => {
          e.preventDefault();
          this.handleApplyStyle(textAlign);
        }}
      />
    );
  }
}
