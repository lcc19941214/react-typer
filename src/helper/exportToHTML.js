import { defaultInlineStyleMap, COLORS } from '../editorUtils/inlineEnhance';
import * as EntityType from '../constants/entity';

const IMAGE_ALIGNMENT = {
  default: '',
  center: 'margin: 0 auto;',
  right: 'float: right;',
  left: 'float: left;'
};

const COLORS_FOR_HTML = {};
Object.keys(COLORS).forEach(color => {
  COLORS_FOR_HTML[color] = { style: COLORS[color] };
});

export const inlineStyles = {
  ITALIC: {
    element: 'i'
  },
  LABEL: {
    element: 'mark',
    style: defaultInlineStyleMap.LABEL
  },
  'LABEL-HIGHLIGHT': {
    element: 'mark',
    style: Object.assign(
      {},
      defaultInlineStyleMap.LABEL,
      defaultInlineStyleMap['LABEL-HIGHLIGHT']
    )
  },
  ...COLORS_FOR_HTML
};

// inject contentState from using
export const blockRenderers = {
  atomic: (contentState, contentBlock) => {
    const entityKey = contentBlock.getEntityAt(0);
    const entity = contentState.getEntity(entityKey);
    const entityType = entity.get('type');
    const data = entity.get('data');
    switch (entityType) {
      case EntityType.IMAGE:
        const { src, alignment = 'default', width = 'auto' } = data;
        return `<div><img src='${src}' style='${IMAGE_ALIGNMENT[alignment]}' width='${width}'/></div>`;
      default:
    }
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

export default {
  inlineStyles,
  entityStyleFn,
  blockRenderers
};
