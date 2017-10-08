import { stateToHTML } from 'draft-js-export-html';
import defaultInlineStyleMap, {
  COLORS,
  FONT_SIZES,
  defaultStyleRules
} from '../utils/inlineStyles';
import chore from '../utils/chore';
import { INITIAL_UNSTYLED } from '../utils/blockStyleFn';
import * as BlockType from '../constants/blockType';

const IMAGE_ALIGNMENT = {
  default: '',
  center: 'text-align: center',
  right: 'text-align: right;',
  left: 'text-align: left;'
};

const COLORS_FOR_HTML = {};
const FONT_SIZES_FOR_HTML = {};
[
  {
    from: COLORS,
    to: COLORS_FOR_HTML
  },
  {
    from: FONT_SIZES,
    to: FONT_SIZES_FOR_HTML
  }
].forEach(({ from, to }) => {
  Object.keys(from).forEach(key => {
    to[key] = { style: from[key] };
  });
});

export const inlineStyles = {
  ITALIC: {
    element: 'i'
  },
  LABEL: {
    style: defaultInlineStyleMap.LABEL
  },
  LABEL_HIGHLIGHT: {
    style: {
      ...defaultInlineStyleMap.LABEL,
      ...defaultInlineStyleMap['LABEL_HIGHLIGHT']
    }
  },
  ...COLORS_FOR_HTML,
  ...FONT_SIZES_FOR_HTML
};

// already injected contentState from using
export const blockRenderers = {
  atomic: (contentState, contentBlock) => {
    const entityKey = contentBlock.getEntityAt(0);
    if (!entityKey) return '<br />';
    const entity = contentState.getEntity(entityKey);
    const entityType = entity.get('type');
    const data = entity.get('data');
    switch (entityType) {
      case BlockType.IMAGE:
        const { src, alignment = 'default', uid } = data;
        const imageElem = !uid
          ? document.querySelector(`img[src="${src}"]`)
          : document.querySelector(`img[data-image-uid="${uid}"]`);
        const width = imageElem.clientWidth;
        return `<div style="${IMAGE_ALIGNMENT[alignment]}">
          <img src="${src}" style="width: ${width}px" width="${width}"/>
        </div>`;
      default:
    }
  }
};

export const blockStyleFn = contentBlock => {
  if (contentBlock.getType() === BlockType.UNSTYLED) {
    return {
      style: INITIAL_UNSTYLED
    };
  }
};

export const entityStyleFn = entity => {
  const entityType = entity.get('type');
  const data = entity.getData();
  switch (entityType) {
    case BlockType.LABEL_BLOCK:
      const { highlight } = data;
      return {
        element: 'span',
        style: highlight
          ? inlineStyles['LABEL_HIGHLIGHT'].style
          : inlineStyles.LABEL.style
      };
    default:
  }
};

export const exportToHTMLOptions = {
  inlineStyles,
  blockRenderers,
  blockStyleFn,
  entityStyleFn
};

export const htmlWrapper = (html = '') => {
  const rules = [];
  [defaultStyleRules].forEach(styles => {
    Object.keys(styles).forEach(prop => {
      rules.push(`${chore.transformUpperWithHyphen(prop)}: ${styles[prop]}`);
    });
  });
  return `<div style="${rules.join('; ')}">${html}</div>`;
};

export default (contentState, options) => {
  const html = stateToHTML(contentState, options);
  return htmlWrapper(html);
};
