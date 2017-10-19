import { is } from 'immutable';
import { displayToolStore, closeLinkDisplayTool } from './store';
import { isLinkEntity, getLinkDOMOnEdge, getLinkEntityRange } from './util';

const openLinkDisplayToolWithFocusKey = (contentState, contentBlock, offset) => {
  getLinkEntityRange(contentState, contentBlock, offset, (start, end) => {
    var s = window.getSelection();
    if (s.rangeCount > 0) {
      var r = s.getRangeAt(0);
      const linkEl = getLinkDOMOnEdge(r, offset, { start, end });
      if (linkEl) {
        displayToolStore.updateItem('focusLink', linkEl);
      }
    }
  });
};

const openLinkDisplayToolWithSelection = (contentState, contentBlock, offset) => {
  const { startOffset, endOffset } = offset;
  contentBlock.findEntityRanges(
    character => {
      const entityKey = character.getEntity();
      return entityKey !== null && isLinkEntity(contentState.getEntity(entityKey));
    },
    (start, end) => {
      if (start <= startOffset && endOffset <= end) {
        var s = window.getSelection();
        if (s.rangeCount > 0) {
          var r = s.getRangeAt(0);
          const linkEl = getLinkDOMOnEdge(r, offset, { start, end });
          if (linkEl) {
            displayToolStore.updateItem('focusLink', linkEl);
          }
        }
      } else {
        closeLinkDisplayTool();
      }
    }
  );
};

export default (() => {
  return (target, key, descriptor) => {
    const fn = descriptor.value;
    descriptor.value = function(...args) {
      const ctx = this;
      const editorState = args[0];
      displayToolStore.updateItem('getEditor', this.getEditor);

      const selection = editorState.getSelection();
      const contentState = editorState.getCurrentContent();
      const startOffset = selection.getStartOffset();
      const endOffset = selection.getEndOffset();
      if (!selection.isCollapsed()) {
        const startKey = selection.getStartKey();
        const contentBlock = contentState.getBlockForKey(startKey);
        const entityKey = contentBlock.getEntityAt(startOffset);

        if (entityKey && isLinkEntity(contentState.getEntity(entityKey))) {
          openLinkDisplayToolWithSelection(contentState, contentBlock, {
            startOffset,
            endOffset
          });
        } else {
          closeLinkDisplayTool();
        }
      } else {
        // if selection is collapsed, use focusKey instead of anchorKey or startKey
        const focusKey = selection.getFocusKey();
        const contentBlock = contentState.getBlockForKey(focusKey);
        // 优先取当前entity的offset，如果没有，则减少一个offset取前一个character所属的entity
        let entityKey = contentBlock.getEntityAt(startOffset);
        if (entityKey === null) entityKey = contentBlock.getEntityAt(startOffset - 1);
        if (entityKey && isLinkEntity(contentState.getEntity(entityKey))) {
          openLinkDisplayToolWithFocusKey(contentState, contentBlock, {
            startOffset,
            endOffset
          });
        } else {
          closeLinkDisplayTool();
        }
      }

      // TODO
      // set it to IMMUTABLE when focusOffset is at end of a link entity
      // and then set it back to MUTABLE

      const rst = fn.apply(ctx, args);
      return rst;
    };
    return descriptor;
  };
})();
