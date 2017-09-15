import { defaultInlineStyleMap } from '../editorUtils/inlineEnhance';
import * as EntityType from '../constants/entity';

const ALIGNMENT = {
  default: {},
  center: {
    margin: '0 auto'
  },
  right: {
    marginLeft: 'auto'
  }
}

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
    case EntityType.IMAGE:
      const { src, alignment = 'default' , width = 100 } = data;
      return {
        element: 'img',
        attributes: {
          src: data.src
        },
        style: {
          width: `${width}%`,
          ...ALIGNMENT[alignment]
        }
      }
    default:
  }
};

export default {
  inlineStyles,
  entityStyleFn
};
