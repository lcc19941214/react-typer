import { stateToHTML } from 'draft-js-export-html';
import defaultInlineStyleMap, {
  COLORS,
  FONT_SIZES,
  defaultStyleRules
} from '../editorUtils/inlineStyles';
import util from '../editorUtils/util';
import { INITIAL_UNSTYLED } from '../editorUtils/blockStyleFn';
import * as EntityType from '../constants/entity';

const IMAGE_ALIGNMENT = {
  default: '',
  center: 'margin: 0 auto;',
  right: 'float: right;',
  left: 'float: left;'
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
  'LABEL-HIGHLIGHT': {
    style: {
      ...defaultInlineStyleMap.LABEL,
      ...defaultInlineStyleMap['LABEL-HIGHLIGHT']
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
      case EntityType.IMAGE:
        const { src, alignment = 'default', uid } = data;
        const imageElem = !uid
          ? document.querySelector(`img[src="${src}"]`)
          : document.querySelector(`img[data-image-uid="${uid}"]`);
        const width = imageElem.clientWidth;
        return `<div><img src="${src}" style="${IMAGE_ALIGNMENT[
          alignment
        ]} display: block;" width="${width}px"/></div>`;
      default:
    }
  }
};

export const blockStyleFn = contentBlock => {
  if (contentBlock.getType() === EntityType.UNSTYLED) {
    return {
      style: INITIAL_UNSTYLED
    };
  }
};

export const entityStyleFn = entity => {
  const entityType = entity.get('type');
  const data = entity.getData();
  switch (entityType) {
    case EntityType.LABEL_BLOCK:
      const { highlight } = data;
      return {
        element: 'span',
        style: highlight
          ? inlineStyles['LABEL-HIGHLIGHT'].style
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
      rules.push(`${util.transformUpperWithHyphen(prop)}: ${styles[prop]}`);
    });
  });
  return `<div style="${rules.join('; ')}">${html}</div>`;
};

export default (contentState, options) => {
  const html = stateToHTML(contentState, options);
  return htmlWrapper(html);
};
