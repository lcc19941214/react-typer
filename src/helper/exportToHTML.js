import { defaultInlineStyleMap } from '../editorUtils/inlineEnhance';
import * as entityType from '../constants/entity';

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
  if (entityType === 'labelBlock') {
    const { highlight } = entity.getData();
    return {
      element: 'mark',
      style: highlight ? inlineStyles['LABEL-HIGHLIGHT'].style : inlineStyles.LABEL.style
    };
  }
};

export default {
  inlineStyles,
  entityStyleFn
};
