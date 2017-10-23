import { modifierToolStore, displayToolStore, closeLinkDisplayTool } from '../components/linkModifier/store';
import { showLinkModifierTool } from '../components/linkModifier/util';

export default {
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
