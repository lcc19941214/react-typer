import React, { Component } from 'react';
import { Modifier, EditorState } from 'draft-js';
import classnames from 'classnames';
import { Map } from 'immutable';
import * as BlockType from '../constants/blockType';

const isAlignmentBlock = type =>
  Object.keys(BlockType.BASIC_BLOCKS).some(key => BlockType.BASIC_BLOCKS[key] === type);

export default class TextAlignment extends Component {
  handleApplyStyle = (textAlign) => {
    const { editorState, changeState } = this.props;

    const selection = editorState.getSelection();
    const contentState = editorState.getCurrentContent();

    const blockData = Map({ textAlign });

    const nextContentState = Modifier.mergeBlockData(contentState, selection, blockData);
    const nextEditorState = EditorState.push(editorState, nextContentState, 'change-block-data');
    changeState(nextEditorState);
  };

  getActive = (editorState, textAlignProp) => {
    const contentState = editorState.getCurrentContent();
    const selection = editorState.getSelection();
    const focusKey = selection.getFocusKey();
    const contentBlock = contentState.getBlockForKey(focusKey);
    if (isAlignmentBlock(contentBlock.getType())) {
      let textAlign = contentBlock.getData().get('textAlign');
      if (typeof textAlign === 'undefined') {
        const preContentBlock = contentState.getBlockBefore(focusKey);
        if (preContentBlock && preContentBlock.getData().get('textAlign')) {
          textAlign = preContentBlock.getData().get('textAlign');
        } else {
          textAlign = 'left';
        }
        setTimeout(() => {
          this.handleApplyStyle(textAlign);
        }, 10);
      }
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
          'RichEditor-toolbar-button',
          `RichEditor-toolbar-button-${controlKey}`,
          {
            'RichEditor-toolbar-button__active': this.getActive(editorState, textAlign)
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
