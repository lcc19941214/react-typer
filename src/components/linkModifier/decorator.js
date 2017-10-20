import { modifierToolStore, displayToolStore, closeLinkDisplayTool } from './store';
import { isLinkEntity, getLinkDOMOnEdge, getLinkEntityRange, omitConnectedEntity } from './util';
import { resetMockSelection } from '../../utils/selection';

function openLinkDisplayTool(contentState, contentBlock, offset, cb) {
  getLinkEntityRange(contentState, contentBlock, (entityRange, index, ranges) => {
    const { start, end } = entityRange;
    if (cb(entityRange)) {
      if (omitConnectedEntity(offset, { start, end }, index, ranges)) {
        return;
      }

      var s = window.getSelection();
      if (s.rangeCount > 0) {
        var r = s.getRangeAt(0);
        const linkEl = getLinkDOMOnEdge(r, offset, entityRange);
        if (linkEl) {
          displayToolStore.updateItem('focusLink', linkEl);
          displayToolStore.updateItem('entity', { range: entityRange });
        }
      }
    }
  });
}

const toggleDisplayToolVisible = (editorState, selection) => {
  const contentState = editorState.getCurrentContent();
  const focusKey = selection.getFocusKey();
  const contentBlock = contentState.getBlockForKey(focusKey);
  const focusOffset = selection.getFocusOffset();
  const startOffset = selection.getStartOffset();
  const endOffset = selection.getEndOffset();
  if (!selection.isCollapsed()) {
    const entityKey = contentBlock.getEntityAt(focusOffset);
    if (entityKey && isLinkEntity(contentState.getEntity(entityKey))) {
      openLinkDisplayTool(
        contentState,
        contentBlock,
        { startOffset, endOffset },
        ({ start, end }) => start <= startOffset && endOffset <= end
      );
    } else {
      closeLinkDisplayTool();
    }
  } else {
    let entityKey = contentBlock.getEntityAt(focusOffset);
    if (entityKey === null) entityKey = contentBlock.getEntityAt(startOffset - 1);
    if (entityKey && isLinkEntity(contentState.getEntity(entityKey))) {
      openLinkDisplayTool(
        contentState,
        contentBlock,
        { startOffset, endOffset },
        ({ start, end }) => start <= startOffset && startOffset <= end
      );
    } else {
      closeLinkDisplayTool();
    }
  }
};

export default (() => {
  let preSelection = null;
  return (target, key, descriptor) => {
    const fn = descriptor.value;
    descriptor.value = function(...args) {
      const ctx = this;
      const editorState = args[0];
      displayToolStore.updateItem('getEditor', this.getEditor);

      const selection = editorState.getSelection();
      if (!preSelection) preSelection = selection;
      if (!preSelection.getHasFocus() && selection.getHasFocus()) {
        resetMockSelection();
        modifierToolStore.updateItem('visible', false);
      }
      preSelection = selection;

      toggleDisplayToolVisible(editorState, selection);

      // TODO
      // set it to IMMUTABLE when focusOffset is at end of a link entity
      // and then set it back to MUTABLE

      // REMIND
      // if a entity is IMMUTABLE, this contentBlock is not editable

      const rst = fn.apply(ctx, args);
      return rst;
    };
    return descriptor;
  };
})();
