import { getVisibleSelectionRect } from 'draft-js';
import * as BlockType from '../../constants/blockType';
import util from '../../utils/util';
import { getSelectedTextNodes } from '../../utils/selection';

const noop = () => {};

export const isLinkDOM = elem => elem && elem.dataset && elem.dataset.linkBlock;
export const isLinkEntity = entity => entity.getType() === BlockType.LINK;

// avoid repeated callback on tow connected link entity
export const omitConnectedEntity = ({ startOffset }, { start, end }, index, ranges) =>
  (ranges[index + 1] &&
    ranges[index + 1].start === end &&
    ranges[index + 1].start === startOffset) ||
  (ranges[index - 1] && ranges[index - 1].end === start && ranges[index - 1].start === startOffset);

// TODO
// update position onResize
export function computePopoverPosition(selectionRect, el, baseRect = {}) {
  if (!selectionRect) {
    return {};
  }
  const popoverWidth = 320;

  const relativeParent = util.getRelativeParent(el.parentElement) || document.body;
  const relativeRect = relativeParent.getBoundingClientRect();
  const { top, left, height } = selectionRect;
  const { top: baseTop = 0, left: baseLeft = 0 } = baseRect;
  const y = top - relativeRect.top + height + baseTop;
  let x = left - relativeRect.left + baseLeft;
  let arrowOffsetLeft = 10;

  const bodyRect =
    document.body === relativeParent ? relativeRect : document.body.getBoundingClientRect();
  if (x + relativeRect.left + popoverWidth > bodyRect.width) {
    const offsetLeft = bodyRect.width - popoverWidth - relativeRect.left;
    arrowOffsetLeft += x - offsetLeft;
    x = offsetLeft;
  }

  const position = {
    top: y,
    left: x,
    transformOrigin: `${arrowOffsetLeft}px top`,
    arrowOffsetLeft
  };
  return position;
}

export function getLinkEntityURL(contentState, entityKey) {
  let url = '';
  const entity = contentState.getEntity(entityKey);
  if (isLinkEntity(entity)) {
    url = entity.getData().url;
  }
  return url;
}

export function getLinkDOMNode(elem, direction = '') {
  if (!elem) {
    return null;
  }

  if (isLinkDOM(elem)) {
    return elem;
  }

  if (direction && ['previous', 'next'].includes(direction)) {
    switch (direction) {
      case 'previous':
        if (elem.previousElementSibling) {
          const pre = elem.previousElementSibling;
          if (isLinkDOM(pre)) return pre;
        }
        break;
      case 'next':
        if (elem.nextElementSibling) {
          const next = elem.nextElementSibling;
          if (isLinkDOM(next)) return next;
        }
        break;
      default:
    }
  }

  return getLinkDOMNode(elem.parentElement, direction);
}

/**
 * [getLinkDOMOnEdge: get link DOM node with given carpet of global selection and draft-js selection]
 * @param  {[type]} range            [global selection range]
 * @param  {[type]} startOffset      [selection startOffset]
 * @param  {[type]} endOffset        [selection endOffset]
 * @param  {[type]} start            [entity startOffset]
 * @param  {[type]} end              [entity endOffset]
 * @return {[HTMLElement]}           [link DOM node|null]
 */
export function getLinkDOMOnEdge(range, { startOffset, endOffset }, { start, end }) {
  let linkEl = getLinkDOMNode(range.startContainer);
  const editorDOM = document.querySelector('.DraftEditor-root');

  // when range is collapsed, global range will sometimes get a previous link node as startContainer.
  // if cursor is at the end of a range, check if nextElementSibling is a link. If so, use nextElementSibling.
  if (
    range.collapsed &&
    editorDOM.contains(range.startContainer) &&
    range.startContainer.nodeType === 3
  ) {
    const text = range.startContainer.nodeValue;
    const len = text.length;
    if (range.startOffset === len) {
      const el = getLinkDOMNode(range.startContainer);
      if (el && isLinkDOM(el.nextElementSibling)) {
        linkEl = el.nextElementSibling;
      }
    }
  }

  // when carpet is on the edge and range.startContainer is not a link
  // need to look back and forward to get link element
  if (!linkEl && startOffset === endOffset) {
    if (startOffset === end) {
      linkEl = getLinkDOMNode(range.startContainer, 'previous');
    } else if (startOffset === start) {
      linkEl = getLinkDOMNode(range.startContainer, 'next');
    }
  }

  return linkEl;
}

/**
 * [getLinkEntityRange: get link entity with given contentState and offset]
 * @param  {[contentState]} contentState
 * @param  {[contentBlock]} contentBlock
 * @param  {[object]}       offset       [offer startOffset and endOffset with current draft-js election]
 * @param  {[function]}     [cb=noop]    [execute with entity ranges]
 */
export function getLinkEntityRange(contentState, contentBlock, cb = noop) {
  const ranges = [];
  contentBlock.findEntityRanges(
    character => {
      const entityKey = character.getEntity();
      return entityKey !== null && isLinkEntity(contentState.getEntity(entityKey));
    },
    (start, end) => {
      ranges.push({ start, end });
    }
  );
  ranges.forEach((range, i, ranges) => cb(range, i, ranges));
}

/*
 * show linkModifierTool
 */
function getLinkEntityRangeWithOffset(contentState, contentBlock, offset, url, store) {
  const { startOffset } = offset;
  getLinkEntityRange(contentState, contentBlock, (entityRange, index, ranges) => {
    const { start, end } = entityRange;
    if (start <= startOffset && startOffset <= end) {
      if (omitConnectedEntity(offset, entityRange, index, ranges)) {
        return;
      }

      var s = window.getSelection();
      if (s.rangeCount > 0) {
        var r = s.getRangeAt(0);
        const linkEl = getLinkDOMOnEdge(r, offset, entityRange);
        if (linkEl) {
          const { startOffset, endOffset } = offset;
          // keep this order!
          store.updateItem('range', {
            range: r,
            container: linkEl
          });
          store.updateItem('entity', { range: entityRange });
          store.updateItem('selectionRect', linkEl.getBoundingClientRect());
          store.updateItem('selectedTextNodes', [linkEl]);
          store.updateItem('selection', { startOffset, endOffset });
          store.updateItem('visible', true);
          store.updateItem('url', url);
          s.removeAllRanges();
        }
      }
    }
  });
}
export function showLinkModifierTool(editorState, store) {
  const selection = editorState.getSelection();
  const contentState = editorState.getCurrentContent();
  const startOffset = selection.getStartOffset();
  const endOffset = selection.getEndOffset();
  const offset = { startOffset, endOffset };

  if (!selection.isCollapsed()) {
    const startKey = selection.getStartKey();
    const contentBlock = contentState.getBlockForKey(startKey);
    const entityKey = contentBlock.getEntityAt(startOffset);

    // TODO
    // if endOffset has no entity, extend selection with currentSelection and the link
    if (entityKey) {
      const url = getLinkEntityURL(contentState, entityKey);
      if (url) {
        getLinkEntityRangeWithOffset(contentState, contentBlock, offset, url, store);
      }
    } else {
      var s = window.getSelection();
      if (s.rangeCount > 0) {
        var r = s.getRangeAt(0);
        if (r.startContainer && document.querySelector('.DraftEditor-root').contains(r.startContainer)) {
          // keep this order!
          store.updateItem('range', {
            range: r,
            container: r.startContainer.parentElement
          });
          store.updateItem('entity', {});
          store.updateItem('selectionRect', getVisibleSelectionRect(window));
          store.updateItem('selectedTextNodes', getSelectedTextNodes());
          store.updateItem('selection', { startOffset, endOffset });
          store.updateItem('visible', true);
          store.updateItem('url', '');
        }
      }
    }
  } else {
    // if selection is collapsed, use focusKey instead of anchorKey or startKey
    // if focus character has an link entity, then select this piece of characters
    const focusKey = selection.getFocusKey();
    const contentBlock = contentState.getBlockForKey(focusKey);

    // 优先取当前entity的offset，如果没有，则减少一个offset取前一个character所属的entity
    let entityKey = contentBlock.getEntityAt(startOffset);
    if (entityKey === null) entityKey = contentBlock.getEntityAt(startOffset - 1);
    if (entityKey) {
      const url = getLinkEntityURL(contentState, entityKey);
      if (url) {
        getLinkEntityRangeWithOffset(contentState, contentBlock, offset, url, store);
      }
    }
  }
}
