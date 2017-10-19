import * as BlockType from '../../constants/blockType';
import util from '../../utils/util';

const noop = () => {};

export const isLinkDOM = elem => elem && elem.dataset && elem.dataset.linkBlock;
export const isLinkEntity = entity => entity.getType() === BlockType.LINK;

// TODO
// update position onResize
export const computePopoverPosition = (selectionRect, el, baseRect = {}) => {
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
  if (x + popoverWidth > bodyRect.width) {
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
};

export const getLinkEntityURL = (contentState, entityKey) => {
  let url = '';
  const entity = contentState.getEntity(entityKey);
  if (isLinkEntity(entity)) {
    url = entity.getData().url;
  }
  return url;
};

export const getLinkDOMNode = (elem, direction = '') => {
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
};

/**
 * [getLinkDOMOnEdge: get link DOM node with given carpet of draft-js selection]
 * @param  {[type]} range            [draft-js election range]
 * @param  {[type]} startOffset      [selection startOffset]
 * @param  {[type]} endOffset        [selection endOffset]
 * @param  {[type]} start            [entity startOffset]
 * @param  {[type]} end              [entity endOffset]
 * @return {[HTMLElement]}           [link DOM node|null]
 */
export const getLinkDOMOnEdge = (range, { startOffset, endOffset }, { start, end }) => {
  let linkEl = getLinkDOMNode(range.startContainer);

  // get next element on right edge
  if (linkEl && startOffset === endOffset && startOffset === end) {
    linkEl = isLinkDOM(linkEl.nextElementSibling) ? linkEl.nextElementSibling : linkEl;
  }

  // when carpet is on the edge and range.startContainer is not a link
  // need to look back and forward to get link element
  if (!linkEl) {
    if (startOffset === endOffset && startOffset === end) {
      linkEl = getLinkDOMNode(range.startContainer, 'previous');
    } else if (startOffset === endOffset && startOffset === start) {
      linkEl = getLinkDOMNode(range.startContainer, 'next');
    }
  }

  return linkEl;
};

/**
 * [getLinkEntityRange: get link entity with given contentState and offset]
 * @param  {[contentState]} contentState
 * @param  {[contentBlock]} contentBlock
 * @param  {[object]}       offset       [offer startOffset and endOffset with current draft-js election]
 * @param  {[function]}     [cb=noop]    [execute with entity range start and end]
 */
export const getLinkEntityRange = (contentState, contentBlock, offset, cb = noop) => {
  const { startOffset } = offset;
  contentBlock.findEntityRanges(
    character => {
      const entityKey = character.getEntity();
      return entityKey !== null && isLinkEntity(contentState.getEntity(entityKey))
    },
    (start, end) => {
      if (start <= startOffset && startOffset <= end) {
        cb(start, end);
      }
    }
  );
};
