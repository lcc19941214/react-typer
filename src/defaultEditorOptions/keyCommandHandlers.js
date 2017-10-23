import { findDOMNode } from 'react-dom';
import {
  modifierToolStore,
  displayToolStore,
  closeLinkDisplayTool
} from '../components/linkModifier/store';
import { showLinkModifierTool } from '../components/linkModifier/util';
import { applyAlignment } from '../components/textAlignment';

function applyTextAlignment(getEditor, textAlign) {
  const editor = getEditor();
  const nextEditorState = applyAlignment(editor.state.editorState, textAlign);
  editor.changeState(nextEditorState, editor.focus);
}

export default {
  ul: (command, editorState, getEditor) => {
    const editor = getEditor();
    editor.toggleToolbar('unordered-list-item', 'block', editor.focus);
  },
  ol: (command, editorState, getEditor) => {
    const editor = getEditor();
    editor.toggleToolbar('ordered-list-item', 'block', editor.focus);
  },
  textAlignLeft: (command, editorState, getEditor) => applyTextAlignment(getEditor, 'left'),
  textAlignCenter: (command, editorState, getEditor) => applyTextAlignment(getEditor, 'center'),
  textAlignRight: (command, editorState, getEditor) => applyTextAlignment(getEditor, 'right'),
  textAlignJustify: (command, editorState, getEditor) => applyTextAlignment(getEditor, 'justify'),
  imageUpload: (command, editorState, getEditor) => {
    const editor = getEditor();
    const editorDOM = findDOMNode(editor);
    const upload = editorDOM.querySelector('input[accept="image/*"]');
    upload.value = null;
    upload.click();
  },
  link: (command, editorState, getEditor) => {
    modifierToolStore.updateItem('getEditor', getEditor);

    const editor = getEditor();
    const focus = editor.focus;

    if (displayToolStore.getItem('visible')) {
      closeLinkDisplayTool();
    }

    if (modifierToolStore.getItem('visible')) {
      modifierToolStore.updateItem('visible', false);
      modifierToolStore.updateItem('url', '');
      modifierToolStore.updateItem('range', {});
      modifierToolStore.updateItem('entity', {});
      modifierToolStore.updateItem('selectionRect', null);
      modifierToolStore.updateItem('selectedTextNodes', []);
      modifierToolStore.updateItem('selection', {});
      focus();
    } else {
      showLinkModifierTool(editorState, modifierToolStore);
    }
  }
};
