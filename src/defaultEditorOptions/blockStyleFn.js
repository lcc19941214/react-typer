import { DEFAULT_COLOR, DEFAULT_FONT_SIZE } from './inlineStyles';
import * as BlockType from '../constants/blockType';

export const FIGURE = {
  margin: '1em 0'
};

export const TEXT_ALIGNS = {
  left: {
    textAlign: 'left'
  },
  center: {
    textAlign: 'center'
  },
  right: {
    textAlign: 'right'
  },
  justify: {
    textAlign: 'justify'
  }
};
export const DEFAULT_TEXT_ALIGN = TEXT_ALIGNS.left;

export const INITIAL_ATOMIC = {
  ...FIGURE
};

export const INITIAL_UNSTYLED = {
  ...DEFAULT_COLOR,
  ...DEFAULT_FONT_SIZE,
  ...DEFAULT_TEXT_ALIGN,
  margin: '0'
};

export default contentBlock => {
  const type = contentBlock.getType();
  let cls = '';
  switch (type) {
    case BlockType.UNSTYLED:
      cls = 'RichEditor-style__initial-unstyled';
      break;
    case BlockType.ATOMIC:
      cls = 'RichEditor-style__initial-atomic';
      break;
    default:
  }

  if (Object.keys(BlockType.BASIC_BLOCKS).some(key => BlockType.BASIC_BLOCKS[key] === type)) {
    const textAlign = contentBlock.getData().get('textAlign') || 'left';
    cls += ` RichEditor-style__text-align-${textAlign}`;
  }

  return cls;
};
